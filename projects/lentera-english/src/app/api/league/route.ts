// The signed-in learner's weekly league (Rilis 8, migration 0013).
import { json, requireUser, route } from '@/lib/server/api';
import { notReady } from '@/lib/server/habits';

export const dynamic = 'force-dynamic';

export const GET = route(async (req) => {
  const { db, userId } = await requireUser(req);
  return json(await db.rpc('get_league', { p_user: userId }).catch(notReady));
});
