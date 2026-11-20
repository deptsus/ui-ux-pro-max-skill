// Liga Rank (migration 0022): one rank ladder Lilin -> Mercusuar. Each week gives at most
// 100 points (70 for XP, full at 250; 7.5 per study day, full at 4 days); a week without XP
// costs 50. Pelita 500, Obor 1.500, Lentera 3.000, Mercusuar 5.000: about a year of the
// weekly plan. The rank is worked out from the learner's own XP history.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import path from 'node:path';
import { openEmbedded, type RawDb } from '@/lib/server/db';
import { RANK, rankProgress, weeksToNext } from '@/lib/client/habits';
import { newUser } from './helpers';

let db: RawDb;
let n = 0;
let THIS = '';
const DAY = 86_400_000;
const weekAgo = (k: number) => new Date(new Date(`${THIS}T00:00:00Z`).getTime() - k * 7 * DAY).toISOString().slice(0, 10);
/** 10.00 WIB on the given day (0 = Monday) of the week starting `week`. */
const inWeek = (week: string, day = 0) => new Date(new Date(`${week}T00:00:00Z`).getTime() + day * DAY + 3 * 3600_000);
const xp = (user: string, amount: number, at: Date) =>
  db.query('insert into xp_transactions (user_id, client_event_id, amount, reason, occurred_at) values ($1, $2, $3, $4, $5)', [user, `r${++n}`, amount, 'test', at]);
/** A week that follows the plan: 252 XP over 4 days (in events of at most 200 XP, as synced). */
const fullWeek = async (user: string, week: string, perDay = 63) => {
  for (let d = 0; d < 4; d++) for (let left = perDay; left > 0; left -= 200) await xp(user, Math.min(left, 200), inWeek(week, d));
};

type Row = { rank: number; name: string; points: number; me: boolean };
type League = { mode: string; division: number; points: number; settled: number; week_points: number; week_xp: number; week_days: number; outcome: string | null; prev_division: number | null; players: number; position: number; rows: Row[]; rules: { thresholds: number[] } };
const league = (u: string) => db.rpc<League>('get_league', { p_user: u });
const one = async <T>(sql: string, params: unknown[] = []) => (await db.query<{ v: T }>(sql, params))[0].v;

beforeAll(async () => {
  db = await openEmbedded(undefined, path.resolve(__dirname, '..'));
  THIS = await one<string>('select league_week(now())::text as v');
});
afterAll(async () => {
  await db.close();
});

describe('aturan poin rank', () => {
  it('satu minggu paling banyak 100 poin: 70 dari XP (250 XP) dan 30 dari 4 hari belajar', async () => {
    const gain = (x: number, d: number) => one<number>('select rank_gain($1, $2) as v', [x, d]);
    expect(await gain(250, 4)).toBe(100);
    expect(await gain(3000, 7)).toBe(100); // more XP or days does not speed it up
    expect(await gain(125, 2)).toBe(50);
    expect(await gain(20, 1)).toBe(13);
    expect(await gain(0, 0)).toBe(-50); // a week without XP
  });

  it('ambang rank: Pelita 500, Obor 1.500, Lentera 3.000, Mercusuar 5.000', async () => {
    const div = (p: number) => one<number>('select rank_division($1) as v', [p]);
    expect([await div(0), await div(499), await div(500), await div(1499), await div(1500), await div(2999), await div(3000), await div(4999), await div(5000), await div(99999)])
      .toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
  });

  it('klien memakai aturan yang sama: progres ke rank berikutnya dan perkiraan minggu', () => {
    expect(RANK.thresholds).toEqual([0, 500, 1500, 3000, 5000]);
    expect(rankProgress(640)).toMatchObject({ division: 2, floor: 500, next: 1500, need: 860 });
    expect(rankProgress(5200)).toMatchObject({ division: 5, next: null, pct: 100 });
    expect(weeksToNext(860)).toBe(9);
    // Following the plan fully from zero: 5 + 10 + 15 + 20 = 50 weeks.
    expect([1, 2, 3, 4].reduce((w, d) => w + weeksToNext(RANK.thresholds[d] - RANK.thresholds[d - 1]), 0)).toBe(50);
  });
});

describe('rank dari riwayat belajar', () => {
  it('ikut rencana mingguan penuh: 49 minggu = Lentera, minggu ke-50 naik ke Mercusuar (±1 tahun)', async () => {
    const u = await newUser(db, 'Setahun');
    for (let k = 49; k >= 1; k--) await fullWeek(u, weekAgo(k));
    const before = await league(u);
    expect(before).toMatchObject({ mode: 'rank', division: 4, points: 4900, settled: 4900, week_points: 0, outcome: 'new' });
    // This week's plan, done: the rank changes at once, without waiting for Monday.
    await fullWeek(u, THIS);
    const after = await league(u);
    expect(after).toMatchObject({ division: 5, points: 5000, settled: 4900, week_points: 100, week_days: 4, outcome: 'promoted', prev_division: 4 });
  });

  it('XP berlebih tidak mempercepat: 3.000 XP sehari tetap 100 poin seminggu', async () => {
    const u = await newUser(db, 'Ngebut');
    for (let k = 6; k >= 1; k--) await fullWeek(u, weekAgo(k), 3000);
    expect(await league(u)).toMatchObject({ division: 2, points: 600 });
  });

  it('minggu tanpa XP mengurangi 50 poin (tidak di bawah 0), jadi rank bisa turun', async () => {
    const u = await newUser(db, 'Libur');
    for (let k = 9; k >= 4; k--) await fullWeek(u, weekAgo(k)); // 600 points
    // Three empty weeks since: 600 - 150 = 450, back to Lilin.
    expect(await league(u)).toMatchObject({ division: 1, points: 450 });
    // Shown Pelita before: the page says the rank went down.
    await db.query('update league_ranks set division = 2 where user_id = $1', [u]);
    expect(await league(u)).toMatchObject({ division: 1, outcome: 'demoted', prev_division: 2 });

    const v = await newUser(db, 'Sebentar');
    await fullWeek(v, weekAgo(5));
    expect(await league(v)).toMatchObject({ points: 0, division: 1 });
  });

  it('peserta liga mingguan lama: rank dihitung ulang dari riwayat XP, dengan pesan perubahan', async () => {
    const u = await newUser(db, 'Lama');
    await db.query('insert into league_members (week_start, user_id, division, cohort) values ($1, $2, 4, 1)', [weekAgo(1), u]);
    await fullWeek(u, weekAgo(2));
    await fullWeek(u, weekAgo(1));
    expect(await league(u)).toMatchObject({ division: 1, points: 200, outcome: 'converted', prev_division: 4 });
  });
});

describe('papan rank dan papan Semua', () => {
  it('Liga Rank menampilkan pemain di rank yang sama, urut poin; nama SD disamarkan', async () => {
    const [a, b, kid] = [await newUser(db, 'Papan A'), await newUser(db, 'Papan B'), await newUser(db, 'Papan SD')];
    await db.rpc('update_profile', { p_user: kid, p_patch: { school_level: 'sd' } });
    const pelita = await newUser(db, 'Papan Pelita');
    for (let k = 7; k >= 1; k--) await fullWeek(pelita, weekAgo(k));
    await xp(a, 200, inWeek(THIS));
    await xp(b, 40, inWeek(THIS));
    await xp(kid, 120, inWeek(THIS));
    await xp(pelita, 10, inWeek(THIS));
    await league(pelita); // a player who has opened the league (or been settled by the weekly run)
    const l = await league(b);
    expect(l.division).toBe(1);
    const names = l.rows.map((r) => r.name);
    expect(names).toEqual(expect.arrayContaining(['Papan A', 'Papan B', 'Pelajar SD']));
    expect(names).not.toContain('Papan SD');
    expect(names).not.toContain('Papan Pelita'); // a different rank
    expect(names.indexOf('Papan A')).toBeLessThan(names.indexOf('Pelajar SD'));
    expect(names.indexOf('Pelajar SD')).toBeLessThan(names.indexOf('Papan B'));
    expect(l.rows.find((r) => r.me)).toMatchObject({ name: 'Papan B', rank: l.position });
    for (let i = 1; i < l.rows.length; i++) expect(l.rows[i].points).toBeLessThanOrEqual(l.rows[i - 1].points);
    expect((await league(pelita)).rows.map((r) => r.name)).toContain('Papan Pelita');
  });

  it('papan Semua membawa rank setiap pemain', async () => {
    type Board = { top: { name: string; division: number; me: boolean }[]; me: { division: number } | null };
    const viewer = await newUser(db, 'Penonton Rank');
    const board = await db.rpc<Board>('get_leaderboard', { p_user: viewer });
    expect(board.top.find((r) => r.name === 'Papan Pelita')?.division).toBe(2);
    expect(board.top.find((r) => r.name === 'Papan A')?.division).toBe(1);
    expect(board.top.every((r) => r.division >= 1 && r.division <= 5)).toBe(true);
    expect(board.me).toBeNull();
  });

  it('penyelesaian mingguan berjalan sekali seminggu dan menjangkau pemain yang belum membuka liga', async () => {
    const quiet = await newUser(db, 'Diam');
    await fullWeek(quiet, weekAgo(3));
    await db.query("delete from job_runs where job like 'league-fill:rank-%'");
    expect(await db.rpc<number>('rank_tick')).toBeGreaterThan(0);
    expect(await one<number>('select points as v from league_ranks where user_id = $1', [quiet])).toBe(0); // 100 - 50 - 50
    expect(await db.rpc<number>('rank_tick')).toBe(0);
  });

  it('tabel dan fungsi baru tertutup bagi klien publik', async () => {
    for (const role of ['anon', 'authenticated']) {
      for (const fn of ['get_league(uuid)', 'get_leaderboard(uuid)', 'rank_settle(uuid)', 'rank_tick()', 'rank_live(date)']) {
        expect(await one<boolean>(`select has_function_privilege($1, 'public.${fn}', 'execute') as v`, [role]), `${role} ${fn}`).toBe(false);
      }
      expect(await one<boolean>("select has_table_privilege($1, 'public.league_ranks', 'select') as v", [role])).toBe(false);
    }
    expect(await db.rpc<string[]>('content_features')).toContain('rank');
  });
});
