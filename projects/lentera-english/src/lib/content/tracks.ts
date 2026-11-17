// Jalur Khusus (Rilis 11) and Jalur Sekolah (Rilis 16): tracks next to the
// main CEFR path. The lessons live in the curriculum (chapters with `track`);
// this is how the app and the public pages present them. No 'use client':
// server pages use it too.
import type { Cefr, TrackId } from './types';

export interface TrackInfo {
  id: TrackId;
  title: string;
  /** Short name for chips and buttons ("SD", "Kerja"). */
  short: string;
  /** For whom, in one line. */
  audience: string;
  /** Recommended starting level, shown as advice (tracks are not locked by level). */
  level: string;
  pitch: string;
  /** Shown wherever the track is presented. */
  note?: string;
  /** School tracks (Rilis 16): grades and Kurikulum Merdeka phases; the first unit is free. */
  school?: { grades: string; fase: string; cefr: Cefr };
}

export type SchoolLevel = 'sd' | 'smp' | 'sma';
export const SCHOOL_LEVELS: SchoolLevel[] = ['sd', 'smp', 'sma'];

export const TRACKS: TrackInfo[] = [
  {
    id: 'sd',
    title: 'Jalur SD',
    short: 'SD',
    audience: 'Siswa SD kelas 1–6, didampingi orang tua',
    level: 'Untuk pemula (A1)',
    pitch: 'Salam, warna dan hewan, tubuh, keluarga, rumah, makanan, sekolah, angka, jam, kegiatan sehari-hari, cuaca, hobi, dan cita-cita. Kalimat pendek, banyak gambar, dan penjelasan yang bisa dibacakan.',
    school: { grades: 'Kelas 1–6', fase: 'Fase A–C', cefr: 'A1' },
  },
  {
    id: 'smp',
    title: 'Jalur SMP',
    short: 'SMP',
    audience: 'Siswa SMP kelas 7–9',
    level: 'Mulai A1–A2',
    pitch: 'Teks yang dipelajari di SMP: mendeskripsikan orang dan tempat, pesan singkat dan pengumuman, kartu ucapan, teks prosedur, recount, dan narrative.',
    school: { grades: 'Kelas 7–9', fase: 'Fase D', cefr: 'A2' },
  },
  {
    id: 'sma',
    title: 'Jalur SMA',
    short: 'SMA',
    audience: 'Siswa SMA/SMK kelas 10–12',
    level: 'Mulai A2–B1',
    pitch: 'Saran dan pendapat, explanation, report, analytical exposition, discussion, news item, surat lamaran, dan latihan Literasi Bahasa Inggris gaya SNBT.',
    note: 'Latihan bergaya SNBT dibuat sendiri oleh Lentera, bukan soal resmi.',
    school: { grades: 'Kelas 10–12', fase: 'Fase E–F', cefr: 'B1' },
  },
  {
    id: 'work',
    title: 'Bahasa Inggris untuk Kerja',
    short: 'Kerja',
    audience: 'Pencari kerja dan karyawan',
    level: 'Disarankan mulai A2–B1',
    pitch: 'Wawancara kerja ("Tell me about yourself"), email profesional, rapat, telepon kerja, presentasi, serta CV dan surat lamaran.',
  },
  {
    id: 'exam',
    title: 'Persiapan TOEFL ITP dan IELTS',
    short: 'TOEFL/IELTS',
    audience: 'Calon mahasiswa, pelamar beasiswa, dan pekerja',
    level: 'Disarankan mulai B1–B2',
    pitch: 'TOEFL ITP Structure, Written Expression, dan Listening; IELTS Reading (True/False/Not Given), Writing Task 2, dan Speaking.',
    note: 'Latihan bergaya ujian, bukan soal resmi. TOEFL dan TOEFL ITP adalah merek ETS; IELTS dimiliki British Council, IDP, dan Cambridge. Lentera tidak berafiliasi dengan mereka.',
  },
];

/** The SD track was called 'kids' before Rilis 16. */
export const normTrack = (id: TrackId | undefined): TrackId | undefined => (id === 'kids' ? 'sd' : id);
export const trackInfo = (id: TrackId | undefined) => TRACKS.find((t) => t.id === normTrack(id));
export const isSchoolTrack = (id: TrackId | undefined): id is SchoolLevel => !!trackInfo(id)?.school;
export const SCHOOL_TRACKS = TRACKS.filter((t) => t.school);
export const SPECIAL_TRACKS = TRACKS.filter((t) => !t.school);
/** Certificates name a CEFR level (migration 0009); a school track's final exam uses its track's level. */
export const certificateLevel = (trackId: string): Cefr | undefined => trackInfo(trackId as TrackId)?.school?.cefr;
