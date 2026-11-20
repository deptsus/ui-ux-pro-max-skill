'use client';
// Illustration library: the 2.5D cast, Pijar's expressions, vocabulary pictures and the
// position scenes (Rilis 14–15). The UI components are in Gallery.tsx.
import { Mascot } from '@/components/Mascot';
import { CAST, CastMember, type CastId } from '@/components/cast/Kid';
import { MOODS, MOOD_LABEL, type Mood } from '@/components/cast/Face';
import { Pic } from '@/components/pics/Pic';
import { SceneChoice } from '@/components/interactive/Interactive';
import type { Exercise, Spot } from '@/lib/content/types';
import { PICS, type PicKey } from '@/lib/content/pics';

const clayCard = 'rounded-2xl border border-line bg-surface';

const SCENES: [NonNullable<Exercise['scene']>['place'], string, Spot[]][] = [
  ['table', 'book', ['on', 'under', 'next', 'behind']],
  ['box', 'ball', ['in', 'on', 'next', 'behind', 'front']],
  ['bed', 'cat', ['on', 'under', 'next']],
  ['chair', 'bag', ['on', 'under', 'next', 'behind']],
];

function Title({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 text-xl font-extrabold">{children}</h3>;
}

export function StylePreview() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 pb-12">
      <header className="flex flex-wrap items-center gap-4 border-t border-line pt-8">
        <Mascot mood="cheer" size={84} />
        <div>
          <h2 className="text-2xl font-extrabold">Ilustrasi</h2>
          <p className="text-muted">Karakter 2.5D dan gambar kosakata. Dipakai di momen tertentu: onboarding, keadaan kosong, umpan balik, dan perayaan.</p>
        </div>
      </header>

      <section aria-labelledby="t-pijar">
        <Title><span id="t-pijar">Pijar · 14 ekspresi</span></Title>
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
          {MOODS.map((m) => (
            <li key={m} className={`${clayCard} flex flex-col items-center gap-1 px-2 pb-3 pt-4`}>
              <Mascot mood={m} size={88} />
              <span className="text-sm font-bold capitalize">{MOOD_LABEL[m]}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="t-cast">
        <Title><span id="t-cast">Teman belajar</span></Title>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {(Object.keys(CAST) as CastId[]).map((id) => (
            <li key={id} className={`${clayCard} flex flex-col items-center px-3 pb-4 pt-5 text-center`}>
              <CastMember who={id} mood="happy" size={120} />
              <p className="mt-1 text-lg font-extrabold">{CAST[id].name}</p>
              <p className="text-sm text-muted">{CAST[id].role}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="t-faces">
        <Title><span id="t-faces">Ekspresi teman belajar</span></Title>
        <div className={`${clayCard} overflow-x-auto p-4`}>
          <table className="w-full min-w-[40rem] text-center">
            <thead><tr><th className="sr-only">Karakter</th>{(['cheer', 'laugh', 'think', 'surprised', 'confused', 'sad', 'love'] as Mood[]).map((m) => <th key={m} className="pb-2 text-sm font-bold capitalize text-muted">{MOOD_LABEL[m]}</th>)}</tr></thead>
            <tbody>
              {(Object.keys(CAST) as CastId[]).map((id) => (
                <tr key={id}>
                  <th scope="row" className="pr-2 text-left font-bold">{CAST[id].name}</th>
                  {(['cheer', 'laugh', 'think', 'surprised', 'confused', 'sad', 'love'] as Mood[]).map((m) => <td key={m} className="py-1"><CastMember who={id} mood={m} size={72} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="t-pics">
        <Title><span id="t-pics">Pustaka gambar kosakata · Rilis 15</span></Title>
        <ul className={`${clayCard} grid grid-cols-4 gap-3 p-4 sm:grid-cols-6 lg:grid-cols-8`}>
          {(Object.keys(PICS) as PicKey[]).map((k) => (
            <li key={k} className="flex flex-col items-center gap-1 text-center">
              <Pic k={k} size={64} />
              <span className="en text-sm font-bold">{PICS[k][0]}</span>
              <span className="text-xs text-muted">{PICS[k][1]}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="t-scenes">
        <Title><span id="t-scenes">Adegan letak benda · Rilis 15</span></Title>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SCENES.map(([place, object, spots]) => spots.map((spot) => {
            const ex: Exercise = { id: `gaya.${place}.${spot}`, lessonId: null, stage: 'drill', position: 0, topic: 'a1.greetings', type: 'scene', difficulty: 1, prompt: '', explanation: '', scene: { place, object }, options: spots.map((sp, i) => ({ text: sp, spot: sp, ...(i === 0 ? { correct: true } : { why: '-' }) })) };
            return (
              <li key={`${place}-${spot}`} className={`${clayCard} p-3`}>
                <p className="mb-2 font-bold">{object} · {spot} · {place}</p>
                <SceneChoice ex={ex} order={spots.map((_, i) => i)} choice={spots.indexOf(spot)} locked={false} onPick={() => {}} />
              </li>
            );
          }))}
        </ul>
      </section>

    </div>
  );
}
