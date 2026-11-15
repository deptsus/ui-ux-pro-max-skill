// Rilis 10 "Kelas": shared server helpers for schools, teachers, classes and
// parents (SQL in migration 0015).
import { HttpError } from './api';
import type { ServerDb } from './db';
import { clientIp, rateLimit } from './security';

export const CLASS_ERRORS: Record<string, [number, string]> = {
  code_not_found: [404, 'Kode tidak ditemukan. Periksa lagi huruf dan angkanya.'],
  license_inactive: [400, 'Lisensi sekolah ini belum mulai, sudah berakhir, atau dihentikan. Hubungi pemilik Lentera.'],
  teacher_limit: [400, 'Jumlah guru untuk lisensi ini sudah penuh. Minta sekolah menambah kuota guru.'],
  not_teacher: [403, 'Hanya guru kelas ini yang bisa melakukannya.'],
  class_limit: [400, 'Jumlah kelas untuk lisensi ini sudah penuh. Arsipkan kelas lama atau minta tambahan kuota.'],
  class_closed: [400, 'Kelas ini sudah ditutup atau lisensinya berakhir.'],
  class_full: [400, 'Kelas ini sudah penuh.'],
  past_due: [400, 'Tenggat harus di masa depan.'],
  too_many: [400, 'Terlalu banyak tugas di kelas ini.'],
  own_code: [400, 'Itu kode milikmu sendiri. Kode ini untuk orang tuamu.'],
  parent_limit: [400, 'Akun ini sudah terhubung dengan 3 orang tua (batas maksimal).'],
};

export function classError(r: { error?: string } | null | undefined): void {
  if (!r?.error) return;
  const [status, message] = CLASS_ERRORS[r.error] ?? [400, 'Permintaan tidak bisa diproses.'];
  throw new HttpError(status, message, r.error);
}

export const cleanCode = (s: unknown, len: number) => (typeof s === 'string' ? s.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, len) : '');
export const isId = (v: unknown) => Number.isSafeInteger(Number(v)) && Number(v) > 0;
export const isUuid = (s: unknown) => typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

/**
 * Class, license and parent codes unlock Premium or someone's progress, so
 * guesses are also limited per network address (on top of the per-account
 * limits), which makes trying codes from many new accounts pointless.
 */
export const limitCodeGuesses = (db: ServerDb, req: Request) => rateLimit(db, 'code-guess', clientIp(req), 40, 3600);
