// Error monitoring without an outside service (Rilis 9). Browser errors arrive
// through /api/errors, server errors from route(); both land in app_errors,
// grouped by a fingerprint. The first time an error is seen (or comes back
// after being marked solved) the owner gets one phone notification, at most
// one every 15 minutes.
import { createHash } from 'node:crypto';
import { getDb, type ServerDb } from './db';
import { notifyAdmins } from './push';

export interface ErrorReport {
  source: 'client' | 'server';
  message: string;
  stack?: string;
  path?: string;
  release?: string;
  userAgent?: string;
  userId?: string | null;
}

export const RELEASE = (process.env.NEXT_PUBLIC_RELEASE ?? 'local').slice(0, 40);

/** Numbers, ids and quoted values vary between occurrences of the same bug. */
export function normalizeMessage(m: string): string {
  return m
    .replace(/https?:\/\/\S+/g, '<url>')
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '<id>')
    .replace(/(["'`]).{0,80}?\1/g, '<str>')
    .replace(/\d+/g, '<n>')
    .trim()
    .slice(0, 300);
}

/** First stack frame from our own code, without line numbers or build hashes. */
export function topFrame(stack = ''): string {
  const frames = stack.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('at ') || l.includes('@'));
  const ours = frames.find((l) => !/node_modules|node:internal|<anonymous>/.test(l)) ?? frames[0] ?? '';
  return ours.replace(/:\d+:\d+\)?$/, '').replace(/[?#].*$/, '').replace(/[a-f0-9]{8,}/g, '<h>').slice(0, 200);
}

export function fingerprint(r: Pick<ErrorReport, 'source' | 'message' | 'stack'>): string {
  return createHash('sha256').update(`${r.source}|${normalizeMessage(r.message)}|${topFrame(r.stack)}`).digest('hex').slice(0, 32);
}

const clip = (s: string | undefined, n: number) => (s ? s.slice(0, n) : null);

export async function recordError(db: ServerDb, r: ErrorReport, origin?: string): Promise<{ new: boolean }> {
  const res = await db.rpc<{ new: boolean }>('report_error', {
    p_fingerprint: fingerprint(r),
    p_source: r.source,
    p_message: clip(r.message, 500) ?? '',
    p_stack: clip(r.stack, 4000),
    p_path: clip(r.path, 300),
    p_release: clip(r.release ?? RELEASE, 40),
    p_user_agent: clip(r.userAgent, 300),
    p_user: r.userId ?? null,
  });
  if (res?.new) {
    const quiet = await db.rpc<boolean>('hit_rate_limit', { p_key: 'error-alert', p_max: 1, p_window_seconds: 900 }).catch(() => false);
    if (quiet) {
      await notifyAdmins(db, {
        title: r.source === 'server' ? 'Error baru di server Lentera' : 'Error baru di aplikasi Lentera',
        body: `${r.message.slice(0, 120)}${r.path ? ` (${r.path})` : ''}. Lihat tab Kesehatan di /admin.`,
        url: '/admin?tab=health',
        tag: 'lentera-error',
      }, { origin, timeoutMs: 4000 }).catch(() => undefined);
    }
  }
  return res ?? { new: false };
}

/** Called from route() for unexpected exceptions. Never throws, never delays the response much. */
export function reportServerError(e: unknown, req: Request): void {
  const err = e instanceof Error ? e : new Error(String(e));
  void (async () => {
    try {
      const db = await getDb();
      if (!db) return;
      const url = new URL(req.url);
      await recordError(db, { source: 'server', message: err.message || err.name, stack: err.stack, path: `${req.method} ${url.pathname}` }, url.origin);
    } catch {
      /* monitoring must never break the app (and 0014 may not be applied yet) */
    }
  })();
}
