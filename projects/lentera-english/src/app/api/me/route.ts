import { userIdFromRequest } from '@/lib/server/auth';
import { json, paymentMode, readJson, requireUser, route } from '@/lib/server/api';
import { backendMode, getDb } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export const GET = route(async (req) => {
  const backend = backendMode();
  const base = { backend, payments: paymentMode() };
  const db = await getDb();
  const userId = db ? await userIdFromRequest(req) : null;
  if (!db || !userId) return json({ ...base, user: null });
  const account = await db.rpc<{ profile: Record<string, unknown>; entitlement: Record<string, unknown> }>('get_account', { p_user: userId });
  return json({ ...base, user: { id: userId, ...account } });
});

export const PATCH = route(async (req) => {
  const { db, userId } = await requireUser(req);
  const patch = await readJson<Record<string, unknown>>(req, 2000);
  return json({ profile: await db.rpc('update_profile', { p_user: userId, p_patch: patch }) });
});
