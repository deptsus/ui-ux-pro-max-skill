'use client';
import { useMemo, useState } from 'react';
import { CalendarClock, Check, Crown, Search } from 'lucide-react';
import { learnVocab } from '@/lib/engine/state';
import { useApp } from '@/lib/client/hooks';
import { act } from '@/lib/client/store';
import { AudioButton } from '@/components/AudioButton';
import { Badge, Button, Card, LinkButton, PageHeader, dateId, inputClass } from '@/components/ui';

export default function VocabularyPage() {
  const { ix, learner, now, premium } = useApp();
  const [q, setQ] = useState('');
  const groups = useMemo(() => {
    const term = q.trim().toLowerCase();
    const map = new Map<string, typeof ix.pack.vocabulary>();
    for (const v of ix.pack.vocabulary) {
      if (term && !v.word.toLowerCase().includes(term) && !v.meaning.toLowerCase().includes(term)) continue;
      const key = `${v.level} · ${v.set}`;
      map.set(key, [...(map.get(key) ?? []), v]);
    }
    return [...map.entries()];
  }, [ix, q]);
  const learned = Object.keys(learner.vocabLearned).length;

  return (
    <div>
      <PageHeader title="Pustaka Kosakata" subtitle="Setiap kata dilengkapi IPA, arti, contoh kalimat, dan audio. Kata yang kamu pelajari masuk ke ulangan terjadwal." action={<Badge tone="ok">{learned} kata dipelajari</Badge>} />
      <label className="relative mb-5 block">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} aria-hidden />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari kata atau arti" aria-label="Cari kosakata" className={`${inputClass} pl-11`} />
      </label>
      {groups.length === 0 && <Card className="text-muted">Tidak ada kata yang cocok dengan pencarianmu.</Card>}
      {groups.map(([title, words]) => (
        <section key={title} className="mb-6">
          <h2 className="mb-2 text-lg font-extrabold">{title} <span className="text-sm font-bold text-muted">({words.length} kata)</span></h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {words.map((v) => {
              const review = learner.reviews[`vocab:${v.id}`];
              return (
                <Card as="li" key={v.id} className="flex flex-col gap-2 p-4">
                  <div className="flex items-start gap-3">
                    <AudioButton text={v.word} audioKey={v.audioKey} size="sm" label={`Dengarkan ${v.word}`} />
                    <div className="min-w-0 flex-1">
                      <p className="en text-lg font-extrabold">{v.word} <span className="text-sm font-semibold text-muted">{v.ipa}</span></p>
                      <p className="text-sm"><span className="text-muted">({v.pos})</span> <span className="font-bold">{v.meaning}</span></p>
                    </div>
                  </div>
                  <p className="en rounded-xl bg-surface-2 px-3 py-2 text-sm">{v.example}<span className="mt-0.5 block text-muted">{v.exampleId}</span></p>
                  {review ? (
                    <p className="flex items-center gap-1.5 text-xs font-bold text-ok"><Check size={14} aria-hidden />Dipelajari<span className="ml-auto flex items-center gap-1 font-semibold text-muted"><CalendarClock size={13} aria-hidden />{review.dueAt <= now ? 'ulangan menunggu' : `ulangan ${dateId(review.dueAt, { day: 'numeric', month: 'short' })}`}</span></p>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => act((d, at) => learnVocab(d, v.id, at))}>Pelajari dan jadwalkan ulangan</Button>
                  )}
                </Card>
              );
            })}
          </ul>
        </section>
      ))}
      {!premium && (
        <Card className="flex flex-wrap items-center gap-3 border-2 border-accent">
          <Crown className="text-accent" aria-hidden />
          <div className="min-w-0 flex-1"><p className="font-extrabold">Kosakata A2 sampai C1</p><p className="text-sm text-muted">Set Masa Lalu, Perjalanan, Dunia Kerja, Akademik, dan Register Formal tersedia di Premium.</p></div>
          <LinkButton href="/app/subscription" variant="accent" size="sm">Lihat Premium</LinkButton>
        </Card>
      )}
    </div>
  );
}
