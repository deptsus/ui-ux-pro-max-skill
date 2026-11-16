// Shared 2.5D cartoon face (Rilis 14): the same eyes, brows and mouths for
// Pijar and every member of the cast, so a mood reads the same on all of them.
// Pure SVG; thick ink outlines and layered highlights give the "between 2D and
// 3D" look. Coordinates are relative to the face centre, in a 96-unit figure.

export const INK = '#1e1b3a';

export const MOODS = ['happy', 'cheer', 'laugh', 'dance', 'proud', 'love', 'wink', 'think', 'surprised', 'confused', 'encourage', 'worried', 'sad', 'sleep'] as const;
export type Mood = (typeof MOODS)[number];

/** Indonesian label for each mood (style page, alt text). */
export const MOOD_LABEL: Record<Mood, string> = {
  happy: 'senang', cheer: 'bersorak', laugh: 'tertawa', dance: 'menari', proud: 'bangga', love: 'suka sekali', wink: 'mengedip',
  think: 'berpikir', surprised: 'kaget', confused: 'bingung', encourage: 'menyemangati', worried: 'cemas', sad: 'sedih', sleep: 'tidur',
};

const eyeOpen = (x: number, y: number, look: [number, number] = [0, 0], big = false) => (
  big ? (
    // Startled: white eyes with small pupils.
    <g key={`e${x}`}>
      <ellipse cx={x} cy={y} rx="5.4" ry="6.4" fill="#fff" stroke={INK} strokeWidth="1.8" />
      <circle cx={x + look[0]} cy={y + 0.6 + look[1]} r="2.1" fill={INK} />
      <circle cx={x + look[0] + 0.9} cy={y - 0.3 + look[1]} r="0.8" fill="#fff" />
    </g>
  ) : (
    // Glossy dark eyes: a big catchlight, a small one, and a soft lower glint.
    <g key={`e${x}`}>
      <ellipse cx={x + look[0] * 0.5} cy={y + look[1] * 0.5} rx="3.6" ry="4.6" fill={INK} />
      <ellipse cx={x + look[0] * 0.5} cy={y + 2.6 + look[1] * 0.5} rx="2.4" ry="1.3" fill="#6d63dd" opacity="0.55" />
      <circle cx={x + 1.2 + look[0]} cy={y - 1.6 + look[1]} r="1.55" fill="#fff" />
      <circle cx={x - 1.1 + look[0]} cy={y + 1.3 + look[1]} r="0.7" fill="#fff" />
    </g>
  )
);
const arc = (x: number, y: number, up: boolean, w = 4.2) => (
  <path key={`a${x}`} d={up ? `M${x - w} ${y + 1.5} Q${x} ${y - 4} ${x + w} ${y + 1.5}` : `M${x - w} ${y - 1} Q${x} ${y + 3.5} ${x + w} ${y - 1}`} fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
);
const squint = (x: number, y: number, left: boolean) => (
  <path key={`s${x}`} d={left ? `M${x - 4} ${y - 3} L${x + 3} ${y} L${x - 4} ${y + 3}` : `M${x + 4} ${y - 3} L${x - 3} ${y} L${x + 4} ${y + 3}`} fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
);
const heart = (x: number, y: number, s = 1, fill = '#f43f5e') => (
  <path key={`h${x}${y}`} d={`M${x} ${y + 3.2 * s} C${x - 6 * s} ${y - 1 * s} ${x - 3.6 * s} ${y - 5.6 * s} ${x} ${y - 2.4 * s} C${x + 3.6 * s} ${y - 5.6 * s} ${x + 6 * s} ${y - 1 * s} ${x} ${y + 3.2 * s} Z`} fill={fill} stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
);
const brow = (x1: number, y1: number, x2: number, y2: number) => <path key={`b${x1}${y1}`} d={`M${x1} ${y1} L${x2} ${y2}`} stroke={INK} strokeWidth="2.6" strokeLinecap="round" />;

/**
 * Eyes, brows, mouth, blush and small extras (tears, sparkles, "?"), centred
 * on (cx, cy). `gap` is half the distance between the eyes.
 */
export function Face({ mood, cx, cy, gap = 7, blush = '#fb7185' }: { mood: Mood; cx: number; cy: number; gap?: number; blush?: string }) {
  const L = cx - gap;
  const R = cx + gap;
  const ey = cy - 3;
  const my = cy + 6;

  const eyes = (() => {
    switch (mood) {
      case 'cheer': case 'dance': case 'proud': return [arc(L, ey, true), arc(R, ey, true)];
      case 'laugh': return [squint(L, ey, true), squint(R, ey, false)];
      case 'love': return [heart(L, ey, 0.95), heart(R, ey, 0.95)];
      case 'wink': return [arc(L, ey, true), eyeOpen(R, ey)];
      case 'think': return [eyeOpen(L, ey, [1.3, -1.6]), eyeOpen(R, ey, [1.3, -1.6])];
      case 'surprised': return [eyeOpen(L, ey - 0.5, [0, 0], true), eyeOpen(R, ey - 0.5, [0, 0], true)];
      case 'confused': return [eyeOpen(L, ey, [-0.8, 0]), eyeOpen(R, ey - 0.5, [0.8, 0])];
      case 'sleep': return [arc(L, ey, false), arc(R, ey, false)];
      case 'sad': case 'worried': return [eyeOpen(L, ey + 0.5, [0, 0.8]), eyeOpen(R, ey + 0.5, [0, 0.8])];
      default: return [eyeOpen(L, ey), eyeOpen(R, ey)];
    }
  })();

  const brows = (() => {
    const by = ey - 8;
    switch (mood) {
      case 'surprised': return [brow(L - 4, by - 2.5, L + 3, by - 3.5), brow(R - 3, by - 3.5, R + 4, by - 2.5)];
      case 'sad': case 'worried': return [brow(L - 4, by + 1, L + 3, by - 2), brow(R - 3, by - 2, R + 4, by + 1)];
      case 'encourage': return [brow(L - 4, by - 1.5, L + 3, by + 1.2), brow(R - 3, by + 1.2, R + 4, by - 1.5)];
      case 'confused': return [brow(L - 4, by - 2.5, L + 3, by - 3), brow(R - 3, by + 0.5, R + 4, by + 1.5)];
      case 'think': return [brow(L - 4, by, L + 3, by - 1), brow(R - 3, by - 2.5, R + 4, by - 3)];
      case 'proud': return [brow(L - 4, by - 1, L + 3, by - 1.5), brow(R - 3, by - 1.5, R + 4, by - 1)];
      default: return null;
    }
  })();

  const mouth = (() => {
    const open = (w: number, d: number, tongue = true) => (
      <g>
        <path d={`M${cx - w} ${my - 1} Q${cx} ${my + d} ${cx + w} ${my - 1} Z`} fill="#7f1d3a" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        {tongue && <path d={`M${cx - w * 0.5} ${my + d * 0.42} Q${cx} ${my + d * 0.18} ${cx + w * 0.5} ${my + d * 0.42} Q${cx} ${my + d * 0.62} ${cx - w * 0.5} ${my + d * 0.42} Z`} fill="#fb7185" />}
        <path d={`M${cx - w + 1.5} ${my - 0.4} L${cx + w - 1.5} ${my - 0.4}`} stroke="#fff" strokeWidth="1.8" strokeLinecap="round" opacity="0.95" />
      </g>
    );
    switch (mood) {
      case 'happy': return <path d={`M${cx - 6} ${my - 1} Q${cx} ${my + 6} ${cx + 6} ${my - 1}`} fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />;
      case 'cheer': case 'dance': return open(7.5, 12);
      case 'laugh': return open(8.5, 13);
      case 'love': return open(5.5, 8);
      case 'proud': return <path d={`M${cx - 6} ${my} Q${cx + 1} ${my + 5} ${cx + 7} ${my - 2.5}`} fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />;
      case 'wink': return (
        <g>
          <path d={`M${cx - 6} ${my - 1} Q${cx} ${my + 6} ${cx + 6} ${my - 1}`} fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
          <path d={`M${cx + 1} ${my + 3.4} Q${cx + 3.5} ${my + 8.5} ${cx + 5.5} ${my + 2}`} fill="#fb7185" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
        </g>
      );
      case 'think': return <path d={`M${cx - 2} ${my + 1.5} Q${cx + 2.5} ${my} ${cx + 5} ${my + 1}`} fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />;
      case 'surprised': return <ellipse cx={cx} cy={my + 2} rx="3.4" ry="4.4" fill="#7f1d3a" stroke={INK} strokeWidth="2" />;
      case 'confused': return <path d={`M${cx - 5.5} ${my + 1.5} q2.75 -3 5.5 0 t5.5 0`} fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />;
      case 'encourage': return (
        <g>
          <path d={`M${cx - 7} ${my - 1} Q${cx} ${my + 8} ${cx + 7} ${my - 1} Z`} fill="#fff" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
          <path d={`M${cx - 6} ${my + 1.4} H${cx + 6}`} stroke={INK} strokeWidth="1.2" opacity="0.5" />
        </g>
      );
      case 'worried': return <path d={`M${cx - 5.5} ${my + 2.5} q2.75 -2.6 5.5 0 t5.5 0`} fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />;
      case 'sad': return <path d={`M${cx - 5.5} ${my + 4} Q${cx} ${my - 2} ${cx + 5.5} ${my + 4}`} fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />;
      case 'sleep': return <ellipse cx={cx} cy={my + 2} rx="2.6" ry="2.2" fill="#7f1d3a" stroke={INK} strokeWidth="1.6" />;
    }
  })();

  const extras = (() => {
    switch (mood) {
      case 'laugh': return <g className="cast-x-tears"><path d={`M${L - 7} ${ey + 2} q-2 4 0 5.5 q2 -1.5 0 -5.5`} fill="#7dd3fc" stroke={INK} strokeWidth="1.2" /><path d={`M${R + 7} ${ey + 2} q-2 4 0 5.5 q2 -1.5 0 -5.5`} fill="#7dd3fc" stroke={INK} strokeWidth="1.2" /></g>;
      case 'sad': return <path className="cast-x-tear" d={`M${R + 1} ${ey + 5} q-2.6 5 0 7 q2.6 -2 0 -7`} fill="#7dd3fc" stroke={INK} strokeWidth="1.2" />;
      case 'worried': return <path className="cast-x-sweat" d={`M${R + 11} ${ey - 9} q-3 5 0 7 q3 -2 0 -7`} fill="#bae6fd" stroke={INK} strokeWidth="1.2" />;
      case 'love': return <g className="cast-x-hearts">{heart(cx + 17, cy - 21, 0.7)}{heart(cx - 18, cy - 17, 0.5, '#fb7185')}</g>;
      case 'proud': case 'encourage': return <g className="cast-x-spark"><path d={`M${cx + 18} ${cy - 20} l1.4 3.2 3.2 1.4 -3.2 1.4 -1.4 3.2 -1.4 -3.2 -3.2 -1.4 3.2 -1.4 z`} fill="#fde047" stroke={INK} strokeWidth="1.1" strokeLinejoin="round" /></g>;
      case 'confused': return <text className="cast-x-q" x={cx + 15} y={cy - 16} fontSize="13" fontWeight="900" fill="#6d63dd" stroke={INK} strokeWidth="0.8" fontFamily="system-ui, sans-serif">?</text>;
      case 'think': return <g className="cast-x-dots" fill="#fff" stroke={INK} strokeWidth="1.2"><circle cx={cx + 16} cy={cy - 15} r="1.8" /><circle cx={cx + 20} cy={cy - 20} r="2.4" /><circle cx={cx + 25} cy={cy - 26} r="3.2" /></g>;
      case 'sleep': return <text className="cast-x-z" x={cx + 14} y={cy - 14} fontSize="11" fontWeight="900" fill="#6d63dd" fontFamily="system-ui, sans-serif">z</text>;
      default: return null;
    }
  })();

  return (
    <g className="cast-face">
      {mood !== 'sleep' && mood !== 'love' && (
        <g opacity="0.5">
          <ellipse cx={L - 4} cy={cy + 4} rx="3.6" ry="2.2" fill={blush} />
          <ellipse cx={R + 4} cy={cy + 4} rx="3.6" ry="2.2" fill={blush} />
        </g>
      )}
      {brows}
      <g className="cast-eyes">{eyes}</g>
      {mouth}
      {extras}
    </g>
  );
}
