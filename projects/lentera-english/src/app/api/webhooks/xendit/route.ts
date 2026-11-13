// Xendit webhook endpoint. Configure this URL (HTTPS) in the Xendit dashboard
// and copy the dashboard's verification token into XENDIT_WEBHOOK_TOKEN.
import { json, paymentDeps, requireDb, route } from '@/lib/server/api';
import { handleWebhook } from '@/lib/server/payments';

export const dynamic = 'force-dynamic';

export const POST = route(async (req) => {
  const db = await requireDb();
  const raw = await req.text();
  if (raw.length > 100_000) return json({ error: 'payload_too_large' }, 413);
  const result = await handleWebhook(paymentDeps(db, req), req.headers.get('x-callback-token'), raw);
  return json(result.body, result.status);
});
