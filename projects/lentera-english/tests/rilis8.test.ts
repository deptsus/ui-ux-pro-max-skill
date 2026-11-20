// Rilis 8 "Kebiasaan Belajar": daily study reminders at the learner's hour,
// weekly leagues with divisions, friends by invite code and friend challenges
// (migration 0013), plus shadowing practice on the device.
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import path from 'node:path';
import webpush from 'web-push';
import { openEmbedded, type RawDb } from '@/lib/server/db';
import { dailyMessage, runDailyReminders } from '@/lib/server/reminders';
import { FRIEND_CODE, normalizeCode } from '@/lib/server/habits';
import { buildPack } from '@content/index';
import { packForFree } from '@/lib/content/rows';
import { createState, completeShadowing } from '@/lib/engine/state';
import { linesByLevel, pickSession, shadowLines, splitSentences, SHADOW, tempoNote } from '@/lib/engine/shadowing';
import { timeLeft, zoneLabel } from '@/lib/client/habits';
import { newUser } from './helpers';

const ROOT = path.resolve(__dirname, '..');
let db: RawDb;
let n = 0;
const device = (name: string) => ({ endpoint: `https://push.example.test/h/${name}`, p256dh: 'B'.repeat(87), auth: 'A'.repeat(22) });
const subscribe = (user: string, name: string) => db.rpc('save_reminder_subscription', { p_user: user, p_endpoint: device(name).endpoint, p_p256dh: device(name).p256dh, p_auth: device(name).auth, p_user_agent: 'vitest' });
/** Server XP, as sync_learner records it. */
const xp = (user: string, amount: number, at: Date | string) =>
  db.query('insert into xp_transactions (user_id, client_event_id, amount, reason, occurred_at) values ($1, $2, $3, $4, $5)', [user, `x${++n}`, amount, 'test', at]);
const setStreak = (user: string, current: number, last: string | null, freezes = 0) =>
  db.query('update streaks set current_streak = $2, longest_streak = greatest(longest_streak, $2), last_active_date = $3, freezes = $4 where user_id = $1', [user, current, last, freezes]);

beforeAll(async () => {
  db = await openEmbedded(undefined, ROOT);
});
afterAll(async () => {
  await db.close();
});
afterEach(() => vi.restoreAllMocks());

describe('pengingat belajar harian pada jam pilihan pelajar', () => {
  let ani: string;
  let budi: string;
  beforeAll(async () => {
    ani = await newUser(db, 'Ani');
    budi = await newUser(db, 'Budi');
  });

  it('pengaturan bawaan: mati, WIB, pengingat PR menyala; jam 05–22 saja; zona waktu dicek', async () => {
    expect(await db.rpc('get_reminder_prefs', { p_user: ani })).toEqual({ daily_hour: null, time_zone: 'Asia/Jakarta', homework: true, devices: 0 });
    expect(await db.rpc('set_reminder_prefs', { p_user: ani, p_patch: { daily_hour: 19, time_zone: 'Asia/Makassar' } })).toMatchObject({ daily_hour: 19, time_zone: 'Asia/Makassar', homework: true });
    await expect(db.rpc('set_reminder_prefs', { p_user: ani, p_patch: { daily_hour: 3 } })).rejects.toThrow(/invalid_hour/);
    await expect(db.rpc('set_reminder_prefs', { p_user: ani, p_patch: { daily_hour: '19' } })).rejects.toThrow(/invalid_hour/);
    expect(await db.rpc('set_reminder_prefs', { p_user: budi, p_patch: { daily_hour: 7, time_zone: 'Mars/Olympus' } })).toMatchObject({ daily_hour: 7, time_zone: 'Asia/Jakarta' });
    expect(await db.rpc('set_reminder_prefs', { p_user: budi, p_patch: { homework: false } })).toMatchObject({ daily_hour: 7, homework: false });
  });

  it('dikirim pada jam itu (atau sampai 2 jam setelahnya) di zona waktu pelajar, hanya bila belum belajar hari itu', async () => {
    await subscribe(ani, 'ani');
    // 19.30 WITA = 11.30 UTC on 18 Nov 2026.
    const at = (h: number, m = 30) => new Date(Date.UTC(2026, 10, 18, h - 8, m)).toISOString();
    const targets = (iso: string) => db.rpc<{ user_id: string; local_day: string; streak: number; freeze: boolean; subs: unknown[] }[]>('daily_reminder_targets', { p_now: iso });

    await setStreak(ani, 6, '2026-11-17', 1);
    expect(await targets(at(18))).toEqual([]);
    const due = await targets(at(19));
    expect(due).toHaveLength(1);
    expect(due[0]).toMatchObject({ user_id: ani, local_day: '2026-11-18', streak: 6, freeze: false });
    expect(due[0].subs).toHaveLength(1);
    expect(await targets(at(21))).toHaveLength(1);
    expect(await targets(at(22))).toEqual([]);
    // Budi picked 07.00 WIB but has no device: never a target.
    expect((await targets(new Date(Date.UTC(2026, 10, 18, 0, 10)).toISOString())).map((t) => t.user_id)).not.toContain(budi);

    // Already studied today (device date): nothing to remind.
    await setStreak(ani, 7, '2026-11-18', 1);
    expect(await targets(at(19))).toEqual([]);
    // Missed yesterday with a freeze left: the streak can still be saved.
    await setStreak(ani, 6, '2026-11-16', 1);
    expect((await targets(at(19)))[0]).toMatchObject({ streak: 6, freeze: true });
    // Broken streak: a fresh start.
    await setStreak(ani, 6, '2026-11-10', 1);
    expect((await targets(at(19)))[0]).toMatchObject({ streak: 0, freeze: false });

    // Once a day.
    await db.rpc('record_daily_reminder', { p_user: ani, p_day: '2026-11-18' });
    expect(await targets(at(20))).toEqual([]);
    expect(await targets(new Date(Date.UTC(2026, 10, 19, 11, 30)).toISOString())).toHaveLength(1);
  });

  it('pesannya menyebut beruntun yang dipertaruhkan', () => {
    expect(dailyMessage({ streak: 6, freeze: false })).toMatchObject({ title: 'Jaga 6 hari beruntunmu', url: '/app', tag: 'lentera-daily' });
    expect(dailyMessage({ streak: 6, freeze: true }).title).toBe('Selamatkan 6 hari beruntunmu');
    expect(dailyMessage({ streak: 0, freeze: false }).title).toBe('Waktunya belajar bahasa Inggris');
  });

  it('tugas per jam mengirim, mencatat, dan tidak berjalan dua kali dalam 50 menit', async () => {
    await db.query("update reminder_prefs set last_daily_on = null");
    await setStreak(ani, 3, '2026-11-17', 0);
    const sent: { endpoint: string; body: string }[] = [];
    vi.spyOn(webpush, 'sendNotification').mockImplementation(async (sub, payload) => {
      sent.push({ endpoint: sub.endpoint, body: String(payload) });
      return { statusCode: 201, body: '', headers: {} };
    });
    const now = Date.UTC(2026, 10, 18, 11, 5); // 19.05 WITA
    expect(await runDailyReminders(db, { now })).toEqual({ learners: 1, reminded: 1, sent: 1, failed: 0, removed: 0 });
    expect(JSON.parse(sent[0].body)).toMatchObject({ title: 'Jaga 3 hari beruntunmu' });
    expect(await runDailyReminders(db, { now: now + 60_000 })).toEqual({ skipped: 'ran-recently' });
    await db.query("update job_runs set last_run_at = now() - interval '2 hours' where job = 'daily-reminders'");
    expect(await runDailyReminders(db, { now: now + 3600_000 })).toMatchObject({ learners: 0, reminded: 0 });
  });

  it('pengingat PR bisa dimatikan tanpa mematikan perangkat', async () => {
    await subscribe(budi, 'budi');
    const nowMs = Date.UTC(2026, 10, 18, 3, 0);
    const snap = { v: 1, homework: { 'hw.a1-to-be': { assignedAt: nowMs - 3600_000, dueAt: nowMs + 3600_000, submissions: [] } } };
    await db.rpc('sync_learner', { p_user: budi, p_events: [], p_snapshot: snap, p_client_updated_at: 1 });
    const ids = async () => (await db.rpc<{ user_id: string }[]>('homework_reminder_targets', { p_now_ms: nowMs, p_window_ms: 86_400_000 })).map((t) => t.user_id);
    expect(await ids()).not.toContain(budi);
    await db.rpc('set_reminder_prefs', { p_user: budi, p_patch: { homework: true } });
    expect(await ids()).toContain(budi);
  });
});

describe('liga mingguan dengan divisi (fungsi lama 0013, tidak dipakai sejak Liga Rank)', () => {
  // Weeks start on Monday, WIB; the tests run in whatever week it is now.
  let THIS = '';
  let LAST = '';
  let TWO_AGO = '';
  const minus = (week: string, days: number) => new Date(new Date(`${week}T00:00:00Z`).getTime() - days * 86_400_000).toISOString().slice(0, 10);
  beforeAll(async () => {
    [{ w: THIS }] = await db.query<{ w: string }>('select league_week(now())::text as w');
    LAST = minus(THIS, 7);
    TWO_AGO = minus(THIS, 14);
  });
  const inWeek = (week: string, day = 1, hourUtc = 3) => new Date(new Date(`${week}T00:00:00Z`).getTime() + day * 86_400_000 + hourUtc * 3600_000);
  const standings = (week: string, division: number, cohort: number) => db.query<{ user_id: string; xp: number; rank: number; size: number }>('select * from league_standings($1, $2, $3)', [week, division, cohort]);

  it('menempatkan setiap pelajar yang punya XP minggu itu, maksimal 30 per grup', async () => {
    const users: string[] = [];
    for (let i = 0; i < 32; i++) users.push(await newUser(db, `Liga ${i + 1}`));
    // Everyone earns XP last week; earlier first XP = earlier placement.
    for (let i = 0; i < 32; i++) await xp(users[i], 200 - i * 5, inWeek(LAST, 1, i % 20));
    expect(await db.rpc('league_fill', { p_week: LAST })).toBe(32);
    expect(await db.rpc('league_fill', { p_week: LAST })).toBe(0);
    const groups = await db.query<{ cohort: number; n: number }>('select cohort, count(*)::int as n from league_members where week_start = $1 group by cohort order by cohort', [LAST]);
    expect(groups).toEqual([{ cohort: 1, n: 30 }, { cohort: 2, n: 2 }]);
    const s = await standings(LAST, 1, 1);
    expect(s[0]).toMatchObject({ user_id: users[0], xp: 200, rank: 1, size: 30 });
  });

  it('naik, tetap, turun, atau mulai di Lilin sesuai hasil minggu lalu', async () => {
    const [top, mid, low, gone, fresh] = [await newUser(db, 'Atas'), await newUser(db, 'Tengah'), await newUser(db, 'Bawah'), await newUser(db, 'Absen'), await newUser(db, 'Baru')];
    // A division-3 group of six last week.
    const others = [await newUser(db, 'D3 a'), await newUser(db, 'D3 b'), await newUser(db, 'D3 c')];
    const group = [top, mid, ...others, low];
    const amounts = [190, 120, 110, 100, 90, 10];
    for (let i = 0; i < group.length; i++) {
      await xp(group[i], amounts[i], inWeek(LAST, 2));
      await db.query('insert into league_members (week_start, user_id, division, cohort) values ($1, $2, 3, 1)', [LAST, group[i]]);
    }
    // Two weeks ago in division 2, nothing since.
    await db.query('insert into league_members (week_start, user_id, division, cohort) values ($1, $2, 2, 1)', [TWO_AGO, gone]);

    const next = (u: string) => db.rpc<{ division: number; outcome: string; prev_rank?: number }>('league_next_division', { p_user: u, p_week: THIS });
    expect(await next(top)).toMatchObject({ division: 4, outcome: 'promoted', prev_rank: 1 });
    expect(await next(mid)).toMatchObject({ division: 3, outcome: 'stayed', prev_rank: 2 });
    expect(await next(low)).toMatchObject({ division: 2, outcome: 'demoted', prev_rank: 6 });
    expect(await next(gone)).toMatchObject({ division: 1, outcome: 'inactive' });
    expect(await next(fresh)).toMatchObject({ division: 1, outcome: 'new' });
    // get_league itself now shows Liga Rank (migration 0022, tests/rank.test.ts); these
    // weekly-group functions stay in the database unused.
  });

  it('juara grup kecil tetap butuh 50 XP untuk naik; divisi 5 tidak bisa naik lagi', async () => {
    const solo = await newUser(db, 'Sendiri');
    await xp(solo, 30, inWeek(LAST, 3));
    await db.query('insert into league_members (week_start, user_id, division, cohort) values ($1, $2, 2, 9)', [LAST, solo]);
    expect(await db.rpc('league_next_division', { p_user: solo, p_week: THIS })).toMatchObject({ division: 2, outcome: 'stayed' });
    const [{ promote, demote }] = await db.query<{ promote: number; demote: number }>('select * from league_moves(5, 30)');
    expect({ promote, demote }).toEqual({ promote: 0, demote: 6 });
  });
});

describe('teman lewat kode undangan dan tantangan XP', () => {
  let rina: string;
  let dimas: string;
  let nisa: string;
  let codes: Record<string, string>;
  type Social = { code: string; friends: { me: boolean; name: string; code: string | null; xp: number; streak: number }[]; challenges: { id: number; status: string; mine: boolean; name: string; my_xp: number | null; their_xp: number | null; days: number }[]; record: { won: number; lost: number; draw: number } };
  const social = (u: string) => db.rpc<Social>('get_social', { p_user: u });

  beforeAll(async () => {
    rina = await newUser(db, 'Rina');
    dimas = await newUser(db, 'Dimas');
    nisa = await newUser(db, 'Nisa');
    codes = {};
    for (const [k, u] of Object.entries({ rina, dimas, nisa })) codes[k] = await db.rpc<string>('friend_code', { p_user: u });
  });

  it('setiap pelajar punya satu kode 6 karakter tanpa huruf yang mirip', async () => {
    for (const c of Object.values(codes)) expect(c).toMatch(FRIEND_CODE);
    expect(await db.rpc('friend_code', { p_user: rina })).toBe(codes.rina);
    expect(normalizeCode(' ab-c2 3d ')).toBe('ABC23D');
  });

  it('menambah teman: kode sendiri ditolak, kode salah dihitung, maksimal 20 salah per jam', async () => {
    expect(await db.rpc('add_friend', { p_user: rina, p_code: codes.rina })).toEqual({ error: 'own_code' });
    expect(await db.rpc('add_friend', { p_user: rina, p_code: 'ZZZZZZ' })).toEqual({ error: 'code_not_found' });
    expect(await db.rpc('add_friend', { p_user: rina, p_code: codes.dimas.toLowerCase() })).toMatchObject({ added: true, name: 'Dimas' });
    expect(await db.rpc('add_friend', { p_user: dimas, p_code: codes.rina })).toMatchObject({ added: false, already: true });
    expect(await db.rpc('is_friend', { p_a: dimas, p_b: rina })).toBe(true);
    await db.query("insert into friend_code_attempts (user_id) select $1 from generate_series(1, 19)", [nisa]);
    expect(await db.rpc('add_friend', { p_user: nisa, p_code: 'YYYYYY' })).toEqual({ error: 'code_not_found' });
    expect(await db.rpc('add_friend', { p_user: nisa, p_code: codes.rina })).toEqual({ error: 'too_many_attempts' });
    await db.query('delete from friend_code_attempts');
    expect(await db.rpc('add_friend', { p_user: nisa, p_code: codes.rina })).toMatchObject({ added: true });
  });

  it('daftar teman berisi XP minggu ini dan beruntun, diurutkan dari XP terbanyak', async () => {
    const now = new Date();
    await xp(dimas, 80, now);
    await xp(rina, 50, now);
    await setStreak(dimas, 4, new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10));
    const s = await social(rina);
    expect(s.code).toBe(codes.rina);
    expect(s.friends.map((f) => [f.name, f.me, f.xp])).toEqual([['Dimas', false, 80], ['Rina', true, 50], ['Nisa', false, 0]]);
    expect(s.friends[0]).toMatchObject({ code: codes.dimas, streak: 4 });
    expect(s.friends[1].code).toBeNull();
  });

  it('tantangan: hanya antar teman, 3 atau 7 hari, satu per pasangan, maksimal 3 berjalan', async () => {
    const outsider = await newUser(db, 'Orang Lain');
    const outsiderCode = await db.rpc<string>('friend_code', { p_user: outsider });
    expect(await db.rpc('create_challenge', { p_user: rina, p_code: outsiderCode, p_days: 3 })).toEqual({ error: 'not_friend' });
    expect(await db.rpc('create_challenge', { p_user: rina, p_code: codes.dimas, p_days: 5 })).toEqual({ error: 'invalid_days' });
    const c = await db.rpc<{ id: number; days: number; opponent_id: string; name: string; from_name: string }>('create_challenge', { p_user: rina, p_code: codes.dimas, p_days: 7 });
    expect(c).toMatchObject({ days: 7, opponent_id: dimas, name: 'Dimas', from_name: 'Rina' });
    expect(await db.rpc('create_challenge', { p_user: dimas, p_code: codes.rina, p_days: 3 })).toEqual({ error: 'already_open' });
    expect((await social(dimas)).challenges[0]).toMatchObject({ id: c.id, status: 'pending', mine: false, name: 'Rina', my_xp: null });

    // Only the invited friend can answer.
    expect(await db.rpc('respond_challenge', { p_user: rina, p_id: c.id, p_accept: true })).toEqual({ error: 'not_pending' });
    expect(await db.rpc('respond_challenge', { p_user: dimas, p_id: c.id, p_accept: true })).toMatchObject({ status: 'active', challenger_id: rina, days: 7, name: 'Dimas' });
    // Start the duel an hour ago; XP earned before the start does not count.
    await db.query("update friend_challenges set starts_at = now() - interval '1 hour', ends_at = now() + interval '7 days' - interval '1 hour' where id = $1", [c.id]);
    await db.query("update xp_transactions set occurred_at = now() - interval '2 hours' where user_id in ($1, $2)", [rina, dimas]);
    await xp(dimas, 30, new Date(Date.now() - 30 * 60_000));
    expect((await social(rina)).challenges[0]).toMatchObject({ status: 'active', mine: true, my_xp: 0, their_xp: 30 });

    // Time is up: scores are frozen and counted in the record.
    await xp(rina, 45, new Date(Date.now() - 20 * 60_000));
    await db.query("update friend_challenges set ends_at = now() - interval '1 second' where id = $1", [c.id]);
    const done = await social(rina);
    expect(done.challenges[0]).toMatchObject({ status: 'finished', my_xp: 45, their_xp: 30 });
    expect(done.record).toEqual({ won: 1, lost: 0, draw: 0 });
    expect((await social(dimas)).record).toEqual({ won: 0, lost: 1, draw: 0 });
  });

  it('menolak, membatalkan, kedaluwarsa setelah 3 hari, dan hapus teman membatalkan tantangan', async () => {
    const a = await db.rpc<{ id: number }>('create_challenge', { p_user: nisa, p_code: codes.rina, p_days: 3 });
    expect(await db.rpc('respond_challenge', { p_user: rina, p_id: a.id, p_accept: false })).toMatchObject({ status: 'declined' });
    const b = await db.rpc<{ id: number }>('create_challenge', { p_user: nisa, p_code: codes.rina, p_days: 3 });
    expect(await db.rpc('cancel_challenge', { p_user: rina, p_id: b.id })).toEqual({ cancelled: false });
    expect(await db.rpc('cancel_challenge', { p_user: nisa, p_id: b.id })).toEqual({ cancelled: true });
    const c = await db.rpc<{ id: number }>('create_challenge', { p_user: nisa, p_code: codes.rina, p_days: 3 });
    await db.query("update friend_challenges set created_at = now() - interval '4 days' where id = $1", [c.id]);
    expect((await social(nisa)).challenges.find((x) => x.id === c.id)?.status).toBe('expired');
    const d = await db.rpc<{ id: number }>('create_challenge', { p_user: nisa, p_code: codes.rina, p_days: 7 });
    expect(await db.rpc('remove_friend', { p_user: rina, p_code: codes.nisa })).toEqual({ removed: true });
    const [{ status }] = await db.query<{ status: string }>('select status from friend_challenges where id = $1', [d.id]);
    expect(status).toBe('cancelled');
    expect((await social(rina)).friends.map((f) => f.name)).not.toContain('Nisa');
  });
});

describe('keamanan migrasi 0013', () => {
  it('tabel dan fungsi baru tertutup bagi klien publik', async () => {
    for (const role of ['anon', 'authenticated']) {
      for (const fn of ['get_reminder_prefs(uuid)', 'set_reminder_prefs(uuid,jsonb)', 'daily_reminder_targets(timestamp with time zone)', 'get_league(uuid)', 'league_fill(date)', 'add_friend(uuid,text)', 'get_social(uuid)', 'create_challenge(uuid,text,integer)', 'respond_challenge(uuid,bigint,boolean)']) {
        const [{ ok }] = await db.query<{ ok: boolean }>(`select has_function_privilege($1, 'public.${fn}', 'execute') as ok`, [role]);
        expect(ok, `${role} ${fn}`).toBe(false);
      }
      for (const table of ['reminder_prefs', 'league_members', 'friend_codes', 'friendships', 'friend_code_attempts', 'friend_challenges']) {
        const [{ ok }] = await db.query<{ ok: boolean }>(`select has_table_privilege($1, 'public.${table}', 'select') as ok`, [role]);
        expect(ok, `${role} ${table}`).toBe(false);
      }
    }
    expect(await db.rpc<string[]>('content_features')).toContain('habits');
  });
});

describe('latihan shadowing', () => {
  const pack = buildPack();
  const all = shadowLines(pack);
  const free = shadowLines(packForFree(pack));

  it('memecah transkrip menjadi kalimat tanpa memotong singkatan', () => {
    expect(splitSentences('Hi! I am Rina. Mr. Lee is my teacher. Is it far?')).toEqual(['Hi!', 'I am Rina.', 'Mr. Lee is my teacher.', 'Is it far?']);
  });

  it('kalimat berasal dari menyimak, pelajaran, dan kosakata, 3–22 kata, tanpa duplikat', () => {
    expect(all.length).toBeGreaterThan(300);
    for (const l of all) {
      const n = l.text.split(/\s+/).length;
      expect(n, l.text).toBeGreaterThanOrEqual(SHADOW.minWords);
      expect(n, l.text).toBeLessThanOrEqual(SHADOW.maxWords);
      expect(l.text, l.text).toMatch(/[.!?]["”’]?$/);
    }
    expect(new Set(all.map((l) => l.key)).size).toBe(all.length);
    expect(new Set(all.map((l) => l.source.split(' · ')[0]))).toEqual(new Set(['Menyimak', 'Pelajaran', 'Kosakata']));
    for (const c of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const) expect(linesByLevel(all)[c], c).toBeGreaterThan(20);
  });

  it('paket gratis hanya berisi kalimat dari materi gratis', () => {
    const freeText = new Set([
      ...pack.listening.filter((l) => !l.premium).flatMap((l) => splitSentences(l.transcript)),
      ...pack.lessons.filter((l) => !l.premium).flatMap((l) => l.demo.map((d) => d.good.trim())),
      ...pack.vocabulary.filter((v) => !v.premium).map((v) => v.example.trim()),
    ]);
    expect(free.filter((l) => !freeText.has(l.text))).toEqual([]);
    expect(free.length).toBeGreaterThan(40);
  });

  it('memilih 5 kalimat satu level, yang belum dilatih lebih dulu, dari pendek ke panjang', () => {
    const first = pickSession(all, 'A2', [], 'a');
    expect(first).toHaveLength(SHADOW.perSession);
    expect(first.every((l) => l.level === 'A2')).toBe(true);
    const words = first.map((l) => l.text.split(/\s+/).length);
    expect(words).toEqual([...words].sort((a, b) => a - b));
    const next = pickSession(all, 'A2', first.map((l) => l.key), 'a');
    expect(next.some((l) => first.some((f) => f.key === l.key))).toBe(false);
  });

  it('sesi selesai memberi XP per kalimat, menjaga beruntun, dan mengingat kalimat terakhir', () => {
    const at = new Date(2026, 10, 18, 9).getTime();
    const s = createState('u-shadow', at - 86_400_000 * 3);
    s.streak = { current: 4, longest: 4, lastDate: '2026-11-17', freezes: 0 };
    const keys = pickSession(all, 'A1', [], 'b').map((l) => l.key);
    completeShadowing(s, keys, at);
    expect(s.xp).toBe(SHADOW.perSession * SHADOW.xpPerSentence);
    expect(s.streak).toMatchObject({ current: 5, lastDate: '2026-11-18' });
    expect(s.shadowing).toMatchObject({ total: 5, sessions: 1, recent: keys });
    expect(s.outbox.filter((e) => e.kind === 'xp').map((e) => e.data)).toEqual([{ amount: 10, reason: 'shadowing', ref: undefined }]);
    completeShadowing(s, [], at);
    expect(s.shadowing?.sessions).toBe(1);
  });

  it('info tempo hanya membandingkan lama bicara, bukan menilai', () => {
    expect(tempoNote(2000, 2200)).toMatchObject({ tone: 'ok' });
    expect(tempoNote(2000, 3000).text).toBe('Kamu 1,0 dtk lebih lambat dari contoh (2,0 dtk). Coba sambungkan kata-katanya.');
    expect(tempoNote(2000, 1200).tone).toBe('fast');
  });
});

describe('tampilan liga dan pengingat', () => {
  // The weekly zones went with the groups (Liga Rank, migration 0022: tests/rank.test.ts).
  it('sisa waktu dan nama zona waktu Indonesia', () => {
    const now = Date.UTC(2026, 10, 18, 0, 0);
    expect(timeLeft(new Date(now + 2 * 86_400_000 + 5 * 3_600_000).toISOString(), now)).toBe('2 hari 5 jam');
    expect(timeLeft(new Date(now + 90 * 60_000).toISOString(), now)).toBe('1 jam 30 menit');
    expect(['Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura', 'Europe/London'].map(zoneLabel)).toEqual(['WIB', 'WITA', 'WIT', 'Europe/London']);
  });
});
