// Draws one story scene as inline SVG: a backdrop, up to three characters and
// the speech marker. Every movement is CSS (see .story-stage in globals.css):
// characters walk in, bob while speaking, blink, wave and jump. Nothing here
// loads images or fonts, so a scene renders instantly and works offline.
import type { ReactNode } from 'react';
import type { StoryActor, StoryBackdrop, StoryCharacter, StoryPose, StoryScene } from '@/lib/content/types';
import { PijarDefs, PijarFigure, type Mood } from '@/components/Mascot';

const W = 320;
const H = 180;
const FLOOR = 164;
const X: Record<StoryActor['at'], number> = { left: 70, center: 160, right: 250 };

export const BACKDROP_LABEL: Record<StoryBackdrop, string> = {
  home: 'ruang keluarga', bedroom: 'kamar tidur', school: 'ruang kelas', street: 'jalan', market: 'pasar', station: 'stasiun kereta',
  cafe: 'kafe', park: 'taman', shop: 'toko', temple: 'Candi Prambanan',
};

// ---------------------------------------------------------------- backdrops
const SKY = { day: ['#7dd3fc', '#e0f2fe'], evening: ['#fb923c', '#fde68a'], night: ['#1e1b4b', '#4338ca'] } as const;
type Time = keyof typeof SKY;

function Clouds({ time }: { time: Time }) {
  if (time === 'night') {
    return (
      <g fill="#fef9c3">
        <circle cx="262" cy="26" r="10" />
        {[[40, 20], [90, 36], [150, 16], [210, 40], [300, 52]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="1.3" />)}
      </g>
    );
  }
  return (
    <g fill="#ffffff" opacity={time === 'evening' ? 0.7 : 0.9} className="st-cloud">
      <ellipse cx="60" cy="28" rx="22" ry="8" />
      <ellipse cx="76" cy="24" rx="14" ry="9" />
      <ellipse cx="220" cy="38" rx="26" ry="8" />
      <ellipse cx="238" cy="33" rx="13" ry="8" />
    </g>
  );
}

function Window({ x, y, w, h, time }: { x: number; y: number; w: number; h: number; time: Time }) {
  return (
    <g>
      <rect x={x - 3} y={y - 3} width={w + 6} height={h + 6} rx="3" fill="#ffffff" />
      <rect x={x} y={y} width={w} height={h} fill={`url(#st-sky-${time})`} />
      {time === 'night' && <circle cx={x + w * 0.7} cy={y + h * 0.3} r="5" fill="#fef9c3" />}
      <path d={`M${x + w / 2} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}`} stroke="#ffffff" strokeWidth="3" />
    </g>
  );
}

const Floor = ({ color, line }: { color: string; line?: string }) => (
  <g>
    <rect x="0" y="146" width={W} height={H - 146} fill={color} />
    {line && <path d="M0 158 H320 M0 170 H320" stroke={line} strokeWidth="1" />}
  </g>
);

function Backdrop({ type, time }: { type: StoryBackdrop; time: Time }): ReactNode {
  const dim = time === 'night' ? 0.82 : 1;
  switch (type) {
    case 'home':
      return (
        <g opacity={dim}>
          <rect width={W} height="146" fill="#fde7c8" />
          <Window x={24} y={26} w={64} h={52} time={time} />
          <rect x="18" y="20" width="10" height="66" rx="3" fill="#f59e0b" opacity="0.6" />
          <rect x="84" y="20" width="10" height="66" rx="3" fill="#f59e0b" opacity="0.6" />
          <rect x="140" y="30" width="44" height="32" rx="2" fill="#a16207" />
          <rect x="144" y="34" width="36" height="24" fill="#fef3c7" />
          <path d="M148 54 L158 42 L166 50 L172 44 L178 54 Z" fill="#65a30d" />
          <rect x="214" y="98" width="92" height="40" rx="10" fill="#94a3b8" />
          <rect x="208" y="88" width="16" height="50" rx="7" fill="#64748b" />
          <rect x="296" y="88" width="16" height="50" rx="7" fill="#64748b" />
          <rect x="226" y="86" width="70" height="20" rx="8" fill="#a5b4c8" />
          <rect x="8" y="118" width="16" height="28" rx="3" fill="#b45309" />
          <circle cx="16" cy="108" r="13" fill="#4ade80" />
          <Floor color="#d6a571" line="#c08a55" />
        </g>
      );
    case 'bedroom':
      return (
        <g opacity={dim}>
          <rect width={W} height="146" fill="#e0e7ff" />
          <Window x={128} y={24} w={64} h={48} time={time} />
          <rect x="8" y="98" width="110" height="40" rx="6" fill="#f472b6" />
          <rect x="8" y="80" width="12" height="58" rx="4" fill="#a16207" />
          <rect x="24" y="90" width="34" height="14" rx="6" fill="#ffffff" />
          <rect x="226" y="58" width="80" height="5" rx="2" fill="#a16207" />
          {[['#ef4444', 230, 18], ['#3b82f6', 240, 22], ['#22c55e', 251, 16], ['#f59e0b', 260, 20], ['#8b5cf6', 270, 17]].map(([c, x, h]) => <rect key={String(x)} x={Number(x)} y={58 - Number(h)} width="9" height={Number(h)} rx="1" fill={String(c)} />)}
          <rect x="250" y="96" width="56" height="8" rx="2" fill="#a16207" />
          <rect x="254" y="104" width="6" height="34" fill="#92400e" />
          <rect x="296" y="104" width="6" height="34" fill="#92400e" />
          {time === 'night' && <circle cx="278" cy="86" r="18" fill="#fde68a" opacity="0.35" />}
          <rect x="272" y="80" width="12" height="16" rx="2" fill="#fde68a" />
          <Floor color="#d8b4a0" line="#c79f87" />
        </g>
      );
    case 'school':
      return (
        <g opacity={dim}>
          <rect width={W} height="146" fill="#fef3c7" />
          <rect x="82" y="22" width="156" height="66" rx="4" fill="#92400e" />
          <rect x="88" y="28" width="144" height="54" rx="2" fill="#14532d" />
          <text x="160" y="58" textAnchor="middle" fontSize="15" fontWeight="700" fill="#ecfccb" fontFamily="inherit">Hello!</text>
          <path d="M104 70 H150" stroke="#ecfccb" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <circle cx="40" cy="40" r="15" fill="#ffffff" stroke="#334155" strokeWidth="2.5" />
          <path d="M40 40 V31 M40 40 L47 44" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
          <Window x={262} y={26} w={44} h={50} time={time} />
          <rect x="10" y="114" width="46" height="6" rx="2" fill="#a16207" />
          <rect x="14" y="120" width="5" height="26" fill="#92400e" />
          <rect x="47" y="120" width="5" height="26" fill="#92400e" />
          <rect x="266" y="114" width="46" height="6" rx="2" fill="#a16207" />
          <rect x="270" y="120" width="5" height="26" fill="#92400e" />
          <rect x="303" y="120" width="5" height="26" fill="#92400e" />
          <Floor color="#e5e7eb" line="#d1d5db" />
        </g>
      );
    case 'street':
      return (
        <g>
          <rect width={W} height="146" fill={`url(#st-sky-${time})`} />
          <Clouds time={time} />
          {[[0, 60, 54, '#c7d2fe'], [56, 40, 46, '#fecaca'], [104, 70, 60, '#bbf7d0'], [206, 50, 50, '#fde68a'], [258, 36, 62, '#ddd6fe']].map(([x, y, w, c]) => (
            <g key={String(x)}>
              <rect x={Number(x)} y={Number(y)} width={Number(w)} height={130 - Number(y)} fill={String(c)} />
              {Array.from({ length: 3 }, (_, i) => <rect key={i} x={Number(x) + 8 + i * 15} y={Number(y) + 10} width="8" height="10" fill={time === 'night' ? '#fde68a' : '#ffffff'} opacity="0.85" />)}
            </g>
          ))}
          <rect x="0" y="126" width={W} height="20" fill="#cbd5e1" />
          <rect x="0" y="146" width={W} height="34" fill="#475569" />
          <path d="M0 165 H320" stroke="#f8fafc" strokeWidth="2" strokeDasharray="14 10" />
          <rect x="292" y="74" width="4" height="58" fill="#334155" />
          <rect x="280" y="66" width="28" height="16" rx="3" fill="#2563eb" />
          <text x="294" y="78" textAnchor="middle" fontSize="9" fontWeight="800" fill="#ffffff" fontFamily="inherit">BUS</text>
          <rect x="26" y="96" width="6" height="34" fill="#92400e" />
          <circle cx="29" cy="88" r="16" fill="#22c55e" />
        </g>
      );
    case 'market': {
      const stall = (x: number, awning: string, goods: ReactNode) => (
        <g>
          <rect x={x} y="74" width="84" height="8" fill={awning} />
          {Array.from({ length: 6 }, (_, i) => <rect key={i} x={x + i * 14} y="66" width="7" height="16" fill={i % 2 ? '#ffffff' : awning} />)}
          <rect x={x + 4} y="82" width="4" height="50" fill="#92400e" />
          <rect x={x + 76} y="82" width="4" height="50" fill="#92400e" />
          <rect x={x} y="114" width="84" height="18" rx="2" fill="#b45309" />
          {goods}
        </g>
      );
      return (
        <g>
          <rect width={W} height="146" fill={`url(#st-sky-${time})`} />
          <Clouds time={time} />
          {stall(8, '#ef4444', [['#f97316', 22], ['#fb923c', 34], ['#facc15', 46], ['#ef4444', 58], ['#f97316', 70]].map(([c, x]) => <circle key={String(x)} cx={8 + Number(x)} cy="110" r="6" fill={String(c)} />))}
          {stall(118, '#16a34a', <g>{[130, 150, 170, 190].map((x) => <g key={x}><rect x={x} y="98" width="12" height="16" rx="2" fill="#e0f2fe" /><rect x={x + 3} y="94" width="6" height="5" rx="1" fill="#0ea5e9" /></g>)}</g>)}
          {stall(228, '#f59e0b', <g>{[240, 256, 272, 288, 302].map((x, i) => <g key={x}><path d={`M${x} 114 V100`} stroke="#15803d" strokeWidth="2" /><circle cx={x} cy="98" r="6" fill={i % 2 ? '#e11d48' : '#facc15'} /><circle cx={x} cy="98" r="2.4" fill={i % 2 ? '#9f1239' : '#a16207'} /></g>)}</g>)}
          <Floor color="#d6d3d1" />
        </g>
      );
    }
    case 'station':
      return (
        <g>
          <rect width={W} height="146" fill={`url(#st-sky-${time})`} />
          <Clouds time={time} />
          <rect x="0" y="62" width={W} height="64" rx="6" fill="#e2e8f0" />
          <rect x="0" y="98" width={W} height="8" fill="#2563eb" />
          {Array.from({ length: 8 }, (_, i) => <rect key={i} x={10 + i * 40} y="72" width="26" height="20" rx="3" fill={time === 'night' ? '#fde68a' : '#93c5fd'} />)}
          <rect x="0" y="0" width={W} height="14" fill="#475569" />
          {[40, 160, 280].map((x) => <rect key={x} x={x} y="14" width="5" height="48" fill="#64748b" />)}
          <rect x="122" y="22" width="76" height="20" rx="4" fill="#1e3a8a" />
          <text x="160" y="36" textAnchor="middle" fontSize="10" fontWeight="800" fill="#ffffff" fontFamily="inherit">Platform 4</text>
          <rect x="0" y="126" width={W} height="54" fill="#9ca3af" />
          <rect x="0" y="130" width={W} height="4" fill="#facc15" />
        </g>
      );
    case 'cafe':
      return (
        <g opacity={dim}>
          <rect width={W} height="146" fill="#f5e1c8" />
          <rect x="110" y="20" width="100" height="56" rx="4" fill="#3f3f46" />
          <text x="160" y="40" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fef3c7" fontFamily="inherit">MENU</text>
          <path d="M126 52 H194 M126 62 H180" stroke="#fef3c7" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <Window x={20} y={28} w={56} h={50} time={time} />
          <rect x="230" y="96" width="82" height="50" rx="3" fill="#92400e" />
          <rect x="226" y="90" width="90" height="8" rx="2" fill="#b45309" />
          {[244, 266].map((x) => <g key={x}><rect x={x} y="78" width="12" height="12" rx="2" fill="#ffffff" /><path d={`M${x + 12} 81 q5 2 0 6`} fill="none" stroke="#ffffff" strokeWidth="2" /></g>)}
          <Floor color="#a8a29e" line="#94908b" />
        </g>
      );
    case 'park':
      return (
        <g>
          <rect width={W} height="146" fill={`url(#st-sky-${time})`} />
          <Clouds time={time} />
          {time !== 'night' && <circle cx="282" cy="30" r="14" fill={time === 'evening' ? '#f97316' : '#fde047'} />}
          {[[30, 92, 26], [118, 98, 20], [208, 90, 24]].map(([x, y, r]) => (
            <g key={x}>
              <rect x={x - 4} y={y} width="8" height="50" fill="#92400e" />
              <circle cx={x} cy={y - 6} r={r} fill="#16a34a" />
              <circle cx={x - r * 0.5} cy={y + 2} r={r * 0.6} fill="#22c55e" />
            </g>
          ))}
          <rect x="250" y="116" width="58" height="6" rx="2" fill="#a16207" />
          <rect x="250" y="106" width="58" height="5" rx="2" fill="#a16207" />
          <rect x="254" y="122" width="4" height="18" fill="#78350f" />
          <rect x="300" y="122" width="4" height="18" fill="#78350f" />
          <rect x="0" y="132" width={W} height="48" fill="#86efac" />
          <path d="M96 150 L196 150 L208 172 L84 172 Z" fill="#ef4444" opacity="0.85" />
          <path d="M108 150 L104 172 M132 150 L132 172 M156 150 L160 172 M180 150 L188 172 M90 161 H202" stroke="#ffffff" strokeWidth="3" opacity="0.6" />
        </g>
      );
    case 'shop':
      return (
        <g opacity={dim}>
          <rect width={W} height="146" fill="#ecfeff" />
          {[30, 62, 94].map((y) => (
            <g key={y}>
              <rect x="10" y={y} width="140" height="5" fill="#94a3b8" />
              {Array.from({ length: 9 }, (_, i) => <rect key={i} x={14 + i * 15} y={y - 14} width="11" height="14" rx="2" fill={['#f97316', '#3b82f6', '#22c55e', '#ec4899'][(i + y) % 4]} />)}
            </g>
          ))}
          <rect x="214" y="92" width="96" height="54" rx="3" fill="#0e7490" />
          <rect x="208" y="86" width="108" height="8" rx="2" fill="#155e75" />
          <rect x="246" y="66" width="30" height="20" rx="3" fill="#334155" />
          <Floor color="#cbd5e1" line="#b6c1ce" />
        </g>
      );
    case 'temple': {
      // Prambanan-style candi: plinth, body with a doorway, three stepped roof tiers, a slender finial.
      const candi = (x: number, w: number, h: number) => {
        const base = 136;
        const bodyH = h * 0.34;
        const tierH = h * 0.12;
        const bodyTop = base - 8 - bodyH;
        const tiers = [0.82, 0.62, 0.44].map((k, t) => ({ half: (w * k) / 2, y: bodyTop - tierH * (t + 1) }));
        const tip = tiers[2].y - h * 0.2;
        return (
          <g key={x}>
            <rect x={x - w / 2} y={base - 8} width={w} height="8" fill="#8a817c" />
            <rect x={x - w * 0.38} y={bodyTop} width={w * 0.76} height={bodyH} fill="#a8a29e" />
            <path d={`M${x - w * 0.11} ${base - 8} V${bodyTop + bodyH * 0.35} Q${x} ${bodyTop + bodyH * 0.18} ${x + w * 0.11} ${bodyTop + bodyH * 0.35} V${base - 8} Z`} fill="#57534e" />
            {tiers.map((t, k) => (
              <g key={k}>
                <path d={`M${x - t.half} ${t.y + tierH} L${x - t.half * 0.86} ${t.y} H${x + t.half * 0.86} L${x + t.half} ${t.y + tierH} Z`} fill={k % 2 ? '#a8a29e' : '#b8b2ad'} />
                <circle cx={x - t.half * 0.86} cy={t.y - 1.5} r={Math.max(1.6, w * 0.035)} fill="#8a817c" />
                <circle cx={x + t.half * 0.86} cy={t.y - 1.5} r={Math.max(1.6, w * 0.035)} fill="#8a817c" />
              </g>
            ))}
            <path d={`M${x - tiers[2].half * 0.6} ${tiers[2].y} L${x} ${tip} L${x + tiers[2].half * 0.6} ${tiers[2].y} Z`} fill="#b8b2ad" />
            <rect x={x - 1} y={tip - 6} width="2" height="7" fill="#8a817c" />
          </g>
        );
      };
      return (
        <g>
          <rect width={W} height="146" fill={`url(#st-sky-${time})`} />
          <Clouds time={time} />
          {candi(116, 26, 46)}
          {candi(204, 26, 46)}
          {candi(70, 52, 78)}
          {candi(250, 52, 78)}
          {candi(160, 70, 112)}
          <rect x="0" y="136" width={W} height="44" fill="#d6d3d1" />
          <rect x="0" y="136" width={W} height="5" fill="#86efac" />
        </g>
      );
    }
  }
}

// ---------------------------------------------------------------- characters
const ARMS: Record<StoryPose, [number, number]> = {
  stand: [10, -10], wave: [10, -150], point: [10, -85], happy: [40, -40], sad: [3, -3], surprised: [140, -140], think: [10, 30],
};
const SCALE: Record<StoryCharacter['look'], number> = { man: 0.92, woman: 0.88, boy: 0.78, girl: 0.76, grandpa: 0.86, grandma: 0.82, pijar: 1 };
const DRESS = new Set(['woman', 'girl', 'grandma']);

function Hair({ c }: { c: StoryCharacter }) {
  const hair = c.hair ?? '#1c1917';
  switch (c.look) {
    case 'girl':
      return (
        <>
          <circle cx="-15" cy="4" r="5.5" fill={hair} />
          <circle cx="15" cy="4" r="5.5" fill={hair} />
          <path d="M-13 -1 Q-14 -15 0 -15 Q14 -15 13 -1 Q9 -8 4 -9 Q0 -5 -6 -9 Q-10 -7 -13 -1 Z" fill={hair} />
        </>
      );
    case 'woman':
      return <path d="M-13 -1 Q-14 -15 0 -15 Q14 -15 13 -1 Q8 -9 0 -10 Q-8 -9 -13 -1 Z" fill={hair} />;
    case 'grandma':
      return (
        <>
          <circle cx="0" cy="-15" r="6" fill={hair} />
          <path d="M-13 -1 Q-14 -15 0 -14 Q14 -15 13 -1 Q8 -8 0 -9 Q-8 -8 -13 -1 Z" fill={hair} />
        </>
      );
    case 'grandpa':
      return <path d="M-13 2 Q-14 -6 -10 -9 M13 2 Q14 -6 10 -9" stroke={hair} strokeWidth="4" strokeLinecap="round" fill="none" />;
    default:
      return <path d="M-13 -2 Q-14 -15 0 -15 Q14 -15 13 -2 Q10 -7 4 -8 Q-2 -11 -7 -7 Q-11 -6 -13 -2 Z" fill={hair} />;
  }
}

function HairBack({ c }: { c: StoryCharacter }) {
  if (c.hijab) return <path d="M-16 0 Q-17 -17 0 -17 Q17 -17 16 0 Q18 14 22 22 L-22 22 Q-18 14 -16 0 Z" fill={c.hijab} />;
  if (c.look === 'woman') return <path d="M-14 -4 Q-17 16 -13 20 L13 20 Q17 16 14 -4 Z" fill={c.hair ?? '#1c1917'} />;
  return null;
}

function Mouth({ pose, talking }: { pose: StoryPose; talking: boolean }) {
  if (talking) return <ellipse cx="0" cy="6.5" rx="3" ry="2.6" fill="#7f1d1d" className="st-talk" />;
  if (pose === 'surprised') return <ellipse cx="0" cy="7" rx="2.4" ry="3" fill="#7f1d1d" />;
  if (pose === 'sad') return <path d="M-4 8.5 Q0 4.5 4 8.5" fill="none" stroke="#7f1d1d" strokeWidth="1.6" strokeLinecap="round" />;
  if (pose === 'happy' || pose === 'wave') return <path d="M-5 4 Q0 11 5 4 Z" fill="#7f1d1d" />;
  return <path d="M-4 5 Q0 9 4 5" fill="none" stroke="#7f1d1d" strokeWidth="1.6" strokeLinecap="round" />;
}

function Person({ c, pose, talking }: { c: StoryCharacter; pose: StoryPose; talking: boolean }) {
  const skin = c.skin ?? '#f4d0b2';
  const dress = DRESS.has(c.look);
  const pants = c.look === 'grandpa' ? '#57534e' : '#334155';
  const [la, ra] = ARMS[pose];
  const tilt = pose === 'sad' ? 8 : pose === 'think' ? -6 : 0;
  const arm = (side: -1 | 1, angle: number) => (
    <g transform={`translate(${side * 14} -63)`}>
      <g className={`st-arm${side === 1 && pose === 'wave' ? ' st-wave' : ''}`} style={{ transform: `rotate(${angle}deg)` }}>
        <rect x="-3.5" y="0" width="7" height="30" rx="3.5" fill={c.shirt} />
        <circle cx="0" cy="31" r="4" fill={skin} />
      </g>
    </g>
  );
  return (
    <g>
      <ellipse cx="0" cy="1" rx="18" ry="3" fill="#000" opacity="0.12" />
      {dress ? (
        <>
          <rect x="-9" y="-26" width="6" height="25" rx="3" fill={skin} />
          <rect x="3" y="-26" width="6" height="25" rx="3" fill={skin} />
        </>
      ) : (
        <>
          <rect x="-10" y="-34" width="8" height="33" rx="3" fill={pants} />
          <rect x="2" y="-34" width="8" height="33" rx="3" fill={pants} />
        </>
      )}
      <ellipse cx="-7" cy="-1" rx="6" ry="3" fill="#1f2937" />
      <ellipse cx="7" cy="-1" rx="6" ry="3" fill="#1f2937" />
      {arm(-1, la)}
      {dress
        ? <path d="M-15 -66 Q-16 -52 -21 -24 L21 -24 Q16 -52 15 -66 Q0 -71 -15 -66 Z" fill={c.shirt} />
        : <path d="M-16 -66 Q-17 -50 -14 -32 L14 -32 Q17 -50 16 -66 Q0 -71 -16 -66 Z" fill={c.shirt} />}
      {arm(1, ra)}
      <rect x="-3.5" y="-73" width="7" height="9" fill={skin} />
      <g transform={`translate(0 -84) rotate(${tilt})`}>
        <HairBack c={c} />
        {c.hijab ? <ellipse cx="0" cy="1" rx="10.5" ry="12" fill={skin} /> : <circle cx="0" cy="0" r="13" fill={skin} />}
        {!c.hijab && <Hair c={c} />}
        <g className="st-blink">
          <ellipse cx="-4.5" cy="0" rx="1.6" ry="2" fill="#1c1917" />
          <ellipse cx="4.5" cy="0" rx="1.6" ry="2" fill="#1c1917" />
        </g>
        {(c.look === 'grandma' || c.look === 'grandpa') && <path d="M-8.5 0 a3.5 3.5 0 1 0 7 0 a3.5 3.5 0 1 0 -7 0 M1.5 0 a3.5 3.5 0 1 0 7 0 a3.5 3.5 0 1 0 -7 0 M-1.5 0 H1.5" fill="none" stroke="#334155" strokeWidth="1.1" />}
        <circle cx="-8" cy="5" r="2.2" fill="#fb7185" opacity="0.45" />
        <circle cx="8" cy="5" r="2.2" fill="#fb7185" opacity="0.45" />
        <Mouth pose={pose} talking={talking} />
      </g>
      {pose === 'think' && <circle cx="5" cy="-73" r="4" fill={skin} />}
    </g>
  );
}

const PIJAR_MOOD: Record<StoryPose, Mood> = { stand: 'happy', wave: 'cheer', happy: 'cheer', sad: 'sad', surprised: 'cheer', think: 'think', point: 'happy' };

/** Speech marker above whoever is talking. */
function Talking({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden>
      <path d="M-14 -10 H14 a5 5 0 0 1 5 5 V3 a5 5 0 0 1 -5 5 H4 L0 13 L-4 8 H-14 a5 5 0 0 1 -5 -5 V-5 a5 5 0 0 1 5 -5 Z" fill="#ffffff" stroke="#c7d2fe" strokeWidth="1.5" />
      {[-7, 0, 7].map((dx) => <circle key={dx} cx={dx} cy="-1" r="2" fill="#4b3fd6" className="st-dot" />)}
    </g>
  );
}

export interface StageProps {
  scene: StoryScene;
  characters: StoryCharacter[];
  /** Who is speaking now ("narrator" or a character id). */
  speaker?: string;
  /** Pose of the speaker for the current line. */
  speakerPose?: StoryPose;
  /** Changes with every line so jumps and waves replay. */
  beat: number;
  label: string;
}

export function StoryStage({ scene, characters, speaker, speakerPose, beat, label }: StageProps) {
  const time: Time = scene.time ?? 'day';
  const cast = new Map(characters.map((c) => [c.id, c]));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="story-stage block h-auto w-full select-none" role="img" aria-label={label}>
      <defs>
        {(Object.keys(SKY) as Time[]).map((t) => (
          <linearGradient key={t} id={`st-sky-${t}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SKY[t][0]} />
            <stop offset="100%" stopColor={SKY[t][1]} />
          </linearGradient>
        ))}
      </defs>
      <PijarDefs />
      <Backdrop type={scene.backdrop} time={time} />
      {time === 'night' && <rect width={W} height={H} fill="#1e1b4b" opacity="0.18" />}
      {scene.actors.map((a) => {
        const c = cast.get(a.who);
        if (!c) return null;
        const talking = speaker === a.who;
        const pose: StoryPose = (talking && speakerPose) || a.pose || 'stand';
        const x = X[a.at];
        const enter = a.enter ? ` st-enter-${a.enter}` : '';
        const motion = talking && pose === 'surprised' ? 'st-jump' : talking ? 'st-speaking' : '';
        if (c.look === 'pijar') {
          return (
            <g key={a.who} transform={`translate(${x - 21} ${FLOOR - 118})`}>
              <g className={`st-actor${enter}`}>
                <g key={talking ? beat : 'idle'} className={motion}>
                  <g transform="scale(0.44)"><PijarFigure mood={PIJAR_MOOD[pose]} /></g>
                </g>
              </g>
              {talking && <Talking x={21} y={-6} />}
            </g>
          );
        }
        const s = SCALE[c.look];
        return (
          <g key={a.who} transform={`translate(${x} ${FLOOR})`}>
            <g className={`st-actor${enter}`}>
              <g key={talking ? beat : 'idle'} className={motion}>
                <g transform={`scale(${s})`}><Person c={c} pose={pose} talking={talking} /></g>
              </g>
            </g>
            {talking && <Talking x={0} y={-100 * s - 14} />}
          </g>
        );
      })}
    </svg>
  );
}
