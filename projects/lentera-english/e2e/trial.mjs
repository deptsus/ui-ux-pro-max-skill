// Trial Premium 3 hari (migration 0021): a new account is Premium for 3 days, the app says so
// (header, Beranda, Premium page, Profil), Premium lessons open, and an account without the
// trial stays Free. Expiry itself is covered by tests/trial.test.ts (database clock).
//
// Needs a server with the embedded backend (see e2e/admin-app.mjs). Local test accounts are made
// without the trial unless the sign-up asks for it ({ trial: true }).
import fs from 'node:fs';
import path from 'node:path';
import { BASE, check, chromium, fetchPack } from './lib.mjs';

const SHOTS = process.env.E2E_SHOTS ?? path.join(import.meta.dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const post = async (url, body) => (await fetch(BASE + url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).json();
const stamp = Date.now();
const trialUser = await post('/api/dev-auth', { action: 'signup', email: `trial-${stamp}@lentera.test`, password: 'rahasia-12345', name: 'Tari Trial', trial: true });
const freeUser = await post('/api/dev-auth', { action: 'signup', email: `free-${stamp}@lentera.test`, password: 'rahasia-12345', name: 'Fajar Free' });

const browser = await chromium.launch();
const issues = [];
async function phone(session) {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true });
  await ctx.addInitScript((s) => { localStorage.setItem('lentera.sound', '0'); if (!localStorage.getItem('lentera.session')) localStorage.setItem('lentera.session', JSON.stringify(s)); }, session);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => issues.push(`pageerror: ${e.message}`));
  p.on('console', (m) => { if (m.type() === 'error' && !/status of 40[0-9]/.test(m.text())) issues.push(m.text().slice(0, 200)); });
  return { ctx, p };
}
const open = async (p, u) => { await p.goto(BASE + u); await p.locator('main').first().waitFor({ timeout: 45000 }); await p.waitForLoadState('networkidle').catch(() => {}); };

// A lesson that is Premium in the Free pack.
const guestPack = await (await fetch(`${BASE}/api/content`)).json().then((r) => r.pack);
const premiumLesson = guestPack.lessons.find((l) => l.locked && !l.track);

{
  const { ctx, p } = await phone(trialUser);
  try {
    const me = await (await fetch(`${BASE}/api/me`, { headers: { Authorization: `Bearer ${trialUser.token}` } })).json();
    const ent = me.user?.entitlement ?? {};
    const hours = (Date.parse(ent.expires_at) - Date.now()) / 3_600_000;
    check('akun baru: hak Premium "trial" selama ±72 jam', ent.premium === true && ent.plan === 'trial' && hours > 71.5 && hours <= 72, JSON.stringify(ent));
    await open(p, '/app');
    await p.getByText(/Premium uji coba · sisa 3 hari/).waitFor({ timeout: 30000 });
    check('Beranda: kartu "Premium uji coba · sisa 3 hari"', true);
    check('Header: chip "Uji coba" (bukan nyawa)', await p.getByRole('link', { name: /Uji coba/ }).first().isVisible() && (await p.getByLabel(/nyawa$/).count()) === 0);
    await p.screenshot({ path: path.join(SHOTS, 'trial-beranda.png') });
    const pack = await fetchPack(p, trialUser.token);
    check('paket materi Premium terkirim ke akun trial', pack.lessons.some((l) => l.id === premiumLesson.id && !l.locked));
    await open(p, `/app/lesson?id=${premiumLesson.id}`);
    await p.waitForTimeout(800);
    check(`pelajaran Premium (${premiumLesson.id}) terbuka, tidak terkunci Premium`, (await p.getByRole('heading', { name: 'Pelajaran Premium' }).count()) === 0);
    await open(p, '/app/subscription');
    await p.getByText(/Premium uji coba sampai/).waitFor({ timeout: 20000 });
    check('Premium: status uji coba + ajakan berlangganan (bukan "Perpanjang")', await p.getByRole('heading', { name: 'Berlangganan Premium' }).count() === 1 && await p.getByText(/sisa hari uji coba tidak ditambahkan/).isVisible());
    await p.screenshot({ path: path.join(SHOTS, 'trial-premium.png'), fullPage: true });
    await open(p, '/app/profile');
    check('Profil: lencana "Premium uji coba sampai …"', await p.getByText(/Premium uji coba sampai/).first().isVisible({ timeout: 20000 }));
  } catch (e) {
    await p.screenshot({ path: path.join(SHOTS, 'trial-gagal.png'), fullPage: true }).catch(() => {});
    check('trial: macet', false, String(e.message).split('\n')[0].slice(0, 200));
  }
  await ctx.close();
}

{
  const { ctx, p } = await phone(freeUser);
  try {
    await open(p, '/app');
    await p.getByRole('navigation', { name: 'Navigasi bawah' }).waitFor({ timeout: 30000 });
    check('akun tanpa trial: tetap Free, tanpa kartu uji coba, chip nyawa tampil', (await p.getByText(/Premium uji coba/).count()) === 0 && (await p.getByLabel(/nyawa$/).count()) === 1);
    await open(p, `/app/lesson?id=${premiumLesson.id}`);
    check('akun tanpa trial: pelajaran Premium tetap terkunci', await p.getByRole('heading', { name: 'Pelajaran Premium' }).waitFor({ timeout: 20000 }).then(() => true, () => false));
  } catch (e) {
    check('free: macet', false, String(e.message).split('\n')[0].slice(0, 200));
  }
  await ctx.close();
}

const me = await (await fetch(`${BASE}/api/me`)).json();
check('server lokal tidak mengiklankan trial di layar daftar (hanya Supabase)', me.trial === false);
check('tanpa error di konsol', issues.length === 0, issues.slice(0, 3).join(' | '));
await browser.close();
console.log(process.exitCode === 1 ? '\nADA YANG GAGAL' : '\nSEMUA LOLOS');
