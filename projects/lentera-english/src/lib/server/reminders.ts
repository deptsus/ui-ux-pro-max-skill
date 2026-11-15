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
