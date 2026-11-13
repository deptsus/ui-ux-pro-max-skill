// Pijar, the Lentera firefly. Original mascot drawn as inline SVG.
export type Mood = 'happy' | 'cheer' | 'think' | 'sad';

export function Mascot({ mood = 'happy', size = 96, className }: { mood?: Mood; size?: number; className?: string }) {
  const mouth = {
    happy: <path d="M41 50 Q48 57 55 50" fill="none" stroke="#1e1b3a" strokeWidth="2.5" strokeLinecap="round" />,
    cheer: <path d="M40 48 Q48 62 56 48 Z" fill="#1e1b3a" />,
    think: <path d="M43 52 H53" fill="none" stroke="#1e1b3a" strokeWidth="2.5" strokeLinecap="round" />,
    sad: <path d="M41 54 Q48 48 55 54" fill="none" stroke="#1e1b3a" strokeWidth="2.5" strokeLinecap="round" />,
  }[mood];
  return (
    <svg viewBox="0 0 96 96" width={size} height={size} className={className} role="img" aria-label="Pijar, maskot kunang-kunang Lentera">
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
      <circle cx="48" cy="72" r="24" fill="url(#pj-glow)" className="animate-glow" />
      {/* wings */}
      <ellipse cx="24" cy="38" rx="15" ry="9" fill="#c7d2fe" opacity="0.85" transform={mood === 'cheer' ? 'rotate(-38 24 38)' : 'rotate(-18 24 38)'} />
      <ellipse cx="72" cy="38" rx="15" ry="9" fill="#c7d2fe" opacity="0.85" transform={mood === 'cheer' ? 'rotate(38 72 38)' : 'rotate(18 72 38)'} />
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
      {mood === 'think' ? (
        <>
          <circle cx="42" cy="41" r="3" fill="#1e1b3a" />
          <circle cx="55" cy="39" r="3" fill="#1e1b3a" />
        </>
      ) : mood === 'cheer' ? (
        <path d="M38 42 Q41.5 37 45 42 M51 42 Q54.5 37 58 42" fill="none" stroke="#1e1b3a" strokeWidth="2.5" strokeLinecap="round" />
      ) : (
        <>
          <circle cx="42" cy="42" r="3" fill="#1e1b3a" />
          <circle cx="54" cy="42" r="3" fill="#1e1b3a" />
          <circle cx="43" cy="41" r="1" fill="#fff" />
          <circle cx="55" cy="41" r="1" fill="#fff" />
        </>
      )}
      {mouth}
      <circle cx="36" cy="49" r="3" fill="#fda4af" opacity="0.7" />
      <circle cx="60" cy="49" r="3" fill="#fda4af" opacity="0.7" />
    </svg>
  );
}

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2 font-extrabold tracking-tight">
      <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden>
        <rect width="32" height="32" rx="9" fill="#4b3fd6" />
        <path d="M16 5 L21 10 V19 A5 5 0 0 1 11 19 V10 Z" fill="#fbbf24" />
        <path d="M13 13 H19 M13 17 H19" stroke="#b45309" strokeWidth="1.6" strokeLinecap="round" />
        <rect x="12" y="24" width="8" height="3" rx="1.5" fill="#c7d2fe" />
      </svg>
      <span>
        Lentera <span className="text-brand">English</span>
      </span>
    </span>
  );
}
