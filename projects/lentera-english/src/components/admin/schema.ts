// Describes every CMS table the admin can edit: its fields, how a row is
// labelled in lists, and what is validated before a row is sent to the server.
// The database re-validates everything (constraints + publish quality gate).

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Row = Record<string, any>;
export type Data = Record<string, Row[]>;

export type TableId =
  | 'cefr_levels' | 'chapters' | 'units' | 'lessons' | 'questions' | 'homework' | 'exams'
  | 'grammar_topics' | 'misconception_tags' | 'vocabulary' | 'conversation_scenarios'
  | 'listening_items' | 'pronunciation_guides' | 'audio_resources';

export type FieldKind =
  | 'text' | 'textarea' | 'number' | 'bool' | 'select' | 'ref' | 'lines' | 'json' | 'date'
  // Structured editors (see fields.tsx).
  | 'options' | 'pairs' | 'errors' | 'teaching' | 'demo' | 'writing';

export interface Field {
  key: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  hint?: string;
  min?: number;
  max?: number;
  rows?: number;
  /** Static choices for `select`. */
  choices?: readonly (readonly [string, string])[];
  /** Source table for `ref`; the value stored is that table's primary key. */
  ref?: TableId | 'courses';
  /** Nullable columns are sent as null when left empty. */
  nullable?: boolean;
  /** Shown as a filter above the list. */
  filter?: boolean;
  /** English learning content (rendered without Indonesian spellcheck). */
  en?: boolean;
  /** Field lives inside the `payload` jsonb column (questions only). */
  payload?: boolean;
  /** Only shown when this returns true for the row being edited. */
  when?: (row: Row) => boolean;
  /** Lines must be ids of this table (checked before saving). */
  linesRef?: TableId;
}

export interface TableDef {
  id: TableId;
  label: string;
  singular: string;
  group: 'Struktur kurikulum' | 'Latihan dan penilaian' | 'Pustaka';
  pk: 'id' | 'code' | 'key';
  /** Help text for the id of a new row. */
  idHint?: string;
  fixed?: boolean; // rows cannot be created or deleted
  title: (r: Row) => string;
  subtitle?: (r: Row, d: Data) => string;
  badges?: (r: Row) => [string, 'ok' | 'accent' | 'muted' | 'brand' | 'bad'][];
  fields: Field[];
  blank: () => Row;
  /** What a delete takes with it (ON DELETE CASCADE), for the confirmation. */
  cascade?: (r: Row, d: Data) => string[];
  /** Jump to related rows in another table. */
  related?: { table: TableId; filterKey: string; label: string }[];
  sort?: (a: Row, b: Row) => number;
}

const LEVELS = [['A1', 'A1'], ['A2', 'A2'], ['B1', 'B1'], ['B2', 'B2'], ['C1', 'C1'], ['C2', 'C2']] as const;
const STATUS = [['draft', 'Draf'], ['published', 'Terbit']] as const;
export const STAGES = [['guided', 'Latihan terbimbing'], ['independent', 'Latihan mandiri'], ['homework', 'PR'], ['mastery', 'Tes penguasaan'], ['drill', 'Bank latihan perbaikan'], ['exam', 'Ujian'], ['placement', 'Tes penempatan'], ['listening', 'Menyimak']] as const;
export const TYPES = [['mc', 'Pilihan ganda'], ['fill', 'Isian'], ['arrange', 'Susun kata'], ['construct', 'Susun kalimat dari kata kunci'], ['match', 'Mencocokkan'], ['translate', 'Terjemahan'], ['fix', 'Perbaiki kesalahan'], ['listen', 'Menyimak'], ['read', 'Membaca'], ['dialogue', 'Melengkapi dialog'], ['tf', 'Benar atau salah'], ['spot', 'Temukan kata yang salah'], ['vocab', 'Kosakata dalam konteks'], ['para', 'Susun paragraf']] as const;

export const OPTION_TYPES = ['mc', 'vocab', 'dialogue', 'read', 'listen', 'tf'];
export const TYPED_TYPES = ['fill', 'arrange', 'construct', 'translate', 'fix'];
const usesText = ['mc', 'vocab', 'tf', 'read', 'listen', 'fill', 'construct', 'translate', 'fix', 'arrange', 'spot'];
const TEXT_HINT: Record<string, string> = {
  fill: 'Kalimat dengan ___ sebagai bagian yang dikosongkan.',
  construct: 'Kata kunci dipisahkan dengan " / ", misalnya: she / not / be / tired.',
  translate: 'Kalimat sumber yang harus diterjemahkan.',
  fix: 'Kalimat yang mengandung kesalahan.',
  arrange: 'Arti atau instruksi yang ditampilkan di atas kepingan kata.',
  spot: 'Kalimat lengkap. Pelajar mengetuk kata yang salah.',
  read: 'Pertanyaan tentang bacaan.',
  listen: 'Pertanyaan tentang audio.',
};

const has = (r: Row, key: string) => {
  const v = r.payload?.[key];
  return Array.isArray(v) ? v.length > 0 : v && typeof v === 'object' ? Object.keys(v).length > 0 : v !== undefined && v !== null && v !== '';
};
/** A payload field shows for its exercise types, and also whenever it already holds data (nothing is hidden or dropped silently). */
const forTypes = (types: string[], key: string) => (r: Row) => types.includes(r.type) || has(r, key);

const count = (rows: Row[] | undefined, pred: (r: Row) => boolean) => (rows ?? []).filter(pred).length;
const plural = (n: number, word: string) => (n > 0 ? [`${n} ${word}`] : []);
const byPosition = (parent: string) => (a: Row, b: Row) => String(a[parent]).localeCompare(String(b[parent])) || (a.position ?? 0) - (b.position ?? 0);
const lookup = (d: Data, table: string, id: unknown, pk = 'id') => (d[table] ?? []).find((r) => r[pk] === id);

export const TABLES: TableDef[] = [
  {
    id: 'cefr_levels', label: 'Level CEFR', singular: 'level', group: 'Struktur kurikulum', pk: 'code', fixed: true,
    title: (r) => `${r.code} · ${r.title}`,
    subtitle: (r) => `Lulus ujian level: ${r.exam_pass_score}%`,
    sort: (a, b) => a.position - b.position,
    fields: [
      { key: 'title', label: 'Nama level', kind: 'text', required: true },
      { key: 'description', label: 'Deskripsi', kind: 'textarea' },
      { key: 'exam_pass_score', label: 'Skor lulus ujian level (%)', kind: 'number', min: 50, max: 100, required: true },
    ],
    blank: () => ({}),
  },
  {
    id: 'chapters', label: 'Bab', singular: 'bab', group: 'Struktur kurikulum', pk: 'id', idHint: 'Contoh: a1-c4 (level, lalu nomor bab).',
    title: (r) => r.title,
    subtitle: (r, d) => `${lookup(d, 'courses', r.course_id)?.level_code ?? r.course_id} · bab ke-${r.position}`,
    badges: (r) => [[r.is_premium ? 'Premium' : 'Gratis', r.is_premium ? 'accent' : 'ok'], ...(r.is_planned ? [['Sedang disusun', 'muted'] as [string, 'muted']] : [])],
    sort: byPosition('course_id'),
    fields: [
      { key: 'course_id', label: 'Level', kind: 'ref', ref: 'courses', required: true, filter: true },
      { key: 'position', label: 'Urutan dalam level', kind: 'number', min: 1, required: true },
      { key: 'title', label: 'Judul bab', kind: 'text', required: true },
      { key: 'description', label: 'Deskripsi', kind: 'textarea' },
      { key: 'is_premium', label: 'Hanya untuk Premium', kind: 'bool' },
      { key: 'is_planned', label: 'Tandai "Sedang disusun" (belum ada pelajaran)', kind: 'bool' },
    ],
    blank: () => ({ position: 1, description: '', is_premium: true, is_planned: false }),
    cascade: (r, d) => {
      const units = new Set((d.units ?? []).filter((u) => u.chapter_id === r.id).map((u) => u.id));
      const lessons = new Set((d.lessons ?? []).filter((l) => units.has(l.unit_id)).map((l) => l.id));
      return [...plural(units.size, 'unit'), ...plural(lessons.size, 'pelajaran'), ...plural(count(d.questions, (q) => lessons.has(q.lesson_id)), 'soal'), ...plural(count(d.homework, (h) => h.chapter_id === r.id), 'PR')];
    },
    related: [{ table: 'units', filterKey: 'chapter_id', label: 'Unit di bab ini' }, { table: 'homework', filterKey: 'chapter_id', label: 'PR di bab ini' }],
  },
  {
    id: 'units', label: 'Unit', singular: 'unit', group: 'Struktur kurikulum', pk: 'id', idHint: 'Contoh: a1-c4-u1 (id bab, lalu nomor unit).',
    title: (r) => r.title,
    subtitle: (r, d) => `${lookup(d, 'chapters', r.chapter_id)?.title ?? r.chapter_id} · unit ke-${r.position}`,
    sort: byPosition('chapter_id'),
    fields: [
      { key: 'chapter_id', label: 'Bab', kind: 'ref', ref: 'chapters', required: true, filter: true },
      { key: 'position', label: 'Urutan dalam bab', kind: 'number', min: 1, required: true },
      { key: 'title', label: 'Judul unit', kind: 'text', required: true },
      { key: 'description', label: 'Deskripsi', kind: 'textarea', nullable: true },
      { key: 'exam_pass_score', label: 'Skor lulus ujian unit (%)', kind: 'number', min: 50, max: 100, required: true },
      { key: 'planned_lessons', label: 'Pelajaran yang masih disusun', kind: 'lines', hint: 'Satu judul per baris. Tampil sebagai "Sedang disusun" di jalur belajar.' },
    ],
    blank: () => ({ position: 1, exam_pass_score: 80, planned_lessons: [] }),
    cascade: (r, d) => {
      const lessons = new Set((d.lessons ?? []).filter((l) => l.unit_id === r.id).map((l) => l.id));
      return [...plural(lessons.size, 'pelajaran'), ...plural(count(d.questions, (q) => lessons.has(q.lesson_id)), 'soal')];
    },
    related: [{ table: 'lessons', filterKey: 'unit_id', label: 'Pelajaran di unit ini' }],
  },
  {
    id: 'lessons', label: 'Pelajaran', singular: 'pelajaran', group: 'Struktur kurikulum', pk: 'id', idHint: 'Contoh: a2-future-will. ID menjadi awalan ID soal dan tidak bisa diubah.',
    title: (r) => r.title,
    subtitle: (r, d) => `${lookup(d, 'units', r.unit_id)?.title ?? r.unit_id} · pelajaran ke-${r.position} · lulus ${r.passing_score}%`,
    badges: (r) => [[r.status === 'published' ? 'Terbit' : 'Draf', r.status === 'published' ? 'ok' : 'muted'], [r.is_premium ? 'Premium' : 'Gratis', r.is_premium ? 'accent' : 'brand']],
    sort: byPosition('unit_id'),
    fields: [
      { key: 'unit_id', label: 'Unit', kind: 'ref', ref: 'units', required: true, filter: true },
      { key: 'position', label: 'Urutan dalam unit', kind: 'number', min: 1, required: true },
      { key: 'title', label: 'Judul pelajaran', kind: 'text', required: true },
      { key: 'summary', label: 'Ringkasan', kind: 'textarea', rows: 2 },
      { key: 'topic_id', label: 'Topik yang dilatih', kind: 'ref', ref: 'grammar_topics', required: true },
      { key: 'status', label: 'Status', kind: 'select', choices: STATUS, required: true, filter: true, hint: 'Draf tidak ikut diterbitkan. Pelajaran terbit wajib punya pengantar, materi, dan soal tes penguasaan.' },
      { key: 'passing_score', label: 'Skor lulus tes penguasaan (%)', kind: 'number', min: 50, max: 100, required: true },
      { key: 'is_premium', label: 'Hanya untuk Premium', kind: 'bool' },
      { key: 'objectives', label: 'Tujuan belajar', kind: 'lines', hint: 'Satu tujuan per baris.' },
      { key: 'intro', label: 'Pengantar (langkah 1)', kind: 'textarea', rows: 4 },
      { key: 'teaching', label: 'Materi (langkah 2)', kind: 'teaching' },
      { key: 'demo', label: 'Contoh benar dan salah (langkah 3)', kind: 'demo' },
      { key: 'vocab', label: 'Kosakata yang diperkenalkan', kind: 'lines', linesRef: 'vocabulary', hint: 'Satu ID kosakata per baris. Kata ini masuk ke jadwal ulangan pelajar.' },
    ],
    blank: () => ({ position: 1, summary: '', is_premium: true, passing_score: 85, status: 'draft', intro: '', teaching: [], demo: [], vocab: [], objectives: [] }),
    cascade: (r, d) => [...plural(count(d.questions, (q) => q.lesson_id === r.id), 'soal'), ...plural(count(d.homework, (h) => h.lesson_id === r.id), 'PR')],
    related: [{ table: 'questions', filterKey: 'lesson_id', label: 'Soal pelajaran ini' }, { table: 'homework', filterKey: 'lesson_id', label: 'PR pelajaran ini' }],
  },
  {
    id: 'questions', label: 'Soal', singular: 'soal', group: 'Latihan dan penilaian', pk: 'id', idHint: 'Pola: <id pelajaran>.<huruf tahap><nomor>, misalnya a2-past-be.g1. Jangan ganti ID soal yang sudah terbit.',
    title: (r) => r.prompt,
    subtitle: (r) => `${r.id} · ${TYPES.find(([t]) => t === r.type)?.[1] ?? r.type} · ${STAGES.find(([s]) => s === r.stage)?.[1] ?? r.stage} · kesulitan ${r.difficulty}`,
    badges: (r) => (r.status === 'draft' ? [['Draf', 'muted']] : []),
    sort: (a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }),
    fields: [
      { key: 'lesson_id', label: 'Pelajaran', kind: 'ref', ref: 'lessons', nullable: true, filter: true, hint: 'Kosongkan untuk bank latihan, tes penempatan, atau soal menyimak.' },
      { key: 'stage', label: 'Tahap', kind: 'select', choices: STAGES, required: true, filter: true },
      { key: 'type', label: 'Jenis soal', kind: 'select', choices: TYPES, required: true, filter: true },
      { key: 'position', label: 'Urutan', kind: 'number', min: 0, required: true },
      { key: 'topic_id', label: 'Topik', kind: 'ref', ref: 'grammar_topics', required: true },
      { key: 'focus_tag', label: 'Pola kesalahan yang diuji', kind: 'ref', ref: 'misconception_tags', nullable: true, hint: 'Dipakai untuk menyusun latihan perbaikan.' },
      { key: 'difficulty', label: 'Tingkat kesulitan', kind: 'select', choices: [['1', '1 · sangat mudah'], ['2', '2 · mudah'], ['3', '3 · sedang'], ['4', '4 · sulit'], ['5', '5 · sangat sulit']], required: true },
      { key: 'status', label: 'Status', kind: 'select', choices: STATUS, required: true, filter: true },
      { key: 'prompt', label: 'Instruksi soal', kind: 'textarea', rows: 2, required: true },
      { key: 'context', label: 'Bacaan atau dialog', kind: 'textarea', rows: 5, payload: true, en: true, when: forTypes(['read', 'dialogue'], 'context'), hint: 'Untuk dialog, tulis satu giliran per baris (Nama: kalimat). Pakai ___ untuk bagian yang dilengkapi.' },
      { key: 'audioText', label: 'Teks yang dibacakan', kind: 'textarea', rows: 3, payload: true, en: true, when: forTypes(['listen'], 'audioText'), hint: 'Dibacakan oleh rekaman (bila ada) atau suara perangkat.' },
      { key: 'text', label: 'Teks soal', kind: 'textarea', rows: 2, payload: true, when: forTypes(usesText, 'text'), hint: 'Teks utama soal. Arti tepatnya bergantung pada jenis soal.' },
      { key: 'options', label: 'Pilihan jawaban', kind: 'options', when: (r) => OPTION_TYPES.includes(r.type) || (r.options?.length ?? 0) > 0 },
      { key: 'answers', label: 'Kunci jawaban', kind: 'lines', payload: true, en: true, when: forTypes(TYPED_TYPES, 'answers'), hint: 'Satu jawaban yang diterima per baris. Baris pertama menjadi jawaban model.' },
      { key: 'errors', label: 'Jawaban salah yang sudah dikenali', kind: 'errors', payload: true, when: forTypes(['fill', 'construct', 'translate', 'fix'], 'errors') },
      { key: 'tiles', label: 'Kepingan pengecoh', kind: 'lines', payload: true, en: true, when: forTypes(['arrange'], 'tiles'), hint: 'Kata tambahan yang tidak dipakai di jawaban, satu per baris.' },
      { key: 'pairs', label: 'Pasangan', kind: 'pairs', payload: true, when: forTypes(['match'], 'pairs') },
      { key: 'wrongWord', label: 'Kata yang salah', kind: 'text', payload: true, en: true, when: forTypes(['spot'], 'wrongWord'), hint: 'Harus persis sama dengan satu kata di teks soal.' },
      { key: 'correction', label: 'Perbaikannya', kind: 'text', payload: true, en: true, when: forTypes(['spot'], 'correction') },
      { key: 'sentences', label: 'Kalimat dalam urutan yang benar', kind: 'lines', payload: true, en: true, when: forTypes(['para'], 'sentences'), hint: 'Satu kalimat per baris.' },
      { key: 'explanation', label: 'Pembahasan', kind: 'textarea', rows: 3, required: true, hint: 'Selalu ditampilkan setelah menjawab, benar atau salah.' },
      { key: 'hint', label: 'Petunjuk (opsional)', kind: 'textarea', rows: 2, nullable: true },
      { key: 'time_limit_sec', label: 'Batas waktu (detik, opsional)', kind: 'number', min: 3, max: 600, nullable: true },
      { key: 'audio_key', label: 'Rekaman audio', kind: 'ref', ref: 'audio_resources', nullable: true, hint: 'Tanpa rekaman, audio dibacakan oleh suara bawaan perangkat.' },
      { key: 'listening_item_id', label: 'Materi menyimak', kind: 'ref', ref: 'listening_items', nullable: true, when: (r) => r.stage === 'listening' || !!r.listening_item_id },
      { key: 'cefr_level', label: 'Level CEFR', kind: 'select', choices: LEVELS, nullable: true, when: (r) => r.stage === 'placement' || !!r.cefr_level, hint: 'Wajib untuk soal tes penempatan.' },
    ],
    blank: () => ({ stage: 'guided', type: 'mc', position: 1, difficulty: 2, status: 'draft', prompt: '', explanation: '', payload: {}, options: [{ text: '', correct: true }, { text: '', why: '' }] }),
    cascade: (r, d) => [...plural(count(d.homework, (h) => (h.question_ids ?? []).includes(r.id)), 'PR yang memuat soal ini'), ...plural(count(d.exams, (x) => (x.question_ids ?? []).includes(r.id)), 'ujian yang memuat soal ini')],
  },
  {
    id: 'homework', label: 'PR', singular: 'PR', group: 'Latihan dan penilaian', pk: 'id', idHint: 'Contoh: hw.a1-c1.write',
    title: (r) => r.title,
    subtitle: (r, d) => `${lookup(d, 'chapters', r.chapter_id)?.title ?? r.chapter_id} · tenggat ${r.due_days} hari · ${(r.question_ids ?? []).length} soal${r.writing ? ' · tugas menulis' : ''}`,
    fields: [
      { key: 'chapter_id', label: 'Bab', kind: 'ref', ref: 'chapters', required: true, filter: true },
      { key: 'lesson_id', label: 'Pelajaran', kind: 'ref', ref: 'lessons', nullable: true, filter: true, hint: 'Kosongkan untuk PR tingkat bab.' },
      { key: 'title', label: 'Judul', kind: 'text', required: true },
      { key: 'kind', label: 'Jenis', kind: 'select', choices: [['vocabulary', 'Kosakata'], ['grammar', 'Tata bahasa'], ['translation', 'Terjemahan'], ['reading', 'Membaca'], ['listening', 'Menyimak'], ['construction', 'Menyusun kalimat'], ['writing', 'Menulis']], required: true },
      { key: 'due_days', label: 'Tenggat (hari sejak PR terbuka)', kind: 'number', min: 1, max: 60, required: true },
      { key: 'available_from', label: 'Tersedia mulai (opsional)', kind: 'date', nullable: true },
      { key: 'question_ids', label: 'Soal', kind: 'lines', linesRef: 'questions', hint: 'Satu ID soal per baris, sesuai urutan tampil.' },
      { key: 'writing', label: 'Tugas menulis', kind: 'writing', nullable: true, when: (r) => r.kind === 'writing' || !!r.writing },
    ],
    blank: () => ({ kind: 'grammar', due_days: 3, question_ids: [] }),
  },
  {
    id: 'exams', label: 'Ujian', singular: 'ujian', group: 'Latihan dan penilaian', pk: 'id', idHint: 'Contoh: exam.a1-c1-u1 atau exam.level.B1',
    title: (r) => r.title,
    subtitle: (r) => `${r.scope === 'unit' ? 'Ujian unit' : r.scope === 'level' ? 'Ujian level' : 'Tes penempatan'} ${r.ref} · lulus ${r.passing_score}% · ${Math.round(r.time_limit_sec / 60)} menit`,
    badges: (r) => [[r.is_premium ? 'Premium' : 'Gratis', r.is_premium ? 'accent' : 'ok']],
    fields: [
      { key: 'scope', label: 'Cakupan', kind: 'select', choices: [['unit', 'Ujian unit'], ['level', 'Ujian level CEFR'], ['placement', 'Tes penempatan']], required: true, filter: true },
      { key: 'ref', label: 'Unit atau level yang diuji', kind: 'text', required: true, hint: 'ID unit (mis. a1-c1-u1) untuk ujian unit, atau kode level (mis. B1) untuk ujian level.' },
      { key: 'title', label: 'Judul', kind: 'text', required: true },
      { key: 'passing_score', label: 'Skor lulus (%)', kind: 'number', min: 50, max: 100, required: true },
      { key: 'time_limit_sec', label: 'Batas waktu (detik)', kind: 'number', min: 60, max: 7200, required: true },
      { key: 'sample_size', label: 'Jumlah soal yang diambil otomatis', kind: 'number', min: 0, max: 60, required: true, hint: 'Diambil dari soal pelajaran dalam cakupan ujian, di luar soal tetap di bawah.' },
      { key: 'is_premium', label: 'Hanya untuk Premium', kind: 'bool' },
      { key: 'question_ids', label: 'Soal tetap', kind: 'lines', linesRef: 'questions', hint: 'Satu ID soal per baris. Boleh kosong.' },
    ],
    blank: () => ({ scope: 'unit', passing_score: 80, time_limit_sec: 900, sample_size: 10, is_premium: false, question_ids: [] }),
  },
  {
    id: 'grammar_topics', label: 'Topik', singular: 'topik', group: 'Pustaka', pk: 'id', idHint: 'Contoh: grammar.future-will',
    title: (r) => r.title,
    subtitle: (r) => `${r.id} · ${r.level_code}`,
    fields: [
      { key: 'kind', label: 'Jenis', kind: 'select', choices: [['grammar', 'Tata bahasa'], ['vocabulary', 'Kosakata'], ['skill', 'Keterampilan']], required: true, filter: true },
      { key: 'level_code', label: 'Level', kind: 'select', choices: LEVELS, required: true, filter: true },
      { key: 'title', label: 'Judul', kind: 'text', required: true },
      { key: 'summary', label: 'Ringkasan', kind: 'textarea' },
      { key: 'lesson_id', label: 'Pelajaran yang mengajarkannya', kind: 'ref', ref: 'lessons', nullable: true },
    ],
    blank: () => ({ kind: 'grammar', level_code: 'A1', summary: '' }),
    cascade: (r, d) => plural(count(d.misconception_tags, (t) => t.topic_id === r.id), 'pola kesalahan'),
    related: [{ table: 'misconception_tags', filterKey: 'topic_id', label: 'Pola kesalahan topik ini' }],
  },
  {
    id: 'misconception_tags', label: 'Pola kesalahan', singular: 'pola kesalahan', group: 'Pustaka', pk: 'id', idHint: 'Contoh: was-were',
    title: (r) => r.title,
    subtitle: (r, d) => `${r.id} · ${lookup(d, 'grammar_topics', r.topic_id)?.title ?? r.topic_id}`,
    fields: [
      { key: 'topic_id', label: 'Topik', kind: 'ref', ref: 'grammar_topics', required: true, filter: true },
      { key: 'title', label: 'Nama pola', kind: 'text', required: true },
      { key: 'tip', label: 'Catatan perbaikan', kind: 'textarea', required: true, hint: 'Ditampilkan bersama rekomendasi dan latihan perbaikan.' },
    ],
    blank: () => ({}),
  },
  {
    id: 'vocabulary', label: 'Kosakata', singular: 'kosakata', group: 'Pustaka', pk: 'id', idHint: 'Contoh: v.breakfast',
    title: (r) => `${r.word} · ${r.meaning}`,
    subtitle: (r) => `${r.level_code} · ${r.set_name} · ${r.ipa}`,
    badges: (r) => [[r.is_premium ? 'Premium' : 'Gratis', r.is_premium ? 'accent' : 'ok']],
    fields: [
      { key: 'word', label: 'Kata', kind: 'text', required: true, en: true },
      { key: 'ipa', label: 'IPA', kind: 'text', required: true, en: true },
      { key: 'part_of_speech', label: 'Kelas kata', kind: 'text', required: true },
      { key: 'meaning', label: 'Arti', kind: 'text', required: true },
      { key: 'example', label: 'Contoh kalimat', kind: 'textarea', rows: 2, required: true, en: true },
      { key: 'example_translation', label: 'Terjemahan contoh', kind: 'textarea', rows: 2, required: true },
      { key: 'level_code', label: 'Level', kind: 'select', choices: LEVELS, required: true, filter: true },
      { key: 'set_name', label: 'Kelompok', kind: 'text', required: true },
      { key: 'is_premium', label: 'Hanya untuk Premium', kind: 'bool' },
      { key: 'audio_key', label: 'Rekaman audio', kind: 'ref', ref: 'audio_resources', nullable: true },
    ],
    blank: () => ({ level_code: 'A1', is_premium: true }),
  },
  {
    id: 'conversation_scenarios', label: 'Percakapan', singular: 'skenario percakapan', group: 'Pustaka', pk: 'id', idHint: 'Contoh: hotel-checkin',
    title: (r) => r.title,
    subtitle: (r) => `${r.level_code} · ${(r.nodes ?? []).length} giliran`,
    badges: (r) => [[r.is_premium ? 'Premium' : 'Gratis', r.is_premium ? 'accent' : 'ok']],
    fields: [
      { key: 'title', label: 'Judul', kind: 'text', required: true },
      { key: 'level_code', label: 'Level', kind: 'select', choices: LEVELS, required: true, filter: true },
      { key: 'setting', label: 'Latar', kind: 'textarea', rows: 2, required: true },
      { key: 'goal', label: 'Tujuan pelajar', kind: 'textarea', rows: 2, required: true },
      { key: 'closing', label: 'Penutup', kind: 'textarea', rows: 2, required: true },
      { key: 'is_premium', label: 'Hanya untuk Premium', kind: 'bool' },
      { key: 'start_node', label: 'ID giliran pertama', kind: 'text', required: true },
      { key: 'nodes', label: 'Giliran dialog (JSON)', kind: 'json', rows: 18, required: true, hint: 'Daftar giliran: { id, speaker, line, lineId, options: [{ text, correct, natural (1-3), grammar, alternatives, next }] }. "next" berisi ID giliran berikutnya atau "end".' },
    ],
    blank: () => ({ level_code: 'A1', is_premium: true, start_node: 'n1', nodes: [] }),
  },
  {
    id: 'listening_items', label: 'Menyimak', singular: 'materi menyimak', group: 'Pustaka', pk: 'id', idHint: 'Contoh: listen.a2.weekend',
    title: (r) => r.title,
    subtitle: (r, d) => `${r.level_code} · ${r.kind === 'word' ? 'kata' : r.kind === 'sentence' ? 'kalimat' : 'bacaan'} · ${count(d.questions, (q) => q.listening_item_id === r.id)} soal`,
    badges: (r) => [[r.is_premium ? 'Premium' : 'Gratis', r.is_premium ? 'accent' : 'ok']],
    fields: [
      { key: 'title', label: 'Judul', kind: 'text', required: true },
      { key: 'level_code', label: 'Level', kind: 'select', choices: LEVELS, required: true, filter: true },
      { key: 'kind', label: 'Bentuk', kind: 'select', choices: [['word', 'Kata'], ['sentence', 'Kalimat'], ['passage', 'Bacaan']], required: true },
      { key: 'transcript', label: 'Transkrip', kind: 'textarea', rows: 4, required: true, en: true },
      { key: 'translation', label: 'Terjemahan', kind: 'textarea', rows: 4 },
      { key: 'is_premium', label: 'Hanya untuk Premium', kind: 'bool' },
      { key: 'audio_key', label: 'Rekaman audio', kind: 'ref', ref: 'audio_resources', nullable: true },
    ],
    blank: () => ({ level_code: 'A1', kind: 'sentence', translation: '', is_premium: true }),
    cascade: (r, d) => plural(count(d.questions, (q) => q.listening_item_id === r.id), 'soal'),
    related: [{ table: 'questions', filterKey: 'listening_item_id', label: 'Soal materi ini' }],
  },
  {
    id: 'pronunciation_guides', label: 'Pelafalan', singular: 'panduan pelafalan', group: 'Pustaka', pk: 'id', idHint: 'Contoh: th-voiced',
    title: (r) => `${r.ipa} · ${r.label}`,
    subtitle: (r) => (r.examples ?? []).map((e: Row) => e.word).join(', '),
    fields: [
      { key: 'ipa', label: 'Simbol IPA', kind: 'text', required: true, en: true },
      { key: 'label', label: 'Nama bunyi', kind: 'text', required: true },
      { key: 'how_to', label: 'Cara mengucapkan', kind: 'textarea', required: true },
      { key: 'common_error', label: 'Kesalahan umum', kind: 'textarea', required: true },
      { key: 'examples', label: 'Contoh kata (JSON)', kind: 'json', rows: 5, hint: 'Daftar { "word": "think", "ipa": "/θɪŋk/" }.' },
      { key: 'mouth', label: 'Posisi mulut (JSON)', kind: 'json', rows: 4, hint: 'Contoh: { "lips": "neutral", "tongue": "dental", "voiced": false }. Menentukan ilustrasi mulut.' },
    ],
    blank: () => ({ examples: [], mouth: {} }),
  },
  {
    id: 'audio_resources', label: 'Audio', singular: 'rekaman audio', group: 'Pustaka', pk: 'key', idHint: 'Kunci unik, misalnya vocab.breakfast.us',
    title: (r) => r.key,
    subtitle: (r) => `${r.accent === 'uk' ? 'Aksen Inggris' : 'Aksen Amerika'}${r.speaker ? ` · ${r.speaker}` : ''} · ${r.url}`,
    fields: [
      { key: 'accent', label: 'Aksen', kind: 'select', choices: [['us', 'Amerika (US)'], ['uk', 'Inggris (UK)']], required: true, filter: true },
      { key: 'url', label: 'URL berkas audio', kind: 'text', required: true, hint: 'Harus diawali https:// atau / (berkas di folder public). Unggah berkasnya dulu ke penyimpanan; dashboard ini belum bisa mengunggah.' },
      { key: 'speaker', label: 'Penutur', kind: 'text', nullable: true },
      { key: 'transcript', label: 'Transkrip', kind: 'textarea', rows: 2, nullable: true, en: true },
    ],
    blank: () => ({ accent: 'us' }),
  },
];

export const TABLE = Object.fromEntries(TABLES.map((t) => [t.id, t])) as Record<TableId, TableDef>;

/** Label for a row of any table, used in pickers and messages. */
export function refLabel(table: string, r: Row): string {
  if (table === 'courses') return `${r.level_code} · ${r.title}`;
  const def = TABLE[table as TableId];
  if (!def) return String(r.id ?? r.key ?? r.code);
  return table === 'questions' ? `${r.id} · ${r.prompt}` : `${def.title(r)} (${r[def.pk]})`;
}
export const pkOf = (table: string) => (table === 'courses' ? 'id' : TABLE[table as TableId].pk);

const blank = (v: unknown) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0);
export const readField = (row: Row, f: Field) => (f.payload ? row.payload?.[f.key] : row[f.key]);

/** Problems that would make the server reject the row, or the quality gate block publishing. */
export function validateRow(def: TableDef, row: Row, data: Data, isNew: boolean): string[] {
  const out: string[] = [];
  const id = row[def.pk];
  if (isNew) {
    if (blank(id)) out.push('ID wajib diisi.');
    else if (!/^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(String(id))) out.push('ID hanya boleh berisi huruf, angka, titik, tanda hubung, garis bawah, dan titik dua, tanpa spasi.');
    else if ((data[def.id] ?? []).some((r) => r[def.pk] === id)) out.push(`ID "${id}" sudah dipakai.`);
  }
  for (const f of def.fields) {
    if (f.when && !f.when(row)) continue;
    const v = readField(row, f);
    if (f.required && blank(v) && typeof v !== 'number' && typeof v !== 'boolean') out.push(`${f.label} wajib diisi.`);
    if (f.kind === 'number' && !blank(v)) {
      if (!Number.isInteger(v)) out.push(`${f.label} harus berupa bilangan bulat.`);
      else if (f.min !== undefined && v < f.min) out.push(`${f.label} minimal ${f.min}.`);
      else if (f.max !== undefined && v > f.max) out.push(`${f.label} maksimal ${f.max}.`);
    }
    if (f.linesRef && Array.isArray(v)) {
      const pk = TABLE[f.linesRef].pk;
      const known = new Set((data[f.linesRef] ?? []).map((r) => r[pk]));
      const missing = v.filter((x) => !known.has(x));
      if (missing.length) out.push(`${f.label}: ID tidak ditemukan: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? ', ...' : ''}.`);
      if (new Set(v).size !== v.length) out.push(`${f.label}: ada ID yang ditulis dua kali.`);
    }
  }
  if (def.id === 'questions') {
    const options: Row[] = row.options ?? [];
    if (OPTION_TYPES.includes(row.type)) {
      if (options.length < 2) out.push('Soal pilihan butuh minimal dua pilihan jawaban.');
      if (options.some((o) => blank(o.text))) out.push('Ada pilihan jawaban yang teksnya kosong.');
      if (options.filter((o) => o.correct).length !== 1) out.push('Tandai tepat satu pilihan sebagai jawaban benar.');
      if (options.some((o) => !o.correct && blank(o.why))) out.push('Setiap pilihan yang salah wajib punya alasan kenapa salah.');
    }
    if (!OPTION_TYPES.includes(row.type) && options.length > 0) out.push('Jenis soal ini tidak memakai pilihan jawaban. Hapus pilihannya atau ganti jenis soal.');
    if (TYPED_TYPES.includes(row.type) && blank(row.payload?.answers)) out.push('Kunci jawaban wajib diisi (minimal satu jawaban).');
    if (row.type === 'match' && (row.payload?.pairs ?? []).filter((p: string[]) => p[0]?.trim() && p[1]?.trim()).length < 2) out.push('Soal mencocokkan butuh minimal dua pasangan lengkap.');
    if (row.type === 'para' && (row.payload?.sentences ?? []).length < 2) out.push('Soal susun paragraf butuh minimal dua kalimat.');
    if (row.type === 'spot') {
      const words = String(row.payload?.text ?? '').split(' ').map((w) => w.replace(/[.,!?;:"]/g, ''));
      if (blank(row.payload?.wrongWord) || blank(row.payload?.correction)) out.push('Isi kata yang salah dan perbaikannya.');
      else if (!words.includes(row.payload.wrongWord)) out.push('Kata yang salah harus persis sama dengan satu kata di teks soal.');
    }
    if (Object.values(row.payload?.errors ?? {}).some((e) => blank((e as Row).why))) out.push('Setiap jawaban salah yang dikenali wajib punya penjelasan.');
    if (row.stage === 'placement' && blank(row.cefr_level)) out.push('Soal tes penempatan wajib punya level CEFR.');
  }
  if (def.id === 'lessons' && row.status === 'published') {
    if (blank(row.intro)) out.push('Pelajaran terbit wajib punya pengantar.');
    if (blank(row.teaching)) out.push('Pelajaran terbit wajib punya minimal satu bagian materi.');
  }
  if (def.id === 'lessons') {
    if ((row.teaching ?? []).some((t: Row) => blank(t.heading) || blank(t.body))) out.push('Setiap bagian materi wajib punya judul dan penjelasan.');
    if ((row.demo ?? []).some((x: Row) => blank(x.good) || blank(x.bad) || blank(x.why))) out.push('Setiap contoh wajib punya kalimat benar, kalimat salah, dan alasannya.');
  }
  if (def.id === 'homework' && row.writing) {
    const w = row.writing;
    if (blank(w.prompt) || blank(w.model)) out.push('Tugas menulis wajib punya instruksi dan contoh jawaban.');
    if (!Number.isInteger(w.minWords) || w.minWords < 1) out.push('Jumlah kata minimal tugas menulis harus bilangan bulat positif.');
  }
  if (def.id === 'audio_resources' && !blank(row.url) && !/^(https:\/\/|\/)/.test(row.url)) out.push('URL audio harus diawali https:// atau /.');
  return out;
}

/** Builds exactly what the server stores: schema fields only, empty optionals as null. */
export function toPayload(def: TableDef, row: Row): Row {
  const out: Row = { [def.pk]: row[def.pk] };
  const payload: Row = { ...(row.payload ?? {}) };
  for (const f of def.fields) {
    let v = readField(row, f);
    if (typeof v === 'string' && f.kind !== 'textarea' && f.kind !== 'json') v = v.trim();
    if (f.kind === 'pairs') v = (v ?? []).filter((p: string[]) => p[0]?.trim() || p[1]?.trim());
    if (f.payload) {
      if (blank(v) || (f.kind === 'errors' && Object.keys(v ?? {}).length === 0)) delete payload[f.key];
      else payload[f.key] = v;
      continue;
    }
    if (f.kind === 'options') {
      out.options = (v ?? []).map((o: Row) => ({ text: String(o.text ?? '').trim(), ...(o.correct ? { correct: true } : { why: String(o.why ?? '').trim() }), ...(o.tag ? { tag: o.tag } : {}) }));
      continue;
    }
    if (f.kind === 'select' && f.key === 'difficulty') v = Number(v);
    if (blank(v) && typeof v !== 'number' && typeof v !== 'boolean') {
      if (f.nullable) out[f.key] = null;
      else if (f.kind === 'lines' || f.kind === 'teaching' || f.kind === 'demo') out[f.key] = [];
      else if (f.kind === 'text' || f.kind === 'textarea') out[f.key] = '';
      else if (v !== undefined) out[f.key] = v;
      continue;
    }
    out[f.key] = v;
  }
  if (def.id === 'questions') out.payload = payload;
  return out;
}
