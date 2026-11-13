'use client';
import { Check, X } from 'lucide-react';
import type { Lesson, TeachingSection } from '@/lib/content/types';
import { AudioButton } from './AudioButton';
import { Card, cx } from './ui';

export function Teaching({ sections }: { sections: TeachingSection[] }) {
  return (
    <div className="space-y-4">
      {sections.map((s, i) => (
        <Card key={i}>
          <h3 className="text-lg font-extrabold">{s.heading}</h3>
          <p className="mt-2 leading-relaxed">{s.body}</p>
          {s.table && (
            <div className="mt-3 overflow-x-auto rounded-2xl border border-line">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-2"><tr>{s.table[0].map((h, j) => <th key={j} scope="col" className="px-3 py-2 font-extrabold">{h}</th>)}</tr></thead>
                <tbody>{s.table.slice(1).map((row, r) => <tr key={r} className="border-t border-line">{row.map((c, j) => <td key={j} className={cx('px-3 py-2', j === 0 && 'en font-bold')}>{c}</td>)}</tr>)}</tbody>
              </table>
            </div>
          )}
          {s.examples && (
            <ul className="mt-3 space-y-2">
              {s.examples.map((e, j) => (
                <li key={j} className="flex items-start gap-3 rounded-2xl bg-surface-2 p-3">
                  <AudioButton text={e.en} size="sm" label={`Dengarkan: ${e.en}`} />
                  <div className="min-w-0"><p className="en font-bold">{e.en}</p><p className="text-sm text-muted">{e.id}</p>{e.note && <p className="mt-0.5 text-sm text-brand">{e.note}</p>}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ))}
    </div>
  );
}

export function Demo({ lesson }: { lesson: Lesson }) {
  return (
    <div className="space-y-3">
      {lesson.demo.map((d, i) => (
        <Card key={i} className="space-y-2">
          <p className="flex items-start gap-2"><span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ok text-on-brand"><Check size={14} aria-label="Benar" /></span><span className="en font-bold">{d.good}</span></p>
          <p className="flex items-start gap-2"><span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-bad text-on-brand"><X size={14} aria-label="Salah" /></span><span className="en font-bold text-muted line-through decoration-bad">{d.bad}</span></p>
          <p className="rounded-xl bg-surface-2 px-3 py-2 text-sm"><span className="font-bold">Kenapa: </span>{d.why}</p>
        </Card>
      ))}
    </div>
  );
}

