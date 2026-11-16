// Play Store graphics: framed phone screenshots (1080×1920) with a headline,
// the feature graphic (1024×500) and the 512×512 icon. Screens come from the
// real app: run promo/capture.mjs with PROMO_W=360 PROMO_H=640 PROMO_DPR=3
// PROMO_OUT=<dir> first, then: node play-store/make-graphics.mjs <dir>
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const { chromium } = createRequire(path.join(import.meta.dirname, '..', 'e2e', 'lib.mjs'))('playwright');
const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = process.argv[2];
if (!SRC) throw new Error('usage: node play-store/make-graphics.mjs <capture dir>');
const OUT = path.join(import.meta.dirname, 'graphics');
fs.mkdirSync(OUT, { recursive: true });
const shots = new Map(JSON.parse(fs.readFileSync(path.join(SRC, 'shots.json'), 'utf8')).shots.map((s) => [s.name, s]));
const font = path.join(ROOT, 'node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2');
const mark = fs.readFileSync(path.join(ROOT, 'public', 'icon.svg'), 'utf8');

const SCREENS = [
  ['dashboard', 0, 'Selalu tahu langkah berikutnya', 'Target harian dan rekomendasi pelajaran, lengkap dengan alasannya.'],
  ['lesson-teaching', 0, 'Dijelaskan dalam bahasa Indonesia', 'Materi, tabel, dan contoh benar-salah di setiap pelajaran.'],
  ['q2-wrong', 0, 'Tahu kenapa jawabanmu salah', 'Setiap jawaban salah dijelaskan, bukan hanya ditandai.'],
  ['tracks', 0, 'TOEFL, IELTS, kerja, dan anak', 'Jalur khusus di samping kurikulum CEFR A1–C2.'],
  ['story-scene', 0, 'Cerita bergambar dan bercabang', 'Pilihanmu menentukan akhir ceritanya.'],
  ['league', 'mark', 'Naik divisi setiap minggu', 'Liga mingguan, teman, dan tantangan XP.'],
  ['class-tasks', 0, 'Kelas dari gurumu', 'Tugas dan tenggat dari guru, nilainya langsung terlihat.'],
  ['certificate', 0, 'Sertifikat yang bisa dicek', 'Ujian level dinilai server; sertifikat punya kode verifikasi.'],
];

const css = `@font-face { font-family: Jakarta; src: url('file://${font}'); font-weight: 200 800; }
* { margin: 0; box-sizing: border-box; } body { font-family: Jakarta, sans-serif; color: #1e1b3a; }
.bg { position: absolute; inset: 0; background: radial-gradient(circle at 15% 10%, #e0dcff 0, transparent 45%), radial-gradient(circle at 90% 85%, #fde7c4 0, transparent 40%), #f6f5fb; }`;

function crop(name, offset) {
  const s = shots.get(name);
  if (!s) throw new Error(`no capture "${name}"`);
  const file = path.join(SRC, 'shots', s.file);
  const top = Math.round((offset === 'mark' ? s.mark ?? 0 : offset) * 3);
  const out = path.join(SRC, `store-${name}.png`);
  execFileSync('python3', ['-c', `from PIL import Image; im = Image.open(${JSON.stringify(file)}); t = min(${top}, max(0, im.size[1] - 1920)); im.crop((0, t, 1080, t + 1920)).save(${JSON.stringify(out)})`]);
  return out;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
// Local images and the font only load from a file:// page, not from setContent.
const HTML = path.join(SRC, 'store-frame.html');
async function show(html) {
  fs.writeFileSync(HTML, html);
  await page.goto(`file://${HTML}`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
}
let i = 0;
for (const [name, offset, title, sub] of SCREENS) {
  const img = crop(name, offset);
  await show(`<html><head><style>${css}
    .logo { position: absolute; left: 72px; top: 64px; display: flex; align-items: center; gap: 16px; font-size: 34px; font-weight: 800; }
    .logo svg { width: 56px; height: 56px; } .logo span { color: #4b3fd6; font-weight: 600; }
    h1 { position: absolute; left: 72px; right: 72px; top: 160px; font-size: 70px; line-height: 1.08; font-weight: 800; letter-spacing: -0.02em; }
    p { position: absolute; left: 72px; right: 120px; top: 330px; font-size: 34px; line-height: 1.35; color: #5b5878; font-weight: 500; }
    .phone { position: absolute; left: 50%; top: 470px; width: 780px; height: 1387px; transform: translateX(-50%); border-radius: 64px; background: #1e1b3a; padding: 18px; box-shadow: 0 40px 80px rgba(30, 27, 58, 0.25); }
    .phone img { width: 100%; height: 100%; object-fit: cover; object-position: top; border-radius: 48px; display: block; }
  </style></head><body><div class="bg"></div>
    <div class="logo">${mark}Lentera&nbsp;<span>English</span></div>
    <h1>${title}</h1><p>${sub}</p>
    <div class="phone"><img src="file://${img}"></div></body></html>`);
  await page.screenshot({ path: path.join(OUT, `phone-${++i}.png`) });
}

// Feature graphic 1024×500.
await page.setViewportSize({ width: 1024, height: 500 });
const dash = crop('dashboard', 0);
await show(`<html><head><style>${css}
  .wrap { position: absolute; left: 64px; top: 0; bottom: 0; width: 560px; display: flex; flex-direction: column; justify-content: center; }
  .wrap svg { width: 88px; height: 88px; } h1 { margin-top: 18px; font-size: 64px; font-weight: 800; letter-spacing: -0.03em; } h1 span { color: #4b3fd6; font-weight: 600; }
  p { margin-top: 14px; font-size: 27px; line-height: 1.35; color: #5b5878; font-weight: 600; }
  .phone { position: absolute; right: 70px; top: 40px; width: 270px; height: 480px; border-radius: 34px; background: #1e1b3a; padding: 9px; box-shadow: 0 24px 50px rgba(30, 27, 58, 0.25); }
  .phone img { width: 100%; height: 100%; object-fit: cover; object-position: top; border-radius: 26px; display: block; }
</style></head><body><div class="bg"></div><div class="wrap">${mark}<h1>Lentera <span>English</span></h1><p>Belajar bahasa Inggris A1–C2, dijelaskan dalam bahasa Indonesia.</p></div><div class="phone"><img src="file://${dash}"></div></body></html>`);
await page.screenshot({ path: path.join(OUT, 'feature-1024x500.png') });
await browser.close();

// 512×512 icon, 32-bit PNG as Play asks (the maskable icon keeps its safe zone).
execFileSync('python3', ['-c', `from PIL import Image; Image.open(${JSON.stringify(path.join(ROOT, 'public', 'icon-maskable-512.png'))}).convert('RGBA').save(${JSON.stringify(path.join(OUT, 'icon-512.png'))})`]);
console.log(`grafik tersimpan di ${OUT}`);
