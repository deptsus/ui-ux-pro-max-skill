import { buildPack } from '../content/index';
import { validatePack } from '../src/lib/content/validate';

const pack = buildPack();
const errs = validatePack(pack);
const byType: Record<string, number> = {};
for (const e of pack.exercises) byType[e.type] = (byType[e.type] ?? 0) + 1;
console.log(`Konten v${pack.version}: ${pack.lessons.length} pelajaran, ${pack.exercises.length} soal, ${pack.vocabulary.length} kosakata, ${pack.scenarios.length} skenario, ${pack.listening.length} audio`);
console.log('Jenis soal:', byType);
if (errs.length) {
  console.error(`\n${errs.length} masalah:\n` + errs.join('\n'));
  process.exit(1);
}
console.log('Semua soal punya kunci, penjelasan, dan alasan untuk tiap jawaban salah.');
