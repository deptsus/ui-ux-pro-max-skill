// Builders for every kind of practice session. Selection is rule-based and
// seeded, so the same learner state always produces the same session.
import type { ContentIndex, Exercise, ExamDef, VocabItem } from '@/lib/content/types';
import { lessonExercises } from '@/lib/content/types';
import { DRILL, MASTERY } from './config';
import { shuffle } from './grading';
import type { ReviewItem } from './srs';
import type { LearnerState } from './types';

/** Mastery test: the lesson's own test items plus re-asked independent items. */
export function buildMasteryTest(ix: ContentIndex, lessonId: string, attempt: number): Exercise[] {
  const own = lessonExercises(ix, lessonId, 'mastery');
  const extra = shuffle(lessonExercises(ix, lessonId, 'independent'), `${lessonId}:m:${attempt}`).slice(0, 2);
  return shuffle([...own, ...extra], `${lessonId}:order:${attempt}`);
}

/** All practice-grade exercises of a topic (never guided ones: those teach). */
export function topicPool(ix: ContentIndex, topicId: string): Exercise[] {
  return ix.pack.exercises.filter((e) => e.topic === topicId && ['independent', 'mastery', 'drill', 'homework'].includes(e.stage));
}

export function tagPool(ix: ContentIndex, tag: string): Exercise[] {
  const topic = ix.tagById.get(tag)?.topic;
  const focused = ix.pack.exercises.filter((e) => e.focus === tag && e.stage !== 'placement');
  if (focused.length >= DRILL.size || !topic) return focused;
  // Top up from the topic so a drill is never trivially short.
  const rest = topicPool(ix, topic).filter((e) => !focused.includes(e));
  return [...focused, ...rest];
}

/**
 * Progressive difficulty ladder. Starts easy; two correct answers in a row
 * step the difficulty up, a wrong answer steps it down. Deterministic.
 */
export function nextLadderItem(pool: Exercise[], history: { id: string; ok: boolean; d: number }[], seed: string): Exercise | null {
  if (history.length >= DRILL.size) return null;
  const used = new Set(history.map((h) => h.id));
  const remaining = pool.filter((e) => !used.has(e.id));
  if (!remaining.length) return null;
  const levels = [...new Set(pool.map((e) => e.difficulty))].sort((a, b) => a - b);
  let idx = 0;
  let streak = 0;
  for (const h of history) {
    if (h.ok) {
      streak += 1;
      if (streak >= DRILL.upAfter) {
        idx = Math.min(levels.length - 1, idx + 1);
        streak = 0;
      }
    } else {
      idx = Math.max(0, idx - 1);
      streak = 0;
    }
  }
  const target = levels[idx];
  const ordered = shuffle(remaining, `${seed}:${history.length}`).sort((a, b) => Math.abs(a.difficulty - target) - Math.abs(b.difficulty - target));
  return ordered[0];
}

/** Delayed retest: fixed size, mixed difficulty, hardest items included. */
export function buildRetest(ix: ContentIndex, topicId: string, seed: string): Exercise[] {
  const pool = shuffle(topicPool(ix, topicId), seed).sort((a, b) => b.difficulty - a.difficulty);
  return shuffle(pool.slice(0, MASTERY.retestSize), seed + ':order');
}

/** Unit / level exam: fixed questions plus a balanced sample of lesson pools. */
export function buildExam(ix: ContentIndex, exam: ExamDef, attempt: number): Exercise[] {
  const fixed = exam.exerciseIds.map((id) => ix.exerciseById.get(id)).filter((e): e is Exercise => !!e);
  const lessons = ix.orderedLessons.filter((l) => {
    if (exam.scope === 'unit') return l.unitId === exam.ref;
    const unit = ix.unitById.get(l.unitId);
    return unit ? ix.chapterById.get(unit.chapterId)?.level === exam.ref : false;
  });
  const seed = `${exam.id}:${attempt}`;
  const perLesson = lessons.map((l) => shuffle([...lessonExercises(ix, l.id, 'mastery'), ...lessonExercises(ix, l.id, 'independent')], seed + l.id));
  const sampled: Exercise[] = [];
  // Round-robin so every lesson is represented equally.
  for (let round = 0; sampled.length < exam.sampleSize && perLesson.some((p) => p[round]); round++) {
    for (const p of perLesson) if (p[round] && sampled.length < exam.sampleSize) sampled.push(p[round]);
  }
  return [...shuffle(sampled, seed + ':order'), ...fixed];
}

export interface ExamResult {
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  byTopic: { topic: string; correct: number; total: number; score: number }[];
}

export function scoreExam(exercises: Exercise[], results: Record<string, boolean>, passScore: number): ExamResult {
  const byTopic = new Map<string, { correct: number; total: number }>();
  let correct = 0;
  for (const e of exercises) {
    const ok = results[e.id] === true;
    if (ok) correct += 1;
    const t = byTopic.get(e.topic) ?? { correct: 0, total: 0 };
    t.total += 1;
    if (ok) t.correct += 1;
    byTopic.set(e.topic, t);
  }
  const total = exercises.length;
  const score = total ? Math.round((correct / total) * 100) : 0;
  return {
    score,
    correct,
    total,
    passed: total > 0 && score >= passScore,
    byTopic: [...byTopic.entries()].map(([topic, v]) => ({ topic, ...v, score: Math.round((v.correct / v.total) * 100) })),
  };
}

/** Vocabulary recall card, built by template from the vocabulary table. */
export function vocabCard(ix: ContentIndex, item: VocabItem, seed: string, reverse = false): Exercise {
  const sameSet = ix.pack.vocabulary.filter((v) => v.id !== item.id && v.pos === item.pos);
  const pool = sameSet.length >= 3 ? sameSet : ix.pack.vocabulary.filter((v) => v.id !== item.id);
  const distractors = shuffle(pool, seed).slice(0, 3);
  const side = (v: VocabItem) => (reverse ? v.word : v.meaning);
  const options = shuffle(
    [
      { text: side(item), correct: true },
      ...distractors.map((v) => ({ text: side(v), why: reverse ? `"${v.word}" berarti "${v.meaning}".` : `"${v.meaning}" adalah arti dari "${v.word}".` })),
    ],
    seed + ':o',
  );
  return {
    id: `vocab:${item.id}`,
    stage: 'drill',
    position: 0,
    type: 'vocab',
    topic: `vocab.${item.set}`,
    difficulty: 1,
    prompt: reverse ? 'Pilih kata bahasa Inggris yang tepat.' : 'Pilih arti yang tepat.',
    text: reverse ? item.meaning : `${item.word}  ${item.ipa}`,
    context: reverse ? undefined : item.example,
    options,
    explanation: `"${item.word}" ${item.ipa} (${item.pos}) berarti "${item.meaning}". Contoh: ${item.example} (${item.exampleId})`,
    audioText: item.word,
    audioKey: item.audioKey,
  };
}

export interface ReviewTask {
  item: ReviewItem;
  exercises: Exercise[];
}

/** One task per due item: a vocab card, or two questions on a grammar topic. */
export function buildReviewTasks(ix: ContentIndex, s: LearnerState, due: ReviewItem[], limit: number, seed: string): ReviewTask[] {
  const tasks: ReviewTask[] = [];
  for (const item of due) {
    if (tasks.length >= limit) break;
    if (item.key.startsWith('vocab:')) {
      const v = ix.vocabById.get(item.key.slice(6));
      if (v) tasks.push({ item, exercises: [vocabCard(ix, v, seed + item.key + item.history.length, item.step % 2 === 1)] });
    } else {
      const topicId = item.key.slice(6);
      const recent = new Set(s.attempts.slice(-40).map((a) => a.ex));
      const pool = shuffle(topicPool(ix, topicId), seed + item.key + item.history.length).sort((a, b) => Number(recent.has(a.id)) - Number(recent.has(b.id)));
      if (pool.length) tasks.push({ item, exercises: pool.slice(0, 2) });
    }
  }
  return tasks;
}

/** Quick-fire round for timed challenges: short choice questions only. */
export function buildTimedRound(ix: ContentIndex, s: LearnerState, seed: string, size = 12): Exercise[] {
  const seen = new Set(Object.keys(s.topics));
  const quick = ix.pack.exercises.filter((e) => ['mc', 'tf', 'vocab', 'dialogue'].includes(e.type) && e.stage !== 'placement' && !e.context && (seen.size === 0 || seen.has(e.topic)));
  const vocab = Object.keys(s.vocabLearned)
    .map((id) => ix.vocabById.get(id))
    .filter((v): v is VocabItem => !!v)
    .map((v) => vocabCard(ix, v, seed + v.id));
  return shuffle([...quick, ...vocab], seed).slice(0, size).map((e) => ({ ...e, timeLimitSec: 12 }));
}
