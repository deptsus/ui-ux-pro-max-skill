// End-to-end suite for the learner app, driven through the real UI on a phone
// viewport. Answers come from the published content pack (see lib.mjs), so the
// suite keeps working when the curriculum is edited.
//
// Needs a server with the embedded backend (local accounts + payment simulator):
//   LENTERA_BACKEND=embedded npx next dev -p 3100
//   npm run e2e                 # all scenarios
//   npm run e2e -- lesson exam  # only scenarios whose name contains a word
import fs from 'node:fs';
import path from 'node:path';
import { BASE, answerCurrent, check, chromium, fetchPack, runSession } from './lib.mjs';

const SHOTS = process.env.E2E_SHOTS ?? path.join(import.meta.dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const only = process.argv.slice(2);
const stamp = Date.now();
const PASSWORD = 'rahasia-12345';
const DAY = 86_400_000;

const browser = await chromium.launch();
const issues = [];
async function newContext() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  ctx.on('page', (page) => {
    // 401/403 responses are expected in a few flows and are asserted separately.
    page.on('console', (m) => { if (m.type() === 'error' && !/status of 40[13]/.test(m.text())) issues.push(`${new URL(page.url()).pathname}: ${m.text().slice(0, 200)}`); });
    page.on('pageerror', (e) => issues.push(`${new URL(page.url()).pathname}: pageerror ${e.message}`));
  });
  return ctx;
}
const open = async (ctx, url) => {
  const page = await ctx.newPage();
  await page.goto(BASE + url);
  await page.locator('main').first().waitFor({ timeout: 45000 });
  return page;
};
/**
 * The signed-in account as { userId, email, token }, or null. Embedded servers keep it in
 * `lentera.session`; with Supabase, supabase-js keeps it in `sb-<project>-auth-token`.
 * A string expression so it can run inside page.evaluate and page.waitForFunction.
 */
const SESSION_JS = `(() => {
  try { const d = JSON.parse(localStorage.getItem('lentera.session') ?? 'null'); if (d) return d; } catch {}
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!/^sb-.+-auth-token$/.test(k ?? '')) continue;
    try { const v = JSON.parse(localStorage.getItem(k)); const s = v?.currentSession ?? v; if (s?.user?.id) return { userId: s.user.id, email: s.user.email ?? '', token: s.access_token }; } catch {}
  }
  return null;
})()`;
const state = (page) => page.evaluate(`(() => {
  const s = ${SESSION_JS};
  return JSON.parse(localStorage.getItem('lentera.state.' + (s?.userId ?? 'guest')) ?? 'null');
})()`);
const session = (page) => page.evaluate(SESSION_JS);
/** True once the locator shows up; false if it never does (pages render after the app shell boots). */
const seen = (locator, timeout = 10000) => locator.first().waitFor({ timeout }).then(() => true, () => false);
const button = (page, name) => page.getByRole('button', { name });
const link = (page, name) => page.getByRole('link', { name });
/** The admin account of the e2e server (LENTERA_DEV_ADMIN_EMAIL). */
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'admin@lentera.test';
async function adminAccount() {
  let r = await api('/api/dev-auth', null, { action: 'signin', email: ADMIN_EMAIL, password: PASSWORD });
  if (r.status !== 200) r = await api('/api/dev-auth', null, { action: 'signup', email: ADMIN_EMAIL, password: PASSWORD, name: 'Admin Uji' });
  if (r.status !== 200) throw new Error(`admin account unavailable: ${JSON.stringify(r.data)}`);
  return r.data;
}
const api = async (url, token, body) => {
  const res = await fetch(BASE + url, { method: body ? 'POST' : 'GET', headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return { status: res.status, data: await res.json().catch(() => ({})) };
};

/** Walks one lesson from the introduction to the review schedule. */
async function completeLesson(page, pack, id, { firstWrong = false } = {}) {
  const lesson = pack.lessons.find((l) => l.id === id);
  await page.goto(`${BASE}/app/lesson?id=${id}`);
  await button(page, 'Mulai belajar').click();
  await button(page, 'Lihat contoh benar dan salah').click();
  await button(page, 'Lanjut ke latihan').click();

  await button(page, 'Mulai latihan').click();
  if (firstWrong) {
    // A wrong answer must explain why, show the right answer, and cost nothing in guided practice.
    await answerCurrent(page, pack, false);
    await button(page, 'Periksa').click();
    await page.getByText('Belum tepat', { exact: true }).waitFor();
    check('jawaban salah menampilkan alasan, jawaban benar, dan penjelasan', await page.getByText('Kenapa salah:').count() === 1 && await page.getByText('Jawaban benar:').count() === 1 && await page.getByText('Penjelasan:').count() === 1);
    await button(page, 'Lanjut').click();
  }
  await runSession(page, pack);
  await page.getByRole('heading', { name: 'Latihan terbimbing selesai' }).waitFor();
  await button(page, /Lanjut ke latihan mandiri/).click();

  await button(page, 'Mulai latihan mandiri').click();
  await runSession(page, pack);
  await page.getByRole('heading', { name: 'Latihan mandiri selesai' }).waitFor();
  await button(page, /Lanjut ke pr/i).click();

  const hw = pack.homework.find((h) => h.lessonId === id);
  if (hw) await button(page, /Terima PR/).click();
  await button(page, 'Lanjut ke tes penguasaan').click();
  await button(page, 'Mulai tes').click();
  await runSession(page, pack, { deferred: true });
  await page.getByRole('heading', { name: 'Lulus tes penguasaan!' }).waitFor();
  await button(page, 'Lanjut').click();
  await page.getByRole('heading', { name: 'Jadwal ulangan' }).waitFor();
  return { lesson, hw };
}

const scenarios = [];
const scenario = (name, fn) => scenarios.push({ name, fn });

// ───────────────────────── Scenarios ─────────────────────────

scenario('routes: semua halaman terbuka tanpa error', async () => {
  const ctx = await newContext();
  const page = await open(ctx, '/app');
  const pack = await fetchPack(page);
  const routes = ['/', '/masuk', '/daftar', '/admin', '/app', '/app/path', '/app/review', '/app/homework', '/app/exams', `/app/exams?id=${pack.exams[0].id}`, '/app/vocabulary', '/app/grammar', `/app/grammar?topic=${encodeURIComponent(pack.topics[0].id)}`, '/app/listening', '/app/listening?tab=pelafalan', `/app/listening?id=${pack.listening[0].id}`, '/app/conversations', '/app/analytics', '/app/achievements', '/app/leaderboard', '/app/profile', '/app/subscription', '/app/settings', '/app/more', '/app/placement', '/app/practice?mode=timed', `/app/practice?mode=drill&tag=${encodeURIComponent(pack.tags[0].id)}`, '/app/checkout', `/app/lesson?id=${pack.lessons.find((l) => l.locked).id}`];
  const bad = [];
  for (const r of routes) {
    const before = issues.length;
    const res = await page.goto(BASE + r);
    await page.locator('main, h1').first().waitFor({ timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(250);
    if (res.status() !== 200 || issues.length > before) bad.push(`${r} (${res.status()})`);
  }
  check(`${routes.length} rute terbuka dengan status 200 dan tanpa error konsol`, bad.length === 0, bad.join(', '));
  await ctx.close();
});

scenario('lesson: tamu menuntaskan pelajaran, PR, ulangan, tantangan kilat, lalu mendaftar', async () => {
  const ctx = await newContext();
  const page = await open(ctx, '/app');
  const pack = await fetchPack(page);
  const next = pack.lessons.find((l) => l.unitId === pack.lessons[0].unitId && l.position === 2);
  await page.goto(`${BASE}/app/lesson?id=${next.id}`);
  check('pelajaran kedua terkunci sebelum yang pertama tuntas', await seen(page.getByText('Pelajaran masih terkunci')));

  const { lesson, hw } = await completeLesson(page, pack, pack.lessons[0].id, { firstWrong: true });
  let s = await state(page);
  check('pelajaran tercatat tuntas dengan nilai tes', !!s.lessons[lesson.id]?.completedAt && s.lessons[lesson.id].masteryBest >= lesson.passScore, JSON.stringify(s.lessons[lesson.id]));
  check('XP bertambah', s.xp > 0, String(s.xp));
  check('topik dan kosakata pelajaran masuk jadwal ulangan', !!s.reviews[`topic:${lesson.topic}`] && (lesson.vocab ?? []).every((v) => s.reviews[`vocab:${v}`]));
  check('PR pelajaran ditugaskan dengan tenggat', !!hw && s.homework[hw.id]?.dueAt > Date.now());
  await page.screenshot({ path: path.join(SHOTS, 'lesson-review-step.png'), fullPage: true });
  await page.goto(`${BASE}/app/lesson?id=${next.id}`);
  check('pelajaran berikutnya terbuka', await seen(button(page, 'Mulai belajar')));

  // Homework: the lesson's exercise set, then the chapter's writing task.
  await page.goto(`${BASE}/app/homework`);
  check('PR muncul di Pusat PR sebagai harus dikerjakan', await seen(page.getByRole('heading', { name: 'Harus dikerjakan' })) && await page.getByText(hw.title, { exact: true }).count() === 1);
  await page.goto(`${BASE}/app/homework?id=${hw.id}`);
  await button(page, 'Kerjakan PR').click();
  await runSession(page, pack);
  await page.getByRole('heading', { name: 'PR dikumpulkan' }).waitFor();
  s = await state(page);
  check('pengumpulan PR tercatat dengan nilai 100', s.homework[hw.id].submissions.length === 1 && s.homework[hw.id].submissions[0].score === 100, JSON.stringify(s.homework[hw.id].submissions));
  const writing = pack.homework.find((h) => h.writing && !h.lessonId);
  await page.goto(`${BASE}/app/homework`);
  await page.locator('li', { hasText: writing.title }).getByRole('button', { name: 'Ambil tugas' }).click();
  await page.goto(`${BASE}/app/homework?id=${writing.id}`);
  await page.getByLabel('Tulisanmu').fill('hello');
  await button(page, 'Kumpulkan').click();
  check('tulisan terlalu pendek gagal di daftar periksa', await page.getByText('belum terpenuhi').count() >= 1 && !(await page.getByRole('heading', { name: /Hasil pemeriksaan · 100%/ }).count()));
  await page.getByLabel('Tulisanmu').fill(writing.writing.model);
  await button(page, 'Kumpulkan').click();
  check('contoh jawaban memenuhi seluruh daftar periksa (100%)', await page.getByRole('heading', { name: 'Hasil pemeriksaan · 100%' }).count() === 1, await page.getByRole('heading', { name: /Hasil pemeriksaan/ }).innerText().catch(() => 'tanpa hasil'));
  check('PR menulis menyatakan tidak menilai mutu tulisan', await page.getByText(/bukan penilaian mutu tulisan/).count() === 1);

  // Timed challenge: quick questions from learned material.
  await page.goto(`${BASE}/app/practice?mode=timed`);
  await button(page, 'Mulai').click();
  const xpBefore = (await state(page)).xp;
  await runSession(page, pack);
  await page.getByRole('heading', { name: 'Tantangan Kilat' }).waitFor();
  check('ronde Tantangan Kilat sempurna memberi bonus XP', await page.getByText('Sempurna!').count() === 1 && (await state(page)).xp > xpBefore);

  // Scheduled review: nothing is due today; two days later the lesson's items are.
  // The time jump runs in a separate context (same saved progress) so the frozen clock stays there.
  await page.goto(`${BASE}/app/review`);
  await page.getByRole('heading', { name: 'Ulangan menunggu' }).waitFor();
  check('tidak ada ulangan jatuh tempo di hari yang sama', await button(page, /Mulai ulangan/).count() === 0);
  const future = await newContext();
  await future.addInitScript((saved) => { try { if (!localStorage.getItem('lentera.state.guest')) localStorage.setItem('lentera.state.guest', saved); } catch { /* about:blank has no storage */ } }, JSON.stringify(await state(page)));
  await future.clock.setFixedTime(Date.now() + 2 * DAY);
  const later = await open(future, '/app/review');
  await button(later, /Mulai ulangan/).waitFor({ timeout: 30000 });
  const dueLabel = await button(later, /Mulai ulangan/).innerText();
  await button(later, /Mulai ulangan/).click();
  const reviewed = await runSession(later, pack);
  await later.getByRole('heading', { name: 'Ulangan selesai' }).waitFor();
  s = await state(later);
  const done = Object.values(s.reviews).filter((r) => r.history.length > 0);
  check('sesi ulangan berjalan sampai selesai', reviewed.length > 0, dueLabel);
  check('jawaban benar memanjangkan jarak ulangan dari 1 ke 3 hari', done.length > 0 && done.every((r) => r.history.at(-1).ok && r.intervalDays === 3), JSON.stringify(done.map((r) => [r.key, r.intervalDays])));
  check('paket gratis membatasi 10 ulangan per hari', done.length <= 10 && /\((\d+) materi\)/.test(dueLabel) && Number(dueLabel.match(/\((\d+) materi\)/)[1]) <= 10, dueLabel);
  check('menyelesaikan sesi ulangan memberi kabar jadwal diperbarui', await later.getByText('Jadwal diperbarui').count() === 1);
  await later.screenshot({ path: path.join(SHOTS, 'review-summary.png') });
  await future.close();

  // Analytics and settings with real data.
  await page.goto(`${BASE}/app/analytics`);
  check('analitik menampilkan ringkasan dan grafik dari data sendiri', await seen(page.getByRole('img', { name: /XP per hari/ })) && await page.getByRole('img', { name: /Ketepatan jawaban per hari/ }).count() === 1 && await page.locator('section[aria-label="Ringkasan"]').getByText('1', { exact: true }).count() >= 1);
  check('analitik lengkap ditawarkan sebagai Premium untuk akun Free', await page.getByText('Analitik lengkap ada di Premium').count() === 1);
  await page.screenshot({ path: path.join(SHOTS, 'analytics.png'), fullPage: true });
  await page.goto(`${BASE}/app/settings`);
  await page.getByRole('radio', { name: 'Gelap' }).click();
  await page.waitForFunction(() => document.documentElement.classList.contains('dark'), null, { timeout: 5000 }).catch(() => {});
  check('tema gelap aktif dan tersimpan', await page.evaluate(() => document.documentElement.classList.contains('dark') && localStorage.getItem('lentera.theme') === 'dark'));
  await page.reload();
  check('tema gelap bertahan setelah muat ulang', await page.evaluate(() => document.documentElement.classList.contains('dark')));
  await page.getByRole('radio', { name: 'Gelap' }).waitFor();
  await page.screenshot({ path: path.join(SHOTS, 'settings-dark.png'), fullPage: true });
  await page.getByRole('radio', { name: 'Terang' }).click();
  await page.getByRole('radio', { name: 'Inggris (British)' }).click();
  check('pilihan aksen tersimpan', (await state(page)).profile.accent === 'uk');

  // Sign up: everything done as a guest moves into the account and reaches the server.
  const guest = await state(page);
  const email = `tamu${stamp}@lentera.test`;
  await page.goto(`${BASE}/daftar`);
  await page.getByLabel('Nama').fill('Tamu Uji');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Kata sandi').fill(PASSWORD);
  await button(page, 'Daftar').click();
  await page.waitForURL(/\/app$/, { timeout: 30000 });
  await page.waitForFunction(`(() => { const x = ${SESSION_JS}; return !!x && !!localStorage.getItem('lentera.state.' + x.userId); })()`, null, { timeout: 30000 });
  const sess = await session(page);
  s = await state(page);
  check('progres tamu pindah ke akun baru', s.userId === sess.userId && s.xp === guest.xp && !!s.lessons[lesson.id]?.completedAt && await page.evaluate(() => localStorage.getItem('lentera.state.guest') === null));
  check('nama dari form daftar dipakai di profil', s.profile.name === 'Tamu Uji', s.profile.name);
  let snapshot = null;
  for (let i = 0; i < 30 && !snapshot?.state?.xp; i++) {
    await page.waitForTimeout(500);
    snapshot = (await api('/api/sync', sess.token)).data.snapshot;
  }
  check('progres tersinkron ke server', snapshot?.state?.xp === guest.xp, JSON.stringify(snapshot?.state?.xp));
  await page.goto(`${BASE}/app/leaderboard`);
  const mine = page.locator('ol > li', { hasText: 'Tamu Uji' }).filter({ hasText: 'kamu' });
  check('akun muncul di papan peringkat dengan XP yang didapat sebagai tamu', await seen(mine, 20000) && Number((await mine.innerText()).match(/(\d+) XP/)?.[1] ?? 0) > 0, await page.locator('main').innerText().then((t) => t.slice(0, 200)));
  const board = (await api('/api/leaderboard', sess.token)).data;
  check('XP di server tidak melebihi XP di perangkat', board.me?.xp > 0 && board.me.xp <= guest.xp, `${JSON.stringify(board.me)} vs ${guest.xp}`);
  await ctx.close();
});

scenario('exam: tiga pelajaran tuntas membuka ujian unit, lalu lulus', async () => {
  const ctx = await newContext();
  const page = await open(ctx, '/app');
  const pack = await fetchPack(page);
  const unit = pack.units.find((u) => u.id === pack.lessons[0].unitId);
  const exam = pack.exams.find((e) => e.scope === 'unit' && e.ref === unit.id);
  await page.goto(`${BASE}/app/exams?id=${exam.id}`);
  check('ujian unit terkunci sebelum pelajarannya tuntas', await seen(page.getByText('Ujian masih terkunci')));
  for (const l of pack.lessons.filter((x) => x.unitId === unit.id).sort((a, b) => a.position - b.position)) await completeLesson(page, pack, l.id);
  check('langkah terakhir pelajaran penutup unit menawarkan ujian unit', await link(page, new RegExp(exam.title)).count() === 1);
  await page.goto(`${BASE}/app/exams?id=${exam.id}`);
  await button(page, /Mulai ujian/).click();
  // Miss two on purpose: the exam still passes at 80% and reports scores per topic.
  const answered = await runSession(page, pack, { deferred: true, plan: (i) => i >= 2 });
  await page.getByRole('heading', { name: new RegExp(`Lulus: ${exam.title}`) }).waitFor({ timeout: 20000 });
  const s = await state(page);
  const expected = Math.round(((answered.length - 2) / answered.length) * 100);
  check('nilai ujian sesuai jumlah jawaban benar', s.exams[exam.id].attempts.at(-1).score === expected && expected >= exam.passScore, `${JSON.stringify(s.exams[exam.id].attempts)} vs ${expected}`);
  check('hasil ujian menampilkan nilai per topik dan pembahasan', await page.getByText('Nilai per topik').count() === 1 && await page.getByRole('heading', { name: 'Pembahasan' }).count() === 1);
  await page.screenshot({ path: path.join(SHOTS, 'exam-result.png'), fullPage: true });
  await page.goto(`${BASE}/app/exams`);
  check('Pusat Ujian menandai ujian unit lulus', await seen(page.locator('li', { hasText: exam.title }).getByText('Lulus', { exact: true })));
  await ctx.close();
});

scenario('drill: latihan perbaikan dan menyimak', async () => {
  const ctx = await newContext();
  const page = await open(ctx, '/app');
  const pack = await fetchPack(page);
  // A misconception with a free question bank.
  const counts = new Map();
  for (const e of pack.exercises) {
    for (const t of new Set([e.focus, ...(e.options ?? []).map((o) => o.tag), ...Object.values(e.errors ?? {}).map((x) => x.tag)].filter(Boolean))) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  const tag = pack.tags.map((t) => t.id).sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0))[0];
  await page.goto(`${BASE}/app/practice?mode=drill&tag=${encodeURIComponent(tag)}`);
  await button(page, 'Mulai').click();
  const drill = await runSession(page, pack);
  await page.getByRole('heading', { name: /Latihan perbaikan:/ }).waitFor();
  check('latihan perbaikan selesai dan pola kesalahan dinyatakan teratasi', drill.length >= 3 && await page.getByText('Pola kesalahan ini teratasi').count() === 1, `${tag}: ${drill.length} soal`);
  const levels = drill.map((d) => pack.exercises.find((e) => e.id === d.id).difficulty);
  check('tingkat kesulitan tidak menurun selama semua jawaban benar', levels.every((d, i) => i === 0 || d >= levels[i - 1] || levels.slice(0, i).includes(d)), levels.join(','));

  const item = pack.listening.find((l) => !l.locked && l.questionIds.length);
  await page.goto(`${BASE}/app/listening?id=${item.id}`);
  await button(page, 'Tampilkan transkrip').click();
  check('transkrip menyimak bisa ditampilkan', await page.getByText(item.transcript, { exact: true }).count() === 1);
  check('sumber audio dinyatakan dengan jujur', await page.getByText(/suara bawaan perangkat|Rekaman penutur/i).count() >= 1);
  await button(page, /Jawab \d+ pertanyaan/).click();
  const heard = await runSession(page, pack);
  await page.getByRole('heading', { name: 'Latihan menyimak selesai' }).waitFor();
  check('latihan menyimak selesai dengan semua soal materi itu', heard.length === item.questionIds.length);
  const locked = pack.listening.find((l) => l.locked);
  await page.goto(`${BASE}/app/listening?id=${locked.id}`);
  check('materi menyimak Premium tertutup untuk tamu', await seen(page.getByText('Audio Premium')));
  await ctx.close();
});

scenario('conversation: percakapan bercabang sampai selesai', async () => {
  const ctx = await newContext();
  const page = await open(ctx, '/app');
  const pack = await fetchPack(page);
  const sc = pack.scenarios.find((x) => x.id === 'restaurant') ?? pack.scenarios.find((x) => !x.locked);
  await page.goto(`${BASE}/app/conversations?id=${sc.id}`);
  let node = sc.nodes.find((n) => n.id === sc.start);
  let turns = 0;
  let sawWrong = false;
  while (node && turns < 30) {
    // First turn: pick a flawed response to see the correction, then always the most natural one.
    const pick = turns === 0 ? node.options.find((o) => !o.correct || o.natural < 3) ?? node.options[0] : [...node.options].sort((a, b) => (b.correct ? b.natural : 0) - (a.correct ? a.natural : 0))[0];
    await page.getByRole('button', { name: pick.text, exact: true }).click();
    await page.getByText('Ungkapan lain yang bisa dipakai:').waitFor();
    if (turns === 0) sawWrong = await page.getByText(pick.correct ? /Tata bahasa benar/ : /Ada kesalahan tata bahasa/).count() === 1 && await page.getByText('Penjelasan:').count() === 1;
    await button(page, pick.next === 'end' ? 'Selesaikan percakapan' : 'Lanjut').click();
    node = sc.nodes.find((n) => n.id === pick.next);
    turns++;
  }
  await page.getByText('Nilai menggabungkan ketepatan tata bahasa').waitFor();
  check('tiap respons dinilai tata bahasa dan kewajarannya', sawWrong);
  const s = await state(page);
  check('percakapan selesai dan nilai tersimpan', turns >= 3 && s.conversations[sc.id]?.best > 0, JSON.stringify(s.conversations));
  await page.screenshot({ path: path.join(SHOTS, 'conversation-end.png'), fullPage: true });
  const locked = pack.scenarios.find((x) => x.locked);
  await page.goto(`${BASE}/app/conversations?id=${locked.id}`);
  check('skenario Premium tertutup untuk tamu', await seen(page.getByText('Skenario Premium')));
  await ctx.close();
});

scenario('placement: tes penempatan berhenti di level yang belum dikuasai', async () => {
  const ctx = await newContext();
  const page = await open(ctx, '/app/placement');
  const pack = await fetchPack(page);
  const placement = pack.exercises.filter((e) => e.stage === 'placement');
  const a1 = new Set(placement.filter((e) => e.level === 'A1').map((e) => e.id));
  await button(page, 'Mulai tes').click();
  const answered = await runSession(page, pack, { deferred: true, plan: (_, id) => a1.has(id) });
  await page.getByText('Level awalmu').waitFor();
  const s = await state(page);
  const levels = [...new Set(answered.map((x) => placement.find((e) => e.id === x.id).level))];
  check('tes berhenti setelah blok A2 yang gagal', levels.join(',') === 'A1,A2' && answered.length < placement.length, `${levels} · ${answered.length}/${placement.length} soal`);
  check('pelajar ditempatkan di A2', s.profile.placementDone && s.profile.placementLevel === 'A2' && await page.getByText('A2', { exact: true }).first().isVisible(), s.profile.placementLevel);
  check('tes penempatan tidak memberi XP', s.xp === 0, String(s.xp));
  await ctx.close();
});

scenario('android: pemberitahuan versi baru hanya di aplikasi Android versi lama', async () => {
  // The APK opens /app?apk=<versionCode>; versions without it are recognised by the
  // android-app:// referrer (covered by tests/android.test.ts).
  const ctx = await newContext();
  const banner = (page) => page.getByRole('status').filter({ hasText: 'Versi baru aplikasi Lentera' });
  const page = await open(ctx, '/app?apk=2');
  check('aplikasi Android lama melihat ajakan memperbarui', await seen(banner(page), 20000));
  check('tombol Perbarui mengunduh APK dari situs', (await banner(page).getByRole('link', { name: 'Perbarui' }).getAttribute('href')) === '/download/lentera-english.apk');
  await page.goto(`${BASE}/app/review`);
  await page.locator('main').first().waitFor();
  check('ajakan tetap muncul di halaman lain pada sesi aplikasi yang sama', await seen(banner(page), 15000));
  await banner(page).getByRole('button', { name: 'Nanti saja' }).click();
  await page.goto(`${BASE}/app`);
  await page.locator('main').first().waitFor();
  await page.waitForTimeout(1500);
  check('"Nanti saja" menyembunyikan ajakan untuk versi ini', (await banner(page).count()) === 0);
  await ctx.close();

  const fresh = await newContext();
  const current = await open(fresh, '/app?apk=3');
  const browser = await fresh.newPage();
  await browser.goto(`${BASE}/app`);
  await browser.locator('main').first().waitFor({ timeout: 45000 });
  await current.waitForTimeout(1500);
  check('aplikasi versi terbaru dan browser biasa tidak melihat ajakan', (await banner(current).count()) === 0 && (await banner(browser).count()) === 0);
  await fresh.close();
});

scenario('payment: daftar, bayar QRIS, laporkan, admin konfirmasi, Premium aktif', async () => {
  const ctx = await newContext();
  const page = await open(ctx, '/daftar');
  const email = `bayar${stamp}@lentera.test`;
  await page.getByLabel('Nama').fill('Pembayar Uji');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Kata sandi').fill(PASSWORD);
  await button(page, 'Daftar').click();
  await page.waitForURL(/\/app$/, { timeout: 30000 });
  const sess = await session(page);
  const free = (await api('/api/content', sess.token)).data.pack;
  const premiumLesson = free.lessons.find((l) => l.locked);
  check('akun Free menerima pelajaran Premium tanpa isi', !!premiumLesson && premiumLesson.teaching.length === 0 && !free.exercises.some((e) => e.lessonId === premiumLesson.id));
  check('klien tidak bisa menjadikan dirinya Premium lewat profil', (await fetch(`${BASE}/api/me`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sess.token}` }, body: JSON.stringify({ role: 'admin', premium: true, plan: 'premium_yearly' }) }).then((r) => r.json())).profile.role === 'student' && (await api('/api/me', sess.token)).data.user.entitlement.premium === false);

  // Plans: yearly shows the struck-through price and the discount; QRIS is the only method.
  await page.goto(`${BASE}/app/subscription`);
  const yearly = page.locator('label', { has: page.getByRole('radio', { name: /Premium Tahunan/ }) });
  await yearly.waitFor({ timeout: 20000 });
  check('paket tahunan menampilkan Rp585.000 dicoret, diskon 15%, dan Rp497.250', await yearly.locator('.line-through', { hasText: 'Rp585.000' }).count() === 1 && await yearly.getByText('Diskon 15%').count() === 1 && await yearly.getByText('Rp497.250', { exact: true }).count() === 1);
  check('hanya QRIS yang ditawarkan sebagai metode pembayaran', await page.getByRole('radio', { name: /DANA|GoPay/ }).count() === 0 && await page.getByText('QRIS', { exact: true }).count() >= 1);
  await page.getByRole('radio', { name: /Premium Tahunan/ }).check();
  await button(page, /Bayar Rp497\.250 dengan QRIS/).click();
  await page.waitForURL(/\/app\/checkout\?tx=/, { timeout: 30000 });
  const txId = new URL(page.url()).searchParams.get('tx');
  await page.getByAltText(/Kode QRIS pembayaran Premium Tahunan, Rp497\.250/).waitFor({ timeout: 30000 });
  const tx = (await api(`/api/payments/${txId}`, sess.token)).data.transaction;
  check('QR yang ditampilkan berisi nominal Rp497.250 dari server', tx.amount_idr === 497250 && tx.checkout.value.includes('5406497250') && tx.method === 'manual_qris');
  check('gambar QR bisa disimpan untuk dipindai dari galeri', await page.getByRole('link', { name: 'Simpan gambar QR' }).getAttribute('download') === 'qris-lentera-premium_yearly.png');
  check('membuka halaman pembayaran tidak mengaktifkan Premium', (await api('/api/me', sess.token)).data.user.entitlement.premium === false);
  await page.screenshot({ path: path.join(SHOTS, 'checkout-qris.png'), fullPage: true });

  // The learner reports the payment.
  await button(page, 'Saya sudah bayar').waitFor();
  check('tombol lapor nonaktif sebelum nama pembayar diisi', await button(page, 'Saya sudah bayar').isDisabled());
  await page.getByLabel('Nama pemilik akun yang membayar').fill('Pembayar Uji');
  await page.getByLabel(/Catatan/).fill('Dibayar pakai DANA');
  await button(page, 'Saya sudah bayar').click();
  await page.getByText('Menunggu konfirmasi').first().waitFor({ timeout: 20000 });
  check('laporan bayar tidak mengaktifkan Premium', (await api('/api/me', sess.token)).data.user.entitlement.premium === false);
  await page.screenshot({ path: path.join(SHOTS, 'checkout-awaiting.png'), fullPage: true });

  // An admin confirms it; the open checkout page notices by itself.
  const adminSession = await adminAccount();
  check('pelajar tidak bisa mengonfirmasi pembayarannya sendiri', (await api('/api/admin', sess.token, { action: 'confirm-payment', id: txId })).status === 403);
  const confirmed = await api('/api/admin', adminSession.token, { action: 'confirm-payment', id: txId });
  check('admin mengonfirmasi pembayaran', confirmed.status === 200 && confirmed.data.outcome === 'activated', JSON.stringify(confirmed.data).slice(0, 200));
  await page.getByRole('heading', { name: 'Pembayaran dikonfirmasi' }).waitFor({ timeout: 30000 });
  const ent = (await api('/api/me', sess.token)).data.user.entitlement;
  const days = (new Date(ent.expires_at).getTime() - Date.now()) / DAY;
  check('Premium aktif 365 hari setelah konfirmasi admin', ent.premium === true && ent.plan === 'premium_yearly' && days > 364.9 && days <= 365, JSON.stringify(ent));
  const full = (await api('/api/content', sess.token)).data.pack;
  check('server mengirim isi pelajaran Premium setelah aktif', full.lessons.find((l) => l.id === premiumLesson.id).teaching.length > 0 && full.exercises.some((e) => e.lessonId === premiumLesson.id));
  await page.goto(`${BASE}/app`);
  await link(page, 'Premium').first().waitFor({ timeout: 20000 });
  check('lencana Premium tampil di aplikasi', await link(page, 'Premium').count() >= 1);
  await page.goto(`${BASE}/app/lesson?id=${premiumLesson.id}`);
  await page.locator('main h1, main p').first().waitFor();
  check('pelajaran Premium tidak lagi meminta berlangganan', await page.getByText('Pelajaran Premium', { exact: true }).count() === 0 && await page.getByText(/Pelajaran masih terkunci|Langkah 1 dari 8/).count() === 1);

  // A monthly renewal that the admin rejects.
  await page.goto(`${BASE}/app/subscription`);
  await page.getByText(/Premium aktif sampai/).waitFor({ timeout: 20000 });
  await page.getByRole('radio', { name: /Premium Bulanan/ }).check();
  await button(page, /Bayar Rp58\.500 dengan QRIS/).click();
  await page.waitForURL(/\/app\/checkout\?tx=/, { timeout: 30000 });
  const monthlyId = new URL(page.url()).searchParams.get('tx');
  await page.getByAltText(/Rp58\.500/).waitFor({ timeout: 30000 });
  await page.getByLabel('Nama pemilik akun yang membayar').fill('Nama Lain');
  await button(page, 'Saya sudah bayar').click();
  await page.getByText('Menunggu konfirmasi').first().waitFor({ timeout: 20000 });
  check('penolakan tanpa alasan ditolak server', (await api('/api/admin', adminSession.token, { action: 'reject-payment', id: monthlyId, reason: ' ' })).status === 400);
  const rejected = await api('/api/admin', adminSession.token, { action: 'reject-payment', id: monthlyId, reason: 'Tidak ada dana masuk atas nama ini.' });
  check('admin menolak pembayaran dengan alasan', rejected.status === 200 && rejected.data.outcome === 'rejected');
  await page.getByRole('heading', { name: 'Pembayaran belum bisa dikonfirmasi' }).waitFor({ timeout: 30000 });
  check('pelajar melihat alasan penolakan', await page.getByText('Tidak ada dana masuk atas nama ini.').count() === 1);
  check('Premium tidak diperpanjang oleh pembayaran yang ditolak', Math.abs(new Date((await api('/api/me', sess.token)).data.user.entitlement.expires_at).getTime() - new Date(ent.expires_at).getTime()) < 1000);

  await page.goto(`${BASE}/app/subscription`);
  const history = page.locator('table tbody tr');
  await history.first().waitFor({ timeout: 20000 });
  check('riwayat transaksi memuat keduanya dengan status yang benar', await history.filter({ hasText: 'Rp497.250' }).filter({ hasText: 'Berhasil' }).count() === 1 && await history.filter({ hasText: 'Rp58.500' }).filter({ hasText: 'Gagal' }).count() === 1);
  check('endpoint webhook Xendit tidak aktif', (await api('/api/webhooks/xendit', null, { event: 'payment.capture', data: {} })).status === 404);
  check('simulasi pembayaran Xendit tidak tersedia', (await api(`/api/payments/${txId}`, sess.token, { action: 'simulate' })).status === 403);
  await ctx.close();
});

// ───────────────────────── Runner ─────────────────────────
for (const { name, fn } of scenarios) {
  if (only.length && !only.some((w) => name.includes(w))) continue;
  console.log(`\n# ${name}`);
  const before = issues.length;
  try {
    await fn();
  } catch (e) {
    check(`skenario selesai tanpa macet`, false, String(e.message).split('\n').slice(0, 3).join(' '));
    for (const ctx of browser.contexts()) {
      for (const [i, p] of ctx.pages().entries()) await p.screenshot({ path: path.join(SHOTS, `gagal-${name.split(':')[0]}-${i}.png`) }).catch(() => {});
      await ctx.close();
    }
  }
  check('tidak ada error di konsol browser', issues.length === before, issues.slice(before, before + 4).join(' | '));
}
await browser.close();
console.log(process.exitCode ? '\nADA YANG GAGAL' : '\nSEMUA LOLOS');
