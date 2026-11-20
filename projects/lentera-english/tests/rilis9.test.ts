// Rilis 9 "Aman & Terukur": rate limits, error monitoring, contact messages,
// account deletion, backups, owner analytics, admin two-step verification,
// security headers, and the league savings (migration 0014).
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import { openEmbedded, type RawDb } from '@/lib/server/db';
import { fingerprint, normalizeMessage, topFrame } from '@/lib/server/errors';
import { BACKUP, isBackupName, runBackup, wibDay, type BackupStore } from '@/lib/server/backup';
import { newUser } from './helpers';

const ROOT = path.resolve(__dirname, '..');
let db: RawDb;
let admin: string;
let ani: string;
beforeAll(async () => {
  db = await openEmbedded(undefined, ROOT);
  admin = await newUser(db, 'Admin R9', 'admin');
  ani = await newUser(db, 'Ani R9');
});
afterAll(async () => {
  await db.close();
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('batas permintaan', () => {
  it('mengizinkan sampai batas, menolak sesudahnya, lalu buka lagi di jendela berikutnya', async () => {
    const hit = () => db.rpc<boolean>('hit_rate_limit', { p_key: 'test:a', p_max: 3, p_window_seconds: 60 });
    expect([await hit(), await hit(), await hit(), await hit()]).toEqual([true, true, true, false]);
    await db.query("update rate_limits set window_start = now() - interval '2 minutes' where key = 'test:a'");
    expect(await hit()).toBe(true);
  });
});

describe('pemantauan error', () => {
  it('sidik jari sama untuk error yang sama walau angka dan id berbeda', () => {
    expect(normalizeMessage('User 1234 not found: 0b7c2b4e-1111-2222-3333-444455556666 at https://x.test/a?b=1'))
      .toBe('User <n> not found: <id> at <url>');
    const a = fingerprint({ source: 'client', message: "Cannot read 'x' of undefined (row 12)", stack: 'TypeError\n    at render (https://x.test/_next/static/chunks/a1b2c3d4e5.js:1:200)' });
    const b = fingerprint({ source: 'client', message: "Cannot read 'y' of undefined (row 99)", stack: 'TypeError\n    at render (https://x.test/_next/static/chunks/ffeeddccbb.js:1:900)' });
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{32}$/);
    expect(topFrame('Error\n    at node:internal/x\n    at save (/app/src/a.ts:10:5)')).toBe('at save (/app/src/a.ts');
  });

  it('dikelompokkan, dihitung, dan muncul lagi sebagai baru setelah ditandai selesai', async () => {
    const report = (user: string | null) => db.rpc<{ new: boolean }>('report_error', { p_fingerprint: 'abcdef0123456789', p_source: 'client', p_message: 'Boom', p_stack: 'at x', p_path: '/app', p_release: 'abc1234', p_user_agent: 'vitest', p_user: user });
    expect(await report(ani)).toEqual({ new: true });
    expect(await report(ani)).toEqual({ new: false });
    expect(await report(admin)).toEqual({ new: false });
    const [row] = await db.rpc<{ id: number; count: number; users: number; status: string }[]>('admin_errors', { p_actor: admin, p_all: false });
    expect(row).toMatchObject({ count: 3, users: 2, status: 'open' });
    expect(row).not.toHaveProperty('last_user');
    await db.rpc('admin_resolve_error', { p_actor: admin, p_id: row.id });
    expect(await db.rpc('admin_errors', { p_actor: admin, p_all: false })).toEqual([]);
    expect(await report(null)).toEqual({ new: true });
    await expect(db.rpc('admin_errors', { p_actor: ani, p_all: true })).rejects.toThrow(/forbidden/);
    await expect(db.rpc('report_error', { p_fingerprint: 'bad id!', p_source: 'client', p_message: 'x', p_stack: null, p_path: null, p_release: null, p_user_agent: null, p_user: null })).rejects.toThrow(/invalid_error/);
  });
});

describe('pesan Hubungi Kami', () => {
  it('tersimpan, terbaca admin, dan bisa ditandai selesai', async () => {
    const { id } = await db.rpc<{ id: number }>('submit_contact', { p_topic: 'privasi', p_name: ' Budi ', p_contact: '', p_message: 'Tolong hapus data saya.', p_user: null });
    const list = await db.rpc<{ id: number; name: string; contact: string | null; status: string }[]>('admin_contact_messages', { p_actor: admin, p_all: false });
    expect(list.find((m) => m.id === id)).toMatchObject({ name: 'Budi', contact: null, status: 'open' });
    await db.rpc('admin_close_contact', { p_actor: admin, p_id: id });
    expect((await db.rpc<{ id: number }[]>('admin_contact_messages', { p_actor: admin, p_all: false })).some((m) => m.id === id)).toBe(false);
    await expect(db.rpc('submit_contact', { p_topic: 'spam', p_name: 'x', p_contact: null, p_message: 'hello world', p_user: null })).rejects.toThrow();
  });
});

describe('hapus akun', () => {
  it('menghapus semua progres; pembayaran tetap ada tanpa nama dan tanpa akun', async () => {
    const u = await newUser(db, 'Citra Hapus');
    await db.query("insert into xp_transactions (user_id, client_event_id, amount, reason, occurred_at) values ($1, 'del-1', 10, 'test', now())", [u]);
    const [tx] = await db.query<{ id: string }>(`insert into payment_transactions (user_id, plan_id, reference_id, amount_idr, channel, status, method, payer_name, payer_note)
      values ($1, 'premium_monthly', 'del-ref-1', 58500, 'QRIS', 'SUCCEEDED', 'manual_qris', 'Citra', 'dari BCA') returning id`, [u]);
    expect(await db.rpc('prepare_account_deletion', { p_user: u })).toEqual({ ready: true });
    await db.query('delete from auth.users where id = $1', [u]);
    expect(await db.query('select 1 from profiles where id = $1', [u])).toHaveLength(0);
    expect(await db.query('select 1 from xp_transactions where user_id = $1', [u])).toHaveLength(0);
    const [pay] = await db.query<{ user_id: string | null; payer_name: string | null; payer_note: string | null; amount_idr: number }>('select user_id, payer_name, payer_note, amount_idr from payment_transactions where id = $1', [tx.id]);
    expect(pay).toEqual({ user_id: null, payer_name: null, payer_note: null, amount_idr: 58500 });
  });

  it('akun admin ditolak', async () => {
    await expect(db.rpc('prepare_account_deletion', { p_user: admin })).rejects.toThrow(/admin_account/);
  });
});

describe('cadangan harian', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lentera-backup-'));
  const files = new Map<string, Buffer>();
  const store: BackupStore = {
    async put(name, bytes) { files.set(name, bytes); fs.writeFileSync(path.join(dir, path.basename(name)), bytes); },
    async list() { return [...files.keys()].sort(); },
    async remove(names) { names.forEach((n) => files.delete(n)); },
    async link() { return null; },
    async read(name) { return files.get(name) ?? null; },
  };

  it('mengekspor semua tabel pelajar dan pembayaran, tanpa kunci rahasia dan kata sandi', async () => {
    await db.query("update auth.users set encrypted_password = 'secret-hash' where id = $1", [ani]);
    await db.query("insert into push_keys (id, public_key, private_key) values (1, 'pub', 'PRIVATE') on conflict do nothing").catch(() => undefined);
    const r = await runBackup(db, { trigger: 'admin', store, now: new Date('2026-11-20T10:00:00Z'), pageSize: 3 });
    expect(r.name).toBe('daily/2026-11-20.json.gz');
    expect(isBackupName(r.name)).toBe(true);
    const json = JSON.parse(gunzipSync(files.get(r.name)!).toString('utf8'));
    expect(json).toMatchObject({ format: 'lentera-backup', version: 1 });
    for (const t of ['profiles', 'xp_transactions', 'payment_transactions', 'subscriptions', 'learner_snapshots', 'friendships', 'contact_messages', 'curriculum_versions']) expect(json.tables, t).toHaveProperty(t);
    for (const t of ['push_keys', 'rate_limits', 'job_runs', 'app_errors']) expect(json.tables, t).not.toHaveProperty(t);
    expect(json.tables.profiles.length).toBeGreaterThanOrEqual(2);
    expect(json.auth_users.find((u: { id: string }) => u.id === ani)).toEqual(expect.objectContaining({ id: ani, name: 'Ani R9' }));
    expect(JSON.stringify(json)).not.toContain('secret-hash');
    expect(JSON.stringify(json)).not.toContain('PRIVATE');
    // Tables are read in parallel but written in backup_tables() order, every row once.
    const order = await db.rpc<string[]>('backup_tables');
    expect(Object.keys(json.tables)).toEqual(order);
    const [{ n }] = await db.query<{ n: number }>('select count(*)::int as n from profiles');
    expect(json.tables.profiles).toHaveLength(n);
    expect(new Set(json.tables.profiles.map((p: { id: string }) => p.id)).size).toBe(n);
    const [run] = await db.query<{ name: string; trigger: string; rows: number }>('select name, trigger, rows from backup_runs order by id desc limit 1');
    expect(run).toMatchObject({ name: r.name, trigger: 'admin' });
    expect(Number(run.rows)).toBe(r.rows);
  });

  it('hanya menyimpan sejumlah hari terakhir', async () => {
    for (const day of ['2026-11-21', '2026-11-22', '2026-11-23']) await runBackup(db, { trigger: 'schedule', store, now: new Date(`${day}T10:00:00Z`), keep: 2 });
    expect(await store.list()).toEqual(['daily/2026-11-22.json.gz', 'daily/2026-11-23.json.gz']);
    expect(BACKUP.keep).toBe(14);
  });

  it('cadangan terjadwal hanya sekali per hari WIB walau pemicunya terpanggil ulang', async () => {
    const claim = () => db.rpc<boolean>('claim_job', { p_job: `backup:${wibDay(new Date('2026-11-24T19:00:00Z'))}`, p_min_seconds: 20 * 3600 });
    expect(wibDay(new Date('2026-11-24T19:00:00Z'))).toBe('2026-11-25');
    expect([await claim(), await claim()]).toEqual([true, false]);
  });

  it('fungsi ekspor menolak tabel di luar daftar', async () => {
    await expect(db.rpc('backup_rows', { p_table: 'push_keys', p_offset: 0, p_limit: 10 })).rejects.toThrow(/invalid_table/);
    await expect(db.rpc('backup_rows', { p_table: 'pg_authid', p_offset: 0, p_limit: 10 })).rejects.toThrow(/invalid_table/);
  });
});

describe('analitik pemilik dan kesehatan', () => {
  it('corong: daftar → tes → pelajaran pertama → bertahan seminggu → Premium (admin tidak dihitung)', async () => {
    const old = await newUser(db, 'Lama');
    await db.query("update profiles set created_at = now() - interval '20 days', placement_level = 'A2' where id = $1", [old]);
    await db.query("insert into learning_history (user_id, client_event_id, event_type, ref_id, score, passed, occurred_at) values ($1, 'l1', 'lesson', 'a1-to-be', 90, true, now() - interval '19 days')", [old]);
    await db.query("insert into xp_transactions (user_id, client_event_id, amount, reason, occurred_at) values ($1, 'w1', 5, 'test', now() - interval '11 days')", [old]);
    const [tx] = await db.query<{ id: string }>(`insert into payment_transactions (user_id, plan_id, reference_id, amount_idr, channel, status, paid_at)
      values ($1, 'premium_monthly', 'an-ref-1', 58500, 'QRIS', 'SUCCEEDED', now() - interval '5 days') returning id`, [old]);
    await db.query("insert into subscriptions (user_id, plan_id, starts_at, expires_at, source_transaction_id) values ($1, 'premium_monthly', now() - interval '5 days', now() + interval '25 days', $2)", [old, tx.id]);
    const a = await db.rpc<{ funnel: Record<string, number>; cohorts: { week1_eligible: number }[]; active: Record<string, number>; revenue: { amount: number }[] }>('admin_analytics', { p_actor: admin, p_weeks: 12 });
    expect(a.funnel.placement).toBeGreaterThanOrEqual(1);
    expect(a.funnel).toMatchObject({ first_lesson: 1, week1: 1, week1_eligible: 1, premium: 1 });
    expect(a.funnel.signed_up).toBeGreaterThanOrEqual(2);
    expect(a.revenue.reduce((n, r) => n + Number(r.amount), 0)).toBeGreaterThanOrEqual(58500);
    await expect(db.rpc('admin_analytics', { p_actor: ani, p_weeks: 12 })).rejects.toThrow(/forbidden/);
  });

  it('kesehatan: ukuran basis data, tabel terbesar, cadangan, error, pesan', async () => {
    const h = await db.rpc<{ db_bytes: number; tables: unknown[]; backups: unknown[]; errors_open: number; learners: number }>('admin_health', { p_actor: admin });
    expect(h.db_bytes).toBeGreaterThan(1_000_000);
    expect(h.tables.length).toBeGreaterThan(5);
    expect(h.backups.length).toBeGreaterThan(0);
    expect(h.errors_open).toBeGreaterThanOrEqual(1);
    await expect(db.rpc('admin_health', { p_actor: ani })).rejects.toThrow(/forbidden/);
  });
});

describe('liga lebih hemat', () => {
  it('pelajar yang membuka liga langsung tampil walau penyelesaian mingguan baru saja berjalan', async () => {
    const [{ w }] = await db.query<{ w: string }>('select league_week(now())::text as w');
    const x = await newUser(db, 'Liga Hemat');
    await db.query("insert into xp_transactions (user_id, client_event_id, amount, reason, occurred_at) values ($1, 'lh1', 20, 'test', now())", [x]);
    // Another learner just ran this week's settlement (Liga Rank, migration 0022).
    await db.rpc('claim_job', { p_job: `league-fill:rank-${w}`, p_min_seconds: 300 });
    const l = await db.rpc<{ points: number; rows: { me: boolean }[] }>('get_league', { p_user: x });
    expect(l.points).toBeGreaterThan(0);
    expect(l.rows.some((r) => r.me)).toBe(true);
    const [{ n }] = await db.query<{ n: number }>("select count(*)::int as n from pg_indexes where indexname = 'xp_transactions_user_time_idx'");
    expect(n).toBe(1);
  });
});

describe('verifikasi 2 langkah untuk admin', () => {
  const token = (aal: string) => `h.${Buffer.from(JSON.stringify({ sub: 'u1', aal })).toString('base64url')}.s`;
  const req = (t: string) => new Request('https://x.test/api/admin', { headers: { authorization: `Bearer ${t}` } });
  const supabaseUser = (factors: { status: string }[]) => vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ id: '11111111-2222-3333-4444-555555555555', factors }), { status: 200 })));

  it('admin dengan authenticator wajib sesi aal2; tanpa authenticator tetap bisa masuk', async () => {
    vi.stubEnv('LENTERA_BACKEND', '');
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SECRET_KEY', 'sb_secret_test');
    const { authFromRequest } = await import('@/lib/server/auth');
    const { requireAdmin } = await import('@/lib/server/api');
    supabaseUser([{ status: 'verified' }]);
    expect(await authFromRequest(req(token('aal1')))).toMatchObject({ aal: 'aal1', mfa: true });
    await expect(requireAdmin(req(token('aal1')))).rejects.toMatchObject({ status: 401, code: 'mfa_required' });
    await expect(requireAdmin(req(token('aal2')))).resolves.toMatchObject({ userId: '11111111-2222-3333-4444-555555555555' });
    supabaseUser([{ status: 'unverified' }]);
    await expect(requireAdmin(req(token('aal1')))).resolves.toMatchObject({ userId: '11111111-2222-3333-4444-555555555555' });
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 401 })));
    await expect(requireAdmin(req(token('aal2')))).rejects.toMatchObject({ status: 401, code: 'unauthorized' });
  });
});

describe('header keamanan', () => {
  it('produksi mengirim CSP ketat, HSTS, anti-framing, dan izin mikrofon hanya untuk situs sendiri', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { default: config } = await import('../next.config');
    const all = await config.headers!();
    const global = all.find((h) => h.source === '/:path*')!;
    const get = (k: string) => global.headers.find((h) => h.key === k)?.value ?? '';
    expect(get('Content-Security-Policy')).toContain("frame-ancestors 'none'");
    expect(get('Content-Security-Policy')).toContain("object-src 'none'");
    expect(get('Content-Security-Policy')).not.toContain('unsafe-eval');
    expect(get('Strict-Transport-Security')).toMatch(/max-age=\d{8}/);
    expect(get('X-Frame-Options')).toBe('DENY');
    expect(get('Permissions-Policy')).toContain('microphone=(self)');
    expect(get('Permissions-Policy')).toContain('camera=()');
    expect(config.poweredByHeader).toBe(false);
  });

  it('tabel dan fungsi baru tertutup bagi klien publik', async () => {
    for (const role of ['anon', 'authenticated']) {
      for (const fn of ['hit_rate_limit(text,integer,integer)', 'report_error(text,text,text,text,text,text,text,uuid)', 'backup_rows(text,integer,integer)', 'backup_auth_users(integer,integer)', 'admin_analytics(uuid,integer)', 'prepare_account_deletion(uuid)', 'submit_contact(text,text,text,text,uuid)']) {
        const [{ ok }] = await db.query<{ ok: boolean }>(`select has_function_privilege($1, 'public.${fn}', 'execute') as ok`, [role]);
        expect(ok, `${role} ${fn}`).toBe(false);
      }
      for (const table of ['rate_limits', 'app_errors', 'contact_messages', 'backup_runs']) {
        const [{ ok }] = await db.query<{ ok: boolean }>(`select has_table_privilege($1, 'public.${table}', 'select') as ok`, [role]);
        expect(ok, `${role} ${table}`).toBe(false);
      }
    }
  });
});
