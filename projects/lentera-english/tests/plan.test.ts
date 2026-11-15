// Weekly study plan for yearly subscribers (tahap 4).
import { describe, expect, it } from 'vitest';
import { buildPack } from '@content/index';
import { indexContent } from '@/lib/content/types';
import { completedAt, planMilestones, planWindow, weekPlan, weekStart, WEEK, type Milestone } from '@/lib/engine/plan';
import { completeConversation, completeListening, completeStory, createState } from '@/lib/engine/state';
import { dayKey } from '@/lib/engine/mastery';
import type { Entitlement, LearnerState } from '@/lib/engine/types';

const ix = indexContent(buildPack());
const DAY = 24 * 3600 * 1000;
// A Wednesday noon, so "this week" started two and a half days earlier.
const NOW = new Date(2026, 10, 18, 12, 0, 0).getTime();
const yearly = (from = NOW): Entitlement => ({ premium: true, plan: 'premium_yearly', expiresAt: from + 365 * DAY });

function finish(s: LearnerState, m: Milestone, at: number) {
  if (m.kind === 'lesson') s.lessons[m.ref] = { startedAt: at, step: 7, masteryBest: 100, masteryAttempts: 1, completedAt: at };
  else if (m.kind === 'unit-exam' || m.kind === 'level-exam') s.exams[m.ref] = { attempts: [{ at, score: 90, passed: true }] };
  else if (m.kind === 'listening') completeListening(s, m.ref, at);
  else if (m.kind === 'story') completeStory(s, m.ref, at);
  else completeConversation(s, m.ref, 100, at);
}

describe('urutan rencana', () => {
  const all = planMilestones(ix, 'A1');

  it('mencakup seluruh jalur A1–C2 tepat sekali', () => {
    const p = ix.pack;
    expect(new Set(all.map((m) => m.key)).size).toBe(all.length);
    expect(all.filter((m) => m.kind === 'lesson').length).toBe(p.lessons.length);
    expect(all.filter((m) => m.kind === 'unit-exam').length).toBe(p.exams.filter((e) => e.scope === 'unit').length);
    expect(all.filter((m) => m.kind === 'level-exam').length).toBe(6);
    expect(all.filter((m) => m.kind === 'listening').length).toBe(p.listening.length);
    expect(all.filter((m) => m.kind === 'conversation').length).toBe(p.scenarios.length);
    expect(all.filter((m) => m.kind === 'story').length).toBe(p.stories.length);
  });

  it('pelajaran mengikuti urutan kurikulum, ujian unit setelah pelajaran terakhir unitnya, ujian level paling akhir di levelnya', () => {
    expect(all.filter((m) => m.kind === 'lesson').map((m) => m.ref)).toEqual(ix.orderedLessons.map((l) => l.id));
    for (const e of ix.pack.exams.filter((x) => x.scope === 'unit')) {
      const at = all.findIndex((m) => m.ref === e.id);
      const last = Math.max(...ix.pack.lessons.filter((l) => l.unitId === e.ref).map((l) => all.findIndex((m) => m.ref === l.id)));
      expect(at, e.id).toBeGreaterThan(last);
    }
    for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const) {
      const ofLevel = all.filter((m) => m.level === level);
      expect(ofLevel.at(-1)?.kind, level).toBe('level-exam');
    }
  });

  it('latihan menyimak dan percakapan diselipkan di antara bab, bukan ditumpuk di akhir level', () => {
    const b2 = all.filter((m) => m.level === 'B2');
    const firstSkill = b2.findIndex((m) => m.kind === 'listening' || m.kind === 'conversation');
    const lastLesson = b2.map((m) => m.kind).lastIndexOf('lesson');
    expect(firstSkill).toBeLessThan(lastLesson);
  });

  it('setiap cerita dijadwalkan setelah bab yang mengajarkan tata bahasa yang diuji soalnya', () => {
    const chapterOf = (lessonId: string) => ix.unitById.get(ix.lessonById.get(lessonId)!.unitId)!.chapterId;
    for (const st of ix.pack.stories) {
      const at = all.findIndex((m) => m.key === `story:${st.id}`);
      const taught = new Set<string>();
      for (const q of st.questionIds) {
        const e = ix.exerciseById.get(q)!;
        for (const tag of (e.options ?? []).map((o) => o.tag)) if (tag) taught.add(ix.tagById.get(tag)!.topic);
      }
      // Every lesson of the same level that teaches one of those topics comes before the story.
      for (const l of ix.pack.lessons.filter((x) => taught.has(x.topic) && ix.chapterById.get(chapterOf(x.id))!.level === st.level)) {
        expect(all.findIndex((m) => m.key === `lesson:${l.id}`), `${st.id} setelah ${l.id}`).toBeLessThan(at);
      }
    }
  });

  it('dimulai dari level hasil tes penempatan', () => {
    const fromB1 = planMilestones(ix, 'B1');
    expect(fromB1[0].level).toBe('B1');
    expect(fromB1.some((m) => m.level === 'A1' || m.level === 'A2')).toBe(false);
  });
});

describe('siapa yang mendapat rencana', () => {
  const s = createState('u', NOW - 30 * DAY);
  it('Free dan paket bulanan tidak, tahunan dan admin ya', () => {
    expect(planWindow({ premium: false }, s, NOW)).toBeNull();
    expect(planWindow({ premium: true, plan: 'premium_monthly', expiresAt: NOW + 20 * DAY }, s, NOW)).toBeNull();
    expect(planWindow({ premium: true, plan: 'premium_yearly', expiresAt: NOW - DAY }, s, NOW)).toBeNull();
    const w = planWindow(yearly(NOW - 10 * DAY), s, NOW)!;
    expect(w.end).toBe(NOW + 355 * DAY);
    expect(w.start).toBe(weekStart(NOW - 10 * DAY));
    expect(planWindow({ premium: true, plan: 'admin' }, s, NOW)).not.toBeNull();
  });
  it('bulanan yang disusul paket tahunan tetap mendapat rencana, mulai dari akun dibuat', () => {
    const w = planWindow({ premium: true, plan: 'premium_monthly', expiresAt: NOW + 380 * DAY }, s, NOW)!;
    expect(w).not.toBeNull();
    expect(w.start).toBe(weekStart(s.createdAt));
  });
  it('awal rencana tidak bergeser dari minggu ke minggu', () => {
    const ent = yearly(NOW);
    const a = planWindow(ent, s, NOW)!;
    const b = planWindow(ent, s, NOW + 9 * WEEK)!;
    expect(b.start).toBe(a.start);
    expect(weekPlan(ix, s, b, NOW + 9 * WEEK).week).toBe(10);
  });
});

describe('jatah mingguan', () => {
  it('pelajar baru: sekitar dua langkah per minggu, dimulai dari langkah pertama jalurnya', () => {
    const s = createState('u', NOW - DAY);
    const plan = weekPlan(ix, s, planWindow(yearly(NOW - DAY), s, NOW)!, NOW);
    expect(plan.week).toBe(1);
    expect(plan.totalWeeks).toBeGreaterThanOrEqual(52);
    expect(plan.targets.length).toBe(Math.ceil(plan.total / plan.totalWeeks));
    expect(plan.targets[0].m.key).toBe(planMilestones(ix, 'A1')[0].key);
    expect(plan.pace).toBe(0);
    expect(plan.minutes).toBeGreaterThan(0);
  });

  it('jatah minggu ini tetap sejak Senin: menuntaskan target tidak menggeser daftarnya', () => {
    const s = createState('u', NOW - DAY);
    const win = planWindow(yearly(NOW - DAY), s, NOW)!;
    const before = weekPlan(ix, s, win, NOW);
    finish(s, before.targets[0].m, NOW);
    const after = weekPlan(ix, s, win, NOW + 3600_000);
    expect(after.targets.map((t) => t.m.key)).toEqual(before.targets.map((t) => t.m.key));
    expect(after.targets[0].doneAt).toBe(NOW);
    expect(after.targets[1].doneAt).toBeUndefined();
  });

  it('mengerjakan lebih dari jatah dicatat sebagai bonus, dan minggu berikutnya lebih ringan', () => {
    const s = createState('u', NOW - DAY);
    const win = planWindow(yearly(NOW - DAY), s, NOW)!;
    const all = planMilestones(ix, 'A1');
    for (const m of all.slice(0, 6)) finish(s, m, NOW);
    const now = weekPlan(ix, s, win, NOW);
    expect(now.bonus.length).toBe(6 - now.targets.length);
    const next = weekPlan(ix, s, win, NOW + WEEK);
    expect(next.targets[0].m.key).toBe(all[6].key);
    expect(next.pace).toBeGreaterThan(0);
  });

  it('yang tertinggal mendapat jatah sedikit lebih banyak, bukan tumpukan', () => {
    const s = createState('u', NOW - 20 * WEEK);
    const win = planWindow(yearly(NOW - 20 * WEEK), s, NOW)!;
    const plan = weekPlan(ix, s, win, NOW);
    expect(plan.week).toBe(21);
    expect(plan.pace).toBeLessThan(0);
    expect(plan.targets.length).toBe(Math.ceil(plan.total / (plan.totalWeeks - 20)));
    // A slightly fuller week, never a pile (the C2 path is longer since Rilis 5).
    expect(plan.targets.length).toBeLessThanOrEqual(5);
  });

  it('proyeksi minggu depan membagi sisa langkah sampai paket berakhir', () => {
    const s = createState('u', NOW - DAY);
    const plan = weekPlan(ix, s, planWindow(yearly(NOW - DAY), s, NOW)!, NOW);
    const projected = plan.upcoming.flatMap((w) => w.items);
    expect(projected.length + plan.targets.length).toBe(plan.total);
    expect(plan.upcoming.at(-1)!.week).toBeLessThanOrEqual(plan.totalWeeks);
    expect(new Set(projected.map((m) => m.key)).size).toBe(projected.length);
  });

  it('jalur yang sudah tuntas semuanya ditandai selesai', () => {
    const s = createState('u', NOW - DAY);
    for (const m of planMilestones(ix, 'A1')) finish(s, m, NOW - 2 * WEEK);
    const plan = weekPlan(ix, s, planWindow(yearly(NOW - DAY), s, NOW)!, NOW);
    expect(plan.finished).toBe(true);
    expect(plan.targets).toEqual([]);
  });

  it('kebiasaan: hari belajar dihitung per hari kalender dalam minggu ini', () => {
    const s = createState('u', NOW - DAY);
    const ws = weekStart(NOW);
    for (const d of [0, 1, 2]) s.daily[dayKey(ws + d * DAY + 9 * 3600_000)] = { xp: 10, exercises: 5, correct: 4, ms: 60000, lessons: 0, reviews: 0, drills: 0, perfect: 0, conversations: 0, homework: 0 };
    s.daily[dayKey(ws - DAY)] = { xp: 10, exercises: 5, correct: 4, ms: 60000, lessons: 0, reviews: 0, drills: 0, perfect: 0, conversations: 0, homework: 0 };
    const days = weekPlan(ix, s, planWindow(yearly(NOW - DAY), s, NOW)!, NOW).habits.find((h) => h.id === 'days')!;
    expect(days.value).toBe(3);
    expect(days.done).toBe(false);
  });
});

describe('cap waktu tuntas', () => {
  it('menyimak dan percakapan mencatat waktu tuntas pertama, bukan yang terakhir', () => {
    const s = createState('u', NOW);
    completeListening(s, 'listen-b2-news', NOW);
    completeListening(s, 'listen-b2-news', NOW + WEEK);
    completeConversation(s, 'press', 80, NOW);
    completeConversation(s, 'press', 100, NOW + WEEK);
    const [listenM] = planMilestones(ix, 'B2').filter((m) => m.ref === 'listen-b2-news');
    const [talkM] = planMilestones(ix, 'B2').filter((m) => m.ref === 'press');
    expect(completedAt(s, listenM)).toBe(NOW);
    expect(completedAt(s, talkM)).toBe(NOW);
  });
  it('percakapan lama tanpa cap memakai waktu main terakhir', () => {
    const s = createState('u', NOW);
    s.conversations.press = { best: 90, plays: 2, lastAt: NOW - DAY };
    const [talkM] = planMilestones(ix, 'C2').filter((m) => m.ref === 'press');
    expect(completedAt(s, talkM)).toBe(NOW - DAY);
  });
});
