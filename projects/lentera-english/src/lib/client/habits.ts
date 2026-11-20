'use client';
// Rilis 8 "Kebiasaan Belajar" on the client: reminder settings, the league
// (Liga Rank since migration 0022) and friends. All data comes from /api/reminders, /api/league and
// /api/friends (migration 0013); nothing here works without an account.
import { api } from './api';

export interface ReminderPrefs { daily_hour: number | null; time_zone: string; homework: boolean; devices: number }

/** One player in the learner's rank (Liga Rank, migration 0022). */
export interface RankRow { rank: number; name: string; avatar: number; points: number; week_xp: number; me: boolean; friend: boolean }
export interface RankRules { thresholds: number[]; week_max: number; xp_full: number; xp_points: number; days_full: number; day_points: number; inactive: number }
export interface League {
  /** "rank" since migration 0022; an older server answers without it (weekly groups). */
  mode?: 'rank';
  week_start: string;
  ends_at: string;
  division: number;
  /** Settled points plus this week's gain so far. */
  points: number;
  settled: number;
  best_division: number | null;
  week_xp: number;
  week_days: number;
  week_points: number;
  /** Set for 7 days after the rank changed (or the league became a rank ladder). */
  outcome: 'new' | 'converted' | 'promoted' | 'demoted' | null;
  prev_division: number | null;
  rules: RankRules;
  players: number;
  position: number | null;
  rows: RankRow[];
}

export interface Friend { me: boolean; name: string; avatar: number; code: string | null; xp: number; streak: number }
export interface Challenge {
  id: number;
  days: 3 | 7;
  status: 'pending' | 'active' | 'finished' | 'declined' | 'cancelled' | 'expired';
  mine: boolean;
  open: boolean;
  name: string;
  avatar: number;
  code: string;
  created_at: string;
  expires_at: string;
  starts_at: string | null;
  ends_at: string | null;
  my_xp: number | null;
  their_xp: number | null;
}
export interface Social { code: string; week_start: string; friends: Friend[]; challenges: Challenge[]; record: { won: number; lost: number; draw: number } }

/** Daily reminder hours a learner can pick (05.00–22.00). */
export const REMINDER_HOURS = Array.from({ length: 18 }, (_, i) => i + 5);
export const hourLabel = (h: number) => `${String(h).padStart(2, '0')}.00`;

export function deviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta';
  } catch {
    return 'Asia/Jakarta';
  }
}

const ZONES: Record<string, string> = {
  'Asia/Jakarta': 'WIB', 'Asia/Pontianak': 'WIB',
  'Asia/Makassar': 'WITA', 'Asia/Ujung_Pandang': 'WITA',
  'Asia/Jayapura': 'WIT',
};
/** "WIB", "WITA", "WIT", or the zone name for learners outside Indonesia. */
export const zoneLabel = (tz: string) => ZONES[tz] ?? tz.replace(/_/g, ' ');

export const getReminderPrefs = () => api<ReminderPrefs>('/api/reminders');
export const saveReminderPrefs = (patch: Partial<Pick<ReminderPrefs, 'daily_hour' | 'homework'>>) =>
  api<ReminderPrefs>('/api/reminders', { body: { ...patch, time_zone: deviceTimeZone() } });

export const getLeague = () => api<League>('/api/league');
export const getSocial = () => api<Social>('/api/friends');
export const socialAction = (body: { action: 'add' | 'remove' | 'challenge' | 'respond' | 'cancel'; code?: string; days?: 3 | 7; id?: number; accept?: boolean }) =>
  api<{ message: string; social: Social }>('/api/friends', { body });

/** Five ranks, lowest first. Names follow the lantern theme: from a candle to a lighthouse. */
export const DIVISIONS = [
  { name: 'Lilin', color: '#a0703f', glow: '#f3c98b', flame: ['#f7c77e', '#f59e0b', '#fff7e0'] },
  { name: 'Pelita', color: '#5f6b84', glow: '#d5dbe8', flame: ['#ffe1a1', '#ffa94d', '#ffffff'] },
  { name: 'Obor', color: '#b7791f', glow: '#ffd36b', flame: ['#ffd36b', '#ff7a1a', '#fff3c4'] },
  { name: 'Lentera', color: '#4b3fd6', glow: '#c9c3ff', flame: ['#d9d2ff', '#a78bfa', '#ffffff'] },
  { name: 'Mercusuar', color: '#0e7c86', glow: '#9ff0f0', flame: ['#a5f3fc', '#22d3ee', '#ffffff'] },
] as const;
export const division = (n: number) => DIVISIONS[Math.min(Math.max(n, 1), DIVISIONS.length) - 1];

/**
 * Liga Rank rules, as on the server (rank_rules, migration 0022): at most 100 points a week
 * (70 for XP, full at 250 XP; 7.5 per study day, full at 4 days), -50 for a week without XP.
 * At the full 100 a week, Lilin to Mercusuar takes 50 weeks.
 */
export const RANK: RankRules = { thresholds: [0, 500, 1500, 3000, 5000], week_max: 100, xp_full: 250, xp_points: 70, days_full: 4, day_points: 7.5, inactive: -50 };

/** Where `points` sit on the ladder: the rank, its floor, the next threshold and the share done. */
export function rankProgress(points: number, rules: RankRules = RANK) {
  const t = rules.thresholds;
  let division = 1;
  for (let i = 0; i < t.length; i++) if (points >= t[i]) division = i + 1;
  const floor = t[division - 1];
  const next = division < t.length ? t[division] : null;
  return {
    division, floor, next,
    need: next === null ? 0 : next - points,
    pct: next === null ? 100 : Math.max(0, Math.min(100, Math.round(((points - floor) / (next - floor)) * 100))),
  };
}

/** Weeks of the full weekly plan needed to earn `need` points. */
export const weeksToNext = (need: number, rules: RankRules = RANK) => Math.max(0, Math.ceil(need / rules.week_max));

/** "2 hari 5 jam" or "5 jam 12 menit" until the given time. */
export function timeLeft(iso: string, now = Date.now()): string {
  const ms = Math.max(0, new Date(iso).getTime() - now);
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (d > 0) return `${d} hari ${h} jam`;
  if (h > 0) return `${h} jam ${m} menit`;
  return `${Math.max(m, 1)} menit`;
}

/** The invite link that opens the friends tab with the code filled in. */
export const inviteUrl = (origin: string, code: string) => `${origin}/app/leaderboard?tab=teman&kode=${encodeURIComponent(code)}`;
