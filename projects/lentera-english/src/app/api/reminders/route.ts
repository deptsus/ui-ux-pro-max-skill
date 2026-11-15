// Reminder settings for the signed-in learner (Rilis 8, migration 0013).
//   GET  → { daily_hour, time_zone, homework, devices }
//   POST { daily_hour?: 5..22 | null, time_zone?: string, homework?: boolean } → same
// Devices are registered through /api/push (subscribe-reminders).
import { HttpError, json, readJson, requireUser, route } from '@/lib/server/api';
import { rateLimit } from '@/lib/server/security';
import { notReady } from '@/lib/server/habits';

export const dynamic = 'force-dynamic';

export const GET = route(async (req) => {
  const { db, userId } = await requireUser(req);
  return json(await db.rpc('get_reminder_prefs', { p_user: userId }).catch(notReady));
});

export const POST = route(async (req) => {
  const { db, userId } = await requireUser(req);
  await rateLimit(db, 'reminders', userId, 60, 3600);
  const b = await readJson<Record<string, unknown>>(req, 2000);
  const patch: Record<string, unknown> = {};
  if ('daily_hour' in b) {
    const h = b.daily_hour;
    if (h !== null && !(Number.isInteger(h) && (h as number) >= 5 && (h as number) <= 22)) throw new HttpError(400, 'Pilih jam antara 05.00 dan 22.00.');
    patch.daily_hour = h;
  }
  if (typeof b.time_zone === 'string') patch.time_zone = b.time_zone.slice(0, 64);
  if ('homework' in b) {
    if (typeof b.homework !== 'boolean') throw new HttpError(400, 'Pengaturan pengingat PR tidak valid.');
    patch.homework = b.homework;
  }
  return json(await db.rpc('set_reminder_prefs', { p_user: userId, p_patch: patch }).catch(notReady));
});
