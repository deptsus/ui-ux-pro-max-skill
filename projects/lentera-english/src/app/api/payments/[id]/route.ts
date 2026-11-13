import { HttpError, json, paymentDeps, paymentMode, readJson, requireUser, route } from '@/lib/server/api';
import { refreshPayment, simulateCheckout } from '@/lib/server/payments';

export const dynamic = 'force-dynamic';
type Ctx = { params: Promise<{ id: string }> };
const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export const GET = route(async (req: Request, ctx: Ctx) => {
  const { id } = await ctx.params;
  if (!isUuid(id)) throw new HttpError(404, 'Transaksi tidak ditemukan.');
  const { db, userId } = await requireUser(req);
  const transaction = await refreshPayment(paymentDeps(db, req), userId, id);
  const account = await db.rpc<{ entitlement: unknown }>('get_account', { p_user: userId });
  return json({ transaction, entitlement: account.entitlement, mode: paymentMode() });
});

// Sandbox only: simulate the customer paying. Disabled with a live key.
export const POST = route(async (req: Request, ctx: Ctx) => {
  const { id } = await ctx.params;
  if (!isUuid(id)) throw new HttpError(404, 'Transaksi tidak ditemukan.');
  const { db, userId } = await requireUser(req);
  const body = await readJson<{ action?: string }>(req, 200);
  if (body.action !== 'simulate' || paymentMode() === 'live') throw new HttpError(403, 'Tindakan tidak tersedia.');
  return json(await simulateCheckout(paymentDeps(db, req), userId, id));
});
