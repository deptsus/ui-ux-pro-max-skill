'use client';
// Renders any of the 14 exercise types and reports the learner's answer.
import { useEffect, useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import type { Exercise } from '@/lib/content/types';
import { shuffle, type Answer, type Grade } from '@/lib/engine/grading';
import { AudioButton } from './AudioButton';
import { ReadAloud } from './school/SchoolLevel';
import { CastMember, type CastId } from './cast/Kid';
import { PictureChoice, SceneChoice, SpellTiles, TimelineChoice } from './interactive/Interactive';
import type { Mood } from './cast/Face';
import { cx, inputClass, merge } from './ui';

interface Props {
  ex: Exercise;
  seed: string;
  /** Set once the answer is graded: inputs lock and the key is highlighted. */
  grade?: Grade | null;
  onChange: (answer: Answer | null) => void;
  onSubmit?: () => void;
  /** Restores a saved choice or typed answer (level exams keep a draft across reloads). */
  initial?: Answer | null;
  /** Rilis 14: a cast member who asks the question and reacts to the answer. */
  host?: { who: CastId; mood: Mood };
}

const TYPE_LABEL: Record<Exercise['type'], string> = {
  mc: 'Pilihan ganda', fill: 'Isi bagian kosong', arrange: 'Susun kata', construct: 'Susun kalimat', match: 'Pasangkan', translate: 'Terjemahan', fix: 'Perbaiki kesalahan',
  listen: 'Menyimak', read: 'Membaca', dialogue: 'Lengkapi dialog', tf: 'Benar atau salah', spot: 'Temukan kesalahan', vocab: 'Kosakata dalam konteks', para: 'Susun paragraf',
  picture: 'Pilih gambar', scene: 'Letakkan di tempatnya', timeline: 'Kapan terjadinya?', spell: 'Eja dengan huruf',
};

function Blanked({ text }: { text: string }) {
  const parts = text.split('___');
  return (
    <p className="en text-xl font-bold leading-relaxed sm:text-2xl">
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 && <span className="mx-1 inline-block min-w-16 border-b-4 border-brand align-baseline">&nbsp;</span>}
        </span>
      ))}
    </p>
  );
}

const CHAT_CAST: CastId[] = ['nadia', 'raka', 'lina', 'bima', 'sari'];

function Context({ ex }: { ex: Exercise }) {
  if (!ex.context) return null;
  if (ex.type === 'dialogue') {
    return (
      <div className="space-y-2">
        {ex.context.split('\n').map((line, i) => {
          const [who, ...rest] = line.split(': ');
          const mine = who === 'Kamu' || who === 'B';
          // Rilis 15: the other speaker is a cast member (chosen by name, so a scene keeps one face).
          const face = CHAT_CAST[[...who].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 3) % CHAT_CAST.length];
          return (
            <div key={i} className={cx('flex items-end gap-2', mine && 'justify-end')}>
              {!mine && <CastMember who={face} mood="happy" size={40} decorative className="shrink-0" />}
              <div className={cx('max-w-[80%] rounded-2xl border-2 px-4 py-2.5', mine ? 'rounded-br-md border-brand/40 bg-brand-soft' : 'rounded-bl-md border-line bg-surface-2')}>
                <p className="text-xs font-bold text-muted">{who}</p>
                <p className="en font-semibold">{rest.join(': ')}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  return <div className="en rounded-2xl bg-surface-2 p-4 leading-relaxed">{ex.context}</div>;
}

export function ExerciseCard({ ex, seed, grade, onChange, onSubmit, initial, host }: Props) {
  const locked = !!grade;
  const [choice, setChoice] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [picked, setPicked] = useState<number[]>([]);
  const [wordIndex, setWordIndex] = useState<number | null>(null);
  // Left and right are tracked separately: two answers can share the same text
  // ("I → was", "It → was"), and either of them is right for both.
  const [matchState, setMatchState] = useState<{ left: number | null; doneL: number[]; doneR: number[]; mistakes: number; flash: number | null }>({ left: null, doneL: [], doneR: [], mistakes: 0, flash: null });

  // Options keep their authored order for true/false, otherwise shuffle per attempt.
  const optionOrder = useMemo(() => {
    const idx = (ex.options ?? []).map((_, i) => i);
    return ex.type === 'tf' ? idx : shuffle(idx, seed + ex.id);
  }, [ex, seed]);
  const tiles = useMemo(() => {
    if (ex.type === 'arrange') return shuffle([...(ex.answers?.[0] ?? '').split(' '), ...(ex.tiles ?? [])], seed + ex.id);
    if (ex.type === 'para') return shuffle((ex.sentences ?? []).map((_, i) => String(i)), seed + ex.id);
    return [];
  }, [ex, seed]);
  const rights = useMemo(() => shuffle((ex.pairs ?? []).map((_, i) => i), seed + ex.id + 'r'), [ex, seed]);

  useEffect(() => {
    const restore = initial && (initial.choice !== undefined || initial.text !== undefined) ? initial : null;
    setChoice(restore?.choice ?? null);
    setText(restore?.text ?? '');
    setPicked([]);
    setWordIndex(null);
    setMatchState({ left: null, doneL: [], doneR: [], mistakes: 0, flash: null });
    onChange(restore);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ex.id, seed]);

  const typed = ['fill', 'construct', 'translate', 'fix'].includes(ex.type);
  const correctIdx = ex.options?.findIndex((o) => o.correct) ?? -1;

  return (
    <div className="space-y-5" data-ex={ex.id} data-type={ex.type}>
      <div className={cx(host && 'flex items-end gap-3')}>
        {host && <CastMember who={host.who} mood={host.mood} size={76} decorative className="shrink-0" />}
        <div className={cx(host && 'relative min-w-0 flex-1 rounded-2xl border border-line bg-surface px-4 py-3 shadow-e1 before:absolute before:-left-[7px] before:bottom-4 before:h-3 before:w-3 before:rotate-45 before:border-b before:border-l before:border-line before:bg-surface before:content-[\'\']')}>
          <p className="text-xs font-bold text-brand-ink dark:text-brand">{ex.type === 'fill' && ex.audioText ? 'Dikte' : TYPE_LABEL[ex.type]}</p>
          <h2 className="mt-0.5 text-lg font-bold leading-snug sm:text-xl">{ex.prompt}</h2>
          <ReadAloud text={ex.prompt} className="mt-2" />
        </div>
      </div>

      {(ex.type === 'listen' || ex.type === 'fill' || ex.type === 'picture' || ex.type === 'spell') && ex.audioText && (
        <div className="flex flex-col items-start gap-2 rounded-xl bg-surface-2 p-4 dark:bg-line/60">
          <AudioButton text={ex.audioText} audioKey={ex.audioKey} size="lg" showSource />
          {locked && <p className="en text-sm text-muted">Transkrip: {ex.audioText}</p>}
        </div>
      )}
      <Context ex={ex} />

      {ex.text && ex.type === 'fill' && <Blanked text={ex.text} />}
      {ex.text && ex.options && (ex.text.includes('___') ? <Blanked text={ex.text} /> : <p className={cx('text-xl font-bold leading-relaxed', ex.type !== 'tf' && 'en', (ex.type === 'picture' || ex.type === 'timeline') && 'text-center text-2xl')}>{ex.text}</p>)}
      {ex.text && ex.type === 'spell' && <p className="text-center text-2xl font-extrabold">{ex.text}</p>}

      {/* Rilis 15 interactive types */}
      {ex.type === 'picture' && ex.options && <PictureChoice ex={ex} order={optionOrder} choice={choice} locked={locked} onPick={(i) => { setChoice(i); onChange({ choice: i }); }} />}
      {ex.type === 'scene' && ex.options && ex.scene && <SceneChoice ex={ex} order={optionOrder} choice={choice} locked={locked} onPick={(i) => { setChoice(i); onChange({ choice: i }); }} />}
      {ex.type === 'timeline' && ex.options && <TimelineChoice ex={ex} choice={choice} locked={locked} onPick={(i) => { setChoice(i); onChange({ choice: i }); }} />}
      {ex.type === 'spell' && <SpellTiles ex={ex} seed={seed} picked={picked} locked={locked} onChange={(next, word) => { setPicked(next); onChange(word.length === (ex.answers?.[0] ?? '').length ? { text: word } : null); }} />}
      {ex.text && ex.type === 'construct' && (
        <div className="flex flex-wrap gap-2" aria-label="Kata kunci">
          {ex.text.split(' / ').map((w, i) => (
            <span key={i} className="en rounded-lg bg-surface-2 px-3 py-1.5 font-bold dark:bg-line/60">{w}</span>
          ))}
        </div>
      )}
      {ex.text && ex.type === 'translate' && <p className="rounded-xl bg-surface-2 p-4 text-xl font-bold dark:bg-line/60">{ex.text}</p>}
      {ex.text && ex.type === 'fix' && <p className="en rounded-xl border-2 border-dashed border-bad/60 bg-bad-soft p-4 text-xl font-bold">{ex.text}</p>}
      {ex.text && (ex.type === 'arrange') && <p className="rounded-xl bg-surface-2 p-4 text-lg font-semibold dark:bg-line/60">{ex.text}</p>}

      {ex.options && !['picture', 'scene', 'timeline'].includes(ex.type) && (
        <div className={cx('grid gap-3', ex.type === 'tf' ? 'grid-cols-2' : 'grid-cols-1')} role="radiogroup" aria-label="Pilihan jawaban">
          {optionOrder.map((i) => {
            const o = ex.options![i];
            const isChosen = choice === i;
            const showRight = locked && i === correctIdx;
            const showWrong = locked && isChosen && i !== correctIdx;
            return (
              <button key={i} type="button" role="radio" aria-checked={isChosen} disabled={locked}
                onClick={() => { setChoice(i); onChange({ choice: i }); }}
                className={cx('flex min-h-14 items-center gap-3 rounded-xl tile px-4 py-3 text-left text-lg font-bold', ex.type !== 'tf' && 'en',
                  showRight ? 'border-ok bg-ok-soft [--edge:var(--ok)]' : showWrong ? 'border-bad bg-bad-soft [--edge:var(--bad)]' : isChosen ? 'border-brand bg-brand-soft [--edge:var(--brand)]' : 'border-line bg-surface hover:bg-surface-2')}>
                {/* The state is never colour alone: a radio dot, then a tick or a cross once checked. */}
                <span aria-hidden className={cx('grid h-6 w-6 shrink-0 place-items-center rounded-full border-2', showRight ? 'border-ok bg-ok text-on-brand' : showWrong ? 'border-bad bg-bad text-on-brand' : isChosen ? 'border-brand' : 'border-line-strong')}>
                  {showRight ? <Check size={14} strokeWidth={3} /> : showWrong ? <X size={14} strokeWidth={3} /> : isChosen ? <span className="h-2.5 w-2.5 rounded-full bg-brand" /> : null}
                </span>
                <span className="min-w-0 flex-1">{o.text}</span>
              </button>
            );
          })}
        </div>
      )}

      {typed && (
        <input value={text} disabled={locked} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} lang="en"
          aria-label="Jawabanmu" placeholder={ex.type === 'fill' ? 'Ketik kata yang hilang' : 'Ketik jawabanmu dalam bahasa Inggris'}
          onChange={(e) => { setText(e.target.value); onChange(e.target.value.trim() ? { text: e.target.value } : null); }}
          onKeyDown={(e) => { if (e.key === 'Enter' && text.trim()) onSubmit?.(); }}
          className={merge(inputClass, cx('en text-lg font-semibold', locked && (grade!.correct ? 'border-ok bg-ok-soft' : 'border-bad bg-bad-soft')))} />
      )}

      {ex.type === 'arrange' && (
        <div className="space-y-4">
          <div className="en flex min-h-16 flex-wrap items-start gap-2 rounded-xl border-2 border-dashed border-line-strong/60 p-3" aria-label="Kalimatmu">
            {picked.map((ti, pos) => (
              <button key={pos} type="button" disabled={locked} onClick={() => { const next = picked.filter((_, p) => p !== pos); setPicked(next); onChange(next.length ? { text: next.map((t) => tiles[t]).join(' ') } : null); }}
                className="min-h-11 rounded-xl tile border-brand bg-brand-soft [--edge:var(--brand)] px-3 py-1.5 font-bold">{tiles[ti]}</button>
            ))}
            {!picked.length && <span className="px-1 py-1.5 text-muted">Ketuk kata di bawah untuk menyusun kalimat.</span>}
          </div>
          <div className="en flex flex-wrap gap-2">
            {tiles.map((t, ti) => (
              <button key={ti} type="button" disabled={locked || picked.includes(ti)} onClick={() => { const next = [...picked, ti]; setPicked(next); onChange({ text: next.map((x) => tiles[x]).join(' ') }); }}
                className={cx('min-h-11 rounded-xl tile border-line bg-surface px-3 py-1.5 font-bold transition', picked.includes(ti) && 'invisible')}>{t}</button>
            ))}
          </div>
        </div>
      )}

      {ex.type === 'para' && (
        <ol className="space-y-2">
          {tiles.map((t) => {
            const si = Number(t);
            const pos = picked.indexOf(si);
            return (
              <li key={t}>
                <button type="button" disabled={locked}
                  onClick={() => { const next = pos >= 0 ? picked.filter((p) => p !== si) : [...picked, si]; setPicked(next); onChange(next.length === tiles.length ? { order: next } : null); }}
                  className={cx('en flex w-full items-start gap-3 rounded-xl tile px-4 py-3 text-left font-semibold transition', pos >= 0 ? 'border-brand bg-brand-soft [--edge:var(--brand)]' : 'border-line bg-surface')}>
                  <span className={cx('grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-extrabold', pos >= 0 ? 'bg-brand text-on-brand' : 'bg-surface-2 text-muted')}>{pos >= 0 ? pos + 1 : '·'}</span>
                  {ex.sentences![si]}
                </button>
              </li>
            );
          })}
          <li className="text-sm text-muted">Ketuk kalimat sesuai urutan yang benar. Ketuk lagi untuk membatalkan.</li>
        </ol>
      )}

      {ex.type === 'spot' && (
        <div className="en flex flex-wrap gap-2 text-xl font-bold">
          {(ex.text ?? '').split(' ').map((w, i) => {
            const isWrongWord = w.replace(/[.,!?;:"]/g, '') === ex.wrongWord;
            return (
              <button key={i} type="button" disabled={locked} onClick={() => { setWordIndex(i); onChange({ wordIndex: i }); }}
                className={cx('min-h-11 rounded-xl tile px-3 py-2 transition', locked && isWrongWord ? 'border-ok bg-ok-soft [--edge:var(--ok)]' : locked && wordIndex === i ? 'border-bad bg-bad-soft [--edge:var(--bad)]' : wordIndex === i ? 'border-brand bg-brand-soft [--edge:var(--brand)]' : 'border-line bg-surface')}>{w}</button>
            );
          })}
        </div>
      )}

      {ex.type === 'match' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            {ex.pairs!.map(([l], i) => (
              <button key={i} type="button" disabled={locked || matchState.doneL.includes(i)} onClick={() => setMatchState((m) => ({ ...m, left: i, flash: null }))}
                className={cx('en min-h-12 w-full rounded-xl tile px-3 py-3 text-left font-bold transition', matchState.doneL.includes(i) ? 'border-ok bg-ok-soft [--edge:var(--ok)] opacity-70' : matchState.left === i ? 'border-brand bg-brand-soft [--edge:var(--brand)]' : 'border-line bg-surface')}>{l}</button>
            ))}
          </div>
          <div className="space-y-2">
            {rights.map((ri) => (
              <button key={ri} type="button" disabled={locked || matchState.doneR.includes(ri) || matchState.left === null}
                onClick={() => {
                  const m = matchState;
                  if (m.left === null) return;
                  if (ex.pairs![ri][1].trim() === ex.pairs![m.left][1].trim()) {
                    const doneL = [...m.doneL, m.left];
                    setMatchState({ ...m, left: null, doneL, doneR: [...m.doneR, ri], flash: null });
                    if (doneL.length === ex.pairs!.length) onChange({ mistakes: m.mistakes });
                  } else {
                    setMatchState({ ...m, left: null, mistakes: m.mistakes + 1, flash: ri });
                  }
                }}
                className={cx('min-h-12 w-full rounded-xl tile px-3 py-3 text-left font-bold transition', matchState.doneR.includes(ri) ? 'border-ok bg-ok-soft [--edge:var(--ok)] opacity-70' : matchState.flash === ri ? 'border-bad bg-bad-soft [--edge:var(--bad)]' : 'border-line bg-surface')}>{ex.pairs![ri][1]}</button>
            ))}
          </div>
          <p className="col-span-2 text-sm text-muted">Ketuk satu kata di kiri, lalu pasangannya di kanan.{matchState.mistakes > 0 && ` Salah pasang: ${matchState.mistakes}.`}</p>
        </div>
      )}
    </div>
  );
}
