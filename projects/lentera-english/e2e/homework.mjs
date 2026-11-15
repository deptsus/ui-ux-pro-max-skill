// Rilis 4 through the real UI and API: weekly PR, B2–C2 writing with leveled
// examples, the homework calendar (.ics), reminders (API, scheduled endpoint)
// and the owner's "PR" tab.
//
// Needs a fresh server with the embedded backend and the admin address set:
//   LENTERA_BACKEND=embedded LENTERA_ALLOW_EMBEDDED=1 LENTERA_DEV_ADMIN_EMAIL=admin@lentera.test \
//   LENTERA_DATA_DIR=/tmp/lentera-e2e/pglite npx next start -p 3100
//   node e2e/homework.mjs
import fs from 'node:fs';
import path from 'node:path';
import { BASE, check, chromium, fetchPack, runSession } from './lib.mjs';

const SHOTS = process.env.E2E_SHOTS ?? path.join(import.meta.dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const ADMIN = process.env.E2E_ADMIN_EMAIL ?? 'admin@lentera.test';
const PASSWORD = 'rahasia-12345';
const DAY = 24 * 3600 * 1000;

const call = async (url, body, token) => {
  const res = await fetch(BASE + url, { method: body === undefined ? 'GET' : 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: res.status, data: await res.json().catch(() => ({})) };
};
let r = await call('/api/dev-auth', { action: 'signin', email: ADMIN, password: PASSWORD });
if (r.status !== 200) r = await call('/api/dev-auth', { action: 'signup', email: ADMIN, password: PASSWORD, name: 'Sari PR' });
if (r.status !== 200) throw new Error(`admin account unavailable: ${JSON.stringify(r.data)}`);
const session = r.data;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true, acceptDownloads: true });
await ctx.addInitScript((s) => { if (!localStorage.getItem('lentera.session')) localStorage.setItem('lentera.session', JSON.stringify(s)); }, session);
const page = await ctx.newPage();
const issues = [];
page.on('console', (m) => { if (m.type() === 'error' && !/status of 40[13]|status of 409/.test(m.text())) issues.push(`${new URL(page.url()).pathname}: ${m.text().slice(0, 200)}`); });
page.on('pageerror', (e) => issues.push(`pageerror ${e.message}`));
const button = (name) => page.getByRole('button', { name });
const state = () => page.evaluate((uid) => JSON.parse(localStorage.getItem(`lentera.state.${uid}`)), session.userId);

await page.goto(`${BASE}/app`);
await page.locator('main').first().waitFor({ timeout: 45000 });
await page.waitForFunction((uid) => !!localStorage.getItem(`lentera.state.${uid}`), session.userId, { timeout: 30000 });
const pack = await fetchPack(page, session.token);

// ── A week of work: two A2 topics, two mistakes on was/were, B2 chapter 1 started ──
const pool = (topic) => pack.exercises.filter((e) => e.topic === topic && ['independent', 'mastery', 'drill', 'homework'].includes(e.stage));
const pastBe = pool('a2.past-be');
const future = pool('a2.future');
const tag = pack.tags.find((t) => t.topic === 'a2.past-be').id;
const b2Lesson = pack.lessons.find((l) => pack.units.find((u) => u.id === l.unitId)?.chapterId === 'b2-c1');
await page.evaluate(({ uid, pastBe, future, tag, b2Lesson }) => {
  const k = `lentera.state.${uid}`;
  const s = JSON.parse(localStorage.getItem(k));
  const now = Date.now();
  let n = 0;
  const add = (e, ok, at, t) => s.attempts.push({ id: `e2e${n++}`, at, ex: e.id, topic: e.topic, ok, tag: t, ms: 5000, ctx: 'independent', d: e.difficulty, given: ok ? 'ok' : 'x' });
  pastBe.slice(0, 6).forEach((e, i) => add(e, true, now - 2 * 86400000 + i * 1000));
  future.slice(0, 3).forEach((e, i) => add(e, true, now - 3 * 86400000 + i * 1000));
  add(pastBe[6], false, now - 4 * 86400000, tag);
  add(pastBe[7], false, now - 3 * 86400000, tag);
  s.lessons[b2Lesson] = { startedAt: now - 86400000, step: 2, masteryBest: 0, masteryAttempts: 0 };
  s.updatedAt = now;
  localStorage.setItem(k, JSON.stringify(s));
}, { uid: session.userId, pastBe, future, tag, b2Lesson: b2Lesson.id });

// ── Weekly PR ──
try {
  await page.goto(`${BASE}/app/homework`);
  const weeklyTitle = page.getByRole('heading', { name: /^PR Mingguan · / });
  await weeklyTitle.waitFor({ timeout: 30000 });
  const note = await page.getByText(/soal dari topik minggu ini/).first().innerText();
  check('PR Mingguan muncul sendiri dari pekerjaan minggu ini', /Was dan were/i.test(note) && /soal dari kesalahanmu sendiri/.test(note), note);
  await page.screenshot({ path: path.join(SHOTS, 'pr-pusat.png'), fullPage: true });
  const s = await state();
  const id = Object.keys(s.homework).find((x) => x.startsWith('hw.week.'));
  check('PR mingguan tersimpan di kemajuan dengan 10 soal tetap', s.homework[id]?.exerciseIds?.length === 10, JSON.stringify(s.homework[id]?.parts));
  await page.getByRole('link', { name: 'Kerjakan PR mingguan' }).click();
  await button('Kerjakan PR').click({ timeout: 20000 });
  const answered = await runSession(page, pack);
  await page.getByRole('heading', { name: 'PR dikumpulkan' }).waitFor({ timeout: 20000 });
  const after = await state();
  check(`PR mingguan dikerjakan (${answered.length} soal) dan tercatat`, answered.length === 10 && after.homework[id].submissions.length === 1, JSON.stringify(after.homework[id].submissions));
} catch (e) {
  await page.screenshot({ path: path.join(SHOTS, 'pr-gagal-mingguan.png'), fullPage: true }).catch(() => {});
  check('PR mingguan: gagal', false, String(e.message).split('\n')[0].slice(0, 200));
}

// ── B2 writing with leveled examples ──
try {
  await page.goto(`${BASE}/app/homework`);
  await page.getByText('Menulis: Ringkasan Berita').waitFor({ timeout: 30000 });
  await page.locator('li', { hasText: 'Menulis: Ringkasan Berita' }).getByRole('button', { name: 'Ambil tugas' }).click();
  await page.goto(`${BASE}/app/homework?id=hw.b2-c1.write`);
  await page.getByText('Teks sumber').waitFor({ timeout: 30000 });
  check('tugas ringkasan menampilkan teks sumber berita', await page.getByText(/BANDUNG — The old central library/).isVisible());
  const rows = (await call('/api/admin', { action: 'content' }, session.token)).data.homework;
  const task = rows.find((h) => h.id === 'hw.b2-c1.write').writing;
  await page.getByLabel('Tulisanmu').fill(`${task.model} ${'This sentence only makes the summary longer than allowed. '.repeat(4)}`);
  await button('Kumpulkan').click();
  const tooLong = await page.getByRole('heading', { name: /Hasil pemeriksaan/ }).innerText({ timeout: 15000 });
  check('ringkasan yang terlalu panjang tidak lolos syarat jumlah kata', !tooLong.endsWith('100%') && await page.getByText(/60–90 kata \(kamu menulis \d+\)/).isVisible(), tooLong);
  await page.getByLabel('Tulisanmu').fill(task.model);
  await button('Kumpulkan').click();
  const score = await page.getByRole('heading', { name: /Hasil pemeriksaan/ }).innerText({ timeout: 15000 });
  check('contoh jawaban terbaik dinilai 100%', score.endsWith('100%'), score);
  check('contoh jawaban bertingkat tampil: Cukup, Baik, Sangat baik', await page.getByText('Contoh jawaban bertingkat').isVisible() && (await page.locator('details summary').allInnerTexts()).map((t) => t.split(' · ')[0]).join('|') === '1. Cukup|2. Baik|3. Sangat baik');
  await page.screenshot({ path: path.join(SHOTS, 'pr-menulis-b2.png'), fullPage: true });
} catch (e) {
  await page.screenshot({ path: path.join(SHOTS, 'pr-gagal-menulis.png'), fullPage: true }).catch(() => {});
  check('menulis B2: gagal', false, String(e.message).split('\n')[0].slice(0, 200));
}

// ── Calendar and .ics ──
try {
  // A PR due tomorrow, still open, for the calendar and the reminder below.
  await page.evaluate((uid) => {
    const k = `lentera.state.${uid}`;
    const s = JSON.parse(localStorage.getItem(k));
    const now = Date.now();
    s.homework['hw.a2-c1.write'] = { assignedAt: now - 3 * 86400000, dueAt: now + 10 * 3600000, submissions: [] };
    s.updatedAt = now;
    localStorage.setItem(k, JSON.stringify(s));
  }, session.userId);
  await page.goto(`${BASE}/app/homework`);
  await page.getByRole('heading', { name: 'Kalender PR' }).waitFor({ timeout: 30000 });
  const due = new Date(Date.now() + 10 * 3600000);
  await page.getByRole('button', { name: new RegExp(`^${due.getDate()} \\S+: \\d+ PR`) }).first().click();
  check('kalender menandai hari tenggat dan menampilkan PR-nya', await page.getByText(/Menulis: Akhir Pekan Lalu/).first().isVisible());
  const [download] = await Promise.all([page.waitForEvent('download'), button(/Simpan \d+ tenggat ke kalender HP/).click()]);
  const ics = fs.readFileSync(await download.path(), 'utf8');
  check('file kalender .ics berisi tenggat PR yang belum dikumpulkan, dengan alarm', download.suggestedFilename() === 'tenggat-pr-lentera.ics' && ics.includes('BEGIN:VEVENT') && ics.includes('Akhir Pekan Lalu') && ics.includes('BEGIN:VALARM'));
  await page.getByRole('heading', { name: 'Kalender PR' }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(SHOTS, 'pr-kalender.png') });
} catch (e) {
  await page.screenshot({ path: path.join(SHOTS, 'pr-gagal-kalender.png'), fullPage: true }).catch(() => {});
  check('kalender: gagal', false, String(e.message).split('\n')[0].slice(0, 200));
}

// ── Reminders ──
try {
  // Headless Chromium reports notifications as blocked whatever is granted, and
  // has no push service: subscribing can only be proven on a real phone. Here
  // the card must explain the blocked state instead of offering a dead button.
  await page.getByRole('heading', { name: 'Pengingat PR di HP' }).waitFor({ timeout: 20000 });
  check('kartu pengingat menjelaskan bila notifikasi diblokir, tanpa tombol yang tidak berfungsi', await page.getByText(/Notifikasi untuk Lentera diblokir/).isVisible() && (await button('Nyalakan pengingat').count()) === 0);
  const sub = await call('/api/push', { action: 'subscribe-reminders', subscription: { endpoint: 'https://push.example.test/e2e-reminder', keys: { p256dh: 'B'.repeat(87), auth: 'A'.repeat(22) } } }, session.token);
  check('pelajar bisa mendaftarkan perangkat untuk pengingat PR', sub.status === 200 && sub.data.devices === 1, JSON.stringify(sub));
  check('API pengingat menolak tanpa login', (await call('/api/push', { action: 'subscribe-reminders', subscription: {} })).status === 401);
  // The snapshot must reach the server before the job can see the PR.
  const snap = await state();
  await call('/api/sync', { events: [], snapshot: { ...snap, outbox: [] }, updatedAt: Date.now() + 1000 }, session.token);
  const run1 = await call('/api/cron/reminders', {});
  const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Asia/Jakarta' }).format(Date.now()));
  if (hour >= 7 && hour < 20) {
    check('pekerjaan terjadwal menemukan PR yang tenggatnya < 24 jam dan mencoba mengirim', run1.status === 200 && run1.data.learners === 1 && run1.data.failed === 1 && run1.data.reminded === 0, JSON.stringify(run1.data));
    const run2 = await call('/api/cron/reminders', {});
    check('panggilan kedua dalam 50 menit tidak melakukan apa-apa', run2.data.skipped === 'ran-recently', JSON.stringify(run2.data));
  } else {
    check('di luar 07.00–20.00 WIB pekerjaan terjadwal tidak mengirim apa pun', run1.data.skipped === 'quiet-hours', JSON.stringify(run1.data));
  }
} catch (e) {
  await page.screenshot({ path: path.join(SHOTS, 'pr-gagal-pengingat.png'), fullPage: true }).catch(() => {});
  check('pengingat: gagal', false, String(e.message).split('\n')[0].slice(0, 200));
}

// ── Owner's PR tab ──
try {
  const desk = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await desk.addInitScript((s) => localStorage.setItem('lentera.session', JSON.stringify(s)), session);
  const a = await desk.newPage();
  await a.goto(`${BASE}/admin`);
  await a.getByRole('tab', { name: /^PR/ }).click({ timeout: 45000 });
  await a.getByRole('heading', { name: 'Per pelajar' }).waitFor({ timeout: 30000 });
  const text = await a.locator('#panel-homework').innerText();
  check('tab PR di /admin menampilkan ringkasan, per PR (mingguan digabung), dan per pelajar', text.includes('PR Mingguan (semua minggu)') && text.includes('Sari PR') && text.includes('HP dengan pengingat'), text.slice(0, 200));
  await a.screenshot({ path: path.join(SHOTS, 'admin-pr.png'), fullPage: true });
  await desk.close();
} catch (e) {
  check('tab PR admin: gagal', false, String(e.message).split('\n')[0].slice(0, 200));
}

check('tanpa error di konsol', issues.length === 0, issues.slice(0, 3).join(' | '));
await browser.close();
console.log(process.exitCode ? '\nADA YANG GAGAL' : '\nSEMUA LOLOS');
