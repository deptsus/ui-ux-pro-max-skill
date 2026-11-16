// End-to-end check of Rilis 15 "Pelajaran Interaktif": picture, scene,
// timeline and spelling items in a free lesson (guest), their feedback and
// accessibility, and the "Pasangan Kilat" memory game (themes, play, score).
//
// Needs a server with the embedded backend (see e2e/admin-app.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { BASE, check, chromium, fetchPack, runSession } from './lib.mjs';

const require = createRequire(import.meta.url);
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const SHOTS = process.env.E2E_SHOTS ?? path.join(import.meta.dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch();
const issues = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await ctx.addInitScript(() => localStorage.setItem('lentera.sound', '0'));
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error' && !/status of 40[0-9]/.test(m.text())) issues.push(`${new URL(page.url()).pathname}: ${m.text().slice(0, 200)}`); });
page.on('pageerror', (e) => issues.push(`pageerror: ${e.message}`));
const button = (name) => page.getByRole('button', { name });
const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
async function axe(label) {
  await page.evaluate(() => Promise.all(document.getAnimations().filter((a) => Number.isFinite(a.effect?.getComputedTiming().endTime)).map((a) => a.finished.catch(() => undefined)))).catch(() => {});
  if (!(await page.evaluate(() => !!window.axe))) await page.evaluate(AXE);
  const v = await page.evaluate(async () => (await window.axe.run(document, { resultTypes: ['violations'], runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } })).violations.map((x) => `${x.id}: ${x.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(', ')}`));
  check(`${label}: tanpa pelanggaran WCAG A/AA`, v.length === 0, v.join(' | '));
}
const fail = async (name, e) => {
  await page.screenshot({ path: path.join(SHOTS, `interaktif-gagal-${name}.png`), fullPage: true }).catch(() => {});
  check(`${name}: macet`, false, String(e.message).split('\n')[0].slice(0, 200));
};

// ───────────── 1. Interactive items in a free lesson (guest) ─────────────
await page.goto(`${BASE}/app`);
const pack = await fetchPack(page);
const NEW = ['picture', 'scene', 'timeline', 'spell'];
check('paket konten memuat keempat jenis soal interaktif', NEW.every((t) => pack.exercises.some((e) => e.type === t)), NEW.filter((t) => !pack.exercises.some((e) => e.type === t)).join(', '));
const typeOf = (id) => pack.exercises.find((e) => e.id === id)?.type;
const seenTypes = new Set();
const audited = new Set();
let wrongSpell = false;
const onQuestion = async (id, phase) => {
  const t = typeOf(id);
  if (!NEW.includes(t)) return;
  seenTypes.add(t);
  const key = `${t}:${phase}`;
  if (audited.has(key)) return;
  audited.add(key);
  if (phase === 'question') {
    check(`${t}: muat di layar 390 px`, (await overflow()) <= 0);
    if (t === 'picture') check('picture: pilihan berupa gambar dengan nama untuk pembaca layar', (await page.locator('[data-ex] [role=radiogroup] [role=radio] svg').count()) >= 2);
    if (t === 'scene') check('scene: adegan punya titik letak yang bisa diketuk', (await page.locator('[data-ex] [role=radiogroup] [role=radio]').count()) >= 2);
    if (t === 'timeline') check('timeline: garis waktu dan zona tampil', (await page.locator('[data-ex] svg').first().isVisible()) && (await page.getByRole('radiogroup', { name: 'Kapan terjadinya' }).getByRole('radio').count()) >= 2);
    if (t === 'spell') {
      const ex = pack.exercises.find((e) => e.id === id);
      const tiles = await page.getByRole('group', { name: 'Huruf' }).getByRole('button').count();
      check('spell: ubin huruf berisi huruf katanya ditambah dua pengecoh', tiles === ex.answers[0].length + 2, `${tiles} ubin untuk "${ex.answers[0]}"`);
      check('spell: tombol Periksa terkunci sebelum kata lengkap', await button('Periksa').isDisabled().catch(() => true));
    }
  }
  await page.screenshot({ path: path.join(SHOTS, `interaktif-${t}-${phase}.png`), fullPage: true });
  await axe(`${t} (${phase === 'question' ? 'soal' : phase === 'right' ? 'jawaban benar' : 'jawaban salah'})`);
};
try {
  await page.goto(`${BASE}/app/lesson?id=kids-colors-animals`);
  await button('Mulai belajar').click({ timeout: 30000 });
  await button('Lihat contoh benar dan salah').click();
  await button('Lanjut ke latihan').click();
  await button('Mulai latihan').click();
  await runSession(page, pack, { onQuestion });
  await page.getByRole('heading', { name: 'Latihan terbimbing selesai' }).waitFor({ timeout: 15000 });
  await button(/Lanjut ke latihan mandiri/).click();
  await button('Mulai latihan mandiri').click();
  // One wrong spelling, to see the feedback with the right word.
  await runSession(page, pack, { onQuestion, plan: (_, id) => { if (typeOf(id) === 'spell' && !wrongSpell) { wrongSpell = true; return false; } return true; } });
  await page.getByRole('heading', { name: 'Latihan mandiri selesai' }).waitFor({ timeout: 15000 });
  check('ejaan yang salah dijawab dan dinilai "Belum tepat"', wrongSpell && audited.has('spell:wrong'));
  await button(/Lanjut ke pr/i).click();
  await button(/Terima PR/).click();
  await button('Lanjut ke tes penguasaan').click();
  await button('Mulai tes').click();
  await runSession(page, pack, { onQuestion, deferred: true });
  await page.getByRole('heading', { name: 'Lulus tes penguasaan!' }).waitFor({ timeout: 15000 });
  check('pelajaran gratis kids-colors-animals memuat gambar, adegan, dan ejaan', ['picture', 'scene', 'spell'].every((t) => seenTypes.has(t)), [...seenTypes].join(', '));
  await page.screenshot({ path: path.join(SHOTS, 'interaktif-lulus.png'), fullPage: true });
} catch (e) {
  await fail('pelajaran interaktif', e);
}

// Timeline items live in a free A1 lesson too.
try {
  const tl = pack.exercises.find((e) => e.type === 'timeline' && e.lessonId === 'a1-simple-present');
  check('a1-simple-present (gratis) memuat soal garis waktu', !!tl);
} catch (e) {
  await fail('garis waktu', e);
}

// ───────────── 2. Pasangan Kilat ─────────────
try {
  await page.goto(`${BASE}/app/review`);
  check('Ulangan menautkan Pasangan Kilat', await page.locator('main').getByRole('link', { name: 'Main' }).last().waitFor({ timeout: 30000 }).then(async () => (await page.locator('main a[href="/app/pasangan"]').count()) > 0, () => false));
  await page.goto(`${BASE}/app/more`);
  check('menu Lainnya memuat Pasangan Kilat', await page.locator('main').getByRole('link', { name: /Pasangan Kilat/ }).waitFor({ timeout: 30000 }).then(() => true, () => false));

  await page.goto(`${BASE}/app/pasangan`);
  await page.getByRole('heading', { name: 'Pasangan Kilat', level: 1 }).waitFor({ timeout: 30000 });
  for (const t of ['Hewan', 'Warna', 'Makanan & Minuman']) check(`tema gratis "${t}" bisa dimainkan tamu`, await page.getByRole('button', { name: new RegExp(`^${t}\\s*\\d+ kata`) }).isVisible());
  const locked = page.getByRole('link', { name: /^Sekolah.*khusus Premium/ });
  check('tema Premium terkunci untuk tamu dan mengarah ke paket Premium', (await locked.getAttribute('href')) === '/app/subscription');
  check('halaman Pasangan Kilat muat di layar 390 px', (await overflow()) <= 0);
  await axe('Pasangan Kilat: pilih tema');
  await page.screenshot({ path: path.join(SHOTS, 'pasangan-tema.png'), fullPage: true });

  await page.getByRole('button', { name: /^Hewan\s*\d+ kata/ }).click();
  const board = page.getByRole('group', { name: 'Papan kartu' });
  const cards = board.getByRole('button');
  await cards.first().waitFor({ timeout: 10000 });
  const n = await cards.count();
  check('papan berisi 12 kartu tertutup', n === 12 && (await board.getByRole('button', { name: /tertutup$/ }).count()) === 12, `${n} kartu`);
  check('papan muat di layar 390 px', (await overflow()) <= 0);
  // Learn the board two cards at a time, then clear what is left.
  const keys = new Array(n);
  const matched = new Set();
  for (let i = 0; i + 1 < n; i += 2) {
    await cards.nth(i).click();
    keys[i] = await cards.nth(i).getAttribute('data-pair');
    if (i === 0) {
      check('kartu terbuka menyebut isinya untuk pembaca layar', /^Kartu 1: (kata|gambar) /.test(await cards.nth(0).locator('.sr-only').innerText()));
      check('waktu mulai berjalan setelah kartu pertama', await page.getByRole('timer').isVisible());
    }
    await cards.nth(i + 1).click();
    keys[i + 1] = await cards.nth(i + 1).getAttribute('data-pair');
    if (keys[i] === keys[i + 1]) matched.add(keys[i]);
    else {
      if (i === 0 || !fs.existsSync(path.join(SHOTS, 'pasangan-salah.png'))) {
        await page.screenshot({ path: path.join(SHOTS, 'pasangan-salah.png'), fullPage: true });
        await axe('Pasangan Kilat: dua kartu belum cocok');
      }
      await page.waitForTimeout(1100);
    }
  }
  check('semua kartu bisa dibaca setelah dibuka', keys.every(Boolean), keys.join(','));
  check('kartu yang belum cocok tertutup lagi', (await board.getByRole('button', { name: /tertutup$/ }).count()) === n - matched.size * 2);
  for (const k of new Set(keys)) {
    if (matched.has(k)) continue;
    const [a, b] = keys.flatMap((x, i) => (x === k ? [i] : []));
    await cards.nth(a).click();
    await cards.nth(b).click();
    matched.add(k);
    if (matched.size < n / 2) await page.waitForTimeout(150);
  }
  await page.getByRole('heading', { name: 'Semua pasangan ketemu!' }).waitFor({ timeout: 10000 });
  const stats = await page.locator('dl').innerText();
  check('hasil memuat skor, waktu, kombo, dan salah tebak', /Skor\s*\d+/.test(stats) && /Waktu\s*\d+:\d\d/.test(stats) && /Kombo terbaik\s*×\d/.test(stats) && /Salah tebak\s*\d+/.test(stats), stats.replace(/\s+/g, ' '));
  check('permainan pertama tercatat sebagai rekor baru', await page.getByText('Rekor baru!').isVisible());
  check('papan pertama hari ini memberi +5 XP', await page.getByText(/\+5 XP/).isVisible());
  check('hasil menampilkan enam kata dengan arti dan audio', (await page.getByRole('button', { name: /^Dengar "[a-z]+"$/ }).count()) === 6);
  await axe('Pasangan Kilat: hasil');
  await page.screenshot({ path: path.join(SHOTS, 'pasangan-hasil.png'), fullPage: true });

  await button('Main lagi').click();
  await board.getByRole('button').first().waitFor({ timeout: 10000 });
  check('"Main lagi" membuka papan baru yang tertutup semua', (await board.getByRole('button', { name: /tertutup$/ }).count()) === 12);
  await button('Ganti tema').click();
  check('rekor tersimpan di kartu tema', await page.getByText(/Rekor \d+/).first().waitFor({ timeout: 10000 }).then(() => true, () => false));

  // Dark mode board.
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(`${BASE}/app/pasangan`);
  await page.getByRole('button', { name: /^Warna\s*\d+ kata/ }).click({ timeout: 30000 });
  await cards.first().click();
  await cards.nth(1).click();
  await page.waitForTimeout(500);
  await axe('Pasangan Kilat: papan mode gelap');
  await page.screenshot({ path: path.join(SHOTS, 'pasangan-gelap.png'), fullPage: true });
  await page.emulateMedia({ colorScheme: 'light' });
} catch (e) {
  await fail('Pasangan Kilat', e);
}

check('tanpa error di konsol', issues.length === 0, issues.slice(0, 5).join(' | '));
await browser.close();
