'use client';
// Weekly study plan (tahap 4): the dashboard card, and the pieces the full
// plan page reuses. The plan itself is computed by src/lib/engine/plan.ts.
import Link from 'next/link';
import { useEffect } from 'react';
import { ArrowRight, Check, Circle, Lock } from 'lucide-react';
import { useApp } from '@/lib/client/hooks';
import { act, getLearner } from '@/lib/client/store';
import { dateId } from '@/lib/format';
import { learnerPlan, needsPlanStart, openingAt, planWindow, timeLeft, weekStart, type Habit, type MilestoneKind, type PlanTarget, type WeekPlan } from '@/lib/engine/plan';
import { Badge, Card, LinkButton, Ring, cx } from '@/components/ui';

export const KIND_LABEL: Record<MilestoneKind, string> = { lesson: 'Pelajaran', 'unit-exam': 'Ujian unit', 'level-exam': 'Ujian level', listening: 'Menyimak', conversation: 'Percakapan', story: 'Cerita' };

/** The learner's plan this week: Premium gets the whole path, Free (and guests) only the free material. */
export function useWeekPlan(): { plan: WeekPlan; end: number } {
  const { ix, learner, ent, now } = useApp();
  const fresh = needsPlanStart(ent, learner, now);
  // Free and monthly plans count their 52 weeks from the Monday the plan first opened; saved once, synced with progress.
  useEffect(() => {
    if (fresh && getLearner()?.planStart === undefined) act((d, t) => { d.planStart = weekStart(t); });
  }, [fresh]);
  return { plan: learnerPlan(ix, learner, ent, now), end: planWindow(ent, learner, now).end };
}

export { openingAt };

/** Free plan finished: the free material is done; Premium continues the plan to C2. */
export function FreeDoneNotice() {
  return (
    <div className="space-y-2">
      <p className="text-sm"><span className="font-bold">Semua materi gratis di rencanamu sudah tuntas.</span> Dengan Premium, rencana ini berlanjut dengan jatah yang sama sampai C2.</p>
      <LinkButton href="/app/subscription" size="sm" variant="accent">Lihat Premium</LinkButton>
    </div>
  );
}

/** Shown right above this week's list once the share is done: when the next steps open. */
export function PlanLockNotice({ plan, now }: { plan: WeekPlan; now: number }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border-2 border-accent bg-accent/15 p-3" role="status">
      <Lock size={20} className="mt-0.5 shrink-0 text-accent-strong" aria-hidden />
      <p className="min-w-0 text-sm">
        <span className="block font-extrabold">Target minggu ini selesai. Langkah berikutnya terkunci.</span>
        Terbuka dalam <span className="font-extrabold">{timeLeft(plan.weekEnd, now)}</span> lagi ({openingAt(plan.weekEnd)}). Sambil menunggu, kerjakan ulangan terjadwal agar materinya tidak terlupa.
      </p>
    </div>
  );
}

export const weekRange = (start: number) => `${dateId(start, { day: 'numeric', month: 'short' })} – ${dateId(start + 6 * 24 * 3600 * 1000, { day: 'numeric', month: 'short' })}`;

export function PaceBadge({ plan }: { plan: WeekPlan }) {
  if (plan.finished) return <Badge tone="ok">Jalur tuntas</Badge>;
  return plan.pace >= 0 ? <Badge tone="ok">{plan.pace > 0 ? `Lebih cepat ${plan.pace} langkah` : 'Sesuai jadwal'}</Badge> : <Badge tone="accent">Tertinggal {-plan.pace} langkah</Badge>;
}

export function TargetList({ targets, limit }: { targets: PlanTarget[]; limit?: number }) {
  const next = targets.find((t) => t.doneAt === undefined);
  const shown = limit ? targets.slice(0, limit) : targets;
  return (
    <ul className="divide-y divide-line" aria-label="Target minggu ini">
      {shown.map(({ m, doneAt }) => (
        <li key={m.key} className="flex items-center gap-3 py-2.5">
          {doneAt !== undefined ? <Check size={20} className="shrink-0 text-ok" aria-label="Selesai" /> : <Circle size={20} className="shrink-0 text-line" aria-label="Belum" />}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-brand">{KIND_LABEL[m.kind]} · {m.level}</p>
            <p className={cx('font-bold', doneAt !== undefined && 'text-muted line-through')}>{m.title}</p>
          </div>
          {doneAt === undefined && <LinkButton href={m.href} size="sm" variant={m === next?.m ? 'primary' : 'secondary'}>Mulai</LinkButton>}
        </li>
      ))}
    </ul>
  );
}

export function HabitList({ habits }: { habits: Habit[] }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Kebiasaan minggu ini">
      {habits.map((h) => (
        <li key={h.id} className={cx('flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold', h.done ? 'bg-ok-soft text-ok' : 'bg-surface-2 text-muted')}>
          {h.done ? <Check size={14} aria-hidden /> : <Circle size={14} aria-hidden />}
          {h.label}{h.id === 'days' && ` (${Math.min(h.value, h.goal)}/${h.goal})`}
        </li>
      ))}
    </ul>
  );
}

/** Dashboard card: this week's share (Free plans list only the free material). */
export function WeekPlanCard() {
  const { now } = useApp();
  const { plan } = useWeekPlan();
  const done = plan.targets.filter((t) => t.doneAt !== undefined).length;
  const all = plan.targets.length;
  return (
    <section aria-labelledby="plan-title">
      <div className="mb-2 flex items-end justify-between gap-2">
        <h2 id="plan-title" className="text-lg font-extrabold">Rencana minggu ini</h2>
        <Link href="/app/plan" className="flex min-h-11 items-center gap-1 text-sm font-bold text-brand">Rencana lengkap<ArrowRight size={16} aria-hidden /></Link>
      </div>
      <Card>
        <div className="flex items-center gap-4">
          <Ring value={all ? (done / all) * 100 : 100} tone={all && done === all ? 'ok' : 'brand'} size={72} stroke={8}>
            <span className="text-sm font-extrabold">{done}/{all}</span>
          </Ring>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold">Minggu {plan.week} dari {plan.totalWeeks}</p>
            <p className="text-sm text-muted">{weekRange(plan.weekStart)}{plan.minutes ? ` · sekitar ${plan.minutes} menit lagi` : ''}</p>
            <div className="mt-1"><PaceBadge plan={plan} /></div>
          </div>
        </div>
        {plan.finished && plan.free ? (
          <div className="mt-3"><FreeDoneNotice /></div>
        ) : plan.finished ? (
          <p className="mt-3 text-sm">Seluruh jalurmu sampai C2 sudah tuntas. Minggu ini fokus pada ulangan terjadwal dan latihan perbaikan agar tetap terjaga.</p>
        ) : plan.locked ? (
          <div className="mt-3"><PlanLockNotice plan={plan} now={now} /></div>
        ) : null}
        {all > 0 && <div className="mt-2"><TargetList targets={plan.targets} limit={4} /></div>}
        <div className="mt-3"><HabitList habits={plan.habits} /></div>
      </Card>
    </section>
  );
}
