// End-to-end check of the admin experience inside the learner app (phone
// viewport): admin shortcut and pending badge, free Premium for admins,
// in-app alerts when learners report a payment, and phone notifications.
//
// Needs a server with the embedded backend and the admin address set:
//   LENTERA_BACKEND=embedded LENTERA_ALLOW_EMBEDDED=1 LENTERA_DEV_ADMIN_EMAIL=admin@lentera.test \
//   LENTERA_DATA_DIR=/tmp/lentera-e2e/pglite npx next start -p 3100
//   node e2e/admin-app.mjs
import fs from 'node:fs';
import path from 'node:path';
import { BASE, check, chromium, devices } from './lib.mjs';

const SHOTS = process.env.E2E_SHOTS ?? path.join(import.meta.dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const stamp = Date.now();
const ADMIN = process.env.E2E_ADMIN_EMAIL ?? 'admin@lentera.test';
const PASSWORD = 'rahasia-12345';

const post = async (url, body, token) => {
  const res = await fetch(BASE + url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
  return { status: res.status, data: await res.json().catch(() => ({})) };
};
const get = async (url, token) => (await fetch(BASE + url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })).json();
const account = async (email, name) => {
  let r = await post('/api/dev-auth', { action: 'signup', email, password: PASSWORD, name });
  if (r.status !== 200) r = await post('/api/dev-auth', { action: 'signin', email, password: PASSWORD });
  if (r.status !== 200) throw new Error(`cannot sign in ${email}: ${JSON.stringify(r.data)}`);
  return r.data;
};
/** A learner opens a monthly QRIS checkout and taps "Saya sudah bayar". */
const reportPayment = async (name) => {
  const l = await account(`bayar${stamp}${name.replace(/\W/g, '')}@lentera.test`, name);
  const tx = await post('/api/payments', { planId: 'premium_monthly', channel: 'QRIS' }, l.token);
  const claim = await post(`/api/payments/${tx.data.transaction.id}`, { action: 'claim', payerName: name }, l.token);
  if (claim.status !== 200) throw new Error(`claim failed: ${JSON.stringify(claim.data)}`);
  return l;
};

const browser = await chromium.launch();
const issues = [];
async function open(session) {
  const ctx = await browser.newContext({ ...devices['Pixel 7'], deviceScaleFactor: 1 });
  if (session) await ctx.addInitScript((s) => { if (!localStorage.getItem('lentera.session')) localStorage.setItem('lentera.session', JSON.stringify(s)); }, session);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !/status of 40[13]/.test(m.text())) issues.push(`${new URL(page.url()).pathname}: ${m.text().slice(0, 200)}`); });
  page.on('pageerror', (e) => issues.push(`pageerror: ${e.message}`));
  return page;
}
const seen = (locator, timeout = 15000) => locator.first().waitFor({ timeout }).then(() => true, () => false);

const admin = await account(ADMIN, 'Admin Uji');

// ───────────── 1. Free Premium for admins (server) ─────────────
{
  const me = await get('/api/me', admin.token);
  check('server: akun admin Premium gratis (paket "admin", tanpa tanggal berakhir)', me.user?.profile?.role === 'admin' && me.user.entitlement.premium === true && me.user.entitlement.plan === 'admin' && me.user.entitlement.expires_at === null, JSON.stringify(me.user?.entitlement));
  check('server: admin menerima materi Premium', (await get('/api/content', admin.token)).tier === 'premium');
}

// ───────────── 2. Admin inside the learner app ─────────────
await reportPayment('Pembayar Satu');
const app = await open(admin);
await app.goto(`${BASE}/app`);
const adminButton = app.getByRole('link', { name: /^Dashboard admin/ });
check('aplikasi: tombol Admin tampil di header untuk admin', await seen(adminButton, 45000));
const expected = (await post('/api/admin', { action: 'pending-count' }, admin.token)).data.pending;
check('aplikasi: angka di tombol Admin = pembayaran yang menunggu', await seen(app.getByRole('link', { name: `Dashboard admin, ${expected} pembayaran menunggu konfirmasi` })), `server: ${expected}`);
check('aplikasi: beranda mengingatkan pembayaran yang menunggu', await seen(app.getByText(`${expected} pembayaran menunggu konfirmasi.`)));
check('aplikasi: lencana Premium tampil, bukan nyawa', await seen(app.getByRole('link', { name: 'Premium' })) && (await app.getByLabel(/nyawa$/).count()) === 0);
await app.screenshot({ path: path.join(SHOTS, 'admin-app-home.png') });

await app.goto(`${BASE}/app/profile`);
check('profil: "Premium · Admin" dan kartu admin dengan tombol dashboard', await seen(app.getByText('Premium · Admin')) && await seen(app.getByRole('link', { name: 'Dashboard admin' }).last()));
await app.goto(`${BASE}/app/subscription`);
check('paket: "Premium aktif gratis untuk admin"', await seen(app.getByText('Premium aktif gratis untuk admin')));

// A payment reported while the admin has the app open shows up by itself.
await app.goto(`${BASE}/app`);
await adminButton.first().waitFor({ timeout: 30000 });
await app.waitForTimeout(1500);
await reportPayment('Pembayar Dua');
const inAppAlert = app.getByRole('status').filter({ hasText: 'Ada 1 pembayaran baru menunggu konfirmasi.' });
check('aplikasi: pemberitahuan muncul sendiri saat pelajar melapor bayar', await seen(inAppAlert, 45000));
check('aplikasi: angka di tombol Admin ikut naik', await seen(app.getByRole('link', { name: `Dashboard admin, ${expected + 1} pembayaran menunggu konfirmasi` }), 5000));
await app.screenshot({ path: path.join(SHOTS, 'admin-app-alert.png') });

// ───────────── 3. Straight into the dashboard, no second sign-in ─────────────
await inAppAlert.getByRole('link', { name: 'Buka' }).click();
await app.waitForURL(/\/admin$/, { timeout: 15000 });
check('dashboard terbuka dari aplikasi tanpa masuk ulang', await seen(app.getByRole('tab', { name: 'Pembayaran' }), 30000));
const queue = app.locator('#antrean-konfirmasi');
check('dashboard: antrean memuat kedua pembayar', await seen(queue.getByText('Pembayar Satu')) && await seen(queue.getByText('Pembayar Dua')));
check('dashboard: panel Notifikasi HP tampil', await seen(app.getByText('Notifikasi HP')));
await app.waitForTimeout(1500);
await reportPayment('Pembayar Tiga');
check('dashboard: pemberitahuan pembayaran baru muncul sendiri (tanpa muat ulang)', await seen(app.getByRole('status').filter({ hasText: 'Pembayaran baru: Pembayar Tiga · Rp58.500' }), 40000));
check('dashboard: antrean ikut diperbarui', await seen(queue.getByText('Pembayar Tiga'), 5000));
await app.screenshot({ path: path.join(SHOTS, 'admin-dashboard-alert.png'), fullPage: true });

// ───────────── 4. Phone notifications ─────────────
// Headless Chromium reports notifications as "denied" whatever is granted and
// has no push service, so subscribing can only be proven on a real phone.
// Here: the panel explains a blocked state clearly, and the admin worker
// installs and activates in its own /admin/ scope.
const panel = app.locator('div', { has: app.getByText('Notifikasi HP') }).filter({ has: app.getByRole('button') }).last();
const permission = await app.evaluate(() => Notification.permission);
if (permission === 'denied') {
  check('notifikasi: status "Diblokir" dengan petunjuk membuka pengaturan HP', await seen(panel.getByText('Diblokir')) && await seen(panel.getByText(/Buka pengaturan HP/)) && await panel.getByRole('button', { name: 'Aktifkan notifikasi' }).isDisabled());
} else {
  await panel.getByRole('button', { name: 'Aktifkan notifikasi' }).click();
  const result = panel.getByRole('status');
  check('notifikasi: tombol memberi hasil yang jelas', await seen(result, 30000), await result.innerText().catch(() => ''));
}
const worker = await app.evaluate(async () => {
  const reg = await navigator.serviceWorker.register('/admin-sw.js', { scope: '/admin/' });
  const w = reg.active ?? reg.installing ?? reg.waiting;
  if (w && w.state !== 'activated') await new Promise((r) => { w.addEventListener('statechange', () => { if (w.state === 'activated') r(); }); setTimeout(r, 10000); });
  const again = await navigator.serviceWorker.getRegistration('/admin/');
  return { scope: new URL(again.scope).pathname, script: new URL(again.active.scriptURL).pathname, state: again.active.state };
});
check('notifikasi: service worker admin aktif dengan cakupan /admin/', worker.scope === '/admin/' && worker.script === '/admin-sw.js' && worker.state === 'activated', JSON.stringify(worker));
await app.context().close();

// ───────────── 5. Learners and signed-out visitors ─────────────
{
  const learner = await account(`biasa${stamp}@lentera.test`, 'Pelajar Biasa');
  const page = await open(learner);
  await page.goto(`${BASE}/app`);
  await page.getByRole('link', { name: 'Beranda' }).first().waitFor({ timeout: 45000 });
  await page.waitForTimeout(1500);
  check('pelajar: tidak ada tombol Admin', (await page.getByRole('link', { name: /^Dashboard admin/ }).count()) === 0);
  const sub = await post('/api/push', { action: 'subscribe', subscription: { endpoint: 'https://push.example.test/x', keys: { p256dh: 'B'.repeat(87), auth: 'A'.repeat(22) } } }, learner.token);
  check('pelajar: tidak bisa mendaftarkan HP untuk notifikasi admin', sub.status === 403, String(sub.status));
  check('pelajar: tidak bisa membaca jumlah antrean', (await post('/api/admin', { action: 'pending-count' }, learner.token)).status === 403);
  await page.context().close();
}
{
  const page = await open(null);
  await page.goto(`${BASE}/admin`);
  const signIn = page.getByRole('link', { name: 'Masuk' }).last();
  await signIn.waitFor({ timeout: 30000 });
  check('tamu: tombol Masuk di /admin membawa kembali ke dashboard', (await signIn.getAttribute('href')) === '/masuk?next=/admin');
  await signIn.click();
  await page.getByLabel('Email').fill(ADMIN);
  await page.getByLabel('Kata sandi').fill(PASSWORD);
  await page.getByRole('button', { name: 'Masuk' }).click();
  await page.waitForURL(/\/admin$/, { timeout: 30000 }).catch(() => {});
  const formError = await page.locator('p[role=alert]').innerText().catch(() => '');
  check('admin yang baru masuk langsung kembali ke /admin', new URL(page.url()).pathname === '/admin' && await seen(page.getByRole('tab', { name: 'Pembayaran' }), 30000), `${page.url()} ${formError}`);
  await page.context().close();
}

check('tidak ada error di konsol browser', issues.length === 0, issues.slice(0, 5).join(' | '));
await browser.close();
console.log(process.exitCode ? '\nADA YANG GAGAL' : '\nSEMUA LOLOS');
