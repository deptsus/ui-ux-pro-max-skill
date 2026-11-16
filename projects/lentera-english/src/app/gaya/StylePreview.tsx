'use client';
// Rilis 14 style preview: the 2.5D cast, Pijar's expressions, the clay controls,
// and one interactive question, for the owner to approve before the rollout.
import { useState } from 'react';
import { Check, Flame, Heart, X, Zap } from 'lucide-react';
import { Mascot } from '@/components/Mascot';
import { CAST, CastMember, type CastId } from '@/components/cast/Kid';
import { MOODS, MOOD_LABEL, type Mood } from '@/components/cast/Face';

const clayCard = 'rounded-3xl border-[3px] border-[#1e1b3a]/85 bg-surface shadow-[0_6px_0_rgba(30,27,58,0.85)]';
const btn = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-[3px] border-[#1e1b3a] px-6 py-3 font-display text-lg font-bold tracking-wide transition-[transform,box-shadow] duration-100 active:translate-y-[4px] active:shadow-[0_1px_0_#1e1b3a]';

function Title({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 font-display text-2xl font-bold tracking-tight">{children}</h2>;
}

export function StylePreview() {
  const [pick, setPick] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const right = pick === 'is';
  const options = ['are', 'is', 'am'];

  return (
    <main className="mx-auto max-w-5xl space-y-10 px-4 py-8">
      <header className="flex flex-wrap items-center gap-4">
        <Mascot mood="cheer" size={84} />
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-widest text-brand">Pratinjau gaya baru · Rilis 14</p>
          <h1 className="font-display text-4xl font-extrabold leading-tight">Lentera yang lebih hidup</h1>
          <p className="text-muted">Karakter 2.5D (garis tebal, bayangan lembut, kilau), 14 ekspresi, tombol dan kartu yang terasa bisa ditekan.</p>
        </div>
      </header>

      <section aria-labelledby="t-pijar">
        <Title><span id="t-pijar">Pijar · 14 ekspresi</span></Title>
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
          {MOODS.map((m) => (
            <li key={m} className={`${clayCard} flex flex-col items-center gap-1 px-2 pb-3 pt-4`}>
              <Mascot mood={m} size={88} />
              <span className="font-display text-sm font-bold capitalize">{MOOD_LABEL[m]}</span>
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
              <p className="mt-1 font-display text-xl font-bold">{CAST[id].name}</p>
              <p className="text-sm text-muted">{CAST[id].role}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="t-faces">
        <Title><span id="t-faces">Ekspresi teman belajar</span></Title>
        <div className={`${clayCard} overflow-x-auto p-4`}>
          <table className="w-full min-w-[40rem] text-center">
            <thead><tr><th className="sr-only">Karakter</th>{(['cheer', 'laugh', 'think', 'surprised', 'confused', 'sad', 'love'] as Mood[]).map((m) => <th key={m} className="pb-2 font-display text-sm font-bold capitalize text-muted">{MOOD_LABEL[m]}</th>)}</tr></thead>
            <tbody>
              {(Object.keys(CAST) as CastId[]).map((id) => (
                <tr key={id}>
                  <th scope="row" className="pr-2 text-left font-display font-bold">{CAST[id].name}</th>
                  {(['cheer', 'laugh', 'think', 'surprised', 'confused', 'sad', 'love'] as Mood[]).map((m) => <td key={m} className="py-1"><CastMember who={id} mood={m} size={72} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="t-ui" className="grid gap-6 lg:grid-cols-2">
        <div>
          <Title><span id="t-ui">Tombol dan kartu</span></Title>
          <div className={`${clayCard} space-y-4 p-5`}>
            <div className="flex flex-wrap gap-3">
              <button className={`${btn} bg-brand text-on-brand shadow-[0_5px_0_#1e1b3a]`}>Mulai belajar</button>
              <button className={`${btn} bg-accent text-[#1e1b3a] shadow-[0_5px_0_#1e1b3a]`}>Lihat Premium</button>
              <button className={`${btn} bg-surface text-ink shadow-[0_5px_0_#1e1b3a]`}>Lewati</button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border-[3px] border-[#1e1b3a] bg-[#fff1d6] px-3 py-1 font-display text-lg font-bold text-[#c2410c] shadow-[0_3px_0_#1e1b3a]"><Flame size={20} fill="#fb923c" aria-hidden />12</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border-[3px] border-[#1e1b3a] bg-[#ece9ff] px-3 py-1 font-display text-lg font-bold text-brand shadow-[0_3px_0_#1e1b3a]"><Zap size={20} fill="currentColor" aria-hidden />1.240</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border-[3px] border-[#1e1b3a] bg-[#ffe4ea] px-3 py-1 font-display text-lg font-bold text-[#e11d48] shadow-[0_3px_0_#1e1b3a]"><Heart size={20} fill="currentColor" aria-hidden />5</span>
            </div>
            <div>
              <div className="mb-1 flex justify-between font-display font-bold"><span>Target hari ini</span><span>30 / 50 XP</span></div>
              <div className="h-5 overflow-hidden rounded-full border-[3px] border-[#1e1b3a] bg-surface-2">
                <div className="relative h-full w-3/5 rounded-full bg-[#22c55e]"><span className="absolute inset-x-2 top-1 h-1 rounded-full bg-white/50" /></div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Title>Contoh soal interaktif</Title>
          <div className={`${clayCard} space-y-4 p-5`}>
            <div className="flex items-end gap-3">
              <CastMember who="lina" mood={!checked ? 'happy' : right ? 'cheer' : 'encourage'} size={92} />
              <div className="relative rounded-2xl border-[3px] border-[#1e1b3a] bg-surface px-4 py-3 shadow-[0_4px_0_#1e1b3a]">
                <p className="font-display text-lg font-bold">Pilih kata yang tepat:</p>
                <p className="text-xl"><span className="font-bold">She ___ a student.</span></p>
              </div>
            </div>
            <div role="radiogroup" aria-label="Pilihan jawaban" className="grid grid-cols-3 gap-3">
              {options.map((o) => {
                const chosen = pick === o;
                const tone = checked && chosen ? (right ? 'border-[#16a34a] bg-[#dcfce7] shadow-[0_5px_0_#16a34a]' : 'border-[#e11d48] bg-[#ffe4ea] shadow-[0_5px_0_#e11d48]') : chosen ? 'border-brand bg-brand-soft shadow-[0_5px_0_var(--brand)]' : 'border-[#1e1b3a]/30 bg-surface shadow-[0_5px_0_rgba(30,27,58,0.3)]';
                return (
                  <button key={o} role="radio" aria-checked={chosen} disabled={checked} onClick={() => setPick(o)} className={`min-h-16 rounded-2xl border-[3px] font-display text-2xl font-bold transition-[transform,box-shadow] duration-100 active:translate-y-[4px] active:shadow-none ${tone}`}>{o}</button>
                );
              })}
            </div>
            {checked ? (
              <div className={`flex items-center gap-3 rounded-2xl border-[3px] p-3 ${right ? 'border-[#16a34a] bg-[#dcfce7]' : 'border-[#e11d48] bg-[#ffe4ea]'}`} role="status">
                <Mascot mood={right ? 'laugh' : 'encourage'} size={64} decorative />
                <div className="min-w-0 flex-1">
                  <p className={`flex items-center gap-1 font-display text-xl font-extrabold ${right ? 'text-[#15803d]' : 'text-[#be123c]'}`}>{right ? <Check size={22} aria-hidden /> : <X size={22} aria-hidden />}{right ? 'Hebat! Benar.' : 'Hampir!'}</p>
                  <p className="text-sm">{right ? '“She” pakai “is”: She is a student.' : 'Untuk “she”, to be-nya “is”: She is a student.'}</p>
                </div>
                <button className={`${btn} ${right ? 'bg-[#22c55e]' : 'bg-[#f43f5e]'} text-white shadow-[0_5px_0_#1e1b3a]`} onClick={() => { setPick(null); setChecked(false); }}>Lanjut</button>
              </div>
            ) : (
              <button className={`${btn} w-full bg-brand text-on-brand shadow-[0_5px_0_#1e1b3a] disabled:opacity-50`} disabled={!pick} onClick={() => setChecked(true)}>Periksa</button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
