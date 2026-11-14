// Admin Premium and admin phone notifications (Web Push), against real SQL
// (PGlite) and the real web-push encryption.
import crypto from 'node:crypto';
import path from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import webpush from 'web-push';
// http_ece is web-push's own encryption library: used here as the phone's side.
// @ts-expect-error no type declarations
import ece from 'http_ece';
import { isPremium } from '@/lib/engine/types';
import { openEmbedded, type RawDb } from '@/lib/server/db';
import { claimManualPayment, claimNotification, createManualCheckout } from '@/lib/server/manual-payments';
import { notifyAdmins, pushKeys, vapidSubject } from '@/lib/server/push';
import { newUser } from './helpers';

const ROOT = path.resolve(__dirname, '..');
let db: RawDb;
let admin: string;
let student: string;

interface Ent { premium: boolean; plan: string; expires_at: string | null }
const entitlement = (u: string) => db.rpc<Ent>('get_entitlement', { p_user: u });
const b64url = (b: Buffer) => b.toString('base64url');
/** A phone-like push subscription with real keys, so payloads can be decrypted. */
function device(n: string) {
  const ecdh = crypto.createECDH('prime256v1');
  ecdh.generateKeys();
  const auth = crypto.randomBytes(16);
  return { ecdh, auth, endpoint: `https://push.example.test/send/${n}`, p256dh: b64url(ecdh.getPublicKey()), authKey: b64url(auth) };
}
const save = (user: string, d: ReturnType<typeof device>) =>
  db.rpc('save_push_subscription', { p_user: user, p_endpoint: d.endpoint, p_p256dh: d.p256dh, p_auth: d.authKey, p_user_agent: 'vitest' });
const targets = (only: string | null = null) => db.rpc<{ endpoint: string }[]>('admin_push_targets', { p_only_user: only });

beforeAll(async () => {
  db = await openEmbedded(undefined, ROOT);
  admin = await newUser(db, 'Admin', 'admin');
});
afterAll(async () => {
  await db.close();
});
beforeEach(async () => {
  student = await newUser(db, 'Pelajar');
  await db.query('delete from push_subscriptions');
  vi.restoreAllMocks();
});

describe('free Premium for admins', () => {
  it('reports admins as Premium with plan "admin" and no end date', async () => {
    expect(await entitlement(admin)).toEqual({ premium: true, plan: 'admin', expires_at: null });
    expect((await db.rpc<{ entitlement: Ent }>('get_account', { p_user: admin })).entitlement.plan).toBe('admin');
    expect(await entitlement(student)).toEqual({ premium: false, plan: 'free', expires_at: null });
  });
  it('writes no subscription or payment, and ends when the role is removed', async () => {
    const extra = await newUser(db, 'Admin Sementara', 'admin');
    expect((await entitlement(extra)).premium).toBe(true);
    const rows = await db.query<{ n: number }>('select (select count(*) from subscriptions where user_id = $1)::int + (select count(*) from payment_transactions where user_id = $1)::int as n', [extra]);
    expect(rows[0].n).toBe(0);
    await db.query("update profiles set role = 'student' where id = $1", [extra]);
    expect(await entitlement(extra)).toEqual({ premium: false, plan: 'free', expires_at: null });
  });
  it('is Premium on the device without an expiry date', () => {
    expect(isPremium({ premium: true, plan: 'admin' }, Date.now())).toBe(true);
    expect(isPremium({ premium: true, plan: 'premium_monthly' }, Date.now())).toBe(false);
    expect(isPremium({ premium: true, plan: 'premium_monthly', expiresAt: Date.now() - 1 }, Date.now())).toBe(false);
  });
});

describe('push subscriptions', () => {
  it('lets only admins register a device', async () => {
    await expect(save(student, device('s'))).rejects.toThrow(/forbidden/);
    expect(await save(admin, device('a'))).toMatchObject({ saved: true, devices: 1 });
  });
  it('rejects malformed subscriptions', async () => {
    const d = device('bad');
    await expect(db.rpc('save_push_subscription', { p_user: admin, p_endpoint: 'http://insecure.test/x', p_p256dh: d.p256dh, p_auth: d.authKey, p_user_agent: '' })).rejects.toThrow(/invalid_subscription/);
    await expect(db.rpc('save_push_subscription', { p_user: admin, p_endpoint: d.endpoint, p_p256dh: 'x', p_auth: d.authKey, p_user_agent: '' })).rejects.toThrow(/invalid_subscription/);
  });
  it('sends only to devices of current admins, or to one admin for a test', async () => {
    const other = await newUser(db, 'Admin Dua', 'admin');
    await save(admin, device('a1'));
    await save(other, device('o1'));
    expect((await targets()).map((t) => t.endpoint).sort()).toEqual(['https://push.example.test/send/a1', 'https://push.example.test/send/o1']);
    expect((await targets(admin)).map((t) => t.endpoint)).toEqual(['https://push.example.test/send/a1']);
    await db.query("update profiles set role = 'student' where id = $1", [other]);
    expect((await targets()).map((t) => t.endpoint)).toEqual(['https://push.example.test/send/a1']);
  });
  it('moves a device to whoever registered it last', async () => {
    const other = await newUser(db, 'Admin Tiga', 'admin');
    const d = device('shared');
    await save(admin, d);
    await save(other, d);
    expect(await targets(admin)).toEqual([]);
    expect((await targets(other)).length).toBe(1);
  });
  it('drops gone devices at once and flaky ones after 10 failures in a row', async () => {
    const gone = device('gone');
    const flaky = device('flaky');
    await save(admin, gone);
    await save(admin, flaky);
    await db.rpc('record_push_result', { p_endpoint: gone.endpoint, p_ok: false, p_gone: true });
    for (let i = 0; i < 9; i++) await db.rpc('record_push_result', { p_endpoint: flaky.endpoint, p_ok: false, p_gone: false });
    expect((await targets()).map((t) => t.endpoint)).toEqual([flaky.endpoint]);
    await db.rpc('record_push_result', { p_endpoint: flaky.endpoint, p_ok: true, p_gone: false });
    for (let i = 0; i < 9; i++) await db.rpc('record_push_result', { p_endpoint: flaky.endpoint, p_ok: false, p_gone: false });
    expect((await targets()).length).toBe(1); // a success reset the counter
    await db.rpc('record_push_result', { p_endpoint: flaky.endpoint, p_ok: false, p_gone: false });
    expect(await targets()).toEqual([]);
  });
  it('is closed to the API roles', async () => {
    for (const role of ['anon', 'authenticated']) {
      for (const fn of ['get_push_keys()', 'admin_push_targets(uuid)', 'save_push_subscription(uuid,text,text,text,text)', 'admin_pending_count(uuid)']) {
        const [{ ok }] = await db.query<{ ok: boolean }>(`select has_function_privilege($1, 'public.${fn}', 'execute') as ok`, [role]);
        expect(ok, `${role} ${fn}`).toBe(false);
      }
      const [{ ok }] = await db.query<{ ok: boolean }>("select has_table_privilege($1, 'public.push_keys', 'select') as ok", [role]);
      expect(ok, `${role} push_keys`).toBe(false);
    }
  });
});

describe('VAPID keys', () => {
  it('are created once, stored, and the first writer wins', async () => {
    const first = await pushKeys(db);
    expect(first.public_key).toMatch(/^[A-Za-z0-9_-]{87}$/);
    const again = webpush.generateVAPIDKeys();
    expect(await db.rpc('init_push_keys', { p_public: again.publicKey, p_private: again.privateKey })).toEqual(first);
    await expect(db.rpc('init_push_keys', { p_public: 'short', p_private: 'short' })).rejects.toThrow(/invalid_push_keys/);
  });
  it('use an https contact that push services accept', () => {
    expect(vapidSubject('https://lentera-english-app.netlify.app/')).toBe('https://lentera-english-app.netlify.app');
    expect(vapidSubject('http://localhost:3100')).toBe('https://lentera-english-app.netlify.app');
  });
});

describe('notifications on a payment report', () => {
  it('builds a message for the first "Saya sudah bayar" only', async () => {
    const tx = await createManualCheckout(db, student, 'premium_monthly');
    const first = await claimManualPayment(db, student, tx.id, 'Budi Santoso', '');
    expect(claimNotification(first)).toEqual({
      title: 'Pembayaran baru menunggu konfirmasi',
      body: 'Premium Bulanan · Rp58.500 · dari Budi Santoso. Cocokkan dengan mutasi QRIS, lalu konfirmasi.',
      url: '/admin',
      tag: `payment-${tx.id}`,
    });
    const again = await claimManualPayment(db, student, tx.id, 'Budi S.', '');
    expect(claimNotification(again)).toBeNull();
    expect(await db.rpc('admin_pending_count', { p_actor: admin })).toBeGreaterThanOrEqual(1);
    await expect(db.rpc('admin_pending_count', { p_actor: student })).rejects.toThrow(/forbidden/);
  });
  it('encrypts the payload so the phone can read it, with VAPID and urgency headers', async () => {
    const d = device('phone');
    const keys = await pushKeys(db);
    const msg = { title: 'Pembayaran baru menunggu konfirmasi', body: 'Premium Tahunan · Rp497.250', url: '/admin', tag: 't' };
    const req = webpush.generateRequestDetails({ endpoint: d.endpoint, keys: { p256dh: d.p256dh, auth: d.authKey } }, JSON.stringify(msg), {
      vapidDetails: { subject: vapidSubject(undefined), publicKey: keys.public_key, privateKey: keys.private_key },
      TTL: 86400,
      urgency: 'high',
    });
    expect(req.headers).toMatchObject({ 'Content-Encoding': 'aes128gcm', TTL: 86400, Urgency: 'high' });
    expect(String(req.headers.Authorization)).toMatch(new RegExp(`^vapid t=.+, k=${keys.public_key}$`));
    const plain = ece.decrypt(req.body, { version: 'aes128gcm', privateKey: d.ecdh, authSecret: d.authKey });
    expect(JSON.parse(plain.toString('utf8'))).toEqual(msg);
  });
  it('counts deliveries, removes gone devices and never throws', async () => {
    const ok = device('ok');
    const gone = device('gone2');
    const down = device('down');
    for (const d of [ok, gone, down]) await save(admin, d);
    vi.spyOn(webpush, 'sendNotification').mockImplementation(async (sub) => {
      if (sub.endpoint === gone.endpoint) throw Object.assign(new Error('gone'), { statusCode: 410 });
      if (sub.endpoint === down.endpoint) throw Object.assign(new Error('server error'), { statusCode: 500 });
      return { statusCode: 201, body: '', headers: {} };
    });
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const report = await notifyAdmins(db, { title: 't', body: 'b', url: '/admin' });
    expect(report).toEqual({ sent: 1, failed: 1, removed: 1 });
    const rows = await db.query<{ endpoint: string; failures: number; ok: boolean }>('select endpoint, failures, last_success_at is not null as ok from push_subscriptions order by endpoint');
    expect(rows).toEqual([
      { endpoint: down.endpoint, failures: 1, ok: false },
      { endpoint: ok.endpoint, failures: 0, ok: true },
    ]);
  });
  it('sends nothing when no admin has turned notifications on', async () => {
    const spy = vi.spyOn(webpush, 'sendNotification');
    expect(await notifyAdmins(db, { title: 't', body: 'b', url: '/admin' })).toEqual({ sent: 0, failed: 0, removed: 0 });
    expect(spy).not.toHaveBeenCalled();
  });
});
