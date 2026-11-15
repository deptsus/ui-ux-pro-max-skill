// Profile avatars: eight cartoon characters drawn in the same flat style as
// Pijar and the story cast (round shapes, ink-coloured faces, pink cheeks).
// The index stored in the learner's profile (0–7) picks the character, so
// every existing profile keeps a valid avatar.
import { useId, type ReactNode } from 'react';

const INK = '#1e1b3a';
export const PINK = '#E89EB8';

export interface AvatarDef { id: string; name: string; label: string; bg: string }

export const AVATARS: AvatarDef[] = [
  { id: 'pijar', name: 'Pijar', label: 'kunang-kunang maskot Lentera', bg: '#e8e6fb' },
  { id: 'oyen', name: 'Oyen', label: 'kucing oren', bg: '#fef3c7' },
  { id: 'bubo', name: 'Bubo', label: 'burung hantu', bg: '#cffafe' },
  { id: 'momo', name: 'Momo', label: 'kelinci merah muda', bg: '#fdf2f8' },
  { id: 'komo', name: 'Komo', label: 'komodo', bg: '#dcfce7' },
  { id: 'utan', name: 'Utan', label: 'orangutan', bg: '#ffedd5' },
  { id: 'nisa', name: 'Nisa', label: 'anak perempuan berhijab', bg: '#ccfbf1' },
  { id: 'dimas', name: 'Dimas', label: 'anak laki-laki berkacamata', bg: '#e0f2fe' },
];

const eye = (x: number, y: number, r = 2.3) => (
  <>
    <circle cx={x} cy={y} r={r} fill={INK} />
    <circle cx={x + r * 0.35} cy={y - r * 0.35} r={r * 0.38} fill="#fff" />
  </>
);
const cheeks = (y: number, dx: number, color = '#fda4af', r = 2.1) => (
  <>
    <circle cx={32 - dx} cy={y} r={r} fill={color} opacity="0.7" />
    <circle cx={32 + dx} cy={y} r={r} fill={color} opacity="0.7" />
  </>
);

const ART: Record<string, ReactNode> = {
  pijar: (
    <>
      <ellipse cx="14" cy="23" rx="9.5" ry="5.5" fill="#c7d2fe" transform="rotate(-22 14 23)" />
      <ellipse cx="50" cy="23" rx="9.5" ry="5.5" fill="#c7d2fe" transform="rotate(22 50 23)" />
      <ellipse cx="32" cy="58" rx="12" ry="10" fill="#fbbf24" />
      <path d="M22.5 56 H41.5 M24 61 H40" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M26 15.5 Q23 7 18.5 5.5 M38 15.5 Q41 7 45.5 5.5" fill="none" stroke="#4b3fd6" strokeWidth="2" strokeLinecap="round" />
      <circle cx="18.5" cy="5.5" r="2.4" fill="#fbbf24" />
      <circle cx="45.5" cy="5.5" r="2.4" fill="#fbbf24" />
      <circle cx="32" cy="31" r="17" fill="#5b4fe0" />
      <ellipse cx="32" cy="33.5" rx="12.5" ry="10.5" fill="#fef3c7" />
      {eye(27.5, 31.5)}
      {eye(36.5, 31.5)}
      <path d="M28.5 36.5 Q32 40.5 35.5 36.5" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
      {cheeks(36, 8.8)}
    </>
  ),
  oyen: (
    <>
      <ellipse cx="32" cy="66" rx="21" ry="14" fill="#f59e0b" />
      <path d="M14.5 23 L18.5 5.5 L28.5 15 Z M49.5 23 L45.5 5.5 L35.5 15 Z" fill="#f59e0b" strokeLinejoin="round" />
      <path d="M18 18.5 L20 10.5 L25 15 Z M46 18.5 L44 10.5 L39 15 Z" fill="#fda4af" />
      <ellipse cx="32" cy="30" rx="18.5" ry="16.5" fill="#f59e0b" />
      <path d="M28 14.5 L29 19.5 M32 13.5 V19.5 M36 14.5 L35 19.5" stroke="#c2410c" strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="32" cy="37" rx="9.5" ry="6.8" fill="#fff7ed" />
      {eye(25.5, 28.5, 2.5)}
      {eye(38.5, 28.5, 2.5)}
      <path d="M29.8 33.5 H34.2 L32 36 Z" fill="#f472b6" strokeLinejoin="round" />
      <path d="M32 36 Q30.5 38.6 28.4 37.8 M32 36 Q33.5 38.6 35.6 37.8" fill="none" stroke={INK} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M21.5 35.5 H13.5 M21.5 38.5 L14.5 40.5 M42.5 35.5 H50.5 M42.5 38.5 L49.5 40.5" stroke={INK} strokeWidth="1" strokeLinecap="round" opacity="0.55" />
    </>
  ),
  bubo: (
    <>
      <ellipse cx="32" cy="64" rx="22" ry="19" fill="#0e7490" />
      <ellipse cx="32" cy="66" rx="12" ry="12" fill="#a5f3fc" />
      <path d="M14 18 L17.5 5 L25 14.5 Z M50 18 L46.5 5 L39 14.5 Z" fill="#0e7490" strokeLinejoin="round" />
      <ellipse cx="32" cy="30" rx="20.5" ry="18" fill="#0e7490" />
      <circle cx="24.5" cy="29.5" r="8.2" fill="#fef3c7" />
      <circle cx="39.5" cy="29.5" r="8.2" fill="#fef3c7" />
      <path d="M16.5 22 Q24.5 17.5 32 23 Q39.5 17.5 47.5 22" fill="none" stroke="#155e75" strokeWidth="2.2" strokeLinecap="round" />
      {eye(25, 30, 3.6)}
      {eye(39, 30, 3.6)}
      <path d="M29.8 35.5 H34.2 L32 40 Z" fill="#fbbf24" strokeLinejoin="round" />
    </>
  ),
  momo: (
    <>
      <ellipse cx="23.5" cy="13" rx="5.6" ry="13" fill={PINK} transform="rotate(-12 23.5 13)" />
      <ellipse cx="40.5" cy="13" rx="5.6" ry="13" fill={PINK} transform="rotate(12 40.5 13)" />
      <ellipse cx="23.5" cy="14" rx="2.8" ry="9" fill="#fbe0ea" transform="rotate(-12 23.5 14)" />
      <ellipse cx="40.5" cy="14" rx="2.8" ry="9" fill="#fbe0ea" transform="rotate(12 40.5 14)" />
      <ellipse cx="32" cy="67" rx="19" ry="14" fill={PINK} />
      <path d="M16.5 52 Q32 60 47.5 52 L47.5 57.5 Q32 65.5 16.5 57.5 Z" fill="#fbbf24" />
      <ellipse cx="32" cy="35" rx="17.5" ry="16" fill={PINK} />
      <ellipse cx="32" cy="40.5" rx="8" ry="5.8" fill="#fff1f6" />
      {eye(26, 33.5)}
      {eye(38, 33.5)}
      <ellipse cx="32" cy="38.3" rx="1.9" ry="1.4" fill="#be185d" />
      <path d="M32 39.6 V41.2 M32 41.2 Q30.3 43.2 28.6 42.3 M32 41.2 Q33.7 43.2 35.4 42.3" fill="none" stroke={INK} strokeWidth="1.3" strokeLinecap="round" />
      {cheeks(39, 10.5, '#db2777', 2.2)}
    </>
  ),
  komo: (
    <>
      <ellipse cx="32" cy="67" rx="22" ry="15" fill="#5b8c2a" />
      <ellipse cx="32" cy="69" rx="10" ry="9" fill="#d9f99d" />
      <path d="M21 16.5 L23.5 11 L26.5 15.5 L29.5 9.5 L32.5 14.5 L35.5 9.5 L38.5 15.5 L41.5 11 L43.5 16.5 Z" fill="#3f6212" strokeLinejoin="round" />
      <path d="M12.5 31 Q12.5 15 32 14.5 Q51.5 15 51.5 31 Q51.5 46 32 48.5 Q12.5 46 12.5 31 Z" fill="#5b8c2a" />
      <ellipse cx="32" cy="40" rx="13.5" ry="7.5" fill="#7aa83a" />
      <circle cx="19" cy="34" r="1.8" fill="#3f6212" />
      <circle cx="45.5" cy="35" r="2.1" fill="#3f6212" />
      <circle cx="24" cy="21" r="1.4" fill="#3f6212" />
      <circle cx="40" cy="21.5" r="1.6" fill="#3f6212" />
      <ellipse cx="21.5" cy="28" rx="5" ry="4.2" fill="#fef9c3" />
      <ellipse cx="42.5" cy="28" rx="5" ry="4.2" fill="#fef9c3" />
      {eye(22, 28.6, 2.3)}
      {eye(42, 28.6, 2.3)}
      <path d="M16 25.2 Q21.5 22 27 25.2 M37 25.2 Q42.5 22 48 25.2" fill="none" stroke="#3f6212" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="29.2" cy="36.5" r="1" fill={INK} />
      <circle cx="34.8" cy="36.5" r="1" fill={INK} />
      <path d="M21.5 41.5 Q32 47.5 42.5 41.5" fill="none" stroke={INK} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M32 44.6 V50 M32 50 L29.8 53 M32 50 L34.2 53" fill="none" stroke="#e11d48" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  utan: (
    <>
      <ellipse cx="32" cy="66" rx="21" ry="15" fill="#c2410c" />
      <path d="M22 15 L24.5 7.5 L28 14 L31 6.5 L34 14 L37.5 7.5 L41 15 Z" fill="#c2410c" strokeLinejoin="round" />
      <circle cx="13.5" cy="32" r="3.8" fill="#fdba74" />
      <circle cx="50.5" cy="32" r="3.8" fill="#fdba74" />
      <circle cx="32" cy="31" r="19" fill="#c2410c" />
      <ellipse cx="32" cy="35" rx="13.5" ry="12" fill="#fdba74" />
      <ellipse cx="32" cy="29.5" rx="11.5" ry="6" fill="#fed7aa" />
      {eye(27.5, 29.5, 2.2)}
      {eye(36.5, 29.5, 2.2)}
      <circle cx="30.5" cy="35.5" r="0.95" fill={INK} />
      <circle cx="33.5" cy="35.5" r="0.95" fill={INK} />
      <path d="M26.5 39.5 Q32 43.8 37.5 39.5" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  nisa: (
    <>
      <ellipse cx="32" cy="69" rx="22" ry="16" fill="#fbbf24" />
      <path d="M14.5 30 Q14.5 53 32 57.5 Q49.5 53 49.5 30 Z" fill="#0f766e" />
      <circle cx="32" cy="29" r="17.5" fill="#0f766e" />
      <ellipse cx="32" cy="31.5" rx="11.2" ry="12.2" fill="#f6d3b8" />
      <path d="M20.8 25 Q32 13.5 43.2 25" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" />
      <path d="M25.5 26.3 Q28 25 30 26.3 M34 26.3 Q36 25 38.5 26.3" fill="none" stroke={INK} strokeWidth="1.2" strokeLinecap="round" />
      {eye(28, 30.5, 2)}
      {eye(36, 30.5, 2)}
      <path d="M28.5 36 Q32 39.2 35.5 36" fill="none" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
      {cheeks(34.5, 7.2, '#fda4af', 1.8)}
    </>
  ),
  dimas: (
    <>
      <ellipse cx="32" cy="69" rx="22" ry="16" fill="#0ea5e9" />
      <path d="M27.5 54.5 L32 60 L36.5 54.5 Z" fill="#e0f2fe" />
      <rect x="28" y="43" width="8" height="10" rx="3" fill="#e8b893" />
      <circle cx="18.6" cy="31.5" r="2.7" fill="#f2c8a4" />
      <circle cx="45.4" cy="31.5" r="2.7" fill="#f2c8a4" />
      <ellipse cx="32" cy="30.5" rx="13.5" ry="15" fill="#f2c8a4" />
      <path d="M18.4 29 Q16.8 12 32 11.5 Q47.2 12 45.6 29 Q42.5 19.5 33.5 20.5 Q26 21 22.2 17.2 Q21 23.5 18.4 29 Z" fill="#1c1917" />
      <circle cx="26.5" cy="31.2" r="4.4" fill="#fff" opacity="0.4" stroke={INK} strokeWidth="1.5" />
      <circle cx="37.5" cy="31.2" r="4.4" fill="#fff" opacity="0.4" stroke={INK} strokeWidth="1.5" />
      <path d="M30.9 31 H33.1" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
      {eye(26.5, 31.4, 1.7)}
      {eye(37.5, 31.4, 1.7)}
      <path d="M28.2 38.2 Q32 41.6 35.8 38.2" fill="none" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
      {cheeks(36.2, 9.2, '#fda4af', 1.8)}
    </>
  ),
};

export const avatarOf = (index: number | undefined) => AVATARS[((index ?? 0) % AVATARS.length + AVATARS.length) % AVATARS.length];

/** A round avatar. `decorative` hides it from screen readers when a name is next to it. */
export function Avatar({ index, size = 44, decorative = false, className }: { index: number | undefined; size?: number; decorative?: boolean; className?: string }) {
  const a = avatarOf(index);
  const clip = `av-${useId().replace(/:/g, '')}`;
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} data-avatar={a.id}
      {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': `Avatar ${a.name}, ${a.label}` })}>
      <defs><clipPath id={clip}><circle cx="32" cy="32" r="32" /></clipPath></defs>
      <g clipPath={`url(#${clip})`}>
        <rect width="64" height="64" fill={a.bg} />
        {ART[a.id]}
      </g>
    </svg>
  );
}
