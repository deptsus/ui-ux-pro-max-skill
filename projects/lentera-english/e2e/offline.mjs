// End-to-end check of offline learning (Rilis 13): a Premium learner saves the
// lessons and app pages on the phone, loses the connection, opens a lesson
// from the saved copy and answers questions, reloads while still offline, and
// once the connection is back the progress reaches the server by itself.
//
// Needs a server with the embedded backend and the admin address set
// (see e2e/admin-app.mjs). The test admin has Premium.
import fs from 'node:fs';
import path from 'node:path';
import { BASE, answerCurrent, check, chromium } from './lib.mjs';

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
const me = r.data;
const auth = { Authorization: `Bearer ${me.token}` };
const pack = (await (await fetch(`${BASE}/api/content`, { headers: auth })).json()).pack;
const lesson = pack.lessons.find((l) => l.id === 'a1-greetings') ?? pack.lessons[0];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await ctx.addInitScript((s) => { if (!localStorage.getItem('lentera.session')) localStorage.setItem('lentera.session', JSON.stringify(s)); }, me);
const p = await ctx.newPage();
const issues = [];
p.on('pageerror', (e) => issues.push(`pageerror: ${e.message}`));
const state = () => p.evaluate((uid) => JSON.parse(localStorage.getItem(`lentera.state.${uid}`) ?? 'null'), me.userId);
const button = (name) => p.getByRole('button', { name, exact: true });

try {
  // 1. Save for offline (online).
  await p.goto(`${BASE}/app/settings`);
  await button('Unduh untuk offline').click({ timeout: 30000 });
  check('Premium: pelajaran dan halaman aplikasi tersimpan di HP', await p.getByText('Pelajaran tersimpan di perangkat ini').waitFor({ timeout: 90000 }).then(() => true, () => false));
  await p.reload();
  await p.waitForFunction(() => !!navigator.serviceWorker?.controller, null, { timeout: 30000 });
  await p.waitForTimeout(1500);
  const before = await state();

  // 2. No connection: the lesson opens from the saved copy and answers are kept.
  await ctx.setOffline(true);
  await p.goto(`${BASE}/app/lesson?id=${lesson.id}`);
  check('tanpa internet: halaman pelajaran terbuka dari salinan di HP', await p.getByRole('heading', { name: lesson.title, level: 1 }).waitFor({ timeout: 30000 }).then(() => true, () => false));
  for (const name of ['Mulai belajar', 'Lihat contoh benar dan salah', 'Lanjut ke latihan', 'Mulai latihan']) await button(name).click({ timeout: 30000 });
  for (let i = 0; i < 3; i++) {
    await answerCurrent(p, pack, true);
    await button('Periksa').click();
    await button('Lanjut').click();
  }
  await p.waitForTimeout(500);
  const offline = await state();
  check('jawaban saat offline tersimpan di HP dan menunggu dikirim', offline.xp > before.xp && offline.outbox.length > 0, `xp ${before.xp}→${offline.xp}, antrean ${offline.outbox.length}`);

  await p.reload();
  check('masih offline, aplikasi dibuka ulang: progres tetap ada', await p.getByRole('heading', { name: lesson.title, level: 1 }).waitFor({ timeout: 30000 }).then(() => true, () => false) && (await state()).xp === offline.xp);
  await p.goto(`${BASE}/app/plan`);
  check('tanpa internet: rencana mingguan juga terbuka', await p.getByRole('heading', { name: 'Rencana Belajar Mingguan', level: 1 }).waitFor({ timeout: 30000 }).then(() => true, () => false));
  await p.screenshot({ path: path.join(SHOTS, 'offline-rencana.png'), fullPage: true });

  // 3. Back online: the queue empties by itself and the server has the progress.
  await ctx.setOffline(false);
  let sent = false;
  for (let t = 0; t < 30 && !sent; t++) { await p.waitForTimeout(1000); sent = (await state()).outbox.length === 0; }
  check('kembali online: progres terkirim sendiri tanpa perlu menjawab lagi', sent);
  const server = (await (await fetch(`${BASE}/api/sync`, { headers: auth })).json()).snapshot;
  check('server menyimpan progres yang dibuat saat offline', server?.state?.xp >= offline.xp, `server xp ${server?.state?.xp} vs ${offline.xp}`);
} catch (e) {
  await p.screenshot({ path: path.join(SHOTS, 'offline-gagal.png'), fullPage: true }).catch(() => {});
  check('belajar offline: macet', false, String(e.message).split('\n')[0].slice(0, 200));
}

check('tanpa error di halaman', issues.length === 0, issues.slice(0, 3).join(' | '));
await browser.close();
console.log(process.exitCode === 1 ? '\nADA YANG GAGAL' : '\nSEMUA LOLOS');
