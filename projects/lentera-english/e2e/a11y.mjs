// Accessibility audit (Rilis 13): axe-core on every page, in light and dark
// mode, on a 360 px phone, as a guest and as a Premium learner (the test admin
// gets Premium). Also checks the lesson player mid-session (question, feedback,
// result). Fails on any WCAG 2.1 A/AA violation; best-practice findings are
// listed but do not fail.
//
// Needs a server with the embedded backend and the admin address set
// (see e2e/admin-app.mjs). A11Y_ONLY=/app,/materi limits the pages;
// A11Y_JSON=file writes every finding to a file.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { BASE, answerCurrent, check, chromium, fetchPack } from './lib.mjs';

const require = createRequire(import.meta.url);
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const SHOTS = process.env.E2E_SHOTS ?? path.join(import.meta.dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const ADMIN = process.env.E2E_ADMIN_EMAIL ?? 'admin@lentera.test';
const PASSWORD = 'rahasia-12345';
const post = async (url, body) => {
  const res = await fetch(BASE + url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { status: res.status, data: await res.json().catch(() => ({})) };
};
let r = await post('/api/dev-auth', { action: 'signin', email: ADMIN, password: PASSWORD });
if (r.status !== 200) r = await post('/api/dev-auth', { action: 'signup', email: ADMIN, password: PASSWORD, name: 'Admin Uji' });
const admin = r.data;

const PUBLIC = ['/', '/materi', '/materi/a1-greetings', '/materi/exam-toefl-written', '/sekolah', '/privasi', '/kontak', '/masuk', '/daftar', '/sertifikat'];
const APP = [
  '/app', '/app/path', '/app/jalur', '/app/lesson?id=a1-greetings', '/app/practice', '/app/review', '/app/stories', '/app/stories?id=story-first-day',
  '/app/listening', '/app/listening?id=listen-a1-intro', '/app/conversations', '/app/homework', '/app/exams', '/app/grammar', '/app/vocabulary',
  '/app/plan', '/app/shadowing', '/app/leaderboard', '/app/leaderboard?tab=teman', '/app/achievements', '/app/analytics', '/app/profile',
  '/app/settings', '/app/subscription', '/app/placement', '/app/more', '/app/pasangan', '/app/kelas', '/app/guru', '/app/orang-tua',
];
const only = process.env.A11Y_ONLY?.split(',');
const pick = (list) => (only ? list.filter((u) => only.some((o) => u === o || u.startsWith(`${o}?`))) : list);

const browser = await chromium.launch();
const errors = [];
const findings = []; // { rule, impact, wcag, help, page, mode, who, targets }

async function open({ who, mode }) {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true, colorScheme: mode, bypassCSP: true });
  await ctx.addInitScript((s) => {
    if (s && !localStorage.getItem('lentera.session')) localStorage.setItem('lentera.session', JSON.stringify(s));
    localStorage.setItem('lentera.story.sound', '0');
  }, who === 'premium' ? admin : null);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  return { ctx, p };
}

async function audit(p, label, meta) {
  // Measure the settled screen, not a fade-in halfway through (it reads as low contrast).
  await p.evaluate(() => Promise.all(document.getAnimations().filter((a) => Number.isFinite(a.effect?.getComputedTiming().endTime)).map((a) => a.finished.catch(() => undefined)))).catch(() => {});
  if (!(await p.evaluate(() => !!window.axe))) await p.evaluate(AXE);
  const res = await p.evaluate(async () => {
    const out = await window.axe.run(document, { resultTypes: ['violations'], runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } });
    return out.violations.map((v) => ({ rule: v.id, impact: v.impact, tags: v.tags, help: v.help, targets: v.nodes.slice(0, 6).map((n) => `${n.target.join(' ')} :: ${(n.failureSummary || '').split('\n').slice(1, 2).join('').trim().slice(0, 140)}`) }));
  });
  for (const v of res) findings.push({ ...v, wcag: v.tags.some((t) => /^wcag2/.test(t)), page: label, ...meta });
  return res;
}

const settle = async (p) => {
  await p.locator('main').first().waitFor({ timeout: 30000 });
  await p.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await p.waitForTimeout(800);
};

for (const mode of ['light', 'dark']) {
  for (const who of ['guest', 'premium']) {
    const { ctx, p } = await open({ who, mode });
    const pages = who === 'guest' ? [...pick(PUBLIC), ...pick(APP)] : [...pick(APP), ...pick(['/admin'])];
    for (const url of pages) {
      try {
        await p.goto(BASE + url);
        await settle(p);
        await audit(p, url, { mode, who });
        if (mode === 'dark') await p.screenshot({ path: path.join(SHOTS, `a11y-dark-${who}-${url.replace(/[/?=&]+/g, '_') || 'home'}.png`), fullPage: true });
      } catch (e) {
        errors.push(`${mode}/${who} ${url}: ${String(e.message).split('\n')[0].slice(0, 160)}`);
      }
    }

    // The lesson player mid-session: a question, the feedback after an answer, and the result.
    if (who === 'premium' && !only) {
      try {
        const pack = await fetchPack(p, admin.token);
        const button = (name) => p.getByRole('button', { name });
        await p.goto(`${BASE}/app/lesson?id=a1-greetings`);
        await settle(p);
        await button('Mulai belajar').click();
        await audit(p, 'pelajaran: penjelasan', { mode, who });
        await button('Lihat contoh benar dan salah').click();
        await audit(p, 'pelajaran: contoh', { mode, who });
        await button('Lanjut ke latihan').click();
        await button('Mulai latihan').click();
        await p.locator('[data-ex]').first().waitFor({ timeout: 15000 });
        await audit(p, 'sesi: soal', { mode, who });
        await answerCurrent(p, pack, false);
        await button('Periksa').click();
        await p.getByText('Belum tepat', { exact: true }).waitFor({ timeout: 10000 });
        await audit(p, 'sesi: umpan balik', { mode, who });
        await p.screenshot({ path: path.join(SHOTS, `a11y-${mode}-sesi.png`), fullPage: true });
        // Screen readers: the verdict is announced from a region that is always there, and the next question takes the focus.
        const said = await p.locator('p.sr-only[role="status"]').innerText();
        check(`${mode}: pembaca layar mendengar hasil jawaban dan jawaban yang benar`, /^Jawabanmu belum tepat\. Jawaban yang benar: .+/.test(said), said);
        await p.getByRole('button', { name: 'Lanjut', exact: true }).click();
        await p.waitForTimeout(300);
        const focused = await p.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.tagName);
        check(`${mode}: setelah "Lanjut", fokus pindah ke soal berikutnya`, /^Soal 2( dari \d+)?$/.test(focused ?? ''), focused);
      } catch (e) {
        errors.push(`${mode} sesi: ${String(e.message).split('\n')[0].slice(0, 160)}`);
      }
    }
    await ctx.close();
  }
}

// ───────────── Report ─────────────
const byRule = new Map();
for (const f of findings) {
  const k = `${f.wcag ? 'WCAG' : 'saran'} ${f.impact} ${f.rule}`;
  const e = byRule.get(k) ?? { help: f.help, where: new Map() };
  for (const t of f.targets) {
    const w = `${f.mode}/${f.who} ${f.page}`;
    e.where.set(t, [...new Set([...(e.where.get(t) ?? []), w])]);
  }
  byRule.set(k, e);
}
for (const [k, e] of [...byRule].sort()) {
  console.log(`\n■ ${k} — ${e.help}`);
  for (const [t, w] of [...e.where].slice(0, 12)) console.log(`   ${t}\n      ↳ ${w.slice(0, 4).join(', ')}${w.length > 4 ? ` (+${w.length - 4})` : ''}`);
  if (e.where.size > 12) console.log(`   … ${e.where.size - 12} lainnya`);
}
if (process.env.A11Y_JSON) fs.writeFileSync(process.env.A11Y_JSON, JSON.stringify(findings, null, 1));

const wcag = findings.filter((f) => f.wcag);
check('semua halaman diperiksa tanpa macet', errors.length === 0, errors.slice(0, 4).join(' | '));
check('tanpa pelanggaran WCAG 2.1 A/AA (terang dan gelap, tamu dan Premium)', wcag.length === 0, `${wcag.length} temuan: ${[...new Set(wcag.map((f) => f.rule))].join(', ')}`);
console.log(`\nSaran praktik terbaik (tidak menggagalkan): ${findings.length - wcag.length}`);
await browser.close();
console.log(process.exitCode === 1 ? '\nADA YANG GAGAL' : '\nSEMUA LOLOS');
