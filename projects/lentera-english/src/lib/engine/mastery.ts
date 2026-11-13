// Mastery tracking per topic. A topic is never "mastered" from one quiz:
// it needs enough weighted evidence (>= 85) and then a delayed retest.
import { LIMITS, MASTERY } from './config';

export type TopicStage = 'new' | 'learning' | 'practicing' | 'provisional' | 'mastered' | 'needs-review';

export interface TopicEvent {
  at: number;
  ok: boolean;
  d: number;
  ms: number;
  hint?: boolean;
}

export interface TopicStat {
  attempts: number;
  correct: number;
  score: number;
  stage: TopicStage;
  history: TopicEvent[];
  /** Distinct local days with activity on this topic. */
  days: string[];
  provisionalAt?: number;
  retestDueAt?: number;
  masteredAt?: number;
  lastAt?: number;
}

export const emptyTopic = (): TopicStat => ({ attempts: 0, correct: 0, score: 0, stage: 'new', history: [], days: [] });

export function dayKey(ms: number): string {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Weighted, recency-aware accuracy (0-100) over the evidence window. */
export function evidenceScore(history: TopicEvent[]): number {
  const h = history.slice(-MASTERY.window);
  const n = h.length;
  if (n === 0) return 0;
  let sum = 0;
  let total = 0;
  h.forEach((e, i) => {
    const recency = n === 1 ? 1 : MASTERY.oldestRecencyWeight + (1 - MASTERY.oldestRecencyWeight) * (i / (n - 1));
    const w = (MASTERY.difficultyWeight[e.d] ?? 1) * recency;
    let credit = 0;
    if (e.ok) {
      credit = 1;
      if (e.hint) credit = MASTERY.hintCredit;
      else if (e.ms > (MASTERY.expectedMsByDifficulty[e.d] ?? 20000) * MASTERY.slowFactor) credit = MASTERY.slowCredit;
    }
    sum += w * credit;
    total += w;
  });
  return (sum / total) * 100;
}

/** Mastery score: evidence scaled down while there are too few attempts. */
export function masteryScore(history: TopicEvent[]): number {
  const n = Math.min(history.length, MASTERY.window);
  return Math.round(evidenceScore(history) * Math.min(1, n / MASTERY.minAttempts));
}

export function band(score: number) {
  return MASTERY.bands.find((b) => score >= b.min) ?? MASTERY.bands[MASTERY.bands.length - 1];
}

export function recordTopicAttempt(prev: TopicStat | undefined, e: TopicEvent): TopicStat {
  const s: TopicStat = { ...(prev ?? emptyTopic()) };
  s.history = [...s.history, e].slice(-LIMITS.topicHistoryKept);
  s.attempts += 1;
  if (e.ok) s.correct += 1;
  s.lastAt = e.at;
  const day = dayKey(e.at);
  if (!s.days.includes(day)) s.days = [...s.days, day].slice(-10);
  s.score = masteryScore(s.history);

  const enough = s.history.length >= MASTERY.minAttempts;
  if (s.stage === 'mastered') {
    // Confirmed mastery is only revoked by a failed spaced review (see demote()).
    return s;
  }
  if (s.score >= MASTERY.unlockScore && enough) {
    if (s.stage !== 'provisional') {
      s.stage = 'provisional';
      s.provisionalAt = e.at;
      s.retestDueAt = e.at + MASTERY.retestDelayHours * 3600_000;
    }
  } else if (s.stage === 'provisional' && s.score < 70) {
    s.stage = 'practicing';
    s.provisionalAt = undefined;
    s.retestDueAt = undefined;
  } else if (s.stage === 'provisional') {
    // Small dip: keep waiting for the retest.
  } else if (s.stage === 'needs-review') {
    // Stays flagged until the evidence is strong again.
  } else {
    s.stage = s.score >= 70 ? 'practicing' : 'learning';
  }
  return s;
}

export const retestReady = (s: TopicStat | undefined, now: number): boolean =>
  !!s && s.stage === 'provisional' && !!s.retestDueAt && now >= s.retestDueAt;

/** Result of the delayed retest that confirms (or rejects) mastery. */
export function applyRetest(s: TopicStat, scorePct: number, now: number): TopicStat {
  if (!retestReady(s, now)) return s;
  const distinctDays = new Set([...s.days, dayKey(now)]).size;
  if (scorePct >= MASTERY.retestPassScore && distinctDays >= MASTERY.minDistinctDays) {
    return { ...s, stage: 'mastered', masteredAt: now, retestDueAt: undefined };
  }
  if (scorePct >= MASTERY.retestPassScore) {
    // Passed, but all evidence is from one day: ask again later.
    return { ...s, retestDueAt: now + MASTERY.retestDelayHours * 3600_000 };
  }
  return { ...s, stage: 'practicing', provisionalAt: undefined, retestDueAt: undefined };
}

/** A failed spaced review revokes mastery until the topic is re-proven. */
export function demote(s: TopicStat): TopicStat {
  if (s.stage !== 'mastered' && s.stage !== 'provisional') return s;
  return { ...s, stage: 'needs-review', masteredAt: undefined, provisionalAt: undefined, retestDueAt: undefined };
}
