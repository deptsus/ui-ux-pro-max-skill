// Rilis 4: weekly PR from the learner's own work, B2–C2 writing tasks with
// leveled examples, the homework calendar file, reminders on learners' phones
// and the owner's homework summary.
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import path from 'node:path';
import webpush from 'web-push';
import { buildPack } from '@content/index';
import { WRITING_UPPER } from '@content/writing-upper';
import { indexContent, type Exercise } from '@/lib/content/types';
import { packForFree } from '@/lib/content/rows';
import { validatePack } from '@/lib/content/validate';
import { weekStart } from '@/lib/engine/plan';
import { recommend } from '@/lib/engine/recommend';
import { tagPool, topicPool } from '@/lib/engine/sessions';
import { createState, submitHomework } from '@/lib/engine/state';
import type { AttemptLog, LearnerState } from '@/lib/engine/types';
import { allHomework, buildWeekly, ensureWeekly, isWeekly, weeklyId, WEEKLY } from '@/lib/engine/weekly';
import { checkWriting, countWords } from '@/lib/engine/writing';
import { homeworkIcs } from '@/lib/homework-ics';
import { openEmbedded, type RawDb } from '@/lib/server/db';
import { jakartaHour, reminderMessage, runHomeworkReminders } from '@/lib/server/reminders';
import { newUser } from './helpers';

const pack = buildPack();
const ix = indexContent(pack);
const DAY = 24 * 3600 * 1000;
// Wednesday 18 November 2026, 10:00 local time.
const NOW = new Date(2026, 10, 18, 10, 0, 0).getTime();

let seq = 0;
function attempt(s: LearnerState, ex: Exercise, ok: boolean, at: number, tag?: string) {
  const a: AttemptLog = { id: `a${++seq}`, at, ex: ex.id, topic: ex.topic, ok, tag, ms: 4000, ctx: 'independent', d: ex.difficulty, given: ok ? 'ok' : 'x' };
  s.attempts.push(a);
}
/** A learner who practised two A2 topics this week and keeps confusing was/were. */
function busyLearner(): LearnerState {
  const s = createState('u-weekly', NOW - 30 * DAY);
  const past = topicPool(ix, 'a2.past-be');
  const future = topicPool(ix, 'a2.future');
  past.slice(0, 6).forEach((e, i) => attempt(s, e, true, NOW - 2 * DAY + i * 1000));
  future.slice(0, 3).forEach((e, i) => attempt(s, e, true, NOW - 3 * DAY + i * 1000));
  // Two mistakes, one of them later corrected.
  const tag = pack.tags.find((t) => t.topic === 'a2.past-be')!.id;
  attempt(s, past[6], false, NOW - 5 * DAY, tag);
  attempt(s, past[7], false, NOW - 4 * DAY, tag);
  attempt(s, past[7], true, NOW - DAY);
  return s;
}

describe('PR mingguan otomatis', () => {
  it('tidak dibuat untuk pelajar yang belum belajar', () => {
    const s = createState('u-new', NOW - DAY);
    expect(buildWeekly(ix, s, NOW)).toBeNull();
    expect(ensureWeekly(ix, s, NOW)).toBeNull();
    expect(Object.keys(s.homework)).toEqual([]);
  });

  it('memadukan topik 7 hari terakhir dan kesalahan sendiri, dengan aturan tetap', () => {
    const s = busyLearner();
    const w = buildWeekly(ix, s, NOW)!;
    expect(w.id).toBe(weeklyId(weekStart(NOW)));
    expect(w.id).toBe('hw.week.2026-11-16');
    expect(w.title).toBe('PR Mingguan · 16 Nov');
    expect(w.exerciseIds.length).toBe(WEEKLY.size);
    expect(new Set(w.exerciseIds).size).toBe(w.exerciseIds.length);
    expect(w.parts.topics).toEqual(['a2.past-be', 'a2.future']);
    expect(w.parts.fromTopics + w.parts.fromMistakes).toBe(WEEKLY.size);
    expect(w.parts.fromMistakes).toBeGreaterThanOrEqual(2);
    // The question still answered wrong comes back; the one corrected since does not.
    const past = topicPool(ix, 'a2.past-be');
    expect(w.exerciseIds).toContain(past[6].id);
    expect(w.exerciseIds.slice(w.parts.fromTopics)).not.toContain(past[7].id);
    for (const id of w.exerciseIds) {
      const e = ix.exerciseById.get(id)!;
      expect(['exam', 'placement', 'story', 'listening'], id).not.toContain(e.stage);
    }
    // Deadline: Sunday 23:59:59 of the same week.
    const due = new Date(w.dueAt);
    expect([due.getDay(), due.getHours(), due.getMinutes()]).toEqual([0, 23, 59]);
    expect(buildWeekly(ix, busyLearner(), NOW)).toEqual(w);
  });

  it('PR yang baru tersusun di akhir pekan tetap diberi waktu minimal dua hari', () => {
    const sunday = new Date(2026, 10, 22, 9, 0).getTime();
    const w = buildWeekly(ix, busyLearner(), sunday)!;
    expect(w.id).toBe('hw.week.2026-11-16');
    const due = new Date(w.dueAt);
    expect([due.getDate(), due.getHours(), due.getMinutes()]).toEqual([24, 23, 59]);
  });

  it('soal dari pola kesalahan diambil dari bank latihan pola itu', () => {
    const s = busyLearner();
    const w = buildWeekly(ix, s, NOW)!;
    const tag = pack.tags.find((t) => t.topic === 'a2.past-be')!.id;
    const pool = new Set(tagPool(ix, tag).map((e) => e.id));
    expect(w.exerciseIds.slice(w.parts.fromTopics).some((id) => pool.has(id))).toBe(true);
  });

  it('disimpan sekali per minggu dan tidak berubah meski kemajuan berubah', () => {
    const s = busyLearner();
    const id = ensureWeekly(ix, s, NOW)!;
    const saved = structuredClone(s.homework[id]);
    expect(saved.exerciseIds?.length).toBe(WEEKLY.size);
    attempt(s, topicPool(ix, 'a2.comparatives')[0], false, NOW + 1000);
    expect(ensureWeekly(ix, s, NOW + DAY)).toBe(id);
    expect(s.homework[id]).toEqual(saved);
    // Next week brings a new one.
    expect(ensureWeekly(ix, s, NOW + 7 * DAY)).not.toBe(id);
  });

  it('muncul di daftar PR dan rekomendasi, dan bisa dikumpulkan seperti PR lain', () => {
    const s = busyLearner();
    const id = ensureWeekly(ix, s, NOW)!;
    const def = allHomework(ix, s).find((h) => h.id === id)!;
    expect(isWeekly(def.id)).toBe(true);
    expect(def.exerciseIds).toEqual(s.homework[id].exerciseIds);
    const recs = recommend(s, ix, { premium: true, plan: 'admin' }, s.homework[id].dueAt - DAY);
    expect(recs.some((r) => r.id === `hw:${id}`)).toBe(true);
    submitHomework(s, def, 80, NOW + 3600_000);
    expect(s.homework[id].submissions).toEqual([{ at: NOW + 3600_000, score: 80, late: false }]);
    expect(s.outbox.at(-1)).toMatchObject({ kind: 'homework', data: { id, score: 80, late: false } });
  });
});

describe('tugas menulis B2–C2', () => {
  const tasks = pack.homework.filter((h) => h.writing && ['B2', 'C1', 'C2'].includes(pack.chapters.find((c) => c.id === h.chapterId)!.level));
  it('setiap bab B2–C2 punya tugas menulis dengan tiga contoh bertingkat', () => {
    for (const c of pack.chapters.filter((x) => ['B2', 'C1', 'C2'].includes(x.level) && !x.track)) {
      const h = tasks.find((t) => t.chapterId === c.id);
      expect(h, c.id).toBeDefined();
      expect(h!.writing!.levels!.map((l) => l.label)).toEqual(['Cukup', 'Baik', 'Sangat baik']);
      expect(h!.writing!.levels!.at(-1)!.text).toBe(h!.writing!.model);
    }
    expect(tasks.length).toBe(WRITING_UPPER.length);
  });
  it('semua contoh lolos daftar periksa; tulisan asal-asalan dan yang terlalu panjang tidak', () => {
    for (const h of tasks) {
      const w = h.writing!;
      for (const l of w.levels!) expect(checkWriting(l.text, w).items.filter((i) => !i.ok).map((i) => i.label), `${h.id} ${l.label}`).toEqual([]);
      expect(checkWriting('I agree with this.', w).score, h.id).toBeLessThan(40);
      if (w.maxWords) {
        const long = `${w.model} ${'And this is one more sentence that makes it longer. '.repeat(20)}`.trim();
        expect(countWords(long)).toBeGreaterThan(w.maxWords);
        expect(checkWriting(long, w).items[0].ok, h.id).toBe(false);
      }
    }
  });
  it('ringkasan punya teks sumber dan batas atas jumlah kata', () => {
    const summaries = tasks.filter((h) => h.writing!.source);
    expect(summaries.map((h) => h.chapterId).sort()).toEqual(['b2-c1', 'c1-c2']);
    for (const h of summaries) expect(h.writing!.maxWords).toBeLessThanOrEqual(100);
  });
  it('gerbang mutu menolak contoh bertingkat yang tidak lolos daftar periksa', () => {
    const broken = structuredClone(pack);
    const h = broken.homework.find((x) => x.id === 'hw.c1-c1.write')!;
    h.writing!.levels![0].text = 'Too short.';
    expect(validatePack(broken).join('\n')).toContain('contoh "Cukup" tidak memenuhi daftar periksa');
  });
  it('tugas bab Premium tidak ikut ke paket Free', () => {
    const free = packForFree(pack);
    expect(free.homework.some((h) => tasks.some((t) => t.id === h.id))).toBe(false);
    expect(validatePack(free)).toEqual([]);
  });
});

describe('kalender PR', () => {
  it('file .ics memuat satu acara sehari penuh per PR yang belum selesai, dengan alarm', () => {
    const due = new Date(2026, 10, 22, 23, 59).getTime();
    const ics = homeworkIcs([
      { id: 'hw.week.2026-11-16', title: 'PR Mingguan · 16 Nov', dueAt: due, status: 'pending' },
      { id: 'hw.a2-past-be', title: 'Was, were; dan lainnya', dueAt: due, status: 'overdue' },
      { id: 'hw.done', title: 'Selesai', dueAt: due, status: 'done' },
    ], 'https://lentera-english-app.netlify.app', NOW);
    expect(ics.match(/BEGIN:VEVENT/g)?.length).toBe(2);
    expect(ics).toContain('DTSTART;VALUE=DATE:20261122');
    expect(ics).toContain('DTEND;VALUE=DATE:20261123');
    expect(ics).toContain('SUMMARY:Tenggat PR: Was\\, were\\; dan lainnya');
    expect(ics).toContain('TRIGGER:-PT6H');
    expect(ics).not.toContain('Selesai');
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
  });
});

describe('pengingat PR dan ringkasan PR (migrasi 0010)', () => {
  const ROOT = path.resolve(__dirname, '..');
  let db: RawDb;
  let admin: string;
  let ani: string;
  let budi: string;
  const device = (n: string) => ({ endpoint: `https://push.example.test/r/${n}`, p256dh: 'B'.repeat(87), auth: 'A'.repeat(22) });
  const subscribe = (user: string, n: string) => db.rpc('save_reminder_subscription', { p_user: user, p_endpoint: device(n).endpoint, p_p256dh: device(n).p256dh, p_auth: device(n).auth, p_user_agent: 'vitest' });
  async function snapshot(user: string, homework: Record<string, unknown>) {
    // The snapshot also carries the display name, which sync copies to the profile.
    const s = createState(user, NOW - 30 * DAY, user === ani ? 'Ani' : user === budi ? 'Budi' : 'Admin PR') as unknown as Record<string, unknown>;
    s.homework = homework;
    await db.rpc('sync_learner', { p_user: user, p_events: [], p_snapshot: s, p_client_updated_at: Date.now() + seq++ });
  }
  beforeAll(async () => {
    db = await openEmbedded(undefined, ROOT);
    admin = await newUser(db, 'Admin PR', 'admin');
    ani = await newUser(db, 'Ani');
    budi = await newUser(db, 'Budi');
  });
  afterAll(async () => {
    await db.close();
  });
  afterEach(() => vi.restoreAllMocks());

  it('setiap pelajar boleh mendaftarkan HP untuk pengingat, maksimal 5 perangkat', async () => {
    expect(await subscribe(ani, 'ani-1')).toMatchObject({ saved: true, devices: 1 });
    await expect(db.rpc('save_reminder_subscription', { p_user: ani, p_endpoint: 'http://insecure.test/x', p_p256dh: 'B'.repeat(87), p_auth: 'A'.repeat(22), p_user_agent: '' })).rejects.toThrow(/invalid_subscription/);
    for (let i = 2; i <= 7; i++) await subscribe(budi, `budi-${i}`);
    expect(await db.rpc<unknown[]>('reminder_targets_for', { p_user: budi })).toHaveLength(5);
    expect(await db.rpc('delete_reminder_subscription', { p_user: budi, p_endpoint: device('budi-7').endpoint })).toEqual({ devices: 4 });
  });

  it('memilih PR yang belum dikumpulkan dan bertenggat dalam 24 jam, sekali per PR', async () => {
    const now = NOW;
    await snapshot(ani, {
      'hw.a2-past-be': { assignedAt: now - 2 * DAY, dueAt: now + 10 * 3600_000, submissions: [] },
      'hw.week.2026-11-16': { assignedAt: now - DAY, dueAt: now + 20 * 3600_000, submissions: [], title: 'PR Mingguan · 16 Nov', exerciseIds: ['x'] },
      'hw.done': { assignedAt: now - 2 * DAY, dueAt: now + 5 * 3600_000, submissions: [{ at: now, score: 90, late: false }] },
      'hw.later': { assignedAt: now, dueAt: now + 30 * 3600_000, submissions: [] },
      'hw.past': { assignedAt: now - 5 * DAY, dueAt: now - 3600_000, submissions: [] },
      'hw.broken': { dueAt: 'soon', submissions: 'none' },
    });
    // Budi has devices but nothing due; Admin has something due but no device.
    await snapshot(budi, { 'hw.a1-to-be': { assignedAt: now, dueAt: now + 3 * DAY, submissions: [] } });
    await snapshot(admin, { 'hw.a1-to-be': { assignedAt: now, dueAt: now + 3600_000, submissions: [] } });
    const targets = await db.rpc<{ user_id: string; items: { id: string; title: string | null }[]; subs: unknown[] }[]>('homework_reminder_targets', { p_now_ms: now, p_window_ms: DAY });
    expect(targets.map((t) => t.user_id)).toEqual([ani]);
    expect(targets[0].items.map((i) => i.id)).toEqual(['hw.a2-past-be', 'hw.week.2026-11-16']);
    expect(targets[0].items[1].title).toBe('PR Mingguan · 16 Nov');
    expect(targets[0].subs).toHaveLength(1);
    expect(await db.rpc('record_homework_reminders', { p_user: ani, p_ids: ['hw.a2-past-be'] })).toBe(1);
    const again = await db.rpc<{ items: { id: string }[] }[]>('homework_reminder_targets', { p_now_ms: now, p_window_ms: DAY });
    expect(again[0].items.map((i) => i.id)).toEqual(['hw.week.2026-11-16']);
    await db.query("delete from homework_reminders");
  });

  it('pesan pengingat menyebut judul PR dan tenggatnya dalam WIB', () => {
    const due = Date.UTC(2026, 10, 22, 16, 59); // Sunday 23:59 WIB
    const one = reminderMessage([{ id: 'hw.a2-past-be', title: null, due_ms: due }], () => 'Was dan Were');
    expect(one).toEqual({ title: 'Tenggat PR sudah dekat', body: '"Was dan Were" belum dikumpulkan. Tenggatnya Minggu pukul 23.59 WIB.', url: '/app/homework?id=hw.a2-past-be', tag: 'pr-hw.a2-past-be' });
    const many = reminderMessage([1, 2, 3, 4].map((n) => ({ id: `hw.${n}`, title: `PR ${n}`, due_ms: due })), () => undefined);
    expect(many.title).toBe('4 PR tenggatnya sudah dekat');
    expect(many.body).toBe('PR 1, PR 2, PR 3, dan lainnya. Buka Pusat PR untuk mengerjakannya.');
    expect(many.url).toBe('/app/homework');
  });

  it('dikirim antara 07.00 dan 20.00 WIB, paling sering sekali per 50 menit, dan hanya yang terkirim dicatat', async () => {
    const night = Date.UTC(2026, 10, 18, 19, 0); // 02:00 WIB
    const morning = Date.UTC(2026, 10, 18, 3, 0); // 10:00 WIB
    expect(jakartaHour(night)).toBe(2);
    expect(jakartaHour(morning)).toBe(10);
    await snapshot(ani, { 'hw.a2-past-be': { assignedAt: morning - DAY, dueAt: morning + 8 * 3600_000, submissions: [] } });
    const sent: { endpoint: string; body: string }[] = [];
    vi.spyOn(webpush, 'sendNotification').mockImplementation(async (sub, payload) => {
      sent.push({ endpoint: sub.endpoint, body: String(payload) });
      return { statusCode: 201, body: '', headers: {} };
    });
    expect(await runHomeworkReminders(db, { now: night })).toEqual({ skipped: 'quiet-hours' });
    const first = await runHomeworkReminders(db, { now: morning });
    expect(first).toEqual({ learners: 1, reminded: 1, sent: 1, failed: 0, removed: 0 });
    expect(sent).toHaveLength(1);
    expect(JSON.parse(sent[0].body)).toMatchObject({ title: 'Tenggat PR sudah dekat', url: '/app/homework?id=hw.a2-past-be' });
    expect(await runHomeworkReminders(db, { now: morning + 60_000 })).toEqual({ skipped: 'ran-recently' });
    await db.query("update job_runs set last_run_at = now() - interval '2 hours'");
    // Reminded once: the next hour finds nothing.
    expect(await runHomeworkReminders(db, { now: morning + 3600_000 })).toMatchObject({ learners: 0, reminded: 0 });

    // A delivery that fails is not recorded, so the next run tries again.
    await snapshot(ani, { 'hw.week.2026-11-16': { assignedAt: morning, dueAt: morning + 5 * 3600_000, submissions: [], title: 'PR Mingguan · 16 Nov' } });
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.mocked(webpush.sendNotification).mockImplementation(async () => { throw Object.assign(new Error('down'), { statusCode: 500 }); });
    await db.query("update job_runs set last_run_at = now() - interval '2 hours'");
    expect(await runHomeworkReminders(db, { now: morning + 2 * 3600_000 })).toMatchObject({ learners: 1, reminded: 0, failed: 1 });
    const [{ n }] = await db.query<{ n: number }>("select count(*)::int as n from homework_reminders where homework_id = 'hw.week.2026-11-16'");
    expect(n).toBe(0);
  });

  it('ringkasan PR untuk pemilik: per PR (mingguan digabung) dan per pelajar; tertutup bagi selain admin', async () => {
    const now = Date.now();
    await snapshot(ani, {
      'hw.week.2026-11-09': { assignedAt: now - 9 * DAY, dueAt: now - 3 * DAY, submissions: [{ at: now - 4 * DAY, score: 70, late: false }] },
      'hw.week.2026-11-16': { assignedAt: now - DAY, dueAt: now + 5 * DAY, submissions: [] },
      'hw.a2-past-be': { assignedAt: now - 6 * DAY, dueAt: now - 3 * DAY, submissions: [] },
    });
    await snapshot(budi, { 'hw.a2-past-be': { assignedAt: now - 6 * DAY, dueAt: now - 4 * DAY, submissions: [{ at: now - 3 * DAY, score: 90, late: true }] } });
    await db.rpc('sync_learner', { p_user: budi, p_events: [{ id: 'hw-ev-1', kind: 'homework', at: now - 3 * DAY, data: { id: 'hw.a2-past-be', score: 90, late: true } }], p_snapshot: null, p_client_updated_at: 0 });
    const o = await db.rpc<{ totals: Record<string, number>; by_homework: { id: string; assigned: number; submitted: number; overdue: number }[]; learners: { name: string; overdue: number; open: number }[]; weeks: { submissions: number }[] }>('admin_homework_overview', { p_actor: admin });
    // Ani 3 + Budi 1 + the admin's own PR from an earlier test: due at NOW + 1 h (a fixed date),
    // so it is open before that moment and overdue after it.
    const adminOpen = now < NOW + 3600_000 ? 1 : 0;
    expect(o.totals).toMatchObject({ assigned: 5, submitted: 2, open: 1 + adminOpen, overdue: 2 - adminOpen, late: 1, avg_score: 80 });
    expect(o.by_homework.find((h) => h.id === 'hw.week')).toMatchObject({ assigned: 2, submitted: 1, overdue: 0 });
    expect(o.by_homework.find((h) => h.id === 'hw.a2-past-be')).toMatchObject({ assigned: 2, submitted: 1, overdue: 1 });
    expect(o.learners[0]).toMatchObject({ name: 'Ani', overdue: 1, open: 1 });
    expect(o.weeks.reduce((n, w) => n + Number(w.submissions), 0)).toBe(1);
    await expect(db.rpc('admin_homework_overview', { p_actor: ani })).rejects.toThrow(/forbidden/);
  });

  it('tabel dan fungsi baru tertutup bagi klien publik', async () => {
    for (const role of ['anon', 'authenticated']) {
      for (const fn of ['save_reminder_subscription(uuid,text,text,text,text)', 'homework_reminder_targets(bigint,bigint)', 'admin_homework_overview(uuid)', 'claim_job(text,integer)']) {
        const [{ ok }] = await db.query<{ ok: boolean }>(`select has_function_privilege($1, 'public.${fn}', 'execute') as ok`, [role]);
        expect(ok, `${role} ${fn}`).toBe(false);
      }
      for (const table of ['reminder_subscriptions', 'homework_reminders', 'job_runs']) {
        const [{ ok }] = await db.query<{ ok: boolean }>(`select has_table_privilege($1, 'public.${table}', 'select') as ok`, [role]);
        expect(ok, `${role} ${table}`).toBe(false);
      }
    }
    expect(await db.rpc('claim_job', { p_job: 'test-job', p_min_seconds: 3000 })).toBe(true);
    expect(await db.rpc('claim_job', { p_job: 'test-job', p_min_seconds: 3000 })).toBe(false);
  });
});
