'use client';
import { Award, BookOpen, Calendar, Flame, GraduationCap, MessageSquare, Pencil, Repeat, ScrollText, Sun, Target, Trophy, Wrench, Zap, type LucideIcon } from 'lucide-react';
import { GAME } from '@/lib/engine/config';
import { ACHIEVEMENTS, playerLevel } from '@/lib/engine/gamification';
import { useApp } from '@/lib/client/hooks';
import { Badge, Card, PageHeader, Progress, cx, dateId } from '@/components/ui';

const ICONS: Record<string, LucideIcon> = { flame: Flame, book: BookOpen, graduation: GraduationCap, calendar: Calendar, sun: Sun, zap: Zap, trophy: Trophy, target: Target, award: Award, repeat: Repeat, wrench: Wrench, scroll: ScrollText, pencil: Pencil, message: MessageSquare };

export default function AchievementsPage() {
  const { ix, learner } = useApp();
  const earned = ACHIEVEMENTS.filter((a) => learner.achievements[a.id]).length;
  const level = playerLevel(learner.xp);
  const chapters = ix.pack.chapters.filter((c) => !c.planned);
  return (
    <div className="space-y-5">
      <PageHeader title="Pencapaian" subtitle="Lencana diberikan untuk kemajuan belajar yang nyata: pelajaran tuntas, topik dikuasai, dan kebiasaan mengulang." action={<Badge tone="accent">{earned}/{ACHIEVEMENTS.length} lencana</Badge>} />
      <Card className="flex flex-wrap items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-3xl bg-brand text-2xl font-extrabold text-on-brand">{level.level}</span>
        <div className="min-w-0 flex-1"><p className="font-extrabold">Tingkat {level.level} · {learner.xp.toLocaleString('id-ID')} XP</p><Progress value={level.into} max={level.need} className="mt-2" label="Menuju tingkat berikutnya" /><p className="mt-1 text-xs text-muted">{level.need - level.into} XP lagi ke tingkat {level.level + 1}</p></div>
      </Card>
      <section>
        <h2 className="mb-2 text-lg font-extrabold">Tonggak XP</h2>
        <ol className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {GAME.milestones.map((m) => <li key={m} className={cx('rounded-2xl border-2 px-2 py-3 text-center', learner.xp >= m ? 'border-accent bg-accent-soft' : 'border-line bg-surface opacity-70')}><Zap size={18} className={cx('mx-auto', learner.xp >= m ? 'text-accent-strong' : 'text-muted')} aria-hidden /><p className="mt-1 text-sm font-extrabold">{m.toLocaleString('id-ID')}</p><p className="text-[11px] text-muted">{learner.xp >= m ? 'tercapai' : 'XP'}</p></li>)}
        </ol>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-extrabold">Hadiah bab</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {chapters.map((c) => { const at = learner.rewards[`chapter:${c.id}`]; return <li key={c.id} className={cx('flex items-center gap-3 rounded-2xl border p-3', at ? 'border-ok bg-ok-soft' : 'border-line bg-surface')}><Trophy size={20} className={at ? 'text-ok' : 'text-muted'} aria-hidden /><div className="min-w-0 flex-1"><p className="font-bold">{c.level} · {c.title}</p><p className="text-xs text-muted">{at ? `Tuntas ${dateId(at)} · +${GAME.xp.chapterComplete} XP dan 1 pelindung beruntun` : 'Tuntaskan semua pelajaran dan ujian unit bab ini.'}</p></div></li>; })}
        </ul>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-extrabold">Lencana</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {ACHIEVEMENTS.map((a) => {
            const at = learner.achievements[a.id];
            const [cur, target] = a.progress(learner);
            const Icon = ICONS[a.icon] ?? Award;
            return (
              <Card as="li" key={a.id} className={cx('flex items-center gap-3 p-4', !at && 'opacity-80')}>
                <span className={cx('grid h-12 w-12 shrink-0 place-items-center rounded-2xl', at ? 'bg-accent text-[#1e1b3a]' : 'bg-surface-2 text-muted')}><Icon size={24} aria-hidden /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold">{a.title}</p><p className="text-sm text-muted">{a.desc}</p>
                  {at ? <p className="mt-1 text-xs font-bold text-ok">Diraih {dateId(at)}</p> : <div className="mt-1.5 flex items-center gap-2"><Progress value={cur} max={target} className="h-2" label={a.title} /><span className="shrink-0 text-xs font-bold text-muted">{Math.min(cur, target)}/{target}</span></div>}
                </div>
              </Card>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
