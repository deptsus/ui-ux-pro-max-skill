// Plays EVERY listening item and EVERY conversation scenario through the real UI
// on a phone viewport, as an admin (Premium). Listening: all questions answered
// with their keys (dictation included) must be accepted. Conversations: the best
// path must reach the end with 100%, and a second path that takes every detour
// (repair nodes, weaker replies) must also reach the end and show feedback on
// each turn. Finally a guest checks that Premium items stay closed and that their
// text never reaches the browser.
//
// Needs the same server as e2e:curriculum (embedded backend, admin address set):
//   npm run e2e:skills                  # everything
//   npm run e2e:skills -- c2 bad-news   # only ids containing a word
import fs from 'node:fs';
import path from 'node:path';
import { BASE, check, chromium, fetchPack, runSession } from './lib.mjs';

const SHOTS = process.env.E2E_SHOTS ?? path.join(import.meta.dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const ADMIN = process.env.E2E_ADMIN_EMAIL ?? 'admin@lentera.test';
const PASSWORD = 'rahasia-12345';
const only = process.argv.slice(2);
const wanted = (id) => !only.length || only.some((w) => id.includes(w));

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
const button = (name) => page.getByRole('button', { name, exact: true });

await page.goto(`${BASE}/app`);
await page.locator('main').first().waitFor({ timeout: 45000 });
await page.waitForFunction((uid) => !!localStorage.getItem(`lentera.state.${uid}`), session.userId, { timeout: 30000 });
const pack = await fetchPack(page, session.token);

// ---------------------------------------------------------------- lists
await page.goto(`${BASE}/app/listening`);
await page.getByRole('heading', { name: /^Level C2/ }).waitFor({ timeout: 30000 });
const listeningLevels = await page.getByRole('heading', { name: /^Level (A1|A2|B1|B2|C1|C2) ·/ }).count();
check(`Pusat Menyimak dikelompokkan per level (${listeningLevels} level, ${pack.listening.length} materi)`, listeningLevels === 6);
await page.screenshot({ path: path.join(SHOTS, 'skills-listening-list.png'), fullPage: true });
await page.goto(`${BASE}/app/conversations`);
await page.getByRole('heading', { name: /^Level C2/ }).waitFor({ timeout: 30000 });
const scenarioLevels = await page.getByRole('heading', { name: /^Level (A1|A2|B1|B2|C1|C2) ·/ }).count();
check(`Simulator Percakapan dikelompokkan per level (${scenarioLevels} level, ${pack.scenarios.length} skenario)`, scenarioLevels === 6);

// ---------------------------------------------------------------- listening
for (const item of pack.listening.filter((l) => wanted(l.id))) {
  const before = issues.length;
  try {
    await page.goto(`${BASE}/app/listening?id=${item.id}`);
    await page.getByRole('button', { name: 'Tampilkan transkrip' }).click({ timeout: 30000 });
    const shown = await page.getByText(item.transcript.slice(0, 40), { exact: false }).count();
    await page.getByRole('button', { name: 'Sembunyikan transkrip' }).click();
    await page.getByRole('button', { name: `Jawab ${item.questionIds.length} pertanyaan` }).click();
    const answered = await runSession(page, pack);
    await page.getByRole('heading', { name: 'Latihan menyimak selesai' }).waitFor({ timeout: 15000 });
    const dictations = item.questionIds.filter((q) => pack.exercises.find((e) => e.id === q)?.type === 'fill').length;
    check(`${item.id} (${item.level}): ${answered.length}/${item.questionIds.length} soal diterima${dictations ? `, termasuk ${dictations} dikte` : ''}, transkrip bisa dibuka`, answered.length === item.questionIds.length && shown > 0 && issues.length === before, issues.slice(before, before + 3).join(' | '));
  } catch (e) {
    await page.screenshot({ path: path.join(SHOTS, `skills-gagal-${item.id}.png`), fullPage: true }).catch(() => {});
    check(`${item.id}: macet`, false, String(e.message).split('\n')[0].slice(0, 200));
  }
}

// ---------------------------------------------------------------- conversations
const best = (node) => node.options.find((o) => o.correct && o.natural === 3);
async function play(sc, choose, label) {
  await page.goto(`${BASE}/app/conversations?id=${sc.id}`);
  let node = sc.nodes.find((n) => n.id === sc.start);
  const visited = [];
  let feedback = 0;
  while (node && visited.length < 20) {
    visited.push(node.id);
    const pick = choose(node, visited);
    await page.getByRole('button', { name: pick.text, exact: true }).click({ timeout: 30000 });
    await page.getByText('Ungkapan lain yang bisa dipakai:').waitFor({ timeout: 10000 });
    if (await page.getByText(pick.correct ? 'Tata bahasa benar' : 'Ada kesalahan tata bahasa', { exact: true }).count()) feedback++;
    await button(pick.next === 'end' ? 'Selesaikan percakapan' : 'Lanjut').click();
    node = sc.nodes.find((n) => n.id === pick.next);
  }
  await page.getByText('Nilai menggabungkan ketepatan tata bahasa').waitFor({ timeout: 15000 });
  return { visited, feedback, label };
}
for (const sc of pack.scenarios.filter((s) => wanted(s.id))) {
  const before = issues.length;
  try {
    const a = await play(sc, best, 'terbaik');
    const stateBest = await page.evaluate((uid) => JSON.parse(localStorage.getItem(`lentera.state.${uid}`)).conversations, session.userId);
    // Detour path: go to a node not yet seen when possible, otherwise take the weakest reply.
    const b = await play(sc, (node, visited) => {
      const fresh = node.options.find((o) => o.next !== 'end' && !visited.includes(o.next) && !a.visited.includes(o.next));
      return fresh ?? [...node.options].sort((x, y) => (x.correct ? x.natural : 0) - (y.correct ? y.natural : 0))[0];
    }, 'memutar');
    const covered = new Set([...a.visited, ...b.visited]);
    const ok = stateBest[sc.id]?.best === 100 && a.feedback === a.visited.length && b.feedback === b.visited.length && covered.size === sc.nodes.length && issues.length === before;
    check(`${sc.id} (${sc.level}): jalur terbaik 100%, jalur memutar selesai, ${covered.size}/${sc.nodes.length} giliran terlihat, umpan balik di tiap giliran`, ok, `${JSON.stringify(stateBest[sc.id])} ${a.visited.join('>')} | ${b.visited.join('>')} ${issues.slice(before, before + 2).join(' | ')}`);
  } catch (e) {
    await page.screenshot({ path: path.join(SHOTS, `skills-gagal-${sc.id}.png`), fullPage: true }).catch(() => {});
    check(`${sc.id}: macet`, false, String(e.message).split('\n')[0].slice(0, 200));
  }
}
await ctx.close();

// ---------------------------------------------------------------- guest
const guest = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const gp = await guest.newPage();
await gp.goto(`${BASE}/app/listening`);
await gp.getByRole('heading', { name: /^Level C2/ }).waitFor({ timeout: 45000 });
const freePack = await fetchPack(gp);
const upperListening = freePack.listening.filter((l) => ['B1', 'B2', 'C1', 'C2'].includes(l.level));
const upperScenarios = freePack.scenarios.filter((s) => ['B2', 'C1', 'C2'].includes(s.level));
check('tamu: materi menyimak B1–C2 terkunci tanpa transkrip dan tanpa soal', upperListening.length >= 12 && upperListening.every((l) => l.locked && !l.transcript && !l.questionIds.length));
check('tamu: skenario B2–C2 terkunci tanpa isi dialog', upperScenarios.length >= 7 && upperScenarios.every((s) => s.locked && !s.nodes.length));
check('tamu: PR menyimak bab Premium tidak dikirim', !freePack.homework.some((h) => /^hw\.(b1|b2|c1|c2)-c\d\.listen$/.test(h.id)));
const raw = await gp.evaluate(async () => (await fetch('/api/content')).text());
check('tamu: teks rekaman Premium tidak ada di respons server', !raw.includes('won over') && !raw.includes('negligible') && !raw.includes('Bright Smile'));
await gp.goto(`${BASE}/app/listening?id=listen-c2-app`);
check('tamu: membuka materi C2 menampilkan ajakan Premium', await gp.getByText('Audio Premium').waitFor({ timeout: 15000 }).then(() => true).catch(() => false));
await gp.goto(`${BASE}/app/conversations?id=press`);
check('tamu: membuka skenario C2 menampilkan ajakan Premium', await gp.getByText('Skenario Premium').waitFor({ timeout: 15000 }).then(() => true).catch(() => false));
await guest.close();

await browser.close();
console.log(process.exitCode ? '\nADA YANG GAGAL' : '\nSEMUA LOLOS');
