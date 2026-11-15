// Promo video, step 1: plays the real app with a demo learner ("Rina") and
// saves a screenshot of every step, plus where the finger taps next.
// Nothing is mocked: every screen is the production build with the bundled
// curriculum (the same one published live).
//
// Needs a fresh server with the embedded backend and the admin address set:
//   LENTERA_BACKEND=embedded LENTERA_ALLOW_EMBEDDED=1 LENTERA_DEV_ADMIN_EMAIL=admin@lentera.test \
//   LENTERA_DATA_DIR=/tmp/lentera-promo/pglite npx next start -p 3100
//   node promo/capture.mjs            # writes promo/out/shots/*.png and promo/out/shots.json
import fs from 'node:fs';
import path from 'node:path';
import { BASE, answerCurrent, chromium, fetchPack, runSession } from '../e2e/lib.mjs';

const OUT = process.env.PROMO_OUT ?? path.join(import.meta.dirname, 'out');
const SHOTS = path.join(OUT, 'shots');
fs.rmSync(SHOTS, { recursive: true, force: true });
fs.mkdirSync(SHOTS, { recursive: true });
const PASSWORD = 'rahasia-12345';
const ADMIN = 'admin@lentera.test';
const W = 390;
const H = 844;

const call = async (url, body, token, method) => {
  const res = await fetch(BASE + url, { method: method ?? (body ? 'POST' : 'GET'), headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return { status: res.status, data: await res.json().catch(() => ({})) };
};
const account = async (email, name) => {
  let r = await call('/api/dev-auth', { action: 'signin', email, password: PASSWORD });
  if (r.status !== 200) r = await call('/api/dev-auth', { action: 'signup', email, password: PASSWORD, name });
  if (r.status !== 200) throw new Error(`account ${email}: ${JSON.stringify(r.data)}`);
  return r.data;
};

const admin = await account(ADMIN, 'Admin Lentera');
// Classmates for the weekly leaderboard: real accounts with XP earned through the sync API.
const classmates = [['Dimas', 7, 640], ['Nisa', 6, 520], ['Bayu', 1, 380], ['Putri', 2, 260], ['Fajar', 5, 150]];
for (const [name, avatar, xp] of classmates) {
  const a = await account(`promo-${name.toLowerCase()}@lentera.test`, name);
  await call('/api/me', { avatar, display_name: name }, a.token, 'PATCH');
  const events = [];
  for (let left = xp, i = 0; left > 0; i++, left -= 160) events.push({ id: `promo-${name}-${i}`, kind: 'xp', at: Date.now() - i * 60_000, data: { amount: Math.min(160, left), reason: 'lesson' } });
  await call('/api/sync', { events, snapshot: null, updatedAt: 1 }, a.token);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await ctx.addInitScript(() => localStorage.setItem('lentera.story.sound', '0'));
const page = await ctx.newPage();
const shots = [];
let n = 0;

/** Screenshot of the screen as it is; `tap` = where the finger goes next (recorded, then clicked). */
async function shot(name, { tap, full = false, caption, wait = 700, scrollTo } = {}) {
  if (scrollTo) await scrollTo.scrollIntoViewIfNeeded();
  await page.waitForTimeout(wait);
  const file = `${String(++n).padStart(2, '0')}-${name}.png`;
  const entry = { file, name, full };
  if (full) entry.height = await page.evaluate(() => document.scrollingElement.scrollHeight);
  await page.screenshot({ path: path.join(SHOTS, file), fullPage: full });
  if (tap) {
    await tap.scrollIntoViewIfNeeded();
    const box = await tap.boundingBox();
    entry.tap = { x: Math.round(box.x + box.width / 2), y: Math.round(box.y + box.height / 2) };
    if (caption) entry.caption = caption;
    await tap.click();
  }
  shots.push(entry);
  fs.writeFileSync(path.join(OUT, 'shots.json'), JSON.stringify({ width: W, height: H, scale: 2, shots }, null, 1));
  console.log(file);
}
const btn = (name, exact = true) => page.getByRole('button', { name, exact });
const link = (name, exact = true) => page.getByRole('link', { name, exact });

try {
  // ── Landing and sign-up ──
  await page.goto(`${BASE}/`);
  await page.getByRole('link', { name: /Mulai belajar gratis|Mulai gratis/ }).first().waitFor({ timeout: 45000 });
  await shot('landing');
  await page.goto(`${BASE}/daftar`);
  await page.getByLabel('Nama').fill('Rina');
  await page.getByLabel('Email').fill(`rina.promo.${Date.now()}@lentera.test`);
  await page.getByLabel('Kata sandi').fill(PASSWORD);
  await shot('daftar', { tap: btn('Daftar') });
  await page.waitForURL(/\/app$/, { timeout: 30000 });
  const session = await page.evaluate(() => JSON.parse(localStorage.getItem('lentera.session')));

  // ── First open: welcome, then the placement test ──
  await page.getByRole('heading', { name: 'Selamat datang di Lentera English!' }).waitFor({ timeout: 30000 });
  await shot('welcome', { tap: page.getByRole('link', { name: /Ikuti tes penempatan/ }) });
  await btn('Mulai tes').waitFor({ timeout: 30000 });
  await shot('placement-intro', { tap: btn('Mulai tes') });
  let pack = await fetchPack(page, session.token);
  const a1 = new Set(pack.exercises.filter((e) => e.stage === 'placement' && e.level === 'A1').map((e) => e.id));
  await page.locator('[data-ex]').waitFor({ timeout: 20000 });
  await shot('placement-question');
  await runSession(page, pack, { deferred: true, plan: (_, id) => a1.has(id) });
  await page.getByText('Level awalmu').waitFor({ timeout: 20000 });
  await shot('placement-result');

  // ── Premium Tahunan through the real QRIS flow (the owner confirms in /admin) ──
  await page.goto(`${BASE}/app/subscription`);
  await page.getByRole('radio', { name: /Premium Tahunan/ }).check({ timeout: 30000 });
  await shot('premium-plans', { tap: btn(/Bayar Rp497\.250 dengan QRIS/, false) });
  await page.waitForURL(/\/app\/checkout\?tx=/, { timeout: 30000 });
  const txId = new URL(page.url()).searchParams.get('tx');
  await page.getByAltText(/Kode QRIS pembayaran Premium Tahunan/).waitFor({ timeout: 30000 });
  await page.getByLabel('Nama pemilik akun yang membayar').fill('Rina');
  await shot('qris', { full: true });
  await btn('Saya sudah bayar').click();
  await page.getByText('Menunggu konfirmasi').first().waitFor({ timeout: 20000 });
  const confirmed = await call('/api/admin', { action: 'confirm-payment', id: txId }, admin.token);
  if (confirmed.data.outcome !== 'activated') throw new Error(`confirm: ${JSON.stringify(confirmed.data)}`);
  await page.getByText(/Pembayaran dikonfirmasi/).first().waitFor({ timeout: 30000 });
  await shot('premium-active');

  // ── Dashboard and the first lesson (8 steps) ──
  await page.goto(`${BASE}/app`);
  await page.getByRole('heading', { name: /^Selamat (pagi|siang|sore|malam), Rina!/ }).waitFor({ timeout: 30000 });
  pack = await fetchPack(page, session.token);
  const rec = page.locator('section[aria-labelledby="rec-title"] a').first();
  await shot('dashboard', { tap: rec });
  await btn('Mulai belajar').waitFor({ timeout: 30000 });
  await shot('lesson-intro', { tap: btn('Mulai belajar') });
  await btn('Lihat contoh benar dan salah').waitFor({ timeout: 20000 });
  await shot('lesson-teaching', { tap: btn('Lihat contoh benar dan salah') });
  await btn('Lanjut ke latihan').waitFor({ timeout: 20000 });
  await shot('lesson-examples', { tap: btn('Lanjut ke latihan') });
  await btn('Mulai latihan').waitFor({ timeout: 20000 });
  await shot('lesson-practice-intro', { tap: btn('Mulai latihan') });
  // Question 1: right. Question 2: wrong, to show the explanation.
  await page.locator('[data-ex]').waitFor({ timeout: 20000 });
  await answerCurrent(page, pack, true);
  await shot('q1-answered', { tap: btn('Periksa') });
  await page.getByText('Benar!', { exact: true }).waitFor({ timeout: 10000 });
  await shot('q1-correct', { tap: btn('Lanjut') });
  // The wrong answer is shown on a multiple-choice question (clearest explanation).
  for (let k = 0; k < 10; k++) {
    await page.locator('[data-ex]').waitFor({ timeout: 20000 });
    const exId = await page.locator('[data-ex]').getAttribute('data-ex');
    const ex = pack.exercises.find((e) => e.id === exId);
    if (ex?.options?.length) break;
    await answerCurrent(page, pack, true);
    await btn('Periksa').click();
    await page.getByText('Benar!', { exact: true }).waitFor({ timeout: 10000 });
    await btn('Lanjut').click();
  }
  await answerCurrent(page, pack, false);
  await shot('q2-answered', { tap: btn('Periksa') });
  await page.getByText('Belum tepat', { exact: true }).waitFor({ timeout: 10000 });
  await shot('q2-wrong', { tap: btn('Lanjut') });
  await runSession(page, pack);
  await page.getByRole('heading', { name: 'Latihan terbimbing selesai' }).waitFor({ timeout: 20000 });
  await shot('guided-done');

  // ── Learning path ──
  await page.goto(`${BASE}/app/path`);
  await page.getByRole('heading', { name: 'Jalur Belajar' }).waitFor({ timeout: 30000 });
  await shot('path', { full: true });

  // ── Branching story (Premium) ──
  await page.goto(`${BASE}/app/stories`);
  await page.getByText('Wawancara di Kafe').first().waitFor({ timeout: 30000 });
  await shot('stories', { full: true });
  await page.goto(`${BASE}/app/stories?id=story-cafe-interview`);
  await shot('story-intro', { tap: btn('Mulai cerita'), wait: 1200 });
  const story = pack.stories.find((s) => s.id === 'story-cafe-interview');
  const nodes = new Map(story.branch.nodes.map((x) => [x.id, x]));
  let lines = 0;
  let choices = 0;
  for (let k = 0; k < 60; k++) {
    if (await btn('Lihat akhir cerita').count()) {
      await shot('story-last-line', { tap: btn('Lihat akhir cerita'), wait: 900 });
      break;
    }
    const group = page.getByRole('group', { name: 'Pilihan jawaban' });
    if (await group.count()) {
      const tag = await page.locator('[data-line]').getAttribute('data-line');
      const node = nodes.get(tag.slice(0, tag.lastIndexOf('-')));
      const best = node.choices.find((c) => c.correct && c.natural === 3);
      if (choices++ < 1) {
        await shot('story-choice', { tap: group.getByRole('button', { name: best.text, exact: true }), wait: 900 });
        await shot('story-feedback', { tap: btn('Lanjut'), wait: 900 });
      } else {
        await group.getByRole('button', { name: best.text, exact: true }).click();
        await btn('Lanjut').click();
      }
      continue;
    }
    if (lines++ === 1) await shot('story-scene', { tap: btn('Lanjut'), wait: 1200 });
    else await btn('Lanjut').click();
  }
  await page.getByText('Pilihanmu').waitFor({ timeout: 20000 });
  await shot('story-end', { wait: 900 });

  // ── Conversation simulator ──
  const scenario = pack.scenarios.find((s) => s.level === 'A2' && !s.locked) ?? pack.scenarios[0];
  await page.goto(`${BASE}/app/conversations?id=${scenario.id}`);
  await page.getByText('Pilih responsmu:').waitFor({ timeout: 30000 });
  const first = scenario.nodes.find((x) => x.id === scenario.start);
  const bestReply = first.options.find((o) => o.correct && o.natural === 3);
  await shot('conversation', { tap: page.getByRole('button', { name: bestReply.text, exact: true }) });
  await page.getByText('Penjelasan:').waitFor({ timeout: 10000 });
  await shot('conversation-feedback');

  // ── Listening and pronunciation ──
  await page.goto(`${BASE}/app/listening?id=listen-anna`);
  await page.getByRole('button', { name: 'Putar audio', exact: true }).waitFor({ timeout: 30000 });
  await page.getByRole('button', { name: 'Tampilkan transkrip' }).click();
  await shot('listening');
  await page.goto(`${BASE}/app/listening?tab=pelafalan`);
  await page.getByRole('button', { name: /^Dengarkan / }).first().waitFor({ timeout: 30000 });
  await shot('pronunciation');

  // ── Homework: weekly PR, calendar, writing with leveled examples ──
  await page.goto(`${BASE}/app/homework`);
  await page.locator('main').first().waitFor({ timeout: 30000 });
  await shot('homework', { full: true, wait: 1500 });
  await page.goto(`${BASE}/app/homework?id=hw.b2-c1.write`);
  await page.getByLabel('Tulisanmu').waitFor({ timeout: 30000 });
  await shot('writing', { full: true });

  // ── Level exam A2 and the certificate ──
  // Demo progress: Rina has finished A2 (lessons and unit exams), so its level exam opens.
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
    lessons: pack.lessons.filter((l) => pack.chapters.find((c) => c.id === pack.units.find((u) => u.id === l.unitId).chapterId).level === 'A2').map((l) => l.id),
    unitExams: pack.exams.filter((e) => e.scope === 'unit' && e.ref.startsWith('a2-')).map((e) => e.id),
  });
  const rows = (await call('/api/admin', { action: 'content' }, admin.token)).data;
  const keys = new Map(rows.questions.map((q) => [q.id, q]));
  await page.goto(`${BASE}/app/exams?id=exam.level.A2`);
  await page.getByRole('heading', { name: 'Isi ujian' }).waitFor({ timeout: 30000 });
  await shot('exam-intro', { full: true, tap: btn('Mulai ujian') });
  await page.getByRole('tablist', { name: 'Bagian ujian' }).waitFor({ timeout: 20000 });
  let examShot = false;
  for (let sec = 0; sec < 4; sec++) {
    const writing = page.locator('section:not([hidden])').getByLabel('Tulisanmu');
    if (await writing.count()) {
      const prompt = await page.locator('section:not([hidden]) p.font-bold').first().innerText();
      const task = rows.exams.find((x) => x.id === 'exam.level.A2').sections.find((s) => s.kind === 'writing').writing.find((w) => w.prompt === prompt);
      await writing.fill(task.model);
    } else {
      const cards = page.locator('section:not([hidden]) [data-ex]');
      for (let i = 0; i < await cards.count(); i++) {
        const card = cards.nth(i);
        const q = keys.get(await card.getAttribute('data-ex'));
        if (q.options?.length) await card.getByRole('radio', { name: q.options.find((o) => o.correct).text, exact: true }).click();
        else await card.getByLabel('Jawabanmu').fill(q.payload.answers[0]);
      }
    }
    if (!examShot) { await shot('exam-section'); examShot = true; }
    if (sec < 3) await btn('Bagian berikutnya').click();
  }
  await btn('Kumpulkan ujian').click();
  await btn('Ya, kumpulkan').click();
  await page.getByRole('heading', { name: /^Lulus:/ }).waitFor({ timeout: 30000 });
  await shot('exam-passed', { tap: link(/Lihat & cetak sertifikat/, false) });
  await page.getByText('Sertifikat ini asli').waitFor({ timeout: 30000 });
  await shot('certificate', { full: true, wait: 1200 });

  // ── Weekly plan (Premium Tahunan), leaderboard, profile with avatars ──
  await page.goto(`${BASE}/app/plan`);
  await page.locator('main').first().waitFor({ timeout: 30000 });
  await shot('plan', { wait: 1500 });
  await page.goto(`${BASE}/app/profile`);
  await page.getByRole('radio', { name: /^Momo/ }).waitFor({ timeout: 30000 });
  await page.getByRole('radio', { name: /^Momo/ }).click();
  await shot('profile-avatar', { tap: btn('Simpan perubahan'), scrollTo: page.getByRole('radio', { name: /^Momo/ }) });
  await page.getByText('Profil tersimpan.').waitFor({ timeout: 10000 });
  await page.waitForTimeout(1500);
  await page.goto(`${BASE}/app/leaderboard`);
  await page.getByText('Posisimu minggu ini').waitFor({ timeout: 30000 });
  await shot('leaderboard', { wait: 1200 });

  // ── Settings: dark mode and text size; the dashboard in dark mode ──
  await page.goto(`${BASE}/app/settings`);
  await page.getByRole('radio', { name: 'Gelap' }).waitFor({ timeout: 30000 });
  await shot('settings', { tap: page.getByRole('radio', { name: 'Gelap' }) });
  await page.goto(`${BASE}/app`);
  await page.getByRole('heading', { name: /Rina!/ }).waitFor({ timeout: 30000 });
  await shot('dashboard-dark', { wait: 1200 });
  await page.goto(`${BASE}/app/vocabulary`);
  await page.locator('main').first().waitFor({ timeout: 30000 });
  await shot('vocabulary', { wait: 1200 });
  console.log(`\n${shots.length} gambar tersimpan di ${SHOTS}`);
} catch (e) {
  await page.screenshot({ path: path.join(OUT, 'capture-error.png'), fullPage: true }).catch(() => {});
  console.error('GAGAL:', e.message.split('\n')[0]);
  process.exitCode = 1;
}
await browser.close();
