// Teaching sections for the public /materi pages: plain server-rendered HTML
// (no audio, no app state), so search engines and slow phones read it fast.
import type { TeachingSection } from '@/lib/content/types';

export function PublicTeaching({ sections }: { sections: TeachingSection[] }) {
  return (
    <div className="space-y-6">
      {sections.map((s, i) => (
        <section key={i}>
          <h2 className="text-xl font-extrabold">{s.heading}</h2>
          <p className="mt-2 leading-relaxed">{s.body}</p>
          {s.table && (
            <div className="mt-3 overflow-x-auto rounded-2xl border border-line">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-2"><tr>{s.table[0].map((h, j) => <th key={j} scope="col" className="px-3 py-2 font-extrabold">{h}</th>)}</tr></thead>
                <tbody>{s.table.slice(1).map((row, r) => <tr key={r} className="border-t border-line">{row.map((c, j) => <td key={j} className={j === 0 ? 'px-3 py-2 font-bold' : 'px-3 py-2'}>{c}</td>)}</tr>)}</tbody>
              </table>
            </div>
          )}
          {s.examples && (
            <ul className="mt-3 space-y-2">
              {s.examples.map((e, j) => (
                <li key={j} className="rounded-2xl bg-surface-2 p-3" lang="en">
                  <p className="font-bold">{e.en}</p>
                  <p className="text-sm text-muted" lang="id">{e.id}</p>
                  {e.note && <p className="mt-0.5 text-sm text-brand" lang="id">{e.note}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
