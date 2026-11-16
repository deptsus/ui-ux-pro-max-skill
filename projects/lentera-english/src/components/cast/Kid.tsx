// The Lentera cast (Rilis 14): original Indonesian learners and a teacher, drawn
// as 2.5D clay busts (thick ink outlines, soft shading, glossy highlights) that
// share Pijar's 14 expressions (Face.tsx). School uniforms follow the familiar
// Indonesian colours: SD white/red, SMP white/navy, SMA white/grey.
import { useId } from 'react';
import { Face, INK, MOOD_LABEL, type Mood } from './Face';

export type HairStyle = 'pigtails' | 'spiky' | 'hijab' | 'wavy' | 'bun';
export interface Look {
  name: string;
  /** Who they are, for alt text and the style page. */
  role: string;
  skin: string;
  hair: string;
  hairStyle: HairStyle;
  /** Shirt, collar/tie, and the hijab colour when worn. */
  top: string;
  trim: string;
  hijab?: string;
  glasses?: boolean;
}

export const CAST = {
  sari: { name: 'Sari', role: 'siswi SD kelas 3', skin: '#f3c9a2', hair: '#2b1d16', hairStyle: 'pigtails', top: '#ffffff', trim: '#dc2626' },
  bima: { name: 'Bima', role: 'siswa SMP kelas 8', skin: '#d6a074', hair: '#1f1712', hairStyle: 'spiky', top: '#ffffff', trim: '#1e3a8a' },
  nadia: { name: 'Nadia', role: 'siswi SMA kelas 11', skin: '#efc29c', hair: '#2b1d16', hairStyle: 'hijab', top: '#ffffff', trim: '#64748b', hijab: '#f1f5f9' },
  raka: { name: 'Raka', role: 'siswa SMA kelas 12', skin: '#b67b52', hair: '#1c1410', hairStyle: 'wavy', top: '#ffffff', trim: '#64748b', glasses: true },
  lina: { name: 'Bu Lina', role: 'guru bahasa Inggris', skin: '#e2b088', hair: '#3a2418', hairStyle: 'bun', top: '#0f766e', trim: '#fbbf24', glasses: true },
} satisfies Record<string, Look>;
export type CastId = keyof typeof CAST;

/** Darkens (amt < 0) or lightens (amt > 0) a #rrggbb colour. */
function tint(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)));
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => ch(v).toString(16).padStart(2, '0')).join('')}`;
}

/** A cast member's bust in a 96×96 box, without the <svg>, so scenes can place it. */
export function KidFigure({ look, mood = 'happy', still = false }: { look: Look; mood?: Mood; still?: boolean }) {
  const id = useId().replace(/:/g, '');
  const skin = `cs-${id}`, top = `ct-${id}`, hair = `ch-${id}`;
  const hijab = look.hairStyle === 'hijab';
  const cx = 48, cy = 44;
  return (
    <g className={`cast cast-${mood}${still ? ' cast-still' : ''}`}>
      <defs>
        <radialGradient id={skin} cx="38%" cy="30%" r="80%"><stop offset="0%" stopColor={tint(look.skin, 0.22)} /><stop offset="100%" stopColor={tint(look.skin, -0.12)} /></radialGradient>
        <linearGradient id={top} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={tint(look.top, 0.15)} /><stop offset="100%" stopColor={tint(look.top, -0.14)} /></linearGradient>
        <radialGradient id={hair} cx="40%" cy="25%" r="80%"><stop offset="0%" stopColor={tint(look.hijab ?? look.hair, look.hijab ? 0.3 : 0.28)} /><stop offset="100%" stopColor={look.hijab ? tint(look.hijab, -0.14) : look.hair} /></radialGradient>
      </defs>
      <g className="cast-body">
        {/* behind the head */}
        {look.hairStyle === 'pigtails' && (
          <g>
            <ellipse cx="21" cy="50" rx="7.5" ry="12" fill={`url(#${hair})`} stroke={INK} strokeWidth="2.6" transform="rotate(18 21 50)" />
            <ellipse cx="75" cy="50" rx="7.5" ry="12" fill={`url(#${hair})`} stroke={INK} strokeWidth="2.6" transform="rotate(-18 75 50)" />
            <circle cx="25" cy="38" r="3.4" fill="#ef4444" stroke={INK} strokeWidth="1.8" />
            <circle cx="71" cy="38" r="3.4" fill="#ef4444" stroke={INK} strokeWidth="1.8" />
          </g>
        )}
        {look.hairStyle === 'bun' && <circle cx="48" cy="14" r="8.5" fill={`url(#${hair})`} stroke={INK} strokeWidth="2.6" />}

        {/* shoulders and uniform */}
        <path d="M13 97 C13 82 24 74 38 72 L58 72 C72 74 83 82 83 97 Z" fill={`url(#${top})`} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        {look.top === '#ffffff' ? (
          <g>
            <path d="M38 72 L48 84 L42 87 L34 75 Z M58 72 L48 84 L54 87 L62 75 Z" fill="#fff" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
            <path d="M48 83 L45 87 L47 96 H49 L51 87 Z" fill={look.trim} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
          </g>
        ) : (
          <g>
            <path d="M39 72 Q48 82 57 72" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
            <g fill={look.trim} opacity="0.9"><circle cx="30" cy="86" r="2" /><circle cx="40" cy="91" r="2" /><circle cx="58" cy="90" r="2" /><circle cx="68" cy="85" r="2" /><circle cx="49" cy="93" r="1.6" /></g>
          </g>
        )}

        {hijab ? (
          <g>
            {/* hijab: covers head and neck, drapes over the shoulders */}
            <path d="M19 50 C17 24 33 12 48 12 C63 12 79 24 77 50 C77 63 72 71 66 75 L69 90 C58 94 38 94 27 90 L30 75 C24 71 19 63 19 50 Z" fill={`url(#${hair})`} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
            <path d="M30 75 Q48 84 66 75" fill="none" stroke={INK} strokeWidth="1.6" opacity="0.35" />
            <ellipse cx="48" cy="45" rx="17.5" ry="19.5" fill={`url(#${skin})`} stroke={INK} strokeWidth="2.4" />
            <ellipse cx="36" cy="22" rx="7" ry="3.4" fill="#fff" opacity="0.55" transform="rotate(-28 36 22)" />
          </g>
        ) : (
          <g>
            {/* neck, ears, head */}
            <path d="M41 60 L41 72 Q48 76 55 72 L55 60 Z" fill={tint(look.skin, -0.15)} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
            <circle cx="49" cy="38.5" r="24" fill={look.hair} stroke={INK} strokeWidth="2.6" />
            <circle cx="26" cy="46" r="5" fill={`url(#${skin})`} stroke={INK} strokeWidth="2.4" />
            <circle cx="70" cy="46" r="5" fill={`url(#${skin})`} stroke={INK} strokeWidth="2.4" />
            <circle cx="48" cy="42" r="22" fill={`url(#${skin})`} stroke={INK} strokeWidth="3" />
            <path d="M29 52 A20 20 0 0 0 67 52 A24 20 0 0 1 29 52 Z" fill={tint(look.skin, -0.35)} opacity="0.22" />
            {/* fringe */}
            {look.hairStyle === 'pigtails' && <path d="M27 39 C29 22 67 20 69 39 C63 31 57 28 49 31 C41 28 33 31 27 39 Z" fill={`url(#${hair})`} stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />}
            {look.hairStyle === 'spiky' && <path d="M25.5 40 L27.5 25 L33.5 29 L37.5 18 L43.5 26 L49.5 16 L54.5 26 L61 19 L63.5 29 L70.5 26 L70.5 40 C63 32 56 30.5 48 32 C40 30.5 33 32 25.5 40 Z" fill={`url(#${hair})`} stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />}
            {look.hairStyle === 'wavy' && <path d="M26 40 C24 24 34 15 48 16 C62 15 72 24 70 40 C66 34 63 31 59 32 C56 28 52 30 48 31 C44 28 39 30 36 32 C32 31 29 34 26 40 Z" fill={`url(#${hair})`} stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />}
            {look.hairStyle === 'bun' && <path d="M26 42 C25 25 36 17 50 18 C62 19 71 27 70 42 C64 31 54 27 44 31 C36 33 30 36 26 42 Z" fill={`url(#${hair})`} stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />}
            <path d="M36 25 Q42 21 48 21.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" opacity="0.35" />
          </g>
        )}

        <Face mood={mood} cx={cx} cy={cy} gap={7.4} blush="#f87171" />
        {look.glasses && (
          <g fill="#e0f2fe" fillOpacity="0.25" stroke={INK} strokeWidth="1.9">
            <rect x={cx - 15.2} y={cy - 9.2} width="12.6" height="11.4" rx="4.4" />
            <rect x={cx + 2.6} y={cy - 9.2} width="12.6" height="11.4" rx="4.4" />
            <path d="M45.4 39.2 Q48 37.6 50.6 39.2" fill="none" />
            <path d={`M${cx - 13.6} ${cy - 7.6} l3 0`} stroke="#fff" strokeOpacity="0.8" strokeWidth="1.4" strokeLinecap="round" />
          </g>
        )}
      </g>
    </g>
  );
}

/** A cast member as a standalone picture. */
export function CastMember({ who, mood = 'happy', size = 96, className, decorative = false, still = false }: { who: CastId; mood?: Mood; size?: number; className?: string; decorative?: boolean; still?: boolean }) {
  const look: Look = CAST[who];
  return (
    <svg viewBox="0 0 96 96" width={size} height={size} className={className} overflow="visible" data-mood={mood} {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': `${look.name}, ${look.role}, ${MOOD_LABEL[mood]}` })}>
      <KidFigure look={look} mood={mood} still={still} />
    </svg>
  );
}
