// Jalur Khusus (Rilis 11): special tracks next to the main CEFR path. The
// lessons live in the curriculum (chapters with `track`); this is how the app
// and the public pages present them. No 'use client': server pages use it too.
import type { TrackId } from './types';

export interface TrackInfo {
  id: TrackId;
  title: string;
  /** For whom, in one line. */
  audience: string;
  /** Recommended starting level, shown as advice (tracks are not locked by level). */
  level: string;
  pitch: string;
  /** Shown wherever the track is presented. */
  note?: string;
}

export const TRACKS: TrackInfo[] = [
  {
    id: 'work',
    title: 'Bahasa Inggris untuk Kerja',
    audience: 'Pencari kerja dan karyawan',
    level: 'Disarankan mulai A2–B1',
    pitch: 'Wawancara kerja ("Tell me about yourself"), email profesional yang sopan, dan menyampaikan pendapat dalam rapat.',
  },
  {
    id: 'exam',
    title: 'Persiapan TOEFL ITP dan IELTS',
    audience: 'Calon mahasiswa, pelamar beasiswa, dan pekerja',
    level: 'Disarankan mulai B1–B2',
    pitch: 'Strategi Structure dan Written Expression TOEFL ITP, serta esai opini IELTS Writing Task 2.',
    note: 'Latihan bergaya ujian, bukan soal resmi. TOEFL dan TOEFL ITP adalah merek ETS; IELTS dimiliki British Council, IDP, dan Cambridge. Lentera tidak berafiliasi dengan mereka.',
  },
  {
    id: 'kids',
    title: 'Jalur Anak',
    audience: 'Anak 7–12 tahun, didampingi orang tua',
    level: 'Untuk pemula (A1)',
    pitch: 'Warna dan hewan, keluarga, angka dan mainan, dengan kalimat pendek dan penjelasan yang bisa dibacakan orang tua.',
  },
];

export const trackInfo = (id: TrackId | undefined) => TRACKS.find((t) => t.id === id);
