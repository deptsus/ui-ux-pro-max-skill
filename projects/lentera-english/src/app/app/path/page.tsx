'use client';
// Jalur Belajar (CEFR A1–C2). Redesign 2026: a level switcher at the top, the learner's level open
// and the others folded, chapters as single cards, and lessons on a trail with clear states
// (selesai, sekarang, terbuka, berjalan, Premium, terkunci). Locking rules are unchanged.
import { useEffect, useState } from 'react';
import { Check, ChevronDown, Crown, GraduationCap, Hourglass } from 'lucide-react';
import { CEFR_ORDER, type Cefr } from '@/lib/content/types';
import { examOpensAt, lessonLock, lessonsOfUnit, levelExam, levelExamStatus, levelOpen, nextLesson, unitExam, unitExamStatus } from '@/lib/engine/unlock';
import { planWaitReason } from '@/lib/engine/plan';
import { useApp } from '@/lib/client/hooks';
import { Badge, Card, LinkButton, PageHeader, Progress, cx } from '@/components/ui';
import { PathRow, PathTabs, Trail, UnitHeading, type RowState } from '@/components/learn/PathParts';

export default function PathPage() {
  const { ix, learner, ent, now } = useApp();
  const placed = learner.profile.placementLevel;
  const here = nextLesson(learner, ix, ent, now);
  const hereLevel = here ? ix.pack.chapters.find((c) => c.id === ix.unitById.get(here.unitId)?.chapterId)?.level : undefined;
  const focus: Cefr = hereLevel ?? placed ?? 'A1';
  const [openLevels, setOpenLevels] = useState<Set<Cefr>>(() => new Set([focus]));
  // A link to #level-B1 (or the level switcher) opens that level.
  useEffect(() => {
    const sync = () => { const m = /^#level-(A1|A2|B1|B2|C1|C2)$/.exec(window.location.hash); if (m) setOpenLevels((s) => new Set(s).add(m[1] as Cefr)); };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);
  const toggle = (c: Cefr) => setOpenLevels((s) => { const n = new Set(s); if (n.has(c)) n.delete(c); else n.add(c); return n; });

  const levels = CEFR_ORDER.map((code) => {
    const level = ix.pack.levels.find((l) => l.code === code);
    const chapters = ix.pack.chapters.filter((c) => c.level === code && !c.track).sort((a, b) => a.position - b.position);
    const lessons = ix.orderedLessons.filter((l) => chapters.some((c) => c.id === ix.unitById.get(l.unitId)?.chapterId));
    const done = lessons.filter((l) => learner.lessons[l.id]?.completedAt).length;
    return { code, level, chapters, lessons, done };
  }).filter((l) => l.level);

  return (
    <div>
      <PageHeader title="Jalur Belajar" subtitle="Kurikulum CEFR dari A1 sampai C2. Tiap pelajaran harus lulus tes penguasaan (min. 85%) sebelum yang berikutnya terbuka." action={!learner.profile.placementDone ? <LinkButton href="/app/placement" variant="secondary" size="sm">Tes penempatan</LinkButton> : <Badge tone="accent">Level penempatan: {placed}</Badge>} />
      <PathTabs />

      <nav aria-label="Level CEFR" className="sticky top-[calc(var(--app-header)+env(safe-area-inset-top))] z-[5] -mx-4 mb-6 border-b border-line bg-bg/95 px-4 py-2 backdrop-blur">
        <ul className="flex gap-1 overflow-x-auto">
          {levels.map(({ code, lessons, done }) => {
            const all = lessons.length > 0 && done === lessons.length;
            return (
              <li key={code} className="min-w-11 flex-1">
                <a href={`#level-${code}`} onClick={() => setOpenLevels((s) => new Set(s).add(code))} aria-current={code === focus ? 'step' : undefined}
                  className={cx('flex min-h-11 flex-col items-center justify-center rounded-xl text-sm font-extrabold transition-colors', code === focus ? 'bg-brand text-on-brand' : all ? 'bg-ok-soft text-ok' : levelOpen(learner, ix, code) ? 'bg-surface text-ink ring-1 ring-line hover:bg-surface-2' : 'bg-surface-2 text-muted dark:bg-line/60')}>
                  {code}
                  <span className="sr-only">{code === focus ? ', levelmu sekarang' : ''}, {done} dari {lessons.length} pelajaran tuntas</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-6">
        {levels.map(({ code, level, chapters, lessons, done }) => {
          const open = levelOpen(learner, ix, code);
          const expanded = openLevels.has(code);
          const exam = levelExam(ix, code);
          const rawStatus = levelExamStatus(learner, ix, code, ent, now);
          // The weekly plan holds a ready exam back until its week (16 Nov 2026).
          const examWait = exam && rawStatus === 'available' ? examOpensAt(learner, ix, exam, ent, now) : undefined;
          const examStatus = examWait ? 'locked' : rawStatus;
          return (
            <section key={code} aria-labelledby={`level-${code}`}>
              <div className="flex items-start gap-3">
                <span className={cx('grid h-12 w-12 shrink-0 place-items-center rounded-xl text-lg font-extrabold', open ? 'bg-brand text-on-brand' : 'bg-surface-2 text-muted dark:bg-line')} aria-hidden>{code}</span>
                <div className="min-w-0 flex-1">
                  <h2 id={`level-${code}`} className="scroll-mt-36 text-xl font-extrabold">{level!.title}</h2>
                  <p className="text-sm text-muted">{level!.description}</p>
                  {lessons.length > 0 && <div className="mt-2 flex items-center gap-2"><Progress value={done} max={lessons.length} tone="ok" className="max-w-48" label={`Progres level ${code}`} /><span className="text-xs font-bold tabular-nums text-muted">{done}/{lessons.length} pelajaran</span></div>}
                </div>
              </div>
              <button type="button" onClick={() => toggle(code)} aria-expanded={expanded} aria-controls={`isi-${code}`}
                className="mt-2 flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-sm font-bold text-brand hover:bg-brand-soft">
                {expanded ? `Sembunyikan bab ${code}` : `Lihat ${chapters.length} bab ${code}`}
                <ChevronDown size={18} className={cx('transition-transform', expanded && 'rotate-180')} aria-hidden />
              </button>
              <div id={`isi-${code}`} hidden={!expanded} className="mt-2 space-y-4">
                {chapters.map((ch) => {
                  const units = ix.pack.units.filter((u) => u.chapterId === ch.id).sort((a, b) => a.position - b.position);
                  return (
                    <Card key={ch.id} as="article" className={cx(ch.planned && 'border-dashed')}>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-extrabold">Bab {ch.position}: {ch.title}</h3>
                        {ch.premium ? <Badge tone="accent"><Crown size={12} aria-hidden />Premium</Badge> : <Badge tone="ok">Gratis</Badge>}
                        {ch.planned && <Badge tone="muted"><Hourglass size={12} aria-hidden />Sedang disusun</Badge>}
                        {learner.rewards[`chapter:${ch.id}`] && <Badge tone="ok"><Check size={12} aria-hidden />Bab tuntas</Badge>}
                      </div>
                      <p className="mt-1 text-sm text-muted">{ch.description}</p>
                      <div className="mt-4">
                        {units.map((u) => {
                          const unitLessons = lessonsOfUnit(ix, u.id);
                          const unitDone = unitLessons.filter((l) => learner.lessons[l.id]?.completedAt).length;
                          const ue = unitExam(ix, u.id);
                          const ueRaw = unitExamStatus(learner, ix, u.id);
                          const ueWait = ue && ueRaw === 'available' ? examOpensAt(learner, ix, ue, ent, now) : undefined;
                          const ues = ueWait ? 'locked' : ueRaw;
                          return (
                            <div key={u.id}>
                              <UnitHeading title={`Unit ${u.position}: ${u.title}`} done={unitDone} total={unitLessons.length} />
                              <Trail>
                                {unitLessons.map((l) => {
                                  const lock = lessonLock(learner, ix, l, ent, now);
                                  const p = learner.lessons[l.id];
                                  const current = l.id === here?.id;
                                  const state: RowState = current ? 'current' : lock.status;
                                  return (
                                    <PathRow key={l.id} state={state} title={l.title}
                                      href={lock.status === 'locked' ? undefined : lock.status === 'premium' ? '/app/subscription' : `/app/lesson?id=${l.id}`}
                                      label={current ? <Badge>{p ? 'Lanjutkan' : 'Mulai di sini'}</Badge> : undefined}
                                      subtitle={lock.status === 'locked' || lock.status === 'premium' ? lock.reason : l.summary}
                                      trailing={p?.masteryBest ? <Badge tone={p.completedAt ? 'ok' : 'muted'}>Tes {p.masteryBest}%</Badge> : lock.status === 'in-progress' && !current ? <Badge tone="muted">Berjalan</Badge> : null} />
                                  );
                                })}
                                {(u.plannedLessons ?? []).map((t) => <PathRow key={t} state="planned" title={t} subtitle="Ada di silabus. Materinya sedang disiapkan." />)}
                                {ue && (
                                  <PathRow state={ues === 'passed' ? 'exam-passed' : ues === 'locked' ? 'exam-locked' : 'exam'} title={ue.title}
                                    href={ues === 'locked' ? undefined : `/app/exams?id=${ue.id}`}
                                    subtitle={ues === 'locked' ? (ueWait ? planWaitReason(ueWait, now) : 'Terbuka setelah semua pelajaran unit ini tuntas.') : ues === 'passed' ? 'Lulus. Unit berikutnya terbuka.' : `Lulus min. ${ue.passScore}% untuk membuka unit berikutnya.`} />
                                )}
                              </Trail>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  );
                })}
                {exam && (
                  <Card className="flex flex-wrap items-center gap-3 border-brand/40">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand" aria-hidden><GraduationCap size={22} /></span>
                    <div className="min-w-0 flex-1"><p className="font-extrabold">{exam.title}</p><p className="text-sm text-muted">{examStatus === 'passed' ? 'Lulus. Level berikutnya terbuka.' : examStatus === 'premium' ? 'Ujian level tersedia untuk Premium.' : examStatus === 'locked' ? (examWait ? planWaitReason(examWait, now) : 'Tuntaskan semua unit dan ujian unit di level ini dulu.') : `Lulus min. ${exam.passScore}% untuk naik level.`}</p></div>
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
