'use client';
// Jalur Khusus (Rilis 11): TOEFL ITP/IELTS, English for work, and the kids'
// track, next to the main CEFR path. The first lesson of each track is free;
// lessons open one after another inside a track, whatever the learner's level.
import Link from 'next/link';
import { Briefcase, Check, Crown, GraduationCap, Lock, Play, Smile } from 'lucide-react';
import { TRACKS } from '@/lib/content/tracks';
import type { TrackId } from '@/lib/content/types';
import { lessonLock, lessonsOfUnit, unitExam, unitExamStatus } from '@/lib/engine/unlock';
import { useApp } from '@/lib/client/hooks';
import { Badge, Card, Empty, LinkButton, PageHeader, Progress, cx } from '@/components/ui';

const ICON: Record<TrackId, typeof Briefcase> = { work: Briefcase, exam: GraduationCap, kids: Smile };

export default function TracksPage() {
  const { ix, learner, ent, now, premium } = useApp();
  // The published curriculum may predate the tracks until the owner imports and publishes it.
  if (!ix.pack.chapters.some((c) => c.track)) {
    return (
      <div>
        <PageHeader title="Jalur Khusus" subtitle="Persiapan TOEFL ITP/IELTS, bahasa Inggris untuk kerja, dan jalur anak." />
        <Empty title="Jalur khusus sedang disiapkan">Materinya segera terbit. Sementara itu, lanjutkan jalur belajar CEFR-mu.</Empty>
      </div>
    );
  }
  return (
    <div>
      <PageHeader title="Jalur Khusus" subtitle="Belajar untuk tujuan tertentu, di samping jalur CEFR utama. Pelajaran pertama tiap jalur gratis." />
      <div className="space-y-6">
        {TRACKS.map((t) => {
          const chapter = ix.pack.chapters.find((c) => c.track === t.id);
          if (!chapter) return null;
          const units = ix.pack.units.filter((u) => u.chapterId === chapter.id).sort((a, b) => a.position - b.position);
          const lessons = units.flatMap((u) => lessonsOfUnit(ix, u.id));
          const done = lessons.filter((l) => learner.lessons[l.id]?.completedAt).length;
          const Icon = ICON[t.id];
          return (
            <Card as="section" key={t.id} className="scroll-mt-20 space-y-4">
              <div id={t.id} className="flex items-start gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand"><Icon size={24} aria-hidden /></span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-extrabold">{t.title}</h2>
                  <p className="text-sm font-bold text-muted">{t.audience} · {t.level}</p>
                  <p className="mt-1 text-sm">{t.pitch}</p>
                  {lessons.length > 0 && <div className="mt-2 flex items-center gap-2"><Progress value={done} max={lessons.length} tone="ok" className="h-2 max-w-48" label={`Progres ${t.title}`} /><span className="text-xs font-bold text-muted">{done}/{lessons.length} pelajaran</span></div>}
                </div>
              </div>
              {units.map((u) => {
                const ue = unitExam(ix, u.id);
                const ues = unitExamStatus(learner, ix, u.id);
                return (
                  <div key={u.id}>
                    <ol className="space-y-2">
                      {lessonsOfUnit(ix, u.id).map((l, i) => {
                        const lock = lessonLock(learner, ix, l, ent, now);
                        const p = learner.lessons[l.id];
                        const LockIcon = lock.status === 'completed' ? Check : lock.status === 'premium' ? Crown : lock.status === 'locked' ? Lock : Play;
                        const tone = lock.status === 'completed' ? 'bg-ok text-on-brand' : lock.status === 'premium' ? 'bg-accent text-[#1e1b3a]' : lock.status === 'locked' ? 'bg-surface-2 text-muted' : 'bg-brand text-on-brand';
                        const body = (
                          <>
                            <span className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-full', tone)}><LockIcon size={18} aria-hidden /></span>
                            <span className="min-w-0 flex-1">
                              <span className="block font-bold">{l.title}{i === 0 && !l.premium && <Badge tone="ok" className="ml-2">Gratis</Badge>}</span>
                              <span className="block text-sm text-muted">{lock.status === 'locked' || lock.status === 'premium' ? lock.reason : l.summary}</span>
                            </span>
                            {p?.masteryBest ? <Badge tone={p.completedAt ? 'ok' : 'muted'}>Tes {p.masteryBest}%</Badge> : lock.status === 'in-progress' ? <Badge>Berjalan</Badge> : null}
                          </>
                        );
                        return (
                          <li key={l.id}>
                            {lock.status !== 'locked' ? (
                              <Link href={lock.status === 'premium' ? '/app/subscription' : `/app/lesson?id=${l.id}`} className="flex items-center gap-3 rounded-2xl border border-line p-3 transition hover:border-brand hover:bg-surface-2">{body}</Link>
                            ) : (
                              <div className="flex items-center gap-3 rounded-2xl border border-dashed border-line p-3 opacity-75" aria-disabled>{body}</div>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                    {ue && <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-bold">{ue.title}</span>
                      {ues === 'passed' ? <Badge tone="ok"><Check size={12} aria-hidden />Lulus</Badge> : ues === 'available' ? (premium ? <LinkButton size="sm" variant="accent" href={`/app/exams?id=${ue.id}`}>Mulai ujian</LinkButton> : <Badge tone="accent"><Crown size={12} aria-hidden />Premium</Badge>) : <Badge tone="muted">Terbuka setelah semua pelajaran tuntas</Badge>}
                    </div>}
                  </div>
                );
              })}
              {t.note && <p className="rounded-2xl bg-surface-2 p-3 text-xs text-muted">{t.note}</p>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
