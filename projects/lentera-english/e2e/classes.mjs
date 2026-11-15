// End-to-end check of Rilis 10 "Kelas": the owner issues a school license in
// /admin, a teacher activates it, creates a class and gives an assignment, a
// student joins with the class code (and gets class Premium), the teacher sees
// the result, a parent links with the child's code, and the owner stops the
// license. Also the public /sekolah page and small-phone layouts.
//
// Needs a server with the embedded backend and LENTERA_DEV_ADMIN_EMAIL set
// (see e2e/admin-app.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { BASE, check, chromium } from './lib.mjs';

const SHOTS = process.env.E2E_SHOTS ?? path.join(import.meta.dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const stamp = Date.now();
const PASSWORD = 'rahasia-12345';
const ADMIN = process.env.E2E_ADMIN_EMAIL ?? 'admin@lentera.test';

const call = async (url, body, token, method) => {
  const res = await fetch(BASE + url, { method: method ?? (body === undefined ? 'GET' : 'POST'), headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: res.status, data: await res.json().catch(() => ({})) };
};
const account = async (email, name) => {
  let r = await call('/api/dev-auth', { action: 'signup', email, password: PASSWORD, name });
  if (r.status !== 200) r = await call('/api/dev-auth', { action: 'signin', email, password: PASSWORD });
  if (r.status !== 200) throw new Error(`cannot sign in ${email}: ${JSON.stringify(r.data)}`);
  return r.data;
};

// ───────────── 1. APIs refuse guests, non-admins and bad input ─────────────
check('API kelas, guru, dan orang tua menolak tanpa login', (await call('/api/classes')).status === 401 && (await call('/api/teacher')).status === 401 && (await call('/api/parent')).status === 401);
const admin = await account(ADMIN, 'Admin Uji');
const guru = await account(`guru${stamp}@lentera.test`, 'Pak Guru Uji');
const siswa = await account(`siswa${stamp}@lentera.test`, 'Siti Uji');
const ortu = await account(`ortu${stamp}@lentera.test`, 'Ibu Siti Uji');
check('lisensi sekolah hanya untuk admin', [401, 403].includes((await call('/api/admin', { action: 'licenses' }, guru.token)).status));
check('lisensi dengan tanggal terbalik ditolak', (await call('/api/admin', { action: 'create-license', license: { school: 'X Uji', max_teachers: 1, max_classes: 1, seats: 5, starts: '2026-12-10', ends: '2026-12-01' } }, admin.token)).status === 400);
check('kode kelas yang formatnya salah ditolak', (await call('/api/classes', { action: 'join', code: '12' }, siswa.token)).status === 400);
check('kode lisensi yang tidak ada ditolak dengan pesan jelas', (await call('/api/teacher', { action: 'activate', code: 'ZZZZZZZZ' }, guru.token)).data.code === 'code_not_found');

const browser = await chromium.launch();
const issues = [];
async function signedIn(who, viewport = { width: 390, height: 844 }) {
  const ctx = await browser.newContext({ viewport, isMobile: viewport.width < 600, hasTouch: viewport.width < 600, acceptDownloads: true, permissions: ['clipboard-read', 'clipboard-write'] });
  await ctx.addInitScript((s) => { if (s && !sessionStorage.getItem('e2e-init')) { sessionStorage.setItem('e2e-init', '1'); localStorage.setItem('lentera.session', JSON.stringify(s)); } }, who);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !/status of 40[0-9]/.test(m.text())) issues.push(`${new URL(page.url()).pathname}: ${m.text().slice(0, 200)}`); });
  page.on('pageerror', (e) => issues.push(`pageerror: ${e.message}`));
  return page;
}
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
let step = '';
const fail = async (page, name, e) => {
  await page.screenshot({ path: path.join(SHOTS, `kelas-gagal-${name}.png`), fullPage: true }).catch(() => {});
  check(`${name}: macet${step ? ` (langkah: ${step})` : ''}`, false, String(e.message).split('\n')[0].slice(0, 200));
  step = '';
};

// ───────────── 2. Owner issues a license ─────────────
const school = `SMP Uji ${stamp % 100000}`;
let licenseCode = '';
const a = await signedIn(admin, { width: 1280, height: 900 });
try {
  await a.goto(`${BASE}/admin?tab=schools`);
  // Every admin panel stays mounted; work inside the Sekolah tab only.
  const panel = a.locator('#panel-schools');
  await panel.getByRole('heading', { name: 'Lisensi sekolah' }).waitFor({ timeout: 30000 });
  await panel.getByLabel('Nama sekolah/kursus').fill(school);
  await panel.getByLabel(/^Kontak/).fill('Bu Kepala, 0812');
  await panel.getByLabel('Siswa per kelas').fill('2');
  await panel.getByLabel(/^Catatan/).fill('Lunas, uji e2e');
  await panel.getByRole('button', { name: 'Buat lisensi' }).click();
  const status = panel.getByRole('status').filter({ hasText: 'Kode untuk guru' });
  await status.waitFor({ timeout: 15000 });
  licenseCode = (await status.innerText()).match(/Kode untuk guru: ([A-Z2-9]{8})/)?.[1] ?? '';
  check('pemilik membuat lisensi dan mendapat kode guru 8 karakter', /^[A-HJ-NP-Z2-9]{8}$/.test(licenseCode), await status.innerText());
  const card = panel.locator('li').filter({ hasText: school });
  check('lisensi baru tampil aktif dengan kuota dan catatan', await card.getByText('Aktif', { exact: true }).isVisible() && /guru 0\/3 · kelas 0\/3 · 0 siswa \(maks 2\/kelas\)/.test(await card.innerText()) && (await card.innerText()).includes('Lunas, uji e2e'));
  await a.screenshot({ path: path.join(SHOTS, 'kelas-admin-sekolah.png'), fullPage: true });
} catch (e) {
  await fail(a, 'lisensi pemilik', e);
}

// ───────────── 3. Teacher activates, creates a class, gives an assignment ─────────────
let joinCode = '';
let assignedTitle = '';
let assignedId = '';
const g = await signedIn(guru);
try {
  await g.goto(`${BASE}/app/guru`);
  await g.getByRole('heading', { name: 'Aktifkan akun guru' }).waitFor({ timeout: 30000 });
  await g.getByLabel(/Kode lisensi sekolah/).fill(licenseCode.toLowerCase());
  await g.getByRole('button', { name: 'Aktifkan' }).click();
  await g.getByText(`Akun guru aktif untuk ${school}`).waitFor({ timeout: 15000 });
  check('guru mengaktifkan kode lisensi (huruf kecil pun diterima)', true);
  check('guru langsung Premium dari lisensi', (await call('/api/me', undefined, guru.token)).data.user?.entitlement?.plan === 'teacher');
  await g.getByLabel('Nama kelas').fill('8A Uji');
  await g.getByRole('button', { name: 'Buat' }).click();
  // A new class opens straight away.
  step = 'kelas baru terbuka';
  await g.getByRole('heading', { name: /8A Uji/ }).waitFor({ timeout: 15000 });
  const overview = (await call('/api/teacher', undefined, guru.token)).data;
  joinCode = overview.classes?.[0]?.join_code ?? '';
  check('kelas dibuat dengan kode 6 karakter', /^[A-HJ-NP-Z2-9]{6}$/.test(joinCode), JSON.stringify(overview).slice(0, 200));
  check('halaman kelas guru muat di layar 390 px', (await overflow(g)) <= 0);
  step = 'tab tugas';
  check('halaman kelas menampilkan kode kelas besar', (await g.getByLabel(`Kode kelas ${joinCode.split('').join(' ')}`).innerText()) === joinCode);
  await g.getByRole('button', { name: /^Tugas \(/ }).click();
  const materi = g.getByLabel('Materi');
  await materi.waitFor({ timeout: 15000 });
  step = 'pilih materi';
  const first = materi.locator('option:not([value=""])').first();
  assignedId = await first.getAttribute('value');
  assignedTitle = (await first.innerText()).trim();
  await materi.selectOption(assignedId);
  await g.getByLabel(/Catatan untuk siswa/).fill('Kerjakan sampai tuntas');
  step = 'berikan tugas';
  await g.getByRole('button', { name: 'Berikan tugas' }).click();
  await g.getByText(assignedTitle).last().waitFor({ timeout: 15000 });
  check('guru memberi tugas pelajaran dengan tenggat', /^Tugas \(1\)$/.test((await g.getByRole('button', { name: /^Tugas \(/ }).innerText()).trim()));
  await g.screenshot({ path: path.join(SHOTS, 'kelas-guru-tugas.png'), fullPage: true });
} catch (e) {
  await fail(g, 'guru', e);
}

// ───────────── 4. Student joins with the code and sees the work ─────────────
const s = await signedIn(siswa);
try {
  await s.goto(`${BASE}/app/kelas?kode=${joinCode}`);
  const input = s.getByLabel(/Kode kelas dari guru/);
  await input.waitFor({ timeout: 30000 });
  check('tautan ajakan mengisi kode kelas', (await input.inputValue()) === joinCode);
  await s.getByRole('button', { name: 'Gabung' }).click();
  await s.getByText(/Kamu bergabung ke kelas 8A Uji/).waitFor({ timeout: 15000 });
  check('siswa melihat kelas, sekolah, dan gurunya', await s.getByText(`${school} · Guru: Pak Guru Uji`).isVisible());
  check('tugas tampil dengan tombol Kerjakan menuju pelajarannya', (await s.getByRole('link', { name: 'Kerjakan' }).getAttribute('href')) === `/app/lesson?id=${encodeURIComponent(assignedId)}`);
  check('siswa mendapat Premium kelas', (await call('/api/me', undefined, siswa.token)).data.user?.entitlement?.plan === 'class');
  check('Kelas Saya muat di layar 390 px', (await overflow(s)) <= 0);
  await s.screenshot({ path: path.join(SHOTS, 'kelas-siswa.png'), fullPage: true });
  await s.goto(`${BASE}/app`);
  const tasks = s.getByRole('region', { name: 'Tugas dari guru' });
  await tasks.waitFor({ timeout: 30000 });
  check('beranda menampilkan kartu Tugas dari guru', (await tasks.innerText()).includes(assignedTitle));
  await s.goto(`${BASE}/app/subscription`);
  check('halaman Premium menjelaskan Premium dari lisensi sekolah', await s.getByText(/dari lisensi sekolah untuk kelasmu/).waitFor({ timeout: 30000 }).then(() => true, () => false));
} catch (e) {
  await fail(s, 'siswa', e);
}

// The student finishes the lesson (synced the way the app does), then the teacher sees it.
const sync = await call('/api/sync', { events: [{ id: `lesson-${stamp}`, kind: 'lesson', at: Date.now(), data: { id: assignedId, score: 92, passed: true } }], snapshot: null, updatedAt: 1 }, siswa.token);
check('pelajaran selesai tersinkron ke server', sync.status === 200, JSON.stringify(sync.data).slice(0, 200));
try {
  await s.goto(`${BASE}/app/kelas`);
  await s.getByText(/Selesai · 92/).waitFor({ timeout: 30000 });
  check('siswa melihat nilainya pada tugas', true);
} catch (e) {
  await fail(s, 'nilai siswa', e);
}
try {
  step = 'muat ulang';
  await g.reload();
  await g.getByRole('button', { name: 'Buka kelas' }).first().click();
  step = 'tab siswa';
  await g.getByRole('button', { name: /^Siswa \(1\)$/ }).waitFor({ timeout: 15000 });
  const card = g.getByRole('list', { name: /Progres siswa kelas/ }).getByRole('listitem').filter({ hasText: 'Siti Uji' });
  check('guru melihat siswa dan tugasnya selesai (1/1) dalam kartu di HP', (await card.innerText()).includes('1/1'));
  const download = g.waitForEvent('download', { timeout: 15000 });
  await g.getByRole('button', { name: 'Unduh rekap (CSV)' }).click();
  const file = await (await download).path();
  const csv = fs.readFileSync(file, 'utf8');
  check('rekap CSV berisi nama siswa dan nilai tugas', csv.includes('Siti Uji') && csv.includes('92'), csv.slice(0, 200));
  await g.setViewportSize({ width: 360, height: 780 });
  check('halaman kelas guru muat di layar 360 px', (await overflow(g)) <= 0 && await card.isVisible());
  await g.screenshot({ path: path.join(SHOTS, 'kelas-guru-siswa.png'), fullPage: true });
} catch (e) {
  await fail(g, 'progres siswa', e);
}

// ───────────── 5. Parent links with the child's code ─────────────
let parentCode = '';
try {
  await s.goto(`${BASE}/app/profile`);
  await s.getByRole('button', { name: 'Buat kode untuk orang tua' }).click();
  const box = s.getByText('Berikan kode ini ke orang tuamu').locator('..');
  await box.waitFor({ timeout: 15000 });
  parentCode = ((await box.innerText()).match(/\b([A-HJ-NP-Z2-9]{8})\b/) ?? [])[1] ?? '';
  check('anak membuat kode orang tua 8 karakter', parentCode.length === 8, await box.innerText());
} catch (e) {
  await fail(s, 'kode orang tua', e);
}
const o = await signedIn(ortu);
try {
  await o.goto(`${BASE}/app/orang-tua`);
  await o.getByLabel('Kode dari anak').fill(parentCode);
  await o.getByRole('button', { name: 'Hubungkan' }).click();
  await o.getByText('Terhubung dengan Siti Uji').waitFor({ timeout: 15000 });
  const child = o.locator('section').filter({ has: o.getByRole('heading', { name: /Siti Uji/ }) });
  await child.waitFor({ timeout: 15000 });
  const text = await child.innerText();
  check('orang tua melihat hari aktif, pelajaran, PR, dan tugas guru', ['Hari aktif minggu ini', 'Pelajaran minggu ini', 'PR terbuka', 'Tugas guru belum selesai'].every((t) => text.includes(t)), text.slice(0, 300));
  check('orang tua melihat kelas anak', text.includes('8A Uji'));
  check('kode sekali pakai: dipakai lagi ditolak', (await call('/api/parent', { action: 'link', code: parentCode }, guru.token)).data.code === 'code_not_found');
  check('Pantau Anak muat di layar 390 px', (await overflow(o)) <= 0);
  await o.screenshot({ path: path.join(SHOTS, 'kelas-orang-tua.png'), fullPage: true });
  await s.goto(`${BASE}/app/profile`);
  check('profil anak menampilkan siapa yang memantau', await s.getByText('Ibu Siti Uji').waitFor({ timeout: 15000 }).then(() => true, () => false));
} catch (e) {
  await fail(o, 'orang tua', e);
}

// ───────────── 6. The owner stops the license ─────────────
try {
  const list = (await call('/api/admin', { action: 'licenses' }, admin.token)).data;
  const mine = list.find((l) => l.code === licenseCode);
  check('daftar lisensi menghitung guru, kelas, dan siswa', mine && mine.teachers === 1 && mine.classes === 1 && mine.students === 1, String(JSON.stringify(mine)).slice(0, 200));
  a.once('dialog', (d) => d.accept());
  await a.reload();
  const panel = a.locator('#panel-schools');
  await panel.getByRole('heading', { name: 'Lisensi sekolah' }).waitFor({ timeout: 30000 });
  const card = panel.locator('li').filter({ hasText: school });
  await card.getByRole('button', { name: 'Hentikan' }).click();
  await card.getByText('Dihentikan', { exact: true }).waitFor({ timeout: 15000 });
  check('pemilik menghentikan lisensi', true);
  check('siswa kehilangan Premium kelas setelah lisensi dihentikan', (await call('/api/me', undefined, siswa.token)).data.user?.entitlement?.premium === false);
  check('kelas tidak menerima siswa baru setelah lisensi dihentikan', (await call('/api/classes', { action: 'join', code: joinCode }, ortu.token)).data.code === 'class_closed');
} catch (e) {
  await fail(a, 'hentikan lisensi', e);
}

// ───────────── 7. Public school page, guest views, navigation ─────────────
const p = await signedIn(null, { width: 360, height: 780 });
try {
  await p.goto(`${BASE}/sekolah`);
  await p.getByRole('heading', { name: 'Lentera untuk Sekolah' }).waitFor({ timeout: 30000 });
  check('halaman /sekolah: ajakan menghubungi dengan topik sekolah', (await p.getByRole('link', { name: 'Minta penawaran untuk sekolah' }).getAttribute('href')) === '/kontak?topik=sekolah');
  check('/sekolah muat di layar 360 px', (await overflow(p)) <= 0);
  await p.screenshot({ path: path.join(SHOTS, 'kelas-sekolah.png'), fullPage: true });
  await p.goto(`${BASE}/app/kelas?kode=ABC234`);
  check('tamu yang membuka tautan kelas diajak membuat akun', await p.getByText('Masuk untuk bergabung ke kelas ABC234').waitFor({ timeout: 30000 }).then(() => true, () => false));
  await p.goto(`${BASE}/app/more`);
  await p.getByRole('heading', { name: 'Lainnya' }).waitFor({ timeout: 30000 });
  const main = p.locator('main');
  check('menu Lainnya: Kelas Saya, Ruang Guru, Pantau Anak', await main.getByRole('link', { name: /Kelas Saya/ }).isVisible() && await main.getByRole('link', { name: /Ruang Guru/ }).isVisible() && await main.getByRole('link', { name: /Pantau Anak/ }).isVisible());
} catch (e) {
  await fail(p, 'halaman publik', e);
}

check('tanpa error di konsol', issues.length === 0, issues.slice(0, 3).join(' | '));
await browser.close();
console.log(process.exitCode === 1 ? '\nADA YANG GAGAL' : '\nSEMUA LOLOS');
