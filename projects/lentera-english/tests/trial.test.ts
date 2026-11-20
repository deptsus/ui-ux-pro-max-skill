// Trial Premium 3 hari (migration 0021): every account created after the migration gets Premium
// for 3 days; older accounts do not. The trial is the last source of Premium:
// admin > paid subscription > school licence > trial.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import path from 'node:path';
import { openEmbedded, type RawDb } from '@/lib/server/db';
import { isPremium } from '@/lib/engine/types';
import { newUser } from './helpers';

type Ent = { premium: boolean; plan: string; expires_at: string | null };
let db: RawDb;
const ent = async (u: string) => (await db.rpc<{ entitlement: Ent }>('get_account', { p_user: u })).entitlement;
const HOUR = 3_600_000;

beforeAll(async () => {
  db = await openEmbedded(undefined, path.resolve(__dirname, '..'));
});
afterAll(async () => {
  await db.close();
});

describe('trial Premium 3 hari', () => {
  it('akun baru otomatis Premium uji coba selama 3 hari (plan "trial")', async () => {
    const u = await newUser(db, 'Baru', 'student', true);
    const e = await ent(u);
    expect(e.premium).toBe(true);
    expect(e.plan).toBe('trial');
    const left = Date.parse(e.expires_at!) - Date.now();
    expect(left).toBeGreaterThan(72 * HOUR - 5 * 60_000);
    expect(left).toBeLessThanOrEqual(72 * HOUR);
    // The app treats it as Premium until the end, then as Free.
    const client = { premium: true, plan: 'trial', expiresAt: Date.parse(e.expires_at!) };
    expect(isPremium(client, Date.now())).toBe(true);
    expect(isPremium(client, client.expiresAt + 1)).toBe(false);
  });

  it('akun lama (sebelum migrasi, tanpa tanggal trial) tetap Free', async () => {
    const u = await newUser(db, 'Lama');
    expect(await ent(u)).toMatchObject({ premium: false, plan: 'free' });
  });

  it('trial yang sudah lewat kembali Free; trial hanya sekali per akun', async () => {
    const u = await newUser(db, 'Habis', 'student', true);
    await db.query("update profiles set trial_ends_at = now() - interval '1 minute' where id = $1", [u]);
    expect(await ent(u)).toMatchObject({ premium: false, plan: 'free' });
    // Signing in again (get_account) does not start a new trial.
    expect(await ent(u)).toMatchObject({ premium: false, plan: 'free' });
  });

  it('langganan berbayar selalu menang atas trial; pembayaran tidak berubah', async () => {
    const u = await newUser(db, 'Bayar', 'student', true);
    const [tx] = await db.query<{ id: string }>(`insert into payment_transactions (user_id, plan_id, reference_id, amount_idr, channel, status, paid_at)
      values ($1, 'premium_monthly', $2, 58500, 'QRIS', 'SUCCEEDED', now()) returning id`, [u, `LTR-TRIAL-${Date.now()}`]);
    await db.query("insert into subscriptions (user_id, plan_id, starts_at, expires_at, source_transaction_id) values ($1, 'premium_monthly', now(), now() + interval '30 days', $2)", [u, tx.id]);
    const e = await ent(u);
    expect(e.plan).toBe('premium_monthly');
    expect(Date.parse(e.expires_at!) - Date.now()).toBeGreaterThan(29 * 24 * HOUR);
  });

  it('admin tetap admin walau baru membuat akun', async () => {
    const u = await newUser(db, 'Admin Baru', 'admin', true);
    expect(await ent(u)).toMatchObject({ premium: true, plan: 'admin', expires_at: null });
  });

  it('statistik admin tidak menghitung akun trial sebagai pelanggan', async () => {
    const before = await db.query<{ n: number }>('select count(*)::int as n from subscriptions where expires_at > now()');
    await newUser(db, 'Trial Statistik', 'student', true);
    const after = await db.query<{ n: number }>('select count(*)::int as n from subscriptions where expires_at > now()');
    expect(after[0].n).toBe(before[0].n);
  });

  it('fitur "trial" tercatat di content_features', async () => {
    expect(await db.rpc<string[]>('content_features', {})).toContain('trial');
  });
});
