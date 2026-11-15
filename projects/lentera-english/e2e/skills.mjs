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
import { BASE, answerCurrent, check, chromium, fetchPack, runSession } from './lib.mjs';

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
await ctx.addInitScript((s) => {
  if (!localStorage.getItem('lentera.session')) localStorage.setItem('lentera.session', JSON.stringify(s));
  localStorage.setItem('lentera.story.sound', '0');
}, session);
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
// ---------------------------------------------------------------- stories
const moodAfter = async (correct) => {
  await answerCurrent(page, pack, correct);
  await page.getByRole('button', { name: 'Periksa', exact: true }).click();
  await page.getByText(correct ? 'Benar!' : 'Belum tepat', { exact: true }).waitFor({ timeout: 5000 });
  const mood = await page.locator('footer svg[data-mood]').first().getAttribute('data-mood');
  await page.getByRole('button', { name: 'Lanjut', exact: true }).click();
  return mood;
};
const moods = [];
const branchScore = (picks) => Math.round((picks.reduce((n, c) => n + (c.correct ? c.natural : 0), 0) / (3 * picks.length)) * 100);
const BADGE = (c) => (!c.correct ? 'Salah tata bahasa' : c.natural === 3 ? 'Tepat dan wajar' : 'Benar, tetapi kurang tepat');
/** Plays a branching story from its first line to an ending, choosing with `pick`. */
async function playBranch(st, pick, label, avoid = []) {
  const nodes = new Map(st.branch.nodes.map((n) => [n.id, n]));
  const intro = st.scenes.flatMap((sc) => sc.lines);
  const visited = [];
  const picks = [];
  let lines = 0;
  let matches = 0;
  let feedback = 0;
  for (let k = 0; k < 120; k++) {
    const tag = await page.locator('[data-line]').getAttribute('data-line', { timeout: 10000 });
    const cut = tag.lastIndexOf('-');
    const nodeId = tag.slice(0, cut);
    const idx = Number(tag.slice(cut + 1));
    const expected = nodeId === 'intro' ? intro[idx]?.en : nodes.get(nodeId)?.scene.lines[idx]?.en;
    if ((await page.locator('[data-line]').innerText()) === expected) matches++;
    lines++;
    if (nodeId !== 'intro' && visited.at(-1) !== nodeId) visited.push(nodeId);
    if (await page.getByRole('button', { name: 'Lihat akhir cerita' }).count()) {
      await page.getByRole('button', { name: 'Lihat akhir cerita' }).click();
      break;
    }
    const group = page.getByRole('group', { name: 'Pilihan jawaban' });
    if (await group.count()) {
      const node = nodes.get(nodeId);
      const choice = pick(node, visited, avoid);
      picks.push(choice);
      await group.getByRole('button', { name: choice.text, exact: true }).click();
      await page.getByText(BADGE(choice), { exact: true }).waitFor({ timeout: 5000 });
      if ((await page.getByText(choice.note, { exact: true }).count()) && (!choice.better || (await page.getByText(choice.better, { exact: true }).count()))) feedback++;
      await page.getByRole('button', { name: 'Lanjut', exact: true }).click();
      continue;
    }
    await page.getByRole('button', { name: 'Lanjut', exact: true }).click();
  }
  const ending = nodes.get(visited.at(-1))?.ending;
  await page.getByRole('heading', { name: ending.title }).waitFor({ timeout: 10000 });
  const score = branchScore(picks);
  const shownScore = await page.getByText(`${score}%`, { exact: true }).count();
  const reviewed = await page.locator('[data-branch-review] > li').count();
  const expectedLines = intro.length + visited.reduce((n, id) => n + nodes.get(id).scene.lines.length, 0);
  return { label, visited, picks, score, ending, ok: lines === expectedLines && matches === lines && feedback === picks.length && shownScore > 0 && reviewed === picks.length, detail: `${label}: ${lines}/${expectedLines} kalimat, ${matches} cocok, umpan balik ${feedback}/${picks.length}, ulasan ${reviewed}` };
}
for (const st of (pack.stories ?? []).filter((x) => wanted(x.id) && x.branch)) {
  const before = issues.length;
  try {
    await page.goto(`${BASE}/app/stories?id=${st.id}`);
    await page.getByRole('button', { name: 'Mulai cerita' }).click({ timeout: 30000 });
    const a = await playBranch(st, (node) => node.choices.find((c) => c.correct && c.natural === 3), 'terbaik');
    const stamped = await page.evaluate(([uid, id]) => !!JSON.parse(localStorage.getItem(`lentera.state.${uid}`)).rewards[`story:${id}`], [session.userId, st.id]);
    // "Coba jalur lain" replays from the start; this time take unseen branches, else the weakest reply.
    await page.getByRole('button', { name: 'Coba jalur lain' }).click();
    const b = await playBranch(st, (node, visited, avoid) => node.choices.find((o) => !visited.includes(o.next) && !avoid.includes(o.next))
      ?? [...node.choices].sort((x, y) => (x.correct ? x.natural : 0) - (y.correct ? y.natural : 0))[0], 'memutar', a.visited);
    const covered = new Set([...a.visited, ...b.visited]);
    check(`${st.id} (${st.level}, bercabang): jalur terbaik ${a.score}% dan akhir "${a.ending.title}", jalur lain ${b.score}% dan akhir "${b.ending.title}", ${covered.size}/${st.branch.nodes.length} adegan terlihat, tercatat selesai`,
      a.ok && b.ok && a.score === 100 && a.ending.good && b.score < 100 && b.ending.title !== a.ending.title && covered.size === st.branch.nodes.length && stamped && issues.length === before,
      `${a.detail} | ${b.detail} | ${a.visited.join('>')} / ${b.visited.join('>')} ${issues.slice(before, before + 2).join(' | ')}`);
    if (st.id === 'story-cafe-interview') await page.screenshot({ path: path.join(SHOTS, 'skills-story-branch-end.png'), fullPage: true });
  } catch (e) {
    await page.screenshot({ path: path.join(SHOTS, `skills-gagal-${st.id}.png`), fullPage: true }).catch(() => {});
    check(`${st.id}: macet`, false, String(e.message).split('\n')[0].slice(0, 200));
  }
}
for (const st of (pack.stories ?? []).filter((x) => wanted(x.id) && !x.branch)) {
  const before = issues.length;
  try {
    await page.goto(`${BASE}/app/stories?id=${st.id}`);
    await page.getByRole('button', { name: 'Mulai cerita' }).click({ timeout: 30000 });
    const total = st.scenes.reduce((n, sc) => n + sc.lines.length, 0);
    let shown = 0;
    let matches = 0;
    const scenes = new Set();
    for (let k = 0; k < total + 2; k++) {
      const text = await page.locator('[data-line]').innerText();
      const idx = Number(await page.locator('[data-line]').getAttribute('data-line'));
      const expected = st.scenes.flatMap((sc) => sc.lines)[idx]?.en;
      if (text === expected) matches++;
      scenes.add(/Adegan (\d+)/.exec(await page.locator('svg.story-stage').getAttribute('aria-label'))[1]);
      shown++;
      if (await page.getByRole('button', { name: /Jawab \d+ pertanyaan/ }).count()) break;
      await page.getByRole('button', { name: 'Lanjut', exact: true }).click();
    }
    await page.getByRole('button', { name: /Jawab \d+ pertanyaan/ }).click();
    // First two stories also check Pijar's reaction: cheering when right, encouraging when wrong.
    const manual = moods.length < 2 ? 1 : 0;
    if (manual) moods.push(await moodAfter(moods.length === 0));
    const answered = await runSession(page, pack);
    await page.getByRole('heading', { name: 'Cerita selesai' }).waitFor({ timeout: 15000 });
    const stamped = await page.evaluate(([uid, id]) => !!JSON.parse(localStorage.getItem(`lentera.state.${uid}`)).rewards[`story:${id}`], [session.userId, st.id]);
    check(`${st.id} (${st.level}): ${shown}/${total} kalimat tampil sesuai naskah, ${scenes.size}/${st.scenes.length} adegan, ${answered.length + manual}/${st.questionIds.length} soal, tercatat selesai`,
      shown === total && matches === total && scenes.size === st.scenes.length && answered.length + manual === st.questionIds.length && stamped && issues.length === before, `${shown}/${matches}/${total} ${issues.slice(before, before + 2).join(' | ')}`);
  } catch (e) {
    await page.screenshot({ path: path.join(SHOTS, `skills-gagal-${st.id}.png`), fullPage: true }).catch(() => {});
    check(`${st.id}: macet`, false, String(e.message).split('\n')[0].slice(0, 200));
  }
}
if (moods.length === 2) check(`Pijar bereaksi: ${moods[0]} saat benar, ${moods[1]} saat salah`, moods[0] === 'cheer' && moods[1] === 'encourage');
{
  await page.goto(`${BASE}/app/stories?id=story-first-day`);
  await page.getByRole('button', { name: 'Mulai cerita' }).click({ timeout: 30000 });
  const anim = await page.locator('.story-stage .st-blink').first().evaluate((el) => getComputedStyle(el).animationName);
  check('adegan cerita beranimasi (tokoh berkedip)', anim === 'pj-blink', anim);
  await page.screenshot({ path: path.join(SHOTS, 'skills-story.png') });
}
await ctx.close();
{
  const still = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  await still.addInitScript((s) => { localStorage.setItem('lentera.session', JSON.stringify(s)); localStorage.setItem('lentera.story.sound', '0'); }, session);
  const sp = await still.newPage();
  await sp.goto(`${BASE}/app/stories?id=story-first-day`);
  await sp.getByRole('button', { name: 'Mulai cerita' }).click({ timeout: 45000 });
  const names = await sp.evaluate(() => [...document.querySelectorAll('.story-stage *, .pijar *')].map((el) => getComputedStyle(el).animationName).filter((n) => n !== 'none'));
  check('mode "kurangi gerakan": tidak ada animasi di adegan cerita', names.length === 0, names.slice(0, 3).join(','));
  await still.close();
}

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
const freeStories = freePack.stories ?? [];
check('tamu: cerita pertama gratis lengkap, cerita lain terkunci tanpa adegan dan soal', freeStories.find((x) => x.id === 'story-first-day')?.scenes.length > 0 && freeStories.filter((x) => x.premium).length >= 5 && freeStories.filter((x) => x.premium).every((x) => x.locked && !x.scenes.length && !x.questionIds.length && !x.branch));
check('tamu: soal cerita Premium tidak dikirim', !freePack.exercises.some((e) => e.stage === 'story' && !e.id.startsWith('story-first-day')) && freePack.exercises.some((e) => e.id.startsWith('story-first-day')));
check('tamu: PR menyimak bab Premium tidak dikirim', !freePack.homework.some((h) => /^hw\.(b1|b2|c1|c2)-c\d\.listen$/.test(h.id)));
const raw = await gp.evaluate(async () => (await fetch('/api/content')).text());
check('tamu: teks rekaman dan cerita Premium tidak ada di respons server', !raw.includes('won over') && !raw.includes('negligible') && !raw.includes('Bright Smile') && !raw.includes('banana pancakes') && !raw.includes("It's huge") && !raw.includes("aunt's food stall"));
await gp.goto(`${BASE}/app/listening?id=listen-c2-app`);
check('tamu: membuka materi C2 menampilkan ajakan Premium', await gp.getByText('Audio Premium').waitFor({ timeout: 15000 }).then(() => true).catch(() => false));
await gp.goto(`${BASE}/app/conversations?id=press`);
check('tamu: membuka skenario C2 menampilkan ajakan Premium', await gp.getByText('Skenario Premium').waitFor({ timeout: 15000 }).then(() => true).catch(() => false));
await guest.close();

await browser.close();
console.log(process.exitCode ? '\nADA YANG GAGAL' : '\nSEMUA LOLOS');
