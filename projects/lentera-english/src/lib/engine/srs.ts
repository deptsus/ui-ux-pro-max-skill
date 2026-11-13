// Spaced repetition scheduler: 1, 3, 7, 14, 30 days, then growing intervals.
// A wrong answer shortens the interval; repeated success lengthens it.
import { LIMITS, SRS } from './config';

export interface ReviewEvent {
  at: number;
  ok: boolean;
  before: number;
  after: number;
}

export interface ReviewItem {
  /** "topic:<id>" or "vocab:<id>". */
  key: string;
  step: number;
  intervalDays: number;
  dueAt: number;
  lapses: number;
  history: ReviewEvent[];
}

const DAY = 86_400_000;

export function firstSchedule(key: string, now: number): ReviewItem {
  return { key, step: 0, intervalDays: SRS.steps[0], dueAt: now + SRS.steps[0] * DAY, lapses: 0, history: [] };
}

export function intervalForStep(step: number, previousDays: number): number {
  if (step < SRS.steps.length) return SRS.steps[step];
  return Math.min(SRS.maxIntervalDays, Math.round(Math.max(previousDays, SRS.steps[SRS.steps.length - 1]) * SRS.growth));
}

export function applyReview(item: ReviewItem, ok: boolean, now: number): ReviewItem {
  const before = item.intervalDays;
  let step: number;
  let intervalDays: number;
  if (ok) {
    step = item.step + 1;
    intervalDays = intervalForStep(step, before);
  } else {
    step = Math.max(0, Math.min(item.step, SRS.steps.length) - SRS.lapseStepBack);
    intervalDays = SRS.steps[step];
  }
  return {
    ...item,
    step,
    intervalDays,
    dueAt: now + intervalDays * DAY,
    lapses: item.lapses + (ok ? 0 : 1),
    history: [...item.history, { at: now, ok, before, after: intervalDays }].slice(-LIMITS.reviewHistoryKept),
  };
}

export function dueItems(reviews: Record<string, ReviewItem>, now: number): ReviewItem[] {
  return Object.values(reviews)
    .filter((r) => r.dueAt <= now)
    .sort((a, b) => a.dueAt - b.dueAt || a.key.localeCompare(b.key));
}

/** Share of reviews answered correctly: the learner's retention rate. */
export function retention(reviews: Record<string, ReviewItem>): { total: number; ok: number; rate: number } {
  let total = 0;
  let ok = 0;
  for (const r of Object.values(reviews)) {
    for (const h of r.history) {
      total += 1;
      if (h.ok) ok += 1;
    }
  }
  return { total, ok, rate: total ? Math.round((ok / total) * 100) : 0 };
}
