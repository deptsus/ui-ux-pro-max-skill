// Error reports from browsers (Rilis 9). Public on purpose (errors also
// happen to guests), so it is size-limited and rate-limited per address.
import { HttpError, json, readJson, requireDb, route } from '@/lib/server/api';
import { recordError } from '@/lib/server/errors';
import { clientIp, rateLimit } from '@/lib/server/security';

export const dynamic = 'force-dynamic';

interface Body { message?: unknown; stack?: unknown; path?: unknown; release?: unknown }
const str = (v: unknown, n: number) => (typeof v === 'string' ? v.slice(0, n) : undefined);

export const POST = route(async (req) => {
  const db = await requireDb();
  await rateLimit(db, 'errors', clientIp(req), 30, 600);
  const b = await readJson<Body>(req, 12_000);
  const message = str(b.message, 500)?.trim();
  if (!message) throw new HttpError(400, 'Laporan error kosong.');
  try {
    await recordError(db, {
      source: 'client',
      message,
      stack: str(b.stack, 4000),
      path: str(b.path, 300),
      release: str(b.release, 40),
      userAgent: (req.headers.get('user-agent') ?? '').slice(0, 300),
    }, new URL(req.url).origin);
  } catch (e) {
    // Before migration 0014 there is nowhere to store reports: accept and drop
    // them instead of answering 500 (which would itself look like an error).
    if (/does not exist|could not find|not found/i.test(String((e as Error)?.message))) return json({ ok: false, stored: false }, 202);
    throw e;
  }
  return json({ ok: true });
});
