// The Lentera cast (Rilis 14): original Indonesian learners and a teacher, drawn
// as 2.5D clay busts (thick ink outlines, soft shading, glossy highlights) that
// share Pijar's 14 expressions (Face.tsx). School uniforms follow the familiar
// Indonesian colours: SD white/red, SMP white/navy, SMA white/grey.
import { useId } from 'react';
import { Face, INK, MOOD_LABEL, type Mood } from './Face';

export type HairStyle = 'wolf' | 'comma' | 'hijab' | 'wavy' | 'short' | 'pigtails' | 'spiky' | 'bun';
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
  sari: { name: 'Sari', role: 'siswi SD kelas 3', skin: '#f3c9a2', hair: '#2b1d16', hairStyle: 'wolf', top: '#ffffff', trim: '#dc2626' },
  bima: { name: 'Bima', role: 'siswa SMP kelas 8', skin: '#e6b48a', hair: '#1f1712', hairStyle: 'comma', top: '#ffffff', trim: '#1e3a8a' },
  nadia: { name: 'Nadia', role: 'siswi SMA kelas 11', skin: '#efc29c', hair: '#2b1d16', hairStyle: 'hijab', top: '#ffffff', trim: '#64748b', hijab: '#f1f5f9' },
  raka: { name: 'Raka', role: 'siswa SMA kelas 12', skin: '#b67b52', hair: '#1c1410', hairStyle: 'wavy', top: '#ffffff', trim: '#64748b', glasses: true },
  lina: { name: 'Bu Lina', role: 'guru bahasa Inggris', skin: '#f3c9a2', hair: '#3a2418', hairStyle: 'short', top: '#0f766e', trim: '#fbbf24', glasses: true },
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
            {/* A soft square hijab / pashmina (redrawn 20 Nov 2026, after the owner's photo): one
                cloth that frames the face closely, wraps under the chin where it is pinned, flows
                over both shoulders, and has one end swept across the chest. Fold lines are faint
                so they vanish at small sizes. */}
            <path d="M48 15 C61 15 70.5 24.5 70.5 39 C70.5 48 69.6 55 68 60.5 C72.6 65.6 78.6 69.2 81 75.5 C82.4 79 82.6 83 82.6 86 C82.8 90 83 93.5 83.2 97 L12.8 97 C13 93.5 13.2 90 13.4 86 C13.4 83 13.6 79 15 75.5 C17.4 69.2 23.4 65.6 28 60.5 C26.4 55 25.5 48 25.5 39 C25.5 24.5 35 15 48 15 Z" fill={`url(#${hair})`} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
            {/* the end swept across the chest to the left shoulder */}
            <path d="M68.6 63 C63 74.5 49 81.5 27.5 84.5 C26.4 88.5 26.6 93 27.6 97 L49 97 C60.5 91 69.5 82 72.4 70.5 Z" fill={tint(look.hijab ?? look.hair, -0.07)} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" strokeOpacity="0.6" />
            <g fill="none" stroke={INK} strokeLinecap="round" opacity="0.18" strokeWidth="1.4">
              <path d="M64 74 C58 82 50 87 40 90.5" />
              <path d="M22.5 74 C21 80 20.8 86 21.8 92" />
              <path d="M74.6 75 C75.6 80 75.6 85 74.8 89" />
              <path d="M29.5 31 C33 25 38.5 21 45 19.8" />
            </g>
            <ellipse cx="36.5" cy="23.5" rx="6.5" ry="3" fill="#fff" opacity="0.6" transform="rotate(-30 36.5 23.5)" />
            {/* the inner fold around the face, then the face */}
            <ellipse cx="48" cy="45.6" rx="18.4" ry="20.6" fill={tint(look.hijab ?? look.hair, -0.13)} />
            <ellipse cx="48" cy="45" rx="17" ry="19.2" fill={`url(#${skin})`} stroke={INK} strokeWidth="2.4" />
            {/* where the cloth wraps under the chin, and the pin that holds it */}
            <path d="M66.8 57.5 C62.6 66.4 55.8 70.6 48 70.6 C41.4 70.6 35.6 67.6 31.4 62" fill="none" stroke={INK} strokeWidth="1.9" strokeLinecap="round" strokeOpacity="0.6" />
            <circle cx="56.2" cy="68.4" r="1.9" fill="#fde68a" stroke={INK} strokeWidth="1.3" />
          </g>
        ) : (
          <g>
            {/* neck, ears, head */}
            <path d="M41 60 L41 72 Q48 76 55 72 L55 60 Z" fill={tint(look.skin, -0.15)} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
            {look.hairStyle === 'wolf' ? (
              // Wolf cut: layered, choppy ends past the jaw; covers the ears.
              <path d="M23 40 C21 22 33 13 48 13 C63 13 75 22 73 40 L76.5 52 L71 50 L72.5 61 L66 54.5 L64.5 63 L60 55 L36 55 L31.5 63 L30 54.5 L23.5 61 L25 50 L19.5 52 Z" fill={`url(#${hair})`} stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
            ) : look.hairStyle === 'short' ? (
              // Short bob: ends at the jaw; covers the ears.
              <path d="M22.5 44 C20 26 32 15 48 15 C64 15 76 26 73.5 44 C73.5 51 71.5 55.5 68 58 L66.5 47 L29.5 47 L28 58 C24.5 55.5 22.5 51 22.5 44 Z" fill={`url(#${hair})`} stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
            ) : (
              <circle cx="49" cy="38.5" r="24" fill={look.hair} stroke={INK} strokeWidth="2.6" />
            )}
            {look.hairStyle !== 'wolf' && look.hairStyle !== 'short' && (
              <g>
                <circle cx="26" cy="46" r="5" fill={`url(#${skin})`} stroke={INK} strokeWidth="2.4" />
                <circle cx="70" cy="46" r="5" fill={`url(#${skin})`} stroke={INK} strokeWidth="2.4" />
              </g>
            )}
            <circle cx="48" cy="42" r="22" fill={`url(#${skin})`} stroke={INK} strokeWidth="3" />
            <path d="M29 52 A20 20 0 0 0 67 52 A24 20 0 0 1 29 52 Z" fill={tint(look.skin, -0.35)} opacity="0.22" />
            {/* fringe */}
            {look.hairStyle === 'pigtails' && <path d="M27 39 C29 22 67 20 69 39 C63 31 57 28 49 31 C41 28 33 31 27 39 Z" fill={`url(#${hair})`} stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />}
            {look.hairStyle === 'wolf' && (
              <g fill={`url(#${hair})`} stroke={INK} strokeWidth="2.4" strokeLinejoin="round">
                {/* choppy curtain bangs and face-framing layers */}
                <path d="M25.5 41 L27.5 30 C30 21.5 38 17 48 17 C58 17 66 21.5 68.5 30 L70.5 41 Q67.2 38.6 65.5 34.5 Q64.4 37.4 62.5 38.5 Q60.6 34 58.5 30.5 Q57 34.6 54.5 36 Q52.6 32.4 50.5 29.5 Q48.6 34 46 36 Q44.2 33.2 42 30.5 Q40.6 35.6 38 38.5 Q36.6 35.6 34.5 33.5 Q33 37.4 30.5 39.5 Q27.8 40 25.5 41 Z" />
                <path d="M26.5 37 C24.5 45 26 51.5 29.5 56 L30.5 49 L32.8 52 L32.4 42.5 Z" />
                <path d="M69.5 37 C71.5 45 70 51.5 66.5 56 L65.5 49 L63.2 52 L63.6 42.5 Z" />
              </g>
            )}
            {look.hairStyle === 'comma' && (
              // Comma hair: a side fringe that curls inward at the tip, like a comma.
              <path d="M25.5 40 C24 25 34 15.5 49 15.5 C63 15.5 72 25 70.5 39 C67 31 62 26.5 56 26.5 C49.5 26.5 45 28.6 43.2 31.2 C42.4 32.6 43.4 34 45.4 33.6 C43.4 35.8 39.6 35.4 38.6 32.4 C35 33.6 30 36 25.5 40 Z" fill={`url(#${hair})`} stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
            )}
            {look.hairStyle === 'short' && (
              <g fill={`url(#${hair})`} stroke={INK} strokeWidth="2.4" strokeLinejoin="round">
                {/* side-swept bangs and bob sides over the cheeks */}
                <path d="M25.5 43 C24.5 26 36 17.5 50 18 C62 18.5 71.5 27 70.5 43 C66.5 34 58.5 29 50 29.5 C42 30 34 33.5 29.5 38.5 C27.8 40.4 26.6 41.7 25.5 43 Z" />
                <path d="M25.6 42 C25 49 26.4 54 29 57 L30.6 47 Z" />
                <path d="M70.4 42 C71 49 69.6 54 67 57 L65.4 47 Z" />
              </g>
            )}
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
