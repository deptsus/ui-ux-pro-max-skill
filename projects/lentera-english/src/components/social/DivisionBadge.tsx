// League division emblem (Rilis 8): a shield in the division's colour with a
// flame that grows from Lilin (1) to Mercusuar (5).
import { division } from '@/lib/client/habits';

export function DivisionBadge({ n, size = 56, title }: { n: number; size?: number; title?: string }) {
  const d = division(n);
  const scale = 0.62 + Math.min(Math.max(n, 1), 5) * 0.08;
  const label = title ?? `Liga ${d.name}`;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label={label} className="shrink-0">
      <title>{label}</title>
      <path d="M24 3 41 9.5v13.2c0 10.4-7.1 18.6-17 22.3C14.1 41.3 7 33.1 7 22.7V9.5Z" fill={d.color} />
      <path d="M24 6.4 38 11.8v10.9c0 8.7-5.8 15.6-14 18.9-8.2-3.3-14-10.2-14-18.9V11.8Z" fill="none" stroke={d.glow} strokeOpacity="0.55" strokeWidth="1.4" />
      <g transform={`translate(24 25) scale(${scale}) translate(-24 -25)`}>
        <path d="M24 10c5.2 6.1 8.8 10.6 8.8 16a8.8 8.8 0 0 1-17.6 0c0-3.6 1.8-6.4 4.3-9.1.3 2.7 1.6 4.4 3.3 5.1-.6-4.2-.1-8.3 1.2-12Z" fill={d.glow} />
        <path d="M24 21.5c2.2 2.6 3.7 4.5 3.7 6.8a3.7 3.7 0 0 1-7.4 0c0-2.3 1.5-4.2 3.7-6.8Z" fill="#fff" />
      </g>
      {Array.from({ length: Math.min(Math.max(n, 1), 5) }, (_, i) => (
        <circle key={i} cx={24 + (i - (Math.min(Math.max(n, 1), 5) - 1) / 2) * 3.3} cy={38.4} r={1.15} fill="#fff" fillOpacity="0.9" />
      ))}
    </svg>
  );
}
