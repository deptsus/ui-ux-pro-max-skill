import { json, readJson, requireUser, route } from '@/lib/server/api';

export const dynamic = 'force-dynamic';

export const GET = route(async (req) => {
  const { db, userId } = await requireUser(req);
  return json({ snapshot: await db.rpc('get_snapshot', { p_user: userId }) });
});

export const POST = route(async (req) => {
  const { db, userId } = await requireUser(req);
  const body = await readJson<{ events?: unknown[]; snapshot?: Record<string, unknown> | null; updatedAt?: number }>(req);
  const events = Array.isArray(body.events) ? body.events.slice(0, 500) : [];
  const result = await db.rpc('sync_learner', { p_user: userId, p_events: events, p_snapshot: body.snapshot ?? null, p_client_updated_at: Math.floor(Number(body.updatedAt) || 0) });
  return json(result);
});
