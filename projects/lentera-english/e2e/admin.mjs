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
// Manual QRIS: the learner opens a checkout and reports paying; a second checkout stays unreported.
const yearly = await post('/api/payments', { planId: 'premium_yearly' }, learner.token);
check('checkout QRIS tahunan dibuat dengan harga server', yearly.status === 200 && yearly.data.transaction.amount_idr === 497250 && yearly.data.transaction.method === 'manual_qris', JSON.stringify(yearly.data).slice(0, 200));
const claim = await post(`/api/payments/${yearly.data.transaction.id}`, { action: 'claim', payerName: 'Siswa Uji', note: 'Dibayar pakai DANA' }, learner.token);
check('pelajar melaporkan pembayaran', claim.status === 200 && claim.data.transaction.status === 'AWAITING_CONFIRMATION', JSON.stringify(claim.data).slice(0, 200));
const pendingTx = await post('/api/payments', { planId: 'premium_monthly' }, learner.token);
check('checkout bulanan dibuat tanpa dilaporkan', pendingTx.status === 200 && pendingTx.data.transaction.status === 'PENDING', JSON.stringify(pendingTx.data).slice(0, 200));
check('laporan saja tidak mengaktifkan Premium', (await get('/api/me', learner.token)).user.entitlement.premium === false);

// ───────────── 3. Payments tab ─────────────
const adminUser = await account(ADMIN, 'Admin Uji');
page = await open(adminUser);
ui = page.locator(PANEL.Pembayaran);
await page.goto(`${BASE}/admin`);
await page.getByRole('tab', { name: 'Pembayaran' }).waitFor({ timeout: 30000 });
await ui.getByRole('heading', { name: 'Menunggu konfirmasi' }).waitFor({ timeout: 30000 });
const reportedRow = ui.locator('li', { hasText: 'Nama pembayar' }).filter({ hasText: 'Siswa Uji' }).filter({ hasText: 'Rp497.250' });
check('antrean menampilkan pembayaran yang dilaporkan beserta nama dan catatan', await reportedRow.count() === 1 && await reportedRow.getByText('Dibayar pakai DANA').count() === 1);
check('antrean memisahkan checkout yang belum dilaporkan', await ui.getByText(/^Belum dilaporkan \(\d+\)$/).count() === 1 && await ui.getByText(/^Sudah dilaporkan pelajar \(1\)$/).count() === 1);
await page.screenshot({ path: path.join(SHOTS, 'admin-queue.png') });
await reportedRow.getByRole('button', { name: 'Konfirmasi' }).click();
check('dialog konfirmasi mengingatkan untuk mencocokkan mutasi', await page.getByText(/Pastikan dana Rp497\.250 atas nama Siswa Uji sudah masuk/).count() === 1);
await page.getByRole('button', { name: 'Ya, aktifkan Premium' }).click();
await ui.getByText(/Premium Siswa Uji aktif/).waitFor({ timeout: 20000 });
const learnerEnt = (await get('/api/me', learner.token)).user.entitlement;
check('konfirmasi admin mengaktifkan Premium tahunan pelajar', learnerEnt.premium === true && learnerEnt.plan === 'premium_yearly', JSON.stringify(learnerEnt));
await ui.getByRole('heading', { name: 'Riwayat pembayaran' }).waitFor({ timeout: 30000 });
await ui.locator('li', { hasText: 'Nama pembayar' }).filter({ hasText: 'Rp497.250' }).waitFor({ state: 'detached', timeout: 20000 }).catch(() => {});
check('pembayaran yang dikonfirmasi keluar dari antrean', await ui.locator('li', { hasText: 'Nama pembayar' }).filter({ hasText: 'Rp497.250' }).count() === 0);

const overview = (await post('/api/admin', { action: 'payments' }, adminUser.token)).data;
check('tile total pengguna cocok dengan server', await tile(page, 'Total pengguna terdaftar') === overview.users.total.toLocaleString('id-ID'));
check('tile Premium aktif cocok dengan server', await tile(page, 'Premium aktif') === String(overview.users.premium) && overview.users.premium >= 1);
check('tile pendapatan bulan ini cocok dengan server', (await tile(page, 'Bulan ini')).replace(/\D/g, '') === String(overview.revenue.month) && Number(overview.revenue.month) >= 497250, await tile(page, 'Bulan ini'));
check('tile transaksi berhasil dan tertunda', await tile(page, 'Berhasil') === String(overview.transactions.succeeded) && await tile(page, 'Tertunda') === String(overview.transactions.pending) && overview.transactions.pending >= 1);
const historyRows = ui.locator('section', { has: page.getByRole('heading', { name: 'Riwayat pembayaran' }) }).locator('tbody tr');
check('riwayat memuat transaksi QRIS berhasil dengan nama pembayar dan admin', await historyRows.filter({ hasText: 'QRIS' }).filter({ hasText: 'Berhasil' }).filter({ hasText: 'Rp497.250' }).filter({ hasText: 'a.n. Siswa Uji' }).filter({ hasText: 'oleh Admin Uji' }).count() >= 1);
await ui.getByLabel('Status').selectOption('PENDING');
check('filter status menyisakan transaksi tertunda saja', (await historyRows.count()) === overview.transactions.pending && (await historyRows.filter({ hasText: 'Berhasil' }).count()) === 0);
await ui.getByLabel('Status').selectOption('');
check('masa aktif Premium menampilkan pelanggan', await ui.locator('section', { has: page.getByRole('heading', { name: 'Masa aktif Premium' }) }).locator('tbody tr', { hasText: 'Siswa Uji' }).filter({ hasText: 'Premium Tahunan' }).count() >= 1);
check('log pembayaran mencatat keputusan admin', await ui.locator('section', { has: page.getByRole('heading', { name: 'Log pembayaran', exact: true }) }).locator('tbody tr', { hasText: 'Premium diaktifkan' }).filter({ hasText: 'Admin' }).count() >= 1);
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
// The history reloads right after the success message; wait for it instead of counting at once.
check('riwayat versi menandai versi 2 dipakai pelajar', await ui.locator('li', { hasText: `Versi 2 · Uji ${stamp}` }).getByText('Dipakai pelajar').waitFor({ timeout: 10000 }).then(() => true, () => false));
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

// ───────────── 7. The other editors ─────────────
const content = async () => (await post('/api/admin', { action: 'content' }, adminUser.token)).data;
const save = async () => {
  await ui.getByRole('button', { name: 'Simpan', exact: true }).click();
  await ui.getByText(/^Tersimpan\./).waitFor({ timeout: 15000 });
};
const backToList = () => ui.getByRole('button', { name: /Kembali ke daftar/ }).click();
/** Opens a row from the list of a content type, by searching for its id. */
const openRow = async (navName, searchLabel, id) => {
  await nav.getByRole('button', { name: navName }).click();
  await ui.getByLabel(searchLabel).fill(id);
  await ui.locator('ul.divide-y > li > button').first().click();
  await ui.getByRole('heading', { name: /^Edit / }).waitFor();
};
const base = await content();

// Known wrong answers on a typed question: add one, then remove it again.
const typed = base.questions.find((q) => q.type === 'fill' && Object.keys(q.payload.errors ?? {}).length > 0);
const known = Object.keys(typed.payload.errors).length;
await openRow(/^Soal/, 'Cari soal', typed.id);
await ui.getByRole('button', { name: 'Tambah jawaban salah' }).click();
await ui.getByLabel(`Jawaban salah ${known + 1}`, { exact: true }).fill('zzz-e2e');
await save().then(() => check('jawaban salah tanpa penjelasan seharusnya ditolak', false), () => {});
check('jawaban salah yang dikenali wajib punya penjelasan', await ui.getByText('Setiap jawaban salah yang dikenali wajib punya penjelasan.').count() === 1);
await ui.getByLabel(`Penjelasan jawaban salah ${known + 1}`).fill('Penjelasan uji.');
await save();
let q = (await content()).questions.find((x) => x.id === typed.id);
check('jawaban salah baru tersimpan tanpa mengubah yang lama', q.payload.errors['zzz-e2e']?.why === 'Penjelasan uji.' && Object.keys(typed.payload.errors).every((k) => JSON.stringify(q.payload.errors[k]) === JSON.stringify(typed.payload.errors[k])));
await ui.getByRole('button', { name: `Hapus jawaban salah ${known + 1}` }).click();
await save();
check('menghapus jawaban salah mengembalikan soal seperti semula', JSON.stringify((await content()).questions.find((x) => x.id === typed.id)) === JSON.stringify(typed));
await backToList();

// Reordering: swap two pairs of a matching question, then swap back.
const match = base.questions.find((x) => x.type === 'match');
await openRow(/^Soal/, 'Cari soal', match.id);
await ui.getByRole('button', { name: 'Turunkan pasangan 1' }).click();
await save();
q = (await content()).questions.find((x) => x.id === match.id);
check('memindah urutan pasangan tersimpan', JSON.stringify(q.payload.pairs[0]) === JSON.stringify(match.payload.pairs[1]) && JSON.stringify(q.payload.pairs[1]) === JSON.stringify(match.payload.pairs[0]) && q.payload.pairs.length === match.payload.pairs.length);
await ui.getByRole('button', { name: 'Naikkan pasangan 2' }).click();
await save();
check('memindah kembali memulihkan urutan semula', JSON.stringify((await content()).questions.find((x) => x.id === match.id)) === JSON.stringify(match));
await backToList();

// Writing task of a homework.
const hwWrite = base.homework.find((h) => h.writing);
await openRow(/^PR/, 'Cari pr', hwWrite.id);
await ui.getByLabel(/^Jumlah kata minimal/).fill(String(hwWrite.writing.minWords + 1));
await save();
let hwNow = (await content()).homework.find((h) => h.id === hwWrite.id);
check('tugas menulis tersimpan dan unsur wajibnya utuh', hwNow.writing.minWords === hwWrite.writing.minWords + 1 && JSON.stringify(hwNow.writing.mustInclude) === JSON.stringify(hwWrite.writing.mustInclude) && hwNow.writing.model === hwWrite.writing.model);
await ui.getByLabel(/^Jumlah kata minimal/).fill(String(hwWrite.writing.minWords));
await save();
await backToList();

// Exam settings.
const exam = base.exams[0];
await openRow(/^Ujian/, 'Cari ujian', exam.id);
await ui.getByLabel(/^Jumlah soal yang diambil otomatis/).fill('99');
await ui.getByRole('button', { name: 'Simpan', exact: true }).click();
check('angka di luar batas ditolak sebelum dikirim', await ui.getByText('Jumlah soal yang diambil otomatis maksimal 60.').count() === 1);
await ui.getByLabel(/^Jumlah soal yang diambil otomatis/).fill(String(exam.sample_size + 1));
await save();
check('pengaturan ujian tersimpan', (await content()).exams.find((x) => x.id === exam.id).sample_size === exam.sample_size + 1);
await ui.getByLabel(/^Jumlah soal yang diambil otomatis/).fill(String(exam.sample_size));
await save();
await backToList();

// JSON field: broken JSON never reaches the server.
const sc = base.conversation_scenarios[0];
await openRow(/^Percakapan/, 'Cari percakapan', sc.id);
const nodes = ui.getByLabel(/^Giliran dialog \(JSON\)/);
const original = await nodes.inputValue();
await nodes.fill(original.slice(0, -5));
check('JSON rusak ditandai di kolomnya', await ui.getByText(/^JSON belum valid:/).count() === 1);
await ui.getByRole('button', { name: 'Simpan', exact: true }).click();
check('JSON rusak tidak bisa disimpan', await ui.getByText('Perbaiki JSON yang belum valid sebelum menyimpan.').count() === 1 && JSON.stringify((await content()).conversation_scenarios.find((x) => x.id === sc.id)) === JSON.stringify(sc));
await nodes.fill(original);
check('JSON yang diperbaiki menghapus tanda kesalahan', await ui.getByText(/^JSON belum valid:/).count() === 0);
await backToList();
if (await ui.getByRole('button', { name: 'Buang perubahan', exact: true }).isVisible().catch(() => false)) await ui.getByRole('button', { name: 'Buang perubahan', exact: true }).click();

// Audio: register a recording, attach it to a word, delete it again.
const audioKey = `e2e.audio.${stamp}`;
await nav.getByRole('button', { name: /^Audio/ }).click();
check('daftar audio kosong menjelaskan suara perangkat', base.audio_resources.length > 0 || await ui.getByText(/dibacakan oleh suara bawaan perangkat/).count() === 1);
await ui.getByRole('button', { name: 'Tambah rekaman audio' }).click();
await ui.locator('#cms-new-id').fill(audioKey);
await ui.getByLabel(/^URL berkas audio/).fill('ftp://contoh/a.mp3');
await ui.getByRole('button', { name: 'Simpan', exact: true }).click();
check('URL audio yang tidak aman ditolak', await ui.getByText('URL audio harus diawali https:// atau /.').count() === 1);
await ui.getByLabel(/^URL berkas audio/).fill('/audio/e2e.mp3');
await save();
check('rekaman audio terdaftar', (await content()).audio_resources.some((a) => a.key === audioKey && a.url === '/audio/e2e.mp3' && a.accent === 'us'));
await backToList();
const word = base.vocabulary[0];
await openRow(/^Kosakata/, 'Cari kosakata', word.id);
await ui.getByLabel(/^Rekaman audio/).selectOption(audioKey);
await save();
check('kosakata terhubung ke rekaman', (await content()).vocabulary.find((v) => v.id === word.id).audio_key === audioKey);
await backToList();
await openRow(/^Audio/, 'Cari audio', audioKey);
await ui.getByRole('button', { name: 'Hapus', exact: true }).click();
await ui.getByRole('button', { name: 'Hapus permanen' }).click();
await ui.getByRole('button', { name: 'Tambah rekaman audio' }).waitFor({ timeout: 15000 });
const afterAudio = await content();
check('menghapus rekaman melepas tautannya dari kosakata', !afterAudio.audio_resources.some((a) => a.key === audioKey) && afterAudio.vocabulary.find((v) => v.id === word.id).audio_key == null);

// Re-import of the bundled curriculum overwrites CMS edits (typed confirmation required).
await tab('Terbitkan');
await ui.getByRole('button', { name: 'Impor ulang...' }).click();
const confirmImport = ui.getByRole('button', { name: 'Impor dan timpa' });
check('impor ulang terkunci sampai kata konfirmasi diketik', await confirmImport.isDisabled());
await ui.getByLabel(/Ketik IMPOR/).fill('IMPOR');
await confirmImport.click();
await ui.getByText(/baris diimpor dari paket bawaan/).waitFor({ timeout: 30000 });
const reimported = await content();
check('impor ulang mengembalikan pelajaran ke isi bawaan', reimported.lessons.find((l) => l.id === 'a1-greetings').summary === rows.lessons.find((l) => l.id === 'a1-greetings').summary);
check('impor ulang tidak mengubah versi yang diterima pelajar', (await get('/api/content')).pack.version === 'db-1');

// ───────────── 8. Phone layout ─────────────
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
