import type { Phoneme } from '@/lib/content/types';

// Schematic side view of the mouth. It shows where the tongue tip goes and
// what the lips do; it is a teaching diagram, not an anatomical drawing.
const TONGUE: Record<Phoneme['mouth']['tongue'], { tip: [number, number]; body: [number, number]; note: string }> = {
  dental: { tip: [33, 62], body: [70, 66], note: 'Ujung lidah di antara gigi' },
  alveolar: { tip: [46, 52], body: [72, 62], note: 'Ujung lidah di gusi belakang gigi atas' },
  'post-alveolar': { tip: [54, 50], body: [76, 58], note: 'Lidah sedikit ke belakang gusi' },
  retroflex: { tip: [60, 47], body: [80, 66], note: 'Ujung lidah melengkung ke belakang, tidak menyentuh' },
  'low-front': { tip: [46, 76], body: [74, 76], note: 'Lidah rendah di depan, rahang terbuka' },
  'high-front': { tip: [44, 66], body: [66, 50], note: 'Badan lidah tinggi di depan' },
  back: { tip: [50, 74], body: [84, 52], note: 'Badan lidah naik di belakang' },
};
const LIPS: Record<Phoneme['mouth']['lips'], string> = { spread: 'Bibir ditarik ke samping', round: 'Bibir dibulatkan', neutral: 'Bibir rileks', 'teeth-lip': 'Gigi atas menyentuh bibir bawah' };

export function Mouth({ mouth }: { mouth: Phoneme['mouth'] }) {
  const t = TONGUE[mouth.tongue];
  const open = mouth.tongue === 'low-front' ? 10 : 0;
  const round = mouth.lips === 'round';
  return (
    <figure className="rounded-2xl bg-surface-2 p-3">
      <svg viewBox="0 0 140 110" className="mx-auto w-full max-w-64" role="img" aria-label={`Ilustrasi mulut: ${t.note}. ${LIPS[mouth.lips]}.`}>
        {/* roof of the mouth and upper teeth */}
        <path d="M24 48 Q30 30 60 30 Q100 30 124 48" fill="none" stroke="var(--muted)" strokeWidth="3" strokeLinecap="round" />
        <rect x="30" y="48" width="6" height="12" rx="2" fill="var(--surface)" stroke="var(--muted)" strokeWidth="1.5" />
        <path d="M38 48 Q42 44 48 47" fill="none" stroke="var(--bad)" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        {/* lower jaw and lower teeth */}
        <path d={`M24 ${70 + open} Q60 ${98 + open} 124 ${84 + open}`} fill="none" stroke="var(--muted)" strokeWidth="3" strokeLinecap="round" />
        <rect x="31" y={mouth.lips === 'teeth-lip' ? 66 : 64 + open} width="6" height="10" rx="2" fill="var(--surface)" stroke="var(--muted)" strokeWidth="1.5" />
        {/* lips */}
        <ellipse cx={round ? 16 : 20} cy="50" rx={round ? 9 : 6} ry={round ? 6 : 5} fill="var(--bad)" opacity="0.75" />
        <ellipse cx={round ? 16 : mouth.lips === 'teeth-lip' ? 27 : 20} cy={mouth.lips === 'teeth-lip' ? 62 : 70 + open} rx={round ? 9 : 6} ry={round ? 6 : 5} fill="var(--bad)" opacity="0.75" />
        {/* tongue */}
        <path d={`M124 ${88 + open} Q${t.body[0]} ${t.body[1] - 14 + open / 2} ${t.tip[0]} ${t.tip[1] + open / 2} Q${t.tip[0] + 6} ${t.tip[1] + 16 + open / 2} 70 ${86 + open} Z`} fill="var(--brand)" opacity="0.85" />
        <circle cx={t.tip[0]} cy={t.tip[1] + open / 2} r="3.5" fill="var(--accent)" />
        {/* voicing */}
        {mouth.voiced ? (
          <path d="M112 96 q4 -5 8 0 q4 5 8 0 M112 104 q4 -5 8 0 q4 5 8 0" fill="none" stroke="var(--ok)" strokeWidth="2" strokeLinecap="round" />
        ) : (
          <path d="M112 100 H128" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 4" />
        )}
      </svg>
      <figcaption className="mt-2 space-y-0.5 text-xs text-muted">
        <p><span className="inline-block h-2 w-2 rounded-full bg-accent" /> {t.note}</p>
        <p>{LIPS[mouth.lips]} · {mouth.voiced ? 'bersuara (pita suara bergetar)' : 'tak bersuara (hanya embusan udara)'}</p>
      </figcaption>
    </figure>
  );
}
