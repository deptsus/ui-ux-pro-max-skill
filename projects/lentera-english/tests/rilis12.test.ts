// Rilis 12: level-exam time limits checked on the server (migration 0017) and
// a larger exam bank.
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import path from 'node:path';
import { EXAM_BANK } from '@content/exam-bank';
import webpush from 'web-push';
import { isLateSubmission, LATE_GRACE_SEC } from '@/lib/engine/levelExam';
import { createState, finishMastery, GUEST_OUTBOX_MAX } from '@/lib/engine/state';
import { buildPack } from '@content/index';
import { indexContent } from '@/lib/content/types';
import { expiryMessage, runExpiryReminders } from '@/lib/server/reminders';
import { openEmbedded, type RawDb } from '@/lib/server/db';
import { newUser } from './helpers';

describe('batas waktu ujian level di server', () => {
  const T = Date.parse('2026-11-16T03:00:00Z');
  it('terlambat hanya bila lewat batas waktu ditambah toleransi 2 menit', () => {
    expect(LATE_GRACE_SEC).toBe(120);
    expect(isLateSubmission(T, T + 30 * 60_000, 30 * 60)).toBe(false);
    expect(isLateSubmission(T, T + 30 * 60_000 + 119_000, 30 * 60)).toBe(false);
    expect(isLateSubmission(T, T + 30 * 60_000 + 121_000, 30 * 60)).toBe(true);
    expect(isLateSubmission(null, T + 10 * 3600_000, 30 * 60)).toBe(false);
  });

  describe('migrasi 0017', () => {
    let db: RawDb;
    let ani: string;
    beforeAll(async () => {
      db = await openEmbedded(undefined, path.resolve(__dirname, '..'));
      ani = await newUser(db, 'Ani R12');
    });
    afterAll(async () => {
      await db.close();
    });
    it('waktu mulai dicatat sekali per percobaan; memulai ulang tidak mengulang jam', async () => {
      expect(await db.rpc('content_features')).toContain('exam_timing');
      const first = await db.rpc<string>('level_exam_begin', { p_user: ani, p_exam: 'exam.level.A1', p_attempt: 0 });
      await db.query("update level_exam_starts set started_at = started_at - interval '40 minutes' where user_id = $1", [ani]);
      const again = await db.rpc<string>('level_exam_begin', { p_user: ani, p_exam: 'exam.level.A1', p_attempt: 0 });
      expect(Date.parse(first) - Date.parse(again)).toBe(40 * 60_000);
      const next = await db.rpc<string>('level_exam_begin', { p_user: ani, p_exam: 'exam.level.A1', p_attempt: 1 });
      expect(Date.parse(next)).toBeGreaterThan(Date.parse(again));
      const [row] = await db.query<{ rls: boolean }>("select relrowsecurity as rls from pg_class where relname = 'level_exam_starts'");
      expect(row.rls).toBe(true);
    });
  });
});

describe('bank soal ujian level', () => {
  it('16 soal tata bahasa dan kosakata per level, 8 diambil tiap percobaan', () => {
    for (const [level, bank] of Object.entries(EXAM_BANK)) expect(bank.grammar, level).toHaveLength(16);
  });
});

describe('pengingat Premium hampir habis', () => {
  let db: RawDb;
  beforeAll(async () => {
    db = await openEmbedded(undefined, path.resolve(__dirname, '..'));
  });
  afterAll(async () => {
    await db.close();
  });
  afterEach(() => vi.restoreAllMocks());

  const device = (name: string) => ({ endpoint: `https://push.example.test/x/${name}`, p256dh: 'B'.repeat(87), auth: 'A'.repeat(22) });
  async function paid(user: string, ref: string, endsInDays: number) {
    const [tx] = await db.query<{ id: string }>(`insert into payment_transactions (user_id, plan_id, reference_id, amount_idr, channel, status, paid_at)
      values ($1, 'premium_monthly', $2, 58500, 'QRIS', 'SUCCEEDED', now()) returning id`, [user, ref]);
    await db.query(`insert into subscriptions (user_id, plan_id, starts_at, expires_at, source_transaction_id) values ($1, 'premium_monthly', now() - interval '27 days', now() + make_interval(days => $2::int), $3)`, [user, endsInDays, tx.id]);
  }

  it('pesannya menyebut sisa hari dan mengarah ke halaman paket', () => {
    const now = Date.parse('2026-11-16T03:00:00Z');
    expect(expiryMessage('2026-11-19T03:00:00Z', now)).toMatchObject({ title: 'Premium-mu berakhir 3 hari lagi', url: '/app/subscription', tag: 'lentera-premium-expiry' });
    expect(expiryMessage('2026-11-17T01:00:00Z', now).title).toBe('Premium-mu berakhir besok');
  });

  it('hanya pelajar berbayar yang berakhir ≤3 hari dan punya HP terdaftar; sekali per periode; tidak di malam hari', async () => {
    const budi = await newUser(db, 'Budi Exp');
    const cici = await newUser(db, 'Cici Exp');
    const dodi = await newUser(db, 'Dodi Exp');
    await paid(budi, 'exp-1', 2);
    await paid(cici, 'exp-2', 20);
    await paid(dodi, 'exp-3', 1);
    for (const [u, n] of [[budi, 'budi'], [cici, 'cici']] as const) await db.rpc('save_reminder_subscription', { p_user: u, p_endpoint: device(n).endpoint, p_p256dh: device(n).p256dh, p_auth: device(n).auth, p_user_agent: 'vitest' });
    const targets = await db.rpc<{ user_id: string }[]>('premium_expiry_targets', { p_days: 3 });
    expect(targets.map((t) => t.user_id)).toEqual([budi]);

    const sent: string[] = [];
    vi.spyOn(webpush, 'sendNotification').mockImplementation(async (sub) => { sent.push(sub.endpoint); return { statusCode: 201, body: '', headers: {} }; });
    const night = Date.parse('2026-11-16T16:00:00Z'); // 23.00 WIB
    expect(await runExpiryReminders(db, { now: night })).toEqual({ skipped: 'quiet-hours' });
    const day = Date.parse('2026-11-16T03:00:00Z'); // 10.00 WIB
    expect(await runExpiryReminders(db, { now: day })).toMatchObject({ learners: 1, reminded: 1, sent: 1 });
    expect(sent).toEqual([device('budi').endpoint]);
    expect(await runExpiryReminders(db, { now: day + 60_000 })).toEqual({ skipped: 'ran-recently' });
    await db.query("delete from job_runs where job = 'expiry-reminders'");
    expect(await runExpiryReminders(db, { now: day + 6 * 3600_000 })).toMatchObject({ learners: 1, reminded: 0 });
    expect(sent).toHaveLength(1);
  });
});

describe('antrean event tamu', () => {
  it('dibatasi; jawaban per soal dibuang lebih dulu, pelajaran tetap tersimpan', () => {
    const ix = indexContent(buildPack());
    const s = createState('guest', 0);
    finishMastery(s, ix, 'a1-greetings', 95, 1);
    const lessonEvents = s.outbox.filter((e) => e.kind === 'lesson').length;
    expect(lessonEvents).toBeGreaterThan(0);
    for (let i = 0; i < GUEST_OUTBOX_MAX + 500; i++) s.outbox.push({ id: `fill${i}`, kind: 'attempt', at: 2, data: {} });
    finishMastery(s, ix, 'a1-to-be', 95, 3);
    expect(s.outbox.length).toBeLessThanOrEqual(GUEST_OUTBOX_MAX);
    expect(s.outbox.filter((e) => e.kind === 'lesson').length).toBeGreaterThan(lessonEvents);
    const account = createState('user-1', 0);
    for (let i = 0; i < GUEST_OUTBOX_MAX + 10; i++) account.outbox.push({ id: `a${i}`, kind: 'attempt', at: 2, data: {} });
    finishMastery(account, ix, 'a1-greetings', 95, 3);
    expect(account.outbox.length).toBeGreaterThan(GUEST_OUTBOX_MAX);
  });
});

describe('QRIS otomatis (Xendit) siap dinyalakan', () => {
  afterEach(() => vi.unstubAllEnvs());
  it('tanpa kunci lengkap tetap QRIS manual; kunci uji = mode uji; kunci produksi = live', async () => {
    const { paymentMode } = await import('@/lib/server/api');
    vi.stubEnv('LENTERA_BACKEND', '');
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SECRET_KEY', 'sb_secret_test');
    vi.stubEnv('PAYMENT_PROVIDER', '');
    expect(paymentMode()).toBe('manual');
    vi.stubEnv('PAYMENT_PROVIDER', 'xendit');
    vi.stubEnv('XENDIT_SECRET_KEY', '');
    vi.stubEnv('XENDIT_WEBHOOK_TOKEN', '');
    expect(paymentMode()).toBe('manual');
    vi.stubEnv('XENDIT_SECRET_KEY', 'xnd_development_abc');
    expect(paymentMode()).toBe('manual');
    vi.stubEnv('XENDIT_WEBHOOK_TOKEN', 'token');
    expect(paymentMode()).toBe('test');
    vi.stubEnv('XENDIT_SECRET_KEY', 'xnd_production_abc');
    expect(paymentMode()).toBe('live');
  });
});
