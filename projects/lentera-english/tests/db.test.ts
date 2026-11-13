// Runs the real migrations in a real Postgres (PGlite) and checks the
// database-level guarantees: integrity, RLS, CMS publishing, progress sync.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import path from 'node:path';
import { buildPack } from '@content/index';
import { packForFree, packToRows, rowsToPack, type Rows } from '@/lib/content/rows';
import { validatePack } from '@/lib/content/validate';
import { openEmbedded, type RawDb } from '@/lib/server/db';
import { newUser } from './helpers';

const ROOT = path.resolve(__dirname, '..');
let db: RawDb;
const pack = buildPack();

/** Runs a statement the way a browser holding only the public key could. */
async function asRole(role: 'anon' | 'authenticated', userId: string | null, sql: string): Promise<{ rows: unknown[]; error?: string }> {
  await db.exec(`set role ${role}; select set_config('request.jwt.claim.sub', '${userId ?? ''}', false);`);
  try {
    return { rows: await db.query(sql) };
  } catch (e) {
    return { rows: [], error: (e as Error).message };
  } finally {
    await db.exec("reset role; select set_config('request.jwt.claim.sub', '', false);");
  }
}

beforeAll(async () => {
  db = await openEmbedded(undefined, ROOT);
});
afterAll(async () => {
  await db.close();
});

describe('schema and reference data', () => {
  it('creates every table required by the product spec', async () => {
    const tables = (await db.query<{ tablename: string }>("select tablename from pg_tables where schemaname = 'public'")).map((r) => r.tablename);
    for (const t of ['profiles', 'cefr_levels', 'courses', 'units', 'lessons', 'learning_objectives', 'questions', 'answer_options', 'exercise_attempts', 'vocabulary', 'grammar_topics', 'homework', 'exams', 'mastery_records', 'review_schedules', 'learning_history', 'xp_transactions', 'streaks', 'achievements', 'subscription_plans', 'payment_transactions', 'audio_resources']) {
      expect(tables, t).toContain(t);
    }
  });
  it('prices the plans as specified', async () => {
    const plans = await db.query('select id, price_idr, duration_days from subscription_plans order by price_idr');
    expect(plans).toEqual([
      { id: 'free', price_idr: 0, duration_days: 0 },
      { id: 'premium_monthly', price_idr: 58500, duration_days: 30 },
      { id: 'premium_yearly', price_idr: 585000, duration_days: 365 },
    ]);
  });
  it('enables row level security on every table', async () => {
    const off = await db.query("select tablename from pg_tables where schemaname = 'public' and not rowsecurity");
    expect(off).toEqual([]);
  });
});

describe('CMS: import, quality gate, publish, rollback', () => {
  let admin: string;
  let student: string;
  beforeAll(async () => {
    admin = await newUser(db, 'Admin', 'admin');
    student = await newUser(db, 'Siswa');
  });

  it('refuses CMS actions from non-admins', async () => {
    await expect(db.rpc('import_content', { p_actor: student, p_rows: {} })).rejects.toThrow(/forbidden/);
    await expect(db.rpc('admin_upsert', { p_actor: student, p_table: 'lessons', p_row: { id: 'x' } })).rejects.toThrow(/forbidden/);
    await expect(db.rpc('publish_curriculum', { p_actor: student, p_label: 'x', p_notes: '' })).rejects.toThrow(/forbidden/);
    await expect(db.rpc('admin_payment_overview', { p_actor: student })).rejects.toThrow(/forbidden/);
  });

  it('imports the authored pack and round-trips it without loss', async () => {
    const r = await db.rpc<{ rows: number }>('import_content', { p_actor: admin, p_rows: packToRows(pack) });
    expect(r.rows).toBeGreaterThan(400);
    const pub = await db.rpc<{ published: boolean; version: number }>('publish_curriculum', { p_actor: admin, p_label: 'v1', p_notes: 'awal' });
    expect(pub.published).toBe(true);
    const served = await db.rpc<{ label: string; rows: Rows }>('get_published_content');
    const back = rowsToPack(served.rows, pack.version);
    expect(validatePack(back)).toEqual([]);
    const sortById = <T extends { id: string }>(l: T[]) => [...l].sort((a, b) => a.id.localeCompare(b.id));
    expect(sortById(back.exercises)).toEqual(sortById(pack.exercises));
    expect(sortById(back.lessons)).toEqual(sortById(pack.lessons));
    expect(sortById(back.scenarios)).toEqual(sortById(pack.scenarios));
    expect(sortById(back.homework)).toEqual(sortById(pack.homework));
    expect(sortById(back.exams)).toEqual(sortById(pack.exams));
    expect(sortById(back.vocabulary)).toEqual(sortById(pack.vocabulary));
    expect(sortById(back.listening)).toEqual(sortById(pack.listening));
    expect(sortById(back.units)).toEqual(sortById(pack.units));
    expect(sortById(back.chapters)).toEqual(sortById(pack.chapters));
  });

  it('rejects a wrong option without an explanation and a second correct option', async () => {
    const q = { id: 'cms-test-1', stage: 'drill', type: 'mc', topic_id: 'a1.to-be', difficulty: 1, prompt: 'Pilih.', explanation: 'Karena.', payload: {}, options: [{ text: 'is', correct: true }, { text: 'are' }] };
    await expect(db.rpc('admin_upsert', { p_actor: admin, p_table: 'questions', p_row: q })).rejects.toThrow();
    q.options = [{ text: 'is', correct: true }, { text: 'are', correct: true }];
    await expect(db.rpc('admin_upsert', { p_actor: admin, p_table: 'questions', p_row: q })).rejects.toThrow();
    await expect(db.rpc('admin_upsert', { p_actor: admin, p_table: 'questions', p_row: { ...q, explanation: '  ', options: [] } })).rejects.toThrow();
    expect(await db.query("select 1 from questions where id = 'cms-test-1'")).toEqual([]);
  });

  it('blocks publishing while a published question has no correct answer', async () => {
    await db.rpc('admin_upsert', { p_actor: admin, p_table: 'questions', p_row: { id: 'cms-test-2', stage: 'drill', type: 'fill', topic_id: 'a1.to-be', difficulty: 1, prompt: 'Isi.', explanation: 'Karena.', payload: { text: 'She ___ here.' }, options: [] } });
    const blocked = await db.rpc<{ published: boolean; problems: string[] }>('publish_curriculum', { p_actor: admin, p_label: 'v-bad', p_notes: '' });
    expect(blocked.published).toBe(false);
    expect(blocked.problems.join(' ')).toContain('cms-test-2');
    await db.rpc('admin_delete', { p_actor: admin, p_table: 'questions', p_id: 'cms-test-2' });
  });

  it('keeps edits in draft until published, versions them, and can roll back', async () => {
    await db.rpc('admin_upsert', { p_actor: admin, p_table: 'lessons', p_row: { id: 'a1-greetings', title: 'Sapaan (revisi)', passing_score: 90, objectives: ['Tujuan baru'] } });
    let served = await db.rpc<{ rows: Rows }>('get_published_content');
    expect(served.rows.lessons.find((l) => l.id === 'a1-greetings').title).toBe('Sapaan dan Perkenalan');
    const v2 = await db.rpc<{ published: boolean; version: number }>('publish_curriculum', { p_actor: admin, p_label: 'v2', p_notes: 'revisi judul' });
    expect(v2.published).toBe(true);
    served = await db.rpc<{ rows: Rows }>('get_published_content');
    const lesson = served.rows.lessons.find((l) => l.id === 'a1-greetings');
    expect(lesson).toMatchObject({ title: 'Sapaan (revisi)', passing_score: 90, objectives: ['Tujuan baru'] });
    expect(lesson.intro.length).toBeGreaterThan(20);

    const versions = await db.rpc<{ id: number; label: string; is_current: boolean }[]>('list_curriculum_versions', { p_actor: admin });
    expect(versions.map((v) => v.label)).toEqual(['v2', 'v1']);
    await db.rpc('restore_curriculum_version', { p_actor: admin, p_id: versions[1].id });
    served = await db.rpc<{ rows: Rows }>('get_published_content');
    expect(served.rows.lessons.find((l) => l.id === 'a1-greetings').title).toBe('Sapaan dan Perkenalan');
  });

  it('hides unpublished lessons and their questions from the served snapshot', async () => {
    await db.rpc('admin_upsert', { p_actor: admin, p_table: 'lessons', p_row: { id: 'a1-do-does', status: 'draft' } });
    await db.rpc('publish_curriculum', { p_actor: admin, p_label: 'v3', p_notes: '' });
    const served = await db.rpc<{ rows: Rows }>('get_published_content');
    expect(served.rows.lessons.some((l) => l.id === 'a1-do-does')).toBe(false);
    expect(served.rows.questions.some((q) => q.lesson_id === 'a1-do-does')).toBe(false);
    await db.rpc('admin_upsert', { p_actor: admin, p_table: 'lessons', p_row: { id: 'a1-do-does', status: 'published' } });
  });
});

describe('premium content never reaches free accounts', () => {
  it('strips premium lesson bodies, exercises, scenarios and vocabulary', () => {
    const free = packForFree(pack);
    const lockedIds = new Set(pack.lessons.filter((l) => l.premium).map((l) => l.id));
    expect(lockedIds.size).toBeGreaterThan(0);
    for (const l of free.lessons.filter((x) => lockedIds.has(x.id))) {
      expect(l).toMatchObject({ locked: true, intro: '', teaching: [], demo: [] });
      expect(l.objectives.length).toBeGreaterThan(0);
    }
    expect(free.exercises.some((e) => e.lessonId && lockedIds.has(e.lessonId))).toBe(false);
    expect(free.exercises.some((e) => e.id.startsWith('drill.was-were'))).toBe(false);
    expect(free.exercises.some((e) => e.id.startsWith('drill.third-person-s'))).toBe(true);
    expect(free.scenarios.filter((s) => s.locked).every((s) => s.nodes.length === 0)).toBe(true);
    expect(free.scenarios.filter((s) => !s.locked).map((s) => s.id).sort()).toEqual(['introduce', 'restaurant']);
    expect(free.vocabulary.every((v) => !v.premium)).toBe(true);
    expect(JSON.stringify(free)).not.toContain('Hardly had she sat down');
    expect(validatePack(free)).toEqual([]);
  });
});

describe('row level security (what a client with the public key can do)', () => {
  let alice: string;
  let bob: string;
  beforeAll(async () => {
    alice = await newUser(db, 'Alice');
    bob = await newUser(db, 'Bob');
    await db.rpc('sync_learner', { p_user: alice, p_events: [{ id: 'a:1', kind: 'xp', at: Date.now(), data: { amount: 10, reason: 'lesson' } }], p_snapshot: null, p_client_updated_at: 1 });
  });

  it('lets a user read only their own rows', async () => {
    expect((await asRole('authenticated', alice, 'select id from profiles')).rows).toEqual([{ id: alice }]);
    expect((await asRole('authenticated', bob, 'select user_id from xp_transactions')).rows).toEqual([]);
    expect((await asRole('authenticated', alice, 'select amount from xp_transactions')).rows).toEqual([{ amount: 10 }]);
    expect((await asRole('anon', null, 'select id from profiles')).error).toMatch(/permission denied/);
  });
  it('blocks every client-side write, including self-promotion', async () => {
    expect((await asRole('authenticated', alice, `update profiles set role = 'admin' where id = '${alice}'`)).error).toMatch(/permission denied/);
    expect((await asRole('authenticated', alice, `insert into subscriptions (user_id, plan_id, starts_at, expires_at, source_transaction_id) values ('${alice}', 'premium_yearly', now(), now() + interval '365 days', gen_random_uuid())`)).error).toMatch(/permission denied/);
    expect((await asRole('authenticated', alice, `insert into xp_transactions (user_id, client_event_id, amount, reason, occurred_at) values ('${alice}', 'x', 200, 'cheat', now())`)).error).toMatch(/permission denied/);
    expect((await asRole('authenticated', alice, `update payment_transactions set status = 'SUCCEEDED'`)).error).toMatch(/permission denied/);
  });
  it('keeps curriculum, versions and gateway logs server-only', async () => {
    for (const t of ['lessons', 'questions', 'answer_options', 'curriculum_versions', 'payment_webhook_events', 'conversation_scenarios']) {
      expect((await asRole('authenticated', alice, `select * from ${t} limit 1`)).error, t).toMatch(/permission denied/);
    }
  });
  it('does not let API roles call server functions directly', async () => {
    for (const call of [
      `select process_payment_event('k', 'webhook', 'payment.capture', 'r', null, null, 'SUCCEEDED', 1, 'IDR', 'QRIS', null, '{}')`,
      `select sync_learner('${alice}', '[]', null, 1)`,
      `select get_published_content()`,
      `select admin_payment_overview('${alice}')`,
      `select create_payment_intent('${alice}', 'premium_monthly', 'QRIS')`,
    ]) {
      expect((await asRole('authenticated', alice, call)).error, call).toMatch(/permission denied/);
      expect((await asRole('anon', null, call)).error, call).toMatch(/permission denied/);
    }
  });
});

describe('progress sync', () => {
  it('stores events idempotently, caps XP, and writes normalized records', async () => {
    const u = await newUser(db, 'Rani');
    const now = Date.now();
    const events = [
      { id: 'e1', kind: 'attempt', at: now, data: { ex: 'a2-past-be.g1', topic: 'a2.past-be', ok: false, tag: 'was-were', ms: 5400, ctx: 'guided', d: 1, hint: false, given: 'were' } },
      { id: 'e2', kind: 'xp', at: now, data: { amount: 20, reason: 'lesson', ref: 'a1-greetings' } },
      { id: 'e3', kind: 'xp', at: now, data: { amount: 5000, reason: 'cheat' } },
      { id: 'e4', kind: 'review', at: now, data: { key: 'topic:a1.to-be', ok: true, before: 1, after: 3, dueAt: now + 3 * 86400000 } },
      { id: 'e5', kind: 'lesson', at: now, data: { id: 'a1-greetings', score: 100, passed: true } },
      { id: 'e6', kind: 'achievement', at: now, data: { id: 'first-lesson' } },
      { id: 'e7', kind: 'achievement', at: now, data: { id: 'does-not-exist' } },
      { id: 'e8', kind: 'exam', at: now, data: { id: 'exam.a1-c1-u1', score: 83, passed: true } },
    ];
    const snapshot = {
      profile: { name: 'Rani Baru', placementLevel: 'A2' },
      topics: { 'a2.past-be': { score: 42, stage: 'learning', attempts: 5, correct: 2, lastAt: now } },
      reviews: { 'topic:a1.to-be': { step: 1, intervalDays: 3, dueAt: now + 3 * 86400000, lapses: 0 } },
      lessons: { 'a1-greetings': { step: 7, masteryBest: 100, masteryAttempts: 1, completedAt: now } },
      streak: { current: 4, longest: 9, lastDate: '2026-11-13', freezes: 1 },
    };
    const r1 = await db.rpc<{ accepted: number; rejected: number; entitlement: { premium: boolean } }>('sync_learner', { p_user: u, p_events: events, p_snapshot: snapshot, p_client_updated_at: now });
    expect(r1.rejected).toBe(1);
    expect(r1.entitlement.premium).toBe(false);
    // The same batch again (retry after a lost response) changes nothing.
    await db.rpc('sync_learner', { p_user: u, p_events: events, p_snapshot: snapshot, p_client_updated_at: now });

    expect(await db.query('select question_id, is_correct, misconception_tag, context from exercise_attempts where user_id = $1', [u])).toEqual([{ question_id: 'a2-past-be.g1', is_correct: false, misconception_tag: 'was-were', context: 'guided' }]);
    expect(await db.query('select amount from xp_transactions where user_id = $1', [u])).toEqual([{ amount: 20 }]);
    expect(await db.query('select item_key, interval_before, interval_after from review_history where user_id = $1', [u])).toEqual([{ item_key: 'topic:a1.to-be', interval_before: 1, interval_after: 3 }]);
    expect(await db.query('select event_type, ref_id, score, passed from learning_history where user_id = $1 order by event_type', [u])).toEqual([
      { event_type: 'exam', ref_id: 'exam.a1-c1-u1', score: 83, passed: true },
      { event_type: 'lesson', ref_id: 'a1-greetings', score: 100, passed: true },
    ]);
    expect(await db.query('select achievement_id from user_achievements where user_id = $1', [u])).toEqual([{ achievement_id: 'first-lesson' }]);
    expect(await db.query('select score, stage, attempts from mastery_records where user_id = $1', [u])).toEqual([{ score: 42, stage: 'learning', attempts: 5 }]);
    expect(await db.query('select step, interval_days, lapses from review_schedules where user_id = $1', [u])).toEqual([{ step: 1, interval_days: 3, lapses: 0 }]);
    expect(await db.query('select mastery_best, completed_at is not null as done from lesson_progress where user_id = $1', [u])).toEqual([{ mastery_best: 100, done: true }]);
    expect(await db.query('select current_streak, longest_streak from streaks where user_id = $1', [u])).toEqual([{ current_streak: 4, longest_streak: 9 }]);
    expect(await db.query('select display_name, placement_level, role from profiles where id = $1', [u])).toEqual([{ display_name: 'Rani Baru', placement_level: 'A2', role: 'student' }]);

    const snap = await db.rpc<{ state: typeof snapshot; client_updated_at: number }>('get_snapshot', { p_user: u });
    expect(snap.state.streak.current).toBe(4);
    // An older device cannot overwrite a newer snapshot.
    await db.rpc('sync_learner', { p_user: u, p_events: [], p_snapshot: { ...snapshot, streak: { ...snapshot.streak, current: 1 } }, p_client_updated_at: now - 1000 });
    expect((await db.rpc<{ state: typeof snapshot }>('get_snapshot', { p_user: u })).state.streak.current).toBe(4);
  });

  it('ranks the weekly leaderboard from the XP ledger', async () => {
    const a = await newUser(db, 'Juara');
    const b = await newUser(db, 'Runner');
    const now = Date.now();
    await db.rpc('sync_learner', { p_user: a, p_events: [1, 2, 3].map((i) => ({ id: `x${i}`, kind: 'xp', at: now, data: { amount: 100, reason: 'lesson' } })), p_snapshot: null, p_client_updated_at: 1 });
    await db.rpc('sync_learner', { p_user: b, p_events: [{ id: 'y1', kind: 'xp', at: now, data: { amount: 150, reason: 'lesson' } }], p_snapshot: null, p_client_updated_at: 1 });
    const board = await db.rpc<{ top: { name: string; xp: number; rank: number; me: boolean }[]; me: { rank: number; xp: number } }>('get_leaderboard', { p_user: b });
    expect(board.top.slice(0, 2).map((r) => [r.name, r.xp])).toEqual([['Juara', 300], ['Runner', 150]]);
    expect(board.me).toEqual({ rank: 2, xp: 150 });
    expect(board.top.find((r) => r.me)?.name).toBe('Runner');
  });
});
