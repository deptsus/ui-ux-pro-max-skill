// Learner state transitions. Each function mutates a draft copy of the state
// (the store clones before calling), so every rule here is testable in Node.
import type { ContentIndex, Exercise, ExamDef, HomeworkDef, Cefr } from '@/lib/content/types';
import { GAME, LIMITS } from './config';
import type { Grade } from './grading';
import { applyRetest, dayKey, demote, recordTopicAttempt } from './mastery';
import { applyReview, firstSchedule } from './srs';
import { currentHearts, emptyDay, newAchievements, nextStreak } from './gamification';
import type { AttemptContext, DailyStat, LearnerState, SyncEvent } from './types';

export const LESSON_STEPS = ['intro', 'teaching', 'demo', 'guided', 'independent', 'homework', 'mastery', 'review'] as const;
export type LessonStep = (typeof LESSON_STEPS)[number];

export function createState(userId: string, now: number, name = 'Pelajar'): LearnerState {
  return {
    v: 1,
    userId,
    createdAt: now,
    updatedAt: now,
    profile: { name, avatar: 0, dailyGoalXp: 40, accent: 'us', placementDone: false },
    topics: {},
    tags: {},
    lessons: {},
    exams: {},
    homework: {},
    reviews: {},
    attempts: [],
    daily: {},
    xp: 0,
    xpLog: [],
    streak: { current: 0, longest: 0, lastDate: '', freezes: 1 },
    hearts: { count: GAME.hearts.max, at: now },
    achievements: {},
    missions: {},
    rewards: {},
    conversations: {},
    vocabLearned: {},
    outbox: [],
    seq: 0,
  };
}

function emit(s: LearnerState, kind: SyncEvent['kind'], at: number, data: Record<string, unknown>) {
  s.seq += 1;
  s.outbox.push({ id: `${s.userId}:${s.createdAt.toString(36)}:${s.seq}`, kind, at, data });
}

function today(s: LearnerState, at: number): DailyStat {
  const key = dayKey(at);
  s.daily[key] ??= emptyDay();
  return s.daily[key];
}

export function addXp(s: LearnerState, amount: number, reason: string, at: number, ref?: string) {
  if (amount <= 0) return;
  s.xp += amount;
  today(s, at).xp += amount;
  s.xpLog.push({ at, amount, reason, ref });
  if (s.xpLog.length > LIMITS.xpLogKept) s.xpLog = s.xpLog.slice(-LIMITS.xpLogKept);
  emit(s, 'xp', at, { amount, reason, ref });
}

/** Call after every action: streak, achievements, housekeeping. */
export function finalize(s: LearnerState, at: number) {
  s.updatedAt = at;
  for (const id of newAchievements(s)) {
    s.achievements[id] = at;
    emit(s, 'achievement', at, { id });
  }
  const days = Object.keys(s.daily).sort();
  for (const k of days.slice(0, Math.max(0, days.length - LIMITS.dailyKeptDays))) delete s.daily[k];
}

const XP_BY_CTX: Record<AttemptContext, number> = {
  guided: GAME.xp.guidedCorrect,
  independent: GAME.xp.independentCorrect,
  homework: GAME.xp.reviewCorrect,
  mastery: GAME.xp.masteryCorrect,
  drill: GAME.xp.drillCorrect,
  review: GAME.xp.reviewCorrect,
  retest: GAME.xp.drillCorrect,
  listening: GAME.xp.reviewCorrect,
  timed: GAME.xp.timedCorrect,
  exam: 0,
  placement: 0,
};

export interface AttemptMeta {
  ctx: AttemptContext;
  ms: number;
  at: number;
  hint?: boolean;
  premium: boolean;
}

export function recordAttempt(s: LearnerState, ex: Exercise, g: Grade, m: AttemptMeta) {
  s.streak = nextStreak(s.streak, m.at);
  s.attempts.push({ id: `${s.seq + 1}`, at: m.at, ex: ex.id, topic: ex.topic, ok: g.correct, tag: g.tag, ms: m.ms, ctx: m.ctx, d: ex.difficulty, hint: m.hint, given: g.given.slice(0, 120) });
  if (s.attempts.length > LIMITS.attemptsKept) s.attempts = s.attempts.slice(-LIMITS.attemptsKept);

  if (m.ctx !== 'placement') {
    s.topics[ex.topic] = recordTopicAttempt(s.topics[ex.topic], { at: m.at, ok: g.correct, d: ex.difficulty, ms: m.ms, hint: m.hint });
    if (!g.correct && g.tag) {
      const t = (s.tags[g.tag] ??= { wrong: 0, recent: [] });
      t.wrong += 1;
      t.recent = [...t.recent, m.at].slice(-10);
    }
  }
  const d = today(s, m.at);
  d.exercises += 1;
  d.ms += Math.min(m.ms, 120_000);
  if (g.correct) {
    d.correct += 1;
    addXp(s, XP_BY_CTX[m.ctx], m.ctx, m.at, ex.id);
  } else if (!m.premium && (m.ctx === 'independent' || m.ctx === 'mastery')) {
    const h = currentHearts(s.hearts, m.at);
    // Keep the running regeneration timer; start one if hearts were full.
    s.hearts = { count: Math.max(0, h.count - 1), at: h.nextAt ? h.nextAt - GAME.hearts.regenMinutes * 60_000 : m.at };
  }
  emit(s, 'attempt', m.at, { ex: ex.id, topic: ex.topic, ok: g.correct, tag: g.tag ?? null, ms: m.ms, ctx: m.ctx, d: ex.difficulty, hint: !!m.hint, given: g.given.slice(0, 120) });
}

export function refillHeart(s: LearnerState, at: number) {
  const h = currentHearts(s.hearts, at);
  s.hearts = { count: Math.min(GAME.hearts.max, h.count + 1), at };
}

export function lessonProgress(s: LearnerState, lessonId: string, at: number) {
  return (s.lessons[lessonId] ??= { startedAt: at, step: 0, masteryBest: 0, masteryAttempts: 0 });
}

export function reachStep(s: LearnerState, lessonId: string, step: LessonStep, at: number) {
  const p = lessonProgress(s, lessonId, at);
  p.step = Math.max(p.step, LESSON_STEPS.indexOf(step));
}

export function finishPractice(s: LearnerState, lessonId: string, stage: 'guided' | 'independent', scorePct: number, at: number) {
  const p = lessonProgress(s, lessonId, at);
  if (stage === 'guided') p.guidedScore = Math.max(p.guidedScore ?? 0, scorePct);
  else p.independentScore = Math.max(p.independentScore ?? 0, scorePct);
  if (scorePct === 100) today(s, at).perfect += 1;
}

export function assignHomework(s: LearnerState, def: HomeworkDef, at: number) {
  s.homework[def.id] ??= { assignedAt: at, dueAt: at + def.dueDays * 86_400_000, submissions: [] };
}

export function submitHomework(s: LearnerState, def: HomeworkDef, scorePct: number, at: number, text?: string) {
  assignHomework(s, def, at);
  const rec = s.homework[def.id];
  const first = rec.submissions.length === 0;
  rec.submissions.push({ at, score: scorePct, late: at > rec.dueAt, ...(text ? { text: text.slice(0, 2000) } : {}) });
  s.streak = nextStreak(s.streak, at);
  if (first) {
    today(s, at).homework += 1;
    addXp(s, GAME.xp.homeworkComplete, 'homework', at, def.id);
  }
  emit(s, 'homework', at, { id: def.id, score: scorePct, late: at > rec.dueAt });
}

function scheduleReview(s: LearnerState, key: string, at: number) {
  s.reviews[key] ??= firstSchedule(key, at);
}

/** Records a mastery test. Passing completes the lesson and starts its reviews. */
export function finishMastery(s: LearnerState, ix: ContentIndex, lessonId: string, scorePct: number, at: number): { passed: boolean; firstPass: boolean } {
  const lesson = ix.lessonById.get(lessonId);
  const p = lessonProgress(s, lessonId, at);
  p.masteryAttempts += 1;
  p.masteryBest = Math.max(p.masteryBest, scorePct);
  if (scorePct === 100) today(s, at).perfect += 1;
  const passed = !!lesson && scorePct >= lesson.passScore;
  const firstPass = passed && !p.completedAt;
  if (firstPass && lesson) {
    p.completedAt = at;
    p.step = LESSON_STEPS.length - 1;
    today(s, at).lessons += 1;
    addXp(s, GAME.xp.lessonComplete, 'lesson', at, lessonId);
    scheduleReview(s, `topic:${lesson.topic}`, at);
    for (const v of lesson.vocab ?? []) {
      s.vocabLearned[v] ??= at;
      scheduleReview(s, `vocab:${v}`, at);
    }
    checkChapterReward(s, ix, lesson.unitId, at);
  }
  emit(s, 'lesson', at, { id: lessonId, score: scorePct, passed });
  return { passed, firstPass };
}

function checkChapterReward(s: LearnerState, ix: ContentIndex, unitId: string, at: number) {
  const chapterId = ix.unitById.get(unitId)?.chapterId;
  if (!chapterId || s.rewards[`chapter:${chapterId}`]) return;
  const units = ix.pack.units.filter((u) => u.chapterId === chapterId);
  const lessons = ix.pack.lessons.filter((l) => units.some((u) => u.id === l.unitId));
  const allLessons = lessons.length > 0 && lessons.every((l) => s.lessons[l.id]?.completedAt);
  const allExams = ix.pack.exams
    .filter((e) => e.scope === 'unit' && units.some((u) => u.id === e.ref))
    .every((e) => s.exams[e.id]?.attempts.some((a) => a.passed));
  if (allLessons && allExams) {
    s.rewards[`chapter:${chapterId}`] = at;
    s.streak.freezes = Math.min(3, s.streak.freezes + 1);
    addXp(s, GAME.xp.chapterComplete, 'chapter', at, chapterId);
  }
}

export function recordExam(s: LearnerState, ix: ContentIndex, exam: ExamDef, scorePct: number, at: number): boolean {
  const rec = (s.exams[exam.id] ??= { attempts: [] });
  const passed = scorePct >= exam.passScore;
  const firstPass = passed && !rec.attempts.some((a) => a.passed);
  rec.attempts.push({ at, score: scorePct, passed });
  s.streak = nextStreak(s.streak, at);
  if (firstPass) {
    addXp(s, exam.scope === 'level' ? GAME.xp.levelExamPass : GAME.xp.unitExamPass, 'exam', at, exam.id);
    if (exam.scope === 'unit') checkChapterReward(s, ix, exam.ref, at);
  }
  emit(s, 'exam', at, { id: exam.id, score: scorePct, passed });
  return passed;
}

export function reviewResult(s: LearnerState, key: string, ok: boolean, at: number) {
  const item = s.reviews[key] ?? firstSchedule(key, at);
  const before = item.intervalDays;
  s.reviews[key] = applyReview(item, ok, at);
  today(s, at).reviews += 1;
  if (!ok && key.startsWith('topic:')) {
    const id = key.slice(6);
    if (s.topics[id]) s.topics[id] = demote(s.topics[id]);
  }
  emit(s, 'review', at, { key, ok, before, after: s.reviews[key].intervalDays, dueAt: s.reviews[key].dueAt });
}

export function finishDrill(s: LearnerState, tag: string, scorePct: number, at: number): boolean {
  today(s, at).drills += 1;
  if (scorePct === 100) today(s, at).perfect += 1;
  const passed = scorePct >= 85;
  if (passed) {
    const t = (s.tags[tag] ??= { wrong: 0, recent: [] });
    t.recent = [];
    t.clearedAt = at;
  }
  return passed;
}

export function finishRetest(s: LearnerState, topicId: string, scorePct: number, at: number): boolean {
  const before = s.topics[topicId];
  if (!before) return false;
  const after = applyRetest(before, scorePct, at);
  s.topics[topicId] = after;
  const confirmed = after.stage === 'mastered' && before.stage !== 'mastered';
  if (confirmed) {
    addXp(s, GAME.xp.topicMastered, 'mastered', at, topicId);
    scheduleReview(s, `topic:${topicId}`, at);
  }
  return confirmed;
}

export function completeConversation(s: LearnerState, id: string, scorePct: number, at: number) {
  const prev = s.conversations[id];
  s.conversations[id] = { best: Math.max(prev?.best ?? 0, scorePct), plays: (prev?.plays ?? 0) + 1, lastAt: at };
  s.streak = nextStreak(s.streak, at);
  today(s, at).conversations += 1;
  if (!prev) addXp(s, GAME.xp.conversationComplete, 'conversation', at, id);
}

export function learnVocab(s: LearnerState, id: string, at: number) {
  s.vocabLearned[id] ??= at;
  scheduleReview(s, `vocab:${id}`, at);
}

export function setPlacement(s: LearnerState, level: Cefr, at: number) {
  s.profile.placementDone = true;
  s.profile.placementLevel = level;
  s.profile.placementAt = at;
}

export function claimMission(s: LearnerState, key: string, reward: number, at: number) {
  if (s.missions[key]) return;
  s.missions[key] = at;
  addXp(s, reward, 'mission', at, key);
}
