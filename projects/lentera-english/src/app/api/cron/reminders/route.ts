// Homework reminders, called hourly by the scheduled Netlify function
// netlify/functions/homework-reminders.mjs. Public on purpose: it only sends
// reminders that are due, each at most once, and does nothing if it ran less
// than 50 minutes ago, so an extra call cannot spam anyone.
import { json, requireDb, route } from '@/lib/server/api';
import { runHomeworkReminders } from '@/lib/server/reminders';

export const dynamic = 'force-dynamic';

const run = route(async (req) => {
  const db = await requireDb();
  return json(await runHomeworkReminders(db, { origin: new URL(req.url).origin }));
});
export const GET = run;
export const POST = run;
