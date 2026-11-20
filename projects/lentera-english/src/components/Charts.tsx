'use client';
// Small single-series charts (inline SVG). One measure per chart, one hue,
// hover/focus tooltips, recessive grid, and a table view for every chart.
// Redesign 2026: the SVG is drawn at the container's real width, so axis labels stay
// 12 px on a phone instead of shrinking with a fixed viewBox (and "100%" is never clipped).
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button, Card } from './ui';

export interface Point { label: string; title: string; value: number | null }

const H = 180;
const PAD = { l: 42, r: 8, t: 14, b: 26 };
const FONT = 12;

/** The width of the chart's box in CSS pixels. */
function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(320);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(240, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}
const niceMax = (v: number) => { const step = v <= 10 ? 5 : v <= 50 ? 10 : v <= 100 ? 25 : v <= 500 ? 100 : 250; return Math.max(step, Math.ceil(v / step) * step); };
/** Axis maximum for large values (money): 1, 2, 4, 6, 8 or 10 times a power of ten, so the half tick stays short. */
const niceMagnitude = (v: number) => { const pow = 10 ** Math.floor(Math.log10(Math.max(v, 1))); return [1, 2, 4, 6, 8, 10].find((m) => m * pow >= v)! * pow; };

function Frame({ title, subtitle, data, unit, column = 'Hari', format, insight, children }: { title: string; subtitle: string; data: Point[]; unit: string; column?: string; format?: (v: number) => string; insight?: ReactNode; children: (width: number) => ReactNode }) {
  const [table, setTable] = useState(false);
  const [ref, width] = useWidth();
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1"><h2 className="font-extrabold">{title}</h2><p className="text-sm text-muted">{subtitle}</p></div>
        <Button size="sm" variant="ghost" aria-pressed={table} onClick={() => setTable((t) => !t)}>{table ? 'Lihat grafik' : 'Lihat tabel'}</Button>
      </div>
      {table ? (
        <table className="mt-3 w-full text-left text-sm">
          <thead className="text-xs font-bold text-muted"><tr><th className="py-1.5">{column}</th><th className="py-1.5 text-right">{unit}</th></tr></thead>
          <tbody>{data.map((d) => <tr key={d.title} className="border-t border-line"><td className="py-1.5">{d.title}</td><td className="py-1.5 text-right font-bold">{d.value === null ? '—' : format ? format(d.value) : d.value}</td></tr>)}</tbody>
        </table>
      ) : (
        <div ref={ref} className="mt-3">{children(width)}</div>
      )}
      {insight && <p className="mt-3 rounded-xl bg-brand-soft px-3 py-2 text-sm text-brand-ink">{insight}</p>}
    </Card>
  );
}

function Axes({ W, max, ticks, suffix = '', format, left = PAD.l }: { W: number; max: number; ticks: number[]; suffix?: string; format?: (v: number) => string; left?: number }) {
  const y = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - v / max);
  return (
    <g>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={left} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth="1" />
          <text x={left - 6} y={y(t) + 4} textAnchor="end" fontSize={FONT} fill="var(--muted)">{format ? format(t) : t}{suffix}</text>
        </g>
      ))}
    </g>
  );
}

function Tooltip({ W, x, y, text, left = PAD.l }: { W: number; x: number; y: number; text: string; left?: number }) {
  const w = Math.min(W - left - PAD.r, text.length * 6.8 + 16);
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
export function BarChart({ title, subtitle, data, unit, column, format, insight }: { title: string; subtitle: string; data: Point[]; unit: string; column?: string; format?: { axis: (v: number) => string; value: (v: number) => string }; insight?: ReactNode }) {
  const [hover, setHover] = useState<number | null>(null);
  const peak = Math.max(1, ...data.map((d) => d.value ?? 0));
  const max = format ? niceMagnitude(peak) : niceMax(peak);
  const say = (v: number) => (format ? format.value(v) : `${v} ${unit}`);
  // Compact money labels ("600rb", "1,5jt") need a wider gutter than day counts.
  const L = format ? 52 : PAD.l;
  const y = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - v / max);
  return (
    <Frame title={title} subtitle={subtitle} data={data} unit={unit} column={column} format={format?.value} insight={insight}>
      {(W) => {
      const slot = (W - L - PAD.r) / data.length;
      const bw = Math.min(26, slot - 2);
      // Labels need about 30 px each; thin them out on narrow screens.
      const every = Math.max(1, Math.ceil(30 / slot));
      return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block" role="img" aria-label={`${title}. ${subtitle}`}>
        <Axes W={W} max={max} ticks={[0, max / 2, max]} format={format?.axis} left={L} />
        {data.map((d, i) => {
          const v = d.value ?? 0;
          const x = L + slot * i + (slot - bw) / 2;
          const top = y(v);
          const h = H - PAD.b - top;
          return (
            <g key={d.title} tabIndex={0} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} aria-label={`${d.title}: ${say(v)}`}>
              <rect x={L + slot * i} y={PAD.t} width={slot} height={H - PAD.t - PAD.b} fill="transparent" />
              {v > 0 && <path d={`M${x} ${H - PAD.b} V${top + Math.min(4, h)} Q${x} ${top} ${x + Math.min(4, bw / 2)} ${top} H${x + bw - Math.min(4, bw / 2)} Q${x + bw} ${top} ${x + bw} ${top + Math.min(4, h)} V${H - PAD.b} Z`} fill="var(--chart)" opacity={hover === null || hover === i ? 1 : 0.55} />}
              {(data.length - 1 - i) % every === 0 && <text x={L + slot * i + slot / 2} y={H - 8} textAnchor="middle" fontSize={FONT} fill="var(--muted)">{d.label}</text>}
            </g>
          );
        })}
        <line x1={L} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} stroke="var(--muted)" strokeWidth="1" />
        {hover !== null && <Tooltip W={W} left={L} x={L + slot * hover + slot / 2} y={y(data[hover].value ?? 0)} text={`${data[hover].title}: ${say(data[hover].value ?? 0)}`} />}
      </svg>
      );
      }}
    </Frame>
  );
}

export function LineChart({ title, subtitle, data, unit, insight }: { title: string; subtitle: string; data: Point[]; unit: string; insight?: ReactNode }) {
  const [hover, setHover] = useState<number | null>(null);
  const y = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - v / 100);
  return (
    <Frame title={title} subtitle={subtitle} data={data} unit={unit} insight={insight}>
      {(W) => {
      const slot = (W - PAD.l - PAD.r) / data.length;
      const x = (i: number) => PAD.l + slot * i + slot / 2;
      const every = Math.max(1, Math.ceil(30 / slot));
      // Days without practice are gaps, not zeros.
      const segments: string[] = [];
      let current = '';
      data.forEach((d, i) => {
        if (d.value === null) { if (current) segments.push(current); current = ''; return; }
        current += `${current ? 'L' : 'M'}${x(i)} ${y(d.value)} `;
      });
      if (current) segments.push(current);
      return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block" role="img" aria-label={`${title}. ${subtitle}`}>
        <Axes W={W} max={100} ticks={[0, 50, 100]} suffix="%" />
        {segments.map((s, i) => <path key={i} d={s} fill="none" stroke="var(--chart)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />)}
        {data.map((d, i) => (
          <g key={d.title} tabIndex={d.value === null ? -1 : 0} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} aria-label={d.value === null ? `${d.title}: tidak berlatih` : `${d.title}: ${d.value}%`}>
            <rect x={PAD.l + slot * i} y={PAD.t} width={slot} height={H - PAD.t - PAD.b} fill="transparent" />
            {d.value !== null && <circle cx={x(i)} cy={y(d.value)} r={hover === i ? 6 : 4} fill="var(--chart)" stroke="var(--surface)" strokeWidth="2" />}
            {(data.length - 1 - i) % every === 0 && <text x={x(i)} y={H - 8} textAnchor="middle" fontSize={FONT} fill="var(--muted)">{d.label}</text>}
          </g>
        ))}
        <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} stroke="var(--muted)" strokeWidth="1" />
        {hover !== null && <Tooltip W={W} x={x(hover)} y={y(data[hover].value ?? 0)} text={data[hover].value === null ? `${data[hover].title}: tidak berlatih` : `${data[hover].title}: ${data[hover].value}${unit}`} />}
      </svg>
      );
      }}
    </Frame>
  );
}

/** Horizontal mastery bar with the 85% unlock threshold marked. */
export function MasteryBar({ score, threshold = 85 }: { score: number; threshold?: number }) {
  return (
    <div className="relative h-3 w-full rounded-full bg-surface-2 dark:bg-line" role="img" aria-label={`Skor ${score}%, ambang ${threshold}%`}>
      <div className="h-full rounded-full" style={{ width: `${Math.max(2, score)}%`, background: 'var(--chart)' }} />
      <div className="absolute -top-1 h-5 w-0.5 bg-ink" style={{ left: `${threshold}%` }} aria-hidden />
    </div>
  );
}
