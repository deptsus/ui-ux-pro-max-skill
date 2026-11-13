// Learning analytics derived from the learner state (no tracking service).
import type { ContentIndex } from '@/lib/content/types';
import { emptyDay } from './gamification';
import { band, dayKey } from './mastery';
import { activeTagErrors } from './recommend';
import { retention } from './srs';
import type { LearnerState } from './types';

const DAY = 86_400_000;

export interface DayPoint {
  day: string;
  label: string;
  xp: number;
  exercises: number;
  accuracy: number | null;
  minutes: number;
}

export function dailySeries(s: LearnerState, now: number, days = 14): DayPoint[] {
  const out: DayPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const at = now - i * DAY;
    const key = dayKey(at);
    const d = s.daily[key] ?? emptyDay();
    out.push({
      day: key,
      label: new Date(at).toLocaleDateString('id-ID', { weekday: 'short' }),
      xp: d.xp,
      exercises: d.exercises,
      accuracy: d.exercises ? Math.round((d.correct / d.exercises) * 100) : null,
      minutes: Math.round(d.ms / 60_000),
    });
  }
  return out;
}

export interface TopicRow {
  id: string;
  title: string;
  score: number;
  band: string;
  stage: string;
  attempts: number;
  accuracy: number;
}

export function topicRows(s: LearnerState, ix: ContentIndex): TopicRow[] {
  return Object.entries(s.topics)
    .map(([id, t]) => ({
      id,
      title: ix.topicById.get(id)?.title ?? id,
      score: t.score,
      band: band(t.score).label,
      stage: t.stage,
      attempts: t.attempts,
      accuracy: t.attempts ? Math.round((t.correct / t.attempts) * 100) : 0,
    }))
    .sort((a, b) => a.score - b.score || a.id.localeCompare(b.id));
}

export function overview(s: LearnerState, ix: ContentIndex, now: number) {
  const totals = Object.values(s.daily).reduce(
    (acc, d) => ({ exercises: acc.exercises + d.exercises, correct: acc.correct + d.correct, ms: acc.ms + d.ms }),
    { exercises: 0, correct: 0, ms: 0 },
  );
  const recent = s.attempts.slice(-100);
  const avgMs = recent.length ? Math.round(recent.reduce((n, a) => n + a.ms, 0) / recent.length) : 0;
  const misconceptions = ix.pack.tags
    .map((t) => ({ id: t.id, title: t.title, tip: t.tip, total: s.tags[t.id]?.wrong ?? 0, active: activeTagErrors(s, t.id, now) }))
    .filter((t) => t.total > 0)
    .sort((a, b) => b.active - a.active || b.total - a.total);
  const byContext: Record<string, { total: number; ok: number }> = {};
  for (const a of s.attempts) {
    const c = (byContext[a.ctx] ??= { total: 0, ok: 0 });
    c.total += 1;
    if (a.ok) c.ok += 1;
  }
  return {
    exercises: totals.exercises,
    accuracy: totals.exercises ? Math.round((totals.correct / totals.exercises) * 100) : 0,
    minutes: Math.round(totals.ms / 60_000),
    avgResponseSec: Math.round(avgMs / 100) / 10,
    lessonsCompleted: Object.values(s.lessons).filter((l) => l.completedAt).length,
    topicsMastered: Object.values(s.topics).filter((t) => t.stage === 'mastered').length,
    topicsProvisional: Object.values(s.topics).filter((t) => t.stage === 'provisional').length,
    retention: retention(s.reviews),
    misconceptions,
    byContext,
  };
}
