// Level exams (Rilis 3), graded here and never on the device.
//   start:  draws this attempt's questions (the attempt number fixes the draw),
//           and sends them without keys.
//   submit: draws the same questions again, grades the answers, records the
//           attempt and, on the first pass, issues a certificate.
import { randomInt } from 'node:crypto';
import { indexContent, type ExamDef } from '@/lib/content/types';
import type { Answer } from '@/lib/engine/grading';
import { buildLevelExam, examSeed, gradeLevelExam, isLateSubmission, isSectioned, nextAttemptAt, sanitize } from '@/lib/engine/levelExam';
import { HttpError, json, readJson, requireUser, route } from '@/lib/server/api';
import { loadContent } from '@/lib/server/content';
import type { ServerDb } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

interface Body { action?: 'start' | 'submit'; id?: string; attempt?: number; answers?: Record<string, Answer>; writing?: string }
interface Status { attempts: number; last_at: string | null; last_passed: boolean | null; certificate: string | null }

const NEEDS_0009 = 'Ujian level sedang diperbarui. Coba lagi nanti.';
/** When this attempt was first started, recorded on the server (migration 0017); null before 0017. */
async function begun(db: ServerDb, userId: string, examId: string, attempt: number): Promise<number | null> {
  const at = await db.rpc<string | null>('level_exam_begin', { p_user: userId, p_exam: examId, p_attempt: attempt }).catch(() => null);
  const ms = at ? Date.parse(at) : NaN;
  return Number.isFinite(ms) ? ms : null;
}
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newCode = () => Array.from({ length: 10 }, () => CODE_CHARS[randomInt(CODE_CHARS.length)]).join('');

async function status(db: ServerDb, userId: string, examId: string): Promise<Status> {
  try {
    return await db.rpc<Status>('level_exam_status', { p_user: userId, p_exam: examId });
  } catch {
    throw new HttpError(409, NEEDS_0009, 'needs_migration');
  }
}

export const POST = route(async (req) => {
  const { db, userId } = await requireUser(req);
  const b = await readJson<Body>(req, 200_000);
  const content = await loadContent(db);
  const exam = content.full.exams.find((x) => x.id === b.id && x.scope === 'level') as ExamDef | undefined;
  if (!exam || !isSectioned(exam)) throw new HttpError(404, 'Ujian level tidak ditemukan.', 'not_found');
  const account = await db.rpc<{ entitlement: { premium: boolean } }>('get_account', { p_user: userId });
  if (exam.premium && !account.entitlement?.premium) throw new HttpError(403, 'Ujian level termasuk Premium.', 'premium');

  const st = await status(db, userId, exam.id);
  const ix = indexContent(content.full);
  const attempt = Number(st.attempts) || 0;

  if (b.action === 'start') {
    const wait = nextAttemptAt(st);
    if (wait) return json({ error: 'Tunggu jeda sebelum mengulang ujian.', code: 'cooldown', nextAt: wait }, 409);
    const built = buildLevelExam(ix, exam, examSeed(userId, exam.id, attempt));
    // The clock starts at the first start of this attempt and keeps running,
    // even if the learner closes the page or starts again on another device.
    const startedAt = await begun(db, userId, exam.id, attempt);
    return json({
      attempt,
      startedAt,
      timeLimitSec: exam.timeLimitSec,
      certificate: st.certificate,
      sections: built.sections.map((s) => ({
        id: s.id, kind: s.kind, title: s.title, passScore: s.passScore,
        questions: s.questions.map(sanitize),
        ...(s.writing ? { writing: { prompt: s.writing.prompt, minWords: s.writing.minWords } } : {}),
      })),
    });
  }

  if (b.action === 'submit') {
    if (b.attempt !== attempt) throw new HttpError(409, 'Percobaan ini sudah dikumpulkan. Muat ulang halaman ujian.', 'stale_attempt');
    const built = buildLevelExam(ix, exam, examSeed(userId, exam.id, attempt));
    const answers = b.answers && typeof b.answers === 'object' ? b.answers : {};
    const writing = typeof b.writing === 'string' ? b.writing.slice(0, 5000) : '';
    const graded = gradeLevelExam(exam, built, answers, writing);
    const startedAt = await begun(db, userId, exam.id, attempt);
    const late = isLateSubmission(startedAt, Date.now(), exam.timeLimitSec);
    // Answers sent after the time is up are still scored (the learner sees the
    // review) but cannot pass or earn a certificate.
    const result = late ? { ...graded, passed: false } : graded;
    const sections = result.sections.map(({ id, title, score, passScore, passed }) => ({ id, title, score, passScore, passed }));
    let recorded: { id: number; certificate: string | null };
    try {
      recorded = await db.rpc('record_level_exam', {
        p_user: userId, p_exam: exam.id, p_level: exam.ref, p_attempt: attempt, p_score: result.score, p_passed: result.passed,
        p_sections: sections, p_questions: result.items.map((i) => i.ex.id), p_writing: writing, p_code: newCode(),
      });
    } catch (e) {
      if (/stale_attempt|duplicate|unique/i.test(String((e as Error).message))) throw new HttpError(409, 'Percobaan ini sudah dikumpulkan. Muat ulang halaman ujian.', 'stale_attempt');
      throw e;
    }
    return json({
      attempt,
      score: result.score,
      passed: result.passed,
      sections: result.sections,
      byTopic: result.byTopic,
      // After grading the learner sees this attempt's questions with their keys and explanations.
      items: result.items.map((i) => ({ sectionId: i.sectionId, ex: i.ex, grade: i.grade })),
      certificate: recorded.certificate,
      late,
      nextAt: result.passed ? null : Date.now() + 20 * 3600 * 1000,
    });
  }
  throw new HttpError(400, 'Aksi tidak dikenal.');
});
