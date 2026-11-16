// CEFR-style level exam (Rilis 3): four parts drawn from an exam-only bank,
// graded on the server. The bank never reaches a device with its keys:
// `sanitize` strips everything that reveals an answer before questions are
// sent, and `packForClient` removes the bank from the content pack.
import type { ContentIndex, ContentPack, ExamDef, ExamSection, ExamSectionKind, Exercise } from '@/lib/content/types';
import { grade, shuffle, type Answer, type Grade } from './grading';
import { checkWriting, type WritingTask } from './writing';

/** Hours a learner waits after a failed attempt before the next one. */
export const RETAKE_HOURS = 20;

export interface BuiltSection {
  id: string;
  kind: ExamSectionKind;
  title: string;
  passScore: number;
  questions: Exercise[];
  writing?: WritingTask;
}
export interface BuiltExam {
  examId: string;
  seed: string;
  sections: BuiltSection[];
}

export const examSeed = (userId: string, examId: string, attempt: number) => `${userId}:${examId}:${attempt}`;
export const isSectioned = (exam: ExamDef | undefined): exam is ExamDef & { sections: ExamSection[] } => !!exam?.sections?.length;

/** Deterministic: the same seed always gives the same questions in the same order. */
export function buildLevelExam(ix: ContentIndex, exam: ExamDef, seed: string): BuiltExam {
  const sections = (exam.sections ?? []).map((sec): BuiltSection => {
    const base = { id: sec.id, kind: sec.kind, title: sec.title, passScore: sec.passScore };
    if (sec.kind === 'writing') return { ...base, questions: [], writing: shuffle(sec.writing ?? [], `${seed}:${sec.id}`)[0] };
    const groups = shuffle(sec.pool, `${seed}:${sec.id}`).slice(0, sec.take);
    const questions = groups.flat().map((id) => ix.exerciseById.get(id)).filter((e): e is Exercise => !!e);
    // Grammar questions are independent and get shuffled; a passage keeps its questions in order.
    return { ...base, questions: sec.kind === 'grammar' ? shuffle(questions, `${seed}:${sec.id}:order`) : questions };
  });
  return { examId: exam.id, seed, sections };
}

/** What a device may see of an exam question: the task, never the key or the explanation. */
export function sanitize(e: Exercise): Exercise {
  const { answers: _a, errors: _e, hint: _h, focus: _f, wrongWord: _w, correction: _c, ...rest } = e;
  return { ...rest, explanation: '', ...(e.options ? { options: e.options.map((o) => ({ text: o.text })) } : {}) };
}

export interface SectionResult {
  id: string;
  kind: ExamSectionKind;
  title: string;
  score: number;
  correct: number;
  total: number;
  passScore: number;
  passed: boolean;
  /** Writing part: the checklist with each item met or not. */
  checklist?: { label: string; ok: boolean }[];
}
export interface LevelExamResult {
  score: number;
  passed: boolean;
  sections: SectionResult[];
  items: { sectionId: string; ex: Exercise; grade: Grade }[];
  byTopic: { topic: string; correct: number; total: number; score: number }[];
}

/** Each part must reach its own minimum and the average of the parts the exam's pass score. */
export function gradeLevelExam(exam: ExamDef, built: BuiltExam, answers: Record<string, Answer>, writingText: string): LevelExamResult {
  const items: LevelExamResult['items'] = [];
  const sections = built.sections.map((sec): SectionResult => {
    const base = { id: sec.id, kind: sec.kind, title: sec.title, passScore: sec.passScore };
    if (sec.kind === 'writing') {
      const r = sec.writing ? checkWriting(writingText ?? '', sec.writing) : { items: [], score: 0 };
      const ok = r.items.filter((i) => i.ok).length;
      return { ...base, score: r.score, correct: ok, total: r.items.length, passed: r.score >= sec.passScore, checklist: r.items };
    }
    let correct = 0;
    for (const ex of sec.questions) {
      const g = grade(ex, answers[ex.id] ?? { timedOut: true });
      if (g.correct) correct++;
      items.push({ sectionId: sec.id, ex, grade: g });
    }
    const total = sec.questions.length;
    const score = total ? Math.round((correct / total) * 100) : 0;
    return { ...base, score, correct, total, passed: score >= sec.passScore };
  });
  const score = sections.length ? Math.round(sections.reduce((n, s) => n + s.score, 0) / sections.length) : 0;
  const topics = new Map<string, { correct: number; total: number }>();
  for (const it of items) {
    const t = topics.get(it.ex.topic) ?? { correct: 0, total: 0 };
    t.total++;
    if (it.grade.correct) t.correct++;
    topics.set(it.ex.topic, t);
  }
  return {
    score,
    passed: sections.every((s) => s.passed) && score >= exam.passScore,
    sections,
    items,
    byTopic: [...topics].map(([topic, t]) => ({ topic, ...t, score: Math.round((t.correct / t.total) * 100) })),
  };
}

/** Every question id that belongs to a level-exam bank. */
export function bankIds(pack: ContentPack): Set<string> {
  return new Set(pack.exams.flatMap((x) => (x.sections ?? []).flatMap((s) => s.pool.flat())));
}

/** The pack a device receives: no exam bank, and sections reduced to their size. */
export function packForClient(pack: ContentPack): ContentPack {
  const bank = bankIds(pack);
  if (!bank.size) return pack;
  return {
    ...pack,
    exercises: pack.exercises.filter((e) => !bank.has(e.id)),
    exams: pack.exams.map((x) => (x.sections?.length
      ? { ...x, sections: x.sections.map((s) => ({ id: s.id, kind: s.kind, title: s.title, take: s.take, passScore: s.passScore, pool: [], hidden: true, count: s.kind === 'writing' ? 1 : s.pool.slice(0, s.take).reduce((n, g) => n + g.length, 0) })) }
      : x)),
  };
}

/** When the next attempt may start, or null if it may start now. */
export function nextAttemptAt(status: { attempts: number; last_at: string | null; last_passed: boolean | null }): number | null {
  if (!status.attempts || status.last_passed || !status.last_at) return null;
  const at = new Date(status.last_at).getTime() + RETAKE_HOURS * 3600 * 1000;
  return at > Date.now() ? at : null;
}

/** Topics a failed attempt asks the learner to practise before the next one: the two weakest grammar topics that have practice questions. */
export function weakTopics(res: Pick<LevelExamResult, 'byTopic'>, hasPool: (topic: string) => boolean): string[] {
  return res.byTopic.filter((t) => t.score < 60 && !t.topic.startsWith('skill.') && hasPool(t.topic)).sort((a, b) => a.score - b.score).slice(0, 2).map((t) => t.topic);
}

/** Network and clock slack on top of a level exam's own time limit (Rilis 12). */
export const LATE_GRACE_SEC = 120;
/** True when a submission arrives after the time limit plus the grace period. Unknown start: not late. */
export function isLateSubmission(startedAt: number | null, now: number, timeLimitSec: number): boolean {
  return startedAt !== null && now - startedAt > (timeLimitSec + LATE_GRACE_SEC) * 1000;
}
