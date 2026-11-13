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

function Frame({ title, subtitle, data, unit, children }: { title: string; subtitle: string; data: Point[]; unit: string; children: ReactNode }) {
  const [table, setTable] = useState(false);
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div><h2 className="font-extrabold">{title}</h2><p className="text-sm text-muted">{subtitle}</p></div>
        <Button size="sm" variant="ghost" aria-pressed={table} onClick={() => setTable((t) => !t)}>{table ? 'Lihat grafik' : 'Lihat tabel'}</Button>
      </div>
      {table ? (
        <table className="mt-3 w-full text-left text-sm">
          <thead className="text-xs uppercase text-muted"><tr><th className="py-1.5">Hari</th><th className="py-1.5 text-right">{unit}</th></tr></thead>
          <tbody>{data.map((d) => <tr key={d.title} className="border-t border-line"><td className="py-1.5">{d.title}</td><td className="py-1.5 text-right font-bold">{d.value ?? '—'}</td></tr>)}</tbody>
        </table>
      ) : (
        <div className="mt-3">{children}</div>
      )}
    </Card>
  );
}

function Axes({ max, ticks, suffix = '' }: { max: number; ticks: number[]; suffix?: string }) {
  const y = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - v / max);
  return (
    <g>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth="1" />
          <text x={PAD.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">{t}{suffix}</text>
        </g>
      ))}
    </g>
  );
}

function Tooltip({ x, y, text }: { x: number; y: number; text: string }) {
  const w = text.length * 6.6 + 16;
  const tx = Math.min(Math.max(x - w / 2, PAD.l), W - PAD.r - w);
  return (
    <g pointerEvents="none">
      <rect x={tx} y={Math.max(0, y - 30)} width={w} height={22} rx={6} fill="var(--ink)" />
      <text x={tx + w / 2} y={Math.max(0, y - 30) + 15} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--bg)">{text}</text>
    </g>
  );
}

export function BarChart({ title, subtitle, data, unit }: { title: string; subtitle: string; data: Point[]; unit: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(1, ...data.map((d) => d.value ?? 0)));
  const slot = (W - PAD.l - PAD.r) / data.length;
  const bw = Math.min(26, slot - 2);
  const y = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - v / max);
  return (
    <Frame title={title} subtitle={subtitle} data={data} unit={unit}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${title}. ${subtitle}`}>
        <Axes max={max} ticks={[0, max / 2, max]} />
        {data.map((d, i) => {
          const v = d.value ?? 0;
          const x = PAD.l + slot * i + (slot - bw) / 2;
          const top = y(v);
          const h = H - PAD.b - top;
          return (
            <g key={d.title} tabIndex={0} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} aria-label={`${d.title}: ${v} ${unit}`}>
              <rect x={PAD.l + slot * i} y={PAD.t} width={slot} height={H - PAD.t - PAD.b} fill="transparent" />
              {v > 0 && <path d={`M${x} ${H - PAD.b} V${top + Math.min(4, h)} Q${x} ${top} ${x + Math.min(4, bw / 2)} ${top} H${x + bw - Math.min(4, bw / 2)} Q${x + bw} ${top} ${x + bw} ${top + Math.min(4, h)} V${H - PAD.b} Z`} fill="var(--chart)" opacity={hover === null || hover === i ? 1 : 0.55} />}
              {(i % 2 === data.length % 2 || data.length <= 7) && <text x={PAD.l + slot * i + slot / 2} y={H - 7} textAnchor="middle" fontSize="11" fill="var(--muted)">{d.label}</text>}
            </g>
          );
        })}
        <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} stroke="var(--muted)" strokeWidth="1" />
        {hover !== null && <Tooltip x={PAD.l + slot * hover + slot / 2} y={y(data[hover].value ?? 0)} text={`${data[hover].title}: ${data[hover].value ?? 0} ${unit}`} />}
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
