// Pijar, the Lentera firefly (2.5D redraw, Rilis 14): thick ink outlines, soft
// clay shading and highlights, and 14 expressions shared with the rest of the
// cast (src/components/cast/Face.tsx). Inline SVG animated with CSS only (the
// .pijar rules in globals.css): no extra JavaScript, still under reduced motion.
import { useId } from 'react';
import { Face, INK, MOOD_LABEL, type Mood } from './cast/Face';

export type { Mood };

/** Pijar's body in a 96×96 box, without the surrounding <svg>, so stories can place it in a scene. Needs <PijarDefs />. */
export function PijarFigure({ mood = 'happy', still = false }: { mood?: Mood; still?: boolean }) {
  const raised = mood === 'cheer' || mood === 'dance' || mood === 'laugh' || mood === 'love' || mood === 'proud';
  const droop = mood === 'sad' || mood === 'sleep' || mood === 'worried';
  return (
    <g className={`pijar pijar-${mood}${still ? ' pijar-still' : ''}`}>
      <ellipse className="pj-shadow" cx="48" cy="93" rx="17" ry="3" fill={INK} opacity="0.14" />
      <g className="pj-float">
        <circle cx="48" cy="72" r="26" fill="url(#pj-glow)" className="pj-glow" />
        {/* wings, behind the body */}
        <g className="pj-wing pj-wing-l">
          <path d="M30 34 C14 18 2 30 8 40 C12 47 24 46 31 40 Z" fill="url(#pj-wing)" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" transform={raised ? 'rotate(-22 30 38)' : droop ? 'rotate(14 30 38)' : undefined} />
        </g>
        <g className="pj-wing pj-wing-r">
          <path d="M66 34 C82 18 94 30 88 40 C84 47 72 46 65 40 Z" fill="url(#pj-wing)" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" transform={raised ? 'rotate(22 66 38)' : droop ? 'rotate(-14 66 38)' : undefined} />
        </g>
        {/* lantern tail */}
        <ellipse cx="48" cy="73" rx="14" ry="12.5" fill="url(#pj-tail)" stroke={INK} strokeWidth="2.6" />
        <path d="M36.5 70 Q48 74 59.5 70 M37.5 77 Q48 81 58.5 77" fill="none" stroke="#c2410c" strokeWidth="1.8" strokeLinecap="round" opacity="0.55" />
        <ellipse cx="42" cy="67.5" rx="4" ry="2.4" fill="#fff" opacity="0.65" transform="rotate(-20 42 67.5)" />
        {/* antennae */}
        <path d={droop ? 'M40 22 Q34 14 26 16 M56 22 Q62 14 70 16' : 'M40 22 Q36 10 29 8 M56 22 Q60 10 67 8'} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <g className="pj-tips">
          <circle cx={droop ? 26 : 29} cy={droop ? 16 : 8} r="3.6" fill="#fcd34d" stroke={INK} strokeWidth="2" />
          <circle cx={droop ? 70 : 67} cy={droop ? 16 : 8} r="3.6" fill="#fcd34d" stroke={INK} strokeWidth="2" />
        </g>
        {/* body: clay sphere with a soft lower shade and a glossy highlight */}
        <circle cx="48" cy="42" r="24" fill="url(#pj-body)" stroke={INK} strokeWidth="3" />
        <path d="M27.5 50 A22 22 0 0 0 68.5 50 A26 22 0 0 1 27.5 50 Z" fill="#2a1f9a" opacity="0.3" />
        <ellipse cx="36" cy="27" rx="7.5" ry="4.2" fill="#fff" opacity="0.5" transform="rotate(-32 36 27)" />
        <circle cx="45.5" cy="22.5" r="1.7" fill="#fff" opacity="0.85" />
        {/* face plate */}
        <ellipse cx="48" cy="46.5" rx="17.5" ry="15.5" fill="url(#pj-face)" stroke={INK} strokeWidth="1.6" strokeOpacity="0.35" />
        <Face mood={mood} cx={48} cy={46.5} gap={7.2} />
      </g>
      {(mood === 'cheer' || mood === 'dance') && (
        <g fill="#fde047" stroke={INK} strokeWidth="1.1" strokeLinejoin="round">
          <path className="pj-spark" d="M10 18 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" />
          <path className="pj-spark" d="M85 14 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6 z" />
          <path className="pj-spark" d="M88 60 l1.4 3.4 3.4 1.4 -3.4 1.4 -1.4 3.4 -1.4 -3.4 -3.4 -1.4 3.4 -1.4 z" />
        </g>
      )}
    </g>
  );
}

/** Gradients Pijar needs; include once in any <svg> that draws PijarFigure. */
export function PijarDefs() {
  return (
    <defs>
      <radialGradient id="pj-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fde68a" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="pj-body" cx="34%" cy="28%" r="78%">
        <stop offset="0%" stopColor="#a99fff" />
        <stop offset="45%" stopColor="#6d5ff0" />
        <stop offset="100%" stopColor="#4034c4" />
      </radialGradient>
      <radialGradient id="pj-tail" cx="38%" cy="32%" r="75%">
        <stop offset="0%" stopColor="#fff3bf" />
        <stop offset="50%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#e07a0b" />
      </radialGradient>
      <linearGradient id="pj-wing" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f5f3ff" />
        <stop offset="100%" stopColor="#c4c9fb" />
      </linearGradient>
      <radialGradient id="pj-face" cx="45%" cy="35%" r="70%">
        <stop offset="0%" stopColor="#fffbf0" />
        <stop offset="100%" stopColor="#fde9c4" />
      </radialGradient>
    </defs>
  );
}

export function Mascot({ mood = 'happy', size = 96, className, decorative = false, still = false }: { mood?: Mood; size?: number; className?: string; decorative?: boolean; still?: boolean }) {
  return (
    <svg viewBox="0 0 96 96" width={size} height={size} className={className} overflow="visible" {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': `Pijar, maskot kunang-kunang Lentera, ${MOOD_LABEL[mood]}` })} data-mood={mood}>
      <PijarDefs />
      <PijarFigure mood={mood} still={still} />
    </svg>
  );
}

/** Lentera's mark: a lantern with a glowing flame (the light that guides learning). */
export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className} aria-hidden>
      <defs>
        <linearGradient id={`lb-${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#6355f0" /><stop offset="1" stopColor="#3a2db5" /></linearGradient>
        <linearGradient id={`lf-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fde68a" /><stop offset="1" stopColor="#f97316" /></linearGradient>
        <radialGradient id={`lg-${id}`}><stop offset="0" stopColor="#fde68a" stopOpacity="0.6" /><stop offset="1" stopColor="#fde68a" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill={`url(#lb-${id})`} />
      <circle cx="24" cy="27.5" r="13.5" fill={`url(#lg-${id})`} />
      <path d="M19.2 11 A4.8 4.8 0 0 1 28.8 11" fill="none" stroke="#eef0ff" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M14.2 13.2 H33.8 L31 17.4 H17 Z" fill="#eef0ff" />
      <rect x="14.6" y="17.4" width="18.8" height="18.6" rx="5" fill="#fff" fillOpacity="0.14" stroke="#eef0ff" strokeWidth="2.8" />
      <path d="M24 19.8 C27.8 23.8 29.4 26.4 29.4 28.6 A5.4 5.4 0 0 1 18.6 28.6 C18.6 26.4 20.2 23.8 24 19.8 Z" fill={`url(#lf-${id})`} />
      <path d="M24 25 C25.5 26.6 26.2 27.7 26.2 28.7 A2.2 2.2 0 0 1 21.8 28.7 C21.8 27.7 22.5 26.6 24 25 Z" fill="#fff4cc" />
      <path d="M16.8 36 H31.2 L29.1 39.8 H18.9 Z" fill="#eef0ff" />
    </svg>
  );
}

/** `compact`: on phones narrower than 420 px only the mark shows (the name stays for screen readers). */
export function Logo({ size = 28, compact = false }: { size?: number; compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 tracking-tight">
      <LogoMark size={size} className="shrink-0" />
      <span className={compact ? 'sr-only min-[420px]:not-sr-only' : undefined}>
        <span className="font-extrabold text-ink">Lentera</span> <span className="font-semibold text-brand">English</span>
      </span>
    </span>
  );
}
