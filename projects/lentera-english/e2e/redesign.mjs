// Interaction check for the 2026 redesign: every tab, switch, sheet and nav state is pressed the way
// a learner presses it on a phone, and the screen must follow (highlight moves, the right content
// shows, the address stays shareable). Written after the owner's report of 20 Nov 2026: the CEFR
// level tabs kept A1 highlighted, and CEFR | Sekolah | Khusus did not respond.
//
// Needs a server with the embedded backend (see e2e/admin-app.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { BASE, check, chromium } from './lib.mjs';

const SHOTS = process.env.E2E_SHOTS ?? path.join(import.meta.dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const post = async (url, body) => (await fetch(BASE + url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).json();
let admin = await post('/api/dev-auth', { action: 'signin', email: 'admin@lentera.test', password: 'rahasia-12345' });
if (!admin?.token) admin = await post('/api/dev-auth', { action: 'signup', email: 'admin@lentera.test', password: 'rahasia-12345', name: 'Admin Uji' });

const browser = await chromium.launch();
const issues = [];
async function phone({ width = 360, session = null, dark = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 780 }, isMobile: true, hasTouch: true });
  await ctx.addInitScript(([s, d]) => {
    localStorage.setItem('lentera.sound', '0');
    if (d && !localStorage.getItem('lentera.theme')) localStorage.setItem('lentera.theme', 'dark');
    if (s && !localStorage.getItem('lentera.session')) localStorage.setItem('lentera.session', JSON.stringify(s));
  }, [session, dark]);
  const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error' && !/status of 40[0-9]/.test(m.text())) issues.push(`${new URL(p.url()).pathname}: ${m.text().slice(0, 200)}`); });
  p.on('pageerror', (e) => issues.push(`pageerror: ${e.message}`));
  return { ctx, p };
}
const fail = async (p, name, e) => {
  await p.screenshot({ path: path.join(SHOTS, `redesign-gagal-${name}.png`), fullPage: true }).catch(() => {});
  check(`${name}: macet`, false, String(e.message).split('\n')[0].slice(0, 200));
};
const open = async (p, u) => { await p.goto(BASE + u); await p.locator('main').first().waitFor({ timeout: 45000 }); };
const selectedTab = (list) => list.locator('[role="tab"][aria-selected="true"]').innerText();
const visibleH2 = async (p) => (await p.locator('section[role="tabpanel"]:not([hidden]) h2').allInnerTexts()).join('|');

// ───────────── 1. CEFR level tabs (Premium: every level has content) ─────────────
{
  const { ctx, p } = await phone({ session: admin });
  try {
    await open(p, '/app/path');
    const list = p.getByRole('tablist', { name: 'Level CEFR' });
    await list.waitFor({ timeout: 30000 });
    check('Jalur: 6 tab level dan tepat satu terpilih', (await list.getByRole('tab').count()) === 6 && (await list.locator('[aria-selected="true"]').count()) === 1);
    const titles = {};
    for (const code of ['A2', 'B1', 'B2', 'C1', 'C2', 'A1']) {
      await list.getByRole('tab', { name: new RegExp(`^${code}`) }).click();
      const sel = (await selectedTab(list)).trim();
      const panel = p.locator(`#panel-${code}`);
      titles[code] = (await panel.locator('h2').innerText()).trim();
      const ok = sel.startsWith(code) && await panel.isVisible() && (await p.locator('section[role="tabpanel"]:not([hidden])').count()) === 1 && p.url().endsWith(`#level-${code}`);
      check(`Jalur: tekan ${code} → tab ${code} ungu (terpilih), hanya isi ${code} tampil, alamat #level-${code}`, ok, `terpilih=${sel} tampil=${await visibleH2(p)} url=${p.url()}`);
    }
    const bg = await list.getByRole('tab', { name: /^A1/ }).evaluate((el) => getComputedStyle(el).backgroundColor);
    const bgOther = await list.getByRole('tab', { name: /^B1/ }).evaluate((el) => getComputedStyle(el).backgroundColor);
    check('Jalur: warna tab terpilih berbeda dari tab lain', bg !== bgOther, `${bg} vs ${bgOther}`);
    // Fast taps: the last one wins.
    for (const code of ['B2', 'C1', 'A2', 'C2', 'B1']) await list.getByRole('tab', { name: new RegExp(`^${code}`) }).click({ delay: 0 });
    check('Jalur: ketukan cepat beruntun, tab terakhir (B1) yang terpilih', (await selectedTab(list)).trim().startsWith('B1') && (await visibleH2(p)) === titles.B1);
    // Keyboard: arrows move the selection.
    await list.getByRole('tab', { name: /^B1/ }).focus();
    await p.keyboard.press('ArrowRight');
    check('Jalur: panah kanan memilih level berikutnya (B2)', (await selectedTab(list)).trim().startsWith('B2'));
    // After scrolling deep into a level, a tap brings the new level's start into view.
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await list.getByRole('tab', { name: /^C1/ }).click();
    await p.waitForTimeout(300);
    const top = await p.locator('#panel-C1 h2').evaluate((el) => el.getBoundingClientRect().top);
    check('Jalur: setelah menggulir jauh, memilih C1 membawa judul C1 ke layar', top >= 0 && top < 780, `top=${Math.round(top)}`);
    // Deep link.
    await open(p, '/app/path#level-B2');
    await list.waitFor();
    await p.waitForTimeout(300);
    check('Jalur: tautan #level-B2 membuka tab B2', (await selectedTab(list)).trim().startsWith('B2') && await p.locator('#panel-B2').isVisible());
    await p.screenshot({ path: path.join(SHOTS, 'redesign-jalur-b2.png') });
  } catch (e) { await fail(p, 'level-cefr', e); }
  await ctx.close();
}

// ───────────── 2. CEFR | Sekolah | Khusus, back and forth ─────────────
{
  const { ctx, p } = await phone();
  try {
    await open(p, '/app/path');
    const nav = p.getByRole('navigation', { name: 'Jenis jalur' });
    await nav.waitFor({ timeout: 30000 });
    const current = async () => (await nav.locator('[aria-current="page"]').allInnerTexts()).join(',');
    const expect = {
      CEFR: { url: /\/app\/path/, heading: 'Jalur Belajar', absent: 'Jalur SD' },
      Sekolah: { url: /\/app\/jalur$/, heading: 'Jalur SD', absent: 'Bahasa Inggris untuk Kerja' },
      Khusus: { url: /\/app\/jalur\?jenis=khusus/, heading: 'Bahasa Inggris untuk Kerja', absent: 'Jalur SD' },
    };
    const order = ['Sekolah', 'Khusus', 'Sekolah', 'CEFR', 'Khusus', 'CEFR', 'Sekolah', 'Khusus', 'CEFR'];
    let all = true;
    for (const [i, tab] of order.entries()) {
      const t0 = Date.now();
      await nav.getByRole('link', { name: tab, exact: true }).click();
      const e = expect[tab];
      await p.waitForURL(e.url, { timeout: 15000 });
      await p.getByRole('heading', { name: e.heading, exact: true }).first().waitFor({ timeout: 15000 });
      const ms = Date.now() - t0;
      const ok = (await current()) === tab && (await p.getByRole('heading', { name: e.absent, exact: true }).count()) === 0;
      if (!ok) all = false;
      check(`Tab ${i + 1}: tekan ${tab} → tab ${tab} aktif, isinya tampil (${ms} ms)`, ok, `aktif=${await current()} url=${p.url()}`);
    }
    check('Tab: sembilan perpindahan CEFR/Sekolah/Khusus semuanya menanggapi', all);
    check('Tab: halaman Khusus/Sekolah dibuka dari atas (judul halaman terlihat)', await p.getByRole('heading', { name: 'Jalur Belajar', level: 1 }).isVisible());
    // Old links with a hash.
    await open(p, '/app/jalur#exam');
    await p.getByRole('heading', { name: 'Persiapan TOEFL ITP dan IELTS', exact: true }).waitFor({ timeout: 15000 });
    check('Tautan lama /app/jalur#exam membuka tab Khusus', p.url().includes('jenis=khusus') && (await current()) === 'Khusus');
    await open(p, '/app/jalur#sd');
    await p.getByRole('heading', { name: 'Jalur SD', exact: true }).waitFor({ timeout: 15000 });
    check('Tautan /app/jalur#sd tetap di tab Sekolah', !p.url().includes('jenis=') && (await current()) === 'Sekolah');
    // Bottom nav: "Belajar" stays lit on all three views.
    for (const u of ['/app/path', '/app/jalur', '/app/jalur?jenis=khusus']) {
      await open(p, u);
      const lit = await p.getByRole('navigation', { name: 'Navigasi bawah' }).locator('[aria-current="page"]').innerText();
      check(`Tab bawah "Belajar" menyala di ${u}`, lit.includes('Belajar'), lit);
    }
  } catch (e) { await fail(p, 'jenis-jalur', e); }
  await ctx.close();
}

// ───────────── 3. Bottom nav and header ─────────────
{
  const { ctx, p } = await phone();
  try {
    const nav = () => p.getByRole('navigation', { name: 'Navigasi bawah' });
    for (const [u, tab] of [['/app', 'Beranda'], ['/app/review', 'Ulangan'], ['/app/more', 'Lainnya'], ['/app/vocabulary', 'Lainnya'], ['/app/profile', 'Profil'], ['/app/lesson?id=a1-greetings', 'Belajar']]) {
      await open(p, u);
      const lit = await nav().locator('[aria-current="page"]').allInnerTexts();
      check(`Tab bawah: ${u} → hanya "${tab}" menyala`, lit.length === 1 && lit[0].includes(tab), lit.join(','));
    }
    await open(p, '/app');
    await nav().getByRole('link', { name: /Ulangan/ }).click();
    await p.waitForURL(/\/app\/review/);
    check('Tab bawah: mengetuk Ulangan pindah halaman dan menyalakan Ulangan', (await nav().locator('[aria-current="page"]').innerText()).includes('Ulangan'));
    await p.getByRole('link', { name: /XP$/ }).first().click();
    await p.waitForURL(/\/app\/achievements/);
    check('Header: chip XP membuka Pencapaian', true);
  } catch (e) { await fail(p, 'navigasi', e); }
  await ctx.close();
}

// ───────────── 4. Settings switches (radio groups) ─────────────
{
  const { ctx, p } = await phone();
  try {
    await open(p, '/app/settings');
    const theme = p.getByRole('radiogroup', { name: 'Tema' });
    await theme.waitFor({ timeout: 30000 });
    await theme.getByRole('radio', { name: 'Gelap' }).click();
    check('Pengaturan: Gelap dipilih, tampilan jadi gelap', (await theme.getByRole('radio', { name: 'Gelap' }).getAttribute('aria-checked')) === 'true' && await p.evaluate(() => document.documentElement.classList.contains('dark')));
    await theme.getByRole('radio', { name: 'Gelap' }).press('ArrowRight');
    check('Pengaturan: panah kanan pindah ke "Ikuti perangkat"', (await theme.getByRole('radio', { name: 'Ikuti perangkat' }).getAttribute('aria-checked')) === 'true');
    await theme.getByRole('radio', { name: 'Terang' }).click();
    check('Pengaturan: Terang dipilih, tampilan jadi terang', !(await p.evaluate(() => document.documentElement.classList.contains('dark'))));
    const size = p.getByRole('radiogroup', { name: /Ukuran huruf/ });
    await size.getByRole('radio', { name: 'Besar', exact: true }).click();
    check('Pengaturan: ukuran huruf Besar langsung berlaku', await p.evaluate(() => document.documentElement.classList.contains('fs-lg')) && (await size.getByRole('radio', { name: 'Besar', exact: true }).getAttribute('aria-checked')) === 'true');
    await size.getByRole('radio', { name: 'Normal' }).click();
    const goal = p.getByRole('radiogroup', { name: 'Target XP harian' });
    const opts = goal.getByRole('radio');
    await opts.nth(2).click();
    check('Pengaturan: target harian berpindah pilihan', (await opts.nth(2).getAttribute('aria-checked')) === 'true' && (await goal.locator('[aria-checked="true"]').count()) === 1);
    const accent = p.getByRole('radiogroup', { name: 'Aksen' });
    await accent.getByRole('radio', { name: 'Inggris (British)' }).click();
    check('Pengaturan: aksen Inggris dipilih', (await accent.getByRole('radio', { name: 'Inggris (British)' }).getAttribute('aria-checked')) === 'true');
  } catch (e) { await fail(p, 'pengaturan', e); }
  await ctx.close();
}

// ───────────── 5. Vocabulary (Premium: all levels), grammar, listening, analytics ─────────────
{
  const { ctx, p } = await phone({ session: admin });
  try {
    await open(p, '/app/vocabulary');
    const lv = p.getByRole('group', { name: 'Level' });
    await lv.waitFor({ timeout: 30000 });
    for (const code of ['A2', 'B1', 'A1']) {
      await lv.getByRole('button', { name: code, exact: true }).click();
      const pressed = await lv.locator('[aria-pressed="true"]').innerText();
      const heads = await p.locator('main section h2').allInnerTexts();
      check(`Kosakata: tekan ${code} → tombol ${code} terpilih, hanya kata ${code}`, pressed.trim() === code && heads.length > 0 && heads.every((h) => h.startsWith(code)), `${pressed} ${heads.slice(0, 3).join('|')}`);
    }
    await p.getByLabel('Cari kosakata').fill('ing');
    const found = await p.locator('main section h2').allInnerTexts();
    check('Kosakata: pencarian melihat semua level', new Set(found.map((h) => h.slice(0, 2))).size > 1, found.slice(0, 4).join('|'));
    await p.getByLabel('Cari kosakata').fill('');
    await p.locator('main section ul li button').first().click();
    const dlg = p.getByRole('dialog');
    await dlg.waitFor({ timeout: 5000 });
    check('Kosakata: mengetuk kata membuka detail (sheet)', await dlg.isVisible());
    await p.keyboard.press('Escape');
    await p.waitForTimeout(300);
    check('Kosakata: Esc menutup detail', !(await dlg.isVisible()));
    await p.locator('main section ul li button').first().click();
    await dlg.waitFor();
    await dlg.getByRole('button', { name: 'Tutup' }).click();
    await p.waitForTimeout(300);
    check('Kosakata: tombol Tutup menutup detail', !(await dlg.isVisible()));

    await open(p, '/app/grammar');
    const show = p.getByRole('group', { name: 'Tampilkan level' });
    await show.waitFor({ timeout: 30000 });
    await show.getByRole('button', { name: 'Semua' }).click();
    const allSecs = await p.locator('main section h2').count();
    await show.getByRole('button', { name: 'B1', exact: true }).click();
    const b1 = await p.locator('main section h2').allInnerTexts();
    check('Tata Bahasa: Semua → banyak level, B1 → hanya B1', allSecs > 1 && b1.length === 1 && b1[0].startsWith('B1'), `${allSecs} ${b1.join('|')}`);

    await open(p, '/app/listening');
    const acc = p.getByRole('group', { name: 'Aksen audio' }).first();
    await acc.waitFor({ timeout: 30000 });
    await acc.getByRole('button', { name: 'Inggris (British)' }).click();
    check('Menyimak: aksen Inggris tertekan', (await acc.getByRole('button', { name: 'Inggris (British)' }).getAttribute('aria-pressed')) === 'true');
    await acc.getByRole('button', { name: 'Amerika' }).click();
    const vt = p.getByRole('navigation', { name: 'Latihan suara' });
    await vt.getByRole('link', { name: 'Pelafalan' }).click();
    await p.waitForURL(/tab=pelafalan/);
    await p.waitForTimeout(300);
    check('Menyimak: tab Pelafalan aktif', (await vt.locator('[aria-current="page"]').innerText()) === 'Pelafalan');
    await vt.getByRole('link', { name: 'Shadowing' }).click();
    await p.waitForURL(/\/app\/shadowing/);
    await p.getByRole('heading', { name: 'Latihan Shadowing' }).waitFor();
    check('Shadowing: tab Shadowing aktif', (await p.getByRole('navigation', { name: 'Latihan suara' }).locator('[aria-current="page"]').innerText()) === 'Shadowing');
    await p.getByRole('navigation', { name: 'Latihan suara' }).getByRole('link', { name: 'Menyimak' }).click();
    await p.waitForURL(/\/app\/listening$/);
    check('Shadowing → Menyimak kembali', (await p.getByRole('navigation', { name: 'Latihan suara' }).locator('[aria-current="page"]').innerText()) === 'Menyimak');
  } catch (e) { await fail(p, 'modul', e); }
  await ctx.close();
}

// ───────────── 6. Lesson room: step bar, sticky CTA ─────────────
{
  const { ctx, p } = await phone({ width: 320 });
  try {
    await open(p, '/app/lesson?id=a1-greetings');
    const cta = p.getByRole('button', { name: 'Mulai belajar' });
    await cta.waitFor({ timeout: 30000 });
    const box = await cta.boundingBox();
    check('Pelajaran 320 px: tombol Mulai belajar terlihat tanpa menggulir', box && box.y + box.height <= 780 && box.height >= 44, JSON.stringify(box));
    await cta.click();
    await p.getByRole('button', { name: 'Lihat contoh benar dan salah' }).waitFor();
    const steps = p.getByRole('list', { name: 'Langkah pelajaran' }).getByRole('button');
    const sizes = await steps.evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
    check('Pelajaran: 8 tombol langkah, tinggi minimal 44 px', sizes.length === 8 && sizes.every((h) => h >= 44), sizes.join(','));
    await steps.first().click();
    await p.getByRole('button', { name: 'Mulai belajar' }).waitFor();
    check('Pelajaran: tombol langkah 1 kembali ke Pengantar', (await p.getByText(/Langkah 1 dari 8/).count()) === 1);
  } catch (e) { await fail(p, 'pelajaran', e); }
  await ctx.close();
}

// ───────────── 7. Dark mode: the same tabs light up ─────────────
{
  const { ctx, p } = await phone({ session: admin, dark: true });
  try {
    await open(p, '/app/path');
    const list = p.getByRole('tablist', { name: 'Level CEFR' });
    await list.getByRole('tab', { name: /^C1/ }).click();
    const [on, off] = await Promise.all(['C1', 'A1'].map((c) => list.getByRole('tab', { name: new RegExp(`^${c}`) }).evaluate((el) => getComputedStyle(el).backgroundColor)));
    check('Mode gelap: tab terpilih (C1) jelas berbeda dari tab lain', on !== off && (await selectedTab(list)).trim().startsWith('C1'), `${on} vs ${off}`);
    await p.screenshot({ path: path.join(SHOTS, 'redesign-jalur-gelap.png') });
  } catch (e) { await fail(p, 'gelap', e); }
  await ctx.close();
}

check('tanpa error di konsol', issues.length === 0, issues.slice(0, 3).join(' | '));
await browser.close();
console.log(process.exitCode === 1 ? '\nADA YANG GAGAL' : '\nSEMUA LOLOS');
