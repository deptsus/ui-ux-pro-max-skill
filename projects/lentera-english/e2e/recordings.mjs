// End-to-end check of recordings (Rilis 6): the "Rekaman" tab in /admin
// (upload a file, record from the microphone, replace, delete), the upload
// API's checks, publishing, playback in the learner app (recording first,
// in the learner's accent), and that guests never receive the recording of
// a Premium text.
//
// Needs a server with the embedded backend and the admin address set
// (see e2e/admin-app.mjs); Chromium's fake microphone stands in for a real one.
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
const get = async (url, token) => (await fetch(BASE + url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })).json();
const account = async (email, name) => {
  let r = await post('/api/dev-auth', { action: 'signin', email, password: PASSWORD });
  if (r.status !== 200) r = await post('/api/dev-auth', { action: 'signup', email, password: PASSWORD, name });
  if (r.status !== 200) throw new Error(`cannot sign in ${email}: ${JSON.stringify(r.data)}`);
  return r.data;
};
/** A short 440 Hz tone as a 16-bit mono WAV file. */
function wav(seconds = 0.4, rate = 8000) {
  const n = Math.round(seconds * rate);
  const b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVE', 8); b.write('fmt ', 12);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(rate, 24);
  b.writeUInt32LE(rate * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(Math.sin((i / rate) * 2 * Math.PI * 440) * 8000), 44 + i * 2);
  return b;
}
async function upload(token, { text, accent = 'us', bytes = wav(), name = 'rekaman.wav', speaker = 'Penguji' }) {
  const fd = new FormData();
  fd.append('file', new Blob([bytes]), name);
  fd.append('text', text);
  fd.append('accent', accent);
  fd.append('speaker', speaker);
  const res = await fetch(`${BASE}/api/admin/audio`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd });
  return { status: res.status, data: await res.json().catch(() => ({})) };
}
const status = async (url) => (await fetch(BASE + url)).status;

const admin = await account(ADMIN, 'Admin Uji');
const student = await account(`rekaman${stamp}@lentera.test`, 'Siswa Rekaman');
const rows = (await post('/api/admin', { action: 'content' }, admin.token)).data;
const free = rows.listening_items.find((l) => !l.is_premium && l.level_code === 'A1');
const premium = rows.listening_items.find((l) => l.is_premium && l.level_code === 'C2');
if (!free || !premium) throw new Error('listening items not found');

// ───────────── 1. The upload API refuses what it should ─────────────
{
  check('API: tamu tidak bisa mengunggah (401)', (await upload(null, { text: free.transcript })).status === 401);
  check('API: pelajar biasa tidak bisa mengunggah (403)', (await upload(student.token, { text: free.transcript })).status === 403);
  check('API: berkas yang bukan audio ditolak (415)', (await upload(admin.token, { text: free.transcript, bytes: Buffer.from('hello, this is not audio at all'), name: 'x.mp3' })).status === 415);
  check('API: tanpa teks ditolak (400)', (await upload(admin.token, { text: '  ' })).status === 400);
  check('API: aksen selain US/UK ditolak (400)', (await upload(admin.token, { text: free.transcript, accent: 'au' })).status === 400);
  const big = Buffer.concat([wav(0.1), Buffer.alloc(4 * 1024 * 1024)]);
  check('API: berkas di atas 4 MB ditolak (413)', (await upload(admin.token, { text: free.transcript, bytes: big })).status === 413);
  const del = await fetch(`${BASE}/api/admin/audio`, { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${student.token}` }, body: JSON.stringify({ key: 'rec.x.us' }) });
  check('API: pelajar biasa tidak bisa menghapus rekaman (403)', del.status === 403);
}

// ───────────── 2. The "Rekaman" tab ─────────────
const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
const issues = [];
const desk = await browser.newContext({ viewport: { width: 1280, height: 900 }, permissions: ['microphone'] });
await desk.addInitScript((s) => localStorage.setItem('lentera.session', JSON.stringify(s)), admin);
const a = await desk.newPage();
a.on('console', (m) => { if (m.type() === 'error' && !/status of 40[0-9]/.test(m.text())) issues.push(`${new URL(a.url()).pathname}: ${m.text().slice(0, 200)}`); });
a.on('pageerror', (e) => issues.push(`pageerror: ${e.message}`));
a.on('dialog', (d) => void d.accept());
const counter = () => a.locator('[data-recorded]').getAttribute('data-recorded').then(Number);
let firstUrl = '';
try {
  await a.goto(`${BASE}/admin`);
  await a.getByRole('tab', { name: 'Rekaman' }).click({ timeout: 45000 });
  const panel = a.locator('#panel-recordings');
  await panel.getByRole('tab', { name: 'Materi menyimak' }).waitFor({ timeout: 30000 });
  const total = Number(await a.locator('[data-total]').getAttribute('data-total'));
  check('tab Rekaman: semua materi menyimak terdaftar dengan status per aksen', total === rows.listening_items.length && (await counter()) === 0, `${total}/${rows.listening_items.length}`);

  // Upload a file for the free A1 item.
  await panel.getByLabel('Cari teks').fill(free.id);
  await panel.getByLabel(/^Berkas rekaman untuk:/).first().setInputFiles({ name: 'sapaan.wav', mimeType: 'audio/wav', buffer: wav(0.6) });
  await a.waitForFunction(() => document.querySelector('[data-recorded]')?.getAttribute('data-recorded') === '1', null, { timeout: 15000 });
  check('unggah berkas: tercatat "1 dari N teks sudah direkam"', (await counter()) === 1);
  await panel.getByLabel('Status rekaman').selectOption('done');
  const row = panel.locator('li[data-recording="yes"]').first();
  check('unggah berkas: baris menampilkan "US sudah" dan penuturnya bisa diputar', await row.getByText('US sudah').count() === 1 && await row.getByRole('button', { name: 'Putar' }).count() === 1);

  // Record the next item with the (fake) microphone.
  await panel.getByLabel('Cari teks').fill('');
  await panel.getByLabel('Status rekaman').selectOption('missing');
  const next = panel.locator('li[data-recording="no"]').first();
  await next.getByRole('button', { name: 'Rekam', exact: true }).click();
  await next.getByRole('button', { name: 'Mulai rekam' }).click();
  await next.getByText(/^Merekam /).waitFor({ timeout: 10000 });
  await a.waitForTimeout(1500);
  await next.getByRole('button', { name: 'Selesai' }).click();
  await a.getByLabel('Dengarkan hasil rekaman').waitFor({ timeout: 10000 });
  await a.getByRole('button', { name: 'Simpan rekaman' }).click();
  await a.waitForFunction(() => document.querySelector('[data-recorded]')?.getAttribute('data-recorded') === '2', null, { timeout: 15000 });
  check('rekam dari mikrofon: dengar ulang, simpan, tercatat (2 teks)', (await counter()) === 2);

  // The UK recording of the same free item.
  await panel.getByRole('button', { name: 'Inggris (UK)' }).click();
  await panel.getByLabel('Cari teks').fill(free.id);
  await panel.getByLabel(/^Berkas rekaman untuk:/).first().setInputFiles({ name: 'sapaan-uk.wav', mimeType: 'audio/wav', buffer: wav(0.5) });
  await a.waitForFunction(() => document.querySelector('[data-recorded]')?.getAttribute('data-recorded') === '1', null, { timeout: 15000 });
  check('aksen UK dicatat terpisah dari US', (await counter()) === 1);
  await a.screenshot({ path: path.join(SHOTS, 'rekaman-admin.png'), fullPage: true });
} catch (e) {
  await a.screenshot({ path: path.join(SHOTS, 'rekaman-gagal-admin.png'), fullPage: true }).catch(() => {});
  check('tab Rekaman: macet', false, String(e.message).split('\n')[0].slice(0, 200));
}

// ───────────── 3. Replace, publish, and what each learner receives ─────────────
{
  const draft = (await post('/api/admin', { action: 'content' }, admin.token)).data.audio_resources;
  const us = draft.find((r) => r.transcript === free.transcript.trim() && r.accent === 'us');
  firstUrl = us?.url ?? '';
  check('rekaman tersimpan dengan teks, aksen, dan penutur', !!us && us.key.startsWith('rec.') && us.key.endsWith('.us') && /^\/api\/audio\//.test(us.url) && (await status(us.url)) === 200, JSON.stringify(us));
  const again = await upload(admin.token, { text: `  ${free.transcript.toUpperCase()}  `, speaker: 'Penguji Dua' });
  check('unggah ulang teks yang sama (beda huruf besar): menggantikan rekaman lama, berkas lama dihapus', again.status === 200 && again.data.key === us?.key && again.data.url !== firstUrl && (await status(firstUrl)) === 404 && (await status(again.data.url)) === 200, JSON.stringify(again.data));
  firstUrl = again.data.url;
  const prem = await upload(admin.token, { text: premium.transcript });
  check('rekaman materi Premium tersimpan', prem.status === 200);
  const pub = await post('/api/admin', { action: 'publish', label: `rekaman-${stamp}`, notes: 'uji rekaman' }, admin.token);
  check('kurikulum dengan rekaman bisa diterbitkan', pub.data.published === true, JSON.stringify(pub.data).slice(0, 200));
  const guestPack = (await get('/api/content')).pack ?? {};
  const premiumPack = (await get('/api/content', admin.token)).pack ?? {};
  const has = (p, text) => (p.audio ?? []).some((r) => r.transcript === text.trim());
  check('tamu menerima rekaman materi gratis', has(guestPack, free.transcript));
  check('tamu TIDAK menerima rekaman (dan teks) materi Premium', !has(guestPack, premium.transcript) && !JSON.stringify(guestPack.audio ?? []).includes(premium.transcript.slice(0, 40)));
  check('pelajar Premium menerima kedua rekaman', has(premiumPack, free.transcript) && has(premiumPack, premium.transcript));
}

// ───────────── 4. Playback in the learner app ─────────────
{
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await phone.addInitScript((s) => {
    localStorage.setItem('lentera.session', JSON.stringify(s));
    // Record what the app asks to play.
    window.__played = [];
    const Real = window.Audio;
    window.Audio = function (src) { window.__played.push(String(src)); const el = new Real(src); el.muted = true; return el; };
    window.speechSynthesis && (window.speechSynthesis.speak = (u) => { window.__played.push(`tts:${u.text}`); setTimeout(() => u.onend?.(), 10); });
  }, admin);
  const p = await phone.newPage();
  p.on('pageerror', (e) => issues.push(`pageerror: ${e.message}`));
  try {
    await p.goto(`${BASE}/app/listening?id=${free.id}`);
    await p.getByText(/^Rekaman suara · aksen Amerika/).first().waitFor({ timeout: 45000 });
    check('pelajar: label sumber "Rekaman suara · aksen Amerika · Penguji Dua"', (await p.getByText('Rekaman suara · aksen Amerika · Penguji Dua').count()) > 0);
    await p.getByRole('button', { name: 'Putar audio', exact: true }).first().click();
    await p.waitForFunction(() => window.__played.length > 0, null, { timeout: 10000 });
    const played = await p.evaluate(() => window.__played);
    check('pelajar: tombol putar memutar rekaman, bukan suara perangkat', played[0] === firstUrl, played.join(' | '));
    await p.getByRole('button', { name: 'Inggris (British)' }).click();
    await p.getByText(/^Rekaman suara · aksen Inggris/).first().waitFor({ timeout: 10000 });
    await p.getByRole('button', { name: 'Putar audio', exact: true }).first().click();
    await p.waitForFunction(() => window.__played.length > 1, null, { timeout: 10000 });
    const uk = (await p.evaluate(() => window.__played)).at(-1);
    check('pelajar: aksen Inggris memutar rekaman UK', uk.startsWith('/api/audio/rec.') && uk !== firstUrl, uk);
    // A text without a recording still uses the device voice.
    await p.goto(`${BASE}/app/listening?tab=pelafalan`);
    await p.getByRole('button', { name: /^Dengarkan / }).first().click({ timeout: 30000 });
    await p.waitForFunction(() => window.__played.some((x) => x.startsWith('tts:')), null, { timeout: 10000 });
    check('pelajar: teks tanpa rekaman tetap dibacakan suara perangkat', true);
  } catch (e) {
    await p.screenshot({ path: path.join(SHOTS, 'rekaman-gagal-pelajar.png'), fullPage: true }).catch(() => {});
    check('pemutaran rekaman: macet', false, String(e.message).split('\n')[0].slice(0, 200));
  }
  await phone.close();
}

// ───────────── 5. Delete from the tab ─────────────
try {
  await a.reload();
  await a.getByRole('tab', { name: 'Rekaman' }).click({ timeout: 45000 });
  const panel = a.locator('#panel-recordings');
  await panel.getByLabel('Status rekaman').selectOption('done');
  await panel.getByLabel('Cari teks').fill(free.id);
  const before = await counter();
  await panel.locator('li[data-recording="yes"]').first().getByRole('button', { name: 'Hapus rekaman' }).click();
  await a.waitForFunction((n) => Number(document.querySelector('[data-recorded]')?.getAttribute('data-recorded')) === n - 1, before, { timeout: 15000 });
  check('hapus rekaman: hilang dari daftar dan berkasnya terhapus', (await status(firstUrl)) === 404);
} catch (e) {
  await a.screenshot({ path: path.join(SHOTS, 'rekaman-gagal-hapus.png'), fullPage: true }).catch(() => {});
  check('hapus rekaman: macet', false, String(e.message).split('\n')[0].slice(0, 200));
}

check('tanpa error di konsol', issues.length === 0, issues.slice(0, 3).join(' | '));
await browser.close();
const failed = process.exitCode === 1;
console.log(failed ? '\nADA YANG GAGAL' : '\nSEMUA LOLOS');
