'use client';
// Weekly study plan (tahap 4): the dashboard card, and the pieces the full
// plan page reuses. The plan itself is computed by src/lib/engine/plan.ts.
import Link from 'next/link';
import { ArrowRight, CalendarCheck, Check, Circle } from 'lucide-react';
import { useApp } from '@/lib/client/hooks';
import { dateId } from '@/lib/format';
import { planWindow, weekPlan, type Habit, type MilestoneKind, type PlanTarget, type WeekPlan } from '@/lib/engine/plan';
import { Badge, Card, LinkButton, Ring, cx } from '@/components/ui';

export const KIND_LABEL: Record<MilestoneKind, string> = { lesson: 'Pelajaran', 'unit-exam': 'Ujian unit', 'level-exam': 'Ujian level', listening: 'Menyimak', conversation: 'Percakapan', story: 'Cerita' };

/** The learner's plan this week, or null when they are not on a yearly plan. */
export function useWeekPlan(): { plan: WeekPlan | null; end?: number } {
  const { ix, learner, ent, now } = useApp();
  const win = planWindow(ent, learner, now);
  return win ? { plan: weekPlan(ix, learner, win, now), end: win.end } : { plan: null };
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

/** Dashboard card: this week's share for yearly subscribers, a short pitch for everyone else. */
export function WeekPlanCard() {
  const { premium } = useApp();
  const { plan } = useWeekPlan();
  if (!plan) {
    return (
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-strong"><CalendarCheck size={20} aria-hidden /></span>
        <div className="min-w-0 flex-1">
          <p className="font-extrabold">Rencana belajar 52 minggu</p>
          <p className="text-sm text-muted">Paket Premium Tahunan membagi jalurmu sampai C2 menjadi target mingguan, lalu menyesuaikannya setiap Senin.</p>
        </div>
        <LinkButton href="/app/plan" size="sm" variant={premium ? 'secondary' : 'accent'}>Lihat caranya</LinkButton>
      </Card>
    );
  }
  const done = plan.targets.filter((t) => t.doneAt !== undefined).length;
  const all = plan.targets.length;
  return (
    <section aria-labelledby="plan-title">
      <div className="mb-2 flex items-end justify-between gap-2">
        <h2 id="plan-title" className="text-lg font-extrabold">Rencana minggu ini</h2>
        <Link href="/app/plan" className="flex items-center gap-1 text-sm font-bold text-brand">Rencana lengkap<ArrowRight size={16} aria-hidden /></Link>
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
        {plan.finished ? (
          <p className="mt-3 text-sm">Seluruh jalurmu sampai C2 sudah tuntas. Minggu ini fokus pada ulangan terjadwal dan latihan perbaikan agar tetap terjaga.</p>
        ) : all && done === all ? (
          <div className="mt-3 space-y-2">
            <p className="text-sm"><span className="font-bold">Target minggu ini tercapai.</span> Mau lanjut? Setiap langkah tambahan meringankan minggu-minggu berikutnya.</p>
            {plan.upcoming[0] && <LinkButton href={plan.upcoming[0].items[0].href} size="sm" variant="secondary">Lanjut: {plan.upcoming[0].items[0].title}</LinkButton>}
          </div>
        ) : null}
        {all > 0 && <div className="mt-2"><TargetList targets={plan.targets} limit={4} /></div>}
        <div className="mt-3"><HabitList habits={plan.habits} /></div>
      </Card>
    </section>
  );
}
