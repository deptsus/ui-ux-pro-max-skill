// End-to-end check of the site inside the Android app 2.0 (Rilis 10), with
// the app's window.LenteraNative bridge simulated in the page: no speech
// engine in the WebView (the app reads aloud), reminders scheduled on the
// phone, the share sheet, and the update notice for 1.x installs that kept
// their login in Chrome. The real bridge is android/native (Bridge.java).
//
// Needs a server with the embedded backend (see e2e/admin-app.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { BASE, check, chromium } from './lib.mjs';

const SHOTS = process.env.E2E_SHOTS ?? path.join(import.meta.dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const stamp = Date.now();
const PASSWORD = 'rahasia-12345';

const call = async (url, body, token) => {
  const res = await fetch(BASE + url, { method: body === undefined ? 'GET' : 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: res.status, data: await res.json().catch(() => ({})) };
};
const signup = async (email, name) => {
  const r = await call('/api/dev-auth', { action: 'signup', email, password: PASSWORD, name });
  if (r.status !== 200) throw new Error(`cannot sign up ${email}: ${JSON.stringify(r.data)}`);
  return r.data;
};
const learner = await signup(`native${stamp}@lentera.test`, 'Nadia Native');

/** What the app's WebView looks like to the page: no speechSynthesis, and the bridge. */
function fakeApp() {
  delete Window.prototype.speechSynthesis;
  delete window.speechSynthesis;
  const listeners = [];
  window.__sent = [];
  window.__notif = window.__notif ?? 'default';
  const reply = (m) => setTimeout(() => listeners.forEach((f) => f({ data: JSON.stringify(m) })), 30);
  window.LenteraNative = {
    postMessage(data) {
      const m = JSON.parse(data);
      window.__sent.push(m);
      if (m.type === 'hello') reply({ type: 'hello', version: '2.0.0', versionCode: 5, notifications: window.__notif, speech: true, dailyHour: -1 });
      if (m.type === 'notify-permission') { window.__notif = 'granted'; reply({ type: 'notify-permission', state: 'granted' }); }
      if (m.type === 'daily') reply({ type: 'daily', state: window.__notif, hour: m.hour });
      if (m.type === 'speak') reply({ type: 'spoken', id: m.id, ok: true });
    },
    addEventListener(type, fn) { if (type === 'message') listeners.push(fn); },
  };
}

const browser = await chromium.launch();
const issues = [];
async function app(who, { native = true } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  if (native) await ctx.addInitScript(fakeApp);
  await ctx.addInitScript((s) => { if (s && !sessionStorage.getItem('e2e-init')) { sessionStorage.setItem('e2e-init', '1'); localStorage.setItem('lentera.session', JSON.stringify(s)); } }, who);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !/status of 40[0-9]/.test(m.text())) issues.push(`${new URL(page.url()).pathname}: ${m.text().slice(0, 200)}`); });
  page.on('pageerror', (e) => issues.push(`pageerror: ${e.message}`));
  return page;
}
const sent = (page, type) => page.evaluate((t) => window.__sent.filter((m) => m.type === t), type);
const waitSent = async (page, type, ms = 15000) => {
  for (let t = 0; t < ms; t += 250) {
    const list = await sent(page, type);
    if (list.length) return list;
    await page.waitForTimeout(250);
  }
  return [];
};

// ───────────── 1. In the 2.0 app ─────────────
const p = await app(learner);
try {
  await p.goto(`${BASE}/app?apk=5`);
  await p.locator('main').first().waitFor({ timeout: 30000 });
  await p.waitForTimeout(1500);
  check('aplikasi 2.0 tidak melihat ajakan memperbarui', (await p.getByText('Versi baru aplikasi Lentera').count()) === 0);
  const streak = await waitSent(p, 'streak');
  check('beruntun dikirim ke aplikasi untuk pengingat di HP', streak.length > 0 && typeof streak[0].current === 'number' && 'lastDate' in streak[0]);
  check('daftar PR dikirim ke aplikasi', (await waitSent(p, 'homework')).length > 0);
  check('jam pengingat dari server dibaca sekali saat aplikasi dibuka', (await waitSent(p, 'daily')).length === 1);

  await p.goto(`${BASE}/app/vocabulary`);
  const play = p.getByRole('button', { name: /^Dengarkan / }).first();
  await play.waitFor({ timeout: 30000 });
  const word = (await play.getAttribute('aria-label')).replace('Dengarkan ', '');
  await play.click();
  const spoken = await waitSent(p, 'speak');
  check('tanpa speechSynthesis, aplikasi yang membacakan kata (mesin suara HP)', spoken.some((m) => m.text === word && /^en-(US|GB)$/.test(m.lang)), JSON.stringify(spoken).slice(0, 200));
  await p.getByRole('button', { name: `Dengarkan ${word} (lambat)` }).click();
  check('tombol lambat meminta suara lambat', (await waitSent(p, 'speak')).some((m) => m.slow === true) || (await sent(p, 'speak')).some((m) => m.slow === true));

  await p.goto(`${BASE}/app/settings#pengingat`);
  const card = p.locator('#pengingat');
  await card.getByText('Notifikasi aplikasi Lentera: belum diizinkan').waitFor({ timeout: 30000 });
  check('pengaturan memakai notifikasi aplikasi, bukan notifikasi browser', (await card.getByText('Notifikasi di HP ini').count()) === 0);
  await card.getByRole('button', { name: 'Izinkan notifikasi' }).click();
  await card.getByText('Notifikasi aplikasi Lentera: diizinkan').waitFor({ timeout: 15000 });
  check('mengizinkan notifikasi lewat aplikasi', true);
  await p.waitForFunction(() => !document.querySelector('#pengingat select')?.disabled, null, { timeout: 15000 }).catch(() => {});
  await card.getByLabel(/Jam pengingat/).selectOption('20');
  await card.getByText(/Pengingat harian diatur pukul 20\.00/).waitFor({ timeout: 15000 });
  check('jam pengingat juga dijadwalkan di HP', (await sent(p, 'daily')).some((m) => m.hour === 20));
  await card.getByRole('radio', { name: 'Mati' }).click();
  await card.getByText('Pengingat PR dimatikan.').waitFor({ timeout: 15000 });
  await p.waitForTimeout(500);
  check('mematikan pengingat PR membatalkan jadwal PR di HP', (await sent(p, 'homework')).at(-1)?.on === false);
  await p.screenshot({ path: path.join(SHOTS, 'native-pengingat.png'), fullPage: true });

  await p.goto(`${BASE}/app/leaderboard?tab=teman`);
  await p.getByRole('button', { name: 'Bagikan undangan' }).click({ timeout: 30000 });
  const share = await waitSent(p, 'share');
  check('undangan teman dibagikan lewat lembar berbagi Android', share.length === 1 && share[0].text.includes('/app/leaderboard'), JSON.stringify(share).slice(0, 200));
} catch (e) {
  await p.screenshot({ path: path.join(SHOTS, 'native-gagal.png'), fullPage: true }).catch(() => {});
  check('aplikasi 2.0: macet', false, String(e.message).split('\n')[0].slice(0, 200));
}

// ───────────── 2. Old 1.x installs (login kept in Chrome) ─────────────
const banner = (page) => page.getByRole('status').filter({ hasText: 'Versi baru aplikasi Lentera (2.0.0)' });
const guest = await app(null, { native: false });
try {
  await guest.goto(`${BASE}/app?apk=4`);
  await banner(guest).waitFor({ timeout: 30000 });
  const text = await banner(guest).innerText();
  check('tamu di aplikasi 1.3.0 diminta membuat akun dulu agar progres ikut pindah', text.includes('buat akun dulu') && await banner(guest).getByRole('link', { name: 'Buat akun' }).isVisible(), text.slice(0, 200));
  check('tombol Perbarui mengunduh APK 2.0', (await banner(guest).getByRole('link', { name: 'Perbarui' }).getAttribute('href')) === '/download/lentera-english.apk');
  const apk = await fetch(`${BASE}/download/lentera-english.apk`);
  const old = await fetch(`${BASE}/download/lentera-english-1.3.0.apk`);
  check('APK 2.0 dan cadangan 1.3.0 bisa diunduh', apk.status === 200 && old.status === 200);
} catch (e) {
  check('ajakan memperbarui (tamu): macet', false, String(e.message).split('\n')[0].slice(0, 200));
}
const old = await app(learner, { native: false });
try {
  await old.goto(`${BASE}/app?apk=3`);
  await banner(old).waitFor({ timeout: 30000 });
  const text = await banner(old).innerText();
  check('pengguna berakun di aplikasi lama diberi tahu harus masuk sekali lagi', text.includes('masuk sekali lagi') && (await banner(old).getByRole('link', { name: 'Buat akun' }).count()) === 0, text.slice(0, 200));
  await banner(old).getByRole('link', { name: 'Perbarui' }).click({ noWaitAfter: true }).catch(() => {});
  check('setelah mengetuk Perbarui: buka file lalu masuk lagi', await banner(old).getByText('lalu masuk lagi dengan akunmu').waitFor({ timeout: 10000 }).then(() => true, () => false));
} catch (e) {
  check('ajakan memperbarui (berakun): macet', false, String(e.message).split('\n')[0].slice(0, 200));
}

// ───────────── 3. A normal browser is unchanged ─────────────
const web = await app(learner, { native: false });
try {
  await web.goto(`${BASE}/app/settings#pengingat`);
  await web.locator('#pengingat').getByText(/Notifikasi di HP ini/).waitFor({ timeout: 30000 });
  check('browser biasa tetap memakai notifikasi browser', (await web.getByText('Notifikasi aplikasi Lentera').count()) === 0);
} catch (e) {
  check('browser biasa: macet', false, String(e.message).split('\n')[0].slice(0, 200));
}

check('tanpa error di konsol', issues.length === 0, issues.slice(0, 3).join(' | '));
await browser.close();
console.log(process.exitCode === 1 ? '\nADA YANG GAGAL' : '\nSEMUA LOLOS');
