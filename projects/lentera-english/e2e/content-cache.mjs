// End-to-end check of the curriculum cache on the device: the full pack is
// downloaded once, every later open only asks "still the same version?"
// (a few bytes), a newly published curriculum still arrives, and nothing
// Premium stays visible to a device that is no longer Premium.
//
// Needs a server with the embedded backend and the admin address set
// (see e2e/admin-app.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { BASE, check, chromium } from './lib.mjs';

const SHOTS = process.env.E2E_SHOTS ?? path.join(import.meta.dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const ADMIN = process.env.E2E_ADMIN_EMAIL ?? 'admin@lentera.test';
const PASSWORD = 'rahasia-12345';
const post = async (url, body, token) => {
  const res = await fetch(BASE + url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
  return { status: res.status, data: await res.json().catch(() => ({})) };
};
let r = await post('/api/dev-auth', { action: 'signin', email: ADMIN, password: PASSWORD });
if (r.status !== 200) r = await post('/api/dev-auth', { action: 'signup', email: ADMIN, password: PASSWORD, name: 'Admin Uji' });
const admin = r.data;

const browser = await chromium.launch();
const issues = [];
async function device(session) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  if (session) await ctx.addInitScript((s) => { if (!sessionStorage.getItem('cc-init')) { localStorage.setItem('lentera.session', JSON.stringify(s)); sessionStorage.setItem('cc-init', '1'); } }, session);
  const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error' && !/status of 40[0-9]|Failed to load resource|ERR_FAILED|net::/.test(m.text())) issues.push(`${new URL(p.url()).pathname}: ${m.text().slice(0, 160)}`); });
  p.on('pageerror', (e) => issues.push(`pageerror: ${e.message}`));
  // Bytes on the wire for /api/content (compressed, as the phone receives them).
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Network.enable');
  const calls = new Map();
  cdp.on('Network.requestWillBeSent', (e) => { if (e.request.url.includes('/api/content')) calls.set(e.requestId, { url: e.request.url, bytes: 0 }); });
  cdp.on('Network.loadingFinished', (e) => { const c = calls.get(e.requestId); if (c) c.bytes = e.encodedDataLength; });
  const open = async (url = '/app') => {
    calls.clear();
    await p.goto(BASE + url);
    await p.locator('main').first().waitFor({ timeout: 45000 });
    await p.waitForTimeout(1500);
    return [...calls.values()];
  };
  return { ctx, p, open };
}
const kb = (b) => `${(b / 1024).toFixed(1)} KB`;

// ───────────── 1. Guest: full pack once, then "unchanged" ─────────────
let guestFull = 0;
let guestRepeat = 0;
{
  const { ctx, p, open } = await device(null);
  const first = await open();
  guestFull = first.reduce((n, c) => n + c.bytes, 0);
  check('tamu, pembukaan pertama: paket materi lengkap diunduh sekali', first.length === 1 && !first[0].url.includes('v=') && guestFull > 20000, JSON.stringify(first));
  const again = await open('/app/path');
  guestRepeat = again.reduce((n, c) => n + c.bytes, 0);
  check(`tamu, pembukaan berikutnya: hanya tanya versi (${kb(guestRepeat)} vs ${kb(guestFull)})`, again.length === 1 && again[0].url.includes('v=') && again[0].url.includes('tier=free') && guestRepeat < 1024, JSON.stringify(again));
  check('tamu: jalur belajar tetap tampil lengkap dari paket di HP (6 level)', await p.getByRole('heading', { name: 'Jalur Belajar' }).waitFor({ timeout: 15000 }).then(() => true, () => false) && (await p.locator('h2[id^="level-"]').count()) === 6);

  // The server cannot be reached: the app still opens from the pack on the device.
  await p.route('**/api/content*', (route) => route.abort());
  await open('/app');
  check('server materi tidak terjangkau: aplikasi tetap terbuka dari paket di HP (dulu layar galat)', await p.getByRole('navigation', { name: 'Navigasi bawah' }).count() === 1 && await p.getByText(/Konten gagal dimuat|Tidak ada koneksi/).count() === 0);
  await p.unroute('**/api/content*');

  // A new curriculum is published: the next open downloads it.
  const before = await p.evaluate(() => new Promise((res) => { const q = indexedDB.open('lentera', 1); q.onsuccess = () => { const g = q.result.transaction('kv').objectStore('kv').get('pack'); g.onsuccess = () => res(g.result?.version); }; }));
  const pub = await post('/api/admin', { action: 'publish', label: `cache-${Date.now()}`, notes: 'uji cache' }, admin.token);
  // Publishing clears the server's cache at once (other server instances notice within 30 s).
  const fresh = await open('/app');
  const after = await p.evaluate(() => new Promise((res) => { const q = indexedDB.open('lentera', 1); q.onsuccess = () => { const g = q.result.transaction('kv').objectStore('kv').get('pack'); g.onsuccess = () => res(g.result?.version); }; }));
  check(`kurikulum baru diterbitkan: pembukaan berikutnya mengunduh versi baru (${before} → ${after})`, pub.data.published === true && after !== before && fresh.reduce((n, c) => n + c.bytes, 0) > 20000, JSON.stringify({ before, after, fresh }));
  const settled = await open('/app/path');
  check('setelah itu kembali hanya tanya versi', settled.length === 1 && settled[0].bytes < 1024 && settled[0].url.includes(`v=${encodeURIComponent(after)}`), JSON.stringify(settled));
  await ctx.close();
}

// ───────────── 2. Premium: same saving on the bigger pack; leaving Premium hides it ─────────────
let premiumFull = 0;
let premiumRepeat = 0;
{
  const { ctx, p, open } = await device(admin);
  const first = await open();
  premiumFull = first.reduce((n, c) => n + c.bytes, 0);
  const again = await open('/app/path');
  premiumRepeat = again.reduce((n, c) => n + c.bytes, 0);
  check(`Premium: paket lengkap sekali (${kb(premiumFull)}), lalu hanya tanya versi (${kb(premiumRepeat)})`, premiumFull > guestFull && again.length === 1 && again[0].url.includes('tier=premium') && premiumRepeat < 1024, JSON.stringify({ first, again }));
  // A Premium branching story: whether it is locked comes from the pack itself.
  await p.goto(`${BASE}/app/stories?id=story-cafe-interview`);
  check('Premium: cerita Premium terbuka dari paket di HP', await p.getByRole('button', { name: 'Mulai cerita' }).waitFor({ timeout: 30000 }).then(() => true, () => false));

  // Premium ends while the phone is offline: the stored Premium pack is cut down on the device.
  await p.evaluate((uid) => localStorage.setItem(`lentera.ent.${uid}`, JSON.stringify({ premium: false })), admin.userId);
  await p.route('**/api/**', (route) => route.abort());
  await p.goto(`${BASE}/app/stories?id=story-cafe-interview`);
  await p.locator('main').first().waitFor({ timeout: 30000 });
  await p.waitForTimeout(1500);
  const lockedOffline = await p.getByText('Cerita bercabang Premium', { exact: true }).count() === 1 && await p.getByRole('button', { name: 'Mulai cerita' }).count() === 0;
  check('Premium habis saat offline: isi Premium di HP langsung dipangkas (cerita Premium terkunci)', lockedOffline);
  await p.goto(`${BASE}/app/lesson?id=a1-greetings`);
  check('…dan pelajaran gratis tetap terbuka tanpa internet', await p.getByRole('button', { name: 'Mulai belajar' }).waitFor({ timeout: 30000 }).then(() => true, () => false));
  await p.unroute('**/api/**');
  await ctx.close();
}
{
  // Shared phone: a Premium account signs out; the guest never sees Premium material.
  const { ctx, p, open } = await device(admin);
  await open('/app');
  await p.evaluate(() => localStorage.removeItem('lentera.session'));
  const calls = await open('/app');
  const stored = await p.evaluate(() => new Promise((res) => { const q = indexedDB.open('lentera', 1); q.onsuccess = () => { const g = q.result.transaction('kv').objectStore('kv').get('pack'); g.onsuccess = () => res(g.result?.tier); }; }));
  await p.goto(`${BASE}/app/stories?id=story-cafe-interview`);
  await p.locator('main').first().waitFor({ timeout: 30000 });
  await p.waitForTimeout(1000);
  check('HP bersama: setelah keluar akun Premium, tamu mendapat paket gratis dan cerita Premium terkunci', stored === 'free' && calls.some((c) => c.bytes > 20000) && await p.getByText('Cerita bercabang Premium', { exact: true }).count() === 1 && await p.getByRole('button', { name: 'Mulai cerita' }).count() === 0, JSON.stringify({ stored, calls }));
  await ctx.close();
}

const saved = (full, repeat) => (100 * (1 - repeat / full)).toFixed(1);
console.log(`\nPaket materi per pembukaan aplikasi: tamu ${kb(guestFull)} → ${kb(guestRepeat)} (hemat ${saved(guestFull, guestRepeat)}%), Premium ${kb(premiumFull)} → ${kb(premiumRepeat)} (hemat ${saved(premiumFull, premiumRepeat)}%)`);
check('penghematan paket materi minimal 99% di setiap pembukaan berikutnya', guestRepeat / guestFull <= 0.01 && premiumRepeat / premiumFull <= 0.01);
check('tanpa error di konsol', issues.length === 0, issues.slice(0, 3).join(' | '));
await browser.close();
console.log(process.exitCode ? '\nADA YANG GAGAL' : '\nSEMUA LOLOS');
