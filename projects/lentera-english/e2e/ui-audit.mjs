// UI audit (redesign Fase 0): measures app and public pages at mobile widths and
// saves screenshots, so every redesign phase can be compared with the baseline.
// Development only; it never runs against production.
//
//   node e2e/ui-audit.mjs <outDir> [--quick]      measure + screenshots into <outDir>
//   node e2e/ui-audit.mjs compare <a.json> <b.json>  print metric changes per page
//
// --quick: 360 px only (guest, Premium light + dark, learner); full adds 320–430 px for guests.
// Per page: horizontal overflow, interactive elements under 44 px (with samples), card-like
// boxes and nested ones, distinct font sizes and weights, text under 12 px, page height, CLS.
import fs from 'node:fs';
import path from 'node:path';
import { BASE, chromium, fetchPack, answerCurrent, runSession } from './lib.mjs';

if (process.argv[2] === 'compare') {
  const [a, b] = process.argv.slice(3).map((f) => JSON.parse(fs.readFileSync(f, 'utf8')));
  const key = (r) => `${r.who}|${r.mode}|${r.w}|${r.u}`;
  const before = new Map(a.map((r) => [key(r), r]));
  const fields = ['over', 'small', 'cards', 'nested', 'tiny', 'sizes', 'height', 'cls'];
  const worse = [];
  for (const r of b) {
    const o = before.get(key(r));
    if (!o || r.error || o.error) continue;
    const diff = fields.filter((f) => o[f] !== r[f]).map((f) => `${f} ${o[f]}→${r[f]}`);
    if (diff.length) console.log(key(r).padEnd(52), diff.join('  '));
    if (r.over > 0 || r.small > o.small || r.nested > o.nested || r.tiny > o.tiny || r.cls > Math.max(0.1, o.cls)) worse.push(key(r));
  }
  console.log(worse.length ? `\nLebih buruk dari baseline (${worse.length}):\n  ${worse.join('\n  ')}` : '\nTidak ada metrik yang lebih buruk dari baseline.');
  process.exit(0);
}

const OUT = path.resolve(process.argv[2] ?? 'ui-audit-out');
const QUICK = process.argv.includes('--quick');
const SHOTS = path.join(OUT, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const post = async (url, body) => (await fetch(BASE + url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).json();
let admin = await post('/api/dev-auth', { action: 'signin', email: 'admin@lentera.test', password: 'rahasia-12345' });
if (!admin?.token) admin = await post('/api/dev-auth', { action: 'signup', email: 'admin@lentera.test', password: 'rahasia-12345', name: 'Admin Uji' });

const APP = ['/app', '/app/path', '/app/jalur', '/app/plan', '/app/review', '/app/practice?mode=timed', '/app/homework', '/app/exams', '/app/vocabulary', '/app/grammar', '/app/stories', '/app/listening', '/app/shadowing', '/app/conversations', '/app/analytics', '/app/achievements', '/app/leaderboard', '/app/pasangan', '/app/profile', '/app/subscription', '/app/settings', '/app/more', '/app/kelas', '/app/orang-tua', '/app/guru', '/app/placement', '/app/lesson?id=a1-greetings'];
const PUBLIC = ['/', '/materi', '/materi/a1-greetings', '/masuk', '/daftar', '/sertifikat', '/sekolah'];
const WIDTHS = QUICK ? [360] : [320, 360, 375, 390, 412, 430];
const LEARNER = ['/app', '/app/analytics', '/app/path', '/app/review', '/app/profile', '/app/achievements', '/app/plan', '/app/leaderboard'];

const measure = (page) => page.evaluate(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const inter = [...document.querySelectorAll('a[href], button, [role="button"], [role="radio"], [role="tab"], input, select, textarea')].filter(vis);
  // Inline links inside running text are exempt from the target size rule (WCAG 2.5.8).
  const inline = (el) => el.tagName === 'A' && getComputedStyle(el).display === 'inline' && el.parentElement && [...el.parentElement.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  const small = inter.filter((el) => { const r = el.getBoundingClientRect(); return (r.width < 44 || r.height < 44) && !inline(el) && !el.closest('[data-skip-target]'); });
  const smallSample = small.slice(0, 6).map((el) => `${el.tagName.toLowerCase()}:${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 24)} ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`);
  // A "card": a padded box with a border and a large radius.
  const isCard = (el) => { const cs = getComputedStyle(el); return parseFloat(cs.borderTopWidth) > 0 && parseFloat(cs.borderTopLeftRadius) >= 12 && parseFloat(cs.paddingTop) >= 12 && el.getBoundingClientRect().width > 120; };
  const all = [...document.querySelectorAll('main *')].filter(vis);
  const cards = all.filter(isCard);
  const nested = cards.filter((el) => { let p = el.parentElement; while (p && p.tagName !== 'MAIN') { if (cards.includes(p)) return true; p = p.parentElement; } return false; });
  const texts = all.filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  const sizes = new Set(texts.map((el) => getComputedStyle(el).fontSize));
  const tiny = texts.filter((el) => parseFloat(getComputedStyle(el).fontSize) < 12).length;
  const weights = new Set(texts.map((el) => getComputedStyle(el).fontWeight));
  const fold = cards.filter((el) => el.getBoundingClientRect().top < innerHeight && !nested.includes(el)).length;
  return { over: document.documentElement.scrollWidth - innerWidth, small: small.length, smallSample, cards: cards.length, nested: nested.length, sizes: sizes.size, weights: [...weights].join('/'), tiny, fold, h1: document.querySelectorAll('h1').length, height: document.documentElement.scrollHeight };
});

const browser = await chromium.launch();
const rows = [];
const name = (who, mode, w, u) => `${who}-${mode}-${w}${u.replace(/[/?=&]+/g, '_')}.png`;
async function context(mode, w, dsf, session) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 780 }, isMobile: true, hasTouch: true, colorScheme: mode, deviceScaleFactor: dsf });
  await ctx.addInitScript(([s, dark]) => {
    localStorage.setItem('lentera.sound', '0');
    if (dark) localStorage.setItem('lentera.theme', 'dark');
    if (s && !localStorage.getItem('lentera.session')) localStorage.setItem('lentera.session', JSON.stringify(s));
    window.__cls = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
  }, [session, mode === 'dark']);
  return ctx;
}
async function visit(p, u) {
  await p.goto(BASE + u); await p.locator('main').first().waitFor({ timeout: 30000 });
  await p.waitForLoadState('networkidle').catch(() => {}); await p.waitForTimeout(700);
}
async function run(who, mode, widths, list, session) {
  for (const w of widths) {
    const ctx = await context(mode, w, w === 360 ? 2 : 1, session);
    const p = await ctx.newPage();
    for (const u of list) {
      try {
        await visit(p, u);
        const m = await measure(p);
        rows.push({ who, mode, w, u, ...m, cls: Math.round((await p.evaluate(() => window.__cls)) * 1000) / 1000 });
        if (w === 360) await p.screenshot({ path: path.join(SHOTS, name(who, mode, w, u)), fullPage: true });
      } catch (e) { rows.push({ who, mode, w, u, error: String(e.message).slice(0, 160) }); }
    }
    await ctx.close();
  }
}

await run('guest', 'light', WIDTHS, [...PUBLIC, ...APP], null);
await run('premium', 'light', [360], APP, admin);
await run('premium', 'dark', [360], APP, admin);

// Lesson player states (Premium, 360, light and dark).
for (const mode of ['light', 'dark']) {
  const ctx = await context(mode, 360, 2, admin);
  const p = await ctx.newPage();
  try {
    await visit(p, '/app/lesson?id=a1-greetings');
    const pack = await fetchPack(p, admin.token);
    const b = (n) => p.getByRole('button', { name: n });
    const shot = async (label, full = false) => p.screenshot({ path: path.join(SHOTS, `lesson-${mode}-${label}.png`), fullPage: full });
    await b('Mulai belajar').click({ timeout: 30000 }); await shot('1-materi', true);
    await b('Lihat contoh benar dan salah').click(); await shot('2-contoh', true);
    await b('Lanjut ke latihan').click(); await b('Mulai latihan').click();
    await p.locator('[data-ex]').waitFor(); await p.waitForTimeout(500);
    rows.push({ who: 'premium', mode, w: 360, u: 'lesson:question', ...(await measure(p)), cls: 0 });
    await shot('3-soal');
    await answerCurrent(p, pack, false); await b('Periksa').click(); await p.getByText('Belum tepat', { exact: true }).waitFor(); await p.waitForTimeout(500);
    rows.push({ who: 'premium', mode, w: 360, u: 'lesson:feedback-wrong', ...(await measure(p)), cls: 0 });
    await shot('4-salah');
    await b('Lanjut').click(); await p.waitForTimeout(400);
    await answerCurrent(p, pack, true); await b('Periksa').click(); await p.getByText('Benar!', { exact: true }).waitFor(); await p.waitForTimeout(500);
    await shot('5-benar');
  } catch (e) { rows.push({ who: 'premium', mode, w: 360, u: 'lesson:flow', error: String(e.message).slice(0, 160) }); }
  await ctx.close();
}

// A learner with real progress (one lesson passed), light and dark.
{
  const user = await post('/api/dev-auth', { action: 'signup', email: `ui-audit-${Date.now()}@lentera.test`, password: 'rahasia-12345', name: 'Rina Audit' });
  const ctx = await context('light', 360, 2, user);
  const p = await ctx.newPage();
  try {
    await visit(p, '/app');
    const pack = await fetchPack(p, user.token);
    const b = (n) => p.getByRole('button', { name: n });
    const skip = p.getByRole('button', { name: /Lewati, mulai dari A1/ });
    if (await skip.count()) await skip.click();
    await p.goto(`${BASE}/app/lesson?id=a1-greetings`);
    await b('Mulai belajar').click({ timeout: 30000 }); await b('Lihat contoh benar dan salah').click(); await b('Lanjut ke latihan').click(); await b('Mulai latihan').click();
    await runSession(p, pack, { plan: (i) => i % 4 !== 1 });
    await p.getByRole('heading', { name: 'Latihan terbimbing selesai' }).waitFor({ timeout: 15000 });
    await p.screenshot({ path: path.join(SHOTS, 'lesson-light-6-hasil.png') });
    await b(/Lanjut ke latihan mandiri/).click(); await b('Mulai latihan mandiri').click();
    await runSession(p, pack, { plan: (i) => i % 5 !== 2 });
    await p.getByRole('heading', { name: 'Latihan mandiri selesai' }).waitFor({ timeout: 15000 });
    await b(/Lanjut ke pr/i).click(); await b(/Terima PR/).click(); await b('Lanjut ke tes penguasaan').click(); await b('Mulai tes').click();
    await runSession(p, pack, { deferred: true });
    await p.getByRole('heading', { name: 'Lulus tes penguasaan!' }).waitFor({ timeout: 15000 });
    await p.screenshot({ path: path.join(SHOTS, 'lesson-light-7-lulus.png'), fullPage: true });
  } catch (e) { rows.push({ who: 'learner', mode: 'light', w: 360, u: 'lesson:pass', error: String(e.message).slice(0, 160) }); }
  // Same browser profile, so the progress just made is there even before the server sync finishes.
  for (const mode of ['light', 'dark']) {
    await p.evaluate((dark) => localStorage.setItem('lentera.theme', dark ? 'dark' : 'light'), mode === 'dark');
    for (const u of LEARNER) {
      try {
        await p.evaluate(() => { window.__cls = 0; });
        await visit(p, u);
        rows.push({ who: 'learner', mode, w: 360, u, ...(await measure(p)), cls: Math.round((await p.evaluate(() => window.__cls)) * 1000) / 1000 });
        await p.screenshot({ path: path.join(SHOTS, name('learner', mode, 360, u)), fullPage: true });
      } catch (e) { rows.push({ who: 'learner', mode, w: 360, u, error: String(e.message).slice(0, 160) }); }
    }
  }
  await ctx.close();
}

await browser.close();
fs.writeFileSync(path.join(OUT, 'metrics.json'), JSON.stringify(rows, null, 1));
const errors = rows.filter((r) => r.error);
console.log(`rows ${rows.length}, errors ${errors.length}, overflow ${rows.filter((r) => r.over > 0).length}`);
for (const e of errors) console.log('  ERROR', e.who, e.mode, e.w, e.u, e.error);
