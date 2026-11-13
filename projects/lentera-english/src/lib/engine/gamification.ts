// XP, streaks, hearts, missions, achievements. All rules are plain functions
// of the learner state, so the game layer always reflects real learning.
import { GAME } from './config';
import { dayKey } from './mastery';
import { rng } from './grading';
import type { DailyStat, LearnerState } from './types';

const DAY = 86_400_000;
export const emptyDay = (): DailyStat => ({ xp: 0, exercises: 0, correct: 0, ms: 0, lessons: 0, reviews: 0, drills: 0, perfect: 0, conversations: 0, homework: 0 });

export function playerLevel(xp: number): { level: number; into: number; need: number } {
  let level = 1;
  let floor = 0;
  let need = 100;
  while (xp >= floor + need) {
    floor += need;
    level += 1;
    need = 100 + (level - 1) * 50;
  }
  return { level, into: xp - floor, need };
}

export function nextStreak(streak: LearnerState['streak'], now: number): LearnerState['streak'] {
  const today = dayKey(now);
  if (streak.lastDate === today) return streak;
  const yesterday = dayKey(now - DAY);
  const twoAgo = dayKey(now - 2 * DAY);
  let current = 1;
  let freezes = streak.freezes;
  if (streak.lastDate === yesterday) current = streak.current + 1;
  else if (streak.lastDate === twoAgo && freezes > 0) {
    current = streak.current + 1;
    freezes -= 1;
  }
  return { current, longest: Math.max(streak.longest, current), lastDate: today, freezes };
}

/** Streak as displayed: it is already broken if yesterday was missed. */
export function liveStreak(streak: LearnerState['streak'], now: number): number {
  if (streak.lastDate === dayKey(now) || streak.lastDate === dayKey(now - DAY)) return streak.current;
  if (streak.lastDate === dayKey(now - 2 * DAY) && streak.freezes > 0) return streak.current;
  return 0;
}

export function currentHearts(hearts: LearnerState['hearts'], now: number): { count: number; nextAt?: number } {
  const regenMs = GAME.hearts.regenMinutes * 60_000;
  if (hearts.count >= GAME.hearts.max) return { count: GAME.hearts.max };
  const gained = Math.floor((now - hearts.at) / regenMs);
  const count = Math.min(GAME.hearts.max, hearts.count + gained);
  return count >= GAME.hearts.max ? { count } : { count, nextAt: hearts.at + (gained + 1) * regenMs };
}

export function weekKey(ms: number): string {
  const d = new Date(ms);
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
  return dayKey(monday.getTime());
}

export function weekStats(state: LearnerState, now: number): DailyStat {
  const start = new Date(weekKey(now) + 'T00:00:00').getTime();
  const total = emptyDay();
  for (let i = 0; i < 7; i++) {
    const day = state.daily[dayKey(start + i * DAY + DAY / 2)];
    if (!day) continue;
    for (const k of Object.keys(total) as (keyof DailyStat)[]) total[k] += day[k];
  }
  return total;
}

export interface Mission {
  id: string;
  period: 'daily' | 'weekly';
  title: string;
  target: number;
  reward: number;
  metric: (s: DailyStat, state: LearnerState, now: number) => number;
}

const DAILY: Mission[] = [
  { id: 'd-xp', period: 'daily', title: 'Kumpulkan 30 XP', target: 30, reward: 10, metric: (s) => s.xp },
  { id: 'd-correct', period: 'daily', title: 'Jawab benar 15 soal', target: 15, reward: 10, metric: (s) => s.correct },
  { id: 'd-review', period: 'daily', title: 'Selesaikan 5 ulangan terjadwal', target: 5, reward: 10, metric: (s) => s.reviews },
  { id: 'd-lesson', period: 'daily', title: 'Tuntaskan 1 pelajaran', target: 1, reward: 15, metric: (s) => s.lessons },
  { id: 'd-perfect', period: 'daily', title: 'Raih 1 sesi tanpa salah', target: 1, reward: 15, metric: (s) => s.perfect },
  { id: 'd-focus', period: 'daily', title: 'Belajar fokus 10 menit', target: 10, reward: 10, metric: (s) => Math.floor(s.ms / 60_000) },
];
const WEEKLY: Mission[] = [
  { id: 'w-xp', period: 'weekly', title: 'Kumpulkan 250 XP minggu ini', target: 250, reward: 40, metric: (s) => s.xp },
  { id: 'w-lessons', period: 'weekly', title: 'Tuntaskan 4 pelajaran minggu ini', target: 4, reward: 50, metric: (s) => s.lessons },
  { id: 'w-reviews', period: 'weekly', title: 'Selesaikan 30 ulangan minggu ini', target: 30, reward: 40, metric: (s) => s.reviews },
  { id: 'w-streak', period: 'weekly', title: 'Belajar 5 hari berturut-turut', target: 5, reward: 50, metric: (_s, state, now) => liveStreak(state.streak, now) },
  { id: 'w-homework', period: 'weekly', title: 'Kumpulkan 2 PR minggu ini', target: 2, reward: 40, metric: (s) => s.homework },
];

function pick<T>(list: T[], count: number, seed: string): T[] {
  const r = rng(seed);
  const pool = [...list];
  const out: T[] = [];
  while (out.length < count && pool.length) out.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
  return out;
}

export interface MissionView {
  key: string;
  mission: Mission;
  progress: number;
  done: boolean;
  claimed: boolean;
}

/** Missions rotate deterministically: same date -> same missions for everyone. */
export function activeMissions(state: LearnerState, now: number): MissionView[] {
  const today = dayKey(now);
  const week = weekKey(now);
  const view = (m: Mission, period: string, stats: DailyStat): MissionView => {
    const key = `${m.id}:${period}`;
    const progress = Math.min(m.target, m.metric(stats, state, now));
    return { key, mission: m, progress, done: progress >= m.target, claimed: !!state.missions[key] };
  };
  return [
    ...pick(DAILY, 3, 'daily:' + today).map((m) => view(m, today, state.daily[today] ?? emptyDay())),
    ...pick(WEEKLY, 2, 'weekly:' + week).map((m) => view(m, week, weekStats(state, now))),
  ];
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  progress: (s: LearnerState) => [number, number];
}

const lessonsDone = (s: LearnerState) => Object.values(s.lessons).filter((l) => l.completedAt).length;
const mastered = (s: LearnerState) => Object.values(s.topics).filter((t) => t.stage === 'mastered').length;
const reviewsDone = (s: LearnerState) => Object.values(s.reviews).reduce((n, r) => n + r.history.length, 0);
const examsPassed = (s: LearnerState) => Object.values(s.exams).filter((e) => e.attempts.some((a) => a.passed)).length;
const homeworkDone = (s: LearnerState) => Object.values(s.homework).filter((h) => h.submissions.length).length;
const perfectTests = (s: LearnerState) => Object.values(s.lessons).filter((l) => l.masteryBest === 100).length;
const tagsCleared = (s: LearnerState) => Object.values(s.tags).filter((t) => t.clearedAt).length;

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-lesson', title: 'Nyala Pertama', desc: 'Tuntaskan pelajaran pertamamu.', icon: 'flame', progress: (s) => [lessonsDone(s), 1] },
  { id: 'lessons-5', title: 'Murid Tekun', desc: 'Tuntaskan 5 pelajaran.', icon: 'book', progress: (s) => [lessonsDone(s), 5] },
  { id: 'lessons-10', title: 'Pembelajar Sejati', desc: 'Tuntaskan 10 pelajaran.', icon: 'graduation', progress: (s) => [lessonsDone(s), 10] },
  { id: 'streak-3', title: 'Tiga Hari Menyala', desc: 'Belajar 3 hari berturut-turut.', icon: 'flame', progress: (s) => [s.streak.longest, 3] },
  { id: 'streak-7', title: 'Sepekan Penuh', desc: 'Belajar 7 hari berturut-turut.', icon: 'calendar', progress: (s) => [s.streak.longest, 7] },
  { id: 'streak-30', title: 'Lentera Abadi', desc: 'Belajar 30 hari berturut-turut.', icon: 'sun', progress: (s) => [s.streak.longest, 30] },
  { id: 'xp-100', title: '100 XP', desc: 'Kumpulkan 100 XP.', icon: 'zap', progress: (s) => [s.xp, 100] },
  { id: 'xp-1000', title: '1.000 XP', desc: 'Kumpulkan 1.000 XP.', icon: 'zap', progress: (s) => [s.xp, 1000] },
  { id: 'xp-5000', title: '5.000 XP', desc: 'Kumpulkan 5.000 XP.', icon: 'trophy', progress: (s) => [s.xp, 5000] },
  { id: 'perfect-test', title: 'Tanpa Cela', desc: 'Raih nilai 100 pada tes penguasaan.', icon: 'target', progress: (s) => [perfectTests(s), 1] },
  { id: 'first-mastered', title: 'Benar-benar Paham', desc: 'Kuasai 1 topik hingga lulus tes ulang tertunda.', icon: 'award', progress: (s) => [mastered(s), 1] },
  { id: 'mastered-5', title: 'Lima Topik Dikuasai', desc: 'Kuasai 5 topik secara terkonfirmasi.', icon: 'award', progress: (s) => [mastered(s), 5] },
  { id: 'reviews-50', title: 'Ingatan Kuat', desc: 'Selesaikan 50 ulangan terjadwal.', icon: 'repeat', progress: (s) => [reviewsDone(s), 50] },
  { id: 'comeback', title: 'Bangkit dari Salah', desc: 'Tuntaskan latihan perbaikan untuk satu pola kesalahan.', icon: 'wrench', progress: (s) => [tagsCleared(s), 1] },
  { id: 'first-exam', title: 'Lulus Ujian Unit', desc: 'Lulus ujian unit pertamamu.', icon: 'scroll', progress: (s) => [examsPassed(s), 1] },
  { id: 'homework-5', title: 'Rajin PR', desc: 'Kumpulkan 5 pekerjaan rumah.', icon: 'pencil', progress: (s) => [homeworkDone(s), 5] },
  { id: 'conversation-3', title: 'Berani Bicara', desc: 'Selesaikan 3 simulasi percakapan.', icon: 'message', progress: (s) => [Object.keys(s.conversations).length, 3] },
];

/** Returns ids newly earned by this state. */
export function newAchievements(state: LearnerState): string[] {
  return ACHIEVEMENTS.filter((a) => {
    if (state.achievements[a.id]) return false;
    const [cur, target] = a.progress(state);
    return cur >= target;
  }).map((a) => a.id);
}

export function nextMilestone(xp: number): { target: number; previous: number } | null {
  const target = GAME.milestones.find((m) => m > xp);
  if (!target) return null;
  const previous = [...GAME.milestones].reverse().find((m) => m <= xp) ?? 0;
  return { target, previous };
}
