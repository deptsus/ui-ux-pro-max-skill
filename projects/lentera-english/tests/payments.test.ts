// Payment flow against real SQL (PGlite) and the Xendit simulator.
// Covers: success, failure, pending, duplicate webhook, amount mismatch,
// forged webhook, premium expiry, renewal, and gateway errors.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import path from 'node:path';
import { openEmbedded, type RawDb } from '@/lib/server/db';
import { createCheckout, handleWebhook, refreshPayment, simulateCheckout, PaymentError, type PaymentDeps, type Transaction } from '@/lib/server/payments';
import { MockXendit } from '@/lib/server/xendit-mock';
import { XENDIT_API_VERSION, channelProperties } from '@/lib/server/xendit';
import { newUser } from './helpers';

const ROOT = path.resolve(__dirname, '..');
const TOKEN = 'test-callback-token-123';
const DAY = 86_400_000;
let db: RawDb;
let mock: MockXendit;
let deps: PaymentDeps;
let clock: number;
let user: string;

interface Ent { premium: boolean; plan: string; expires_at: string | null }
const entitlement = (u = user) => db.rpc<Ent>('get_entitlement', { p_user: u });
const periods = (u = user) => db.query<{ starts_at: Date; expires_at: Date }>('select starts_at, expires_at from subscriptions where user_id = $1 order by starts_at', [u]);
const txRow = async (id: string) => (await db.query<Transaction>('select * from payment_transactions where id = $1', [id]))[0];
const days = (a: Date | string, b: Date | string) => Math.round((new Date(b).getTime() - new Date(a).getTime()) / DAY) + 0;

beforeAll(async () => {
  db = await openEmbedded(undefined, ROOT);
  mock = new MockXendit(TOKEN, (token, body) => handleWebhook(deps, token, body));
  deps = { db, xendit: mock.config(), appUrl: 'https://lentera.test', now: () => clock };
});
afterAll(async () => {
  await db.close();
});
beforeEach(async () => {
  clock = Date.now();
  user = await newUser(db, 'Pembeli');
});

describe('checkout creation', () => {
  it('creates a QRIS payment request with the server-side price', async () => {
    const tx = await createCheckout(deps, user, 'premium_monthly', 'QRIS');
    expect(tx).toMatchObject({ status: 'PENDING', amount_idr: 58500, currency: 'IDR', channel: 'QRIS', plan_id: 'premium_monthly' });
    expect(tx.checkout).toMatchObject({ kind: 'qr' });
    expect(tx.checkout!.value.length).toBeGreaterThan(20);
    expect(tx.reference_id).toMatch(/^LTR-[0-9a-f]{32}$/);
    const call = mock.calls.filter((c) => c.method === 'POST' && c.path === '/v3/payment_requests').at(-1)!;
    expect(call.body).toMatchObject({ reference_id: tx.reference_id, type: 'PAY', country: 'ID', currency: 'IDR', request_amount: 58500, capture_method: 'AUTOMATIC', channel_code: 'QRIS' });
    expect((call.body as { metadata: Record<string, string> }).metadata).toEqual({ transaction_id: tx.id, plan_id: 'premium_monthly' });
    expect(XENDIT_API_VERSION).toBe('2024-11-11');
    expect((await entitlement()).premium).toBe(false);
  });
  it('gives DANA and GoPay a redirect action and the yearly price', async () => {
    const dana = await createCheckout(deps, user, 'premium_yearly', 'DANA');
    expect(dana).toMatchObject({ amount_idr: 585000, channel: 'DANA' });
    expect(dana.checkout).toMatchObject({ kind: 'redirect' });
    expect(dana.checkout!.value).toMatch(/^https:\/\//);
    const gopay = await createCheckout(deps, user, 'premium_monthly', 'GOPAY');
    expect(gopay.checkout).toMatchObject({ kind: 'redirect' });
    expect(channelProperties('DANA', 'https://x/return', new Date(0))).toEqual({ success_return_url: 'https://x/return', failure_return_url: 'https://x/return' });
  });
  it('rejects other methods, the free plan and unknown plans', async () => {
    for (const [plan, channel] of [['premium_monthly', 'OVO'], ['premium_monthly', 'CARDS'], ['free', 'QRIS'], ['premium_lifetime', 'QRIS']]) {
      await expect(createCheckout(deps, user, plan, channel)).rejects.toBeInstanceOf(PaymentError);
    }
    expect(await db.query('select 1 from payment_transactions where user_id = $1', [user])).toEqual([]);
  });
  it('reuses an open checkout instead of creating a duplicate', async () => {
    const a = await createCheckout(deps, user, 'premium_monthly', 'QRIS');
    const b = await createCheckout(deps, user, 'premium_monthly', 'QRIS');
    expect(b.id).toBe(a.id);
    const c = await createCheckout(deps, user, 'premium_monthly', 'DANA');
    expect(c.id).not.toBe(a.id);
  });
  it('marks the transaction failed when the gateway refuses, without charging', async () => {
    mock.failNextCreate = { status: 503, code: 'CHANNEL_UNAVAILABLE' };
    await expect(createCheckout(deps, user, 'premium_monthly', 'GOPAY')).rejects.toMatchObject({ status: 502, code: 'CHANNEL_UNAVAILABLE' });
    expect(await db.query('select status, failure_code from payment_transactions where user_id = $1', [user])).toEqual([{ status: 'FAILED', failure_code: 'CHANNEL_UNAVAILABLE' }]);
    expect((await entitlement()).premium).toBe(false);
  });
  it('limits how many checkouts one account can open per hour', async () => {
    for (let i = 0; i < 10; i++) {
      mock.failNextCreate = { status: 503, code: 'CHANNEL_UNAVAILABLE' };
      await createCheckout(deps, user, 'premium_monthly', 'QRIS').catch(() => null);
    }
    await expect(createCheckout(deps, user, 'premium_monthly', 'QRIS')).rejects.toMatchObject({ status: 429 });
  });
});

describe('successful payment', () => {
  it('activates 30 days of Premium only after the verified webhook', async () => {
    const tx = await createCheckout(deps, user, 'premium_monthly', 'QRIS');
    // Returning from the payment page changes nothing by itself.
    expect((await refreshPayment(deps, user, tx.id)).status).toBe('PENDING');
    expect((await entitlement()).premium).toBe(false);

    const { results } = await mock.capture(tx.gateway_payment_request_id!);
    expect(results[0]).toEqual({ status: 200, body: { received: true, outcome: 'activated' } });
    const paid = await txRow(tx.id);
    expect(paid.status).toBe('SUCCEEDED');
    expect(paid.paid_at).not.toBeNull();
    expect(paid.gateway_payment_id).toMatch(/^py-/);
    const ent = await entitlement();
    expect(ent).toMatchObject({ premium: true, plan: 'premium_monthly' });
    const [p] = await periods();
    expect(days(p.starts_at, p.expires_at)).toBe(30);
    expect((await refreshPayment(deps, user, tx.id)).status).toBe('SUCCEEDED');
  });
  it('activates 365 days for the yearly plan paid with DANA', async () => {
    const tx = await createCheckout(deps, user, 'premium_yearly', 'DANA');
    await mock.capture(tx.gateway_payment_request_id!);
    const [p] = await periods();
    expect(days(p.starts_at, p.expires_at)).toBe(365);
    expect((await entitlement()).plan).toBe('premium_yearly');
  });
  it('supports the sandbox simulate endpoint end to end (GoPay)', async () => {
    const tx = await createCheckout(deps, user, 'premium_monthly', 'GOPAY');
    expect(await simulateCheckout(deps, user, tx.id)).toMatchObject({ status: 'PENDING' });
    expect((await txRow(tx.id)).status).toBe('SUCCEEDED');
    expect((await entitlement()).premium).toBe(true);
    await expect(simulateCheckout(deps, user, tx.id)).rejects.toMatchObject({ code: 'not_pending' });
  });
  it('refuses to simulate with a live key', async () => {
    const tx = await createCheckout(deps, user, 'premium_monthly', 'QRIS');
    await expect(simulateCheckout({ ...deps, xendit: { ...deps.xendit, secretKey: 'xnd_production_abc' } }, user, tx.id)).rejects.toMatchObject({ code: 'live_mode' });
  });
  it('recovers through the official status API when the webhook never arrives', async () => {
    const tx = await createCheckout(deps, user, 'premium_monthly', 'QRIS');
    const pr = mock.requests.get(tx.gateway_payment_request_id!)!;
    pr.status = 'SUCCEEDED';
    pr.payment_id = 'py-lost-webhook';
    expect((await refreshPayment(deps, user, tx.id)).status).toBe('SUCCEEDED');
    expect((await entitlement()).premium).toBe(true);
    // The late webhook for the same payment must not add a second period.
    const late = await handleWebhook(deps, TOKEN, mock.webhookBody('payment.capture', pr, { captures: [{ capture_id: 'cp-1', capture_amount: 58500 }] }));
    expect(late.body.outcome).toBe('already_processed');
    expect(await periods()).toHaveLength(1);
  });
});

describe('duplicate and replayed webhooks', () => {
  it('extends Premium exactly once when the same webhook arrives three times', async () => {
    const tx = await createCheckout(deps, user, 'premium_monthly', 'QRIS');
    const { results } = await mock.capture(tx.gateway_payment_request_id!, { times: 3 });
    expect(results.map((r) => (r as { body: { outcome: string } }).body.outcome)).toEqual(['activated', 'duplicate', 'duplicate']);
    const p = await periods();
    expect(p).toHaveLength(1);
    expect(days(p[0].starts_at, p[0].expires_at)).toBe(30);
    expect(await db.query('select duplicate_count, outcome from payment_webhook_events where reference_id = $1', [tx.reference_id])).toEqual([{ duplicate_count: 2, outcome: 'activated' }]);
  });
  it('handles concurrent deliveries of the same event', async () => {
    const tx = await createCheckout(deps, user, 'premium_yearly', 'QRIS');
    const pr = mock.requests.get(tx.gateway_payment_request_id!)!;
    pr.payment_id = 'py-concurrent';
    pr.status = 'SUCCEEDED';
    const body = mock.webhookBody('payment.capture', pr, { captures: [{ capture_id: 'cp-c', capture_amount: 585000 }] });
    const out = await Promise.all([1, 2, 3, 4].map(() => handleWebhook(deps, TOKEN, body)));
    expect(out.map((o) => o.body.outcome).sort()).toEqual(['activated', 'duplicate', 'duplicate', 'duplicate']);
    expect(await periods()).toHaveLength(1);
  });
});

describe('rejected webhooks', () => {
  it('ignores a webhook without the correct callback token', async () => {
    const tx = await createCheckout(deps, user, 'premium_monthly', 'QRIS');
    const pr = mock.requests.get(tx.gateway_payment_request_id!)!;
    const body = mock.webhookBody('payment.capture', { ...pr, status: 'SUCCEEDED', payment_id: 'py-forged' }, { captures: [{ capture_id: 'cp-f', capture_amount: 58500 }] });
    for (const token of [null, '', 'wrong', TOKEN + 'x', TOKEN.slice(0, -1)]) {
      expect(await handleWebhook(deps, token, body)).toEqual({ status: 401, body: { error: 'invalid_callback_token' } });
    }
    expect((await txRow(tx.id)).status).toBe('PENDING');
    expect((await entitlement()).premium).toBe(false);
    expect(await db.query('select 1 from payment_webhook_events where reference_id = $1', [tx.reference_id])).toEqual([]);
  });
  it('does not activate when the amount does not match', async () => {
    const tx = await createCheckout(deps, user, 'premium_yearly', 'QRIS');
    const { results } = await mock.capture(tx.gateway_payment_request_id!, { amount: 58500 });
    expect((results[0] as { body: { outcome: string } }).body.outcome).toBe('amount_mismatch');
    expect(await txRow(tx.id)).toMatchObject({ status: 'NEEDS_REVIEW', failure_code: 'AMOUNT_MISMATCH' });
    expect((await entitlement()).premium).toBe(false);
    expect(await periods()).toEqual([]);
  });
  it('does not activate when captured and requested amounts differ', async () => {
    const tx = await createCheckout(deps, user, 'premium_monthly', 'QRIS');
    const pr = mock.requests.get(tx.gateway_payment_request_id!)!;
    const body = mock.webhookBody('payment.capture', { ...pr, status: 'SUCCEEDED', payment_id: 'py-partial' }, { request_amount: 58500, captures: [{ capture_id: 'cp-p', capture_amount: 100 }] });
    expect((await handleWebhook(deps, TOKEN, body)).body.outcome).toBe('amount_mismatch');
    expect((await entitlement()).premium).toBe(false);
  });
  it('does not activate for a non-IDR currency or an unknown reference', async () => {
    const tx = await createCheckout(deps, user, 'premium_monthly', 'QRIS');
    const { results } = await mock.capture(tx.gateway_payment_request_id!, { currency: 'USD' });
    expect((results[0] as { body: { outcome: string } }).body.outcome).toBe('amount_mismatch');
    const ghost = JSON.stringify({ event: 'payment.capture', data: { payment_id: 'py-ghost', payment_request_id: 'pr-ghost', reference_id: 'LTR-unknown', status: 'SUCCEEDED', request_amount: 58500, currency: 'IDR', channel_code: 'QRIS' } });
    expect(await handleWebhook(deps, TOKEN, ghost)).toEqual({ status: 200, body: { received: true, outcome: 'unknown_reference' } });
    expect((await entitlement()).premium).toBe(false);
  });
  it('does not activate when the gateway request id belongs to another transaction', async () => {
    const mine = await createCheckout(deps, user, 'premium_yearly', 'QRIS');
    const other = await newUser(db, 'Lain');
    const cheap = await createCheckout(deps, other, 'premium_monthly', 'QRIS');
    const body = JSON.stringify({ event: 'payment.capture', data: { payment_id: 'py-swap', payment_request_id: cheap.gateway_payment_request_id, reference_id: mine.reference_id, status: 'SUCCEEDED', request_amount: 585000, currency: 'IDR', channel_code: 'QRIS' } });
    expect((await handleWebhook(deps, TOKEN, body)).body.outcome).toBe('request_mismatch');
    expect((await entitlement()).premium).toBe(false);
  });
  it('rejects malformed bodies', async () => {
    expect((await handleWebhook(deps, TOKEN, 'not json')).status).toBe(400);
    expect((await handleWebhook(deps, TOKEN, '{}')).status).toBe(400);
    expect((await handleWebhook(deps, TOKEN, JSON.stringify({ event: 'payment.capture', data: {} }))).status).toBe(400);
  });
  it('never stores payer details from the webhook payload', async () => {
    const tx = await createCheckout(deps, user, 'premium_monthly', 'DANA');
    await mock.capture(tx.gateway_payment_request_id!);
    const [ev] = await db.query<{ payload: unknown }>('select payload from payment_webhook_events where reference_id = $1', [tx.reference_id]);
    const stored = JSON.stringify(ev.payload);
    expect(stored).not.toContain('MOCK PAYER');
    expect(stored).not.toContain('payment_details');
    expect(stored).toContain(tx.reference_id);
  });
});

describe('failed, pending and expired payments', () => {
  it('marks a declined payment as failed and leaves the account Free', async () => {
    const tx = await createCheckout(deps, user, 'premium_monthly', 'GOPAY');
    const r = (await mock.fail(tx.gateway_payment_request_id!, 'USER_DECLINED_PAYMENT')) as { body: { outcome: string } };
    expect(r.body.outcome).toBe('failed');
    expect(await txRow(tx.id)).toMatchObject({ status: 'FAILED', failure_code: 'USER_DECLINED_PAYMENT' });
    expect((await entitlement()).premium).toBe(false);
    // The user can simply try again with a new checkout.
    const retry = await createCheckout(deps, user, 'premium_monthly', 'GOPAY');
    expect(retry.id).not.toBe(tx.id);
    expect(retry.status).toBe('PENDING');
  });
  it('keeps a pending payment pending until Xendit reports a result', async () => {
    const tx = await createCheckout(deps, user, 'premium_monthly', 'DANA');
    clock += 10 * 60_000;
    expect((await refreshPayment(deps, user, tx.id)).status).toBe('PENDING');
    expect((await entitlement()).premium).toBe(false);
    const authorization = mock.webhookBody('payment.authorization', { ...mock.requests.get(tx.gateway_payment_request_id!)!, payment_id: 'py-auth', status: 'AUTHORIZED' });
    expect((await handleWebhook(deps, TOKEN, authorization)).body.outcome).toBe('ignored');
    expect((await txRow(tx.id)).status).toBe('PENDING');
  });
  it('expires an unpaid checkout after the payment window and cancels it at the gateway', async () => {
    const tx = await createCheckout(deps, user, 'premium_monthly', 'DANA');
    clock += 31 * 60_000;
    expect((await refreshPayment(deps, user, tx.id)).status).toBe('EXPIRED');
    expect(mock.requests.get(tx.gateway_payment_request_id!)!.status).toBe('CANCELED');
    expect((await entitlement()).premium).toBe(false);
  });
  it('handles the gateway expiry webhook', async () => {
    const tx = await createCheckout(deps, user, 'premium_monthly', 'QRIS');
    const r = (await mock.expire(tx.gateway_payment_request_id!)) as { body: { outcome: string } };
    expect(r.body.outcome).toBe('expired');
    expect((await txRow(tx.id)).status).toBe('EXPIRED');
  });
  it('still honours money that arrives after the local window closed', async () => {
    const tx = await createCheckout(deps, user, 'premium_monthly', 'QRIS');
    await db.query("update payment_transactions set status = 'EXPIRED' where id = $1", [tx.id]);
    const { results } = await mock.capture(tx.gateway_payment_request_id!);
    expect((results[0] as { body: { outcome: string } }).body.outcome).toBe('activated');
    expect((await entitlement()).premium).toBe(true);
  });
  it('lets no one read another account’s transaction', async () => {
    const tx = await createCheckout(deps, user, 'premium_monthly', 'QRIS');
    const stranger = await newUser(db, 'Orang Lain');
    await expect(refreshPayment(deps, stranger, tx.id)).rejects.toMatchObject({ status: 404 });
    await expect(simulateCheckout(deps, stranger, tx.id)).rejects.toMatchObject({ status: 404 });
  });
});

describe('premium lifetime', () => {
  it('returns to Free automatically when the period ends, keeping all progress', async () => {
    const tx = await createCheckout(deps, user, 'premium_monthly', 'QRIS');
    await mock.capture(tx.gateway_payment_request_id!);
    await db.rpc('sync_learner', { p_user: user, p_events: [{ id: 'k1', kind: 'xp', at: Date.now(), data: { amount: 50, reason: 'lesson' } }], p_snapshot: { streak: { current: 7, longest: 7, lastDate: '2026-11-13', freezes: 1 }, topics: {}, reviews: {}, lessons: {} }, p_client_updated_at: 5 });
    expect((await entitlement()).premium).toBe(true);
    // Move the period into the past: 31 days later.
    await db.query("update subscriptions set starts_at = starts_at - interval '31 days', expires_at = expires_at - interval '31 days' where user_id = $1", [user]);
    expect(await entitlement()).toEqual({ premium: false, plan: 'free', expires_at: null });
    expect(await db.query('select sum(amount)::int as xp from xp_transactions where user_id = $1', [user])).toEqual([{ xp: 50 }]);
    expect(await db.query('select current_streak from streaks where user_id = $1', [user])).toEqual([{ current_streak: 7 }]);
    expect(await db.query('select status from payment_transactions where user_id = $1', [user])).toEqual([{ status: 'SUCCEEDED' }]);
  });
  it('stacks an early renewal after the current period and restarts after a gap', async () => {
    const first = await createCheckout(deps, user, 'premium_monthly', 'QRIS');
    await mock.capture(first.gateway_payment_request_id!);
    const renew = await createCheckout(deps, user, 'premium_monthly', 'DANA');
    await mock.capture(renew.gateway_payment_request_id!);
    let p = await periods();
    expect(p).toHaveLength(2);
    expect(new Date(p[1].starts_at).getTime()).toBe(new Date(p[0].expires_at).getTime());
    expect(days(new Date(), (await entitlement()).expires_at!)).toBe(60);

    await db.query("update subscriptions set starts_at = starts_at - interval '90 days', expires_at = expires_at - interval '90 days' where user_id = $1", [user]);
    expect((await entitlement()).premium).toBe(false);
    const again = await createCheckout(deps, user, 'premium_monthly', 'GOPAY');
    await mock.capture(again.gateway_payment_request_id!);
    p = await periods();
    expect(days(new Date(), p[2].starts_at)).toBe(0);
    expect(days(new Date(), (await entitlement()).expires_at!)).toBe(30);
  });
});

describe('account history and admin dashboard', () => {
  it('lists the user’s transactions and subscription periods', async () => {
    const tx = await createCheckout(deps, user, 'premium_monthly', 'QRIS');
    await mock.capture(tx.gateway_payment_request_id!);
    const failed = await createCheckout(deps, user, 'premium_yearly', 'DANA');
    await mock.fail(failed.gateway_payment_request_id!);
    const list = await db.rpc<{ transactions: { status: string; amount_idr: number; channel: string; plan_name: string }[]; periods: unknown[]; entitlement: Ent }>('list_payments', { p_user: user });
    expect(list.transactions.map((t) => [t.status, t.amount_idr, t.channel]).sort()).toEqual([['FAILED', 585000, 'DANA'], ['SUCCEEDED', 58500, 'QRIS']]);
    expect(list.periods).toHaveLength(1);
    expect(list.entitlement.premium).toBe(true);
  });
  it('gives admins users, transaction counts, revenue, subscribers and the webhook log', async () => {
    const admin = await newUser(db, 'Admin Keu', 'admin');
    const before = await db.rpc<{ revenue: { month: number; year: number }; transactions: { succeeded: number } }>('admin_payment_overview', { p_actor: admin });
    const tx = await createCheckout(deps, user, 'premium_yearly', 'QRIS');
    await mock.capture(tx.gateway_payment_request_id!, { times: 2 });
    await createCheckout(deps, user, 'premium_monthly', 'DANA');
    const o = await db.rpc<{
      users: { total: number; premium: number; free: number };
      transactions: { succeeded: number; pending: number; failed: number; needs_review: number };
      revenue: { month: number; year: number; by_month: { month: string; total: number }[] };
      history: { reference_id: string; status: string }[];
      subscribers: { user_id: string; expires_at: string }[];
      webhooks: { last_received_at: string; log: { event_key: string; outcome: string; duplicates: number }[]; last_24h: Record<string, number> };
    }>('admin_payment_overview', { p_actor: admin });
    expect(o.users.total).toBe(o.users.premium + o.users.free);
    expect(o.users.premium).toBeGreaterThan(0);
    expect(o.transactions.succeeded).toBe(before.transactions.succeeded + 1);
    expect(o.transactions.pending).toBeGreaterThan(0);
    expect(o.transactions.failed).toBeGreaterThan(0);
    expect(o.transactions.needs_review).toBeGreaterThan(0);
    expect(o.revenue.month - before.revenue.month).toBe(585000);
    expect(o.revenue.year - before.revenue.year).toBe(585000);
    expect(o.revenue.by_month.at(-1)!.total).toBe(o.revenue.month);
    expect(o.history.find((h) => h.reference_id === tx.reference_id)?.status).toBe('SUCCEEDED');
    expect(o.subscribers.some((s) => s.user_id === user)).toBe(true);
    expect(o.webhooks.last_received_at).toBeTruthy();
    expect(o.webhooks.log.find((l) => l.event_key.startsWith('payment.capture:') && l.duplicates === 1)?.outcome).toBe('activated');
    expect(o.webhooks.last_24h.activated).toBeGreaterThan(0);
  });
});
