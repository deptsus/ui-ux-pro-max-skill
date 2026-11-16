// Promo video, step 3: renders the UI animation (composer.html) frame by
// frame from the screenshots of capture.mjs and encodes it with ffmpeg.
//   node promo/render.mjs   → public/promo/lentera-promo.mp4 and lentera-promo-poster.jpg
// Captions describe only what the screenshots show; every screen is real.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from '../e2e/lib.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = process.env.PROMO_OUT ?? path.join(import.meta.dirname, 'out');
const FPS = Number(process.env.PROMO_FPS ?? 30);
const shots = JSON.parse(fs.readFileSync(path.join(OUT, 'shots.json'), 'utf8')).shots;
const byName = new Map(shots.map((s) => [s.name, s]));
const CROPS = path.join(OUT, 'crops');
fs.mkdirSync(CROPS, { recursive: true });

// Long pages are cut to what is scrolled through (very tall images are not drawn by Chromium).
function src(name, scroll = 0) {
  const s = byName.get(name);
  if (!s) throw new Error(`no screenshot "${name}"`);
  const file = path.join(OUT, 'shots', s.file);
  if (!s.full) return { file, s };
  const crop = path.join(CROPS, s.file);
  const h = Math.round((scroll + 844) * 2);
  execFileSync('python3', ['-c', `from PIL import Image; im = Image.open(${JSON.stringify(file)}); im.crop((0, 0, im.size[0], min(im.size[1], ${h}))).save(${JSON.stringify(crop)})`]);
  return { file: crop, s };
}
const NAV = path.join(OUT, 'shots', byName.get('dashboard').file);
/**
 * One screen: `dur` seconds; a tap ring lands on the next tapped element;
 * `scroll` = CSS px scrolled, or 'mark' for the spot capture.mjs marked on that page.
 */
function beat(name, dur, { scroll = 0, tap = true, overlays = true } = {}) {
  const shot = byName.get(name);
  let px = scroll === 'mark' ? shot?.mark ?? 0 : scroll;
  if (shot?.height) px = Math.min(px, Math.max(0, shot.height - 844));
  const { file, s } = src(name, px);
  return { src: `file://${file}`, dur, tap: tap && !s.full ? s.tap ?? null : null, scroll: px || 0, overlays, navSrc: overlays ? `file://${NAV}` : null };
}

const scenes = [
  { chip: 'Mulai gratis', title: 'Daftar gratis, langsung belajar', sub: 'Tanpa kartu kredit. Pengguna baru disambut tiga langkah: tes penempatan, pelajaran singkat, dan ulangan terjadwal.',
    beats: [beat('landing', 2.6, { tap: false }), beat('welcome', 3.0)] },
  { chip: 'Tes penempatan', title: 'Menemukan levelmu dulu', sub: 'Maksimal 20 soal dan berhenti begitu levelmu ketemu. Rina langsung mulai dari A2.',
    beats: [beat('placement-intro', 2.0), beat('placement-question', 2.2, { tap: false }), beat('placement-result', 2.8, { tap: false })] },
  { chip: 'Beranda', title: 'Selalu tahu langkah berikutnya', sub: 'Target harian dan rekomendasi pelajaran berikutnya, lengkap dengan alasannya.',
    beats: [beat('dashboard', 3.2)] },
  { chip: 'Pelajaran 8 langkah', title: 'Dijelaskan dalam bahasa Indonesia', sub: 'Pengantar dan tujuan, materi dengan tabel dan contoh, lalu contoh benar dan salah beserta alasannya.',
    beats: [beat('lesson-intro', 2.2), beat('lesson-teaching', 3.0), beat('lesson-examples', 3.0)] },
  { chip: 'Latihan', title: 'Umpan balik di setiap jawaban', sub: 'Benar? Langsung dikonfirmasi. Salah? Dijelaskan kenapa salah, jawaban yang benar, dan pola kesalahannya.',
    beats: [beat('q1-answered', 1.6), beat('q1-correct', 2.2), beat('q2-answered', 1.6), beat('q2-wrong', 3.6), beat('guided-done', 2.3, { tap: false })] },
  { chip: 'Jalur belajar', title: 'Dari A1 sampai C2', sub: '60 pelajaran dalam bab dan unit, dengan ujian unit dan ujian level di setiap jenjang, plus 18 pelajaran jalur khusus.',
    beats: [beat('path', 4.2, { scroll: 1500, tap: false })] },
  { chip: 'Cerita', title: 'Cerita bergambar dan bercabang', sub: 'Kamu memilih ucapan tokohnya. Setiap pilihan dijelaskan, dan pilihanmu menentukan akhir cerita.',
    beats: [beat('stories', 2.8, { scroll: 650, tap: false }), beat('story-scene', 2.4), beat('story-choice', 2.6), beat('story-feedback', 2.8, { tap: false }), beat('story-end', 2.6, { tap: false })] },
  { chip: 'Percakapan', title: 'Simulator percakapan', sub: 'Pilih responsmu: tata bahasanya benar atau tidak, seberapa wajar, plus ungkapan lain yang bisa dipakai.',
    beats: [beat('conversation', 2.6), beat('conversation-feedback', 3.0, { tap: false })] },
  { chip: 'Menyimak & pelafalan', title: 'Telinga dan lidah ikut berlatih', sub: 'Audio beraksen Amerika atau Inggris, transkrip, dikte, dan panduan posisi mulut untuk bunyi yang sulit.',
    beats: [beat('listening', 2.8, { tap: false }), beat('pronunciation', 2.6, { tap: false })] },
  { chip: 'Pekerjaan rumah', title: 'PR mingguan otomatis dan kalender', sub: 'PR disusun dari latihanmu sendiri, tenggatnya tampil di kalender, plus tugas menulis yang diperiksa per butir.',
    beats: [beat('homework', 3.6, { scroll: 650, tap: false }), beat('writing', 3.0, { scroll: 450, tap: false })] },
  { chip: 'Ujian & sertifikat', title: 'Ujian level yang sungguhan', sub: 'Empat bagian dinilai di server: tata bahasa, membaca, menyimak, menulis. Lulus? Dapat sertifikat dengan kode verifikasi.',
    beats: [beat('exam-intro', 3.0, { scroll: 380, tap: false }), beat('exam-passed', 2.6), beat('certificate', 3.4, { scroll: 520, tap: false, overlays: false })] },
  { chip: 'Premium Tahunan', title: 'Rencana belajar mingguan', sub: 'Jalurmu sampai C2 dibagi menjadi target tiap minggu, lalu disesuaikan setiap Senin.',
    beats: [beat('plan', 3.2, { tap: false })] },
  { chip: 'Profil', title: 'Pilih avatar karaktermu', sub: 'Delapan karakter Lentera. Avatarmu tampil di liga dan di daftar teman.',
    beats: [beat('profile-avatar', 2.8)] },
  { chip: 'Liga mingguan', title: 'Naik divisi setiap minggu', sub: 'Lima divisi, dari Lilin sampai Mercusuar. Satu grup berisi hingga 30 pelajar; yang teratas naik, yang terbawah turun.',
    beats: [beat('league', 3.8, { scroll: 'mark', tap: false })] },
  { chip: 'Teman & tantangan', title: 'Tantang temanmu adu XP', sub: 'Tambahkan teman dengan kode undangan, lalu adu XP selama 3 atau 7 hari. Hanya XP dari belajar yang dihitung.',
    beats: [beat('friends-challenge', 2.6), beat('friends-duel', 3.4, { scroll: 'mark', tap: false })] },
  { chip: 'Shadowing', title: 'Dengar, tirukan, bandingkan', sub: 'Rekam suaramu, lalu putar berdampingan dengan contohnya. Kamu sendiri yang menilai, dan rekaman tidak diunggah.',
    beats: [beat('shadowing-intro', 2.2), beat('shadowing-step', 2.2), beat('shadowing-compare', 3.6, { scroll: 'mark', tap: false }), beat('shadowing-done', 2.4, { tap: false })] },
  { chip: 'Pengingat harian', title: 'Diingatkan di jam pilihanmu', sub: 'Satu notifikasi sehari di HP, hanya bila kamu belum belajar hari itu, agar beruntunmu tidak putus.',
    beats: [beat('reminder', 3.4, { scroll: 'mark', tap: false })] },
  { chip: 'Nyaman dipakai', title: 'Mode gelap dan huruf besar', sub: 'Tampilan terang atau gelap, tiga ukuran huruf, dan getaran saat menjawab di HP Android.',
    beats: [beat('settings', 2.4), beat('dashboard-dark', 2.8, { tap: false })] },
  { chip: 'Jalur khusus', title: 'TOEFL, IELTS, kerja, dan anak', sub: 'Tiga jalur di samping jalur CEFR: persiapan ujian, bahasa Inggris untuk kerja, dan jalur anak. Pelajaran pertamanya gratis.',
    beats: [beat('tracks', 3.6, { scroll: 'mark', tap: false })] },
  { chip: 'Kelas', title: 'Bergabung ke kelas guru', sub: 'Siswa memasukkan kode dari guru, melihat tugas dan tenggatnya, dan Premium selama lisensi sekolah berlaku.',
    beats: [beat('class-join', 2.4), beat('class-tasks', 3.0, { tap: false })] },
  { chip: 'Ruang Guru', title: 'Progres setiap siswa', sub: 'Guru memberi pelajaran, PR, atau ujian unit dengan tenggat, lalu melihat XP, pelajaran, dan tugas tiap siswa.',
    beats: [beat('teacher-class', 3.6, { scroll: 'mark', tap: false })] },
  { chip: 'Pantau Anak', title: 'Orang tua ikut memantau', sub: 'Hari aktif, beruntun, pelajaran, PR, dan tugas guru, tanpa melihat jawaban latihan anak.',
    beats: [beat('parent', 3.4, { scroll: 'mark', tap: false })] },
  { chip: 'Materi gratis', title: 'Ringkasan pelajaran untuk semua', sub: 'Setiap pelajaran punya halaman publik dengan penjelasan berbahasa Indonesia, mudah ditemukan lewat Google.',
    beats: [beat('materi', 3.2, { scroll: 'mark', tap: false, overlays: false })] },
  { chip: 'Premium', title: 'Buka semua materi A1–C2', sub: 'Pilih paket, bayar dengan QRIS, dan Premium aktif setelah pembayaran dikonfirmasi.',
    beats: [beat('premium-plans', 3.0, { tap: false }), beat('premium-active', 3.0, { tap: false })] },
];

// The lantern mark, inlined into the composer.
const mark = fs.readFileSync(path.join(ROOT, 'public', 'icon.svg'), 'utf8').replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const font = path.join(ROOT, 'node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2');
const html = fs.readFileSync(path.join(import.meta.dirname, 'composer.html'), 'utf8').replaceAll('{MARK}', mark).replace("url('../node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2')", `url('file://${font}')`);
const built = path.join(OUT, 'composer.built.html');
fs.writeFileSync(built, html);

const FRAMES = path.join(OUT, 'frames');
fs.rmSync(FRAMES, { recursive: true, force: true });
fs.mkdirSync(FRAMES, { recursive: true });
// Chapters for the landing page (same timings as the video): src/components/promo-chapters.ts.
const INTRO = 3.2;
const OUTRO = 4.6;
{
  let t = INTRO;
  const chapters = scenes.map((s) => { const c = { t: Math.round(t * 10) / 10, chip: s.chip, title: s.title, sub: s.sub }; t += s.beats.reduce((n, b) => n + b.dur, 0); return c; });
  const duration = Math.round((t + OUTRO) * 10) / 10;
  fs.writeFileSync(path.join(ROOT, 'src', 'components', 'promo-chapters.ts'),
    `// Generated by promo/render.mjs: where each feature starts in the promo video.\n// Re-run \`node promo/render.mjs\` after changing the storyboard.\nexport const PROMO_DURATION = ${duration};\nexport const PROMO_CHAPTERS: { t: number; chip: string; title: string; sub: string }[] = ${JSON.stringify(chapters, null, 2)};\n`);
  if (process.env.PROMO_CHAPTERS_ONLY) { console.log(`bab ditulis (${chapters.length}), durasi ${duration} detik`); process.exit(0); }
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
await page.goto(`file://${built}`);
const total = await page.evaluate((d) => window.setup(d), { intro: INTRO, outro: OUTRO, scenes });
await page.evaluate(() => document.fonts.ready);
if (process.env.PROMO_PREVIEW) {
  // Quick look: a few moments only (seconds, comma-separated).
  for (const t of process.env.PROMO_PREVIEW.split(',').map(Number)) {
    await page.evaluate((x) => window.render(x), t);
    await page.screenshot({ path: path.join(OUT, `preview-${t}.jpg`), type: 'jpeg', quality: 90 });
  }
  console.log(`durasi ${total.toFixed(1)} detik; pratinjau di ${OUT}`);
  await browser.close();
  process.exit(0);
}
const frames = Math.ceil(total * FPS);
console.log(`durasi ${total.toFixed(1)} detik, ${frames} frame`);
for (let f = 0; f < frames; f++) {
  await page.evaluate((t) => window.render(t), f / FPS);
  await page.screenshot({ path: path.join(FRAMES, `${String(f).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 92 });
  if (f % 300 === 0) console.log(`frame ${f}/${frames}`);
}
// Poster: the dashboard scene, fully shown.
const dash = scenes.find((s) => s.chip === 'Beranda');
await page.evaluate((t) => window.render(t), 3.2 + scenes.slice(0, scenes.indexOf(dash)).reduce((n, s) => n + s.beats.reduce((m, b) => m + b.dur, 0), 0) + 1.2);
const PUB = path.join(ROOT, 'public', 'promo');
fs.mkdirSync(PUB, { recursive: true });
await page.screenshot({ path: path.join(PUB, 'lentera-promo-poster.jpg'), type: 'jpeg', quality: 84 });
await browser.close();

execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(FRAMES, '%05d.jpg'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(PUB, 'lentera-promo.mp4')], { stdio: 'inherit' });
const size = fs.statSync(path.join(PUB, 'lentera-promo.mp4')).size;
console.log(`selesai: public/promo/lentera-promo.mp4 (${(size / 1024 / 1024).toFixed(1)} MB), poster lentera-promo-poster.jpg`);
