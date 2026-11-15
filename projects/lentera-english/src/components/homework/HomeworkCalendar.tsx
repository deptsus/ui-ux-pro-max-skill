'use client';
// Homework calendar (Rilis 4): a month view of due dates, the PR due on the
// chosen day, and an .ics download so the deadlines can go into the phone's own
// calendar (with an alarm the evening before) without any notification permission.
import { useMemo, useState } from 'react';
import { CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { dayKey } from '@/lib/engine/mastery';
import { homeworkIcs, type CalendarItem } from '@/lib/homework-ics';

export type { CalendarItem };
import { Button, Card, LinkButton, cx, dateTimeId } from '@/components/ui';


const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DOT: Record<CalendarItem['status'], string> = { done: 'bg-ok', pending: 'bg-accent', overdue: 'bg-bad' };
const LABEL: Record<CalendarItem['status'], string> = { done: 'sudah dikumpulkan', pending: 'belum dikumpulkan', overdue: 'lewat tenggat' };

export function HomeworkCalendar({ items, now }: { items: CalendarItem[]; now: number }) {
  const today = dayKey(now);
  const [offset, setOffset] = useState(0);
  const [picked, setPicked] = useState(today);
  const first = new Date(now);
  first.setDate(1);
  first.setHours(0, 0, 0, 0);
  first.setMonth(first.getMonth() + offset);
  const byDay = useMemo(() => {
    const m = new Map<string, CalendarItem[]>();
    for (const i of items) m.set(dayKey(i.dueAt), [...(m.get(dayKey(i.dueAt)) ?? []), i]);
    return m;
  }, [items]);

  // Monday-first grid covering the whole month.
  const lead = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [...Array.from({ length: lead }, () => null), ...Array.from({ length: daysInMonth }, (_, i) => new Date(first.getFullYear(), first.getMonth(), i + 1))];
  while (cells.length % 7) cells.push(null);
  const pending = items.filter((i) => i.status !== 'done');
  const chosen = byDay.get(picked) ?? [];

  function download() {
    const blob = new Blob([homeworkIcs(items, window.location.origin, Date.now())], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tenggat-pr-lentera.ics';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }

  return (
    <Card className="space-y-3" as="section">
      <div className="flex items-center justify-between gap-2">
        <h2 className="whitespace-nowrap font-extrabold" id="kalender-pr">Kalender PR</h2>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" aria-label="Bulan sebelumnya" onClick={() => setOffset(offset - 1)}><ChevronLeft size={18} aria-hidden /></Button>
          <span className="min-w-28 text-center text-sm font-bold" aria-live="polite">{MONTHS[first.getMonth()]} {first.getFullYear()}</span>
          <Button size="sm" variant="ghost" aria-label="Bulan berikutnya" onClick={() => setOffset(offset + 1)}><ChevronRight size={18} aria-hidden /></Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted" aria-hidden>{WEEKDAYS.map((d) => <span key={d}>{d}</span>)}</div>
      <div className="grid grid-cols-7 gap-1" role="grid" aria-labelledby="kalender-pr">
        {cells.map((d, i) => {
          if (!d) return <span key={i} />;
          const key = dayKey(d.getTime());
          const due = byDay.get(key) ?? [];
          return (
            <button key={key} type="button" onClick={() => setPicked(key)} aria-pressed={picked === key}
              aria-label={`${d.getDate()} ${MONTHS[d.getMonth()]}${due.length ? `: ${due.length} PR (${due.map((x) => LABEL[x.status]).join(', ')})` : ''}`}
              className={cx('flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-bold transition', picked === key ? 'bg-brand text-on-brand' : key === today ? 'bg-brand-soft text-brand' : 'hover:bg-surface-2')}>
              {d.getDate()}
              <span className="mt-0.5 flex h-1.5 gap-0.5">{due.slice(0, 3).map((x) => <span key={x.id} className={cx('h-1.5 w-1.5 rounded-full', picked === key ? 'bg-on-brand' : DOT[x.status])} />)}</span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-muted">
        {(['pending', 'overdue', 'done'] as const).map((s) => <span key={s} className="flex items-center gap-1"><span className={cx('h-2 w-2 rounded-full', DOT[s])} />{LABEL[s]}</span>)}
      </div>
      <div>
        <p className="text-sm font-bold">{picked === today ? 'Tenggat hari ini' : `Tenggat ${Number(picked.slice(8))} ${MONTHS[Number(picked.slice(5, 7)) - 1]}`}</p>
        {chosen.length ? (
          <ul className="mt-1 space-y-1.5">
            {chosen.map((x) => (
              <li key={x.id} className="flex flex-wrap items-center gap-2 text-sm">
                <span className={cx('h-2 w-2 shrink-0 rounded-full', DOT[x.status])} />
                <span className="min-w-0 flex-1">{x.title} <span className="text-muted">· {dateTimeId(x.dueAt)}</span></span>
                <LinkButton href={`/app/homework?id=${x.id}`} size="sm" variant={x.status === 'done' ? 'secondary' : 'primary'}>{x.status === 'done' ? 'Lihat' : 'Kerjakan'}</LinkButton>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-muted">Tidak ada PR yang bertenggat di hari ini.</p>}
      </div>
      {pending.length > 0 && <Button size="sm" variant="secondary" onClick={download}><CalendarPlus size={16} aria-hidden />Simpan {pending.length} tenggat ke kalender HP</Button>}
    </Card>
  );
}
