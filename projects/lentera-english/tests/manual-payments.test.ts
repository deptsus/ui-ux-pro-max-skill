// Manual QRIS payments against real SQL (PGlite): the learner pays the owner's
// own QRIS and reports it; only an admin confirmation grants Premium.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import path from 'node:path';
import { crc16, qrisProblems, readQris } from '@/lib/qris';
import { PLANS } from '@/lib/plans';
import { openEmbedded, type RawDb } from '@/lib/server/db';
import { claimManualPayment, createManualCheckout, getManualPayment } from '@/lib/server/manual-payments';
import { PaymentError, type Transaction } from '@/lib/server/payments';
import { newUser } from './helpers';

const ROOT = path.resolve(__dirname, '..');
const DAY = 86_400_000;
let db: RawDb;
let admin: string;
let user: string;

interface Ent { premium: boolean; plan: string; expires_at: string | null }
const entitlement = (u = user) => db.rpc<Ent>('get_entitlement', { p_user: u });
const periods = (u = user) => db.query<{ plan_id: string; starts_at: Date; expires_at: Date }>('select plan_id, starts_at, expires_at from subscriptions where user_id = $1 order by starts_at', [u]);
const days = (a: Date | string, b: Date | string) => Math.round((new Date(b).getTime() - new Date(a).getTime()) / DAY);
const confirm = (tx: string, actor = admin) => db.rpc<{ outcome: string; transaction: Transaction; entitlement: Ent }>('admin_confirm_payment', { p_actor: actor, p_tx: tx, p_note: '' });
const reject = (tx: string, reason: string, actor = admin) => db.rpc<{ outcome: string; transaction: Transaction }>('admin_reject_payment', { p_actor: actor, p_tx: tx, p_reason: reason });
const status = async (id: string) => (await db.query<{ status: string }>('select status from payment_transactions where id = $1', [id]))[0].status;

beforeAll(async () => {
  db = await openEmbedded(undefined, ROOT);
  admin = await newUser(db, 'Admin', 'admin');
});
afterAll(async () => {
  await db.close();
});
beforeEach(async () => {
  user = await newUser(db, 'Pembeli');
});

describe('QRIS payloads', () => {
  it('stores a valid dynamic rupiah QRIS for each plan, with the plan price embedded', async () => {
    const plans = await db.query<{ id: string; price_idr: number; list_price_idr: number | null; qris_payload: string }>("select id, price_idr, list_price_idr, qris_payload from subscription_plans where price_idr > 0 order by id");
    expect(plans.map((p) => p.id)).toEqual(['premium_monthly', 'premium_yearly']);
    for (const p of plans) {
      expect(qrisProblems(p.qris_payload, p.price_idr), p.id).toEqual([]);
      const info = readQris(p.qris_payload);
      expect(info).toMatchObject({ pointOfInitiation: '12', currency: '360', country: 'ID', nmid: 'ID1026639132426', crcValid: true, amount: p.price_idr });
      // The display prices in src/lib/plans.ts must agree with the database.
      const shown = PLANS[p.id as keyof typeof PLANS];
      expect([shown.price, shown.listPrice]).toEqual([p.price_idr, p.list_price_idr]);
    }
  });
  it('rejects a QR with the wrong amount, a broken checksum, or no amount', async () => {
    const [{ qris_payload: monthly }] = await db.query<{ qris_payload: string }>("select qris_payload from subscription_plans where id = 'premium_monthly'");
    expect(qrisProblems(monthly, 497250).join(' ')).toMatch(/berbeda dengan harga paket/);
    expect(qrisProblems(monthly.slice(0, -1) + (monthly.endsWith('A') ? 'B' : 'A'), 58500).join(' ')).toMatch(/Checksum/);
    // Same QR with the amount (tag 54) removed and a fresh checksum: a static QR.
    const noAmount = monthly.replace('540558500', '').slice(0, -4);
    expect(qrisProblems(noAmount + crc16(noAmount), 58500).join(' ')).toMatch(/tidak berisi nominal/);
    expect(qrisProblems('not a qris', 58500).length).toBeGreaterThan(0);
  });
  it('refuses to show a QR whose amount does not match the plan', async () => {
    await db.query("update subscription_plans set price_idr = 60000 where id = 'premium_monthly'");
    try {
      await expect(createManualCheckout(db, user, 'premium_monthly')).rejects.toMatchObject({ status: 503, code: 'qris_invalid' });
    } finally {
      await db.query("update subscription_plans set price_idr = 58500 where id = 'premium_monthly'");
      await db.query("delete from payment_transactions where user_id = $1", [user]);
    }
  });
});

describe('checkout and report', () => {
  it('charges the server price and copies the plan QR into the transaction', async () => {
    const tx = await createManualCheckout(db, user, 'premium_yearly');
    expect(tx).toMatchObject({ status: 'PENDING', amount_idr: 497250, channel: 'QRIS', method: 'manual_qris', plan_id: 'premium_yearly' });
    expect(readQris(tx.checkout!.value).amount).toBe(497250);
    expect(new Date(tx.expires_at!).getTime() - Date.now()).toBeGreaterThan(23.9 * 3600_000);
    expect(tx).not.toHaveProperty('reviewed_by');
  });
  it('reopens the same checkout instead of creating duplicates', async () => {
    const a = await createManualCheckout(db, user, 'premium_monthly');
    const b = await createManualCheckout(db, user, 'premium_monthly');
    expect(b.id).toBe(a.id);
    const c = await createManualCheckout(db, user, 'premium_yearly');
    expect(c.id).not.toBe(a.id);
  });
  it('refuses unknown or free plans', async () => {
    for (const plan of ['free', 'premium_lifetime', '']) await expect(createManualCheckout(db, user, plan)).rejects.toBeInstanceOf(PaymentError);
  });
  it('limits checkouts per hour', async () => {
    await db.query("insert into payment_transactions (user_id, plan_id, reference_id, amount_idr, channel, method, status) select $1, 'premium_monthly', 'LTR-RL' || g, 58500, 'QRIS', 'manual_qris', 'FAILED' from generate_series(1, 10) g", [user]);
    await expect(createManualCheckout(db, user, 'premium_monthly')).rejects.toMatchObject({ status: 429 });
  });
  it('a report queues the payment but grants nothing', async () => {
    const tx = await createManualCheckout(db, user, 'premium_monthly');
    await expect(claimManualPayment(db, user, tx.id, '   ', '')).rejects.toMatchObject({ status: 400, code: 'payer_name_required' });
    const claimed = await claimManualPayment(db, user, tx.id, '  Dewi Lestari ', 'GoPay 14.05');
    expect(claimed).toMatchObject({ status: 'AWAITING_CONFIRMATION', payer_name: 'Dewi Lestari', payer_note: 'GoPay 14.05' });
    expect(claimed.claimed_at).toBeTruthy();
    expect((await entitlement()).premium).toBe(false);
    expect(await periods()).toEqual([]);
    // Reporting again (e.g. fixing the name) keeps it queued.
    expect((await claimManualPayment(db, user, tx.id, 'Dewi L.', '')).status).toBe('AWAITING_CONFIRMATION');
  });
  it('a learner cannot report or read someone else’s payment', async () => {
    const other = await newUser(db, 'Orang Lain');
    const tx = await createManualCheckout(db, other, 'premium_monthly');
    await expect(claimManualPayment(db, user, tx.id, 'Saya', '')).rejects.toMatchObject({ status: 404 });
    await expect(getManualPayment(db, user, tx.id)).rejects.toMatchObject({ status: 404 });
  });
});

describe('admin decision', () => {
  it('confirming grants exactly one period of the right length', async () => {
    const tx = await createManualCheckout(db, user, 'premium_yearly');
    await claimManualPayment(db, user, tx.id, 'Dewi', '');
    const r = await confirm(tx.id);
    expect(r.outcome).toBe('activated');
    expect(r.transaction).toMatchObject({ status: 'SUCCEEDED', reviewed_by: admin });
    expect(r.entitlement).toMatchObject({ premium: true, plan: 'premium_yearly' });
    const p = await periods();
    expect(p).toHaveLength(1);
    expect(days(p[0].starts_at, p[0].expires_at)).toBe(365);
    // A double click, or two admins at once, changes nothing.
    const again = await Promise.all([confirm(tx.id), confirm(tx.id)]);
    expect(again.map((x) => x.outcome)).toEqual(['already_processed', 'already_processed']);
    expect(await periods()).toHaveLength(1);
    const log = await db.query<{ source: string; outcome: string; duplicate_count: number }>('select source, outcome, duplicate_count from payment_webhook_events where transaction_id = $1', [tx.id]);
    expect(log).toEqual([{ source: 'admin', outcome: 'activated', duplicate_count: 0 }]);
  });
  it('an early renewal starts when the current period ends', async () => {
    const first = await createManualCheckout(db, user, 'premium_monthly');
    await confirm(first.id);
    const second = await createManualCheckout(db, user, 'premium_monthly');
    expect(second.id).not.toBe(first.id);
    await confirm(second.id);
    const p = await periods();
    expect(p).toHaveLength(2);
    expect(p[1].starts_at.getTime()).toBe(p[0].expires_at.getTime());
    expect(days(p[0].starts_at, p[1].expires_at)).toBe(60);
  });
  it('only an admin can confirm or reject', async () => {
    const tx = await createManualCheckout(db, user, 'premium_monthly');
    await claimManualPayment(db, user, tx.id, 'Dewi', '');
    await expect(confirm(tx.id, user)).rejects.toThrow(/forbidden/);
    await expect(reject(tx.id, 'no', user)).rejects.toThrow(/forbidden/);
    expect(await status(tx.id)).toBe('AWAITING_CONFIRMATION');
    expect((await entitlement()).premium).toBe(false);
  });
  it('a rejection needs a reason, shows it to the learner, and can be reversed by confirming', async () => {
    const tx = await createManualCheckout(db, user, 'premium_monthly');
    await claimManualPayment(db, user, tx.id, 'Dewi', '');
    await expect(reject(tx.id, '  ')).rejects.toThrow(/reason_required/);
    await reject(tx.id, 'Tidak ada dana masuk atas nama Dewi.');
    const seen = await getManualPayment(db, user, tx.id);
    expect(seen).toMatchObject({ status: 'FAILED', failure_code: 'REJECTED', review_note: 'Tidak ada dana masuk atas nama Dewi.' });
    expect(seen).not.toHaveProperty('reviewed_by');
    await expect(claimManualPayment(db, user, tx.id, 'Dewi', '')).rejects.toMatchObject({ status: 409 });
    // The admin found the money after all.
    expect((await confirm(tx.id)).outcome).toBe('activated');
    expect((await entitlement()).premium).toBe(true);
  });
  it('an unreported checkout closes after 24 hours but a late payment can still be reported and confirmed', async () => {
    const tx = await createManualCheckout(db, user, 'premium_monthly');
    await db.query("update payment_transactions set expires_at = now() - interval '1 minute' where id = $1", [tx.id]);
    expect((await getManualPayment(db, user, tx.id)).status).toBe('EXPIRED');
    // A new checkout is a fresh transaction, not the expired one.
    const fresh = await createManualCheckout(db, user, 'premium_monthly');
    expect(fresh.id).not.toBe(tx.id);
    expect((await claimManualPayment(db, user, tx.id, 'Dewi', 'bayar kemarin')).status).toBe('AWAITING_CONFIRMATION');
    expect((await confirm(tx.id)).outcome).toBe('activated');
  });
  it('a reported payment never expires on its own', async () => {
    const tx = await createManualCheckout(db, user, 'premium_monthly');
    await claimManualPayment(db, user, tx.id, 'Dewi', '');
    await db.query("update payment_transactions set expires_at = now() - interval '3 days' where id = $1", [tx.id]);
    expect((await getManualPayment(db, user, tx.id)).status).toBe('AWAITING_CONFIRMATION');
  });
  it('the admin overview lists the queue, reported payments first', async () => {
    const reported = await createManualCheckout(db, user, 'premium_yearly');
    await claimManualPayment(db, user, reported.id, 'Dewi', 'OVO');
    const other = await newUser(db, 'Belum Lapor');
    const unreported = await createManualCheckout(db, other, 'premium_monthly');
    const o = await db.rpc<{ transactions: { awaiting: number }; queue: { id: string; status: string; payer_name: string | null }[] }>('admin_payment_overview', { p_actor: admin });
    const ids = o.queue.map((q) => q.id);
    expect(ids).toContain(reported.id);
    expect(ids).toContain(unreported.id);
    expect(ids.indexOf(reported.id)).toBeLessThan(ids.indexOf(unreported.id));
    expect(o.queue.find((q) => q.id === reported.id)).toMatchObject({ status: 'AWAITING_CONFIRMATION', payer_name: 'Dewi' });
    expect(o.transactions.awaiting).toBeGreaterThanOrEqual(1);
    await expect(db.rpc('admin_payment_overview', { p_actor: user })).rejects.toThrow(/forbidden/);
  });
  it('API roles cannot call the payment functions directly', async () => {
    for (const fn of ['admin_confirm_payment(uuid,uuid,text)', 'claim_manual_payment(uuid,uuid,text,text)', 'create_manual_payment(uuid,text)']) {
      const [{ anon, authed }] = await db.query<{ anon: boolean; authed: boolean }>(`select has_function_privilege('anon', '${fn}', 'execute') as anon, has_function_privilege('authenticated', '${fn}', 'execute') as authed`);
      expect([fn, anon, authed]).toEqual([fn, false, false]);
    }
  });
});
