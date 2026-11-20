'use client';
import Link from 'next/link';
import { AlarmClock, ArrowRight, AudioLines, CalendarCheck, CheckCircle2, Crown, Flame, Heart, Lock, Repeat, Target, Trophy, Users, Wrench, BookOpen, GraduationCap, ClipboardList, Compass, Zap } from 'lucide-react';
import { GAME } from '@/lib/engine/config';
import { activeMissions, currentHearts, liveStreak, nextMilestone, playerLevel } from '@/lib/engine/gamification';
import { dayKey } from '@/lib/engine/mastery';
import { recommend, type Recommendation } from '@/lib/engine/recommend';
import { timeLeft } from '@/lib/engine/plan';
import { dueItems } from '@/lib/engine/srs';
import { claimMission } from '@/lib/engine/state';
import { useApp } from '@/lib/client/hooks';
import { useServerInfo, useSession } from '@/lib/client/session';
import { act } from '@/lib/client/store';
import { Mascot } from '@/components/Mascot';
import { CastMember } from '@/components/cast/Kid';
import { WeekPlanCard, openingAt, useWeekPlan } from '@/components/WeekPlan';
import { ClassTasksCard } from '@/components/ClassTasksCard';
import { Badge, Button, Card, LinkButton, ListGroup, ListRow, Notice, Progress, SectionHeader, StatRow } from '@/components/ui';
import { trackInfo } from '@/lib/content/tracks';

const REC_ICON: Record<Recommendation['kind'], typeof Wrench> = { placement: Compass, remediate: Wrench, revise: BookOpen, practice: Target, retest: CheckCircle2, review: Repeat, homework: ClipboardList, exam: GraduationCap, lesson: ArrowRight, plan: CalendarCheck };
const WEAK = new Set<Recommendation['kind']>(['remediate', 'revise', 'practice', 'retest']);
const REC_LABEL: Record<Recommendation['kind'], string> = { placement: 'Mulai di sini', remediate: 'Perbaikan', revise: 'Ulangi materi', practice: 'Latihan tambahan', retest: 'Konfirmasi penguasaan', review: 'Ulangan terjadwal', homework: 'PR', exam: 'Ujian', lesson: 'Pelajaran', plan: 'Rencana minggu ini' };

/** First open (Rilis 6): what the app is and two equal ways in; nothing is forced and it disappears after the first answer. */
function Welcome({ guest, firstLesson }: { guest: boolean; firstLesson?: string }) {
  const steps = [
    ['Tes penempatan', 'Paling banyak 20 soal; berhenti begitu levelmu ketemu.'],
    ['Pelajaran singkat', 'Penjelasan dalam bahasa Indonesia, contoh, lalu latihan bertahap.'],
    ['Ulangan terjadwal', 'Materi yang mulai lupa muncul lagi tepat waktu.'],
  ];
  return (
    <section aria-labelledby="welcome-title">
      <Card className="space-y-4">
        <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:gap-4">
          <div className="flex shrink-0 items-end" aria-hidden>
            <Mascot mood="cheer" size={64} decorative />
            <CastMember who="sari" mood="happy" size={44} decorative className="-ml-2" />
            <CastMember who="bima" mood="wink" size={44} decorative className="-ml-2" />
          </div>
          <div className="min-w-0">
            <h1 id="welcome-title" className="text-2xl font-extrabold">Selamat datang di Lentera English!</h1>
            <p className="mt-1 text-muted">Belajar bahasa Inggris dari nol sampai C2, dijelaskan dalam bahasa Indonesia.</p>
          </div>
        </div>
        <ol className="space-y-3">
          {steps.map(([title, text], i) => (
            <li key={title} className="flex gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-extrabold text-brand-ink" aria-hidden>{i + 1}</span>
              <span className="min-w-0"><span className="block font-bold">{title}</span><span className="block text-sm text-muted">{text}</span></span>
            </li>
          ))}
        </ol>
        <div className="flex flex-col gap-2 sm:flex-row">
          <LinkButton href="/app/placement" size="lg" full>Ikuti tes penempatan<ArrowRight size={20} aria-hidden /></LinkButton>
          {firstLesson && <LinkButton href={`/app/lesson?id=${firstLesson}`} size="lg" variant="secondary" full>Lewati, mulai dari A1</LinkButton>}
        </div>
        {guest && <p className="text-sm text-muted">Sudah punya akun? <Link href="/masuk?next=/app" className="inline-flex min-h-11 min-w-11 items-center justify-center px-1 font-bold text-brand underline">Masuk</Link></p>}
      </Card>
    </section>
  );
}

export default function Dashboard() {
  const { ix, learner, ent, now, premium } = useApp();
  // Rilis 16: the learner's school track, when a school level is chosen.
  const school = trackInfo(learner.profile.schoolLevel === 'umum' ? undefined : learner.profile.schoolLevel);
  const session = useSession();
  const info = useServerInfo();
  const today = learner.daily[dayKey(now)];
  const xpToday = today?.xp ?? 0;
  const goal = learner.profile.dailyGoalXp;
  // Weekly plan (16 Nov 2026): steps whose turn is in a later week are not suggested; a cooldown card shows when all is done.
  const { plan } = useWeekPlan();
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
  // A learner who has not answered anything yet sees the welcome instead of empty counters.
  const isNew = !learner.profile.placementDone && learner.attempts.length === 0 && learner.xp === 0 && !Object.keys(learner.lessons).length;

  // One improvement area: the first recommendation that comes from the learner's own weak spots.
  const improve = rest.find((r) => WEAK.has(r.kind));
  const others = rest.filter((r) => r !== improve).slice(0, 3);
  const goalMet = xpToday >= goal;

  return (
    <div className="space-y-8">
      {ent.premium && ent.expiresAt && ent.plan === 'trial' && ent.expiresAt > now && (
        <ListGroup>
          <ListRow href="/app/subscription" icon={<Crown size={20} />} iconTone="accent"
            title={`Premium uji coba · sisa ${Math.max(1, Math.ceil((ent.expiresAt - now) / 86_400_000))} hari`}
            subtitle={`Berlaku sampai ${new Date(ent.expiresAt).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}. Semua materi, nyawa tak terbatas, dan ujian level terbuka. Setelah itu akun kembali ke Free; progresmu tetap tersimpan.`} />
        </ListGroup>
      )}
      {isNew ? <Welcome guest={!session} firstLesson={ix.orderedLessons[0]?.id} /> : (
        <section aria-labelledby="hello" className="space-y-4">
          <div className="flex items-center gap-3">
            <Mascot mood={goalMet ? 'cheer' : streak === 0 && learner.streak.longest > 0 && xpToday === 0 ? 'sleep' : 'happy'} size={56} className="shrink-0" />
            <div className="min-w-0">
              <h1 id="hello" className="text-2xl font-extrabold">{greeting}, {learner.profile.name}!</h1>
              <p className="text-sm text-muted">{school ? `${school.title} · ` : ''}Tingkat {level.level} · {learner.xp.toLocaleString('id-ID')} XP</p>
            </div>
          </div>
          <Card className="py-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-bold">Target hari ini</h2>
              <p className="text-sm font-extrabold tabular-nums">{xpToday} / {goal} XP</p>
            </div>
            <Progress value={xpToday} max={goal} tone={goalMet ? 'ok' : 'accent'} label="Target harian" className="mt-2.5" />
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">{goalMet ? <><CheckCircle2 size={16} className="shrink-0 text-ok" aria-hidden />Target harianmu tercapai. Kerja bagus!</> : `${goal - xpToday} XP lagi untuk mencapai target harian.`}</p>
          </Card>
        </section>
      )}

      {!session && !isNew && (
        <Notice title="Kamu belajar sebagai tamu.">
          <p>Progres tersimpan di perangkat ini saja.{info.trial && ' Buat akun gratis dan langsung dapat Premium uji coba 3 hari.'}</p>
          <LinkButton href="/daftar" size="sm" className="mt-2">Buat akun gratis</LinkButton>
        </Notice>
      )}

      {top && !(isNew && top.kind === 'placement') && (
        <section aria-labelledby="rec-title">
          <SectionHeader id="rec-title" title="Langkah berikutnya untukmu" />
          <Card className="border-brand/40 shadow-e1">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand text-on-brand">{(() => { const I = REC_ICON[top.kind]; return <I size={22} aria-hidden />; })()}</span>
              <div className="min-w-0 flex-1">
                <Badge>{REC_LABEL[top.kind]}</Badge>
                <h3 className="mt-1.5 text-lg font-extrabold">{top.title}</h3>
                <p className="mt-1 text-sm text-muted"><span className="font-bold text-ink">Mengapa ini: </span>{top.reason}</p>
              </div>
            </div>
            <LinkButton href={top.href} full size="lg" className="mt-4">{top.cta}<ArrowRight size={20} aria-hidden /></LinkButton>
          </Card>
        </section>
      )}

      {!top && plan?.locked && (
        <section aria-labelledby="rec-title">
          <SectionHeader id="rec-title" title="Langkah berikutnya untukmu" />
          <Card className="border-accent/60">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-on-accent"><Lock size={22} aria-hidden /></span>
              <div className="min-w-0 flex-1">
                <Badge tone="accent">Jeda sampai minggu depan</Badge>
                <h3 className="mt-1.5 text-lg font-extrabold">Semua tugas minggu ini selesai</h3>
                <p className="mt-1 text-sm text-muted">Langkah berikutnya dari rencana mingguanmu terbuka dalam <span className="font-extrabold text-ink">{timeLeft(plan.weekEnd, now)}</span> lagi ({openingAt(plan.weekEnd)}). Ulangan terjadwal yang jatuh tempo tetap muncul di sini.</p>
              </div>
            </div>
            <LinkButton href="/app/plan" full size="lg" variant="secondary" className="mt-4">Lihat rencana mingguan<ArrowRight size={20} aria-hidden /></LinkButton>
          </Card>
        </section>
      )}

      {improve && (
        <section aria-labelledby="improve-title">
          <SectionHeader id="improve-title" title="Perlu ditingkatkan" />
          <ListGroup>
            <ListRow href={improve.href} icon={(() => { const I = REC_ICON[improve.kind]; return <I size={20} />; })()} iconTone="warn" title={improve.title} subtitle={improve.reason} />
          </ListGroup>
        </section>
      )}

      {ent.premium && ent.expiresAt && (ent.plan === 'premium_monthly' || ent.plan === 'premium_yearly') && ent.expiresAt - now < 3 * 86_400_000 && ent.expiresAt > now && (
        <ListGroup>
          <ListRow href="/app/subscription" icon={<Crown size={20} />} iconTone="accent" title={`Premium-mu berakhir ${new Date(ent.expiresAt).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}`} subtitle="Perpanjang agar semua materi, nyawa tak terbatas, dan ujian level tetap terbuka. Tidak ada tagihan otomatis." />
        </ListGroup>
      )}
      <ClassTasksCard plan={ent.plan} />

      <section aria-label="Ringkasan">
        <StatRow items={[
          { label: 'Beruntun', icon: <Flame size={14} className="text-accent-strong" aria-hidden />, value: `${streak} hari`, hint: `Terpanjang ${learner.streak.longest} · pelindung ${learner.streak.freezes}` },
          { label: `Tingkat ${level.level}`, icon: <Zap size={14} className="text-brand" aria-hidden />, value: `${learner.xp} XP`, hint: `${level.need - level.into} XP lagi ke tingkat ${level.level + 1}` },
          { label: 'Ulangan', icon: <Repeat size={14} className="text-brand" aria-hidden />, value: due, hint: 'menunggu hari ini' },
          { label: 'Nyawa', icon: <Heart size={14} className="text-bad" aria-hidden />, value: premium ? 'Tak terbatas' : `${hearts.count} / ${GAME.hearts.max}`, hint: premium ? 'Manfaat Premium' : hearts.nextAt ? `+1 pukul ${new Date(hearts.nextAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` : 'Penuh' },
        ]} />
      </section>

      <WeekPlanCard />

      {others.length > 0 && (
        <section aria-labelledby="others-title">
          <SectionHeader id="others-title" title="Pilihan lain" />
          <ListGroup>
            {others.map((r) => {
              const I = REC_ICON[r.kind];
              return <ListRow key={r.id} href={r.href} icon={<I size={20} />} title={r.title} subtitle={<><span className="font-bold">{REC_LABEL[r.kind]}</span> · {r.reason}</>} />;
            })}
          </ListGroup>
        </section>
      )}

      <section aria-labelledby="mission-title">
        <SectionHeader id="mission-title" title="Misi" />
        <ListGroup>
          {missions.map((m) => (
            <li key={m.key} className="flex min-h-14 items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-bold">{m.mission.title} <Badge tone={m.mission.period === 'daily' ? 'brand' : 'accent'}>{m.mission.period === 'daily' ? 'Harian' : 'Mingguan'}</Badge></p>
                <div className="mt-2 flex items-center gap-2"><Progress value={m.progress} max={m.mission.target} tone={m.done ? 'ok' : 'brand'} label={m.mission.title} /><span className="shrink-0 text-xs font-bold tabular-nums text-muted">{m.progress}/{m.mission.target}</span></div>
              </div>
              {m.claimed ? <Badge tone="ok"><CheckCircle2 size={14} aria-hidden />Diklaim</Badge> : m.done
                ? <Button size="sm" variant="accent" onClick={() => act((d, at) => claimMission(d, m.key, m.mission.reward, at))}>Klaim +{m.mission.reward} XP</Button>
                : <span className="shrink-0 text-sm font-bold text-muted">+{m.mission.reward} XP</span>}
            </li>
          ))}
          {milestone && (
            <li className="flex min-h-14 items-center gap-3 px-4 py-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-strong" aria-hidden><Trophy size={20} /></span>
              <div className="min-w-0 flex-1">
                <p className="font-bold">Tonggak berikutnya: {milestone.target.toLocaleString('id-ID')} XP</p>
                <Progress value={learner.xp - milestone.previous} max={milestone.target - milestone.previous} tone="accent" className="mt-2" label="Tonggak XP" />
              </div>
            </li>
          )}
        </ListGroup>
      </section>

      <section aria-labelledby="explore-title" className="space-y-3">
        <SectionHeader id="explore-title" title="Jelajahi" className="mb-0" />
        <ListGroup>
          <ListRow href={school ? `/app/jalur#${school.id}` : '/app/jalur'} icon={<Compass size={20} />}
            title={school ? school.title : 'Jalur Sekolah & Khusus'}
            subtitle={school ? `${school.school!.grades} · lanjutkan pelajaran sesuai kurikulum sekolahmu.` : 'Jalur SD, SMP, SMA sesuai kurikulum sekolah (unit pertama gratis), TOEFL/IELTS, dan bahasa Inggris untuk kerja.'} />
        </ListGroup>
        <nav aria-label="Kebiasaan belajar">
          <ListGroup>
            {([
              ['/app/leaderboard', Users, 'Liga & Teman', 'Naik divisi dan tantang temanmu.'],
              ['/app/shadowing', AudioLines, 'Shadowing', 'Tirukan 5 kalimat, bandingkan suaramu.'],
              ['/app/settings#pengingat', AlarmClock, 'Pengingat harian', 'Pilih jam agar beruntunmu terjaga.'],
            ] as const).map(([href, Icon, title, desc]) => <ListRow key={href} href={href} icon={<Icon size={20} />} title={title} subtitle={desc} />)}
          </ListGroup>
        </nav>
      </section>
    </div>
  );
}
