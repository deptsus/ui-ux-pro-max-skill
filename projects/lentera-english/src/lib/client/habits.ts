'use client';
// Rilis 8 "Kebiasaan Belajar" on the client: reminder settings, the weekly
// league and friends. All data comes from /api/reminders, /api/league and
// /api/friends (migration 0013); nothing here works without an account.
import { api } from './api';

export interface ReminderPrefs { daily_hour: number | null; time_zone: string; homework: boolean; devices: number }

export interface LeagueRow { rank: number; name: string; avatar: number; xp: number; me: boolean; friend: boolean }
export interface League {
  week_start: string;
  ends_at: string;
  joined: boolean;
  division: number;
  cohort?: number;
  outcome?: 'new' | 'promoted' | 'stayed' | 'demoted' | 'inactive';
  prev_division?: number | null;
  prev_rank?: number | null;
  promote?: number;
  demote?: number;
  rows?: LeagueRow[];
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

/** Five divisions, lowest first. Names follow the lantern theme: from a candle to a lighthouse. */
export const DIVISIONS = [
  { name: 'Lilin', color: '#a0703f', glow: '#f3c98b' },
  { name: 'Pelita', color: '#5f6b84', glow: '#d5dbe8' },
  { name: 'Obor', color: '#b7791f', glow: '#ffd36b' },
  { name: 'Lentera', color: '#4b3fd6', glow: '#c9c3ff' },
  { name: 'Mercusuar', color: '#0e7c86', glow: '#9ff0f0' },
] as const;
export const division = (n: number) => DIVISIONS[Math.min(Math.max(n, 1), DIVISIONS.length) - 1];

/** Where a rank sits this week: in the move-up zone, the move-down zone, or safe. */
export function zoneOf(rank: number, size: number, promote = 0, demote = 0): 'up' | 'down' | 'stay' {
  if (rank <= promote) return 'up';
  if (demote > 0 && rank > size - demote) return 'down';
  return 'stay';
}

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
