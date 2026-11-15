// Reminders, called hourly by the scheduled Netlify function
// netlify/functions/homework-reminders.mjs: PR deadlines (Rilis 4) and the
// daily study reminder at each learner's chosen hour (Rilis 8). Public on
// purpose: each job sends only reminders that are due, each at most once, and
// does nothing if it ran less than 50 minutes ago, so an extra call cannot
// spam anyone.
import { json, requireDb, route } from '@/lib/server/api';
import { runDailyReminders, runHomeworkReminders } from '@/lib/server/reminders';

export const dynamic = 'force-dynamic';

const run = route(async (req) => {
  const db = await requireDb();
  const origin = new URL(req.url).origin;
  const homework = await runHomeworkReminders(db, { origin });
  const daily = await runDailyReminders(db, { origin });
  return json({ ...homework, daily });
});
export const GET = run;
export const POST = run;
