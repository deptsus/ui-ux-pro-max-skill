// Homework reminders (Rilis 4). Once an hour a scheduled Netlify function calls
// /api/cron/reminders, which runs this: every learner with a reminder device and
// a PR still open whose deadline is within the next 24 hours gets one
// notification, between 07.00 and 20.00 WIB. Each PR is reminded at most once
// (homework_reminders), and a run claimed less than 50 minutes after the last
// one does nothing (job_runs), so calling the endpoint more often is harmless.
import type { ServerDb } from './db';
import { loadContent } from './content';
import { notifyLearner, type PushMessage } from './push';

export const REMINDER = { windowMs: 24 * 3600 * 1000, minIntervalSec: 50 * 60, startHour: 7, endHour: 20, timeZone: 'Asia/Jakarta', maxLearners: 500 } as const;

interface Item { id: string; title: string | null; due_ms: number }
interface Target { user_id: string; items: Item[]; subs: { endpoint: string; p256dh: string; auth: string }[] }
export interface ReminderReport { skipped?: 'quiet-hours' | 'ran-recently' | 'not-ready'; learners?: number; reminded?: number; sent?: number; failed?: number; removed?: number }

export const jakartaHour = (ms: number) => Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: REMINDER.timeZone }).format(ms));
/** "Minggu pukul 23.59", the same on every server whatever its ICU data says. */
function dueText(ms: number): string {
  const parts = new Intl.DateTimeFormat('id-ID', { weekday: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: REMINDER.timeZone }).formatToParts(ms);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('weekday')} pukul ${get('hour').padStart(2, '0')}.${get('minute').padStart(2, '0')}`;
}

/** The notification for one learner's PR due soon. */
export function reminderMessage(items: Item[], titleOf: (id: string) => string | undefined): PushMessage {
  const name = (i: Item) => i.title || titleOf(i.id) || 'PR';
  if (items.length === 1) {
    const [i] = items;
    return { title: 'Tenggat PR sudah dekat', body: `"${name(i)}" belum dikumpulkan. Tenggatnya ${dueText(i.due_ms)} WIB.`, url: `/app/homework?id=${encodeURIComponent(i.id)}`, tag: `pr-${i.id}` };
  }
  const names = items.slice(0, 3).map(name).join(', ');
  return { title: `${items.length} PR tenggatnya sudah dekat`, body: `${names}${items.length > 3 ? ', dan lainnya' : ''}. Buka Pusat PR untuk mengerjakannya.`, url: '/app/homework', tag: 'pr-due' };
}

export async function runHomeworkReminders(db: ServerDb, opts: { now?: number; origin?: string; ignoreQuietHours?: boolean } = {}): Promise<ReminderReport> {
  const now = opts.now ?? Date.now();
  const hour = jakartaHour(now);
  if (!opts.ignoreQuietHours && (hour < REMINDER.startHour || hour >= REMINDER.endHour)) return { skipped: 'quiet-hours' };
  let claimed: boolean;
  try {
    claimed = await db.rpc<boolean>('claim_job', { p_job: 'homework-reminders', p_min_seconds: REMINDER.minIntervalSec });
  } catch {
    // Migration 0010 not applied yet.
    return { skipped: 'not-ready' };
  }
  if (!claimed) return { skipped: 'ran-recently' };
  const targets = (await db.rpc<Target[]>('homework_reminder_targets', { p_now_ms: now, p_window_ms: REMINDER.windowMs })).slice(0, REMINDER.maxLearners);
  const content = await loadContent(db);
  const titles = new Map(content.full.homework.map((h) => [h.id, h.title]));
  const report: ReminderReport = { learners: targets.length, reminded: 0, sent: 0, failed: 0, removed: 0 };
  for (const t of targets) {
    const r = await notifyLearner(db, t.user_id, reminderMessage(t.items, (id) => titles.get(id)), { origin: opts.origin, targets: t.subs });
    report.sent! += r.sent;
    report.failed! += r.failed;
    report.removed! += r.removed;
    // Only a delivered reminder counts; otherwise the next run tries again.
    if (r.sent > 0) {
      await db.rpc('record_homework_reminders', { p_user: t.user_id, p_ids: t.items.map((i) => i.id) });
      report.reminded!++;
    }
  }
  return report;
}

// ───────────────────────── Daily study reminder (Rilis 8) ─────────────────────────
// Learners pick an hour (05.00–22.00 in their phone's time zone). In that hour
// (or up to two hours later, if a run was missed) the same hourly job sends one
// reminder, only if the learner has not studied yet that day. At most one a day
// (reminder_prefs.last_daily_on); nothing at all on days they already studied.
export const DAILY = { minIntervalSec: 50 * 60, maxLearners: 2000, firstHour: 5, lastHour: 22 } as const;

interface DailyTarget { user_id: string; local_day: string; streak: number; freeze: boolean; subs: { endpoint: string; p256dh: string; auth: string }[] }

/** The daily reminder: it names the streak at stake, or invites a fresh start. */
export function dailyMessage(t: { streak: number; freeze: boolean }): PushMessage {
  const base = { url: '/app', tag: 'lentera-daily' };
  if (t.freeze && t.streak > 0) return { ...base, title: `Selamatkan ${t.streak} hari beruntunmu`, body: 'Kemarin terlewat, tapi pelindung beruntun masih ada. Belajar hari ini agar beruntunmu tetap menyala.' };
  if (t.streak > 0) return { ...base, title: `Jaga ${t.streak} hari beruntunmu`, body: 'Kamu belum belajar hari ini. Satu pelajaran singkat atau ulangan 5 menit sudah cukup agar beruntunmu tidak putus.' };
  return { ...base, title: 'Waktunya belajar bahasa Inggris', body: 'Mulai beruntun baru hari ini: satu pelajaran singkat sudah cukup.' };
}

export async function runDailyReminders(db: ServerDb, opts: { now?: number; origin?: string } = {}): Promise<ReminderReport> {
  const now = opts.now ?? Date.now();
  let targets: DailyTarget[];
  try {
    if (!(await db.rpc<boolean>('claim_job', { p_job: 'daily-reminders', p_min_seconds: DAILY.minIntervalSec }))) return { skipped: 'ran-recently' };
    targets = await db.rpc<DailyTarget[]>('daily_reminder_targets', { p_now: new Date(now).toISOString() });
  } catch {
    // Migration 0013 not applied yet.
    return { skipped: 'not-ready' };
  }
  targets = targets.slice(0, DAILY.maxLearners);
  const report: ReminderReport = { learners: targets.length, reminded: 0, sent: 0, failed: 0, removed: 0 };
  for (const t of targets) {
    const r = await notifyLearner(db, t.user_id, dailyMessage(t), { origin: opts.origin, targets: t.subs });
    report.sent! += r.sent;
    report.failed! += r.failed;
    report.removed! += r.removed;
    if (r.sent > 0) {
      await db.rpc('record_daily_reminder', { p_user: t.user_id, p_day: t.local_day });
      report.reminded!++;
    }
  }
  return report;
}

/** Premium ending soon (Rilis 12): once per paid period, 3 days before, in the daytime. */
export const EXPIRY = { days: 3, minIntervalSec: 5 * 3600, maxLearners: 500 } as const;

export function expiryMessage(expiresAt: string, now: number): PushMessage {
  const end = Date.parse(expiresAt);
  const left = Math.max(0, Math.ceil((end - now) / 86_400_000));
  const date = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', timeZone: REMINDER.timeZone }).format(end);
  return {
    title: left <= 1 ? 'Premium-mu berakhir besok' : `Premium-mu berakhir ${left} hari lagi`,
    body: `Masa aktif sampai ${date}. Perpanjang agar semua materi, nyawa tak terbatas, dan ujian level tetap terbuka.`,
    url: '/app/subscription',
    tag: 'lentera-premium-expiry',
  };
}

export async function runExpiryReminders(db: ServerDb, opts: { now?: number; origin?: string } = {}): Promise<ReminderReport> {
  const now = opts.now ?? Date.now();
  const hour = jakartaHour(now);
  if (hour < REMINDER.startHour || hour >= REMINDER.endHour) return { skipped: 'quiet-hours' };
  let targets: { user_id: string; subscription_id: string; expires_at: string }[];
  try {
    if (!(await db.rpc<boolean>('claim_job', { p_job: 'expiry-reminders', p_min_seconds: EXPIRY.minIntervalSec }))) return { skipped: 'ran-recently' };
    targets = await db.rpc('premium_expiry_targets', { p_days: EXPIRY.days });
  } catch {
    // Migration 0017 not applied yet.
    return { skipped: 'not-ready' };
  }
  targets = targets.slice(0, EXPIRY.maxLearners);
  const report: ReminderReport = { learners: targets.length, reminded: 0, sent: 0, failed: 0, removed: 0 };
  for (const t of targets) {
    // One reminder per paid period, even when the job runs again.
    if (!(await db.rpc<boolean>('claim_job', { p_job: `expiry:${t.subscription_id}`, p_min_seconds: 40 * 86_400 }))) continue;
    const r = await notifyLearner(db, t.user_id, expiryMessage(t.expires_at, now), { origin: opts.origin });
    report.sent! += r.sent;
    report.failed! += r.failed;
    report.removed! += r.removed;
    if (r.sent > 0) report.reminded!++;
  }
  return report;
}
