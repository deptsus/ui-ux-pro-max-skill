// Rilis 3: CEFR-style level exams drawn from an exam-only bank and graded on
// the server, and completion certificates with a verification code.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import path from 'node:path';
import { buildPack } from '@content/index';
import { EXAM_BANK } from '@content/exam-bank';
import { CEFR_ORDER, indexContent, type ExamDef, type Exercise } from '@/lib/content/types';
import { packForFree, packToRows, rowsToPack, type Rows } from '@/lib/content/rows';
import { validatePack } from '@/lib/content/validate';
import type { Answer } from '@/lib/engine/grading';
import { bankIds, buildLevelExam, examSeed, gradeLevelExam, nextAttemptAt, packForClient, RETAKE_HOURS, sanitize, weakTopics } from '@/lib/engine/levelExam';
import { createState, finishTopicPractice, recordExam } from '@/lib/engine/state';
import { checkWriting } from '@/lib/engine/writing';
import { openEmbedded, type RawDb } from '@/lib/server/db';
import { newUser } from './helpers';

const pack = buildPack();
const ix = indexContent(pack);
const levelExams = pack.exams.filter((e) => e.scope === 'level') as (ExamDef & { sections: NonNullable<ExamDef['sections']> })[];
const bank = bankIds(pack);

/** The key for a bank question, as a learner would enter it. */
function key(ex: Exercise): Answer {
  if (ex.options) return { choice: ex.options.findIndex((o) => o.correct) };
  return { text: ex.answers![0] };
}
function wrong(ex: Exercise): Answer {
  if (ex.options) return { choice: ex.options.findIndex((o) => !o.correct) };
  return { text: 'xyz' };
}

describe('bank soal ujian level', () => {
  it('setiap level punya empat bagian dengan bank yang cukup untuk percobaan ulang', () => {
    expect(levelExams.map((e) => e.ref)).toEqual([...CEFR_ORDER]);
    for (const e of levelExams) {
      expect(e.sections.map((s) => s.kind), e.id).toEqual(['grammar', 'reading', 'listening', 'writing']);
      for (const s of e.sections) {
        expect(s.passScore, `${e.id}/${s.id}`).toBe(60);
        if (s.kind === 'writing') expect(s.writing!.length).toBeGreaterThanOrEqual(2);
        else expect(s.pool.length, `${e.id}/${s.id}`).toBeGreaterThan(s.take);
      }
      expect(e.passScore).toBe(80);
    }
  });

  it('soal bank hanya untuk ujian: bertahap "exam", tanpa pelajaran, tidak dipakai di PR, cerita, atau ujian lain', () => {
    // Per level: 16 grammar & vocabulary items (12 from Rilis 3, 4 from Rilis 12), 2×4 reading, 2×4 listening.
    expect(bank.size).toBe(CEFR_ORDER.length * (16 + 8 + 8));
    for (const id of bank) {
      const e = ix.exerciseById.get(id)!;
      expect(e.stage, id).toBe('exam');
      expect(e.lessonId ?? null, id).toBeNull();
    }
    for (const h of pack.homework) expect(h.exerciseIds.filter((id) => bank.has(id)), h.id).toEqual([]);
    for (const s of pack.stories) expect(s.questionIds.filter((id) => bank.has(id)), s.id).toEqual([]);
    for (const x of pack.exams) expect(x.exerciseIds.filter((id) => bank.has(id)), x.id).toEqual([]);
  });

  it('kunci tiap soal bank dinilai benar, dan pilihan lain dinilai salah', () => {
    for (const e of levelExams) {
      const built = buildLevelExam(ix, e, 'kunci');
      const all = e.sections.filter((s) => s.kind !== 'writing').flatMap((s) => s.pool.flat()).map((id) => ix.exerciseById.get(id)!);
      const full = { examId: e.id, seed: 'kunci', sections: e.sections.map((s) => ({ ...built.sections.find((b) => b.id === s.id)!, questions: s.kind === 'writing' ? [] : all.filter((q) => s.pool.flat().includes(q.id)) })) };
      const right = gradeLevelExam(e, full, Object.fromEntries(all.map((q) => [q.id, key(q)])), '');
      for (const it of right.items) expect(it.grade.correct, it.ex.id).toBe(true);
      const bad = gradeLevelExam(e, full, Object.fromEntries(all.map((q) => [q.id, wrong(q)])), '');
      for (const it of bad.items) expect(it.grade.correct, it.ex.id).toBe(false);
    }
  });

  it('contoh jawaban menulis memenuhi daftar periksanya, jawaban asal-asalan tidak', () => {
    for (const level of CEFR_ORDER) {
      for (const w of EXAM_BANK[level].writing) {
        expect(checkWriting(w.model, w).items.filter((i) => !i.ok).map((i) => i.label), `${level}: ${w.prompt}`).toEqual([]);
        expect(checkWriting('I like English', w).score, level).toBeLessThan(60);
      }
    }
  });

  it('lolos gerbang mutu, termasuk paket yang dikirim ke perangkat', () => {
    expect(validatePack(pack)).toEqual([]);
    expect(validatePack(packForClient(pack))).toEqual([]);
    expect(validatePack(packForFree(pack))).toEqual([]);
  });

  it('gerbang mutu menolak bank yang rusak', () => {
    const broken = structuredClone(pack);
    const exam = broken.exams.find((e) => e.id === 'exam.level.B1')!;
    const grammar = exam.sections!.find((s) => s.kind === 'grammar')!;
    grammar.pool.push([pack.exercises.find((e) => e.lessonId && e.stage === 'mastery')!.id]);
    grammar.take = grammar.pool.length;
    exam.sections = exam.sections!.filter((s) => s.kind !== 'listening');
    const errs = validatePack(broken).join('\n');
    expect(errs).toContain('bagian listening tidak ada');
    expect(errs).toContain('harus bertahap "exam" tanpa pelajaran');
    expect(errs).toContain('kelompok cadangan');
  });
});

describe('pengambilan dan penilaian', () => {
  const b1 = levelExams.find((e) => e.ref === 'B1')!;

  it('soal per percobaan tetap untuk benih yang sama dan berganti antar percobaan', () => {
    const a = buildLevelExam(ix, b1, examSeed('u1', b1.id, 0));
    const again = buildLevelExam(ix, b1, examSeed('u1', b1.id, 0));
    expect(again).toEqual(a);
    expect(a.sections.map((s) => s.questions.length)).toEqual([8, 4, 4, 0]);
    expect(a.sections[3].writing).toBeDefined();
    const ids = (x: typeof a) => x.sections.flatMap((s) => s.questions.map((q) => q.id)).join(',');
    const others = [1, 2, 3, 4].map((n) => ids(buildLevelExam(ix, b1, examSeed('u1', b1.id, n))));
    expect(others.some((o) => o !== ids(a))).toBe(true);
    // A passage keeps its questions together and in order.
    const reading = a.sections[1].questions.map((q) => q.id);
    expect(new Set(reading.map((id) => id.split('.e')[0])).size).toBe(1);
    expect(reading).toEqual([...reading].sort());
  });

  it('soal yang dikirim ke perangkat tidak membawa kunci, alasan, atau pembahasan', () => {
    const built = buildLevelExam(ix, b1, 'x');
    for (const q of built.sections.flatMap((s) => s.questions)) {
      const safe = sanitize(q);
      const json = JSON.stringify(safe);
      expect(json).not.toContain('"correct"');
      expect(json).not.toContain('"answers"');
      expect(json).not.toContain('"why"');
      expect(safe.explanation).toBe('');
      if (q.explanation) expect(json).not.toContain(q.explanation.slice(0, 30));
      expect(safe.options?.length ?? 0).toBe(q.options?.length ?? 0);
    }
  });

  it('semua benar dan tulisan contoh: 100, lulus; semua kosong: 0, belum lulus', () => {
    const built = buildLevelExam(ix, b1, 'y');
    const qs = built.sections.flatMap((s) => s.questions);
    const best = gradeLevelExam(b1, built, Object.fromEntries(qs.map((q) => [q.id, key(q)])), built.sections[3].writing!.model);
    expect(best.score).toBe(100);
    expect(best.passed).toBe(true);
    expect(best.sections.every((s) => s.passed)).toBe(true);
    const none = gradeLevelExam(b1, built, {}, '');
    expect(none.score).toBe(0);
    expect(none.passed).toBe(false);
    expect(none.items.every((i) => !i.grade.correct)).toBe(true);
  });

  it('satu bagian di bawah 60% menggagalkan ujian meski rata-ratanya tinggi', () => {
    const built = buildLevelExam(ix, b1, 'z');
    const qs = built.sections.flatMap((s) => s.questions);
    const answers = Object.fromEntries(qs.map((q) => [q.id, key(q)]));
    // Reading: only 1 of 4 right (25%).
    for (const q of built.sections[1].questions.slice(1)) answers[q.id] = wrong(q);
    const r = gradeLevelExam(b1, built, answers, built.sections[3].writing!.model);
    expect(r.score).toBeGreaterThanOrEqual(80);
    expect(r.sections.find((s) => s.id === 'reading')!.passed).toBe(false);
    expect(r.passed).toBe(false);
    const reading = r.byTopic.find((t) => t.topic === 'skill.reading')!;
    expect(reading.score).toBe(25);
  });

  it('paket untuk perangkat (Premium dan Free) tidak memuat bank soal', () => {
    for (const client of [packForClient(pack), packForFree(pack)]) {
      expect(client.exercises.filter((e) => bank.has(e.id))).toEqual([]);
      const json = JSON.stringify(client);
      expect(json).not.toContain('Not only ___ late');
      expect(json).not.toContain(EXAM_BANK.B1.writing[0].model.slice(0, 40));
      for (const e of client.exams.filter((x) => x.scope === 'level')) {
        expect(e.sections?.map((s) => [s.id, s.hidden, s.pool.length, s.count])).toEqual([['grammar', true, 0, 8], ['reading', true, 0, 4], ['listening', true, 0, 4], ['writing', true, 0, 1]]);
      }
    }
  });

  it('bagian ujian ikut tersimpan dan kembali utuh lewat baris basis data', () => {
    const back = rowsToPack(JSON.parse(JSON.stringify(packToRows(pack))) as Rows, 'test');
    expect(back.exams.find((e) => e.id === 'exam.level.C2')!.sections).toEqual(pack.exams.find((e) => e.id === 'exam.level.C2')!.sections);
  });
});

describe('jeda dan latihan wajib', () => {
  it('jeda 20 jam hanya setelah percobaan yang gagal', () => {
    const now = Date.now();
    expect(nextAttemptAt({ attempts: 0, last_at: null, last_passed: null })).toBeNull();
    expect(nextAttemptAt({ attempts: 1, last_at: new Date(now - 3600_000).toISOString(), last_passed: true })).toBeNull();
    const wait = nextAttemptAt({ attempts: 1, last_at: new Date(now - 3600_000).toISOString(), last_passed: false })!;
    expect(Math.round((wait - now) / 3600_000)).toBe(RETAKE_HOURS - 1);
    expect(nextAttemptAt({ attempts: 2, last_at: new Date(now - (RETAKE_HOURS + 1) * 3600_000).toISOString(), last_passed: false })).toBeNull();
  });

  it('topik terlemah yang punya latihan menjadi latihan wajib, maksimal dua', () => {
    const weak = weakTopics({ byTopic: [
      { topic: 'b1.relative', correct: 0, total: 1, score: 0 },
      { topic: 'skill.reading', correct: 1, total: 4, score: 25 },
      { topic: 'b1.used-to', correct: 1, total: 2, score: 50 },
      { topic: 'b1.conditionals', correct: 0, total: 2, score: 0 },
      { topic: 'b1.deduction', correct: 2, total: 2, score: 100 },
    ] }, () => true);
    expect(weak).toEqual(['b1.relative', 'b1.conditionals']);
  });

  it('percobaan gagal mencatat topik lemah; latihan topik yang lulus mencatat waktunya', () => {
    const s = createState('u', 0);
    const exam = levelExams.find((e) => e.ref === 'A2')!;
    expect(recordExam(s, ix, exam, 85, 1000, false, ['a2.countable'])).toBe(false);
    expect(s.exams[exam.id].attempts[0]).toEqual({ at: 1000, score: 85, passed: false, weak: ['a2.countable'] });
    expect(finishTopicPractice(s, 'a2.countable', 50, 2000)).toBe(false);
    expect(s.rewards['practice:a2.countable']).toBeUndefined();
    expect(finishTopicPractice(s, 'a2.countable', 90, 3000)).toBe(true);
    expect(s.rewards['practice:a2.countable']).toBe(3000);
    expect(recordExam(s, ix, exam, 82, 4000, true, ['a2.countable'])).toBe(true);
    expect(s.exams[exam.id].attempts[1]).toEqual({ at: 4000, score: 82, passed: true });
  });
});

describe('basis data: percobaan dan sertifikat (migrasi 0009)', () => {
  const ROOT = path.resolve(__dirname, '..');
  let db: RawDb;
  let learner: string;
  beforeAll(async () => {
    db = await openEmbedded(undefined, ROOT);
    learner = await newUser(db, 'Siti Rahma');
  });
  afterAll(async () => {
    await db.close();
  });
  const record = (attempt: number, score: number, passed: boolean, code: string) => db.rpc<{ id: number; certificate: string | null }>('record_level_exam', {
    p_user: learner, p_exam: 'exam.level.B1', p_level: 'B1', p_attempt: attempt, p_score: score, p_passed: passed,
    p_sections: [{ id: 'grammar', title: 'Tata Bahasa & Kosakata', score }], p_questions: ['q1'], p_writing: 'text', p_code: code,
  });

  it('mencatat percobaan berurutan dan menolak percobaan ganda atau usang', async () => {
    expect(await db.rpc('level_exam_status', { p_user: learner, p_exam: 'exam.level.B1' })).toMatchObject({ attempts: 0, last_passed: null, certificate: null });
    const first = await record(0, 55, false, 'AAAAAAAAA2');
    expect(first.certificate).toBeNull();
    await expect(record(0, 90, true, 'AAAAAAAAA3')).rejects.toThrow(/stale_attempt/);
    await expect(record(5, 90, true, 'AAAAAAAAA4')).rejects.toThrow(/stale_attempt/);
    expect(await db.rpc('level_exam_status', { p_user: learner, p_exam: 'exam.level.B1' })).toMatchObject({ attempts: 1, last_passed: false, certificate: null });
  });

  it('lulus pertama menerbitkan satu sertifikat; lulus berikutnya tidak menggantinya', async () => {
    const pass = await record(1, 86, true, 'CERTB2CODE');
    expect(pass.certificate).toBe('CERTB2CODE');
    const again = await record(2, 95, true, 'OTHERCODE2');
    expect(again.certificate).toBe('CERTB2CODE');
    const cert = await db.rpc<Record<string, unknown>>('get_certificate', { p_code: ' certb2code ' });
    expect(cert).toMatchObject({ code: 'CERTB2CODE', name: 'Siti Rahma', level: 'B1', exam: 'exam.level.B1', score: 86 });
    expect(JSON.stringify(cert)).not.toContain(learner);
    expect(await db.rpc('get_certificate', { p_code: 'NOPENOPE22' })).toBeNull();
    expect(await db.rpc<unknown[]>('my_certificates', { p_user: learner })).toHaveLength(1);
  });

  it('tabel percobaan dan sertifikat tertutup bagi klien publik', async () => {
    for (const role of ['anon', 'authenticated']) {
      await db.exec(`set role ${role}`);
      try {
        await expect(db.query('select * from certificates')).rejects.toThrow();
        await expect(db.query('select * from level_exam_attempts')).rejects.toThrow();
        await expect(db.query("select get_certificate('CERTB2CODE')")).rejects.toThrow();
      } finally {
        await db.exec('reset role');
      }
    }
  });

  it('kode sertifikat harus 10 karakter huruf besar atau angka 2–9', async () => {
    const other = await newUser(db, 'Budi');
    await expect(db.rpc('record_level_exam', { p_user: other, p_exam: 'exam.level.A1', p_level: 'A1', p_attempt: 0, p_score: 90, p_passed: true, p_sections: [], p_questions: [], p_writing: '', p_code: 'BAD0CODE1O' })).rejects.toThrow();
  });
});
