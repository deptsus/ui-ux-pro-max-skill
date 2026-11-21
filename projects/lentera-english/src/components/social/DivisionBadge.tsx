'use client';
// Rank emblem (Liga Rank, migration 0022): a shield in the rank's colour with a
// flame that grows from Lilin (1) to Mercusuar (5) and comes alive with each
// rank. Lilin's flame is still; Pelita flickers; Obor sways, glows and throws
// embers; Lentera adds side tongues, more embers and a shine across the shield;
// Mercusuar adds a turning lighthouse beam, pulsing rings and twinkling stars.
// The motion is CSS (globals.css, "rk-"), stops for prefers-reduced-motion, and
// the extra effects (embers, beam, rings, stars) appear from 44 px, or at any size with
// `effects` (the Semua board, 21 Nov 2026: the owner wants the same motion there).
// Elements that animate a transform carry no transform attribute of their own
// (a CSS transform would replace it): they sit in a positioned <g>.
import { useId } from 'react';
import { division } from '@/lib/client/habits';
import { cx } from '@/components/ui';

const OUTER = 'M24 10c5.2 6.1 8.8 10.6 8.8 16a8.8 8.8 0 0 1-17.6 0c0-3.6 1.8-6.4 4.3-9.1.3 2.7 1.6 4.4 3.3 5.1-.6-4.2-.1-8.3 1.2-12Z';
const MID = 'M24 17.5c3.64 4.27 6.16 7.42 6.16 11.2a6.16 6.16 0 0 1-12.32 0c0-2.52 1.26-4.48 3.01-6.37.21 1.89 1.12 3.08 2.31 3.57-.42-2.94-.07-5.81.84-8.4Z';
const CORE = 'M24 23c1.9 2.3 3.2 3.9 3.2 5.9a3.2 3.2 0 0 1-6.4 0c0-2 1.3-3.6 3.2-5.9Z';
const SIDE = 'M0 0c1.8 2.1 3 3.7 3 5.6a3 3 0 0 1-6 0c0-1.9 1.2-3.5 3-5.6Z';
const SHIELD = 'M24 3 41 9.5v13.2c0 10.4-7.1 18.6-17 22.3C14.1 41.3 7 33.1 7 22.7V9.5Z';
const STAR = 'M0-2.6.7-.7 2.6 0 .7.7 0 2.6-.7.7-2.6 0-.7-.7Z';
const EMBERS = [[21.5, 15, -3], [26.5, 14, 3], [23, 12, -1.5], [28, 17, 4], [19.5, 18, -4], [25, 11, 2]] as const;
const STARS = [[5, 9], [43.5, 7], [3.5, 33], [45, 31]] as const;

/** `decorative`: the rank name is already written next to it, so screen readers skip the picture. */
export function DivisionBadge({ n, size = 56, title, still = false, decorative = false, effects, className }: { n: number; size?: number; title?: string; still?: boolean; decorative?: boolean; effects?: boolean; className?: string }) {
  const raw = useId();
  const id = raw.replace(/[^a-zA-Z0-9_-]/g, '');
  const tier = Math.min(Math.max(n, 1), 5);
  const d = division(tier);
  const [outer, mid, core] = d.flame;
  const scale = 0.62 + tier * 0.08;
  const fx = !still && (effects ?? size >= 44);
  const label = title ?? `Rank ${d.name}`;
  const embers = fx ? EMBERS.slice(0, tier === 3 ? 2 : tier === 4 ? 4 : tier === 5 ? 6 : 0) : [];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : label} aria-hidden={decorative || undefined}
      className={cx('rank-badge shrink-0 overflow-visible', `rank-${tier}`, still && 'rank-still', className)}>
      {!decorative && <title>{label}</title>}
      {fx && tier === 5 && (
        <>
          <defs>
            <radialGradient id={`${id}-ray`} cx="24" cy="24" r="31" gradientUnits="userSpaceOnUse">
              <stop offset="0.35" stopColor="#ffe08a" stopOpacity="0.85" />
              <stop offset="1" stopColor="#ffe08a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g className="rk-rays" fill={`url(#${id}-ray)`}>
            {Array.from({ length: 10 }, (_, i) => {
              const a = (i * 36 * Math.PI) / 180;
              const w = 0.075;
              const p = (t: number) => `${(24 + 31 * Math.cos(t)).toFixed(2)} ${(24 + 31 * Math.sin(t)).toFixed(2)}`;
              return <path key={i} d={`M24 24L${p(a - w)}L${p(a + w)}Z`} />;
            })}
          </g>
          <circle className="rk-aura" cx="24" cy="24" r="21" fill="none" stroke={d.glow} strokeWidth="1.6" />
          <circle className="rk-aura rk-aura-late" cx="24" cy="24" r="21" fill="none" stroke="#ffe08a" strokeWidth="1.2" />
        </>
      )}
      <path d={SHIELD} fill={d.color} stroke={tier === 5 ? '#ffd36b' : undefined} strokeWidth={tier === 5 ? 1.3 : undefined} />
      {/* Left half lit: the 2.5D bevel the app's cast uses. */}
      <path d="M24 3 7 9.5v13.2c0 10.4 7.1 18.6 17 22.3Z" fill="#fff" fillOpacity="0.13" />
      <path d="M24 6.4 38 11.8v10.9c0 8.7-5.8 15.6-14 18.9-8.2-3.3-14-10.2-14-18.9V11.8Z" fill="none" stroke={d.glow} strokeOpacity="0.55" strokeWidth="1.4" />
      {fx && tier >= 4 && (
        <>
          <clipPath id={`${id}-clip`}><path d={SHIELD} /></clipPath>
          <g clipPath={`url(#${id}-clip)`}>
            <g transform="rotate(22 24 24)"><rect className="rk-shine" x="-6" y="-8" width="6" height="64" fill="#fff" fillOpacity="0.32" /></g>
          </g>
        </>
      )}
      <g transform={`translate(24 25) scale(${scale}) translate(-24 -25)`}>
        {fx && tier >= 3 && <circle className="rk-halo" cx="24" cy="26" r="11.5" fill={outer} fillOpacity="0.45" />}
        <g className="rk-flame">
          {tier >= 4 && fx && (
            <>
              <g transform="translate(17 23)"><path className="rk-side" d={SIDE} fill={outer} /></g>
              <g transform="translate(31 23)"><path className="rk-side rk-side-late" d={SIDE} fill={outer} /></g>
            </>
          )}
          <path className="rk-tongue" d={OUTER} fill={outer} />
          <path d={MID} fill={mid} />
          <path className={tier >= 4 && fx ? 'rk-core' : undefined} d={CORE} fill={core} />
        </g>
        {embers.map(([x, y, dx], i) => (
          <circle key={i} className="rk-ember" cx={x} cy={y} r={i % 2 ? 0.9 : 1.2} fill={i % 3 === 2 ? '#fff' : mid}
            style={{ animationDelay: `${(i * 0.37).toFixed(2)}s`, ['--dx' as string]: `${dx}px` }} />
        ))}
      </g>
      {fx && tier === 5 && STARS.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}><path className="rk-star" d={STAR} fill="#ffe08a" style={{ animationDelay: `${(i * 0.4).toFixed(1)}s` }} /></g>
      ))}
      {Array.from({ length: tier }, (_, i) => (
        <circle key={i} cx={24 + (i - (tier - 1) / 2) * 3.3} cy={38.4} r={1.15} fill="#fff" fillOpacity="0.9" />
      ))}
    </svg>
  );
}
