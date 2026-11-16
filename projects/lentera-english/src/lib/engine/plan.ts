// Weekly study plan (tahap 4), for every learner since 16 Nov 2026: Premium
// (monthly and yearly) gets the whole path, Free learners and guests only the
// free material at the same weekly pace (Premium items are not shown).
// Deterministic: the plan is the learner's path from their level to C2
// (lessons, unit exams, listening, conversations, level exams) spread evenly
// over the weeks of the plan. Each Monday the week's share is recomputed from
// what is still open, so a learner who falls behind gets a slightly fuller week
// instead of an impossible backlog. Steps after this week's share wait until
// Monday 00:00, in the plan and in Jalur (`planGate`), with a countdown.
import { CEFR_ORDER, type Cefr, type ContentIndex } from '@/lib/content/types';
import { dayKey } from './mastery';
import { dueItems } from './srs';
import { isAdminPlan, isPremium, type Entitlement, type LearnerState } from './types';

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
    const chapters = pack.chapters.filter((c) => c.level === level && !c.planned && !c.track).sort((a, b) => a.position - b.position);
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

/** Whether a step is part of the free material (Free plans list only these). */
export function freeMilestone(ix: ContentIndex, m: Milestone): boolean {
  const { pack } = ix;
  switch (m.kind) {
    case 'lesson': { const l = ix.lessonById.get(m.ref); return !!l && !l.premium && !l.locked; }
    case 'unit-exam':
    case 'level-exam': return pack.exams.some((e) => e.id === m.ref && !e.premium);
    case 'listening': return pack.listening.some((x) => x.id === m.ref && !x.premium && !x.locked);
    case 'story': return (pack.stories ?? []).some((x) => x.id === m.ref && !x.premium && !x.locked);
    case 'conversation': return pack.scenarios.some((x) => x.id === m.ref && !x.premium && !x.locked);
  }
}

export interface PlanWindow {
  /** Monday of week 1. */
  start: number;
  /** When yearly Premium ends; everyone else: 52 weeks after start. */
  end: number;
}

/** Back-to-back 52-week plans counted from `anchor` (a Monday). */
function cycleWindow(anchor: number, now: number): PlanWindow {
  const cycles = Math.max(0, Math.floor((weekStart(now) - anchor) / (PLAN_WEEKS * WEEK)));
  const start = anchor + cycles * PLAN_WEEKS * WEEK;
  return { start, end: start + PLAN_WEEKS * WEEK };
}

/**
 * Plans counted from the learner's own first plan week: Free learners and
 * guests, a single month of Premium (not a month stacked in front of a year),
 * and a class licence ending within a month.
 */
const ownStart = (ent: Entitlement | undefined, now: number) =>
  !isAdminPlan(ent) && (!isPremium(ent, now) || (ent!.plan !== 'premium_yearly' && ent!.expiresAt! - now <= 31 * DAY));

/** A learner whose plan start is not saved yet (the app saves it once, see `useWeekPlan`). */
export const needsPlanStart = (ent: Entitlement | undefined, s: LearnerState, now: number): boolean => ownStart(ent, now) && s.planStart === undefined;

/**
 * Over which weeks the plan runs. Yearly Premium: the Premium year (a monthly
 * period stacked in front of a yearly one still counts as a year). Free, guests
 * and monthly Premium (16 Nov 2026): 52 weeks counted from the Monday the plan
 * first opened, so renewing month by month, or upgrading from Free, keeps the
 * same plan. Admins: 52-week cycles from the account's first week.
 */
export function planWindow(ent: Entitlement | undefined, s: LearnerState, now: number): PlanWindow {
  const created = weekStart(s.createdAt);
  if (isAdminPlan(ent)) return cycleWindow(created, now);
  if (ownStart(ent, now)) return cycleWindow(weekStart(s.planStart ?? now), now);
  const left = ent!.expiresAt! - now;
  // Whole years back from the end date, but never before the account existed.
  const years = Math.max(1, Math.ceil(left / YEAR));
  return { start: Math.max(created, weekStart(ent!.expiresAt! - years * YEAR)), end: ent!.expiresAt! };
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
  /** This week's share is done: the next steps open at `weekEnd` (Monday 00:00). */
  locked: boolean;
  /** Free plan: only the free material (Premium items are left out). */
  free: boolean;
}

export const STUDY_DAYS_GOAL = 4;

export function weekPlan(ix: ContentIndex, s: LearnerState, win: PlanWindow, now: number, { free = false } = {}): WeekPlan {
  let startLevel: Cefr = s.profile.placementDone && s.profile.placementLevel ? s.profile.placementLevel : 'A1';
  const path = planMilestones(ix, startLevel);
  let all = free ? path.filter((m) => freeMilestone(ix, m)) : path;
  // Placed above the free material (A1): the free plan still offers it.
  if (free && !all.length) { startLevel = 'A1'; all = planMilestones(ix, 'A1').filter((m) => freeMilestone(ix, m)); }
  const ws = weekStart(now);
  const totalWeeks = Math.max(1, Math.ceil((win.end - win.start) / WEEK));
  const week = Math.min(totalWeeks, Math.max(1, Math.floor((ws - win.start) / WEEK) + 1));
  const weeksLeft = Math.max(1, totalWeeks - week + 1);
  const stamp = new Map(path.concat(all).map((m) => [m.key, completedAt(s, m)]));
  const openOf = (list: Milestone[]) => list.filter((m) => { const at = stamp.get(m.key); return at === undefined || at >= ws; });

  const openAtMonday = openOf(all);
  // A free plan moves at the same pace as the whole path would (about 3 steps a week).
  const pace = free ? Math.max(1, Math.ceil(openOf(path).length / weeksLeft)) : Math.ceil(openAtMonday.length / weeksLeft);
  const share = openAtMonday.length ? Math.min(openAtMonday.length, pace) : 0;
  const targets = openAtMonday.slice(0, share).map((m) => ({ m, doneAt: stamp.get(m.key) }));
  const bonus = openAtMonday.slice(share).filter((m) => stamp.get(m.key) !== undefined).map((m) => ({ m, doneAt: stamp.get(m.key) }));
  const done = all.filter((m) => stamp.get(m.key) !== undefined).length;

  // Projection: what is still open after this week's share, spread over the remaining weeks.
  const later = openAtMonday.slice(share).filter((m) => stamp.get(m.key) === undefined);
  const upcoming: WeekPlan['upcoming'] = [];
  let rest = later;
  for (let w = week + 1; w <= totalWeeks && rest.length; w++) {
    const even = Math.ceil(rest.length / (totalWeeks - w + 1));
    const n = free ? Math.max(share, even) : even;
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
    pace: all.length - openAtMonday.length - Math.min(all.length, Math.round((path.length * (week - 1)) / totalWeeks)),
    minutes: targets.filter((t) => t.doneAt === undefined).reduce((n, t) => n + t.m.minutes, 0),
    habits, upcoming, finished: all.length > 0 && done === all.length,
    locked: done < all.length && targets.length > 0 && targets.every((t) => t.doneAt !== undefined),
    free,
  };
}

export interface PlanGate {
  /** Steps whose turn comes in a later week (`Milestone.key`), not open before `opensAt`. */
  waiting: Set<string>;
  /** Monday 00:00 of next week. */
  opensAt: number;
}

/** The learner's plan this week, Free or Premium. */
export const learnerPlan = (ix: ContentIndex, s: LearnerState, ent: Entitlement | undefined, now: number): WeekPlan =>
  weekPlan(ix, s, planWindow(ent, s, now), now, { free: !isPremium(ent, now) });

const gates = new WeakMap<ContentIndex, WeakMap<LearnerState, { key: string; gate: PlanGate | null }>>();

/**
 * Jalur follows the weekly plan (16 Nov 2026): a lesson or exam whose turn
 * comes in a later week stays closed until Monday 00:00. Lessons already
 * started stay open. Admins (checking the material), teachers and class
 * licences (the teacher sets the pace) are not held back.
 */
export function planGate(ix: ContentIndex, s: LearnerState, ent: Entitlement | undefined, now: number): PlanGate | null {
  if (ent?.premium && ['admin', 'teacher', 'class'].includes(ent.plan ?? '') && isPremium(ent, now)) return null;
  // Cached per state: the path page asks once per lesson. The key covers what the plan depends on.
  let n = 0;
  for (const k in s.lessons) n += s.lessons[k].completedAt ? 1000 : 1;
  for (const k in s.exams) if (s.exams[k].attempts.some((a) => a.passed)) n += 1_000_000;
  const key = [weekStart(now), isPremium(ent, now), ent?.plan, ent?.expiresAt, s.planStart, s.profile.placementLevel, s.profile.placementDone, n, Object.keys(s.rewards).length, Object.keys(s.conversations).length].join('|');
  let byState = gates.get(ix);
  if (!byState) gates.set(ix, (byState = new WeakMap()));
  const hit = byState.get(s);
  if (hit?.key === key) return hit.gate;
  const plan = learnerPlan(ix, s, ent, now);
  const waiting = new Set(plan.upcoming.flatMap((w) => w.items).filter((m) => !(m.kind === 'lesson' && s.lessons[m.ref])).map((m) => m.key));
  const gate = plan.finished || !waiting.size ? null : { waiting, opensAt: plan.weekEnd };
  byState.set(s, { key, gate });
  return gate;
}

/** "Senin, 23 Nov, 00.00". */
export const openingAt = (at: number) => `${new Date(at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}, 00.00`;

/** Why a step is closed by the plan, with the countdown. */
export const planWaitReason = (opensAt: number, now: number) => `Sesuai rencana mingguan, langkah ini terbuka dalam ${timeLeft(opensAt, now)} lagi (${openingAt(opensAt)}).`;

/** "2 hari 5 jam", "5 jam 20 menit", "40 menit": time left until `at`. */
export function timeLeft(at: number, now: number): string {
  const min = Math.max(1, Math.ceil((at - now) / 60_000));
  const d = Math.floor(min / 1440);
  const h = Math.floor((min % 1440) / 60);
  const m = min % 60;
  if (d > 0) return h > 0 ? `${d} hari ${h} jam` : `${d} hari`;
  if (h > 0) return m > 0 ? `${h} jam ${m} menit` : `${h} jam`;
  return `${m} menit`;
}
