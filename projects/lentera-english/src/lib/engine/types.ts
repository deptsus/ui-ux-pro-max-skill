import type { Cefr } from '@/lib/content/types';
import type { TopicStat } from './mastery';
import type { ReviewItem } from './srs';

export type AttemptContext = 'guided' | 'independent' | 'homework' | 'mastery' | 'drill' | 'review' | 'retest' | 'exam' | 'placement' | 'timed' | 'listening';

export interface AttemptLog {
  id: string;
  at: number;
  ex: string;
  topic: string;
  ok: boolean;
  tag?: string;
  ms: number;
  ctx: AttemptContext;
  d: number;
  hint?: boolean;
  given: string;
}

export interface LessonProgress {
  startedAt: number;
  /** Furthest lesson step reached (index into LESSON_STEPS). */
  step: number;
  guidedScore?: number;
  independentScore?: number;
  masteryBest: number;
  masteryAttempts: number;
  completedAt?: number;
}

export interface ExamRecord {
  attempts: { at: number; score: number; passed: boolean }[];
}

export interface HomeworkRecord {
  assignedAt: number;
  dueAt: number;
  submissions: { at: number; score: number; late: boolean; text?: string }[];
}

export interface DailyStat {
  xp: number;
  exercises: number;
  correct: number;
  ms: number;
  lessons: number;
  reviews: number;
  drills: number;
  perfect: number;
  conversations: number;
  homework: number;
}

export interface TagStat {
  wrong: number;
  /** Timestamps of recent errors (newest last). */
  recent: number[];
  /** Last time a targeted drill on this tag was passed. */
  clearedAt?: number;
}

export interface SyncEvent {
  id: string;
  kind: 'attempt' | 'xp' | 'review' | 'lesson' | 'exam' | 'homework' | 'achievement';
  at: number;
  data: Record<string, unknown>;
}

export interface Profile {
  name: string;
  avatar: number;
  dailyGoalXp: number;
  accent: 'us' | 'uk';
  placementDone: boolean;
  placementLevel?: Cefr;
  placementAt?: number;
}

export interface LearnerState {
  v: 1;
  userId: string;
  createdAt: number;
  updatedAt: number;
  profile: Profile;
  topics: Record<string, TopicStat>;
  tags: Record<string, TagStat>;
  lessons: Record<string, LessonProgress>;
  exams: Record<string, ExamRecord>;
  homework: Record<string, HomeworkRecord>;
  reviews: Record<string, ReviewItem>;
  attempts: AttemptLog[];
  daily: Record<string, DailyStat>;
  xp: number;
  xpLog: { at: number; amount: number; reason: string; ref?: string }[];
  streak: { current: number; longest: number; lastDate: string; freezes: number };
  hearts: { count: number; at: number };
  achievements: Record<string, number>;
  missions: Record<string, number>;
  rewards: Record<string, number>;
  conversations: Record<string, { best: number; plays: number; lastAt: number }>;
  vocabLearned: Record<string, number>;
  outbox: SyncEvent[];
  seq: number;
}

export interface Entitlement {
  premium: boolean;
  /** 'admin' = free Premium for admins, with no end date (see 0007 migration). */
  plan?: string;
  /** Epoch ms when premium ends. Absent for plan 'admin'. */
  expiresAt?: number;
}

export const FREE: Entitlement = { premium: false };

/** Admin Premium has no end date; it ends when the server stops reporting it. */
export const isAdminPlan = (e: Entitlement | undefined): boolean => !!e && e.premium && e.plan === 'admin';

/** Premium is always time-checked, so an expired period is Free offline too. */
export const isPremium = (e: Entitlement | undefined, now: number): boolean =>
  !!e && e.premium && (isAdminPlan(e) || (!!e.expiresAt && e.expiresAt > now));
