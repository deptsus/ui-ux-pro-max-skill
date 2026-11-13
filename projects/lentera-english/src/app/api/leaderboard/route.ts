import { json, requireUser, route } from '@/lib/server/api';

export const dynamic = 'force-dynamic';

export const GET = route(async (req) => {
  const { db, userId } = await requireUser(req);
  return json(await db.rpc('get_leaderboard', { p_user: userId }));
});
