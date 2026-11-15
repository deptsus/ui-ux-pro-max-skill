// Request-level protections (Rilis 9): client address for rate limits (hashed,
// never stored raw) and fixed-window limits backed by the database.
import { createHash } from 'node:crypto';
import { HttpError } from './api';
import type { ServerDb } from './db';

/** The visitor's address as Netlify (or a local proxy) reports it. */
export function clientIp(req: Request): string {
  return req.headers.get('x-nf-client-connection-ip')
    ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'local';
}

/** Keys in the rate-limit table are hashes: no raw address or id is stored there. */
export const hashKey = (s: string) => createHash('sha256').update(`lentera-rate:${s}`).digest('base64url').slice(0, 32);

/**
 * Allows `max` calls per `windowSec` for this scope and caller, else 429.
 * Before migration 0014 the counter does not exist yet: then nothing is limited.
 */
export async function rateLimit(db: ServerDb, scope: string, who: string, max: number, windowSec: number): Promise<void> {
  let ok = true;
  try {
    ok = await db.rpc<boolean>('hit_rate_limit', { p_key: `${scope}:${hashKey(who)}`, p_max: max, p_window_seconds: windowSec });
  } catch {
    return;
  }
  if (ok === false) throw new HttpError(429, 'Terlalu banyak permintaan. Coba lagi beberapa saat lagi.', 'rate_limited');
}
