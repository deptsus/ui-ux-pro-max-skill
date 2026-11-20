'use client';
// Pustaka Kosakata. Redesign 2026: one CEFR level at a time (search looks through all of them),
// compact rows with audio, and the full entry (IPA, example, review schedule) in a bottom sheet.
import { useMemo, useState } from 'react';
import { CalendarClock, Check, Crown, Search } from 'lucide-react';
import { CEFR_ORDER, type Cefr, type VocabItem } from '@/lib/content/types';
import { learnVocab } from '@/lib/engine/state';
import { useApp } from '@/lib/client/hooks';
import { act } from '@/lib/client/store';
import { AudioButton } from '@/components/AudioButton';
import { Badge, Button, LinkButton, ListGroup, ListRow, Notice, PageHeader, Segmented, Sheet, dateId, inputClass } from '@/components/ui';

export default function VocabularyPage() {
  const { ix, learner, now, premium } = useApp();
  const [q, setQ] = useState('');
  const levels = useMemo(() => CEFR_ORDER.filter((c) => ix.pack.vocabulary.some((v) => v.level === c)), [ix]);
  const start = learner.profile.placementLevel && levels.includes(learner.profile.placementLevel) ? learner.profile.placementLevel : levels[0] ?? 'A1';
  const [level, setLevel] = useState<Cefr>(start);
  const [open, setOpen] = useState<VocabItem | null>(null);
  const term = q.trim().toLowerCase();
  const groups = useMemo(() => {
    const map = new Map<string, VocabItem[]>();
    for (const v of ix.pack.vocabulary) {
      if (term ? !v.word.toLowerCase().includes(term) && !v.meaning.toLowerCase().includes(term) : v.level !== level) continue;
      const key = `${v.level} · ${v.set}`;
      map.set(key, [...(map.get(key) ?? []), v]);
    }
    return [...map.entries()];
  }, [ix, term, level]);
  const learned = Object.keys(learner.vocabLearned).length;
  const review = open ? learner.reviews[`vocab:${open.id}`] : undefined;

  return (
    <div>
      <PageHeader title="Pustaka Kosakata" subtitle="Setiap kata dilengkapi IPA, arti, contoh kalimat, dan audio. Kata yang kamu pelajari masuk ke ulangan terjadwal." action={<Badge tone="ok">{learned} kata dipelajari</Badge>} />
      <div className="sticky top-[calc(var(--app-header)+env(safe-area-inset-top))] z-[5] -mx-4 mb-5 space-y-2 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} aria-hidden />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari kata atau arti" aria-label="Cari kosakata" className={`${inputClass} pl-11`} />
        </label>
        {!term && levels.length > 1 && <Segmented label="Level" value={level} onChange={setLevel} full options={levels.map((c) => ({ value: c, label: c }))} />}
        {term && <p className="text-sm text-muted" role="status">Mencari di semua level.</p>}
      </div>
      {groups.length === 0 && <Notice tone="muted">Tidak ada kata yang cocok dengan pencarianmu.</Notice>}
      <div className="space-y-6">
        {groups.map(([title, words]) => (
          <section key={title} aria-label={title}>
            <h2 className="mb-2 px-1 text-base font-extrabold">{title} <span className="text-sm font-bold text-muted">({words.length} kata)</span></h2>
            <ListGroup>
              {words.map((v) => {
                const r = learner.reviews[`vocab:${v.id}`];
                return (
                  <li key={v.id} className="flex items-center gap-2 py-1.5 pl-1 pr-3">
                    <button type="button" onClick={() => setOpen(v)} className="flex min-h-12 min-w-0 flex-1 flex-col justify-center rounded-xl px-3 py-1.5 text-left hover:bg-surface-2">
                      <span className="flex flex-wrap items-baseline gap-x-2"><span lang="en" className="text-lg font-extrabold">{v.word}</span><span className="ipa text-sm text-muted">{v.ipa}</span>{r && <Check size={14} className="self-center text-ok" aria-label="sudah dipelajari" />}</span>
                      <span className="text-sm"><span className="text-muted">({v.pos})</span> {v.meaning}</span>
                    </button>
                    <AudioButton text={v.word} audioKey={v.audioKey} size="sm" label={`Dengarkan ${v.word}`} />
                  </li>
                );
              })}
            </ListGroup>
          </section>
        ))}
      </div>
      {!premium && (
        <ListGroup className="mt-6">
          <ListRow href="/app/subscription" icon={<Crown size={20} />} iconTone="accent" title="Kosakata A2 sampai C1" subtitle="Set Masa Lalu, Perjalanan, Dunia Kerja, Akademik, dan Register Formal tersedia di Premium." />
        </ListGroup>
      )}

      <Sheet open={!!open} onClose={() => setOpen(null)} title={open ? <span lang="en">{open.word}</span> : ''}
        footer={open && (review ? undefined : <Button full onClick={() => { act((d, at) => learnVocab(d, open.id, at)); }}>Pelajari dan jadwalkan ulangan</Button>)}>
        {open && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <AudioButton text={open.word} audioKey={open.audioKey} size="md" label={`Dengarkan ${open.word} (detail)`} />
              <p><span className="ipa text-lg">{open.ipa}</span><span className="block text-sm text-muted">{open.level} · {open.set}</span></p>
            </div>
            <p><span className="text-muted">({open.pos})</span> <span className="text-lg font-bold">{open.meaning}</span></p>
            <div className="rounded-xl bg-surface-2 px-4 py-3 dark:bg-line/60">
              <p lang="en" className="font-semibold">{open.example}</p>
              <p className="mt-0.5 text-sm text-muted">{open.exampleId}</p>
              <div className="mt-2"><AudioButton text={open.example} size="sm" label="Dengarkan contoh" /></div>
            </div>
            {review && <p className="flex items-center gap-1.5 text-sm font-bold text-ok"><Check size={16} aria-hidden />Dipelajari<span className="ml-auto flex items-center gap-1 font-semibold text-muted"><CalendarClock size={14} aria-hidden />{review.dueAt <= now ? 'ulangan menunggu' : `ulangan ${dateId(review.dueAt, { day: 'numeric', month: 'short' })}`}</span></p>}
            {!premium && open.premium && <LinkButton href="/app/subscription" variant="accent" full>Lihat Premium</LinkButton>}
          </div>
        )}
      </Sheet>
    </div>
  );
}
