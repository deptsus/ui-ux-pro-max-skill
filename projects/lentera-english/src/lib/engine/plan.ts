// Weekly study plan for yearly subscribers (tahap 4). Deterministic: the plan
// is the learner's path from their level to C2 (lessons, unit exams, listening,
// conversations, level exams) spread evenly over the weeks left in their
// Premium period. Each Monday the week's share is recomputed from what is still
// open, so a learner who falls behind gets a slightly fuller week instead of an
// impossible backlog, and a learner who works ahead gets lighter weeks.
import { CEFR_ORDER, type Cefr, type ContentIndex } from '@/lib/content/types';
import { dayKey } from './mastery';
import { dueItems } from './srs';
import { isAdminPlan, type Entitlement, type LearnerState } from './types';

const DAY = 24 * 3600 * 1000;
export const WEEK = 7 * DAY;
export const PLAN_WEEKS = 52;
const YEAR = 365 * DAY;

export type MilestoneKind = 'lesson' | 'unit-exam' | 'level-exam' | 'listening' | 'conversation' | 'story';
export interface Milestone {
  /** `${kind}:${ref}`; unique within a plan. */
  key: string;
  kind: MilestoneKind;
  ref: string;
  level: Cefr;
  title: string;
  href: string;
  /** Rough time on task, for the weekly estimate. */
  minutes: number;
}

const MINUTES: Record<MilestoneKind, number> = { lesson: 30, 'unit-exam': 15, 'level-exam': 30, listening: 10, conversation: 10, story: 10 };
const milestone = (kind: MilestoneKind, ref: string, level: Cefr, title: string, href: string): Milestone => ({ key: `${kind}:${ref}`, kind, ref, level, title, href, minutes: MINUTES[kind] });

/** Monday 00:00 local time of the week containing `ms`. */
export function weekStart(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.getTime();
}

/** Splits `items` into `parts` runs of near-equal length (earlier runs get the extra). */
function split<T>(items: T[], parts: number): T[][] {
  const out: T[][] = [];
  let i = 0;
  for (let p = 0; p < parts; p++) {
    const n = Math.ceil((items.length - i) / (parts - p));
    out.push(items.slice(i, i + n));
    i += n;
  }
  return out;
}

/**
 * Index (within `chapterIds`) of the last chapter whose lessons teach a topic
 * that the given questions test, judged by the misconception tags on their
 * answers and their focus tags. Undefined when none of them belongs to these chapters.
 */
export function storyChapter(ix: ContentIndex, questionIds: string[], chapterIds: string[]): number | undefined {
  const chapterOfTopic = new Map<string, number>();
  chapterIds.forEach((cid, ci) => {
    for (const u of ix.pack.units.filter((x) => x.chapterId === cid)) {
      for (const l of ix.pack.lessons.filter((x) => x.unitId === u.id)) chapterOfTopic.set(l.topic, ci);
    }
  });
  let best: number | undefined;
  for (const id of questionIds) {
    const e = ix.exerciseById.get(id);
    if (!e) continue;
    const tags = [e.focus, ...(e.options ?? []).map((o) => o.tag), ...Object.values(e.errors ?? {}).map((x) => x.tag)];
    for (const tag of tags) {
      const ci = tag ? chapterOfTopic.get(ix.tagById.get(tag)?.topic ?? '') : undefined;
      if (ci !== undefined && (best === undefined || ci > best)) best = ci;
    }
  }
  return best;
}

/** The learner's path from `from` to C2, in the order the plan asks for it. */
export function planMilestones(ix: ContentIndex, from: Cefr): Milestone[] {
  const { pack } = ix;
  const out: Milestone[] = [];
  for (const level of CEFR_ORDER.slice(CEFR_ORDER.indexOf(from))) {
    const chapters = pack.chapters.filter((c) => c.level === level && !c.planned).sort((a, b) => a.position - b.position);
    if (!chapters.length) continue;
    // A story comes right after the chapter that teaches the grammar its questions
    // check (found through the misconception tags on its answers), so it never
    // asks about something the learner has not met yet.
    const tales = (pack.stories ?? []).filter((s) => s.level === level);
    const after = new Map<number, Milestone[]>();
    const loose: Milestone[] = [];
    for (const t of tales) {
      // A branching story (Rilis 5) draws on the whole level, so it closes the level.
      const ci = t.branch ? chapters.length - 1 : storyChapter(ix, t.questionIds, chapters.map((c) => c.id));
      const m = milestone('story', t.id, level, t.title, `/app/stories?id=${t.id}`);
      if (ci === undefined) loose.push(m);
      else after.set(ci, [...(after.get(ci) ?? []), m]);
    }
    // Listening and conversation practice (and any story without grammar tags) take turns, spread over the chapters.
    const listening = pack.listening.filter((l) => l.level === level);
    const talks = pack.scenarios.filter((s) => s.level === level);
    const skills: Milestone[] = [];
    for (let i = 0; i < Math.max(listening.length, talks.length, loose.length); i++) {
      if (loose[i]) skills.push(loose[i]);
      if (listening[i]) skills.push(milestone('listening', listening[i].id, level, listening[i].title, `/app/listening?id=${listening[i].id}`));
      if (talks[i]) skills.push(milestone('conversation', talks[i].id, level, talks[i].title, `/app/conversations?id=${talks[i].id}`));
    }
    const skillRuns = split(skills, chapters.length);
    chapters.forEach((c, ci) => {
      for (const u of pack.units.filter((x) => x.chapterId === c.id).sort((a, b) => a.position - b.position)) {
        for (const l of ix.orderedLessons.filter((x) => x.unitId === u.id)) out.push(milestone('lesson', l.id, level, l.title, `/app/lesson?id=${l.id}`));
        const exam = pack.exams.find((e) => e.scope === 'unit' && e.ref === u.id);
        if (exam) out.push(milestone('unit-exam', exam.id, level, exam.title.replace(/^Ujian Unit:\s*/i, ''), `/app/exams?id=${exam.id}`));
      }
      out.push(...(after.get(ci) ?? []), ...skillRuns[ci]);
    });
    const levelExam = pack.exams.find((e) => e.scope === 'level' && e.ref === level);
    if (levelExam) out.push(milestone('level-exam', levelExam.id, level, `Seluruh materi ${level}`, `/app/exams?id=${levelExam.id}`));
  }
  return out;
}

/** When the learner first finished a milestone, if they have. */
export function completedAt(s: LearnerState, m: Milestone): number | undefined {
  switch (m.kind) {
    case 'lesson': return s.lessons[m.ref]?.completedAt;
    case 'unit-exam':
    case 'level-exam': return s.exams[m.ref]?.attempts.find((a) => a.passed)?.at;
    case 'listening': return s.rewards[`listening:${m.ref}`];
    case 'story': return s.rewards[`story:${m.ref}`];
    // Older progress has no first-completion stamp; the last play is the best estimate.
    case 'conversation': return s.rewards[`conversation:${m.ref}`] ?? s.conversations[m.ref]?.lastAt;
  }
}

export interface PlanWindow {
  /** Monday of week 1. */
  start: number;
  /** When Premium ends (admins: 52 weeks after start). */
  end: number;
}

/**
 * The plan belongs to yearly subscribers. A monthly period stacked in front of a
 * yearly one still counts: more than a month of Premium left means a year was bought.
 */
export function planWindow(ent: Entitlement | undefined, s: LearnerState, now: number): PlanWindow | null {
  if (!ent?.premium) return null;
  const created = weekStart(s.createdAt);
  if (isAdminPlan(ent)) {
    const cycles = Math.max(0, Math.floor((weekStart(now) - created) / (PLAN_WEEKS * WEEK)));
    const start = created + cycles * PLAN_WEEKS * WEEK;
    return { start, end: start + PLAN_WEEKS * WEEK };
  }
  if (!ent.expiresAt || ent.expiresAt <= now) return null;
  const left = ent.expiresAt - now;
  if (ent.plan !== 'premium_yearly' && left <= 31 * DAY) return null;
  // Whole years back from the end date, but never before the account existed.
  const years = Math.max(1, Math.ceil(left / YEAR));
  return { start: Math.max(created, weekStart(ent.expiresAt - years * YEAR)), end: ent.expiresAt };
}

export interface PlanTarget {
  m: Milestone;
  doneAt?: number;
}
export interface Habit {
  id: 'days' | 'reviews';
  label: string;
  value: number;
  goal: number;
  done: boolean;
}
export interface WeekPlan {
  week: number;
  totalWeeks: number;
  weekStart: number;
  weekEnd: number;
  startLevel: Cefr;
  /** This week's share, fixed from Monday. */
  targets: PlanTarget[];
  /** Milestones beyond the share that were finished this week. */
  bonus: PlanTarget[];
  total: number;
  done: number;
  /** Finished before this Monday, minus what an even pace would have finished by then. */
  pace: number;
  minutes: number;
  habits: Habit[];
  /** Projection for the coming weeks, from what is still open after this week's share. */
  upcoming: { week: number; weekStart: number; items: Milestone[] }[];
  finished: boolean;
}

export const STUDY_DAYS_GOAL = 4;

export function weekPlan(ix: ContentIndex, s: LearnerState, win: PlanWindow, now: number): WeekPlan {
  const startLevel: Cefr = s.profile.placementDone && s.profile.placementLevel ? s.profile.placementLevel : 'A1';
  const all = planMilestones(ix, startLevel);
  const ws = weekStart(now);
  const totalWeeks = Math.max(1, Math.ceil((win.end - win.start) / WEEK));
  const week = Math.min(totalWeeks, Math.max(1, Math.floor((ws - win.start) / WEEK) + 1));
  const weeksLeft = Math.max(1, totalWeeks - week + 1);
  const stamp = new Map(all.map((m) => [m.key, completedAt(s, m)]));

  const openAtMonday = all.filter((m) => { const at = stamp.get(m.key); return at === undefined || at >= ws; });
  const share = openAtMonday.length ? Math.ceil(openAtMonday.length / weeksLeft) : 0;
  const targets = openAtMonday.slice(0, share).map((m) => ({ m, doneAt: stamp.get(m.key) }));
  const bonus = openAtMonday.slice(share).filter((m) => stamp.get(m.key) !== undefined).map((m) => ({ m, doneAt: stamp.get(m.key) }));
  const done = all.filter((m) => stamp.get(m.key) !== undefined).length;

  // Projection: what is still open after this week's share, spread over the remaining weeks.
  const later = openAtMonday.slice(share).filter((m) => stamp.get(m.key) === undefined);
  const upcoming: WeekPlan['upcoming'] = [];
  let rest = later;
  for (let w = week + 1; w <= totalWeeks && rest.length; w++) {
    const n = Math.ceil(rest.length / (totalWeeks - w + 1));
    upcoming.push({ week: w, weekStart: win.start + (w - 1) * WEEK, items: rest.slice(0, n) });
    rest = rest.slice(n);
  }

  let days = 0;
  for (let d = 0; d < 7; d++) if ((s.daily[dayKey(ws + d * DAY + 12 * 3600 * 1000)]?.exercises ?? 0) > 0) days++;
  const due = dueItems(s.reviews, now).length;
  const habits: Habit[] = [
    { id: 'days', label: `Belajar di ${STUDY_DAYS_GOAL} hari berbeda`, value: days, goal: STUDY_DAYS_GOAL, done: days >= STUDY_DAYS_GOAL },
    { id: 'reviews', label: due ? `Selesaikan ulangan yang jatuh tempo (${due} menunggu)` : 'Ulangan yang jatuh tempo sudah tuntas', value: due ? 0 : 1, goal: 1, done: due === 0 },
  ];

  return {
    week, totalWeeks, weekStart: ws, weekEnd: ws + WEEK, startLevel,
    targets, bonus, total: all.length, done,
    pace: all.length - openAtMonday.length - Math.round((all.length * (week - 1)) / totalWeeks),
    minutes: targets.filter((t) => t.doneAt === undefined).reduce((n, t) => n + t.m.minutes, 0),
    habits, upcoming, finished: all.length > 0 && done === all.length,
  };
}
