// Rilis 16 "Jalur Sekolah SD–SMA": school tracks (Jalur Anak merged into SD),
// first unit free, final exams with certificates, the learner's school level,
// and names of SD learners hidden in the public league (migration 0020).
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import path from 'node:path';
import { buildPack } from '@content/index';
import { indexContent } from '@/lib/content/types';
import { packForFree, packToRows } from '@/lib/content/rows';
import { SCHOOL_TRACKS, certificateLevel, isSchoolTrack, normTrack, trackInfo } from '@/lib/content/tracks';
import { validatePack } from '@/lib/content/validate';
import { PICS } from '@/lib/content/pics';
import { buildLevelExam, gradeLevelExam, packForClient } from '@/lib/engine/levelExam';
import { createState, finishMastery, recordExam } from '@/lib/engine/state';
import { FREE, type Entitlement } from '@/lib/engine/types';
import { lessonLock, lessonsOfUnit, trackExam, trackExamStatus, unitExam } from '@/lib/engine/unlock';
import { openEmbedded, type RawDb } from '@/lib/server/db';
import { newUser } from './helpers';

const T0 = Date.parse('2026-11-17T03:00:00Z');
const PREMIUM: Entitlement = { premium: true, plan: 'premium_monthly', expiresAt: T0 + 30 * 86_400_000 };
const pack = buildPack();
const ix = indexContent(pack);
const chapterOf = (track: string) => pack.chapters.find((c) => c.track === track)!;
const unitsOf = (track: string) => pack.units.filter((u) => u.chapterId === chapterOf(track).id).sort((a, b) => a.position - b.position);
const lessonsOf = (track: string) => unitsOf(track).flatMap((u) => lessonsOfUnit(ix, u.id));

describe('isi Jalur Sekolah', () => {
  it('tiga jenjang: SD 13 pelajaran (6 dari Jalur Anak, ID tetap), SMP 7, SMA 8', () => {
    expect(SCHOOL_TRACKS.map((t) => t.id)).toEqual(['sd', 'smp', 'sma']);
    expect(lessonsOf('sd')).toHaveLength(13);
    expect(lessonsOf('smp')).toHaveLength(7);
    expect(lessonsOf('sma')).toHaveLength(8);
    const kids = ['kids-colors-animals', 'kids-family', 'kids-numbers-toys', 'kids-food', 'kids-school', 'kids-routine'];
    expect(lessonsOf('sd').map((l) => l.id)).toEqual(expect.arrayContaining(kids));
    // The old chapter and unit ids stay, so saved progress and unit exams still match.
    expect(chapterOf('sd').id).toBe('track-kids');
    expect(unitsOf('sd')[0].id).toBe('track-kids-u1');
    expect(pack.chapters.some((c) => c.track === 'kids')).toBe(false);
  });

  it('unit pertama tiap jenjang gratis (pelajaran dan ujian unitnya); unit lain Premium', () => {
    for (const t of ['sd', 'smp', 'sma']) {
      unitsOf(t).forEach((u, i) => {
        for (const l of lessonsOfUnit(ix, u.id)) expect(l.premium, `${t} ${l.id}`).toBe(i > 0);
        expect(unitExam(ix, u.id)?.premium, `${t} ${u.id}`).toBe(i > 0);
      });
    }
    // Special tracks keep "first lesson free".
    expect(lessonsOf('work').map((l) => l.premium)).toEqual([false, true, true, true, true, true]);
  });

  it('kurikulum lolos pemeriksaan, termasuk gambar orang (keluarga, profesi)', () => {
    expect(validatePack(pack)).toEqual([]);
    for (const k of ['mother', 'father', 'grandmother', 'grandfather', 'sister', 'brother', 'teacher', 'doctor', 'nurse', 'police', 'farmer', 'chef', 'pilot']) expect(PICS).toHaveProperty(k);
    const used = new Set(pack.exercises.flatMap((e) => (e.options ?? []).map((o) => o.pic)).filter(Boolean));
    for (const k of ['doctor', 'pilot', 'nurse', 'police', 'grandmother', 'brother']) expect(used.has(k as never), k).toBe(true);
  });

  it('paket gratis memuat isi unit pertama tiap jenjang; unit Premium tanpa isi', () => {
    const free = packForFree(pack);
    for (const t of ['sd', 'smp', 'sma']) {
      const [u1, u2] = unitsOf(t);
      for (const l of lessonsOfUnit(ix, u1.id)) {
        expect(free.lessons.find((x) => x.id === l.id)!.teaching.length, l.id).toBeGreaterThan(0);
        expect(free.exercises.some((e) => e.lessonId === l.id), l.id).toBe(true);
      }
      const locked = lessonsOfUnit(ix, u2.id)[0];
      expect(free.lessons.find((x) => x.id === locked.id)!.locked, locked.id).toBe(true);
      expect(free.exercises.some((e) => e.lessonId === locked.id), locked.id).toBe(false);
    }
  });
});

describe('membuka pelajaran', () => {
  it('pelajaran pertama tiap jenjang terbuka untuk semua; berikutnya menunggu tes penguasaan; unit 2 Premium', () => {
    const s = createState('baru', T0);
    for (const t of ['sd', 'smp', 'sma']) {
      const [first, second] = lessonsOf(t);
      expect(lessonLock(s, ix, first, FREE, T0).status, t).toBe('available');
      expect(lessonLock(s, ix, second, FREE, T0).status, t).toBe('locked');
      const firstOfUnit2 = lessonsOfUnit(ix, unitsOf(t)[1].id)[0];
      expect(lessonLock(s, ix, firstOfUnit2, FREE, T0).status, t).toBe('premium');
    }
  });

  it('pelajaran Jalur Anak yang sudah dimulai tetap terbuka walau pelajaran baru disisipkan sebelumnya', () => {
    const s = createState('lama', T0);
    finishMastery(s, ix, 'kids-colors-animals', 95, T0);
    // kids-food started before Rilis 16; sd-house (new) now comes before it.
    s.lessons['kids-food'] = { ...(s.lessons['kids-food'] ?? {}), step: 'guided', startedAt: T0 } as never;
    const food = ix.lessonById.get('kids-food')!;
    expect(lessonLock(s, ix, food, PREMIUM, T0).status).toBe('in-progress');
    expect(lessonLock(s, ix, ix.lessonById.get('kids-colors-animals')!, PREMIUM, T0).status).toBe('completed');
    // A lesson not started yet still waits for the one before it.
    expect(lessonLock(s, ix, ix.lessonById.get('sd-body')!, PREMIUM, T0).status).toBe('available');
    expect(lessonLock(s, ix, ix.lessonById.get('sd-house')!, PREMIUM, T0).status).toBe('locked');
  });
});

describe('ujian akhir jalur sekolah', () => {
  const finals = ['sd', 'smp', 'sma'].map((t) => trackExam(ix, t)!);

  it('satu ujian per jenjang: empat bagian, Premium, bank soal hanya di server', () => {
    for (const x of finals) {
      expect(x.scope).toBe('track');
      expect(x.premium).toBe(true);
      expect(x.sections!.map((s) => s.kind)).toEqual(['grammar', 'reading', 'listening', 'writing']);
    }
    const client = packForClient(pack);
    for (const x of finals) {
      const bank = x.sections!.flatMap((s) => s.pool.flat());
      expect(client.exercises.some((e) => bank.includes(e.id)), x.id).toBe(false);
      expect(client.exams.find((e) => e.id === x.id)!.sections!.every((s) => s.hidden), x.id).toBe(true);
    }
  });

  it('kunci tiap soal bank dinilai benar; percobaan penuh dengan kunci lulus', () => {
    for (const x of finals) {
      const built = buildLevelExam(ix, x, 'kunci');
      const answers = Object.fromEntries(built.sections.flatMap((s) => s.questions).map((q) => [q.id, q.options ? { choice: q.options.findIndex((o) => o.correct) } : { text: q.answers![0] }]));
      const writing = built.sections.find((s) => s.kind === 'writing')!.writing!.model;
      const res = gradeLevelExam(x, built, answers, writing);
      expect(res.score, x.id).toBe(100);
      expect(res.passed, x.id).toBe(true);
    }
  });

  it('terbuka setelah semua pelajaran dan ujian unit jenjangnya lulus; Free melihat Premium', () => {
    const s = createState('u', T0);
    expect(trackExamStatus(s, ix, 'smp', FREE, T0)).toBe('premium');
    expect(trackExamStatus(s, ix, 'smp', PREMIUM, T0)).toBe('locked');
    for (const l of lessonsOf('smp')) finishMastery(s, ix, l.id, 95, T0);
    expect(trackExamStatus(s, ix, 'smp', PREMIUM, T0)).toBe('locked');
    for (const u of unitsOf('smp')) recordExam(s, ix, unitExam(ix, u.id)!, 90, T0);
    expect(trackExamStatus(s, ix, 'smp', PREMIUM, T0)).toBe('available');
    recordExam(s, ix, trackExam(ix, 'smp')!, 92, T0);
    expect(trackExamStatus(s, ix, 'smp', PREMIUM, T0)).toBe('passed');
  });

  it('sertifikat menyebut level CEFR jenjangnya', () => {
    expect([certificateLevel('sd'), certificateLevel('smp'), certificateLevel('sma')]).toEqual(['A1', 'A2', 'B1']);
    expect(certificateLevel('work')).toBeUndefined();
  });
});

describe('id jalur lama', () => {
  it('"kids" dibaca sebagai Jalur SD (kurikulum terbit sebelum Rilis 16)', () => {
    expect(normTrack('kids')).toBe('sd');
    expect(trackInfo('kids')!.title).toBe('Jalur SD');
    expect(isSchoolTrack('kids')).toBe(true);
    expect(isSchoolTrack('sd')).toBe(true);
  });
});

describe('migrasi 0020', () => {
  let db: RawDb;
  beforeAll(async () => {
    db = await openEmbedded(undefined, path.resolve(__dirname, '..'));
  });
  afterAll(async () => {
    await db.close();
  });

  it('jalur sd/smp/sma dan ujian "track" bisa diimpor dan diterbitkan', async () => {
    const admin = await newUser(db, 'Admin R16', 'admin');
    expect(await db.rpc('content_features')).toContain('school');
    await db.rpc('import_content', { p_actor: admin, p_rows: packToRows(pack) });
    const rows = await db.query<{ id: string; track: string }>("select id, track from chapters where track is not null order by id");
    expect(rows.map((r) => r.track).sort()).toEqual(['exam', 'sd', 'sma', 'smp', 'work']);
    expect(await db.query<{ n: number }>("select count(*)::int as n from exams where scope = 'track'")).toEqual([{ n: 3 }]);
    await expect(db.query("update chapters set track = 'sports' where id = 'track-smp'")).rejects.toThrow();
    const res = await db.rpc<{ published: boolean }>('publish_curriculum', { p_actor: admin, p_label: 'r16', p_notes: '' });
    expect(res.published).toBe(true);
  });

  it('jenjang tersimpan di profil akun dan bisa dihapus; nilai lain ditolak', async () => {
    const u = await newUser(db, 'Sari Kecil');
    const p = await db.rpc<{ school_level: string | null }>('update_profile', { p_user: u, p_patch: { school_level: 'sd' } });
    expect(p.school_level).toBe('sd');
    // Other edits leave it alone.
    expect((await db.rpc<{ school_level: string | null }>('update_profile', { p_user: u, p_patch: { avatar: 3 } })).school_level).toBe('sd');
    expect((await db.rpc<{ school_level: string | null }>('update_profile', { p_user: u, p_patch: { school_level: '' } })).school_level).toBeNull();
    await expect(db.rpc('update_profile', { p_user: u, p_patch: { school_level: 'tk' } })).rejects.toThrow();
  });

  it('lulus ujian akhir jalur menerbitkan sertifikat dengan level CEFR jenjangnya', async () => {
    const u = await newUser(db, 'Laras SMP');
    const rec = await db.rpc<{ certificate: string | null }>('record_level_exam', {
      p_user: u, p_exam: 'exam.track.smp', p_level: certificateLevel('smp'), p_attempt: 0, p_score: 88, p_passed: true,
      p_sections: [{ id: 'grammar', title: 'Tata Bahasa & Kosakata', score: 88, passScore: 60, passed: true }], p_questions: [], p_writing: '', p_code: 'SMPTEST234',
    });
    expect(rec.certificate).toBe('SMPTEST234');
    const cert = await db.rpc<{ level: string; exam: string; name: string }>('get_certificate', { p_code: 'smptest234' });
    expect(cert).toMatchObject({ level: 'A2', exam: 'exam.track.smp', name: 'Laras SMP' });
  });

  it('nama pelajar SD tampil "Pelajar SD" di papan peringkat, kecuali bagi teman dan dirinya sendiri', async () => {
    const kid = await newUser(db, 'Bima Kecil');
    const other = await newUser(db, 'Penonton');
    await db.rpc('update_profile', { p_user: kid, p_patch: { school_level: 'sd' } });
    const at = Date.now();
    await db.rpc('sync_learner', { p_user: kid, p_events: [{ id: 'k1', kind: 'xp', at, data: { amount: 180, reason: 'lesson' } }], p_snapshot: null, p_client_updated_at: 1 });
    await db.rpc('sync_learner', { p_user: other, p_events: [{ id: 'o1', kind: 'xp', at, data: { amount: 120, reason: 'lesson' } }], p_snapshot: null, p_client_updated_at: 1 });
    type Board = { top: { name: string; me: boolean }[] };
    const seen = await db.rpc<Board>('get_leaderboard', { p_user: other });
    expect(seen.top.map((r) => r.name)).toContain('Pelajar SD');
    expect(seen.top.map((r) => r.name)).not.toContain('Bima Kecil');
    expect((await db.rpc<Board>('get_leaderboard', { p_user: kid })).top.find((r) => r.me)!.name).toBe('Bima Kecil');
    const [a, b] = [kid, other].sort();
    await db.query('insert into friendships (user_a, user_b) values ($1, $2)', [a, b]);
    expect((await db.rpc<Board>('get_leaderboard', { p_user: other })).top.map((r) => r.name)).toContain('Bima Kecil');
  });
});
