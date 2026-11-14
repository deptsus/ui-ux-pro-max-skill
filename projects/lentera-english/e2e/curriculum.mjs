// Walks EVERY lesson of the curriculum through the real UI on a phone viewport:
// guided practice, independent practice, the mastery test and the lesson's
// homework, answering each question with its authored key. A question whose
// key the app does not accept as "Benar!", a step that never appears, or a
// console error fails that lesson. Run after adding or editing lessons.
//
// Needs a server with the embedded backend and the admin address set (the
// admin account gets Premium, so Premium lessons open):
//   LENTERA_BACKEND=embedded LENTERA_ALLOW_EMBEDDED=1 LENTERA_DEV_ADMIN_EMAIL=admin@lentera.test \
//   LENTERA_DATA_DIR=/tmp/lentera-e2e/pglite npx next start -p 3100
//   npm run e2e:curriculum                 # every lesson
//   npm run e2e:curriculum -- a2-future    # only lessons whose id contains a word
import fs from 'node:fs';
import path from 'node:path';
import { BASE, check, chromium, fetchPack, runSession } from './lib.mjs';

const SHOTS = process.env.E2E_SHOTS ?? path.join(import.meta.dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const ADMIN = process.env.E2E_ADMIN_EMAIL ?? 'admin@lentera.test';
const PASSWORD = 'rahasia-12345';
const only = process.argv.slice(2);

const post = async (url, body) => {
  const res = await fetch(BASE + url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { status: res.status, data: await res.json().catch(() => ({})) };
};
let r = await post('/api/dev-auth', { action: 'signin', email: ADMIN, password: PASSWORD });
if (r.status !== 200) r = await post('/api/dev-auth', { action: 'signup', email: ADMIN, password: PASSWORD, name: 'Admin Kurikulum' });
if (r.status !== 200) throw new Error(`admin account unavailable: ${JSON.stringify(r.data)}`);
const session = r.data;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
await ctx.addInitScript((s) => { if (!localStorage.getItem('lentera.session')) localStorage.setItem('lentera.session', JSON.stringify(s)); }, session);
const page = await ctx.newPage();
const issues = [];
page.on('console', (m) => { if (m.type() === 'error' && !/status of 40[13]/.test(m.text())) issues.push(`${new URL(page.url()).pathname}${new URL(page.url()).search}: ${m.text().slice(0, 200)}`); });
page.on('pageerror', (e) => issues.push(`pageerror ${e.message}`));
const button = (name) => page.getByRole('button', { name });

await page.goto(`${BASE}/app`);
await page.locator('main').first().waitFor({ timeout: 45000 });
await page.waitForFunction((uid) => !!localStorage.getItem(`lentera.state.${uid}`), session.userId, { timeout: 30000 });
// A learner placed at C2 may enter every lesson below C2, and C2 lessons in order.
await page.evaluate((uid) => {
  const key = `lentera.state.${uid}`;
  const s = JSON.parse(localStorage.getItem(key));
  s.profile.placementLevel = 'C2';
  s.profile.placementDone = true;
  s.updatedAt = Date.now();
  localStorage.setItem(key, JSON.stringify(s));
}, session.userId);
await page.reload();
await page.locator('main').first().waitFor({ timeout: 45000 });
const pack = await fetchPack(page, session.token);

// Curriculum order: level, chapter, unit, lesson.
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const chapterOf = new Map(pack.chapters.map((c) => [c.id, c]));
const unitOf = new Map(pack.units.map((u) => [u.id, u]));
const key = (l) => {
  const u = unitOf.get(l.unitId);
  const c = chapterOf.get(u.chapterId);
  return [LEVELS.indexOf(c.level), c.position, u.position, l.position];
};
const lessons = [...pack.lessons].sort((a, b) => {
  const [x, y] = [key(a), key(b)];
  for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
}).filter((l) => !only.length || only.some((w) => l.id.includes(w)));

const started = Date.now();
for (const l of lessons) {
  const before = issues.length;
  const t0 = Date.now();
  let answered = 0;
  try {
    await page.goto(`${BASE}/app/lesson?id=${l.id}`);
    await button('Mulai belajar').click({ timeout: 30000 });
    await button('Lihat contoh benar dan salah').click();
    await button('Lanjut ke latihan').click();
    await button('Mulai latihan').click();
    answered += (await runSession(page, pack)).length;
    await page.getByRole('heading', { name: 'Latihan terbimbing selesai' }).waitFor({ timeout: 15000 });
    await button(/Lanjut ke latihan mandiri/).click();
    await button('Mulai latihan mandiri').click();
    answered += (await runSession(page, pack)).length;
    await page.getByRole('heading', { name: 'Latihan mandiri selesai' }).waitFor({ timeout: 15000 });
    await button(/Lanjut ke pr/i).click();
    await button(/Terima PR/).click();
    await button('Lanjut ke tes penguasaan').click();
    await button('Mulai tes').click();
    answered += (await runSession(page, pack, { deferred: true })).length;
    await page.getByRole('heading', { name: 'Lulus tes penguasaan!' }).waitFor({ timeout: 15000 });
    await button('Lanjut').click();
    await page.getByRole('heading', { name: 'Jadwal ulangan' }).waitFor({ timeout: 15000 });
    await page.goto(`${BASE}/app/homework?id=hw.${l.id}`);
    await button('Kerjakan PR').click({ timeout: 30000 });
    answered += (await runSession(page, pack)).length;
    await page.getByRole('heading', { name: 'PR dikumpulkan' }).waitFor({ timeout: 15000 });
    check(`${l.id}: ${answered} soal dijawab, semua diterima${issues.length > before ? '' : ', tanpa error'} (${Math.round((Date.now() - t0) / 1000)} dtk)`, issues.length === before, issues.slice(before, before + 3).join(' | '));
  } catch (e) {
    await page.screenshot({ path: path.join(SHOTS, `kurikulum-gagal-${l.id}.png`), fullPage: true }).catch(() => {});
    check(`${l.id}: macet setelah ${answered} soal`, false, String(e.message).split('\n')[0].slice(0, 200));
  }
}
console.log(`\n${lessons.length} pelajaran dalam ${Math.round((Date.now() - started) / 60000)} menit.`);
await browser.close();
console.log(process.exitCode ? '\nADA YANG GAGAL' : '\nSEMUA LOLOS');
