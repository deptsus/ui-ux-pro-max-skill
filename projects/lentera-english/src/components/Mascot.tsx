// Pijar, the Lentera firefly. Original mascot drawn as inline SVG and
// animated with CSS only (see the .pijar rules in globals.css), so it costs no
// extra JavaScript and stands still when the device asks for reduced motion.
export type Mood = 'happy' | 'cheer' | 'think' | 'sad' | 'encourage' | 'sleep' | 'dance';

const INK = '#1e1b3a';

/** Pijar's body in a 96×96 box, without the surrounding <svg>, so stories can place it in a scene. */
export function PijarFigure({ mood = 'happy', still = false }: { mood?: Mood; still?: boolean }) {
  const raised = mood === 'cheer' || mood === 'dance';
  const mouth = {
    happy: <path d="M41 50 Q48 57 55 50" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />,
    cheer: <path d="M40 48 Q48 62 56 48 Z" fill={INK} />,
    dance: <path d="M40 48 Q48 62 56 48 Z" fill={INK} />,
    encourage: <path d="M41 49 Q48 58 55 49 Z" fill={INK} />,
    think: <path d="M43 52 H53" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />,
    sad: <path d="M41 54 Q48 48 55 54" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />,
    sleep: <ellipse cx="48" cy="52" rx="2.6" ry="2" fill={INK} />,
  }[mood];
  const eyes = mood === 'think' ? (
    <>
      <circle cx="42" cy="41" r="3" fill={INK} />
      <circle cx="55" cy="39" r="3" fill={INK} />
    </>
  ) : raised ? (
    <path d="M38 42 Q41.5 37 45 42 M51 42 Q54.5 37 58 42" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
  ) : mood === 'sleep' ? (
    <path d="M38 41 Q41.5 45 45 41 M51 41 Q54.5 45 58 41" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
  ) : (
    <>
      <circle cx="42" cy="42" r="3" fill={INK} />
      <circle cx="54" cy="42" r="3" fill={INK} />
      <circle cx="43" cy="41" r="1" fill="#fff" />
      <circle cx="55" cy="41" r="1" fill="#fff" />
    </>
  );
  return (
    <g className={`pijar pijar-${mood}${still ? ' pijar-still' : ''}`}>
      <g className="pj-float">
        <circle cx="48" cy="72" r="24" fill="url(#pj-glow)" className="pj-glow" />
        {/* wings */}
        <g className="pj-wing pj-wing-l"><ellipse cx="24" cy="38" rx="15" ry="9" fill="#c7d2fe" opacity="0.85" transform={raised ? 'rotate(-38 24 38)' : 'rotate(-18 24 38)'} /></g>
        <g className="pj-wing pj-wing-r"><ellipse cx="72" cy="38" rx="15" ry="9" fill="#c7d2fe" opacity="0.85" transform={raised ? 'rotate(38 72 38)' : 'rotate(18 72 38)'} /></g>
        {/* lantern tail */}
        <ellipse cx="48" cy="72" rx="13" ry="12" fill="#fbbf24" />
        <path d="M37 70 H59 M39 76 H57" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
        {/* body */}
        <circle cx="48" cy="42" r="23" fill="url(#pj-body)" />
        {/* antennae */}
        <path d="M40 22 Q36 10 30 9 M56 22 Q60 10 66 9" fill="none" stroke="#4b3fd6" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="30" cy="9" r="3" fill="#fbbf24" />
        <circle cx="66" cy="9" r="3" fill="#fbbf24" />
        {/* face */}
        <ellipse cx="48" cy="45" rx="16" ry="14" fill="#fef3c7" />
        {mood === 'encourage' && <path d="M38 35 L45 36.5 M58 35 L51 36.5" stroke={INK} strokeWidth="2" strokeLinecap="round" />}
        <g className="pj-eyes">{eyes}</g>
        {mouth}
        <circle cx="36" cy="49" r="3" fill="#fda4af" opacity="0.7" />
        <circle cx="60" cy="49" r="3" fill="#fda4af" opacity="0.7" />
      </g>
      {raised && (
        <g fill="#fbbf24">
          <path className="pj-spark" d="M12 20 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" />
          <path className="pj-spark" d="M84 16 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6 z" />
          <path className="pj-spark" d="M86 62 l1.4 3.4 3.4 1.4 -3.4 1.4 -1.4 3.4 -1.4 -3.4 -3.4 -1.4 3.4 -1.4 z" />
        </g>
      )}
      {mood === 'sleep' && (
        <g fill="#6d5ff0" fontWeight="800" fontFamily="inherit">
          <text className="pj-z" x="70" y="24" fontSize="10">z</text>
          <text className="pj-z" x="78" y="14" fontSize="13">z</text>
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
      <linearGradient id="pj-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6d5ff0" />
        <stop offset="100%" stopColor="#4b3fd6" />
      </linearGradient>
    </defs>
  );
}

const MOOD_LABEL: Record<Mood, string> = {
  happy: 'tersenyum', cheer: 'melompat gembira', think: 'sedang berpikir', sad: 'sedih', encourage: 'menyemangatimu', sleep: 'tertidur', dance: 'menari',
};

export function Mascot({ mood = 'happy', size = 96, className, decorative = false, still = false }: { mood?: Mood; size?: number; className?: string; decorative?: boolean; still?: boolean }) {
  return (
    <svg viewBox="0 0 96 96" width={size} height={size} className={className} overflow="visible" {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': `Pijar, maskot kunang-kunang Lentera, ${MOOD_LABEL[mood]}` })} data-mood={mood}>
      <PijarDefs />
      <PijarFigure mood={mood} still={still} />
    </svg>
  );
}

/** `compact`: on phones narrower than 420 px only the mark shows (the name stays for screen readers). */
export function Logo({ size = 28, compact = false }: { size?: number; compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 font-extrabold tracking-tight">
      <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden>
        <rect width="32" height="32" rx="9" fill="#4b3fd6" />
        <path d="M16 5 L21 10 V19 A5 5 0 0 1 11 19 V10 Z" fill="#fbbf24" />
        <path d="M13 13 H19 M13 17 H19" stroke="#b45309" strokeWidth="1.6" strokeLinecap="round" />
        <rect x="12" y="24" width="8" height="3" rx="1.5" fill="#c7d2fe" />
      </svg>
      <span className={compact ? 'sr-only min-[420px]:not-sr-only' : undefined}>
        Lentera <span className="text-brand">English</span>
      </span>
    </span>
  );
}
