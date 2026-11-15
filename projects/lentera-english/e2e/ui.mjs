// UI/UX checks from the Rilis 6 audit (ui-ux-pro-max guidance): no sideways
// scrolling and touch targets of at least 44 px on a 320 px phone, also with
// the largest text size; the first-open welcome; the text size and vibration
// settings; vibration on answers; and the "Bercabang" label for guests.
//
// Needs a server with the embedded backend and the admin address set
// (see e2e/admin-app.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { BASE, answerCurrent, check, chromium, fetchPack } from './lib.mjs';

const SHOTS = process.env.E2E_SHOTS ?? path.join(import.meta.dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const ADMIN = process.env.E2E_ADMIN_EMAIL ?? 'admin@lentera.test';
const PASSWORD = 'rahasia-12345';
const post = async (url, body) => {
  const res = await fetch(BASE + url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { status: res.status, data: await res.json().catch(() => ({})) };
};
let r = await post('/api/dev-auth', { action: 'signin', email: ADMIN, password: PASSWORD });
if (r.status !== 200) r = await post('/api/dev-auth', { action: 'signup', email: ADMIN, password: PASSWORD, name: 'Admin Uji' });
const session = r.data;

const browser = await chromium.launch();
const issues = [];
async function phone({ width = 320, scale = 'normal', signedIn = true, vibrate = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 640 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  await ctx.addInitScript(([s, f, v]) => {
    if (s && !localStorage.getItem('lentera.session')) localStorage.setItem('lentera.session', JSON.stringify(s));
    if (!sessionStorage.getItem('ui-e2e')) { localStorage.setItem('lentera.fontScale', f); sessionStorage.setItem('ui-e2e', '1'); }
    localStorage.setItem('lentera.story.sound', '0');
    window.__buzz = [];
    if (v) navigator.vibrate = (p) => { window.__buzz.push(p); return true; };
    else try { delete Navigator.prototype.vibrate; } catch { /* not configurable */ }
  }, [signedIn ? session : null, scale, vibrate]);
  const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error' && !/status of 40[0-9]/.test(m.text())) issues.push(`${new URL(p.url()).pathname}: ${m.text().slice(0, 160)}`); });
  p.on('pageerror', (e) => issues.push(`pageerror: ${e.message}`));
  return { ctx, p };
}

/** Width overflow and every control smaller than 44 px (inline text links are exempt, WCAG 2.5.8). */
const measure = (p) => p.evaluate(() => {
  const over = document.scrollingElement.scrollWidth - window.innerWidth;
  const small = [];
  for (const el of document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, [role=tab], [role=radio]')) {
    const box = el.getBoundingClientRect();
    if (!box.width || !box.height || el.closest('[hidden], .sr-only, label')) continue;
    if (el.tagName === 'A' && getComputedStyle(el).display === 'inline') continue;
    // The hit area includes a ::before that extends it (header chips).
    const before = getComputedStyle(el, '::before');
    const extra = before.content !== 'none' && before.position === 'absolute' ? -2 * parseFloat(before.top || '0') : 0;
    if (Math.min(box.width, box.height + Math.max(0, extra)) < 44) small.push(`${Math.round(box.width)}x${Math.round(box.height)} ${(el.getAttribute('aria-label') || el.textContent || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 30)}`);
  }
  return { over, small };
});
const PAGES = ['/app', '/app/path', '/app/lesson?id=a1-to-be', '/app/practice', '/app/review', '/app/stories', '/app/stories?id=story-first-day', '/app/listening', '/app/listening?id=listen-a1-intro', '/app/conversations', '/app/homework', '/app/exams', '/app/vocabulary', '/app/plan', '/app/shadowing', '/app/leaderboard', '/app/profile', '/app/settings', '/app/subscription', '/app/placement', '/'];

// ───────────── 1. 320 px phone, normal and largest text ─────────────
for (const scale of ['normal', 'xlarge']) {
  const { ctx, p } = await phone({ scale });
  const bad = [];
  for (const url of PAGES) {
    try {
      await p.goto(BASE + url, { waitUntil: 'load' });
      await p.locator('main').first().waitFor({ timeout: 30000 });
      await p.waitForTimeout(1500);
      const m = await measure(p);
      if (m.over > 0 || m.small.length) bad.push(`${url}: geser ${m.over}px, kecil ${m.small.length} (${m.small.slice(0, 3).join(' | ')})`);
    } catch (e) {
      bad.push(`${url}: ${String(e.message).split('\n')[0].slice(0, 100)}`);
    }
  }
  check(`layar 320 px, huruf ${scale === 'normal' ? 'normal' : 'sangat besar'}: ${PAGES.length} halaman tanpa geser ke samping, semua kontrol minimal 44 px`, bad.length === 0, bad.slice(0, 4).join(' || '));
  if (scale === 'xlarge') {
    await p.goto(`${BASE}/app/lesson?id=a1-to-be`);
    await p.locator('main').first().waitFor({ timeout: 30000 });
    await p.waitForTimeout(1000);
    await p.screenshot({ path: path.join(SHOTS, 'ui-320-huruf-sangat-besar.png'), fullPage: true });
    const size = await p.evaluate(() => getComputedStyle(document.documentElement).fontSize);
    check('huruf "Sangat besar" diterapkan sebelum halaman tampil (20 px dasar)', size === '20px', size);
  }
  await ctx.close();
}

// ───────────── 1b. A busy admin: long numbers in the header must not widen the page ─────────────
for (const width of [320, 390]) {
  const { ctx, p } = await phone({ width });
  try {
    await p.goto(`${BASE}/app`);
    await p.locator('main').first().waitFor({ timeout: 30000 });
    await p.evaluate((uid) => {
      const k = `lentera.state.${uid}`;
      const st = JSON.parse(localStorage.getItem(k));
      st.xp = 123456;
      st.streak.current = 365;
      st.updatedAt = Date.now();
      localStorage.setItem(k, JSON.stringify(st));
    }, session.userId);
    const bad = [];
    for (const url of ['/app', '/app/homework', '/app/homework?id=hw.b2-c1.write', '/app/settings']) {
      await p.goto(BASE + url);
      await p.locator('main').first().waitFor({ timeout: 30000 });
      await p.waitForTimeout(1200);
      const m = await measure(p);
      if (m.over > 0 || m.small.length) bad.push(`${url}: geser ${m.over}px ${m.small.slice(0, 3).join(' | ')}`);
    }
    const names = await p.getByRole('link', { name: 'Premium' }).count() > 0 && await p.getByRole('link', { name: /Lentera English/ }).count() > 0;
    check(`header ${width} px dengan admin, XP 123456 dan beruntun 365: tidak melebar, nama Premium dan logo tetap terbaca pembaca layar`, bad.length === 0 && names, bad.join(' || '));
    if (width === 320) await p.screenshot({ path: path.join(SHOTS, 'ui-320-header-admin.png') });
  } catch (e) {
    check(`header ${width} px: macet`, false, String(e.message).split('\n')[0].slice(0, 200));
  }
  await ctx.close();
}

// ───────────── 2. First open as a new guest ─────────────
{
  const { ctx, p } = await phone({ width: 360, signedIn: false });
  await p.goto(`${BASE}/app`);
  const welcome = p.getByRole('heading', { name: 'Selamat datang di Lentera English!' });
  await welcome.waitFor({ timeout: 45000 });
  check('pertama kali dibuka: sambutan dengan 3 langkah', (await p.locator('section[aria-labelledby="welcome-title"] ol > li').count()) === 3);
  check('pertama kali dibuka: tes penempatan atau lewati (mulai dari A1), dan tautan Masuk', await p.getByRole('link', { name: /Ikuti tes penempatan/ }).count() === 1 && await p.getByRole('link', { name: 'Lewati, mulai dari A1' }).count() === 1 && await p.getByRole('link', { name: 'Masuk', exact: true }).count() >= 1);
  check('pertama kali dibuka: label XP misi yang belum selesai bukan tombol', await p.getByRole('button', { name: /^\+\d+ XP$/ }).count() === 0 && await p.getByText(/^\+\d+ XP$/).count() > 0);
  await p.screenshot({ path: path.join(SHOTS, 'ui-sambutan.png'), fullPage: true });
  await p.getByRole('link', { name: 'Lewati, mulai dari A1' }).click();
  await p.waitForURL(/\/app\/lesson\?id=/, { timeout: 15000 });
  check('"Lewati" membuka pelajaran pertama A1', /id=a1-/.test(p.url()), p.url());

  // Guests see branching stories labelled, without their content.
  await p.goto(`${BASE}/app/stories`);
  await p.getByText('Wawancara di Kafe').first().waitFor({ timeout: 30000 });
  const card = p.locator('li, a').filter({ hasText: 'Wawancara di Kafe' }).first();
  check('tamu: cerita bercabang terkunci tetap berlabel "Bercabang"', await card.getByText('Bercabang', { exact: true }).count() === 1);
  const guestPack = await fetchPack(p);
  const st = guestPack.stories.find((s) => s.id === 'story-cafe-interview');
  check('tamu: hanya jumlah keputusan yang dikirim, tanpa isi cabang', st?.locked && !st.branch && st.decisions >= 3 && !st.scenes.length, JSON.stringify({ locked: st?.locked, decisions: st?.decisions, branch: !!st?.branch }));
  await p.goto(`${BASE}/app/stories?id=story-cafe-interview`);
  check('tamu: halaman cerita terkunci menyebut jumlah keputusan', await p.getByText(/lewat \d+ keputusan/).first().waitFor({ timeout: 15000 }).then(() => true, () => false));
  await ctx.close();
}

// ───────────── 3. Settings: text size and vibration ─────────────
{
  const { ctx, p } = await phone({ width: 320, vibrate: true, signedIn: false });
  await p.goto(`${BASE}/app/settings`);
  await p.getByRole('radio', { name: 'Besar', exact: true }).click({ timeout: 45000 });
  const big = await p.evaluate(() => [getComputedStyle(document.documentElement).fontSize, localStorage.getItem('lentera.fontScale')]);
  check('ukuran huruf "Besar": langsung berlaku dan tersimpan di perangkat', big[0] === '18px' && big[1] === 'large', big.join(' '));
  await p.reload();
  await p.getByRole('radio', { name: 'Besar', exact: true }).waitFor({ timeout: 30000 });
  check('ukuran huruf tetap setelah dimuat ulang', (await p.evaluate(() => getComputedStyle(document.documentElement).fontSize)) === '18px' && (await p.getByRole('radio', { name: 'Besar', exact: true }).getAttribute('aria-checked')) === 'true');
  await p.getByRole('radio', { name: 'Normal', exact: true }).click();
  check('getaran: pilihan Nyala/Mati tampil di HP yang bisa bergetar', await p.getByRole('radio', { name: 'Mati', exact: true }).count() === 1);

  // Vibration on answers: a tap when right, a double tap when wrong.
  await p.goto(`${BASE}/app`);
  const pack = await fetchPack(p);
  const answer = async (correct) => {
    await answerCurrent(p, pack, correct);
    await p.getByRole('button', { name: 'Periksa', exact: true }).click();
    await p.getByText(correct ? 'Benar!' : 'Belum tepat', { exact: true }).waitFor({ timeout: 10000 });
    await p.getByRole('button', { name: 'Lanjut', exact: true }).click();
  };
  try {
    await p.getByRole('link', { name: 'Lewati, mulai dari A1' }).click({ timeout: 45000 });
    for (const name of ['Mulai belajar', 'Lihat contoh benar dan salah', 'Lanjut ke latihan', 'Mulai latihan']) await p.getByRole('button', { name, exact: true }).click({ timeout: 45000 });
    await p.getByRole('button', { name: 'Periksa', exact: true }).waitFor({ timeout: 15000 });
    const player = await measure(p);
    check('pemutar pelajaran di layar 320 px: tanpa geser ke samping, kontrol minimal 44 px', player.over === 0 && player.small.length === 0, `${player.over}px ${player.small.slice(0, 4).join(' | ')}`);
    await p.screenshot({ path: path.join(SHOTS, 'ui-320-pemutar.png'), fullPage: true });
    await answer(true);
    await answer(false);
    const buzz = await p.evaluate(() => window.__buzz);
    check('getaran: singkat saat benar, dua kali saat belum tepat', buzz.length === 2 && typeof buzz[0] === 'number' && Array.isArray(buzz[1]), JSON.stringify(buzz));
    await p.goto(`${BASE}/app/settings`);
    await p.getByRole('radiogroup', { name: /Getaran saat menjawab/ }).getByRole('radio', { name: 'Mati', exact: true }).click({ timeout: 30000 });
    check('getaran bisa dimatikan', (await p.evaluate(() => localStorage.getItem('lentera.haptics'))) === '0');
  } catch (e) {
    await p.screenshot({ path: path.join(SHOTS, 'ui-gagal-getaran.png'), fullPage: true }).catch(() => {});
    check('getaran: macet', false, String(e.message).split('\n')[0].slice(0, 200));
  }
  await ctx.close();
}
{
  const { ctx, p } = await phone({ width: 390, vibrate: false });
  await p.goto(`${BASE}/app/settings`);
  check('getaran: perangkat tanpa getaran (iPhone, komputer) mendapat penjelasan, bukan tombol', await p.getByText(/tidak mendukung getaran/).first().waitFor({ timeout: 45000 }).then(() => true, () => false) && await p.getByRole('radiogroup', { name: /Getaran saat menjawab/ }).count() === 0);
  await ctx.close();
}

// ───────────── 3b. Landing page: the promo video and its chapters ─────────────
{
  const { ctx, p } = await phone({ width: 320, signedIn: false });
  const videoHits = [];
  p.on('request', (r) => { if (r.url().includes('/promo/lentera-promo.mp4')) videoHits.push(r.url()); });
  await p.goto(`${BASE}/`);
  const video = p.locator('#video video');
  await video.waitFor({ timeout: 45000 });
  await p.waitForTimeout(1500);
  const attrs = await video.evaluate((v) => ({ preload: v.getAttribute('preload'), poster: v.getAttribute('poster'), src: v.querySelector('source')?.getAttribute('src') }));
  check('halaman depan: video promosi dengan sampul, dan videonya belum diunduh sebelum diputar', attrs.preload === 'none' && attrs.poster === '/promo/lentera-promo-poster.jpg' && attrs.src === '/promo/lentera-promo.mp4' && videoHits.length === 0, JSON.stringify({ attrs, videoHits }));
  const poster = await fetch(`${BASE}/promo/lentera-promo-poster.jpg`);
  const mp4 = await fetch(`${BASE}/promo/lentera-promo.mp4`, { headers: { Range: 'bytes=0-99' } });
  check('berkas sampul dan video tersedia (video bisa diputar sebagian/di-seek)', poster.status === 200 && (mp4.status === 206 || mp4.status === 200) && /video\/mp4/.test(mp4.headers.get('content-type') ?? ''), `${poster.status} ${mp4.status} ${mp4.headers.get('content-type')}`);
  const chapters = p.getByRole('list', { name: 'Bab video promosi' }).getByRole('button');
  check('daftar isi video: 15 fitur dengan waktunya, bisa diketuk', (await chapters.count()) === 15 && (await chapters.first().innerText()).includes('0:03'));
  const m = await measure(p);
  check('halaman depan dengan video di layar 320 px: tanpa geser ke samping, kontrol minimal 44 px', m.over === 0 && m.small.length === 0, `${m.over}px ${m.small.slice(0, 3).join(' | ')}`);
  await chapters.nth(4).click();
  await p.waitForTimeout(1500);
  const after = await video.evaluate((v) => ({ controls: v.controls, src: v.currentSrc }));
  check('mengetuk bab menyalakan video (baru saat itu videonya diminta)', after.controls && videoHits.length > 0 && (await p.getByRole('button', { name: /^Putar video promosi/ }).count()) === 0, JSON.stringify({ after, hits: videoHits.length }));
  await p.screenshot({ path: path.join(SHOTS, 'ui-halaman-depan-video.png'), fullPage: false });
  await ctx.close();
}

// ───────────── 4. Profile: avatar or name alone can be saved, and reach the account ─────────────
{
  const email = `profil${Date.now()}@lentera.test`;
  const acc = (await post('/api/dev-auth', { action: 'signup', email, password: PASSWORD, name: 'Siswa Profil' })).data;
  const me = async () => (await (await fetch(`${BASE}/api/me`, { headers: { Authorization: `Bearer ${acc.token}` } })).json()).user.profile;
  const ctx = await browser.newContext({ viewport: { width: 360, height: 760 }, isMobile: true, hasTouch: true });
  await ctx.addInitScript((sess) => { if (!localStorage.getItem('lentera.session')) localStorage.setItem('lentera.session', JSON.stringify(sess)); }, acc);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => issues.push(`pageerror: ${e.message}`));
  try {
    await p.goto(`${BASE}/app/profile`);
    const save = p.getByRole('button', { name: 'Simpan perubahan' });
    await save.waitFor({ timeout: 45000 });
    check('profil: 8 avatar karakter bisa dipilih', (await p.getByRole('radiogroup', { name: 'Avatar' }).getByRole('radio').count()) === 8);
    check('profil: tanpa perubahan, tombol Simpan mati', !(await save.isEnabled()));
    await p.getByRole('radio', { name: /^Momo, kelinci merah muda/ }).click();
    check('profil: memilih avatar saja sudah mengaktifkan Simpan (bug lama: harus ganti nama dulu)', await save.isEnabled());
    await p.getByRole('button', { name: 'Batal' }).click();
    check('profil: Batal mengembalikan pilihan semula', !(await save.isEnabled()) && (await p.getByRole('radio', { name: /^Pijar/ }).getAttribute('aria-checked')) === 'true');
    await p.getByRole('radio', { name: /^Momo, kelinci merah muda/ }).click();
    await save.click();
    await p.getByText('Profil tersimpan.', { exact: true }).waitFor({ timeout: 10000 });
    await p.waitForFunction(() => true);
    let server = await me();
    for (let i = 0; i < 20 && server.avatar !== 3; i++) { await p.waitForTimeout(300); server = await me(); }
    check('profil: avatar tersimpan, tampil di kartu profil, dan sampai ke akun (papan peringkat)', server.avatar === 3 && (await p.locator('svg[data-avatar="momo"][role="img"]').count()) === 1, JSON.stringify(server));
    const nameInput = p.getByLabel('Nama tampilan');
    await nameInput.fill('   ');
    check('profil: nama kosong ditolak dengan pesan', (await p.getByText('Nama tampilan tidak boleh kosong.').count()) === 1 && !(await save.isEnabled()));
    await nameInput.fill('Rina Baru');
    await save.click();
    await p.getByText('Profil tersimpan.', { exact: true }).waitFor({ timeout: 10000 });
    for (let i = 0; i < 20 && server.display_name !== 'Rina Baru'; i++) { await p.waitForTimeout(300); server = await me(); }
    await p.reload();
    await p.getByRole('heading', { name: 'Rina Baru' }).waitFor({ timeout: 30000 });
    check('profil: nama saja juga tersimpan; setelah dimuat ulang nama dan avatar tetap', server.display_name === 'Rina Baru' && (await p.locator('svg[data-avatar="momo"][role="img"]').count()) === 1 && (await p.getByRole('radio', { name: /^Momo/ }).getAttribute('aria-checked')) === 'true');
    await p.screenshot({ path: path.join(SHOTS, 'ui-profil-avatar.png'), fullPage: true });
  } catch (e) {
    await p.screenshot({ path: path.join(SHOTS, 'ui-gagal-profil.png'), fullPage: true }).catch(() => {});
    check('profil: macet', false, String(e.message).split('\n')[0].slice(0, 200));
  }
  await ctx.close();
}

check('tanpa error di konsol', issues.length === 0, issues.slice(0, 3).join(' | '));
await browser.close();
console.log(process.exitCode ? '\nADA YANG GAGAL' : '\nSEMUA LOLOS');
