// Rilis 3: CEFR-style level exams through the real UI and API.
//  - the content pack sent to devices holds no exam-bank question;
//  - A2: an attempt survives a reload, all-correct answers pass, a certificate is
//    issued and verifies publicly (without an account), a second submit is refused;
//  - B1: a weak attempt fails on its section minimum, then the retake waits 20 hours
//    and asks for practice on the weakest topics; the practice is recorded.
// Keys come from the admin CMS rows, the only place a client can read them.
//
// Needs a fresh server with the embedded backend and the admin address set:
//   LENTERA_BACKEND=embedded LENTERA_ALLOW_EMBEDDED=1 LENTERA_DEV_ADMIN_EMAIL=admin@lentera.test \
//   LENTERA_DATA_DIR=/tmp/lentera-e2e/pglite npx next start -p 3100
//   node e2e/level-exams.mjs
import fs from 'node:fs';
import path from 'node:path';
import { BASE, check, chromium, fetchPack, runSession } from './lib.mjs';

const SHOTS = process.env.E2E_SHOTS ?? path.join(import.meta.dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const ADMIN = process.env.E2E_ADMIN_EMAIL ?? 'admin@lentera.test';
const PASSWORD = 'rahasia-12345';

const call = async (url, body, token) => {
  const res = await fetch(BASE + url, { method: body === undefined ? 'GET' : 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: res.status, data: await res.json().catch(() => ({})) };
};
let r = await call('/api/dev-auth', { action: 'signin', email: ADMIN, password: PASSWORD });
if (r.status !== 200) r = await call('/api/dev-auth', { action: 'signup', email: ADMIN, password: PASSWORD, name: 'Rina Ujian' });
if (r.status !== 200) throw new Error(`admin account unavailable: ${JSON.stringify(r.data)}`);
const session = r.data;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
await ctx.addInitScript((s) => { if (!localStorage.getItem('lentera.session')) localStorage.setItem('lentera.session', JSON.stringify(s)); }, session);
const page = await ctx.newPage();
const issues = [];
page.on('console', (m) => { if (m.type() === 'error' && !/status of 40[13]|status of 409/.test(m.text())) issues.push(`${new URL(page.url()).pathname}: ${m.text().slice(0, 200)}`); });
page.on('pageerror', (e) => issues.push(`pageerror ${e.message}`));
const button = (name) => page.getByRole('button', { name });

await page.goto(`${BASE}/app`);
await page.locator('main').first().waitFor({ timeout: 45000 });
await page.waitForFunction((uid) => !!localStorage.getItem(`lentera.state.${uid}`), session.userId, { timeout: 30000 });
const pack = await fetchPack(page, session.token);

// ── The bank stays on the server ───────────────────────────────────────────
const leaked = pack.exercises.filter((e) => e.id.startsWith('exam.level.'));
check('paket konten di perangkat tidak memuat satu pun soal bank ujian', leaked.length === 0, leaked.slice(0, 3).map((e) => e.id).join(', '));
const levelExams = pack.exams.filter((e) => e.scope === 'level');
check('ujian level di perangkat hanya membawa ukuran bagian, tanpa daftar soal', levelExams.every((e) => e.sections?.length === 4 && e.sections.every((s) => s.hidden && s.pool.length === 0)));
check('API ujian level menolak tanpa login', (await call('/api/exams/level', { action: 'start', id: 'exam.level.A2' })).status === 401);

const rows = (await call('/api/admin', { action: 'content' }, session.token)).data;
const keys = new Map(rows.questions.map((q) => [q.id, q]));
const examRow = (id) => rows.exams.find((x) => x.id === id);

// ── Finish A2 and B1 (lessons and unit exams) so their level exams open ────
await page.evaluate(({ uid, lessons, unitExams }) => {
  const k = `lentera.state.${uid}`;
  const s = JSON.parse(localStorage.getItem(k));
  const at = Date.now() - 3600_000;
  for (const id of lessons) s.lessons[id] = { startedAt: at, step: 7, masteryBest: 100, masteryAttempts: 1, completedAt: at };
  for (const id of unitExams) s.exams[id] = { attempts: [{ at, score: 100, passed: true }] };
  s.updatedAt = Date.now();
  localStorage.setItem(k, JSON.stringify(s));
}, {
  uid: session.userId,
  lessons: pack.lessons.filter((l) => ['A2', 'B1'].includes(pack.chapters.find((c) => c.id === pack.units.find((u) => u.id === l.unitId).chapterId).level)).map((l) => l.id),
  unitExams: pack.exams.filter((e) => e.scope === 'unit' && ['a2-', 'b1-'].some((p) => e.ref.startsWith(p))).map((e) => e.id),
});

/** Answers every question of the section on screen; `right(id, i)` decides per question. */
async function answerSection(right = () => true) {
  const cards = page.locator('section:not([hidden]) [data-ex]');
  const n = await cards.count();
  for (let i = 0; i < n; i++) {
    const card = cards.nth(i);
    const id = await card.getAttribute('data-ex');
    const q = keys.get(id);
    if (!q) throw new Error(`soal ${id} tidak ada di baris CMS`);
    const ok = right(id, i);
    if (q.options?.length) {
      const opt = ok ? q.options.find((o) => o.correct) : q.options.find((o) => !o.correct);
      await card.getByRole('radio', { name: opt.text, exact: true }).click();
    } else {
      await card.getByLabel('Jawabanmu').fill(ok ? q.payload.answers[0] : 'xyz');
    }
  }
  return n;
}
async function writeModel(examId) {
  const prompt = await page.locator('section:not([hidden]) p.font-bold').first().innerText();
  const task = examRow(examId).sections.find((s) => s.kind === 'writing').writing.find((w) => w.prompt === prompt);
  if (!task) throw new Error(`tugas menulis "${prompt.slice(0, 40)}" tidak dikenal`);
  await page.getByLabel('Tulisanmu').fill(task.model);
}
const nextSection = () => button('Bagian berikutnya').click();
async function submit() {
  await button('Kumpulkan ujian').click();
  await button('Ya, kumpulkan').click();
}

// ── A2: resume after reload, pass, certificate ──────────────────────────────
try {
  await page.goto(`${BASE}/app/exams?id=exam.level.A2`);
  await page.getByRole('heading', { name: 'Isi ujian' }).waitFor({ timeout: 30000 });
  check('A2: halaman ujian menjelaskan empat bagian dan aturan lulus', await page.getByText('Tata Bahasa & Kosakata').isVisible() && await page.getByText(/setiap bagian/).isVisible());
  await page.screenshot({ path: path.join(SHOTS, 'ujian-level-intro.png'), fullPage: true });
  await button('Mulai ujian').click();
  await page.getByRole('tablist', { name: 'Bagian ujian' }).waitFor({ timeout: 20000 });
  const n = await answerSection();
  check('A2: bagian tata bahasa berisi 8 soal', n === 8, String(n));
  const timerBefore = await page.locator('[aria-live="polite"]').innerText();
  await page.screenshot({ path: path.join(SHOTS, 'ujian-level-runner.png'), fullPage: false });
  await page.waitForTimeout(1500);
  await page.reload();
  await page.getByRole('tablist', { name: 'Bagian ujian' }).waitFor({ timeout: 30000 });
  const tab = await page.getByRole('tab', { name: /Tata Bahasa/ }).innerText();
  check('A2: setelah halaman dimuat ulang, jawaban tetap ada (8/8)', tab.includes('8/8'), tab);
  const timerAfter = await page.locator('[aria-live="polite"]').innerText();
  check('A2: waktu tetap berjalan, tidak diulang dari awal', timerAfter !== '30:00' && timerAfter <= timerBefore, `${timerBefore} → ${timerAfter}`);
  await nextSection();
  check('A2: bagian membaca berisi 4 soal dengan satu teks bacaan', (await answerSection()) === 4 && await page.getByText('Teks bacaan').isVisible());
  await page.screenshot({ path: path.join(SHOTS, 'ujian-level-membaca.png'), fullPage: true });
  await nextSection();
  check('A2: bagian menyimak berisi 4 soal dengan satu rekaman', (await answerSection()) === 4 && await button('Putar rekaman').first().isVisible());
  await nextSection();
  await writeModel('exam.level.A2');
  await page.screenshot({ path: path.join(SHOTS, 'ujian-level-menulis.png'), fullPage: true });
  await submit();
  await page.getByRole('heading', { name: 'Lulus: Ujian Level A2' }).waitFor({ timeout: 30000 });
  await page.screenshot({ path: path.join(SHOTS, 'ujian-level-lulus.png'), fullPage: true });
  const href = await page.getByRole('link', { name: /sertifikat/i }).getAttribute('href');
  const code = new URL(href, BASE).searchParams.get('kode');
  check('A2: lulus pertama menerbitkan sertifikat berkode 10 karakter', /^[A-Z2-9]{10}$/.test(code ?? ''), href);
  const s = await page.evaluate((uid) => JSON.parse(localStorage.getItem(`lentera.state.${uid}`)), session.userId);
  const a2 = s.exams['exam.level.A2']?.attempts.at(-1);
  check('A2: semua benar dan tulisan contoh: 100%, tercatat lulus di kemajuan', a2?.passed === true && a2.score === 100, JSON.stringify(a2));
  const again = await call('/api/exams/level', { action: 'submit', id: 'exam.level.A2', attempt: 0, answers: {}, writing: '' }, session.token);
  check('A2: percobaan yang sama tidak bisa dikumpulkan dua kali', again.status === 409 && again.data.code === 'stale_attempt', JSON.stringify(again));

  // Public verification, in a browser with no account.
  const guest = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const g = await guest.newPage();
  await g.goto(`${BASE}/sertifikat?kode=${code}`);
  await g.getByText('Sertifikat ini asli').waitFor({ timeout: 20000 });
  const body = await g.locator('article').innerText();
  check('sertifikat terbuka tanpa akun, dengan nama, level, nilai, dan kode', body.includes('Rina Ujian') && body.includes('Ujian Level A2') && body.includes(code) && body.includes('%'), body.slice(0, 160));
  check('sertifikat menyebut jujur bahwa ini bukan sertifikat CEFR resmi', body.includes('bukan sertifikat CEFR resmi'));
  await g.screenshot({ path: path.join(SHOTS, 'sertifikat-desktop.png'), fullPage: true });
  await g.emulateMedia({ media: 'print' });
  await g.screenshot({ path: path.join(SHOTS, 'sertifikat-cetak.png'), fullPage: true });
  await g.emulateMedia({ media: 'screen' });
  await g.goto(`${BASE}/sertifikat?kode=ABCDEFGH22`);
  check('kode yang tidak ada ditolak', await g.getByText('Kode tidak ditemukan').waitFor({ timeout: 20000 }).then(() => true, () => false));
  const pub = await call(`/api/certificates?code=${code}`);
  check('API verifikasi tidak membuka ID akun', pub.status === 200 && !JSON.stringify(pub.data).includes(session.userId));
  await guest.close();

  await page.goto(`${BASE}/sertifikat?kode=${code}`);
  await page.getByText('Sertifikat ini asli').waitFor({ timeout: 20000 });
  await page.screenshot({ path: path.join(SHOTS, 'sertifikat-hp.png'), fullPage: true });
  await page.goto(`${BASE}/app/exams`);
  check('Pusat Ujian menampilkan "Sertifikat saya"', await page.getByRole('heading', { name: 'Sertifikat saya' }).waitFor({ timeout: 20000 }).then(() => true, () => false));
} catch (e) {
  await page.screenshot({ path: path.join(SHOTS, 'ujian-level-gagal-a2.png'), fullPage: true }).catch(() => {});
  check('A2: gagal', false, String(e.message).split('\n')[0].slice(0, 200));
}

// ── B1: fail on a section, cooldown, required practice ─────────────────────
try {
  await page.goto(`${BASE}/app/exams?id=exam.level.B1`);
  await button('Mulai ujian').click({ timeout: 30000 });
  await page.getByRole('tablist', { name: 'Bagian ujian' }).waitFor({ timeout: 20000 });
  await answerSection((_, i) => i >= 2); // two grammar mistakes
  await nextSection();
  await answerSection(() => false); // reading: none right
  await nextSection();
  await answerSection();
  await nextSection();
  await writeModel('exam.level.B1');
  await submit();
  await page.getByRole('heading', { name: 'Belum lulus: Ujian Level B1' }).waitFor({ timeout: 30000 });
  await page.screenshot({ path: path.join(SHOTS, 'ujian-level-belum-lulus.png'), fullPage: true });
  check('B1: hasil menautkan latihan perbaikan untuk topik yang lemah', (await page.getByRole('link', { name: 'Latihan topik' }).count()) >= 1 && (await page.getByRole('link', { name: /Latihan membaca/ }).count()) === 1);
  const s = await page.evaluate((uid) => JSON.parse(localStorage.getItem(`lentera.state.${uid}`)), session.userId);
  const last = s.exams['exam.level.B1']?.attempts.at(-1);
  check('B1: percobaan gagal mencatat topik latihan wajib (maks. dua)', last?.passed === false && last.weak?.length >= 1 && last.weak.length <= 2, JSON.stringify(last));
  await button('Kembali ke ujian').click();
  await page.getByText('Latihan wajib sebelum mengulang').waitFor({ timeout: 15000 });
  check('B1: tombol ulang terkunci selama jeda dan sebelum latihan wajib', await page.getByText('Jeda sebelum mengulang').isVisible() && await button('Ulangi ujian').isDisabled());
  const early = await call('/api/exams/level', { action: 'start', id: 'exam.level.B1' }, session.token);
  check('B1: server menolak mulai ulang sebelum 20 jam', early.status === 409 && early.data.code === 'cooldown' && early.data.nextAt > Date.now() + 19 * 3600_000, JSON.stringify(early.data));
  await page.screenshot({ path: path.join(SHOTS, 'ujian-level-jeda.png'), fullPage: true });

  const topic = last.weak[0];
  await page.goto(`${BASE}/app/practice?mode=topic&topic=${encodeURIComponent(topic)}&exam=exam.level.B1`);
  await button('Mulai').click({ timeout: 30000 });
  await runSession(page, pack);
  await page.getByText('Latihan wajib tuntas').waitFor({ timeout: 20000 });
  await page.goto(`${BASE}/app/exams?id=exam.level.B1`);
  await page.getByRole('heading', { name: 'Isi ujian' }).waitFor({ timeout: 20000 });
  await page.waitForTimeout(500);
  const pending = await page.getByRole('link', { name: 'Latihan', exact: true }).count();
  const doneNote = last.weak.length === 1 ? await page.getByText('Latihan wajib sudah tuntas.').isVisible() : true;
  check('B1: latihan topik yang lulus dicoret dari daftar latihan wajib', pending === last.weak.length - 1 && doneNote, `${pending} tersisa dari ${last.weak.length}`);
} catch (e) {
  await page.screenshot({ path: path.join(SHOTS, 'ujian-level-gagal-b1.png'), fullPage: true }).catch(() => {});
  check('B1: gagal', false, String(e.message).split('\n')[0].slice(0, 200));
}

check('tanpa error di konsol', issues.length === 0, issues.slice(0, 3).join(' | '));
await browser.close();
console.log(process.exitCode ? '\nADA YANG GAGAL' : '\nSEMUA LOLOS');
