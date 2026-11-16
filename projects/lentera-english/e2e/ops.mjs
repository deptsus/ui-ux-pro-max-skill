// End-to-end check of Rilis 9 "Aman & Terukur": security headers and CSP (no
// violations on real pages), error reports from the browser to /admin, the
// contact form, the admin Analitik and Kesehatan tabs, backups (scheduled
// endpoint closed, backup now, download), and account deletion.
//
// Needs a production build served with the embedded backend and the admin
// address set (see e2e/admin-app.mjs).
import { createHmac } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import { BASE, check, chromium } from './lib.mjs';

const SHOTS = process.env.E2E_SHOTS ?? path.join(import.meta.dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const stamp = Date.now();
const PASSWORD = 'rahasia-12345';
const ADMIN = process.env.E2E_ADMIN_EMAIL ?? 'admin@lentera.test';

const call = async (url, body, token, method) => {
  const res = await fetch(BASE + url, { method: method ?? (body === undefined ? 'GET' : 'POST'), headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: res.status, headers: res.headers, data: await res.json().catch(() => ({})) };
};
const account = async (email, name) => {
  let r = await call('/api/dev-auth', { action: 'signin', email, password: PASSWORD });
  if (r.status !== 200) r = await call('/api/dev-auth', { action: 'signup', email, password: PASSWORD, name });
  if (r.status !== 200) throw new Error(`cannot sign in ${email}: ${JSON.stringify(r.data)}`);
  return r.data;
};

// ───────────── 1. Headers and closed endpoints ─────────────
{
  const res = await fetch(`${BASE}/app`);
  const h = (k) => res.headers.get(k) ?? '';
  check('header keamanan: CSP tanpa eval, anti-framing, HSTS, nosniff, izin mikrofon terbatas',
    h('content-security-policy').includes("frame-ancestors 'none'") && h('content-security-policy').includes("object-src 'none'") && !h('content-security-policy').includes('unsafe-eval')
    && /max-age=\d+/.test(h('strict-transport-security')) && h('x-frame-options') === 'DENY' && h('x-content-type-options') === 'nosniff'
    && h('permissions-policy').includes('microphone=(self)') && !res.headers.has('x-powered-by'), JSON.stringify(Object.fromEntries(res.headers)));
  check('cadangan terjadwal menolak tanpa tanda tangan (403)', (await call('/api/cron/backup', {})).status === 403);
  const sig = createHmac('sha256', 'lentera-dev-cron').update(`backup:${new Date().toISOString().slice(0, 10)}`).digest('hex');
  const ok = await fetch(`${BASE}/api/cron/backup`, { method: 'POST', headers: { 'x-lentera-cron': sig } });
  const okBody = await ok.json().catch(() => ({}));
  check('cadangan terjadwal berjalan dengan tanda tangan yang benar', ok.status === 200 && /^daily\/\d{4}-\d{2}-\d{2}\.json\.gz$/.test(okBody.name) && okBody.rows > 0, JSON.stringify(okBody));
  const again = await fetch(`${BASE}/api/cron/backup`, { method: 'POST', headers: { 'x-lentera-cron': sig } }).then((r) => r.json()).catch(() => ({}));
  check('cadangan terjadwal hanya sekali per hari (panggilan ulang dilewati)', again.skipped === 'ran-today', JSON.stringify(again));
  check('dashboard admin menolak tamu (401)', (await call('/api/admin', { action: 'health' })).status === 401);
}

const admin = await account(ADMIN, 'Admin Uji');
const browser = await chromium.launch();
const issues = [];
async function pageFor(session, viewport = { width: 1280, height: 900 }) {
  const ctx = await browser.newContext({ viewport, acceptDownloads: true });
  // Only on the first page of the tab, so signing out (or deleting the account) sticks.
  await ctx.addInitScript((s) => { if (s && !sessionStorage.getItem('e2e-init')) { sessionStorage.setItem('e2e-init', '1'); localStorage.setItem('lentera.session', JSON.stringify(s)); } }, session);
  const p = await ctx.newPage();
  p.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    // Our own deliberate test error and handled API refusals are not problems.
    if (/Uji error e2e|status of 40[0-9]/.test(t)) return;
    issues.push(`${new URL(p.url()).pathname}: ${t.slice(0, 200)}`);
  });
  p.on('pageerror', (e) => { if (!/Uji error e2e/.test(e.message)) issues.push(`pageerror: ${e.message}`); });
  return p;
}

// ───────────── 2. Public pages under the CSP ─────────────
const g = await pageFor(null, { width: 390, height: 844 });
try {
  for (const url of ['/', '/privasi', '/kontak', '/app', '/app/shadowing', '/app/settings']) {
    await g.goto(BASE + url);
    await g.locator('main, h1').first().waitFor({ timeout: 45000 });
    await g.waitForTimeout(800);
  }
  check('halaman publik dan aplikasi tanpa pelanggaran CSP atau error konsol', issues.length === 0, issues.slice(0, 3).join(' | '));
  await g.goto(`${BASE}/privasi`);
  check('kebijakan privasi: data yang disimpan, hak menghapus akun, rekaman tidak diunggah', await g.getByRole('heading', { name: 'Kebijakan Privasi' }).isVisible() && await g.getByText(/tidak pernah diunggah/).isVisible() && await g.getByRole('link', { name: /Pengaturan → Hapus akun/ }).isVisible());

  // Contact form as a guest.
  await g.goto(`${BASE}/kontak?topik=bug`);
  await g.getByLabel('Nama').fill('Penguji Kontak');
  await g.getByLabel(/Email atau nomor WhatsApp/).fill('penguji@contoh.test');
  await g.getByLabel('Pesan').fill(`Tombol di halaman PR tidak bisa ditekan ${stamp}.`);
  check('formulir kontak: topik dari tautan sudah terpilih', await g.getByRole('radio', { name: 'Laporan masalah' }).isChecked());
  await g.getByRole('button', { name: 'Kirim pesan' }).click();
  await g.getByText('Pesanmu sudah terkirim. Terima kasih!').waitFor({ timeout: 15000 });
  check('formulir kontak terkirim', true);
  check('formulir kontak muat di layar 390 px', (await g.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0);
  check('formulir kontak menolak bot (isian tersembunyi diabaikan) dan input kosong', (await call('/api/contact', { topic: 'umum', name: 'Bot', message: 'spam spam', website: 'http://spam.test' })).status === 200 && (await call('/api/contact', { topic: 'umum', name: '', message: 'x' })).status === 400);

  // A crash in the browser reaches the owner.
  await g.goto(`${BASE}/app`);
  await g.locator('main').first().waitFor({ timeout: 45000 });
  await g.evaluate(() => setTimeout(() => { throw new Error('Uji error e2e dari browser'); }, 0));
  await g.waitForTimeout(1500);
} catch (e) {
  await g.screenshot({ path: path.join(SHOTS, 'ops-gagal-publik.png'), fullPage: true }).catch(() => {});
  check('halaman publik: macet', false, String(e.message).split('\n')[0].slice(0, 200));
}

// ───────────── 3. Admin: Kesehatan and Analitik ─────────────
const a = await pageFor(admin);
try {
  await a.goto(`${BASE}/admin?tab=health`);
  const panel = a.locator('#panel-health');
  await panel.getByRole('heading', { name: 'Kesehatan aplikasi' }).waitFor({ timeout: 45000 });
  check('tautan notifikasi membuka tab Kesehatan langsung', await a.getByRole('tab', { name: /Kesehatan/ }).getAttribute('aria-selected') === 'true');
  await panel.getByText('Uji error e2e dari browser').first().waitFor({ timeout: 15000 });
  check('error dari browser pelajar muncul di Kesehatan (sumber Aplikasi)', await panel.locator('li', { hasText: 'Uji error e2e dari browser' }).getByText('Aplikasi').count() >= 1);
  check('pesan Hubungi Kami muncul di Kesehatan', await panel.getByText(`Tombol di halaman PR tidak bisa ditekan ${stamp}.`).isVisible());
  check('pemakaian paket Free dan kartu verifikasi 2 langkah tampil', await panel.getByText('Pemakaian paket Supabase Free').isVisible() && await panel.getByText(/Tersedia di server dengan Supabase/).isVisible());
  await panel.locator('li', { hasText: 'Uji error e2e dari browser' }).getByRole('button', { name: 'Tandai selesai' }).click();
  await panel.getByText(/Ditandai selesai/).waitFor({ timeout: 15000 });
  check('error bisa ditandai selesai', await panel.getByText('Uji error e2e dari browser').waitFor({ state: 'detached', timeout: 15000 }).then(() => true, () => false));

  await panel.getByRole('button', { name: 'Buat cadangan sekarang' }).click();
  await panel.getByText(/Cadangan dibuat: [\d.]+ baris/).waitFor({ timeout: 30000 });
  const today = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
  const dl = a.waitForEvent('download', { timeout: 20000 });
  await panel.getByRole('button', { name: today }).click();
  const file = await (await dl).path();
  const json = JSON.parse(gunzipSync(fs.readFileSync(file)).toString('utf8'));
  check('cadangan dibuat dari dashboard dan bisa diunduh (berisi tabel pelajar, tanpa kata sandi)', json.format === 'lentera-backup' && Array.isArray(json.tables.profiles) && !JSON.stringify(json).includes('encrypted_password'), Object.keys(json.tables ?? {}).length);
  await a.screenshot({ path: path.join(SHOTS, 'ops-kesehatan.png'), fullPage: true });

  await a.getByRole('tab', { name: /Analitik/ }).click();
  const an = a.locator('#panel-analytics');
  await an.getByRole('heading', { name: 'Analitik pelajar' }).waitFor({ timeout: 30000 });
  const funnel = an.getByRole('list', { name: 'Corong pelajar' });
  check('Analitik: corong 5 langkah dari mendaftar sampai Premium', (await funnel.getByRole('listitem').count()) === 5 && (await funnel.innerText()).includes('Membeli Premium'));
  check('Analitik: tabel kohort mingguan dan pelajar aktif', await an.getByText('Kohort mingguan (minggu mendaftar, WIB)').isVisible() && await an.getByText('Aktif 7 hari').isVisible());
  await a.screenshot({ path: path.join(SHOTS, 'ops-analitik.png'), fullPage: true });
} catch (e) {
  await a.screenshot({ path: path.join(SHOTS, 'ops-gagal-admin.png'), fullPage: true }).catch(() => {});
  check('admin: macet', false, String(e.message).split('\n')[0].slice(0, 200));
}

// ───────────── 4. Account deletion ─────────────
const student = await account(`hapus${stamp}@lentera.test`, 'Siswa Hapus');
await call('/api/sync', { events: [{ id: `del-${stamp}`, kind: 'xp', at: Date.now(), data: { amount: 10, reason: 'lesson' } }], snapshot: null, updatedAt: 1 }, student.token);
const s = await pageFor(student, { width: 390, height: 844 });
try {
  check('akun admin tidak bisa dihapus lewat aplikasi (403)', (await call('/api/me', { confirm: 'HAPUS' }, admin.token, 'DELETE')).status === 403);
  check('hapus akun butuh konfirmasi HAPUS', (await call('/api/me', { confirm: 'ya' }, student.token, 'DELETE')).status === 400);
  await s.goto(`${BASE}/app/settings`);
  await s.getByRole('button', { name: 'Hapus akun saya' }).click({ timeout: 45000 });
  const del = s.getByRole('button', { name: 'Hapus akun selamanya' });
  check('tombol hapus nonaktif sebelum mengetik HAPUS', await del.isDisabled());
  await s.getByLabel('Ketik HAPUS untuk mengonfirmasi').fill('hapus');
  await del.click();
  await s.waitForURL(/akun=dihapus/, { timeout: 20000 });
  const me = await call('/api/me', undefined, student.token);
  check('setelah dihapus, akun dan progresnya hilang dari server', me.data.user === null, JSON.stringify(me.data.user));
  check('perangkat keluar dari akun setelah dihapus', await s.evaluate(() => localStorage.getItem('lentera.session') === null));
} catch (e) {
  await s.screenshot({ path: path.join(SHOTS, 'ops-gagal-hapus.png'), fullPage: true }).catch(() => {});
  check('hapus akun: macet', false, String(e.message).split('\n')[0].slice(0, 200));
}

// Last, because it uses up this address's error-report quota.
{
  const errStatuses = [];
  for (let i = 0; i < 32; i++) errStatuses.push((await call('/api/errors', { message: `Uji batas ${i}`, path: '/uji' })).status);
  check('laporan error dibatasi per alamat (30 per 10 menit, lalu 429)', errStatuses.filter((s) => s === 200).length <= 30 && errStatuses.at(-1) === 429, errStatuses.join(','));
}

check('tanpa error di konsol (termasuk pelanggaran CSP)', issues.length === 0, issues.slice(0, 3).join(' | '));
await browser.close();
console.log(process.exitCode === 1 ? '\nADA YANG GAGAL' : '\nSEMUA LOLOS');
