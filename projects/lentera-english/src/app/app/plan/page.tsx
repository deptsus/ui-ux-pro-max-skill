'use client';
import { CalendarCheck, Lock } from 'lucide-react';
import { useApp } from '@/lib/client/hooks';
import { dateId } from '@/lib/format';
import { timeLeft } from '@/lib/engine/plan';
import { FreeDoneNotice, HabitList, KIND_LABEL, PaceBadge, PlanLockNotice, TargetList, useWeekPlan, weekRange } from '@/components/WeekPlan';
import { Card, Notice, PageHeader, Progress } from '@/components/ui';

const SHOW_WEEKS = 6;

export default function PlanPage() {
  const { now } = useApp();
  const { plan, end } = useWeekPlan();

  const weeks = plan.upcoming;
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader title="Rencana Belajar Mingguan" subtitle={plan.free ? `Materi gratis mulai level ${plan.startLevel}, dibagi per minggu. Premium melanjutkannya sampai C2.` : `Dari level ${plan.startLevel} sampai C2, dibagi rata sampai ${dateId(end)}.`} />

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Ringkasan rencana">
        <Card className="p-4"><p className="text-sm font-bold text-muted">Minggu</p><p className="mt-1 text-2xl font-extrabold">{plan.week} <span className="text-base text-muted">/ {plan.totalWeeks}</span></p></Card>
        <Card className="p-4"><p className="text-sm font-bold text-muted">Langkah tuntas</p><p className="mt-1 text-2xl font-extrabold">{plan.done} <span className="text-base text-muted">/ {plan.total}</span></p><Progress value={plan.done} max={plan.total} tone="ok" className="mt-1.5 h-2" label="Langkah tuntas" /></Card>
        <Card className="col-span-2 p-4 sm:col-span-1"><p className="text-sm font-bold text-muted">Kecepatan</p><div className="mt-2"><PaceBadge plan={plan} /></div></Card>
      </section>

      <section aria-labelledby="this-week">
        <h2 id="this-week" className="mb-2 text-lg font-extrabold">Minggu ini · {weekRange(plan.weekStart)}</h2>
        <Card className="space-y-3">
          {plan.finished && plan.free ? (
            <FreeDoneNotice />
          ) : plan.finished ? (
            <p>Seluruh jalurmu sampai C2 sudah tuntas. Pertahankan dengan ulangan terjadwal, latihan perbaikan, dan Tantangan Kilat.</p>
          ) : (
            <>
              {plan.locked && <PlanLockNotice plan={plan} now={now} />}
              <p className="text-sm text-muted">{plan.targets.length} langkah{plan.minutes ? `, sekitar ${plan.minutes} menit lagi` : ', semuanya sudah selesai'}.</p>
              <TargetList targets={plan.targets} />
            </>
          )}
          {plan.bonus.length > 0 && (
            <div>
              <p className="text-sm font-bold text-ok">Bonus minggu ini: {plan.bonus.length} langkah di luar jatah</p>
              <p className="text-sm text-muted">{plan.bonus.map((b) => b.m.title).join(' · ')}</p>
            </div>
          )}
          <div>
            <p className="mb-1.5 text-sm font-bold">Kebiasaan</p>
            <HabitList habits={plan.habits} />
          </div>
        </Card>
      </section>

      {weeks.length > 0 && (
        <section aria-labelledby="next-weeks">
          <h2 id="next-weeks" className="mb-2 text-lg font-extrabold">Minggu-minggu berikutnya</h2>
          <Card className="p-0">
            <WeekRows weeks={weeks.slice(0, SHOW_WEEKS)} next={plan.week + 1} opensIn={timeLeft(plan.weekEnd, now)} />
            {weeks.length > SHOW_WEEKS && (
              <details className="border-t border-line">
                <summary className="cursor-pointer px-5 py-3 text-sm font-bold text-brand">Tampilkan {weeks.length - SHOW_WEEKS} minggu lainnya</summary>
                <WeekRows weeks={weeks.slice(SHOW_WEEKS)} />
              </details>
            )}
          </Card>
        </section>
      )}

      <Notice tone="muted" title="Cara kerja rencana ini">
        <ul className="mt-1 list-disc space-y-1 pl-5">
          {plan.free
            ? <li>Akun Free: isinya {plan.total} langkah dari materi gratis, dengan jatah per minggu yang sama seperti Premium. Dengan Premium, rencana yang sama berlanjut sampai C2.</li>
            : <li>Isinya seluruh jalurmu dari level {plan.startLevel} sampai C2: {plan.total} langkah berupa pelajaran, ujian unit, ujian level, latihan menyimak, dan simulasi percakapan, dalam urutan kurikulum.</li>}
          <li>Jatah tiap minggu = langkah yang masih tersisa dibagi minggu yang tersisa di rencanamu ({plan.totalWeeks} minggu), dihitung ulang setiap Senin. Tertinggal? Jatahnya naik sedikit.</li>
          <li>Jalur Belajar dan Pusat Ujian mengikuti rencana ini: pelajaran dan ujian minggu berikutnya terbuka Senin pukul 00.00. Setelah jatah minggu ini selesai, hitungan mundurnya tampil di atas daftar minggu ini dan di Beranda. Pelajaran yang sudah dimulai tetap bisa dilanjutkan.</li>
          <li>Ulangan terjadwal, PR, dan tes ulang penguasaan tidak dihitung sebagai langkah, tetapi tetap muncul di Beranda dan penting agar materi tidak terlupa.</li>
          <li>Rencana ini dihitung dari progresmu dengan aturan tetap, tanpa AI.</li>
        </ul>
      </Notice>
    </div>
  );
}

function WeekRows({ weeks, next, opensIn }: { weeks: { week: number; weekStart: number; items: { key: string; kind: keyof typeof KIND_LABEL; title: string }[] }[]; next?: number; opensIn?: string }) {
  return (
    <ul className="divide-y divide-line">
      {weeks.map((w) => (
        <li key={w.week} className="flex gap-3 px-5 py-3">
          {w.week === next ? <Lock size={18} className="mt-0.5 shrink-0 text-muted" aria-hidden /> : <CalendarCheck size={18} className="mt-0.5 shrink-0 text-muted" aria-hidden />}
          <div className="min-w-0">
            <p className="text-sm font-extrabold">Minggu {w.week} <span className="font-semibold text-muted">· {weekRange(w.weekStart)}</span></p>
            {w.week === next && opensIn && <p className="text-xs font-bold text-muted">Terkunci · terbuka dalam {opensIn}</p>}
            <p className="text-sm text-muted">{w.items.map((m) => `${KIND_LABEL[m.kind]}: ${m.title}`).join(' · ')}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
