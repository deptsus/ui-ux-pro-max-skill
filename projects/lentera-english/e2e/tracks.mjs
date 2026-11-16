// End-to-end check of Rilis 11 "Jalur Khusus & SEO": the special tracks in
// the app (first lesson free, separate from the CEFR path) and the public,
// static /materi pages with sitemap, robots.txt and structured data.
//
// Needs a server with the embedded backend (see e2e/admin-app.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { BASE, check, chromium } from './lib.mjs';

const SHOTS = process.env.E2E_SHOTS ?? path.join(import.meta.dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch();
const issues = [];
async function phone(width = 390) {
  const ctx = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !/status of 40[0-9]/.test(m.text())) issues.push(`${new URL(page.url()).pathname}: ${m.text().slice(0, 200)}`); });
  page.on('pageerror', (e) => issues.push(`pageerror: ${e.message}`));
  return page;
}
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
const fail = async (page, name, e) => {
  await page.screenshot({ path: path.join(SHOTS, `jalur-gagal-${name}.png`), fullPage: true }).catch(() => {});
  check(`${name}: macet`, false, String(e.message).split('\n')[0].slice(0, 200));
};

// ───────────── 1. Tracks in the app (guest) ─────────────
const g = await phone();
try {
  await g.goto(`${BASE}/app/jalur`);
  await g.getByRole('heading', { name: 'Jalur Khusus', level: 1 }).waitFor({ timeout: 30000 });
  for (const t of ['Bahasa Inggris untuk Kerja', 'Persiapan TOEFL ITP dan IELTS', 'Jalur Anak']) check(`jalur "${t}" tampil`, await g.getByRole('heading', { name: t }).isVisible());
  check('jalur TOEFL/IELTS memuat catatan tidak berafiliasi', await g.getByText(/Lentera tidak berafiliasi/).first().isVisible());
  const work = g.locator('section').filter({ has: g.getByRole('heading', { name: 'Bahasa Inggris untuk Kerja' }) });
  const first = work.getByRole('link', { name: /Wawancara Kerja: Memperkenalkan Diri/ });
  check('pelajaran pertama jalur kerja gratis dan bisa dibuka tamu', (await first.getAttribute('href')) === '/app/lesson?id=work-interview-intro' && (await first.innerText()).includes('Gratis'));
  check('pelajaran kedua jalur kerja mengarah ke Premium', (await work.getByRole('link', { name: /Email Kerja yang Sopan/ }).getAttribute('href')) === '/app/subscription');
  check('Jalur Khusus muat di layar 390 px', (await overflow(g)) <= 0);
  await g.screenshot({ path: path.join(SHOTS, 'jalur-app.png'), fullPage: true });

  await first.click();
  await g.getByRole('heading', { name: 'Wawancara Kerja: Memperkenalkan Diri' }).waitFor({ timeout: 30000 });
  const back = g.getByRole('link', { name: 'Jalur khusus' });
  check('halaman pelajaran jalur khusus kembali ke Jalur Khusus, bukan jalur CEFR', (await back.getAttribute('href')) === '/app/jalur#work');

  await g.goto(`${BASE}/app/path`);
  await g.getByRole('heading', { name: 'Jalur Belajar' }).waitFor({ timeout: 30000 });
  await g.waitForTimeout(500);
  check('jalur CEFR tidak memuat pelajaran jalur khusus', (await g.getByText('Wawancara Kerja').count()) === 0 && (await g.getByText('Warna dan Hewan').count()) === 0);

  await g.goto(`${BASE}/app`);
  const card = g.getByRole('link', { name: /Jalur Khusus/ }).filter({ hasText: 'Pelajaran pertama gratis' });
  check('beranda menautkan Jalur Khusus', await card.waitFor({ timeout: 30000 }).then(() => true, () => false));
  await g.goto(`${BASE}/app/more`);
  check('menu Lainnya memuat Jalur Khusus', await g.locator('main').getByRole('link', { name: /Jalur Khusus/ }).waitFor({ timeout: 30000 }).then(() => true, () => false));
} catch (e) {
  await fail(g, 'jalur di aplikasi', e);
}

// ───────────── 2. Public lesson pages ─────────────
const p = await phone(360);
try {
  const res = await p.goto(`${BASE}/materi`);
  check('/materi terbuka (200)', res.status() === 200);
  await p.getByRole('heading', { name: 'Materi Bahasa Inggris', level: 1 }).waitFor({ timeout: 30000 });
  check('/materi: semua level dan jalur khusus', await p.getByRole('heading', { name: /^A1 · Pemula/ }).isVisible() && await p.getByRole('heading', { name: /^C2 · Sangat Mahir/ }).isVisible() && await p.getByRole('heading', { name: 'Jalur khusus' }).isVisible());
  check('/materi muat di layar 360 px', (await overflow(p)) <= 0);
  check('/materi punya tautan kanonis', (await p.locator('link[rel="canonical"]').getAttribute('href')) === 'https://lentera-english-app.netlify.app/materi');

  await p.goto(`${BASE}/materi/work-interview-intro`);
  await p.getByRole('heading', { name: 'Wawancara Kerja: Memperkenalkan Diri', level: 1 }).waitFor({ timeout: 30000 });
  check('pelajaran gratis: seluruh penjelasan dan contoh benar/salah tampil', await p.getByRole('heading', { name: 'Tiga bagian jawaban' }).isVisible() && await p.getByRole('heading', { name: 'Pasangan kata yang sering salah' }).isVisible() && await p.getByRole('heading', { name: 'Benar atau salah?' }).isVisible());
  const ld = JSON.parse(await p.locator('script[type="application/ld+json"]').textContent());
  const res2 = ld['@graph'].find((x) => x['@type'] === 'LearningResource');
  check('data terstruktur LearningResource (gratis, CEFR, penyedia Lentera)', res2?.isAccessibleForFree === true && res2?.educationalLevel === 'CEFR B1' && res2?.provider?.name === 'Lentera English');
  check('judul halaman untuk mesin pencari', (await p.title()).includes('Wawancara Kerja: Memperkenalkan Diri'));
  check('tombol "Buka di aplikasi" menuju pelajarannya', (await p.getByRole('link', { name: 'Buka di aplikasi' }).getAttribute('href')) === '/app/lesson?id=work-interview-intro');

  await p.goto(`${BASE}/materi/exam-toefl-written`);
  await p.getByRole('heading', { name: /Written Expression/, level: 1 }).waitFor({ timeout: 30000 });
  check('pelajaran Premium: hanya bagian pertama penjelasan, tanpa contoh benar/salah', await p.getByRole('heading', { name: 'Cari subjek yang sebenarnya' }).isVisible() && (await p.getByRole('heading', { name: 'Struktur sejajar' }).count()) === 0 && (await p.getByRole('heading', { name: 'Benar atau salah?' }).count()) === 0);
  check('halaman materi tidak memuat soal latihan', (await p.content()).includes('The results of the experiment was surprising') === false);
  check('halaman TOEFL memuat catatan tidak berafiliasi', await p.getByText(/tidak berafiliasi/).first().isVisible());
  check('halaman pelajaran muat di layar 360 px', (await overflow(p)) <= 0);
  await p.screenshot({ path: path.join(SHOTS, 'jalur-materi.png'), fullPage: true });

  const missing = await p.goto(`${BASE}/materi/tidak-ada`);
  check('pelajaran yang tidak ada: 404', missing.status() === 404);
} catch (e) {
  await fail(p, 'halaman materi', e);
}

// ───────────── 3. Sitemap and robots ─────────────
const sitemap = await fetch(`${BASE}/sitemap.xml`).then((r) => r.text());
check('sitemap.xml memuat halaman materi dan jalur khusus', sitemap.includes('/materi/a1-greetings') && sitemap.includes('/materi/kids-family') && sitemap.includes('/sekolah'));
check('sitemap.xml tidak memuat aplikasi atau admin', !/\/app[/<]|\/admin/.test(sitemap));
const robots = await fetch(`${BASE}/robots.txt`).then((r) => r.text());
check('robots.txt menutup /app, /admin, /api dan menunjuk sitemap', /Disallow: \/app/.test(robots) && /Disallow: \/admin/.test(robots) && /Disallow: \/api/.test(robots) && robots.includes('Sitemap: https://lentera-english-app.netlify.app/sitemap.xml'));
const landing = await fetch(`${BASE}/`).then((r) => r.text());
check('halaman depan menautkan Materi gratis dan memuat Jalur khusus', landing.includes('href="/materi"') && landing.includes('Jalur khusus'));

check('tanpa error di konsol', issues.length === 0, issues.slice(0, 3).join(' | '));
await browser.close();
console.log(process.exitCode === 1 ? '\nADA YANG GAGAL' : '\nSEMUA LOLOS');
