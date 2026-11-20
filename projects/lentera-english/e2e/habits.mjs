// End-to-end check of Rilis 8 "Kebiasaan Belajar": daily reminder settings,
// Liga Rank, friends by invite link, friend challenges, shadowing with
// Chromium's fake microphone, and small-phone layouts of the new screens.
//
// Needs a server with the embedded backend (see e2e/admin-app.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { BASE, check, chromium } from './lib.mjs';

const SHOTS = process.env.E2E_SHOTS ?? path.join(import.meta.dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const stamp = Date.now();
const PASSWORD = 'rahasia-12345';

const call = async (url, body, token, method) => {
  const res = await fetch(BASE + url, { method: method ?? (body === undefined ? 'GET' : 'POST'), headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: res.status, data: await res.json().catch(() => ({})) };
};
const account = async (email, name) => {
  const r = await call('/api/dev-auth', { action: 'signup', email, password: PASSWORD, name });
  if (r.status !== 200) throw new Error(`cannot sign up ${email}: ${JSON.stringify(r.data)}`);
  return r.data;
};
/** Server XP for an account, the way the app syncs it. */
const earn = (who, amount, tag) => call('/api/sync', { events: [{ id: `${tag}-${stamp}`, kind: 'xp', at: Date.now(), data: { amount, reason: 'lesson' } }], snapshot: null, updatedAt: 1 }, who.token);

const rina = await account(`rina${stamp}@lentera.test`, 'Rina Uji');
const dimas = await account(`dimas${stamp}@lentera.test`, 'Dimas Uji');
await earn(rina, 120, 'rina');
await earn(dimas, 60, 'dimas');

// ───────────── 1. APIs refuse guests and bad input ─────────────
check('API pengingat, liga, dan teman menolak tanpa login', (await call('/api/reminders')).status === 401 && (await call('/api/league')).status === 401 && (await call('/api/friends')).status === 401);
check('API pengingat menolak jam di luar 05–22', (await call('/api/reminders', { daily_hour: 3 }, rina.token)).status === 400);
const cron = await call('/api/cron/reminders');
check('tugas per jam juga menjalankan pengingat harian', cron.status === 200 && 'daily' in cron.data, JSON.stringify(cron.data));
check('kode teman yang salah ditolak dengan pesan jelas', (await call('/api/friends', { action: 'add', code: 'ZZZZZZ' }, rina.token)).data.code === 'code_not_found');

const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
const issues = [];
async function signedIn(who, viewport = { width: 390, height: 844 }) {
  const ctx = await browser.newContext({ viewport, isMobile: viewport.width < 600, hasTouch: viewport.width < 600, permissions: ['microphone', 'clipboard-read', 'clipboard-write'] });
  await ctx.addInitScript((s) => { if (s) localStorage.setItem('lentera.session', JSON.stringify(s)); }, who);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !/status of 40[0-9]/.test(m.text())) issues.push(`${new URL(page.url()).pathname}: ${m.text().slice(0, 200)}`); });
  page.on('pageerror', (e) => issues.push(`pageerror: ${e.message}`));
  return page;
}
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

// ───────────── 2. Daily reminder settings ─────────────
const r = await signedIn(rina);
try {
  await r.goto(`${BASE}/app/settings#pengingat`);
  const card = r.locator('#pengingat');
  await card.getByRole('heading', { name: 'Pengingat di HP' }).waitFor({ timeout: 30000 });
  const select = card.getByLabel(/Jam pengingat/);
  await select.waitFor();
  await r.waitForFunction(() => !document.querySelector('#pengingat select')?.disabled, null, { timeout: 15000 });
  check('kartu pengingat: jam dalam zona waktu HP (WIB/WITA/WIT)', /Jam pengingat \((WIB|WITA|WIT|UTC|.+)\)/.test(await card.innerText()));
  await select.selectOption('19');
  await card.getByText(/Pengingat harian diatur pukul 19\.00/).waitFor({ timeout: 15000 });
  const prefs = (await call('/api/reminders', undefined, rina.token)).data;
  check('memilih jam menyimpan pengingat harian di server', prefs.daily_hour === 19 && typeof prefs.time_zone === 'string', JSON.stringify(prefs));
  await card.getByRole('radio', { name: 'Mati' }).click();
  await card.getByText('Pengingat PR dimatikan.').waitFor({ timeout: 15000 });
  check('pengingat PR bisa dimatikan terpisah', (await call('/api/reminders', undefined, rina.token)).data.homework === false);
  check('tanpa HP terdaftar, kartu mengajak menyalakan (atau mengizinkan) notifikasi', await card.getByText(/belum ada HP yang menerima notifikasi|Notifikasi untuk Lentera diblokir/).waitFor({ timeout: 10000 }).then(() => true, () => false));
  check('pengaturan muat di layar 390 px', (await overflow(r)) <= 0);
  await r.screenshot({ path: path.join(SHOTS, 'habits-pengingat.png'), fullPage: true });
} catch (e) {
  await r.screenshot({ path: path.join(SHOTS, 'habits-gagal-pengingat.png'), fullPage: true }).catch(() => {});
  check('pengingat harian: macet', false, String(e.message).split('\n')[0].slice(0, 200));
}

// ───────────── 3. Liga Rank (migration 0022) ─────────────
try {
  await r.goto(`${BASE}/app/leaderboard`);
  await r.getByRole('heading', { name: /^Rank Lilin$/ }).waitFor({ timeout: 30000 });
  check('tab "Liga Rank" terpilih', await r.getByRole('link', { name: 'Liga Rank' }).getAttribute('aria-current') === 'page');
  const list = r.getByRole('list', { name: /Pemain Rank Lilin/ });
  const text = await list.innerText();
  check('liga rank: Rina dan Dimas di Rank Lilin, Rina di atas', text.indexOf('Rina Uji') >= 0 && text.indexOf('Dimas Uji') > text.indexOf('Rina Uji'), text.slice(0, 200));
  // 120 XP on one day: 120/250 x 70 + 7.5 = 41 points.
  check('liga rank: poin minggu ini (+41 dari 100) dan jarak ke Pelita', await r.getByText('+41 dari 100 poin minggu ini').isVisible() && await r.getByText(/459 poin lagi ke Rank Pelita/).isVisible() && await r.getByText(/Minggu berakhir dalam/).isVisible());
  check('liga rank: aturan poin (250 XP, 4 hari, −50 minggu kosong) tertulis', await r.getByText(/Poin penuh: 250 XP di 4 hari berbeda.*mengurangi 50 poin/).isVisible());
  const ladder = r.getByRole('list', { name: /Lima rank/ });
  check('liga rank: tangga lima rank Lilin sampai Mercusuar, Lilin ditandai', (await ladder.getByRole('listitem').count()) === 5 && /Lilin/.test(await ladder.locator('[aria-current="true"]').innerText()));
  check('liga rank: perkiraan ±1 tahun (Mercusuar minggu ke-50)', await r.getByText(/Mercusuar minggu ke-50/).isVisible());
  const anim = await r.evaluate(() => Object.fromEntries([1, 2, 3, 4, 5].map((n) => [n, getComputedStyle(document.querySelector(`[aria-label="Lima rank, dari Lilin sampai Mercusuar"] .rank-${n} .rk-flame`)).animationName])));
  check('api rank: Lilin diam, Pelita sampai Mercusuar beranimasi', anim[1] === 'none' && [2, 3, 4, 5].every((n) => anim[n] === 'rk-flicker'), JSON.stringify(anim));
  const fx = await r.evaluate(() => [3, 4, 5].map((n) => document.querySelectorAll(`[aria-label="Lima rank, dari Lilin sampai Mercusuar"] .rank-${n} .rk-ember`).length).concat(document.querySelectorAll('[aria-label="Lima rank, dari Lilin sampai Mercusuar"] .rank-5 .rk-rays').length));
  check('api rank makin megah: bara 2/4/6 (Obor/Lentera/Mercusuar) + sinar mercusuar', JSON.stringify(fx) === '[2,4,6,1]', JSON.stringify(fx));
  check('liga rank muat di layar 390 px', (await overflow(r)) <= 0);
  await r.screenshot({ path: path.join(SHOTS, 'habits-liga.png'), fullPage: true });
  await r.getByRole('link', { name: 'Semua' }).click();
  const all = r.getByRole('list', { name: '30 teratas minggu ini' });
  await all.waitFor({ timeout: 30000 });
  const rinaRow = all.getByRole('listitem').filter({ hasText: 'Rina Uji' });
  check('papan Semua: setiap pemain menampilkan rank (Rina: Rank Lilin)', /Rank Lilin/.test(await rinaRow.innerText()) && (await all.getByRole('listitem').count()) === (await all.getByText(/^Rank (Lilin|Pelita|Obor|Lentera|Mercusuar)$/).count()));
  await r.screenshot({ path: path.join(SHOTS, 'habits-semua.png'), fullPage: true });
} catch (e) {
  await r.screenshot({ path: path.join(SHOTS, 'habits-gagal-liga.png'), fullPage: true }).catch(() => {});
  check('liga rank: macet', false, String(e.message).split('\n')[0].slice(0, 200));
}

// ───────────── 4. Friends by invite link, then a challenge ─────────────
const d = await signedIn(dimas);
let rinaCode = '';
try {
  await r.goto(`${BASE}/app/leaderboard?tab=teman`);
  await r.getByRole('heading', { name: 'Kode temanmu' }).waitFor({ timeout: 30000 });
  rinaCode = (await r.locator('p.font-mono').innerText()).trim();
  check('teman: setiap akun punya kode 6 karakter', /^[A-HJ-NP-Z2-9]{6}$/.test(rinaCode), rinaCode);
  check('teman: tombol bagikan, salin, dan WhatsApp', await r.getByRole('button', { name: 'Bagikan undangan' }).isVisible() && await r.getByRole('link', { name: 'WhatsApp' }).getAttribute('href').then((h) => h.includes(encodeURIComponent(rinaCode))));

  await d.goto(`${BASE}/app/leaderboard?tab=teman&kode=${rinaCode}`);
  const input = d.getByLabel('Kode teman (6 karakter)');
  await input.waitFor({ timeout: 30000 });
  check('tautan undangan mengisi kode otomatis', (await input.inputValue()) === rinaCode);
  await d.getByRole('button', { name: 'Tambah teman' }).click();
  await d.getByText('Rina Uji sekarang temanmu.').waitFor({ timeout: 15000 });
  const friends = d.getByRole('list', { name: /Peringkat teman/ });
  check('daftar teman: diurutkan dari XP minggu ini', (await friends.innerText()).indexOf('Rina Uji') < (await friends.innerText()).indexOf('Dimas Uji'));

  // Dimas challenges Rina for 3 days.
  const row = friends.getByRole('listitem').filter({ hasText: 'Rina Uji' });
  await row.getByRole('button', { name: 'Tantang' }).click();
  await row.getByRole('button', { name: '3 hari' }).click();
  await d.getByText(/Tantangan dikirim ke Rina Uji/).waitFor({ timeout: 15000 });
  check('tantangan terkirim dan menunggu jawaban', await d.getByText('Menunggu jawaban Rina Uji').isVisible());
  check('teman muat di layar 390 px', (await overflow(d)) <= 0);

  // Rina accepts.
  await r.reload();
  await r.getByText('Dimas Uji menantangmu').waitFor({ timeout: 30000 });
  check('yang ditantang melihat pemberitahuan tantangan', await r.getByText('1 tantangan menunggu jawabanmu').isVisible());
  await r.getByRole('button', { name: 'Terima' }).click();
  await r.getByText(/Tantangan dimulai!/).waitFor({ timeout: 15000 });
  await r.waitForTimeout(1500);
  await earn(rina, 25, 'rina-duel');
  await r.reload();
  await r.getByText(/Berakhir dalam/).first().waitFor({ timeout: 30000 });
  const duel = await r.locator('main').innerText();
  check('tantangan berjalan: skor XP sejak diterima', /Kamu\s*25 XP/.test(duel) && /Dimas Uji\s*0 XP/.test(duel), duel.slice(duel.indexOf('Tantangan'), duel.indexOf('Tantangan') + 200));
  await r.screenshot({ path: path.join(SHOTS, 'habits-teman.png'), fullPage: true });
} catch (e) {
  await r.screenshot({ path: path.join(SHOTS, 'habits-gagal-teman-rina.png'), fullPage: true }).catch(() => {});
  await d.screenshot({ path: path.join(SHOTS, 'habits-gagal-teman-dimas.png'), fullPage: true }).catch(() => {});
  check('teman dan tantangan: macet', false, String(e.message).split('\n')[0].slice(0, 200));
}

// ───────────── 5. Shadowing with the fake microphone (guest) ─────────────
const g = await signedIn(null);
try {
  await g.goto(`${BASE}/app/shadowing`);
  await g.getByRole('heading', { name: 'Latihan Shadowing' }).waitFor({ timeout: 30000 });
  check('shadowing: level terkunci untuk akun gratis diarahkan ke Premium', await g.getByRole('link', { name: 'B1' }).getAttribute('href') === '/app/subscription');
  await g.getByRole('button', { name: /Mulai 5 kalimat A1/ }).click();
  const xpBefore = await g.evaluate(() => JSON.parse(localStorage.getItem('lentera.state.guest') || '{}').xp ?? 0);
  for (let i = 1; i <= 5; i++) {
    await g.getByText(`${i}/5`).waitFor({ timeout: 15000 });
    const rate = g.getByRole('button', { name: 'Sudah mirip' });
    if (i === 1) check('shadowing: menilai sendiri baru bisa setelah merekam', await rate.isDisabled());
    await g.getByRole('button', { name: /Rekam suaraku/ }).click();
    await g.getByText('Merekam... tekan Berhenti setelah selesai bicara.').waitFor({ timeout: 10000 });
    await g.waitForTimeout(1200);
    await g.getByRole('button', { name: /Berhenti/ }).click();
    await g.getByRole('heading', { name: /Bandingkan berdampingan/ }).waitFor({ timeout: 15000 });
    if (i === 1) {
      check('shadowing: contoh dan suaramu berdampingan, bisa diputar berurutan', await g.getByRole('button', { name: 'Putar contoh' }).isVisible() && await g.getByRole('button', { name: 'Putar suaraku' }).isVisible() && await g.getByRole('button', { name: /Putar berurutan/ }).isVisible());
      check('shadowing: layar latihan muat di 390 px', (await overflow(g)) <= 0);
      await g.screenshot({ path: path.join(SHOTS, 'habits-shadowing.png'), fullPage: true });
    }
    await g.getByRole('button', { name: i === 2 ? 'Perlu diulang' : 'Sudah mirip' }).click();
  }
  await g.getByRole('heading', { name: '5 kalimat dilatih' }).waitFor({ timeout: 15000 });
  const after = await g.evaluate(() => JSON.parse(localStorage.getItem('lentera.state.guest') || '{}'));
  check('shadowing selesai: +10 XP dan tercatat', after.xp - xpBefore === 10 && after.shadowing?.total === 5, `${xpBefore} → ${after.xp}`);
  check('shadowing: kalimat yang "Perlu diulang" bisa dilatih lagi', await g.getByRole('button', { name: 'Ulangi 1 kalimat' }).isVisible());
} catch (e) {
  await g.screenshot({ path: path.join(SHOTS, 'habits-gagal-shadowing.png'), fullPage: true }).catch(() => {});
  check('shadowing: macet', false, String(e.message).split('\n')[0].slice(0, 200));
}

// ───────────── 6. Entry points ─────────────
try {
  await g.goto(`${BASE}/app`);
  const nav = g.getByRole('navigation', { name: 'Kebiasaan belajar' });
  await nav.waitFor({ timeout: 30000 });
  check('beranda: pintasan Liga & Teman, Shadowing, dan Pengingat harian', (await nav.getByRole('link').count()) === 3);
  await g.goto(`${BASE}/app/more`);
  await g.getByRole('heading', { name: 'Lainnya' }).waitFor({ timeout: 30000 });
  check('menu Lainnya: Shadowing dan Liga & Teman', await g.locator('main').getByRole('link', { name: /Shadowing/ }).isVisible() && await g.locator('main').getByRole('link', { name: /Liga & Teman/ }).isVisible());
  await g.goto(`${BASE}/app/leaderboard?tab=teman&kode=${rinaCode || 'ABC234'}`);
  await g.getByText(/Masuk untuk berteman dengan kode/).waitFor({ timeout: 30000 });
  check('tamu yang membuka tautan undangan diajak membuat akun', await g.getByRole('link', { name: 'Buat akun gratis' }).isVisible());
} catch (e) {
  check('pintasan: macet', false, String(e.message).split('\n')[0].slice(0, 200));
}

check('tanpa error di konsol', issues.length === 0, issues.slice(0, 3).join(' | '));
await browser.close();
console.log(process.exitCode === 1 ? '\nADA YANG GAGAL' : '\nSEMUA LOLOS');
