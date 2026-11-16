// End-to-end check of the weekly plan changes (16 Nov 2026): monthly Premium
// gets the full 52-week plan; once this week's share is done the next steps
// lock until Monday 00:00 with a countdown right above the list; and Beranda
// stops offering new steps (cooldown card) until then.
//
// Needs a server with the embedded backend and the admin address set
// (see e2e/admin-app.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { BASE, check, chromium } from './lib.mjs';

const SHOTS = process.env.E2E_SHOTS ?? path.join(import.meta.dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const stamp = Date.now();
const ADMIN = process.env.E2E_ADMIN_EMAIL ?? 'admin@lentera.test';
const PASSWORD = 'rahasia-12345';

const post = async (url, body, token) => {
  const res = await fetch(BASE + url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
  return { status: res.status, data: await res.json().catch(() => ({})) };
};
const account = async (email, name) => {
  let r = await post('/api/dev-auth', { action: 'signup', email, password: PASSWORD, name });
  if (r.status !== 200) r = await post('/api/dev-auth', { action: 'signin', email, password: PASSWORD });
  if (r.status !== 200) throw new Error(`cannot sign in ${email}: ${JSON.stringify(r.data)}`);
  return r.data;
};

// A monthly subscriber: checkout, report, admin confirms.
const admin = await account(ADMIN, 'Admin Uji');
const learner = await account(`bulanan${stamp}@lentera.test`, 'Bulan Rencana');
const tx = await post('/api/payments', { planId: 'premium_monthly', channel: 'QRIS' }, learner.token);
await post(`/api/payments/${tx.data.transaction.id}`, { action: 'claim', payerName: 'Bulan Rencana' }, learner.token);
const confirmed = await post('/api/admin', { action: 'confirm-payment', id: tx.data.transaction.id }, admin.token);
check('admin mengonfirmasi Premium bulanan', confirmed.status === 200 && confirmed.data.outcome === 'activated', JSON.stringify(confirmed.data).slice(0, 200));

const browser = await chromium.launch();
const issues = [];
async function phone({ time, state } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  if (time) await ctx.clock.install({ time });
  await ctx.addInitScript(([s, st]) => {
    if (!localStorage.getItem('lentera.session')) localStorage.setItem('lentera.session', JSON.stringify(s));
    if (st && !sessionStorage.getItem('plan-e2e')) { sessionStorage.setItem('plan-e2e', '1'); localStorage.setItem(`lentera.state.${s.userId}`, st); }
  }, [learner, state ?? null]);
  const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error' && !/status of 40[0-9]/.test(m.text())) issues.push(`${new URL(p.url()).pathname}: ${m.text().slice(0, 200)}`); });
  p.on('pageerror', (e) => issues.push(`pageerror: ${e.message}`));
  return { ctx, p };
}
const seen = (locator, timeout = 20000) => locator.first().waitFor({ timeout }).then(() => true, () => false);
const readState = (p) => p.evaluate((uid) => JSON.parse(localStorage.getItem(`lentera.state.${uid}`)), learner.userId);

const { p } = await phone();
let saved;
try {
  // 1. Monthly Premium sees the full plan.
  await p.goto(`${BASE}/app/plan`);
  await p.getByRole('heading', { name: /^Minggu ini/ }).waitFor({ timeout: 30000 });
  check('Premium bulanan: rencana lengkap, minggu 1 dari 52', await p.getByText('Rencana 52 minggu ada di Premium').count() === 0 && await seen(p.getByText(/^1\s*\/\s*52$/)));
  const targets = p.getByRole('list', { name: 'Target minggu ini' });
  const hrefs = await targets.getByRole('link', { name: 'Mulai' }).evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  check('minggu ini berisi sekitar 3 langkah dengan tombol Mulai', hrefs.length >= 2 && hrefs.length <= 4, hrefs.join(' '));
  check('belum selesai: tidak ada kunci', await p.getByText('Langkah berikutnya terkunci.').count() === 0);
  await p.waitForTimeout(1000);
  const st = await readState(p);
  check('awal rencana bulanan tersimpan (Senin 00.00 minggu ini)', typeof st.planStart === 'number' && new Date(st.planStart).getDay() === 1 && new Date(st.planStart).getHours() === 0, String(st.planStart));

  // 2. The learner finishes this week's targets.
  await p.evaluate(([uid, links]) => {
    const key = `lentera.state.${uid}`;
    const s = JSON.parse(localStorage.getItem(key));
    const at = Date.now() - 60_000;
    for (const href of links) {
      const u = new URL(href, location.origin);
      const id = u.searchParams.get('id');
      if (u.pathname === '/app/lesson') s.lessons[id] = { startedAt: at, step: 7, masteryBest: 100, masteryAttempts: 1, completedAt: at };
      else if (u.pathname === '/app/exams') s.exams[id] = { attempts: [{ at, score: 90, passed: true }] };
      else if (u.pathname === '/app/listening') s.rewards[`listening:${id}`] = at;
      else if (u.pathname === '/app/stories') s.rewards[`story:${id}`] = at;
      else s.rewards[`conversation:${id}`] = at;
    }
    s.updatedAt = Date.now();
    localStorage.setItem(key, JSON.stringify(s));
  }, [learner.userId, hrefs]);
  await p.reload();
  const notice = p.getByRole('status').filter({ hasText: 'Langkah berikutnya terkunci.' });
  check('jatah selesai: kunci dengan hitungan mundur hari/jam sampai Senin 00.00', await seen(notice) && /Terbuka dalam \d+ (hari|jam|menit)/.test(await notice.innerText()) && /Senin, \d+ \w+, 00\.00/.test(await notice.innerText()), await notice.innerText().catch(() => ''));
  const above = await p.evaluate(() => {
    const n = [...document.querySelectorAll('[role=status]')].find((e) => e.textContent.includes('terkunci'));
    const list = document.querySelector('[aria-label="Target minggu ini"]');
    return !!n && !!list && n.getBoundingClientRect().bottom <= list.getBoundingClientRect().top;
  });
  check('pemberitahuan tepat di atas daftar minggu ini', above);
  check('tidak ada lagi tombol Mulai di minggu ini', await p.getByRole('list', { name: 'Target minggu ini' }).getByRole('link', { name: 'Mulai' }).count() === 0);
  check('minggu berikutnya ditandai terkunci', await seen(p.getByText(/Terkunci · terbuka dalam/)));
  await p.screenshot({ path: path.join(SHOTS, 'plan-terkunci.png'), fullPage: true });

  // 3. Beranda: the plan card shows the lock, and the next-step card is the cooldown.
  await p.goto(`${BASE}/app`);
  await p.getByRole('heading', { name: 'Rencana minggu ini' }).waitFor({ timeout: 30000 });
  const card = p.locator('section[aria-labelledby=plan-title]');
  check('Beranda: kartu rencana menampilkan kunci dan hitungan mundur', await seen(card.getByText('Langkah berikutnya terkunci.')) && await card.getByRole('link', { name: /^Lanjut:/ }).count() === 0);
  const rec = p.locator('section[aria-labelledby=rec-title]');
  check('Beranda: semua tugas selesai → jeda sampai minggu depan', await seen(rec.getByRole('heading', { name: 'Semua tugas minggu ini selesai' })) && /terbuka dalam \d+ (hari|jam|menit)/.test(await rec.innerText()));
  check('Beranda: tidak menawarkan pelajaran baru atau ujian unit', await p.getByText(/^Pelajaran berikutnya:/).count() === 0 && await rec.getByText(/^Ujian Unit/).count() === 0);
  await p.screenshot({ path: path.join(SHOTS, 'plan-beranda-jeda.png'), fullPage: true });
  saved = { state: JSON.stringify(await readState(p)), monday: await p.evaluate(() => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + 7); return d.getTime(); }) };
} catch (e) {
  await p.screenshot({ path: path.join(SHOTS, 'plan-gagal.png'), fullPage: true }).catch(() => {});
  check('rencana mingguan: macet', false, String(e.message).split('\n')[0].slice(0, 200));
}

// 4. Monday 00:05: next week's steps open.
if (saved) {
  const { p: q } = await phone({ time: saved.monday + 5 * 60_000, state: saved.state });
  try {
    await q.goto(`${BASE}/app/plan`);
    await q.getByRole('heading', { name: /^Minggu ini/ }).waitFor({ timeout: 30000 });
    check('Senin 00.05: kunci hilang, minggu 2 terbuka dengan tombol Mulai', await seen(q.getByText(/^2\s*\/\s*52$/)) && await q.getByText('Langkah berikutnya terkunci.').count() === 0 && await q.getByRole('list', { name: 'Target minggu ini' }).getByRole('link', { name: 'Mulai' }).count() > 0);
    await q.goto(`${BASE}/app`);
    const rec = q.locator('section[aria-labelledby=rec-title]');
    await rec.waitFor({ timeout: 30000 });
    check('Senin 00.05: Beranda kembali menawarkan langkah berikutnya', await rec.getByRole('heading', { name: 'Semua tugas minggu ini selesai' }).count() === 0);
  } catch (e) {
    check('minggu berikutnya: macet', false, String(e.message).split('\n')[0].slice(0, 200));
  }
}

check('tanpa error di konsol', issues.length === 0, issues.slice(0, 3).join(' | '));
await browser.close();
console.log(process.exitCode === 1 ? '\nADA YANG GAGAL' : '\nSEMUA LOLOS');
