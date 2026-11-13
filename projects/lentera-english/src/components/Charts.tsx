'use client';
// Small single-series charts (inline SVG). One measure per chart, one hue,
// hover/focus tooltips, recessive grid, and a table view for every chart.
import { useState, type ReactNode } from 'react';
import { Button, Card } from './ui';

export interface Point { label: string; title: string; value: number | null }

const W = 560;
const H = 180;
const PAD = { l: 34, r: 8, t: 12, b: 24 };
const niceMax = (v: number) => { const step = v <= 10 ? 5 : v <= 50 ? 10 : v <= 100 ? 25 : v <= 500 ? 100 : 250; return Math.max(step, Math.ceil(v / step) * step); };
/** Axis maximum for large values (money): 1, 2, 4, 6, 8 or 10 times a power of ten, so the half tick stays short. */
const niceMagnitude = (v: number) => { const pow = 10 ** Math.floor(Math.log10(Math.max(v, 1))); return [1, 2, 4, 6, 8, 10].find((m) => m * pow >= v)! * pow; };

function Frame({ title, subtitle, data, unit, column = 'Hari', format, children }: { title: string; subtitle: string; data: Point[]; unit: string; column?: string; format?: (v: number) => string; children: ReactNode }) {
  const [table, setTable] = useState(false);
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div><h2 className="font-extrabold">{title}</h2><p className="text-sm text-muted">{subtitle}</p></div>
        <Button size="sm" variant="ghost" aria-pressed={table} onClick={() => setTable((t) => !t)}>{table ? 'Lihat grafik' : 'Lihat tabel'}</Button>
      </div>
      {table ? (
        <table className="mt-3 w-full text-left text-sm">
          <thead className="text-xs uppercase text-muted"><tr><th className="py-1.5">{column}</th><th className="py-1.5 text-right">{unit}</th></tr></thead>
          <tbody>{data.map((d) => <tr key={d.title} className="border-t border-line"><td className="py-1.5">{d.title}</td><td className="py-1.5 text-right font-bold">{d.value === null ? '—' : format ? format(d.value) : d.value}</td></tr>)}</tbody>
        </table>
      ) : (
        <div className="mt-3">{children}</div>
      )}
    </Card>
  );
}

function Axes({ max, ticks, suffix = '', format, left = PAD.l }: { max: number; ticks: number[]; suffix?: string; format?: (v: number) => string; left?: number }) {
  const y = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - v / max);
  return (
    <g>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={left} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth="1" />
          <text x={left - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">{format ? format(t) : t}{suffix}</text>
        </g>
      ))}
    </g>
  );
}

function Tooltip({ x, y, text, left = PAD.l }: { x: number; y: number; text: string; left?: number }) {
  const w = text.length * 6.6 + 16;
  const tx = Math.min(Math.max(x - w / 2, left), W - PAD.r - w);
  return (
    <g pointerEvents="none">
      <rect x={tx} y={Math.max(0, y - 30)} width={w} height={22} rx={6} fill="var(--ink)" />
      <text x={tx + w / 2} y={Math.max(0, y - 30) + 15} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--bg)">{text}</text>
    </g>
  );
}

/**
 * `format` switches the chart to large-value mode (e.g. rupiah): `format.axis`
 * labels the ticks, `format.value` the tooltip and table. `column` names the
 * first table column (defaults to "Hari").
 */
export function BarChart({ title, subtitle, data, unit, column, format }: { title: string; subtitle: string; data: Point[]; unit: string; column?: string; format?: { axis: (v: number) => string; value: (v: number) => string } }) {
  const [hover, setHover] = useState<number | null>(null);
  const peak = Math.max(1, ...data.map((d) => d.value ?? 0));
  const max = format ? niceMagnitude(peak) : niceMax(peak);
  const say = (v: number) => (format ? format.value(v) : `${v} ${unit}`);
  // Compact money labels ("600rb", "1,5jt") need a wider gutter than day counts.
  const L = format ? 44 : PAD.l;
  const slot = (W - L - PAD.r) / data.length;
  const bw = Math.min(26, slot - 2);
  const y = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - v / max);
  return (
    <Frame title={title} subtitle={subtitle} data={data} unit={unit} column={column} format={format?.value}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${title}. ${subtitle}`}>
        <Axes max={max} ticks={[0, max / 2, max]} format={format?.axis} left={L} />
        {data.map((d, i) => {
          const v = d.value ?? 0;
          const x = L + slot * i + (slot - bw) / 2;
          const top = y(v);
          const h = H - PAD.b - top;
          return (
            <g key={d.title} tabIndex={0} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} aria-label={`${d.title}: ${say(v)}`}>
              <rect x={L + slot * i} y={PAD.t} width={slot} height={H - PAD.t - PAD.b} fill="transparent" />
              {v > 0 && <path d={`M${x} ${H - PAD.b} V${top + Math.min(4, h)} Q${x} ${top} ${x + Math.min(4, bw / 2)} ${top} H${x + bw - Math.min(4, bw / 2)} Q${x + bw} ${top} ${x + bw} ${top + Math.min(4, h)} V${H - PAD.b} Z`} fill="var(--chart)" opacity={hover === null || hover === i ? 1 : 0.55} />}
              {(i % 2 === data.length % 2 || data.length <= 7 || !!format) && <text x={L + slot * i + slot / 2} y={H - 7} textAnchor="middle" fontSize="11" fill="var(--muted)">{d.label}</text>}
            </g>
          );
        })}
        <line x1={L} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} stroke="var(--muted)" strokeWidth="1" />
        {hover !== null && <Tooltip left={L} x={L + slot * hover + slot / 2} y={y(data[hover].value ?? 0)} text={`${data[hover].title}: ${say(data[hover].value ?? 0)}`} />}
      </svg>
    </Frame>
  );
}

export function LineChart({ title, subtitle, data, unit }: { title: string; subtitle: string; data: Point[]; unit: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const slot = (W - PAD.l - PAD.r) / data.length;
  const x = (i: number) => PAD.l + slot * i + slot / 2;
  const y = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - v / 100);
  // Days without practice are gaps, not zeros.
  const segments: string[] = [];
  let current = '';
  data.forEach((d, i) => {
    if (d.value === null) { if (current) segments.push(current); current = ''; return; }
    current += `${current ? 'L' : 'M'}${x(i)} ${y(d.value)} `;
  });
  if (current) segments.push(current);
  return (
    <Frame title={title} subtitle={subtitle} data={data} unit={unit}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${title}. ${subtitle}`}>
        <Axes max={100} ticks={[0, 50, 100]} suffix="%" />
        {segments.map((s, i) => <path key={i} d={s} fill="none" stroke="var(--chart)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />)}
        {data.map((d, i) => (
          <g key={d.title} tabIndex={d.value === null ? -1 : 0} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} aria-label={d.value === null ? `${d.title}: tidak berlatih` : `${d.title}: ${d.value}%`}>
            <rect x={PAD.l + slot * i} y={PAD.t} width={slot} height={H - PAD.t - PAD.b} fill="transparent" />
            {d.value !== null && <circle cx={x(i)} cy={y(d.value)} r={hover === i ? 6 : 4} fill="var(--chart)" stroke="var(--surface)" strokeWidth="2" />}
            {(i % 2 === data.length % 2 || data.length <= 7) && <text x={x(i)} y={H - 7} textAnchor="middle" fontSize="11" fill="var(--muted)">{d.label}</text>}
          </g>
        ))}
        <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} stroke="var(--muted)" strokeWidth="1" />
        {hover !== null && <Tooltip x={x(hover)} y={y(data[hover].value ?? 0)} text={data[hover].value === null ? `${data[hover].title}: tidak berlatih` : `${data[hover].title}: ${data[hover].value}${unit}`} />}
      </svg>
    </Frame>
  );
}

/** Horizontal mastery bar with the 85% unlock threshold marked. */
export function MasteryBar({ score, threshold = 85 }: { score: number; threshold?: number }) {
  return (
    <div className="relative h-3 w-full rounded-full bg-surface-2" role="img" aria-label={`Skor ${score}%, ambang ${threshold}%`}>
      <div className="h-full rounded-full" style={{ width: `${Math.max(2, score)}%`, background: 'var(--chart)' }} />
      <div className="absolute -top-1 h-5 w-0.5 bg-ink" style={{ left: `${threshold}%` }} aria-hidden />
    </div>
  );
}
