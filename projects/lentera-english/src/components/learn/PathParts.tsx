'use client';
// Learning path pieces (redesign 2026), shared by Jalur Belajar (CEFR) and Jalur Sekolah & Khusus:
// lesson rows on a vertical trail with five clear states, unit headings, and the path tabs.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Check, Crown, Hourglass, Lock, Play, Trophy } from 'lucide-react';
import { Progress, TabLinks, cx } from '@/components/ui';

export type RowState = 'completed' | 'current' | 'available' | 'in-progress' | 'premium' | 'locked' | 'planned' | 'exam' | 'exam-passed' | 'exam-locked';

const NODE: Record<RowState, { icon: typeof Check; cls: string }> = {
  completed: { icon: Check, cls: 'bg-ok text-on-brand' },
  current: { icon: Play, cls: 'bg-brand text-on-brand ring-4 ring-brand/25' },
  available: { icon: Play, cls: 'border-2 border-brand bg-surface text-brand' },
  'in-progress': { icon: Play, cls: 'bg-brand-soft text-brand-ink dark:text-brand' },
  premium: { icon: Crown, cls: 'bg-accent-soft text-accent-strong' },
  locked: { icon: Lock, cls: 'bg-surface-2 text-muted dark:bg-line' },
  planned: { icon: Hourglass, cls: 'border-2 border-dashed border-line-strong bg-surface text-muted' },
  exam: { icon: Trophy, cls: 'bg-accent text-on-accent' },
  'exam-passed': { icon: Check, cls: 'bg-ok text-on-brand' },
  'exam-locked': { icon: Trophy, cls: 'bg-surface-2 text-muted dark:bg-line' },
};

/** A trail of rows: the line runs behind the round nodes. */
export function Trail({ children, className }: { children: ReactNode; className?: string }) {
  return <ol className={cx('relative space-y-1 before:absolute before:bottom-6 before:left-[1.625rem] before:top-6 before:w-0.5 before:bg-line', className)}>{children}</ol>;
}

/** One lesson (or unit exam) on the trail. Links when it can be opened; locked rows explain why. */
export function PathRow({ state, title, subtitle, href, label, trailing, lang }: { state: RowState; title: ReactNode; subtitle?: ReactNode; href?: string; label?: ReactNode; trailing?: ReactNode; lang?: string }) {
  const { icon: Icon, cls } = NODE[state];
  const body = (
    <>
      <span className={cx('relative z-[1] grid h-9 w-9 shrink-0 place-items-center rounded-full', cls)}><Icon size={18} strokeWidth={2.4} aria-hidden /></span>
      <span className="min-w-0 flex-1">
        {label && <span className="mb-0.5 block">{label}</span>}
        <span lang={lang} className="block font-bold leading-snug">{title}</span>
        {subtitle && <span className="mt-0.5 block text-sm text-muted">{subtitle}</span>}
      </span>
      {trailing}
    </>
  );
  const row = cx('flex min-h-14 items-center gap-3 rounded-xl px-2 py-2', state === 'current' && 'bg-brand-soft/70 dark:bg-brand-soft/60');
  return (
    <li>
      {href ? <Link href={href} className={cx(row, 'transition-colors hover:bg-surface-2')}>{body}</Link>
        : <div className={row} aria-disabled={state === 'locked' || state === 'exam-locked' || undefined}>{body}</div>}
    </li>
  );
}

/** Unit heading with its own progress. */
export function UnitHeading({ title, done, total, badge, id }: { title: ReactNode; done: number; total: number; badge?: ReactNode; id?: string }) {
  return (
    <div className="mb-2 mt-5 first:mt-0">
      <div className="flex items-start gap-2">
        <h4 id={id} className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 font-extrabold">{title}{badge}</h4>
        {total > 0 && <span className="shrink-0 pt-0.5 text-xs font-bold tabular-nums text-muted">{done}/{total}<span className="sr-only"> pelajaran tuntas</span></span>}
      </div>
      {total > 0 && <Progress value={done} max={total} tone="ok" className="mt-1.5 h-1.5" label={`Progres ${typeof title === 'string' ? title : 'unit'}`} />}
    </div>
  );
}

const SPECIAL = ['#khusus', '#work', '#exam'];
/** CEFR | Sekolah | Khusus. Sekolah and Khusus share /app/jalur; the hash tells them apart. */
export function PathTabs() {
  const pathname = usePathname();
  const [hash, setHash] = useState('');
  useEffect(() => {
    const read = () => setHash(window.location.hash);
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);
  const onTracks = pathname.startsWith('/app/jalur');
  const special = onTracks && SPECIAL.includes(hash);
  return (
    <TabLinks label="Jenis jalur" className="mb-6" items={[
      { href: '/app/path', label: 'CEFR', current: pathname.startsWith('/app/path') },
      { href: '/app/jalur#sekolah', label: 'Sekolah', current: onTracks && !special },
      { href: '/app/jalur#khusus', label: 'Khusus', current: special },
    ]} />
  );
}
