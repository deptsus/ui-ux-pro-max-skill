'use client';
import Link from 'next/link';
import { Check, Crown, GraduationCap, Hourglass, Lock, Play } from 'lucide-react';
import { CEFR_ORDER, type Cefr } from '@/lib/content/types';
import { lessonLock, lessonsOfUnit, levelExam, levelExamStatus, levelOpen, unitExam, unitExamStatus } from '@/lib/engine/unlock';
import { useApp } from '@/lib/client/hooks';
import { Badge, Card, LinkButton, PageHeader, Progress, cx } from '@/components/ui';

export default function PathPage() {
  const { ix, learner, ent, now } = useApp();
  const placed = learner.profile.placementLevel;

  return (
    <div>
      <PageHeader title="Jalur Belajar" subtitle="Kurikulum CEFR dari A1 sampai C2. Tiap pelajaran harus lulus tes penguasaan (min. 85%) sebelum yang berikutnya terbuka." action={!learner.profile.placementDone ? <LinkButton href="/app/placement" variant="accent" size="sm">Tes penempatan</LinkButton> : <Badge tone="accent">Level penempatan: {placed}</Badge>} />
      <div className="space-y-8">
        {CEFR_ORDER.map((code: Cefr) => {
          const level = ix.pack.levels.find((l) => l.code === code);
          if (!level) return null;
          const chapters = ix.pack.chapters.filter((c) => c.level === code).sort((a, b) => a.position - b.position);
          const lessons = ix.orderedLessons.filter((l) => chapters.some((c) => c.id === ix.unitById.get(l.unitId)?.chapterId));
          const done = lessons.filter((l) => learner.lessons[l.id]?.completedAt).length;
          const open = levelOpen(learner, ix, code);
          const exam = levelExam(ix, code);
          const examStatus = levelExamStatus(learner, ix, code, ent, now);
          return (
            <section key={code} aria-labelledby={`level-${code}`}>
              <div className="mb-3 flex items-center gap-3">
                <span className={cx('grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-lg font-extrabold', open ? 'bg-brand text-on-brand' : 'bg-surface-2 text-muted')}>{code}</span>
                <div className="min-w-0 flex-1">
                  <h2 id={`level-${code}`} className="text-xl font-extrabold">{level.title}</h2>
                  <p className="text-sm text-muted">{level.description}</p>
                  {lessons.length > 0 && <div className="mt-1.5 flex items-center gap-2"><Progress value={done} max={lessons.length} tone="ok" className="h-2 max-w-48" label={`Progres level ${code}`} /><span className="text-xs font-bold text-muted">{done}/{lessons.length} pelajaran</span></div>}
                </div>
              </div>
              <div className="space-y-4">
                {chapters.map((ch) => {
                  const units = ix.pack.units.filter((u) => u.chapterId === ch.id).sort((a, b) => a.position - b.position);
                  return (
                    <Card key={ch.id} className={cx(ch.planned && 'opacity-80')}>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-extrabold">Bab {ch.position}: {ch.title}</h3>
                        {ch.premium ? <Badge tone="accent"><Crown size={12} aria-hidden />Premium</Badge> : <Badge tone="ok">Gratis</Badge>}
                        {ch.planned && <Badge tone="muted"><Hourglass size={12} aria-hidden />Sedang disusun</Badge>}
                        {learner.rewards[`chapter:${ch.id}`] && <Badge tone="ok"><Check size={12} aria-hidden />Bab tuntas</Badge>}
                      </div>
                      <p className="mt-1 text-sm text-muted">{ch.description}</p>
                      {units.map((u) => {
                        const unitLessons = lessonsOfUnit(ix, u.id);
                        const ue = unitExam(ix, u.id);
                        const ues = unitExamStatus(learner, ix, u.id);
                        return (
                          <div key={u.id} className="mt-4">
                            <p className="text-sm font-extrabold uppercase tracking-wide text-muted">Unit {u.position} · {u.title}</p>
                            <ol className="mt-2 space-y-2">
                              {unitLessons.map((l) => {
                                const lock = lessonLock(learner, ix, l, ent, now);
                                const p = learner.lessons[l.id];
                                const reachable = lock.status !== 'locked';
                                const Icon = lock.status === 'completed' ? Check : lock.status === 'premium' ? Crown : lock.status === 'locked' ? Lock : Play;
                                const tone = lock.status === 'completed' ? 'bg-ok text-on-brand' : lock.status === 'premium' ? 'bg-accent text-[#1e1b3a]' : lock.status === 'locked' ? 'bg-surface-2 text-muted' : 'bg-brand text-on-brand';
                                const body = (
                                  <>
                                    <span className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-full', tone)}><Icon size={18} aria-hidden /></span>
                                    <span className="min-w-0 flex-1">
                                      <span className="block font-bold">{l.title}</span>
                                      <span className="block text-sm text-muted">{lock.status === 'locked' || lock.status === 'premium' ? lock.reason : l.summary}</span>
                                    </span>
                                    {p?.masteryBest ? <Badge tone={p.completedAt ? 'ok' : 'muted'}>Tes {p.masteryBest}%</Badge> : lock.status === 'in-progress' ? <Badge>Berjalan</Badge> : null}
                                  </>
                                );
                                return (
                                  <li key={l.id}>
                                    {reachable ? (
                                      <Link href={lock.status === 'premium' ? '/app/subscription' : `/app/lesson?id=${l.id}`} className="flex items-center gap-3 rounded-2xl border border-line p-3 transition hover:border-brand hover:bg-surface-2">{body}</Link>
                                    ) : (
                                      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-line p-3 opacity-75" aria-disabled>{body}</div>
                                    )}
                                  </li>
                                );
                              })}
                              {(u.plannedLessons ?? []).map((t) => (
                                <li key={t} className="flex items-center gap-3 rounded-2xl border border-dashed border-line p-3 opacity-60">
                                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-2 text-muted"><Hourglass size={18} aria-hidden /></span>
                                  <span><span className="block font-bold">{t}</span><span className="block text-sm text-muted">Ada di silabus. Materinya sedang disusun tim pengajar.</span></span>
                                </li>
                              ))}
                              {ue && (
                                <li>
                                  {ues === 'locked' ? (
                                    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-line p-3 opacity-75"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-2 text-muted"><GraduationCap size={18} aria-hidden /></span><span><span className="block font-bold">{ue.title}</span><span className="block text-sm text-muted">Terbuka setelah semua pelajaran unit ini tuntas.</span></span></div>
                                  ) : (
                                    <Link href={`/app/exams?id=${ue.id}`} className="flex items-center gap-3 rounded-2xl border-2 border-accent bg-accent-soft p-3"><span className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-full', ues === 'passed' ? 'bg-ok text-on-brand' : 'bg-accent text-[#1e1b3a]')}>{ues === 'passed' ? <Check size={18} aria-hidden /> : <GraduationCap size={18} aria-hidden />}</span><span className="flex-1"><span className="block font-bold">{ue.title}</span><span className="block text-sm text-muted">{ues === 'passed' ? 'Lulus. Unit berikutnya terbuka.' : `Lulus min. ${ue.passScore}% untuk membuka unit berikutnya.`}</span></span></Link>
                                  )}
                                </li>
                              )}
                            </ol>
                          </div>
                        );
                      })}
                    </Card>
                  );
                })}
                {exam && (
                  <Card className="flex flex-wrap items-center gap-3 border-2 border-brand">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand text-on-brand"><GraduationCap size={24} aria-hidden /></span>
                    <div className="min-w-0 flex-1"><p className="font-extrabold">{exam.title}</p><p className="text-sm text-muted">{examStatus === 'passed' ? 'Lulus. Level berikutnya terbuka.' : examStatus === 'premium' ? 'Ujian level tersedia untuk Premium.' : examStatus === 'locked' ? 'Tuntaskan semua unit dan ujian unit di level ini dulu.' : `Lulus min. ${exam.passScore}% untuk naik level.`}</p></div>
                    {examStatus === 'available' && <LinkButton href={`/app/exams?id=${exam.id}`} size="sm">Ikuti ujian</LinkButton>}
                    {examStatus === 'premium' && <LinkButton href="/app/subscription" size="sm" variant="accent">Lihat Premium</LinkButton>}
                  </Card>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
