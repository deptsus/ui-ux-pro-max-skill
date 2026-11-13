import { describe, expect, it } from 'vitest';
import { buildPack } from '@content/index';
import { indexContent, lessonExercises, type Exercise } from '@/lib/content/types';
import { validatePack } from '@/lib/content/validate';
import { grade, normalize, type Answer } from '@/lib/engine/grading';
import { applyRetest, masteryScore, recordTopicAttempt, retestReady, type TopicStat } from '@/lib/engine/mastery';
import { applyReview, dueItems, firstSchedule } from '@/lib/engine/srs';
import { createState, finalize, finishDrill, finishMastery, finishRetest, recordAttempt, recordExam, reviewResult, setPlacement } from '@/lib/engine/state';
import { recommend } from '@/lib/engine/recommend';
import { lessonLock, unitExamStatus } from '@/lib/engine/unlock';
import { buildExam, buildMasteryTest, buildRetest, nextLadderItem, scoreExam, tagPool } from '@/lib/engine/sessions';
import { placementBlocks, placementProgress } from '@/lib/engine/placement';
import { currentHearts, liveStreak, nextStreak } from '@/lib/engine/gamification';
import { FREE, isPremium, type Entitlement, type LearnerState } from '@/lib/engine/types';

const pack = buildPack();
const ix = indexContent(pack);
const DAY = 86_400_000;
const T0 = new Date('2026-11-02T03:00:00Z').getTime();
const PREMIUM: Entitlement = { premium: true, plan: 'monthly', expiresAt: T0 + 400 * DAY };

/** The correct answer for any exercise, derived from its key. */
function rightAnswer(e: Exercise): Answer {
  if (e.options) return { choice: e.options.findIndex((o) => o.correct) };
  if (e.type === 'spot') return { wordIndex: (e.text ?? '').split(' ').findIndex((w) => w.replace(/[.,!?;:"]/g, '') === e.wrongWord) };
  if (e.type === 'match') return { mistakes: 0 };
  if (e.type === 'para') return { order: (e.sentences ?? []).map((_, i) => i) };
  return { text: e.answers![0] };
}
function wrongAnswer(e: Exercise): Answer {
  if (e.options) return { choice: e.options.findIndex((o) => !o.correct) };
  if (e.type === 'spot') return { wordIndex: (e.text ?? '').split(' ').findIndex((w) => w.replace(/[.,!?;:"]/g, '') !== e.wrongWord) };
  if (e.type === 'match') return { mistakes: 2 };
  if (e.type === 'para') return { order: (e.sentences ?? []).map((_, i) => i).reverse() };
  return { text: Object.keys(e.errors ?? {})[0] ?? 'zzz' };
}
function answer(s: LearnerState, e: Exercise, ok: boolean, at: number, ctx: Parameters<typeof recordAttempt>[3]['ctx'] = 'independent', premium = true) {
  const g = grade(e, ok ? rightAnswer(e) : wrongAnswer(e));
  expect(g.correct).toBe(ok);
  recordAttempt(s, e, g, { ctx, ms: 8000, at, premium });
  finalize(s, at);
  return g;
}
function passLesson(s: LearnerState, lessonId: string, at: number) {
  for (const stage of ['guided', 'independent'] as const) for (const e of lessonExercises(ix, lessonId, stage)) answer(s, e, true, at, stage);
  for (const e of buildMasteryTest(ix, lessonId, 1)) answer(s, e, true, at, 'mastery');
  return finishMastery(s, ix, lessonId, 100, at);
}

describe('content quality gate', () => {
  it('every exercise has a key, an explanation and a reason for each wrong option', () => {
    expect(validatePack(pack)).toEqual([]);
  });
  it('every exercise is gradable: the key passes and a wrong answer fails with feedback', () => {
    for (const e of pack.exercises) {
      expect(grade(e, rightAnswer(e)).correct, e.id).toBe(true);
      const bad = grade(e, wrongAnswer(e));
      expect(bad.correct, e.id).toBe(false);
      expect(bad.feedback.length, e.id).toBeGreaterThan(5);
      expect(bad.explanation.length, e.id).toBeGreaterThan(5);
      expect(bad.correctAnswer.length, e.id).toBeGreaterThan(0);
    }
  });
  it('covers all 14 exercise types and has unique vocabulary ids', () => {
    expect(new Set(pack.exercises.map((e) => e.type)).size).toBe(14);
    expect(new Set(pack.vocabulary.map((v) => v.id)).size).toBe(pack.vocabulary.length);
  });
  it('every CEFR level has at least one fully authored lesson', () => {
    for (const lv of pack.levels) {
      const lessons = ix.orderedLessons.filter((l) => ix.chapterById.get(ix.unitById.get(l.unitId)!.chapterId)!.level === lv.code);
      expect(lessons.length, lv.code).toBeGreaterThan(0);
    }
  });
});

describe('grading', () => {
  const typed = (answers: string[], errors?: Exercise['errors'], focus?: string): Exercise => ({ id: 't', stage: 'drill', position: 0, type: 'translate', topic: 'a2.past-be', focus, difficulty: 2, prompt: 'p', explanation: 'e', answers, errors });
  it('normalizes case, punctuation and contractions', () => {
    expect(normalize("  I'm NOT tired! ")).toBe('i am not tired');
    expect(normalize("She doesn’t like it.")).toBe('she does not like it');
    expect(grade(typed(['I am not tired']), { text: "i'm not tired." }).correct).toBe(true);
  });
  it('detects the was/were confusion without an authored error entry', () => {
    const g = grade(typed(['I was sick yesterday']), { text: 'I were sick yesterday' });
    expect(g.correct).toBe(false);
    expect(g.tag).toBe('was-were');
    expect(g.feedback).toContain('were');
  });
  it('uses authored feedback for known wrong answers', () => {
    const g = grade(typed(['She is busy'], { 'she busy': { why: 'Belum ada to be.', tag: 'be-missing' } }), { text: 'She busy' });
    expect(g.feedback).toBe('Belum ada to be.');
    expect(g.tag).toBe('be-missing');
  });
  it('explains a timeout instead of just marking it wrong', () => {
    const mcq = pack.exercises.find((e) => e.type === 'mc')!;
    expect(grade(mcq, { timedOut: true }).feedback).toContain('Waktu habis');
  });
});

describe('mastery', () => {
  const ev = (ok: boolean, at: number, d = 2) => ({ at, ok, d, ms: 8000 });
  it('never grants mastery from a single perfect quiz', () => {
    let s: TopicStat | undefined;
    for (let i = 0; i < 5; i++) s = recordTopicAttempt(s, ev(true, T0 + i));
    expect(s!.score).toBeLessThan(85);
    expect(s!.stage).not.toBe('provisional');
    expect(s!.stage).not.toBe('mastered');
  });
  it('needs >=85 over enough attempts, then a delayed retest on another day', () => {
    let s: TopicStat | undefined;
    for (let i = 0; i < 8; i++) s = recordTopicAttempt(s, ev(true, T0 + i));
    expect(s!.stage).toBe('provisional');
    expect(retestReady(s, T0 + 3600_000)).toBe(false);
    expect(applyRetest(s!, 100, T0 + 3600_000).stage).toBe('provisional');
    const later = T0 + DAY + 1000;
    expect(retestReady(s, later)).toBe(true);
    expect(applyRetest(s!, 71, later).stage).toBe('practicing');
    expect(applyRetest(s!, 86, later).stage).toBe('mastered');
  });
  it('weights recent and harder questions more', () => {
    const improving = [ev(false, 1), ev(false, 2), ev(true, 3), ev(true, 4), ev(true, 5), ev(true, 6), ev(true, 7), ev(true, 8)];
    const declining = [...improving].reverse().map((e, i) => ({ ...e, at: i }));
    expect(masteryScore(improving)).toBeGreaterThan(masteryScore(declining));
    const hardRight = [ev(true, 1, 5), ev(false, 2, 1)];
    const easyRight = [ev(false, 1, 5), ev(true, 2, 1)];
    expect(masteryScore(hardRight)).toBeGreaterThan(masteryScore(easyRight) - 30);
  });
  it('gives only partial credit when a hint was used', () => {
    const plain = Array.from({ length: 8 }, (_, i) => ev(true, i));
    const hinted = plain.map((e) => ({ ...e, hint: true }));
    expect(masteryScore(plain)).toBe(100);
    expect(masteryScore(hinted)).toBe(50);
  });
});

describe('spaced repetition', () => {
  it('follows 1, 3, 7, 14, 30 days and keeps growing', () => {
    let item = firstSchedule('topic:x', T0);
    const seen = [item.intervalDays];
    for (let i = 0; i < 6; i++) {
      item = applyReview(item, true, item.dueAt);
      seen.push(item.intervalDays);
    }
    expect(seen).toEqual([1, 3, 7, 14, 30, 45, 68]);
  });
  it('shortens the interval after a wrong answer and records history', () => {
    let item = firstSchedule('vocab:y', T0);
    for (let i = 0; i < 3; i++) item = applyReview(item, true, item.dueAt);
    expect(item.intervalDays).toBe(14);
    item = applyReview(item, false, item.dueAt);
    expect(item.intervalDays).toBe(3);
    expect(item.lapses).toBe(1);
    expect(item.history.at(-1)).toMatchObject({ ok: false, before: 14, after: 3 });
  });
  it('lists due items oldest first', () => {
    const a = firstSchedule('a', T0);
    const b = firstSchedule('b', T0 - DAY);
    expect(dueItems({ a, b }, T0 + 2 * DAY).map((r) => r.key)).toEqual(['b', 'a']);
    expect(dueItems({ a, b }, T0)).toHaveLength(1);
  });
});

describe('adaptive recommendations (Student A: knows present, struggles with was/were)', () => {
  const s = createState('student-a', T0);
  setPlacement(s, 'A2', T0);
  // Simple present goes well.
  for (const e of lessonExercises(ix, 'a1-simple-present', 'independent')) answer(s, e, true, T0);
  // Simple past: repeatedly confuses was and were.
  const pastBe = [...lessonExercises(ix, 'a2-past-be', 'guided'), ...lessonExercises(ix, 'a2-past-be', 'independent')].filter((e) => e.focus === 'was-were');
  for (const e of pastBe.slice(0, 5)) answer(s, e, false, T0 + 1000);

  it('identifies the weak topic and the exact misconception', () => {
    expect(s.tags['was-were'].wrong).toBeGreaterThanOrEqual(3);
    const recs = recommend(s, ix, PREMIUM, T0 + 2000);
    expect(recs[0].id).toBe('tag:was-were');
    expect(recs[0].reason).toContain('keliru');
    expect(recs.some((r) => r.id === 'revise:a2.past-be')).toBe(true);
    expect(recs.find((r) => r.id === 'revise:a2.past-be')!.href).toContain('a2-past-be');
    expect(recs.some((r) => r.id.includes('a1.simple-present') && r.kind !== 'lesson')).toBe(false);
  });
  it('serves extra was/were items with progressively harder questions', () => {
    const pool = tagPool(ix, 'was-were');
    expect(pool.length).toBeGreaterThanOrEqual(8);
    const history: { id: string; ok: boolean; d: number }[] = [];
    const difficulties: number[] = [];
    for (let i = 0; i < 8; i++) {
      const next = nextLadderItem(pool, history, 'seed')!;
      difficulties.push(next.difficulty);
      history.push({ id: next.id, ok: true, d: next.difficulty });
    }
    expect(difficulties[0]).toBe(1);
    expect(Math.max(...difficulties)).toBeGreaterThanOrEqual(3);
    expect(difficulties.at(-1)!).toBeGreaterThan(difficulties[0]);
    expect(nextLadderItem(pool, history, 'seed')).toBeNull();
    // A wrong answer steps the ladder back down.
    const down = nextLadderItem(pool, [{ id: 'a', ok: true, d: 1 }, { id: 'b', ok: true, d: 1 }, { id: 'c', ok: false, d: 2 }], 'seed')!;
    expect(down.difficulty).toBe(1);
  });
  it('clears the misconception only after a passed drill, then asks for a retest', () => {
    expect(finishDrill(s, 'was-were', 60, T0 + 3000)).toBe(false);
    expect(recommend(s, ix, PREMIUM, T0 + 3000)[0].id).toBe('tag:was-were');
    expect(finishDrill(s, 'was-were', 88, T0 + 4000)).toBe(true);
    expect(recommend(s, ix, PREMIUM, T0 + 5000).some((r) => r.id === 'tag:was-were')).toBe(false);

    // Strong follow-up practice makes the topic provisional, not mastered.
    const pool = tagPool(ix, 'was-were');
    for (let round = 0; round < 3; round++) for (const e of pool) answer(s, e, true, T0 + 6000 + round);
    expect(s.topics['a2.past-be'].stage).toBe('provisional');
    expect(recommend(s, ix, PREMIUM, T0 + 7000).some((r) => r.kind === 'retest')).toBe(false);
    const nextDay = T0 + DAY + 10_000;
    expect(recommend(s, ix, PREMIUM, nextDay).some((r) => r.id === 'retest:a2.past-be')).toBe(true);
    expect(buildRetest(ix, 'a2.past-be', 'x')).toHaveLength(7);
    expect(finishRetest(s, 'a2.past-be', 100, nextDay)).toBe(true);
    expect(s.topics['a2.past-be'].stage).toBe('mastered');
    expect(s.reviews['topic:a2.past-be']).toBeDefined();
  });
  it('revokes mastery when a later spaced review fails', () => {
    reviewResult(s, 'topic:a2.past-be', false, T0 + 3 * DAY);
    expect(s.topics['a2.past-be'].stage).toBe('needs-review');
    expect(recommend(s, ix, PREMIUM, T0 + 3 * DAY).some((r) => r.id === 'revise:a2.past-be')).toBe(true);
  });
});

describe('unlock rules', () => {
  it('locks the next lesson until the mastery test is passed with >=85', () => {
    const s = createState('u', T0);
    const [l1, l2] = ix.orderedLessons;
    expect(lessonLock(s, ix, l1, FREE, T0).status).toBe('available');
    expect(lessonLock(s, ix, l2, FREE, T0).status).toBe('locked');
    expect(finishMastery(s, ix, l1.id, 71, T0).passed).toBe(false);
    expect(lessonLock(s, ix, l2, FREE, T0).status).toBe('locked');
    expect(finishMastery(s, ix, l1.id, 86, T0).passed).toBe(true);
    expect(lessonLock(s, ix, l2, FREE, T0).status).toBe('available');
    expect(s.reviews['topic:a1.greetings'].intervalDays).toBe(1);
  });
  it('requires the unit exam before the next unit', () => {
    const s = createState('u2', T0);
    for (const id of ['a1-greetings', 'a1-to-be', 'a1-to-be-neg-q']) passLesson(s, id, T0);
    const articles = ix.lessonById.get('a1-articles')!;
    expect(unitExamStatus(s, ix, 'a1-c1-u1')).toBe('available');
    expect(lessonLock(s, ix, articles, FREE, T0).status).toBe('locked');
    const exam = pack.exams.find((e) => e.ref === 'a1-c1-u1')!;
    expect(recordExam(s, ix, exam, 75, T0)).toBe(false);
    expect(lessonLock(s, ix, articles, FREE, T0).status).toBe('locked');
    expect(recordExam(s, ix, exam, 80, T0)).toBe(true);
    expect(lessonLock(s, ix, articles, FREE, T0).status).toBe('available');
  });
  it('keeps premium lessons locked for free and expired accounts', () => {
    const s = createState('u3', T0);
    setPlacement(s, 'A2', T0);
    const past = ix.lessonById.get('a2-past-be')!;
    expect(lessonLock(s, ix, past, FREE, T0).status).toBe('premium');
    expect(lessonLock(s, ix, past, PREMIUM, T0).status).toBe('available');
    const expired: Entitlement = { premium: true, plan: 'monthly', expiresAt: T0 - 1 };
    expect(isPremium(expired, T0)).toBe(false);
    expect(lessonLock(s, ix, past, expired, T0).status).toBe('premium');
  });
  it('placement opens the placed level but not the levels above it', () => {
    const s = createState('u4', T0);
    setPlacement(s, 'B1', T0);
    expect(lessonLock(s, ix, ix.lessonById.get('b1-present-perfect')!, PREMIUM, T0).status).toBe('available');
    expect(lessonLock(s, ix, ix.lessonById.get('a1-do-does')!, PREMIUM, T0).status).toBe('available');
    expect(lessonLock(s, ix, ix.lessonById.get('b2-passive')!, PREMIUM, T0).status).toBe('locked');
  });
});

describe('exams and placement', () => {
  it('builds a balanced, reproducible unit exam and scores it correctly', () => {
    const exam = pack.exams.find((e) => e.ref === 'a1-c1-u1')!;
    const a = buildExam(ix, exam, 1);
    expect(a).toHaveLength(12);
    expect(buildExam(ix, exam, 1).map((e) => e.id)).toEqual(a.map((e) => e.id));
    expect(buildExam(ix, exam, 2).map((e) => e.id)).not.toEqual(a.map((e) => e.id));
    expect(new Set(a.map((e) => e.lessonId)).size).toBe(3);
    const results = Object.fromEntries(a.map((e, i) => [e.id, i < 9]));
    const r = scoreExam(a, results, exam.passScore);
    expect(r).toMatchObject({ correct: 9, total: 12, score: 75, passed: false });
    expect(r.byTopic.reduce((n, t) => n + t.total, 0)).toBe(12);
    results[a[9].id] = true;
    expect(scoreExam(a, results, exam.passScore)).toMatchObject({ score: 83, passed: true });
  });
  it('places a learner at the first level they do not pass and stops there', () => {
    const blocks = placementBlocks(pack.exercises);
    expect(blocks.map((b) => b.level)).toEqual(['A1', 'A2', 'B1', 'B2', 'C1']);
    const results: Record<string, boolean> = {};
    for (const e of blocks[0].exercises) results[e.id] = true;
    blocks[1].exercises.forEach((e, i) => (results[e.id] = i < 2));
    const p = placementProgress(blocks, results);
    expect(p).toMatchObject({ done: true, level: 'A2', next: null });
    const all: Record<string, boolean> = {};
    for (const b of blocks) for (const e of b.exercises) all[e.id] = true;
    expect(placementProgress(blocks, all).level).toBe('C2');
    expect(placementProgress(blocks, {}).next?.level).toBe('A1');
  });
});

describe('gamification', () => {
  it('counts streaks by calendar day and uses a freeze for one missed day', () => {
    let st = { current: 0, longest: 0, lastDate: '', freezes: 1 };
    st = nextStreak(st, T0);
    st = nextStreak(st, T0 + 1000);
    expect(st.current).toBe(1);
    st = nextStreak(st, T0 + DAY);
    expect(st.current).toBe(2);
    st = nextStreak(st, T0 + 3 * DAY);
    expect(st).toMatchObject({ current: 3, freezes: 0 });
    expect(liveStreak(st, T0 + 6 * DAY)).toBe(0);
    expect(nextStreak(st, T0 + 6 * DAY).current).toBe(1);
  });
  it('takes a heart only for mistakes in independent work of free learners', () => {
    const s = createState('h', T0);
    const e = lessonExercises(ix, 'a1-to-be', 'independent')[0];
    answer(s, e, false, T0, 'guided', false);
    expect(currentHearts(s.hearts, T0).count).toBe(5);
    answer(s, e, false, T0, 'independent', false);
    answer(s, e, false, T0, 'independent', false);
    expect(currentHearts(s.hearts, T0).count).toBe(3);
    expect(currentHearts(s.hearts, T0 + 61 * 60_000).count).toBe(4);
    answer(s, e, false, T0, 'independent', true);
    expect(currentHearts(s.hearts, T0).count).toBe(3);
  });
  it('awards XP, queues sync events and unlocks achievements', () => {
    const s = createState('g', T0);
    const r = passLesson(s, 'a1-greetings', T0);
    finalize(s, T0);
    expect(r).toEqual({ passed: true, firstPass: true });
    expect(s.xp).toBeGreaterThan(40);
    expect(s.achievements['first-lesson']).toBe(T0);
    expect(s.achievements['perfect-test']).toBe(T0);
    expect(s.outbox.some((e) => e.kind === 'lesson')).toBe(true);
    expect(new Set(s.outbox.map((e) => e.id)).size).toBe(s.outbox.length);
    expect(Object.keys(s.reviews)).toContain('vocab:hello');
  });
});
