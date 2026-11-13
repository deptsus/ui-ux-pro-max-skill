// End-to-end check of the admin dashboard (/admin) through the real UI.
//
// Needs a server with a FRESH embedded database and the admin address set:
//   LENTERA_BACKEND=embedded LENTERA_DEV_ADMIN_EMAIL=admin@lentera.test \
//   LENTERA_DATA_DIR=/tmp/lentera-e2e/pglite npx next dev -p 3100
//   node e2e/admin.mjs
import fs from 'node:fs';
import path from 'node:path';
import { BASE, check, chromium } from './lib.mjs';

const SHOTS = process.env.E2E_SHOTS ?? path.join(import.meta.dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const stamp = Date.now();
const LEARNER = `siswa${stamp}@lentera.test`;
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

const browser = await chromium.launch();
const issues = [];
const adminCalls = [];
async function open(session, viewport = { width: 1366, height: 900 }) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  if (session) await ctx.addInitScript((s) => localStorage.setItem('lentera.session', JSON.stringify(s)), session);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !/status of 40[13]/.test(m.text())) issues.push(m.text()); });
  page.on('pageerror', (e) => issues.push(`pageerror: ${e.message}`));
  page.on('request', (r) => { if (r.url().endsWith('/api/admin')) adminCalls.push(session?.email ?? 'guest'); });
  return page;
}
// Inactive panels stay mounted (hidden), so every locator is scoped to the open one.
const PANEL = { Pembayaran: '#panel-payments', Konten: '#panel-content', Terbitkan: '#panel-publish' };
let page;
let ui;
const tab = async (name) => {
  await page.getByRole('tab', { name }).click();
  ui = page.locator(PANEL[name]);
};
const tile = async (_, label) => (await ui.locator('div.rounded-2xl', { has: page.getByText(label, { exact: true }) }).last().locator('p').nth(1).innerText()).trim();

// ───────────── 1. Access gate ─────────────
{
  const page = await open(null);
  await page.goto(`${BASE}/admin`);
  await page.getByRole('heading', { name: 'Masuk sebagai admin' }).waitFor({ timeout: 30000 });
  check('tamu melihat ajakan masuk, bukan dashboard', (await page.getByRole('tab').count()) === 0);
  await page.context().close();
}
const learner = await account(LEARNER, 'Siswa Uji');
{
  const page = await open(learner);
  await page.goto(`${BASE}/admin`);
  await page.getByRole('heading', { name: 'Akses ditolak' }).waitFor({ timeout: 30000 });
  check('non-admin ditolak di halaman', (await page.getByRole('tab').count()) === 0);
  check('non-admin tidak memicu permintaan data admin', !adminCalls.includes(LEARNER), adminCalls.join(','));
  check('API menolak non-admin dengan 403', (await post('/api/admin', { action: 'payments' }, learner.token)).status === 403);
  await page.context().close();
}

// ───────────── 2. Payment data to look at ─────────────
const paid = await post('/api/payments', { planId: 'premium_yearly', channel: 'QRIS' }, learner.token);
check('checkout QRIS dibuat', paid.status === 200, JSON.stringify(paid.data));
const sim = await post(`/api/payments/${paid.data.transaction.id}`, { action: 'simulate' }, learner.token);
check('simulasi bayar diterima', sim.status === 200, JSON.stringify(sim.data));
for (let i = 0; i < 20; i++) {
  if ((await get(`/api/payments/${paid.data.transaction.id}`, learner.token)).transaction?.status === 'SUCCEEDED') break;
  await new Promise((r) => setTimeout(r, 500));
}
const pendingTx = await post('/api/payments', { planId: 'premium_monthly', channel: 'DANA' }, learner.token);
check('checkout DANA dibuat (tertunda)', pendingTx.status === 200, JSON.stringify(pendingTx.data));

// ───────────── 3. Payments tab ─────────────
const adminUser = await account(ADMIN, 'Admin Uji');
page = await open(adminUser);
ui = page.locator(PANEL.Pembayaran);
await page.goto(`${BASE}/admin`);
await page.getByRole('tab', { name: 'Pembayaran' }).waitFor({ timeout: 30000 });
await ui.getByRole('heading', { name: 'Riwayat pembayaran' }).waitFor({ timeout: 30000 });
const overview = (await post('/api/admin', { action: 'payments' }, adminUser.token)).data;
check('tile total pengguna cocok dengan server', await tile(page, 'Total pengguna terdaftar') === overview.users.total.toLocaleString('id-ID'));
check('tile Premium aktif cocok dengan server', await tile(page, 'Premium aktif') === String(overview.users.premium) && overview.users.premium >= 1);
check('tile pendapatan bulan ini cocok dengan server', (await tile(page, 'Bulan ini')).replace(/\D/g, '') === String(overview.revenue.month) && Number(overview.revenue.month) >= 585000, await tile(page, 'Bulan ini'));
check('tile transaksi berhasil dan tertunda', await tile(page, 'Berhasil') === String(overview.transactions.succeeded) && await tile(page, 'Tertunda') === String(overview.transactions.pending) && overview.transactions.pending >= 1);
const historyRows = ui.locator('section', { has: page.getByRole('heading', { name: 'Riwayat pembayaran' }) }).locator('tbody tr');
check('riwayat memuat transaksi QRIS berhasil', await historyRows.filter({ hasText: 'QRIS' }).filter({ hasText: 'Berhasil' }).filter({ hasText: 'Rp585.000' }).count() >= 1);
await ui.getByLabel('Status').selectOption('PENDING');
check('filter status menyisakan transaksi tertunda saja', (await historyRows.count()) === overview.transactions.pending && (await historyRows.filter({ hasText: 'Berhasil' }).count()) === 0);
await ui.getByLabel('Status').selectOption('');
check('masa aktif Premium menampilkan pelanggan', await ui.locator('section', { has: page.getByRole('heading', { name: 'Masa aktif Premium' }) }).locator('tbody tr', { hasText: 'Siswa Uji' }).filter({ hasText: 'Premium Tahunan' }).count() >= 1);
check('log webhook mencatat aktivasi', await ui.locator('section', { has: page.getByRole('heading', { name: 'Webhook', exact: true }) }).locator('tbody tr', { hasText: 'Premium diaktifkan' }).count() >= 1);
check('grafik pendapatan per bulan tampil', await ui.getByRole('img', { name: /Pendapatan per bulan/ }).count() === 1);
await ui.getByRole('button', { name: 'Lihat tabel' }).click();
check('tampilan tabel grafik memuat pendapatan bulan ini', await ui.locator('section', { has: page.getByRole('heading', { name: 'Pendapatan', exact: true }) }).locator('tbody tr').filter({ hasText: /Rp[1-9]/ }).count() >= 1);
await ui.getByRole('button', { name: 'Lihat grafik' }).click();
await page.screenshot({ path: path.join(SHOTS, 'admin-payments.png'), fullPage: true });

// ───────────── 4. CMS: edit a lesson ─────────────
await tab('Konten');
const nav = page.getByRole('navigation', { name: 'Jenis konten' });
const rows = (await post('/api/admin', { action: 'content' }, adminUser.token)).data;
check('daftar pelajaran sesuai isi basis data', await ui.getByText(`${rows.lessons.length} pelajaran`, { exact: true }).count() === 1);
check('jumlah soal di navigasi sesuai basis data', (await nav.getByRole('button', { name: /^Soal/ }).innerText()).includes(String(rows.questions.length)));
await page.screenshot({ path: path.join(SHOTS, 'admin-content-list.png') });
await ui.getByRole('button', { name: /Sapaan dan Perkenalan/ }).first().click();
await ui.getByRole('heading', { name: 'Edit pelajaran' }).waitFor();
const summary = `Ringkasan uji ${stamp}`;
await ui.getByLabel('Ringkasan').fill(summary);
check('editor menandai perubahan belum disimpan', await ui.getByText('Belum disimpan', { exact: true }).count() === 1);
await page.screenshot({ path: path.join(SHOTS, 'admin-lesson-editor.png'), fullPage: true });
await ui.getByRole('button', { name: 'Simpan', exact: true }).click();
await ui.getByText(/^Tersimpan\./).waitFor({ timeout: 15000 });
const afterEdit = (await post('/api/admin', { action: 'content' }, adminUser.token)).data;
check('ringkasan pelajaran tersimpan di basis data', afterEdit.lessons.find((l) => l.id === 'a1-greetings').summary === summary);
check('materi dan tujuan pelajaran tidak berubah oleh penyimpanan', JSON.stringify(afterEdit.lessons.find((l) => l.id === 'a1-greetings').teaching) === JSON.stringify(rows.lessons.find((l) => l.id === 'a1-greetings').teaching) && JSON.stringify(afterEdit.lessons.find((l) => l.id === 'a1-greetings').objectives) === JSON.stringify(rows.lessons.find((l) => l.id === 'a1-greetings').objectives));
check('pelajar belum menerima perubahan sebelum terbit', !(await get('/api/content')).pack.lessons.some((l) => l.summary === summary));

// Jump to the lesson's questions and try an invalid edit.
const firstQuestions = rows.questions.filter((q) => q.lesson_id === 'a1-greetings');
await ui.getByRole('button', { name: new RegExp(`Soal pelajaran ini \\(${firstQuestions.length}\\)`) }).click();
check('tautan terkait membuka soal pelajaran itu saja', await ui.getByText(`${firstQuestions.length} soal dari ${rows.questions.length}`, { exact: true }).count() === 1);
const mc = firstQuestions.find((q) => q.type === 'mc');
await ui.getByLabel('Cari soal').fill(mc.id);
await ui.locator('ul > li > button', { hasText: mc.id }).first().click();
await ui.getByRole('heading', { name: 'Edit soal' }).waitFor();
check('editor soal menampilkan semua pilihan jawaban', await ui.getByLabel(/^Teks pilihan \d+$/).count() === mc.options.length);
const wrongIndex = mc.options.findIndex((o) => !o.correct) + 1;
await ui.getByLabel(`Alasan pilihan ${wrongIndex} salah`).fill('');
await ui.getByRole('button', { name: 'Simpan', exact: true }).click();
check('pilihan salah tanpa alasan ditolak sebelum dikirim', await ui.getByText('Setiap pilihan yang salah wajib punya alasan kenapa salah.').count() === 1);
await ui.getByRole('button', { name: /Kembali ke daftar/ }).click();
await ui.getByRole('button', { name: 'Buang perubahan', exact: true }).click();
const untouched = (await post('/api/admin', { action: 'content' }, adminUser.token)).data.questions.find((q) => q.id === mc.id);
check('soal tidak berubah setelah perubahan dibuang', JSON.stringify(untouched) === JSON.stringify(mc));

// ───────────── 5. CMS: create and delete a question ─────────────
const newId = `a1-greetings.x${stamp}`;
await ui.getByRole('button', { name: 'Tambah soal' }).click();
await ui.getByRole('heading', { name: 'Soal baru' }).waitFor();
await ui.locator('#cms-new-id').fill(newId);
await ui.getByLabel(/^Topik\s*\*?$/).selectOption(mc.topic_id);
await ui.getByLabel('Instruksi soal').fill('Pilih sapaan yang tepat untuk pagi hari.');
await ui.getByLabel('Teks pilihan 1').fill('Good morning');
await ui.getByLabel('Teks pilihan 2').fill('Good night');
await ui.getByLabel('Alasan pilihan 2 salah').fill('"Good night" diucapkan saat berpisah di malam hari.');
await ui.getByLabel('Pembahasan').fill('Pagi hari memakai "Good morning".');
await ui.getByRole('button', { name: 'Simpan', exact: true }).click();
await ui.getByText(/^Tersimpan\./).waitFor({ timeout: 15000 });
const created = (await post('/api/admin', { action: 'content' }, adminUser.token)).data.questions.find((q) => q.id === newId);
check('soal baru tersimpan sebagai draf dengan pelajaran dari filter', created?.status === 'draft' && created.lesson_id === 'a1-greetings' && created.options.length === 2 && created.options[0].correct === true && created.options[1].why.includes('Good night'));
await page.screenshot({ path: path.join(SHOTS, 'admin-question-editor.png'), fullPage: true });
await ui.getByRole('button', { name: 'Hapus', exact: true }).click();
await ui.getByRole('button', { name: 'Hapus permanen' }).click();
await ui.getByRole('button', { name: 'Tambah soal' }).waitFor({ timeout: 15000 });
check('soal terhapus dari basis data', !(await post('/api/admin', { action: 'content' }, adminUser.token)).data.questions.some((q) => q.id === newId));

// ───────────── 6. Quality gate, publish, rollback ─────────────
// A published lesson without mastery questions passes the form checks but must be stopped by the gate.
const badLesson = `e2e-lesson-${stamp}`;
await nav.getByRole('button', { name: /^Pelajaran/ }).click();
await ui.getByRole('button', { name: 'Tambah pelajaran' }).click();
await ui.locator('#cms-new-id').fill(badLesson);
await ui.getByLabel(/^Unit\s*\*?$/).selectOption(rows.lessons[0].unit_id);
await ui.getByLabel('Urutan dalam unit').fill('99');
await ui.getByLabel('Judul pelajaran').fill('Pelajaran uji gerbang kualitas');
await ui.getByLabel('Topik yang dilatih').selectOption(rows.lessons[0].topic_id);
await ui.getByLabel(/^Status\s*\*?$/).selectOption('published');
await ui.getByLabel('Pengantar (langkah 1)').fill('Pengantar uji.');
await ui.getByRole('button', { name: 'Tambah bagian materi' }).click();
await ui.getByLabel('Judul bagian 1').fill('Bagian uji');
await ui.getByLabel('Penjelasan bagian 1').fill('Penjelasan uji.');
await ui.getByRole('button', { name: 'Simpan', exact: true }).click();
await ui.getByText(/^Tersimpan\./).waitFor({ timeout: 15000 });

await tab('Terbitkan');
await ui.getByText(/Versi 1 · Kurikulum bawaan/).first().waitFor({ timeout: 15000 });
check('tab Terbitkan mengingatkan ada perubahan belum terbit', await ui.getByText(/Ada perubahan yang kamu simpan/).isVisible());
await ui.getByLabel('Label versi (opsional)').fill(`Uji ${stamp}`);
await ui.getByRole('button', { name: 'Periksa dan terbitkan' }).click();
await ui.getByRole('button', { name: 'Terbitkan', exact: true }).click();
await ui.getByText(/Belum diterbitkan: 1 masalah ditemukan/).waitFor({ timeout: 20000 });
check('gerbang kualitas menolak dan menyebut pelajaran bermasalah', await ui.getByText(`${badLesson}: pelajaran terbit tanpa soal tes penguasaan`).count() === 1);
check('versi pelajar tidak berubah saat ditolak', (await get('/api/content')).pack.version === 'db-1');
await page.screenshot({ path: path.join(SHOTS, 'admin-publish-problems.png'), fullPage: true });
await ui.getByRole('button', { name: 'Buka', exact: true }).click();
ui = page.locator(PANEL.Konten); // the dashboard switches to the Konten tab by itself
await ui.getByRole('heading', { name: 'Edit pelajaran' }).waitFor();
check('tombol Buka membawa ke pelajaran yang bermasalah', await ui.getByText(`ID: ${badLesson}`).count() === 1);
await ui.getByLabel(/^Status\s*\*?$/).selectOption('draft');
await ui.getByRole('button', { name: 'Simpan', exact: true }).click();
await ui.getByText(/^Tersimpan\./).waitFor({ timeout: 15000 });

await tab('Terbitkan');
await ui.getByRole('button', { name: 'Periksa dan terbitkan' }).click();
await ui.getByRole('button', { name: 'Terbitkan', exact: true }).click();
await ui.getByText(/Versi 2 terbit/).waitFor({ timeout: 30000 });
check('riwayat versi menandai versi 2 dipakai pelajar', await ui.locator('li', { hasText: `Versi 2 · Uji ${stamp}` }).getByText('Dipakai pelajar').count() === 1);
const live = (await get('/api/content')).pack;
check('pelajar menerima ringkasan baru setelah terbit', live.version === 'db-2' && live.lessons.find((l) => l.id === 'a1-greetings').summary === summary);
check('pelajaran draf tidak ikut terbit', !live.lessons.some((l) => l.id === badLesson));
await page.screenshot({ path: path.join(SHOTS, 'admin-publish-done.png'), fullPage: true });

await ui.locator('li', { hasText: 'Versi 1 · Kurikulum bawaan' }).getByRole('button', { name: 'Pulihkan' }).click();
await ui.getByRole('button', { name: 'Pulihkan', exact: true }).last().click();
await ui.getByText(/Versi 1 \(Kurikulum bawaan\) sekarang menjadi versi/).waitFor({ timeout: 20000 });
const rolled = (await get('/api/content')).pack;
check('rollback mengembalikan pelajar ke versi 1', rolled.version === 'db-1' && rolled.lessons.find((l) => l.id === 'a1-greetings').summary !== summary);
check('rollback tidak mengubah konten kerja', (await post('/api/admin', { action: 'content' }, adminUser.token)).data.lessons.find((l) => l.id === 'a1-greetings').summary === summary);

// Clean up the throwaway lesson through the UI (delete confirmation path for lessons).
await tab('Konten');
await ui.getByRole('button', { name: /Kembali ke daftar/ }).click();
await ui.getByLabel('Cari pelajaran').fill('uji gerbang');
await ui.getByRole('button', { name: /Pelajaran uji gerbang kualitas/ }).click();
await ui.getByRole('button', { name: 'Hapus', exact: true }).click();
await ui.getByRole('button', { name: 'Hapus permanen' }).click();
await ui.getByRole('button', { name: 'Tambah pelajaran' }).waitFor({ timeout: 15000 });
check('pelajaran uji terhapus', !(await post('/api/admin', { action: 'content' }, adminUser.token)).data.lessons.some((l) => l.id === badLesson));

// ───────────── 7. Phone layout ─────────────
{
  const phone = await open(adminUser, { width: 390, height: 844 });
  await phone.goto(`${BASE}/admin`);
  await phone.locator('#panel-payments').getByRole('heading', { name: 'Riwayat pembayaran' }).waitFor({ timeout: 30000 });
  const overflow = () => phone.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check('halaman pembayaran tidak melebar di layar ponsel', (await overflow()) <= 1, String(await overflow()));
  await phone.screenshot({ path: path.join(SHOTS, 'admin-payments-phone.png'), fullPage: true });
  await phone.getByRole('tab', { name: 'Konten' }).click();
  await phone.locator('#panel-content').getByRole('combobox', { name: 'Jenis konten' }).selectOption('questions');
  await phone.locator('#panel-content ul.divide-y > li > button').first().click();
  await phone.locator('#panel-content').getByRole('heading', { name: 'Edit soal' }).waitFor();
  check('editor soal tidak melebar di layar ponsel', (await overflow()) <= 1, String(await overflow()));
  await phone.screenshot({ path: path.join(SHOTS, 'admin-question-phone.png'), fullPage: true });
  await phone.context().close();
}

check('tidak ada error di konsol browser', issues.length === 0, issues.slice(0, 5).join(' | '));
await browser.close();
console.log(process.exitCode ? '\nADA YANG GAGAL' : '\nSEMUA LOLOS');
