// Web Push to admins' phones and browsers.
//
// The VAPID key pair is created by the server the first time it is needed and
// stored in the database (push_keys, service role only), so no person ever has
// to copy a private key into an environment variable. Subscriptions belong to
// admins only (save_push_subscription checks the role).
import webpush from 'web-push';
import type { ServerDb } from './db';

interface Keys {
  public_key: string;
  private_key: string;
}
interface Target {
  endpoint: string;
  p256dh: string;
  auth: string;
}
export interface PushMessage {
  title: string;
  body: string;
  /** Page opened when the notification is tapped. */
  url: string;
  /** Same tag replaces an earlier notification instead of stacking. */
  tag?: string;
}
export interface PushReport {
  sent: number;
  failed: number;
  removed: number;
}

// The pair never changes once stored, so one lookup per server instance.
let cached: Keys | null = null;

export async function pushKeys(db: ServerDb): Promise<Keys> {
  if (cached) return cached;
  let keys = await db.rpc<Keys | null>('get_push_keys');
  if (!keys) {
    const fresh = webpush.generateVAPIDKeys();
    // First writer wins: a concurrent instance gets the stored pair back.
    keys = await db.rpc<Keys>('init_push_keys', { p_public: fresh.publicKey, p_private: fresh.privateKey });
  }
  cached = keys;
  return keys;
}

/** VAPID needs an https: or mailto: contact; push services reject localhost. */
export function vapidSubject(origin: string | undefined): string {
  const candidate = process.env.APP_URL || origin || '';
  return /^https:\/\/(?!localhost|127\.)/.test(candidate) ? candidate.replace(/\/$/, '') : 'https://lentera-english-app.netlify.app';
}

type ResultFn = 'record_push_result' | 'record_reminder_push_result';

/** Delivers one message to the given devices and books each result. Never throws. */
async function deliver(db: ServerDb, targets: Target[], msg: PushMessage, record: ResultFn, opts: { origin?: string; timeoutMs?: number; urgency?: 'high' | 'normal' }): Promise<PushReport> {
  const report: PushReport = { sent: 0, failed: 0, removed: 0 };
  if (!targets?.length) return report;
  const keys = await pushKeys(db);
  const payload = JSON.stringify(msg);
  await Promise.all(
    targets.map(async (t) => {
      try {
        await webpush.sendNotification({ endpoint: t.endpoint, keys: { p256dh: t.p256dh, auth: t.auth } }, payload, {
          vapidDetails: { subject: vapidSubject(opts.origin), publicKey: keys.public_key, privateKey: keys.private_key },
          TTL: 24 * 3600,
          urgency: opts.urgency ?? 'high',
          timeout: opts.timeoutMs ?? 5000,
        });
        report.sent++;
        await db.rpc(record, { p_endpoint: t.endpoint, p_ok: true, p_gone: false }).catch(() => {});
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        const gone = status === 404 || status === 410;
        if (gone) report.removed++;
        else report.failed++;
        if (!gone) console.warn('[push] delivery failed', status ?? (e as Error).message);
        await db.rpc(record, { p_endpoint: t.endpoint, p_ok: false, p_gone: gone }).catch(() => {});
      }
    }),
  );
  return report;
}

/**
 * Sends one message to every admin device (or only `onlyUser`'s devices).
 * Never throws: a failed notification must not fail the request that caused it.
 */
export async function notifyAdmins(db: ServerDb, msg: PushMessage, opts: { onlyUser?: string; origin?: string; timeoutMs?: number } = {}): Promise<PushReport> {
  try {
    const targets = await db.rpc<Target[]>('admin_push_targets', { p_only_user: opts.onlyUser ?? null });
    return await deliver(db, targets, msg, 'record_push_result', opts);
  } catch (e) {
    console.error('[push]', e);
    return { sent: 0, failed: 0, removed: 0 };
  }
}

/** Homework reminder to one learner's devices (Rilis 4). `targets` skips the lookup when the caller has them. Never throws. */
export async function notifyLearner(db: ServerDb, userId: string, msg: PushMessage, opts: { origin?: string; timeoutMs?: number; targets?: Target[] } = {}): Promise<PushReport> {
  try {
    const targets = opts.targets ?? (await db.rpc<Target[]>('reminder_targets_for', { p_user: userId }));
    return await deliver(db, targets, msg, 'record_reminder_push_result', { ...opts, urgency: 'normal' });
  } catch (e) {
    console.error('[push]', e);
    return { sent: 0, failed: 0, removed: 0 };
  }
}
