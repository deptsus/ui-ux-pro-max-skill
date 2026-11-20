'use client';
// Jalur Sekolah (Rilis 16: SD, SMP, SMA) and Jalur Khusus (Rilis 11: work,
// TOEFL ITP/IELTS), next to the main CEFR path. School tracks: the first unit
// is free, and a final exam with a certificate closes the track. Special
// tracks: the first lesson is free. Lessons open one after another inside a
// track, whatever the learner's level.
import { Award, Backpack, BookOpenCheck, Briefcase, Check, Crown, GraduationCap, School } from 'lucide-react';
import { SCHOOL_TRACKS, SPECIAL_TRACKS, normTrack, type TrackInfo } from '@/lib/content/tracks';
import type { TrackId } from '@/lib/content/types';
import { lessonLock, lessonsOfUnit, trackExam, trackExamStatus, unitExam, unitExamStatus } from '@/lib/engine/unlock';
import { useApp } from '@/lib/client/hooks';
import { SchoolLevelPicker, chooseSchoolLevel } from '@/components/school/SchoolLevel';
import { Badge, Card, Empty, LinkButton, PageHeader, Progress, SectionHeader, cx } from '@/components/ui';
import { PathRow, PathTabs, Trail, UnitHeading } from '@/components/learn/PathParts';

const ICON: Record<TrackId, typeof Briefcase> = { work: Briefcase, exam: GraduationCap, kids: Backpack, sd: Backpack, smp: School, sma: BookOpenCheck };

export default function TracksPage() {
  const { ix, learner } = useApp();
  // The published curriculum may predate the tracks until the owner imports and publishes it.
  if (!ix.pack.chapters.some((c) => c.track)) {
    return (
      <div>
        <PageHeader title="Jalur Sekolah & Khusus" subtitle="Jalur SD, SMP, SMA, persiapan TOEFL ITP/IELTS, dan bahasa Inggris untuk kerja." />
        <Empty title="Jalur sedang disiapkan">Materinya segera terbit. Sementara itu, lanjutkan jalur belajar CEFR-mu.</Empty>
      </div>
    );
  }
  const mine = learner.profile.schoolLevel;
  // The learner's own school track first.
  const school = [...SCHOOL_TRACKS].sort((a, b) => Number(b.id === mine) - Number(a.id === mine));
  return (
    <div>
      <PageHeader title="Jalur Sekolah & Khusus" subtitle="Belajar sesuai jenjang sekolah atau tujuan tertentu, di samping jalur CEFR utama." />
      <PathTabs />
      <section id="sekolah" aria-labelledby="h-sekolah" className="mb-10 scroll-mt-36 space-y-4">
        <div>
          <SectionHeader id="h-sekolah" title="Jalur Sekolah" className="mb-1" />
          <p className="text-sm text-muted">Mengikuti tema pelajaran bahasa Inggris di sekolah (Kurikulum Merdeka). Unit pertama tiap jenjang gratis; Premium membuka semua unit dan ujian akhir bersertifikat.</p>
        </div>
        {!mine && (
          <Card className="space-y-3">
            <p className="font-extrabold">Kamu di jenjang apa?</p>
            <SchoolLevelPicker onPick={chooseSchoolLevel} label="Pilih jenjang sekolahmu" />
          </Card>
        )}
        {school.map((t) => <TrackCard key={t.id} t={t} mine={t.id === mine} />)}
      </section>
      <section id="khusus" aria-labelledby="h-khusus" className="scroll-mt-36 space-y-4">
        <div>
          <SectionHeader id="h-khusus" title="Jalur Khusus" className="mb-1" />
          <p className="text-sm text-muted">Untuk tujuan tertentu. Pelajaran pertama tiap jalur gratis.</p>
        </div>
        {SPECIAL_TRACKS.map((t) => <TrackCard key={t.id} t={t} />)}
      </section>
    </div>
  );
}

function TrackCard({ t, mine }: { t: TrackInfo; mine?: boolean }) {
  const { ix, learner, ent, now, premium } = useApp();
  const chapter = ix.pack.chapters.find((c) => normTrack(c.track) === t.id);
  if (!chapter) return null;
  const units = ix.pack.units.filter((u) => u.chapterId === chapter.id).sort((a, b) => a.position - b.position);
  const lessons = units.flatMap((u) => lessonsOfUnit(ix, u.id));
  const done = lessons.filter((l) => learner.lessons[l.id]?.completedAt).length;
  const Icon = ICON[t.id];
  const final = t.school ? trackExam(ix, t.id) : undefined;
  const fs = final ? trackExamStatus(learner, ix, t.id, ent, now) : 'none';
  return (
    <Card as="section" className={cx('scroll-mt-36', mine && 'border-brand/50 shadow-e1')}>
      <div id={t.id} className="flex items-start gap-3 scroll-mt-36">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><Icon size={22} aria-hidden /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-extrabold">{t.title}</h3>{mine && <Badge tone="brand">Jenjangmu</Badge>}</div>
          <p className="text-sm font-bold text-muted">{t.school ? `${t.school.grades} · ${t.school.fase} · ${t.level}` : `${t.audience} · ${t.level}`}</p>
          <p className="mt-1 text-sm">{t.pitch}</p>
          {lessons.length > 0 && <div className="mt-2 flex items-center gap-2"><Progress value={done} max={lessons.length} tone="ok" className="max-w-48" label={`Progres ${t.title}`} /><span className="text-xs font-bold tabular-nums text-muted">{done}/{lessons.length} pelajaran</span></div>}
        </div>
      </div>
      <div className="mt-5">
        {units.map((u, ui) => {
          const ue = unitExam(ix, u.id);
          const ues = unitExamStatus(learner, ix, u.id);
          const freeUnit = !!t.school && ui === 0;
          const unitLessons = lessonsOfUnit(ix, u.id);
          return (
            <div key={u.id}>
              {(t.school || units.length > 1) && (
                <UnitHeading title={`Unit ${ui + 1}: ${u.title}`} done={unitLessons.filter((l) => learner.lessons[l.id]?.completedAt).length} total={unitLessons.length}
                  badge={t.school && (freeUnit ? <Badge tone="ok">Gratis</Badge> : <Badge tone="accent"><Crown size={12} aria-hidden />Premium</Badge>)} />
              )}
              <Trail>
                {unitLessons.map((l, i) => {
                  const lock = lessonLock(learner, ix, l, ent, now);
                  const p = learner.lessons[l.id];
                  const free = !t.school && ui === 0 && i === 0 && !l.premium;
                  return (
                    <PathRow key={l.id} state={lock.status} title={<>{l.title}{free && <Badge tone="ok" className="ml-2 align-middle">Gratis</Badge>}</>}
                      href={lock.status === 'locked' ? undefined : lock.status === 'premium' ? '/app/subscription' : `/app/lesson?id=${l.id}`}
                      subtitle={lock.status === 'locked' || lock.status === 'premium' ? lock.reason : l.summary}
                      trailing={p?.masteryBest ? <Badge tone={p.completedAt ? 'ok' : 'muted'}>Tes {p.masteryBest}%</Badge> : lock.status === 'in-progress' ? <Badge>Berjalan</Badge> : null} />
                  );
                })}
                {ue && (
                  <PathRow state={ues === 'passed' ? 'exam-passed' : ues === 'available' ? 'exam' : 'exam-locked'} title={ue.title}
                    href={ues === 'available' && !(ue.premium && !premium) ? `/app/exams?id=${ue.id}` : ues === 'available' ? '/app/subscription' : undefined}
                    subtitle={ues === 'passed' ? 'Lulus.' : ues === 'available' ? (ue.premium && !premium ? 'Ujian unit untuk Premium.' : 'Siap dikerjakan.') : 'Terbuka setelah semua pelajaran tuntas'}
                    trailing={ues === 'passed' ? <Badge tone="ok"><Check size={12} aria-hidden />Lulus</Badge> : ues === 'available' && ue.premium && !premium ? <Badge tone="accent"><Crown size={12} aria-hidden />Premium</Badge> : undefined} />
                )}
              </Trail>
            </div>
          );
        })}
      </div>
      {final && (
        <div className="mt-5 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-on-accent"><Award size={20} aria-hidden /></span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">{final.title}</span>
              <span className="block text-sm text-muted">Membaca, menyimak, tata bahasa, dan menulis. Lulus mendapat sertifikat yang bisa diperiksa keasliannya.</span>
            </span>
          </div>
          {fs === 'passed' ? <Badge tone="ok"><Check size={12} aria-hidden />Lulus</Badge>
            : fs === 'premium' ? <LinkButton size="sm" variant="accent" href="/app/subscription"><Crown size={14} aria-hidden />Premium</LinkButton>
            : fs === 'available' ? <LinkButton size="sm" href={`/app/exams?id=${final.id}`}>Mulai ujian</LinkButton>
            : <Badge tone="muted">Terbuka setelah semua unit tuntas</Badge>}
        </div>
      )}
      {t.note && <p className="mt-4 rounded-xl bg-surface-2 p-3 text-xs text-muted">{t.note}</p>}
    </Card>
  );
}
