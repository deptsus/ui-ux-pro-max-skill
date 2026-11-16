// Rilis 12: level-exam time limits checked on the server (migration 0017) and
// a larger exam bank.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import path from 'node:path';
import { EXAM_BANK } from '@content/exam-bank';
import { isLateSubmission, LATE_GRACE_SEC } from '@/lib/engine/levelExam';
import { openEmbedded, type RawDb } from '@/lib/server/db';
import { newUser } from './helpers';

describe('batas waktu ujian level di server', () => {
  const T = Date.parse('2026-11-16T03:00:00Z');
  it('terlambat hanya bila lewat batas waktu ditambah toleransi 2 menit', () => {
    expect(LATE_GRACE_SEC).toBe(120);
    expect(isLateSubmission(T, T + 30 * 60_000, 30 * 60)).toBe(false);
    expect(isLateSubmission(T, T + 30 * 60_000 + 119_000, 30 * 60)).toBe(false);
    expect(isLateSubmission(T, T + 30 * 60_000 + 121_000, 30 * 60)).toBe(true);
    expect(isLateSubmission(null, T + 10 * 3600_000, 30 * 60)).toBe(false);
  });

  describe('migrasi 0017', () => {
    let db: RawDb;
    let ani: string;
    beforeAll(async () => {
      db = await openEmbedded(undefined, path.resolve(__dirname, '..'));
      ani = await newUser(db, 'Ani R12');
    });
    afterAll(async () => {
      await db.close();
    });
    it('waktu mulai dicatat sekali per percobaan; memulai ulang tidak mengulang jam', async () => {
      expect(await db.rpc('content_features')).toContain('exam_timing');
      const first = await db.rpc<string>('level_exam_begin', { p_user: ani, p_exam: 'exam.level.A1', p_attempt: 0 });
      await db.query("update level_exam_starts set started_at = started_at - interval '40 minutes' where user_id = $1", [ani]);
      const again = await db.rpc<string>('level_exam_begin', { p_user: ani, p_exam: 'exam.level.A1', p_attempt: 0 });
      expect(Date.parse(first) - Date.parse(again)).toBe(40 * 60_000);
      const next = await db.rpc<string>('level_exam_begin', { p_user: ani, p_exam: 'exam.level.A1', p_attempt: 1 });
      expect(Date.parse(next)).toBeGreaterThan(Date.parse(again));
      const [row] = await db.query<{ rls: boolean }>("select relrowsecurity as rls from pg_class where relname = 'level_exam_starts'");
      expect(row.rls).toBe(true);
    });
  });
});

describe('bank soal ujian level', () => {
  it('16 soal tata bahasa dan kosakata per level, 8 diambil tiap percobaan', () => {
    for (const [level, bank] of Object.entries(EXAM_BANK)) expect(bank.grammar, level).toHaveLength(16);
  });
});
