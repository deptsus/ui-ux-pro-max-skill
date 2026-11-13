'use client';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Flame, Heart, Repeat, Target, Wrench, BookOpen, GraduationCap, ClipboardList, Compass } from 'lucide-react';
import { GAME } from '@/lib/engine/config';
import { activeMissions, currentHearts, liveStreak, nextMilestone, playerLevel } from '@/lib/engine/gamification';
import { dayKey } from '@/lib/engine/mastery';
import { recommend, type Recommendation } from '@/lib/engine/recommend';
import { dueItems } from '@/lib/engine/srs';
import { claimMission } from '@/lib/engine/state';
import { useApp } from '@/lib/client/hooks';
import { useSession } from '@/lib/client/session';
import { act } from '@/lib/client/store';
import { Mascot } from '@/components/Mascot';
import { Badge, Button, Card, LinkButton, Progress, Ring } from '@/components/ui';

const REC_ICON: Record<Recommendation['kind'], typeof Wrench> = { placement: Compass, remediate: Wrench, revise: BookOpen, practice: Target, retest: CheckCircle2, review: Repeat, homework: ClipboardList, exam: GraduationCap, lesson: ArrowRight };
const REC_LABEL: Record<Recommendation['kind'], string> = { placement: 'Mulai di sini', remediate: 'Perbaikan', revise: 'Ulangi materi', practice: 'Latihan tambahan', retest: 'Konfirmasi penguasaan', review: 'Ulangan terjadwal', homework: 'PR', exam: 'Ujian', lesson: 'Pelajaran' };

export default function Dashboard() {
  const { ix, learner, ent, now, premium } = useApp();
  const session = useSession();
  const today = learner.daily[dayKey(now)];
  const xpToday = today?.xp ?? 0;
  const goal = learner.profile.dailyGoalXp;
  const recs = recommend(learner, ix, ent, now);
  const [top, ...rest] = recs;
  const level = playerLevel(learner.xp);
  const hearts = currentHearts(learner.hearts, now);
  const due = dueItems(learner.reviews, now).length;
  const missions = activeMissions(learner, now);
  const milestone = nextMilestone(learner.xp);
  const streak = liveStreak(learner.streak, now);
  const hour = new Date(now).getHours();
  const greeting = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 19 ? 'Selamat sore' : 'Selamat malam';

  return (
    <div className="space-y-5">
      <Card className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <Mascot mood={xpToday >= goal ? 'cheer' : 'happy'} size={92} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold tracking-tight">{greeting}, {learner.profile.name}!</h1>
          <p className="mt-1 text-muted">{xpToday >= goal ? 'Target harianmu tercapai. Kerja bagus!' : `Target hari ini: ${goal} XP. Kamu sudah mengumpulkan ${xpToday} XP.`}</p>
          <Progress value={xpToday} max={goal} tone="accent" label="Target harian" className="mt-3" />
        </div>
        <Ring value={(xpToday / goal) * 100} tone="accent" size={88} stroke={9}>
          <span className="text-sm font-extrabold leading-tight">{xpToday}<span className="block text-[10px] font-bold text-muted">/ {goal} XP</span></span>
        </Ring>
      </Card>

      {!session && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-brand-soft px-4 py-3 text-sm">
          <p><span className="font-bold">Kamu belajar sebagai tamu.</span> Progres tersimpan di perangkat ini saja.</p>
          <LinkButton href="/daftar" size="sm">Buat akun gratis</LinkButton>
        </div>
      )}

      {top && (
        <section aria-labelledby="rec-title">
          <h2 id="rec-title" className="mb-2 text-lg font-extrabold">Langkah berikutnya untukmu</h2>
          <Card className="border-2 border-brand">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand text-on-brand">{(() => { const I = REC_ICON[top.kind]; return <I size={24} aria-hidden />; })()}</span>
              <div className="min-w-0 flex-1">
                <Badge>{REC_LABEL[top.kind]}</Badge>
                <h3 className="mt-1 text-xl font-extrabold">{top.title}</h3>
                <p className="mt-1 text-sm text-muted"><span className="font-bold text-ink">Mengapa ini: </span>{top.reason}</p>
              </div>
            </div>
            <LinkButton href={top.href} full size="lg" className="mt-4">{top.cta}<ArrowRight size={20} aria-hidden /></LinkButton>
          </Card>
          {rest.length > 0 && (
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {rest.slice(0, 4).map((r) => {
                const I = REC_ICON[r.kind];
                return (
                  <li key={r.id}>
                    <Link href={r.href} className="flex h-full items-start gap-3 rounded-2xl border border-line bg-surface p-4 transition hover:border-brand">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><I size={20} aria-hidden /></span>
                      <span className="min-w-0"><span className="block text-xs font-bold text-brand">{REC_LABEL[r.kind]}</span><span className="block font-bold">{r.title}</span><span className="mt-0.5 line-clamp-2 block text-sm text-muted">{r.reason}</span></span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Ringkasan">
        <Card className="p-4"><p className="flex items-center gap-1.5 text-sm font-bold text-muted"><Flame size={16} className="text-accent" aria-hidden />Beruntun</p><p className="mt-1 text-2xl font-extrabold">{streak} hari</p><p className="text-xs text-muted">Terpanjang {learner.streak.longest} · pelindung {learner.streak.freezes}</p></Card>
        <Card className="p-4"><p className="text-sm font-bold text-muted">Tingkat {level.level}</p><p className="mt-1 text-2xl font-extrabold">{learner.xp} XP</p><Progress value={level.into} max={level.need} className="mt-1.5 h-2" label="Menuju tingkat berikutnya" /></Card>
        <Card className="p-4"><p className="flex items-center gap-1.5 text-sm font-bold text-muted"><Repeat size={16} className="text-brand" aria-hidden />Ulangan</p><p className="mt-1 text-2xl font-extrabold">{due}</p><p className="text-xs text-muted">menunggu hari ini</p></Card>
        <Card className="p-4"><p className="flex items-center gap-1.5 text-sm font-bold text-muted"><Heart size={16} className="text-bad" aria-hidden />Nyawa</p><p className="mt-1 text-2xl font-extrabold">{premium ? 'Tak terbatas' : `${hearts.count} / ${GAME.hearts.max}`}</p><p className="text-xs text-muted">{premium ? 'Manfaat Premium' : hearts.nextAt ? `+1 pukul ${new Date(hearts.nextAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` : 'Penuh'}</p></Card>
      </section>

      <section aria-labelledby="mission-title">
        <h2 id="mission-title" className="mb-2 text-lg font-extrabold">Misi</h2>
        <Card className="divide-y divide-line p-0">
          {missions.map((m) => (
            <div key={m.key} className="flex items-center gap-3 px-5 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="font-bold">{m.mission.title} <Badge tone={m.mission.period === 'daily' ? 'brand' : 'accent'}>{m.mission.period === 'daily' ? 'Harian' : 'Mingguan'}</Badge></p>
                <div className="mt-1.5 flex items-center gap-2"><Progress value={m.progress} max={m.mission.target} tone={m.done ? 'ok' : 'brand'} className="h-2" label={m.mission.title} /><span className="shrink-0 text-xs font-bold text-muted">{m.progress}/{m.mission.target}</span></div>
              </div>
              {m.claimed ? <Badge tone="ok"><CheckCircle2 size={14} aria-hidden />Diklaim</Badge> : <Button size="sm" variant="accent" disabled={!m.done} onClick={() => act((d, at) => claimMission(d, m.key, m.mission.reward, at))}>+{m.mission.reward} XP</Button>}
            </div>
          ))}
        </Card>
      </section>

      {milestone && (
        <Card className="p-4">
          <p className="text-sm font-bold text-muted">Tonggak berikutnya: {milestone.target.toLocaleString('id-ID')} XP</p>
          <Progress value={learner.xp - milestone.previous} max={milestone.target - milestone.previous} tone="accent" className="mt-2" label="Tonggak XP" />
        </Card>
      )}
    </div>
  );
}
