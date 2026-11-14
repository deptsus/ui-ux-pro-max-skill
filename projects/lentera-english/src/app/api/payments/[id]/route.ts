import { HttpError, json, paymentDeps, paymentMode, readJson, requireUser, route } from '@/lib/server/api';
import { claimManualPayment, getManualPayment } from '@/lib/server/manual-payments';
import { refreshPayment, simulateCheckout } from '@/lib/server/payments';

export const dynamic = 'force-dynamic';
type Ctx = { params: Promise<{ id: string }> };
const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export const GET = route(async (req: Request, ctx: Ctx) => {
  const { id } = await ctx.params;
  if (!isUuid(id)) throw new HttpError(404, 'Transaksi tidak ditemukan.');
  const { db, userId } = await requireUser(req);
  const mode = paymentMode();
  const transaction = mode === 'manual' ? await getManualPayment(db, userId, id) : await refreshPayment(paymentDeps(db, req), userId, id);
  const account = await db.rpc<{ entitlement: unknown }>('get_account', { p_user: userId });
  return json({ transaction, entitlement: account.entitlement, mode });
});

// claim    : the learner reports having paid a manual QRIS (queues it for an admin).
// simulate : Xendit test mode only, simulates the customer paying.
export const POST = route(async (req: Request, ctx: Ctx) => {
  const { id } = await ctx.params;
  if (!isUuid(id)) throw new HttpError(404, 'Transaksi tidak ditemukan.');
  const { db, userId } = await requireUser(req);
  const body = await readJson<{ action?: string; payerName?: string; note?: string }>(req, 2000);
  const mode = paymentMode();
  if (body.action === 'claim' && mode === 'manual') {
    return json({ transaction: await claimManualPayment(db, userId, id, String(body.payerName ?? ''), String(body.note ?? '')) });
  }
  if (body.action !== 'simulate' || !['test', 'mock'].includes(mode)) throw new HttpError(403, 'Tindakan tidak tersedia.');
  return json(await simulateCheckout(paymentDeps(db, req), userId, id));
});
