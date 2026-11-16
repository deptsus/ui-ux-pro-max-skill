// Rilis 11 "Jalur Khusus": TOEFL ITP/IELTS, English for work and the kids'
// track live next to the CEFR path (chapters with `track`, migration 0016).
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import path from 'node:path';
import { buildPack } from '@content/index';
import { indexContent } from '@/lib/content/types';
import { packForFree, packToRows, rowsToPack, type Rows } from '@/lib/content/rows';
import { TRACKS } from '@/lib/content/tracks';
import { validatePack } from '@/lib/content/validate';
import { createState, finishMastery } from '@/lib/engine/state';
import { FREE, type Entitlement } from '@/lib/engine/types';
import { buildExam } from '@/lib/engine/sessions';
import { linesByLevel, shadowLines } from '@/lib/engine/shadowing';
import { lessonLock, nextLesson, unitsOfLevel } from '@/lib/engine/unlock';
import { openEmbedded, type RawDb } from '@/lib/server/db';
import { newUser } from './helpers';

const T0 = Date.parse('2026-11-16T03:00:00Z');
const PREMIUM: Entitlement = { premium: true, plan: 'premium_monthly', expiresAt: T0 + 30 * 86_400_000 };
const pack = buildPack();
const ix = indexContent(pack);
const trackChapters = pack.chapters.filter((c) => c.track);
const lessonsOfTrack = (id: string) => ix.trackLessons.filter((l) => ix.chapterById.get(ix.unitById.get(l.unitId)!.chapterId)!.track === id);

describe('isi jalur khusus', () => {
  it('tiga jalur, masing-masing enam pelajaran (Rilis 12 menambah tiga); pelajaran pertama gratis, sisanya dan ujian unitnya Premium', () => {
    expect(trackChapters.map((c) => c.track).sort()).toEqual(['exam', 'kids', 'work']);
    for (const t of ['work', 'exam', 'kids']) {
      const lessons = lessonsOfTrack(t);
      expect(lessons, t).toHaveLength(6);
      expect(lessons.map((l) => l.premium), t).toEqual([false, true, true, true, true, true]);
      const unit = ix.unitById.get(lessons[0].unitId)!;
      expect(pack.exams.find((e) => e.scope === 'unit' && e.ref === unit.id)?.premium, t).toBe(true);
    }
    expect(TRACKS.map((t) => t.id).sort()).toEqual(['exam', 'kids', 'work']);
    expect(TRACKS.find((t) => t.id === 'exam')!.note).toMatch(/tidak berafiliasi/);
    expect(trackChapters.find((c) => c.track === 'exam')!.description).toMatch(/tidak berafiliasi/);
  });

  it('lolos pemeriksa kurikulum (kunci jawaban, penjelasan, soal menulis di tiap tahap)', () => {
    expect(validatePack(pack)).toEqual([]);
  });
});

describe('terpisah dari jalur CEFR', () => {
  it('jalur belajar, rencana mingguan, dan "pelajaran berikutnya" tidak memuat pelajaran jalur khusus', () => {
    expect(ix.trackLessons).toHaveLength(18);
    expect(ix.orderedLessons.some((l) => ix.trackLessons.includes(l))).toBe(false);
    expect(ix.orderedLessons.length + ix.trackLessons.length).toBe(pack.lessons.length);
    for (const level of ['A1', 'B1', 'B2'] as const) expect(unitsOfLevel(ix, level).some((u) => u.id.startsWith('track-')), level).toBe(false);
    const s = createState('u', T0);
    expect(ix.trackLessons.map((l) => l.id)).not.toContain(nextLesson(s, ix, PREMIUM, T0)?.id);
  });

  it('pelajaran pertama tiap jalur terbuka untuk semua, tanpa syarat level CEFR', () => {
    const s = createState('baru', T0);
    for (const t of ['work', 'exam', 'kids']) {
      const [first, second] = lessonsOfTrack(t);
      expect(lessonLock(s, ix, first, FREE, T0).status, t).toBe('available');
      expect(lessonLock(s, ix, second, FREE, T0).status, t).toBe('premium');
      expect(lessonLock(s, ix, second, PREMIUM, T0).status, t).toBe('locked');
    }
  });

  it('di dalam jalur, pelajaran terbuka satu per satu setelah tes penguasaan lulus', () => {
    const s = createState('u', T0);
    const [first, second, third] = lessonsOfTrack('exam');
    finishMastery(s, ix, first.id, 95, T0);
    expect(lessonLock(s, ix, first, PREMIUM, T0).status).toBe('completed');
    expect(lessonLock(s, ix, second, PREMIUM, T0).status).toBe('available');
    expect(lessonLock(s, ix, third, PREMIUM, T0).status).toBe('locked');
  });

  it('latihan shadowing tetap memakai jalur CEFR (kalimat jalur khusus tidak membuka level Premium)', () => {
    const lines = shadowLines(packForFree(pack));
    const trackSources = new Set(ix.trackLessons.map((l) => `Pelajaran · ${l.title}`));
    expect(lines.some((l) => trackSources.has(l.source))).toBe(false);
    expect(linesByLevel(lines).B1).toBe(0);
  });

    it('ujian unit jalur khusus mengambil soal dari pelajaran jalurnya', () => {
    const exam = pack.exams.find((e) => e.scope === 'unit' && e.ref === 'track-work-u1')!;
    const qs = buildExam(ix, exam, 1);
    expect(qs.length).toBeGreaterThan(0);
    expect(qs.every((q) => q.lessonId?.startsWith('work-'))).toBe(true);
  });
});

describe('paket materi dan basis data', () => {
  it('kolom track ikut ke baris basis data dan kembali utuh', () => {
    const rows = packToRows(pack);
    expect(rows.chapters!.filter((c) => (c as { track?: string }).track).length).toBe(3);
    const back = rowsToPack(rows, 'db-test');
    expect(back.chapters.filter((c) => c.track).map((c) => c.id).sort()).toEqual(['track-exam', 'track-kids', 'track-work']);
    expect(back.chapters.find((c) => c.id === 'a1-c1')!.track).toBeUndefined();
  });

  it('paket gratis memuat isi pelajaran pertama tiap jalur; pelajaran Premium tanpa isi', () => {
    const free = packForFree(pack);
    for (const t of ['work', 'exam', 'kids']) {
      const [first, second] = lessonsOfTrack(t);
      const f = free.lessons.find((l) => l.id === first.id)!;
      const p = free.lessons.find((l) => l.id === second.id)!;
      expect(f.teaching.length, t).toBeGreaterThan(0);
      expect(p.locked, t).toBe(true);
      expect(p.teaching, t).toEqual([]);
      expect(free.exercises.some((e) => e.lessonId === second.id), t).toBe(false);
    }
  });

  describe('migrasi 0016', () => {
    let db: RawDb;
    beforeAll(async () => {
      db = await openEmbedded(undefined, path.resolve(__dirname, '..'));
    });
    afterAll(async () => {
      await db.close();
    });
    it('menambah chapters.track; impor dan terbitkan membawa jalur khusus', async () => {
      const admin = await newUser(db, 'Admin R11', 'admin');
      expect(await db.rpc('content_features')).toContain('tracks');
      await db.rpc('import_content', { p_actor: admin, p_rows: packToRows(pack) });
      const [row] = await db.query<{ track: string }>("select track from chapters where id = 'track-kids'");
      expect(row.track).toBe('kids');
      await expect(db.query("update chapters set track = 'sports' where id = 'track-kids'")).rejects.toThrow();
      await db.rpc('publish_curriculum', { p_actor: admin, p_label: 'r11', p_notes: '' });
      const published = await db.rpc<{ rows: Rows; version: number }>('get_published_content');
      const live = rowsToPack(published.rows, `db-${published.version}`);
      expect(live.chapters.filter((c) => c.track).map((c) => c.track).sort()).toEqual(['exam', 'kids', 'work']);
      expect(indexContent(live).trackLessons).toHaveLength(18);
    });
  });
});
