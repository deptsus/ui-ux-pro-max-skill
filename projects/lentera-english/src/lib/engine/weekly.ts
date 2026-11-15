// Weekly homework (Rilis 4): every Monday a PR put together by fixed rules,
// no AI. Half of it practises the topics the learner worked on in the past
// seven days, the rest returns to their own recent mistakes: questions they
// last answered wrong, and fresh questions on the error patterns they keep
// making. The questions are chosen once, when the learner first opens the app
// that week, and stored in their progress, so the PR never changes afterwards.
import type { ContentIndex, Exercise, HomeworkDef } from '@/lib/content/types';
import { shuffle } from './grading';
import { dayKey } from './mastery';
import { weekStart } from './plan';
import { tagPool, topicPool } from './sessions';
import type { LearnerState } from './types';

const DAY = 24 * 3600 * 1000;
export const WEEKLY_PREFIX = 'hw.week.';
export const WEEKLY = { size: 10, fromTopics: 6, fromMistakes: 4, retryMissed: 2, minItems: 4, topics: 3, lookbackDays: 7, mistakeDays: 30, minDays: 2 } as const;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
/** Stages whose questions only make sense in their own setting. */
const SKIP = new Set(['exam', 'placement', 'story', 'listening']);

export const weeklyId = (ws: number) => `${WEEKLY_PREFIX}${dayKey(ws)}`;
export const isWeekly = (id: string) => id.startsWith(WEEKLY_PREFIX);

export interface WeeklyDraft {
  id: string;
  title: string;
  assignedAt: number;
  dueAt: number;
  exerciseIds: string[];
  parts: { topics: string[]; fromTopics: number; fromMistakes: number };
}

/** This week's PR for the learner, or null when there is too little recent work to build one. */
export function buildWeekly(ix: ContentIndex, s: LearnerState, now: number): WeeklyDraft | null {
  const ws = weekStart(now);
  const id = weeklyId(ws);
  const seed = `${s.userId}:${id}`;
  const usable = (e: Exercise | undefined): e is Exercise => !!e && !SKIP.has(e.stage);
  const chosen = new Set<string>();

  // Part 2 first, so the learner's own mistakes are never crowded out.
  const since = now - WEEKLY.mistakeDays * DAY;
  const last = new Map<string, { ok: boolean; at: number }>();
  for (const a of s.attempts) if (a.at >= since) last.set(a.ex, { ok: a.ok, at: a.at });
  const mistakes: Exercise[] = [];
  const missed = [...last].filter(([, a]) => !a.ok).sort((a, b) => b[1].at - a[1].at).map(([ex]) => ix.exerciseById.get(ex)).filter(usable);
  for (const e of missed.slice(0, WEEKLY.retryMissed)) { mistakes.push(e); chosen.add(e.id); }
  // Error patterns not cleared by a drill since, most frequent first.
  const tagCount = new Map<string, number>();
  for (const a of s.attempts) {
    if (a.ok || !a.tag || a.at < since || !ix.tagById.has(a.tag)) continue;
    if (a.at <= (s.tags[a.tag]?.clearedAt ?? 0)) continue;
    tagCount.set(a.tag, (tagCount.get(a.tag) ?? 0) + 1);
  }
  const recentIds = new Set(s.attempts.filter((a) => a.at >= now - WEEKLY.lookbackDays * DAY).map((a) => a.ex));
  const pick = (pool: Exercise[], key: string) => {
    const options = shuffle(pool.filter((e) => usable(e) && !chosen.has(e.id)), `${seed}:${key}`);
    return options.find((e) => !recentIds.has(e.id)) ?? options[0];
  };
  for (const [tag] of [...tagCount].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
    if (mistakes.length >= WEEKLY.fromMistakes) break;
    const e = pick(tagPool(ix, tag), tag);
    if (e) { mistakes.push(e); chosen.add(e.id); }
  }

  // Part 1: the topics of the past seven days, by how much they were practised.
  const counts = new Map<string, number>();
  for (const a of s.attempts) {
    if (a.at < now - WEEKLY.lookbackDays * DAY || !ix.topicById.has(a.topic) || a.topic.startsWith('skill.')) continue;
    counts.set(a.topic, (counts.get(a.topic) ?? 0) + 1);
  }
  const topics = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, WEEKLY.topics).map(([t]) => t);
  const fromTopics: Exercise[] = [];
  const room = WEEKLY.size - mistakes.length;
  // Take turns between the topics so each gets its share; stop when the PR is full.
  for (let round = 0; fromTopics.length < room && round < WEEKLY.size; round++) {
    let added = false;
    for (const t of topics) {
      if (fromTopics.length >= room) break;
      const e = pick(topicPool(ix, t), `${t}:${round}`);
      if (e) { fromTopics.push(e); chosen.add(e.id); added = true; }
    }
    if (!added) break;
  }

  const exerciseIds = [...fromTopics, ...mistakes].map((e) => e.id);
  if (exerciseIds.length < WEEKLY.minItems) return null;
  const d = new Date(ws);
  // Sunday 23:59:59 of the same week, but never less than two full days: a PR
  // first put together on Saturday or Sunday is due on Monday or Tuesday night.
  const minDue = new Date(now + WEEKLY.minDays * DAY);
  minDue.setHours(23, 59, 59, 0);
  return {
    id,
    title: `PR Mingguan · ${d.getDate()} ${MONTHS[d.getMonth()]}`,
    assignedAt: now,
    dueAt: Math.max(ws + 7 * DAY - 1000, minDue.getTime()),
    exerciseIds,
    parts: { topics, fromTopics: fromTopics.length, fromMistakes: mistakes.length },
  };
}

/** Gives the learner this week's PR if they have none yet. Returns its id, or null. */
export function ensureWeekly(ix: ContentIndex, s: LearnerState, now: number): string | null {
  const id = weeklyId(weekStart(now));
  if (s.homework[id]) return id;
  const draft = buildWeekly(ix, s, now);
  if (!draft) return null;
  s.homework[id] = { assignedAt: draft.assignedAt, dueAt: draft.dueAt, submissions: [], title: draft.title, exerciseIds: draft.exerciseIds, parts: draft.parts };
  return id;
}

/** Every homework the learner can see: the curriculum's plus generated ones kept in their progress. */
export function allHomework(ix: ContentIndex, s: LearnerState): HomeworkDef[] {
  const generated: HomeworkDef[] = Object.entries(s.homework)
    .filter(([id, r]) => isWeekly(id) && r.exerciseIds?.length)
    .map(([id, r]) => ({ id, chapterId: '', title: r.title ?? 'PR Mingguan', kind: 'grammar', dueDays: 7, exerciseIds: r.exerciseIds!.filter((x) => ix.exerciseById.has(x)) }));
  return [...ix.pack.homework, ...generated];
}
