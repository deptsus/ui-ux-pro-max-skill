// Shared plumbing for API routes.
import { userIdFromRequest } from './auth';
import { backendMode, DbError, getDb, type ServerDb } from './db';
import { handleWebhook, PaymentError, type PaymentDeps } from './payments';
import { isLiveKey } from './xendit';
import { MockXendit } from './xendit-mock';

export class HttpError extends Error {
  constructor(public status: number, message: string, public code = 'error') {
    super(message);
  }
}

export const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store', ...headers } });

export async function requireDb(): Promise<ServerDb> {
  const db = await getDb();
  if (!db) throw new HttpError(503, 'Backend belum dikonfigurasi. Aplikasi berjalan dalam mode perangkat saja.', 'no_backend');
  return db;
}

export async function requireUser(req: Request): Promise<{ db: ServerDb; userId: string }> {
  const db = await requireDb();
  const userId = await userIdFromRequest(req);
  if (!userId) throw new HttpError(401, 'Sesi berakhir. Silakan masuk kembali.', 'unauthorized');
  return { db, userId };
}

export async function readJson<T>(req: Request, maxBytes = 1_500_000): Promise<T> {
  const text = await req.text();
  if (text.length > maxBytes) throw new HttpError(413, 'Permintaan terlalu besar.', 'too_large');
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new HttpError(400, 'Format permintaan tidak valid.', 'bad_json');
  }
}

/** Wraps a handler: maps known errors to clean JSON, hides everything else. */
export function route<A extends unknown[]>(fn: (req: Request, ...args: A) => Promise<Response>) {
  return async (req: Request, ...args: A): Promise<Response> => {
    try {
      return await fn(req, ...args);
    } catch (e) {
      if (e instanceof HttpError) return json({ error: e.message, code: e.code }, e.status);
      if (e instanceof PaymentError) return json({ error: e.message, code: e.code }, e.status);
      if (e instanceof DbError && (e.code === '42501' || /forbidden/.test(e.message))) return json({ error: 'Akses ditolak.', code: 'forbidden' }, 403);
      if (e instanceof DbError && e.code === '22023') return json({ error: 'Data tidak valid.', code: 'invalid' }, 400);
      if (e instanceof DbError && /^2[23]/.test(e.code ?? '')) return json({ error: `Data ditolak oleh aturan basis data: ${e.message}`, code: 'constraint' }, 400);
      console.error('[api]', e);
      return json({ error: 'Terjadi kesalahan pada server.', code: 'server_error' }, 500);
    }
  };
}

/**
 * manual : the owner's own QRIS, confirmed by an admin (the default).
 * live / test / mock : Xendit, only with PAYMENT_PROVIDER=xendit.
 * off : no database, so nothing can be recorded.
 */
export type PaymentMode = 'manual' | 'live' | 'test' | 'mock' | 'off';

export function paymentMode(): PaymentMode {
  const backend = backendMode();
  if (backend === 'none') return 'off';
  if (process.env.PAYMENT_PROVIDER !== 'xendit') return 'manual';
  const key = process.env.XENDIT_SECRET_KEY;
  if (key && process.env.XENDIT_WEBHOOK_TOKEN) return isLiveKey(key) ? 'live' : 'test';
  return backend === 'embedded' ? 'mock' : 'off';
}

const g = globalThis as unknown as { __lenteraMock?: MockXendit };

export function paymentDeps(db: ServerDb, req: Request): PaymentDeps {
  const mode = paymentMode();
  const appUrl = process.env.APP_URL ?? new URL(req.url).origin;
  if (mode === 'off' || mode === 'manual') throw new HttpError(503, 'Pembayaran otomatis tidak aktif di server ini.', 'payments_off');
  if (mode === 'mock') {
    // Local simulator: its webhooks go through the very same handler.
    const deps: PaymentDeps = { db, appUrl, xendit: undefined as never };
    g.__lenteraMock ??= new MockXendit('local-mock-callback-token', (token, body) => handleWebhook({ ...deps, xendit: g.__lenteraMock!.config() }, token, body));
    deps.xendit = g.__lenteraMock.config();
    return deps;
  }
  return { db, appUrl, xendit: { secretKey: process.env.XENDIT_SECRET_KEY!, webhookToken: process.env.XENDIT_WEBHOOK_TOKEN! } };
}
