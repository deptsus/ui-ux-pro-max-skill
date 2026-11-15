// Rilis 8 "Kebiasaan Belajar": shared server helpers for reminder settings,
// leagues, friends and friend challenges (SQL in migration 0013).
import { HttpError } from './api';

export const NOT_READY = 'Fitur ini sedang disiapkan di server. Coba lagi nanti.';

/** The 0013 functions are missing until the migration runs: say so instead of failing. */
export function notReady(e: unknown): never {
  if (/does not exist|could not find|not found/i.test(String((e as Error)?.message))) throw new HttpError(409, NOT_READY, 'not_ready');
  throw e;
}

/** Messages for the errors the friend and challenge functions return. */
export const SOCIAL_ERRORS: Record<string, [number, string]> = {
  code_not_found: [404, 'Kode teman tidak ditemukan. Periksa lagi keenam karakternya.'],
  own_code: [400, 'Itu kode temanmu sendiri. Bagikan kode ini ke temanmu, lalu masukkan kode milik mereka.'],
  friend_limit: [400, 'Daftar teman sudah penuh (maksimal 50 teman).'],
  too_many_attempts: [429, 'Terlalu banyak kode yang salah. Coba lagi dalam satu jam.'],
  not_friend: [400, 'Tantangan hanya bisa dikirim ke teman.'],
  invalid_days: [400, 'Pilih lama tantangan: 3 atau 7 hari.'],
  too_many: [400, 'Kamu sudah punya 3 tantangan yang berjalan atau menunggu jawaban. Selesaikan dulu salah satunya.'],
  already_open: [400, 'Masih ada tantangan yang berjalan atau menunggu jawaban dengan teman ini.'],
  not_pending: [400, 'Tantangan ini sudah tidak menunggu jawaban.'],
};

export function socialError(r: { error?: string } | null | undefined): void {
  if (!r?.error) return;
  const [status, message] = SOCIAL_ERRORS[r.error] ?? [400, 'Permintaan tidak bisa diproses.'];
  throw new HttpError(status, message, r.error);
}

/** Friend codes: six characters from A–Z and 2–9 without the look-alikes 0, O, 1 and I. */
export const FRIEND_CODE = /^[A-HJ-NP-Z2-9]{6}$/;
export const normalizeCode = (s: unknown) => (typeof s === 'string' ? s.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12) : '');
