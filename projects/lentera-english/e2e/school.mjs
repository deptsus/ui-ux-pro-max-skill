// End-to-end check of Rilis 16 "Jalur Sekolah SD–SMA": choosing a school
// level, the Jalur page (school tracks with a free first unit and a final
// exam), Mode SD (bigger text, instructions read aloud, league note, parent
// check before payment), a whole SD lesson, the school level saved on the
// account, and the final exam drawn and graded on the server.
//
// Needs a server with the embedded backend (see e2e/admin-app.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { BASE, check, chromium, fetchPack, runSession } from './lib.mjs';

const require = createRequire(import.meta.url);
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const SHOTS = process.env.E2E_SHOTS ?? path.join(import.meta.dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

const post = async (url, body, token) => {
  const res = await fetch(BASE + url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
  return { status: res.status, data: await res.json().catch(() => ({})) };
};

const browser = await chromium.launch();
const issues = [];
async function phone(session) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.addInitScript((s) => {
    localStorage.setItem('lentera.sound', '0');
    if (s && !localStorage.getItem('lentera.session')) localStorage.setItem('lentera.session', JSON.stringify(s));
  }, session ?? null);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !/status of 40[0-9]/.test(m.text())) issues.push(`${new URL(page.url()).pathname}: ${m.text().slice(0, 200)}`); });
  page.on('pageerror', (e) => issues.push(`pageerror: ${e.message}`));
  return page;
}
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
async function axe(page, label) {
  await page.evaluate(() => Promise.all(document.getAnimations().filter((a) => Number.isFinite(a.effect?.getComputedTiming().endTime)).map((a) => a.finished.catch(() => undefined)))).catch(() => {});
  if (!(await page.evaluate(() => !!window.axe))) await page.evaluate(AXE);
  const v = await page.evaluate(async () => (await window.axe.run(document, { resultTypes: ['violations'], runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } })).violations.map((x) => `${x.id}: ${x.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(', ')}`));
  check(`${label}: tanpa pelanggaran WCAG A/AA`, v.length === 0, v.join(' | '));
}
const fail = async (page, name, e) => {
  await page.screenshot({ path: path.join(SHOTS, `sekolah-gagal-${name}.png`), fullPage: true }).catch(() => {});
  check(`${name}: macet`, false, String(e.message).split('\n')[0].slice(0, 200));
};

// ───────────── 1. Guest: choose a level, Jalur page ─────────────
const g = await phone();
try {
  await g.goto(`${BASE}/app/jalur`);
  await g.getByRole('heading', { name: 'Jalur Sekolah & Khusus', level: 1 }).waitFor({ timeout: 30000 });
  check('halaman jalur menanyakan jenjang', await g.getByRole('radiogroup', { name: 'Pilih jenjang sekolahmu' }).isVisible());
  await axe(g, 'Jalur Sekolah & Khusus');
  await g.getByRole('radiogroup', { name: 'Pilih jenjang sekolahmu' }).getByRole('radio', { name: /^SD/ }).click();
  const sd = g.locator('section', { has: g.locator('[id="sd"]') }).last();
  await sd.getByText('Jenjangmu').waitFor({ timeout: 10000 });
  check('setelah memilih SD, Jalur SD ditandai "Jenjangmu" dan ada di atas', (await g.getByRole('heading', { level: 3 }).first().innerText()).includes('Jalur SD'));
  check('Unit 1 Jalur SD gratis, Unit 2 Premium', await sd.getByRole('heading', { name: /^Unit 1: Halo, Teman Baru!/ }).getByText('Gratis').isVisible() && await sd.getByRole('heading', { name: /^Unit 2: Keluarga dan Rumahku/ }).getByText('Premium').isVisible());
  const first = sd.getByRole('link', { name: /Halo! Salam dan Perkenalan/ });
  check('pelajaran pertama Jalur SD terbuka untuk tamu', (await first.getAttribute('href')) === '/app/lesson?id=sd-greetings');
  check('pelajaran Jalur Anak lama kini bagian Jalur SD', await sd.getByText('Warna dan Hewan', { exact: true }).isVisible() && await sd.getByText('Keluargaku', { exact: true }).isVisible());
  check('ujian akhir Jalur SD tampil dan mengarah ke Premium bagi tamu', await sd.getByText('Ujian Akhir Jalur SD', { exact: true }).isVisible() && (await sd.getByRole('link', { name: /Premium/ }).last().getAttribute('href')) === '/app/subscription');
  const smp = g.locator('section', { has: g.locator('[id="smp"]') }).last();
  check('Jalur SMP: 7 pelajaran, unit pertama gratis', (await smp.getByRole('listitem').count()) >= 7 && await smp.getByRole('heading', { name: /^Unit 1: Aku dan Sekitarku/ }).getByText('Gratis').isVisible());
  check('Jalur SMA memuat latihan gaya SNBT dan catatan bukan soal resmi', await g.getByText('Literasi Bahasa Inggris Gaya SNBT', { exact: true }).first().isVisible() && await g.getByText(/bukan soal resmi/).first().isVisible());
  check('halaman jalur muat di layar 390 px', (await overflow(g)) <= 0);
  await g.screenshot({ path: path.join(SHOTS, 'sekolah-jalur.png'), fullPage: true });

  // Mode SD: bigger text, applied before paint on the next load.
  await g.goto(`${BASE}/app`);
  await g.getByRole('link', { name: /Jalur SD/ }).first().waitFor({ timeout: 30000 });
  const cls = await g.evaluate(() => document.documentElement.className);
  check('Mode SD: huruf lebih besar dan kelas sd-mode di halaman', cls.includes('sd-mode') && cls.includes('fs-lg'), cls);
  check('beranda menautkan Jalur SD', (await g.getByRole('link', { name: /Jalur SD/ }).first().getAttribute('href')) === '/app/jalur#sd');

  // Parent check before payment.
  await g.goto(`${BASE}/app/subscription`);
  await g.getByRole('heading', { name: 'Khusus orang tua' }).waitFor({ timeout: 30000 });
  check('Mode SD: formulir pembayaran tersembunyi sebelum pemeriksaan orang tua', (await g.getByRole('heading', { name: /Berlangganan Premium/ }).count()) === 0);
  await axe(g, 'gerbang orang tua');
  const q = await g.getByText(/^Berapa \d+ × \d+\?$/).innerText();
  const [, a, b] = q.match(/(\d+) × (\d+)/);
  await g.getByLabel(q).fill('1');
  await g.getByRole('button', { name: 'Buka' }).click();
  check('jawaban salah ditolak dengan pesan', await g.getByRole('alert').getByText(/belum tepat/).isVisible());
  const q2 = await g.getByText(/^Berapa \d+ × \d+\?$/).innerText();
  const [, c, d] = q2.match(/(\d+) × (\d+)/);
  await g.getByLabel(q2).fill(String(Number(c) * Number(d)));
  await g.getByRole('button', { name: 'Buka' }).click();
  check('jawaban benar membuka formulir pembayaran', await g.getByRole('heading', { name: /Berlangganan Premium/ }).waitFor({ timeout: 5000 }).then(() => true, () => false));
  void a; void b;
  await g.screenshot({ path: path.join(SHOTS, 'sekolah-gerbang.png'), fullPage: true });
} catch (e) {
  await fail(g, 'tamu', e);
}

// ───────────── 2. A whole SD lesson, with "Bacakan" ─────────────
try {
  const pack = await fetchPack(g);
  const button = (name) => g.getByRole('button', { name });
  await g.goto(`${BASE}/app/lesson?id=sd-greetings`);
  await button('Mulai belajar').click({ timeout: 30000 });
  await button('Lihat contoh benar dan salah').click();
  await button('Lanjut ke latihan').click();
  await button('Mulai latihan').click();
  await g.locator('[data-ex]').first().waitFor({ timeout: 15000 });
  check('Mode SD: tiap soal punya tombol "Bacakan petunjuk"', await button('Bacakan petunjuk').isVisible());
  await runSession(g, pack);
  await g.getByRole('heading', { name: 'Latihan terbimbing selesai' }).waitFor({ timeout: 15000 });
  await button(/Lanjut ke latihan mandiri/).click();
  await button('Mulai latihan mandiri').click();
  await runSession(g, pack);
  await g.getByRole('heading', { name: 'Latihan mandiri selesai' }).waitFor({ timeout: 15000 });
  await button(/Lanjut ke pr/i).click();
  await button(/Terima PR/).click();
  await button('Lanjut ke tes penguasaan').click();
  await button('Mulai tes').click();
  await runSession(g, pack, { deferred: true });
  await g.getByRole('heading', { name: 'Lulus tes penguasaan!' }).waitFor({ timeout: 15000 });
  check('pelajaran baru SD "Halo! Salam dan Perkenalan" bisa diselesaikan sampai lulus', true);
  await g.goto(`${BASE}/app/jalur`);
  const sd = g.locator('section', { has: g.locator('[id="sd"]') }).last();
  await sd.waitFor({ timeout: 30000 });
  check('setelah lulus, pelajaran berikutnya di Jalur SD terbuka', (await sd.getByRole('link', { name: /Warna dan Hewan/ }).getAttribute('href')) === '/app/lesson?id=kids-colors-animals');
  await g.goto(`${BASE}/app/lesson?id=sd-greetings`);
  check('kembali dari pelajaran SD menuju Jalur SD', (await g.getByRole('link', { name: 'Jalur SD' }).first().getAttribute('href', { timeout: 30000 })) === '/app/jalur#sd');
  await g.goto(`${BASE}/app/lesson?id=sd-body`);
  check('pelajaran SD yang masih terkunci mengarah kembali ke Jalur SD', (await g.getByRole('link', { name: 'Kembali ke jalur SD' }).getAttribute('href', { timeout: 30000 })) === '/app/jalur#sd');
} catch (e) {
  await fail(g, 'pelajaran SD', e);
}

// ───────────── 3. Signed in: level saved on the account, league note, final exam API ─────────────
const email = `sekolah-${Date.now()}@lentera.test`;
const signup = await post('/api/dev-auth', { action: 'signup', email, password: 'rahasia-12345', name: 'Dewi Kecil' });
check('akun uji dibuat', signup.status === 200, JSON.stringify(signup.data).slice(0, 120));
const u = await phone(signup.data);
try {
  await u.goto(`${BASE}/app/profile`);
  await u.getByRole('heading', { name: 'Jenjang sekolah' }).waitFor({ timeout: 30000 });
  await u.getByRole('radiogroup', { name: 'Jenjang sekolah' }).getByRole('radio', { name: /^SD/ }).click();
  check('profil: Mode SD aktif setelah memilih SD', await u.getByText('Mode SD aktif').isVisible());
  await axe(u, 'profil dengan jenjang');
  let saved = null;
  for (let i = 0; i < 20 && saved !== 'sd'; i++) {
    await u.waitForTimeout(300);
    saved = (await u.evaluate(async (t) => (await (await fetch('/api/me', { headers: { Authorization: `Bearer ${t}` } })).json()).user?.profile?.school_level, signup.data.token)) ?? null;
  }
  check('jenjang tersimpan di akun (dipakai liga untuk menyembunyikan nama)', saved === 'sd', String(saved));
  await u.goto(`${BASE}/app/leaderboard`);
  check('liga memberi tahu bahwa nama tampil sebagai "Pelajar SD"', await u.getByText(/namamu tampil sebagai "Pelajar SD"/).waitFor({ timeout: 30000 }).then(() => true, () => false));

  const bad = await fetch(`${BASE}/api/me`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${signup.data.token}` }, body: JSON.stringify({ school_level: 'tk' }) });
  check('jenjang yang tidak dikenal ditolak (400)', bad.status === 400);

  // Final exam: Premium only, drawn and graded on the server.
  const start = await post('/api/exams/level', { action: 'start', id: 'exam.track.smp' }, signup.data.token);
  check('ujian akhir jalur: akun Free ditolak (403)', start.status === 403);
} catch (e) {
  await fail(u, 'akun', e);
}

const ADMIN = process.env.E2E_ADMIN_EMAIL ?? 'admin@lentera.test';
let ra = await post('/api/dev-auth', { action: 'signin', email: ADMIN, password: 'rahasia-12345' });
if (ra.status !== 200) ra = await post('/api/dev-auth', { action: 'signup', email: ADMIN, password: 'rahasia-12345', name: 'Admin Uji' });
const admin = ra.data;
const s1 = await post('/api/exams/level', { action: 'start', id: 'exam.track.smp' }, admin.token);
check('ujian akhir Jalur SMP: server mengirim 4 bagian tanpa kunci jawaban', s1.status === 200 && s1.data.sections?.length === 4 && s1.data.sections.flatMap((s) => s.questions).every((q) => !q.answers && (q.options ?? []).every((o) => o.correct === undefined)), JSON.stringify(s1.data).slice(0, 160));
const sub = await post('/api/exams/level', { action: 'submit', id: 'exam.track.smp', attempt: s1.data.attempt, answers: {}, writing: '' }, admin.token);
check('jawaban kosong dinilai server: tidak lulus, tanpa sertifikat', sub.status === 200 && sub.data.passed === false && !sub.data.certificate, JSON.stringify(sub.data).slice(0, 160));
const a = await phone(admin);
try {
  await a.goto(`${BASE}/app/exams`);
  await a.getByRole('heading', { name: 'Ujian akhir jalur sekolah' }).waitFor({ timeout: 30000 });
  for (const t of ['SD', 'SMP', 'SMA']) check(`Pusat Ujian memuat Ujian Akhir Jalur ${t}`, await a.getByText(`Ujian Akhir Jalur ${t}`, { exact: true }).isVisible());
  await a.goto(`${BASE}/app/exams?id=exam.track.smp`);
  await a.getByRole('heading', { name: 'Ujian Akhir Jalur SMP' }).waitFor({ timeout: 30000 });
  check('halaman ujian akhir terbuka (riwayat percobaan dari server)', true);
  await axe(a, 'halaman ujian akhir');
  await a.screenshot({ path: path.join(SHOTS, 'sekolah-ujian.png'), fullPage: true });
} catch (e) {
  await fail(a, 'ujian akhir', e);
}

check('tanpa error di konsol', issues.length === 0, issues.slice(0, 5).join(' | '));
await browser.close();
console.log(process.exitCode === 1 ? '\nADA YANG GAGAL' : '\nSEMUA LOLOS');
