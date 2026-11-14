// Assembles the authored curriculum into the flat ContentPack used by the
// app, the offline cache and the database import.
import type { Cefr, Chapter, ContentPack, Exercise, ExamDef, HomeworkDef, Lesson, Level, ListeningItem, MisconceptionTag, Topic, Unit } from '@/lib/content/types';
import { stamp, type Built, type Draft } from './dsl';
import { greetings, toBe, toBeNegQ } from './a1-1';
import { articles, chapter1Homework, demonstratives, unit2Extras } from './a1-2';
import { doDoes, simplePresent, thirdPersonDrills } from './a1-3';
import { canLesson, possessivesLesson, prepTimeLesson, thereIsLesson, timeLesson } from './a1-4';
import { pastBe, pastIrregular, pastRegular, wasWereDrills } from './a2';
import { comparativesLesson, futureLesson, presentContinuous } from './a2-2';
import { inversion, passive, presentPerfect, subjunctive } from './upper';
import { vocabulary } from './vocabulary';
import { scenarios } from './conversations';
import { listening, phonemes, placement } from './listening';

export const CONTENT_VERSION = '2026.11.2';

const levels: Level[] = [
  { code: 'A1', title: 'Pemula', description: 'Memahami dan memakai ungkapan sehari-hari yang sangat dasar.', position: 1, examPassScore: 80 },
  { code: 'A2', title: 'Dasar', description: 'Berkomunikasi dalam tugas sederhana dan rutin, termasuk bercerita tentang masa lalu.', position: 2, examPassScore: 80 },
  { code: 'B1', title: 'Menengah', description: 'Menangani sebagian besar situasi saat bepergian, belajar, dan bekerja.', position: 3, examPassScore: 80 },
  { code: 'B2', title: 'Menengah Atas', description: 'Berinteraksi lancar dan spontan, serta menulis teks yang jelas dan rinci.', position: 4, examPassScore: 80 },
  { code: 'C1', title: 'Mahir', description: 'Memakai bahasa secara luwes untuk tujuan sosial, akademik, dan profesional.', position: 5, examPassScore: 80 },
  { code: 'C2', title: 'Sangat Mahir', description: 'Memahami hampir semua yang didengar dan dibaca, dengan kepekaan register penuh.', position: 6, examPassScore: 80 },
];

interface UnitSpec { id: string; title: string; description?: string; lessons: Built[]; planned?: string[]; examExtras?: Draft[] }
interface ChapterSpec { id: string; level: Cefr; title: string; description: string; premium: boolean; units: UnitSpec[] }

const syllabus: ChapterSpec[] = [
  { id: 'a1-c1', level: 'A1', title: 'Kenalan Pertama', description: 'Menyapa, memperkenalkan diri, dan menyebut benda di sekitar.', premium: false, units: [
    { id: 'a1-c1-u1', title: 'Sapaan dan To Be', description: 'Sapaan, kata ganti, dan am/is/are.', lessons: [greetings, toBe, toBeNegQ] },
    { id: 'a1-c1-u2', title: 'Benda di Sekitar Kita', description: 'A/an, this/that, dan kata benda jamak.', lessons: [articles, demonstratives], examExtras: unit2Extras },
  ] },
  { id: 'a1-c2', level: 'A1', title: 'Kegiatan Sehari-hari', description: 'Menceritakan rutinitas dengan simple present.', premium: false, units: [
    { id: 'a1-c2-u1', title: 'Simple Present', description: 'Kebiasaan, akhiran -s, dan do/does.', lessons: [simplePresent, doDoes] },
    { id: 'a1-c2-u2', title: 'Waktu dan Jadwal', description: 'Angka, jam, hari, dan at/on/in.', lessons: [timeLesson, prepTimeLesson] },
  ] },
  { id: 'a1-c3', level: 'A1', title: 'Rumah dan Keluarga', description: 'Menjelaskan rumah, keluarga, dan kemampuan.', premium: true, units: [
    { id: 'a1-c3-u1', title: 'Rumah dan Kepemilikan', description: 'There is/are, kata kepemilikan, dan can.', lessons: [thereIsLesson, possessivesLesson, canLesson] },
  ] },
  { id: 'a2-c1', level: 'A2', title: 'Bercerita tentang Masa Lalu', description: 'Simple past: was/were, kata kerja beraturan dan tak beraturan.', premium: true, units: [
    { id: 'a2-c1-u1', title: 'Simple Past', description: 'Keadaan dan kegiatan di masa lalu.', lessons: [pastBe, pastRegular, pastIrregular] },
  ] },
  { id: 'a2-c2', level: 'A2', title: 'Rencana dan Perbandingan', description: 'Membicarakan rencana dan membandingkan.', premium: true, units: [
    { id: 'a2-c2-u1', title: 'Sekarang, Rencana, dan Perbandingan', description: 'Present continuous, going to/will, dan perbandingan.', lessons: [presentContinuous, futureLesson, comparativesLesson] },
  ] },
  { id: 'b1-c1', level: 'B1', title: 'Pengalaman dan Hasil', description: 'Menghubungkan masa lalu dengan masa kini.', premium: true, units: [
    { id: 'b1-c1-u1', title: 'Present Perfect', lessons: [presentPerfect], planned: ['Present Perfect Continuous'] },
  ] },
  { id: 'b1-c2', level: 'B1', title: 'Pengandaian dan Kemungkinan', description: 'Conditional, modal, dan klausa relatif.', premium: true, units: [
    { id: 'b1-c2-u1', title: 'Conditionals dan Modals', lessons: [], planned: ['First dan Second Conditional', 'Modals of Deduction', 'Relative Clauses'] },
  ] },
  { id: 'b2-c1', level: 'B2', title: 'Fokus dan Sudut Pandang', description: 'Mengatur fokus kalimat dengan struktur pasif.', premium: true, units: [
    { id: 'b2-c1-u1', title: 'Passive Voice', lessons: [passive], planned: ['Causative: have/get something done'] },
  ] },
  { id: 'b2-c2', level: 'B2', title: 'Melaporkan dan Berandai', description: 'Kalimat tidak langsung dan pengandaian lampau.', premium: true, units: [
    { id: 'b2-c2-u1', title: 'Reported Speech dan Conditionals', lessons: [], planned: ['Reported Speech', 'Third Conditional', 'Mixed Conditionals'] },
  ] },
  { id: 'c1-c1', level: 'C1', title: 'Penekanan dan Gaya', description: 'Struktur penekanan dalam bahasa formal.', premium: true, units: [
    { id: 'c1-c1-u1', title: 'Inversi dan Cleft', lessons: [inversion], planned: ['Cleft Sentences: It is ... that / What ... is'] },
  ] },
  { id: 'c1-c2', level: 'C1', title: 'Wacana Akademik', description: 'Menulis dan berbicara secara akademik.', premium: true, units: [
    { id: 'c1-c2-u1', title: 'Gaya Akademik', lessons: [], planned: ['Hedging', 'Nominalisation', 'Discourse Markers'] },
  ] },
  { id: 'c2-c1', level: 'C2', title: 'Presisi dan Register', description: 'Struktur langka yang menandai kemahiran penuh.', premium: true, units: [
    { id: 'c2-c1-u1', title: 'Subjunctive', lessons: [subjunctive], planned: ['Ellipsis dan Substitution'] },
  ] },
  { id: 'c2-c2', level: 'C2', title: 'Nuansa dan Idiom', description: 'Kolokasi idiomatis, ironi, dan modalitas lanjut.', premium: true, units: [
    { id: 'c2-c2-u1', title: 'Nuansa Makna', lessons: [], planned: ['Kolokasi Idiomatis', 'Ironi dan Understatement', 'Modalitas Lanjut'] },
  ] },
];

const topics: Topic[] = [
  { id: 'a1.greetings', kind: 'skill', level: 'A1', title: 'Sapaan dan perkenalan', summary: 'Good morning, My name is ..., Nice to meet you.', lessonId: 'a1-greetings' },
  { id: 'a1.to-be', kind: 'grammar', level: 'A1', title: 'To be: am, is, are', summary: 'I am, he/she/it is, you/we/they are.', lessonId: 'a1-to-be' },
  { id: 'a1.to-be-neg-q', kind: 'grammar', level: 'A1', title: 'To be: negatif dan pertanyaan', summary: 'She is not ... / Is she ...?', lessonId: 'a1-to-be-neg-q' },
  { id: 'a1.articles', kind: 'grammar', level: 'A1', title: 'Artikel a / an', summary: 'a + bunyi konsonan, an + bunyi vokal.', lessonId: 'a1-articles' },
  { id: 'a1.demonstratives', kind: 'grammar', level: 'A1', title: 'This, that, these, those', summary: 'Dekat/jauh dan tunggal/jamak.', lessonId: 'a1-demonstratives' },
  { id: 'a1.simple-present', kind: 'grammar', level: 'A1', title: 'Simple present', summary: 'Kebiasaan dan fakta; -s untuk he/she/it.', lessonId: 'a1-simple-present' },
  { id: 'a1.do-does', kind: 'grammar', level: 'A1', title: 'Do dan does', summary: "Negatif dan pertanyaan: don't/doesn't + bentuk dasar.", lessonId: 'a1-do-does' },
  { id: 'a1.time', kind: 'grammar', level: 'A1', title: 'Angka, jam, dan hari', summary: 'thirteen/thirty, half past seven, What time is it?', lessonId: 'a1-time' },
  { id: 'a1.prep-time', kind: 'grammar', level: 'A1', title: 'Preposisi waktu: at, on, in', summary: 'at 7, on Monday, in May; tanpa preposisi sebelum next/last/every.', lessonId: 'a1-prep-time' },
  { id: 'a1.there-is', kind: 'grammar', level: 'A1', title: 'There is / there are', summary: 'There is + tunggal, there are + jamak; bukan "have".', lessonId: 'a1-there-is' },
  { id: 'a1.possessives', kind: 'grammar', level: 'A1', title: 'Kata kepemilikan', summary: "my, your, his, her; Rina's bag.", lessonId: 'a1-possessives' },
  { id: 'a1.can', kind: 'grammar', level: 'A1', title: "Can dan can't", summary: 'can + bentuk dasar; Can you ...?', lessonId: 'a1-can' },
  { id: 'a2.past-be', kind: 'grammar', level: 'A2', title: 'Was dan were', summary: 'I/he/she/it was; you/we/they were.', lessonId: 'a2-past-be' },
  { id: 'a2.past-regular', kind: 'grammar', level: 'A2', title: 'Simple past beraturan (-ed)', summary: 'worked, lived, studied, stopped.', lessonId: 'a2-past-regular' },
  { id: 'a2.past-irregular', kind: 'grammar', level: 'A2', title: 'Simple past tak beraturan dan did', summary: "went, ate, bought; didn't + bentuk dasar.", lessonId: 'a2-past-irregular' },
  { id: 'a2.present-continuous', kind: 'grammar', level: 'A2', title: 'Present continuous', summary: 'am/is/are + -ing untuk yang sedang terjadi.', lessonId: 'a2-present-continuous' },
  { id: 'a2.future', kind: 'grammar', level: 'A2', title: 'Going to dan will', summary: 'Rencana: be going to. Keputusan spontan dan janji: will.', lessonId: 'a2-future' },
  { id: 'a2.comparatives', kind: 'grammar', level: 'A2', title: 'Comparative dan superlative', summary: 'cheaper than, more expensive than, the best.', lessonId: 'a2-comparatives' },
  { id: 'b1.present-perfect', kind: 'grammar', level: 'B1', title: 'Present perfect vs simple past', summary: 'have/has + bentuk ketiga; for dan since.', lessonId: 'b1-present-perfect' },
  { id: 'b2.passive', kind: 'grammar', level: 'B2', title: 'Passive voice', summary: 'be + past participle di berbagai tense.', lessonId: 'b2-passive' },
  { id: 'c1.inversion', kind: 'grammar', level: 'C1', title: 'Inversi untuk penekanan', summary: 'Never have I ..., Not only does she ...', lessonId: 'c1-inversion' },
  { id: 'c2.subjunctive', kind: 'grammar', level: 'C2', title: 'Subjunctive formal', summary: 'insist that he resign; Were I ..., Had she ...', lessonId: 'c2-subjunctive' },
  { id: 'skill.listening', kind: 'skill', level: 'A1', title: 'Menyimak', summary: 'Menangkap kata, angka, dan informasi dari audio.' },
];

const tags: MisconceptionTag[] = [
  { id: 'greeting-time', topic: 'a1.greetings', title: 'Sapaan menurut waktu', tip: 'Good morning (pagi), good afternoon (12–18), good evening (malam saat bertemu). "Good night" hanya untuk berpisah.' },
  { id: 'am-is-are', topic: 'a1.to-be', title: 'Tertukar am / is / are', tip: 'I–am; he/she/it–is; you/we/they–are. Ganti subjek dengan kata ganti dulu.' },
  { id: 'be-missing', topic: 'a1.to-be', title: 'Lupa to be', tip: 'Kalimat bahasa Inggris wajib punya kata kerja: "She is a teacher", bukan "She a teacher".' },
  { id: 'be-order', topic: 'a1.to-be-neg-q', title: 'Urutan to be dalam negatif dan pertanyaan', tip: '"not" setelah to be; untuk bertanya, to be pindah ke depan. Tidak perlu "do".' },
  { id: 'a-an', topic: 'a1.articles', title: 'Tertukar a / an', tip: 'Dengarkan BUNYI awal kata: an apple, an hour; a book, a university.' },
  { id: 'this-these', topic: 'a1.demonstratives', title: 'Tertukar this / that / these / those', tip: 'Dekat: this (1), these (banyak). Jauh: that (1), those (banyak).' },
  { id: 'plural', topic: 'a1.demonstratives', title: 'Bentuk jamak', tip: '+s; +es setelah s, x, ch, sh; hafalkan men, women, children.' },
  { id: 'third-person-s', topic: 'a1.simple-present', title: 'Akhiran -s untuk he / she / it', tip: 'He/she/it + kata kerja ber-s. I/you/we/they + bentuk dasar.' },
  { id: 'do-does', topic: 'a1.do-does', title: 'Tertukar do / does', tip: "I/you/we/they: do, don't. He/she/it: does, doesn't." },
  { id: 'does-base', topic: 'a1.do-does', title: 'Kata kerja setelah does', tip: 'Setelah does/doesn\'t, kata kerja kembali ke bentuk dasar: "doesn\'t like", bukan "doesn\'t likes".' },
  { id: 'teen-ty', topic: 'a1.time', title: 'Belasan dan puluhan', tip: 'Belasan -teen, tekanan di belakang (thirTEEN). Puluhan -ty, tekanan di depan (THIRty). forty ditulis tanpa u.' },
  { id: 'half-past', topic: 'a1.time', title: 'Menyebut setengah jam', tip: '"Setengah delapan" (07.30) = half past SEVEN. Bahasa Inggris menghitung dari jam sebelumnya.' },
  { id: 'clock-past-to', topic: 'a1.time', title: 'Past dan to pada jam', tip: "past = lewat (09.15 = a quarter past nine); to = kurang (08.45 = a quarter to nine). o'clock hanya untuk jam tepat." },
  { id: 'in-on-at', topic: 'a1.prep-time', title: 'Tertukar at / on / in', tip: 'at + jam (at 7, at night); on + hari/tanggal (on Monday, on 17 August); in + bulan/tahun/bagian hari (in May, in 2025, in the morning).' },
  { id: 'no-prep-time', topic: 'a1.prep-time', title: 'Preposisi yang tidak perlu', tip: 'Tanpa at/on/in sebelum next, last, this, every, tomorrow, dan yesterday.' },
  { id: 'there-is-are', topic: 'a1.there-is', title: 'Tertukar there is / there are', tip: 'Lihat benda sesudahnya: satu atau tak terhitung → there is; lebih dari satu → there are.' },
  { id: 'there-have', topic: 'a1.there-is', title: '"Ada" diterjemahkan dengan have', tip: '"Ada" untuk keberadaan = there is/are, bukan have/has: There is a market in my village.' },
  { id: 'his-her', topic: 'a1.possessives', title: 'Tertukar his / her', tip: 'Lihat pemiliknya: laki-laki → his, perempuan → her. Bukan menurut bendanya.' },
  { id: 'subject-possessive', topic: 'a1.possessives', title: 'Subjek dipakai sebagai kepemilikan', tip: 'Subjek (I, he, they) untuk pelaku; kepemilikan (my, his, their) sebelum benda. its tanpa tanda petik.' },
  { id: 'possessive-s', topic: 'a1.possessives', title: "Urutan dan tanda 's", tip: "Pemilik + 's di depan benda: Rina's bag (bukan bag Rina), my parents' house." },
  { id: 'can-base', topic: 'a1.can', title: 'Kata kerja setelah can', tip: 'can + bentuk dasar untuk semua subjek: she can swim (tanpa -s, tanpa to, tanpa -ing).' },
  { id: 'can-do', topic: 'a1.can', title: 'Memakai do bersama can', tip: "Can tidak butuh do: Can you ...? / I can't ..., bukan Do you can ...?" },
  { id: 'was-were', topic: 'a2.past-be', title: 'Tertukar was / were', tip: 'I/he/she/it: was. You/we/they: were. Ingat: "I was", bukan "I were".' },
  { id: 'past-marker', topic: 'a2.past-regular', title: 'Melewatkan penanda waktu lampau', tip: 'yesterday, last ..., ... ago, in 2020 menuntut bentuk lampau.' },
  { id: 'ed-spelling', topic: 'a2.past-regular', title: 'Ejaan akhiran -ed', tip: 'live→lived, study→studied, stop→stopped, play→played.' },
  { id: 'irregular-form', topic: 'a2.past-irregular', title: 'Bentuk lampau tak beraturan', tip: 'go→went, eat→ate, buy→bought, see→saw. Harus dihafal.' },
  { id: 'did-base', topic: 'a2.past-irregular', title: 'Kata kerja setelah did', tip: 'Setelah did/didn\'t pakai bentuk dasar: "didn\'t go", bukan "didn\'t went".' },
  { id: 'be-ing-missing', topic: 'a2.present-continuous', title: 'Lupa to be dalam kalimat "sedang"', tip: '"Sedang" = am/is/are + -ing. Dua-duanya wajib: She is cooking.' },
  { id: 'ing-spelling', topic: 'a2.present-continuous', title: 'Ejaan -ing', tip: 'make → making, swim → swimming, lie → lying, play → playing.' },
  { id: 'continuous-vs-simple', topic: 'a2.present-continuous', title: 'Sedang atau kebiasaan?', tip: 'Kebiasaan (every day, usually) → simple present. Sekarang (now, Look!) → present continuous. like/know/want tanpa -ing.' },
  { id: 'going-to-be', topic: 'a2.future', title: 'Bentuk be going to', tip: 'am/is/are + going to + bentuk dasar. Jangan lupa to be: I am going to ...' },
  { id: 'will-base', topic: 'a2.future', title: 'Kata kerja setelah will', tip: 'will + bentuk dasar, tanpa to dan tanpa -s: She will call. Pertanyaan: Will you ...?' },
  { id: 'will-vs-going-to', topic: 'a2.future', title: 'Will atau going to?', tip: 'Sudah direncanakan atau ada bukti → going to. Diputuskan saat bicara, janji, tawaran → will.' },
  { id: 'more-er', topic: 'a2.comparatives', title: 'Bentuk comparative', tip: 'Pendek: -er (cheaper). Panjang: more (more expensive). Jangan keduanya (more cheaper). good → better, bad → worse.' },
  { id: 'than-from', topic: 'a2.comparatives', title: '"Daripada" = than', tip: '"Lebih ... dari/daripada" = ... than, bukan from atau then.' },
  { id: 'superlative-the', topic: 'a2.comparatives', title: 'The pada superlative', tip: 'Paling: the + -est / the most. Comparative (lebih) tidak memakai the.' },
  { id: 'perfect-vs-past', topic: 'b1.present-perfect', title: 'Present perfect vs simple past', tip: 'Ada waktu selesai (yesterday, in 2015, ago)? Simple past. Tidak ada atau masih berlanjut? Present perfect.' },
  { id: 'since-for', topic: 'b1.present-perfect', title: 'Tertukar for / since', tip: 'for + lamanya (for two years); since + titik awal (since 2020).' },
  { id: 'participle', topic: 'b1.present-perfect', title: 'Bentuk ketiga (past participle)', tip: 'Setelah have/has pakai bentuk ketiga: seen, eaten, gone, written.' },
  { id: 'passive-be', topic: 'b2.passive', title: 'To be dalam kalimat pasif', tip: 'Pasif = be + bentuk ketiga. Tanpa be, kalimat menjadi aktif.' },
  { id: 'passive-participle', topic: 'b2.passive', title: 'Bentuk ketiga dalam kalimat pasif', tip: 'Setelah be pakai bentuk ketiga: is made, was built, must be signed.' },
  { id: 'inversion-order', topic: 'c1.inversion', title: 'Urutan kata dalam inversi', tip: 'Keterangan negatif + kata bantu + subjek + kata kerja: "Never have I seen".' },
  { id: 'inversion-pair', topic: 'c1.inversion', title: 'Pasangan no sooner / hardly', tip: 'No sooner ... than. Hardly/Scarcely ... when.' },
  { id: 'subjunctive-base', topic: 'c2.subjunctive', title: 'Bentuk dasar dalam subjunctive', tip: 'Setelah insist/suggest/essential that: bentuk dasar untuk semua subjek, tanpa -s.' },
  { id: 'subjunctive-were', topic: 'c2.subjunctive', title: 'Were dan inversi pengandaian', tip: 'If I were ...; Were I ...; Had she ...; Should you ...' },
  { id: 'short-long-i', topic: 'skill.listening', title: 'Vokal /ɪ/ pendek dan /iː/ panjang', tip: 'ship /ɪ/ pendek dan kendur; sheep /iː/ panjang dengan bibir tersenyum.' },
];

const HOMEWORK_KIND: Record<string, HomeworkDef['kind']> = {
  'a1-greetings': 'construction', 'a1-to-be-neg-q': 'translation', 'a1-simple-present': 'construction', 'a1-do-does': 'translation',
  'a2-past-irregular': 'reading', 'b2-passive': 'translation',
  'a1-time': 'reading', 'a1-there-is': 'reading', 'a1-possessives': 'reading', 'a1-can': 'construction',
  'a2-present-continuous': 'reading', 'a2-future': 'reading', 'a2-comparatives': 'reading',
};

export function buildPack(): ContentPack {
  const chapters: Chapter[] = [];
  const units: Unit[] = [];
  const lessons: Lesson[] = [];
  const exercises: Exercise[] = [];
  const homework: HomeworkDef[] = [];
  const exams: ExamDef[] = [];
  const perLevel = new Map<Cefr, number>();

  for (const c of syllabus) {
    const pos = (perLevel.get(c.level) ?? 0) + 1;
    perLevel.set(c.level, pos);
    const authored = c.units.some((u) => u.lessons.length > 0);
    chapters.push({ id: c.id, level: c.level, position: pos, title: c.title, description: c.description, premium: c.premium, ...(authored ? {} : { planned: true }) });
    c.units.forEach((u, ui) => {
      units.push({ id: u.id, chapterId: c.id, position: ui + 1, title: u.title, description: u.description, examPassScore: 80, ...(u.planned ? { plannedLessons: u.planned } : {}) });
      u.lessons.forEach((b, li) => {
        lessons.push({ ...b.lesson, unitId: u.id, position: li + 1, premium: c.premium });
        exercises.push(...b.exercises);
        const hw = b.exercises.filter((e) => e.stage === 'homework').map((e) => e.id);
        homework.push({ id: `hw.${b.lesson.id}`, chapterId: c.id, lessonId: b.lesson.id, title: b.lesson.title, kind: HOMEWORK_KIND[b.lesson.id] ?? 'grammar', dueDays: 3, exerciseIds: hw });
      });
      if (u.lessons.length) {
        const extras = stamp(u.examExtras ?? [], `exam.${u.id}`, 'exam', u.lessons[0].lesson.topic, null);
        exercises.push(...extras);
        exams.push({ id: `exam.${u.id}`, scope: 'unit', ref: u.id, title: `Ujian Unit: ${u.title}`, passScore: 80, timeLimitSec: 15 * 60, premium: c.premium, exerciseIds: extras.map((e) => e.id), sampleSize: Math.min(12, u.lessons.length * 4) });
      }
    });
  }

  // Remediation drill banks.
  exercises.push(...stamp(wasWereDrills, 'drill.was-were', 'drill', 'a2.past-be', null));
  exercises.push(...stamp(thirdPersonDrills, 'drill.third-person-s', 'drill', 'a1.simple-present', null));

  // Chapter-level homework: vocabulary, reading, listening, writing.
  const hwVocab = stamp(chapter1Homework.vocabulary, 'hw.a1-c1.vocab', 'homework', 'a1.greetings', null);
  const hwRead = stamp(chapter1Homework.reading, 'hw.a1-c1.read', 'homework', 'a1.to-be', null);
  exercises.push(...hwVocab, ...hwRead);
  homework.push(
    { id: 'hw.a1-c1.vocab', chapterId: 'a1-c1', title: 'Kosakata Bab 1', kind: 'vocabulary', dueDays: 5, exerciseIds: hwVocab.map((e) => e.id) },
    { id: 'hw.a1-c1.read', chapterId: 'a1-c1', title: 'Membaca: Sari dan Tom', kind: 'reading', dueDays: 5, exerciseIds: hwRead.map((e) => e.id) },
    { id: 'hw.a1-c1.write', chapterId: 'a1-c1', title: 'Menulis: Perkenalkan Dirimu', kind: 'writing', dueDays: 7, exerciseIds: [], writing: {
      prompt: 'Tulis 3–5 kalimat bahasa Inggris untuk memperkenalkan dirimu: nama, asal, dan pekerjaan atau statusmu.',
      minWords: 15,
      mustInclude: ["Menyebut nama (My name is ... / I'm ...)::my name is|i am|i'm", 'Menyebut asal (from ...)::from', 'Memakai artikel a/an untuk pekerjaan atau status:: a | an '],
      model: "Hello! My name is Dewi. I'm from Semarang. I am a student at a university in Yogyakarta. Nice to meet you!",
    } },
  );

  // Listening.
  const listeningItems: ListeningItem[] = listening.map((l) => {
    const qs = stamp(l.questions, l.id, 'listening', 'skill.listening', null);
    exercises.push(...qs);
    return { id: l.id, level: l.level, title: l.title, kind: l.kind, transcript: l.transcript, translation: l.translation, premium: l.premium, questionIds: qs.map((q) => q.id) };
  });
  const hwListen = listeningItems.find((l) => l.id === 'listen-anna')!;
  homework.push({ id: 'hw.a1-c1.listen', chapterId: 'a1-c1', title: 'Menyimak: Perkenalan Anna', kind: 'listening', dueDays: 5, exerciseIds: hwListen.questionIds });

  // Placement test and level exams.
  exercises.push(...stamp(placement, 'placement', 'placement', 'a1.to-be', null));
  exams.push(
    { id: 'exam.level.A1', scope: 'level', ref: 'A1', title: 'Ujian Level A1', passScore: 80, timeLimitSec: 25 * 60, premium: true, exerciseIds: [], sampleSize: 16 },
    { id: 'exam.level.A2', scope: 'level', ref: 'A2', title: 'Ujian Level A2', passScore: 80, timeLimitSec: 25 * 60, premium: true, exerciseIds: [], sampleSize: 12 },
  );

  return { version: CONTENT_VERSION, levels, chapters, units, lessons, exercises, topics, tags, vocabulary, scenarios, listening: listeningItems, phonemes, homework, exams, audio: [] };
}
