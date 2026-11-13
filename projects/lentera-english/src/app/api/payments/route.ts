import { json, paymentDeps, readJson, requireUser, route } from '@/lib/server/api';
import { createCheckout } from '@/lib/server/payments';

export const dynamic = 'force-dynamic';

export const GET = route(async (req) => {
  const { db, userId } = await requireUser(req);
  return json(await db.rpc('list_payments', { p_user: userId }));
});

// The client sends only the plan and the channel. The amount is decided by
// the database from subscription_plans.
export const POST = route(async (req) => {
  const { db, userId } = await requireUser(req);
  const body = await readJson<{ planId?: string; channel?: string }>(req, 1000);
  const tx = await createCheckout(paymentDeps(db, req), userId, String(body.planId ?? ''), String(body.channel ?? ''));
  return json({ transaction: tx });
});
