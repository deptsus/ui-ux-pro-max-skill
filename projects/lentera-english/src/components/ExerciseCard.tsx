'use client';
// Renders any of the 14 exercise types and reports the learner's answer.
import { useEffect, useMemo, useState } from 'react';
import type { Exercise } from '@/lib/content/types';
import { shuffle, type Answer, type Grade } from '@/lib/engine/grading';
import { AudioButton } from './AudioButton';
import { cx, inputClass } from './ui';

interface Props {
  ex: Exercise;
  seed: string;
  /** Set once the answer is graded: inputs lock and the key is highlighted. */
  grade?: Grade | null;
  onChange: (answer: Answer | null) => void;
  onSubmit?: () => void;
}

const TYPE_LABEL: Record<Exercise['type'], string> = {
  mc: 'Pilihan ganda', fill: 'Isi bagian kosong', arrange: 'Susun kata', construct: 'Susun kalimat', match: 'Pasangkan', translate: 'Terjemahan', fix: 'Perbaiki kesalahan',
  listen: 'Menyimak', read: 'Membaca', dialogue: 'Lengkapi dialog', tf: 'Benar atau salah', spot: 'Temukan kesalahan', vocab: 'Kosakata dalam konteks', para: 'Susun paragraf',
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

function Context({ ex }: { ex: Exercise }) {
  if (!ex.context) return null;
  if (ex.type === 'dialogue') {
    return (
      <div className="space-y-2">
        {ex.context.split('\n').map((line, i) => {
          const [who, ...rest] = line.split(': ');
          const mine = who === 'Kamu' || who === 'B';
          return (
            <div key={i} className={cx('flex', mine && 'justify-end')}>
              <div className={cx('max-w-[85%] rounded-2xl px-4 py-2.5', mine ? 'bg-brand-soft' : 'bg-surface-2')}>
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

export function ExerciseCard({ ex, seed, grade, onChange, onSubmit }: Props) {
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
    setChoice(null);
    setText('');
    setPicked([]);
    setWordIndex(null);
    setMatchState({ left: null, doneL: [], doneR: [], mistakes: 0, flash: null });
    onChange(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ex.id, seed]);

  const typed = ['fill', 'construct', 'translate', 'fix'].includes(ex.type);
  const correctIdx = ex.options?.findIndex((o) => o.correct) ?? -1;

  return (
    <div className="space-y-5" data-ex={ex.id} data-type={ex.type}>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-brand">{TYPE_LABEL[ex.type]}</p>
        <h2 className="mt-1 text-lg font-bold sm:text-xl">{ex.prompt}</h2>
      </div>

      {ex.type === 'listen' && ex.audioText && (
        <div className="flex flex-col items-start gap-2 rounded-2xl bg-surface-2 p-4">
          <AudioButton text={ex.audioText} audioKey={ex.audioKey} size="lg" showSource />
          {locked && <p className="en text-sm text-muted">Transkrip: {ex.audioText}</p>}
        </div>
      )}
      <Context ex={ex} />

      {ex.text && ex.type === 'fill' && <Blanked text={ex.text} />}
      {ex.text && ex.options && (ex.text.includes('___') ? <Blanked text={ex.text} /> : <p className={cx('text-xl font-bold leading-relaxed', ex.type !== 'tf' && 'en')}>{ex.text}</p>)}
      {ex.text && ex.type === 'construct' && (
        <div className="flex flex-wrap gap-2" aria-label="Kata kunci">
          {ex.text.split(' / ').map((w, i) => (
            <span key={i} className="en rounded-xl bg-surface-2 px-3 py-1.5 font-bold">{w}</span>
          ))}
        </div>
      )}
      {ex.text && ex.type === 'translate' && <p className="rounded-2xl bg-surface-2 p-4 text-xl font-bold">{ex.text}</p>}
      {ex.text && ex.type === 'fix' && <p className="en rounded-2xl border-2 border-dashed border-bad bg-bad-soft p-4 text-xl font-bold">{ex.text}</p>}
      {ex.text && (ex.type === 'arrange') && <p className="rounded-2xl bg-surface-2 p-4 text-lg font-semibold">{ex.text}</p>}

      {ex.options && (
        <div className={cx('grid gap-3', ex.type === 'tf' ? 'grid-cols-2' : 'grid-cols-1')} role="radiogroup" aria-label="Pilihan jawaban">
          {optionOrder.map((i) => {
            const o = ex.options![i];
            const isChosen = choice === i;
            const showRight = locked && i === correctIdx;
            const showWrong = locked && isChosen && i !== correctIdx;
            return (
              <button key={i} type="button" role="radio" aria-checked={isChosen} disabled={locked}
                onClick={() => { setChoice(i); onChange({ choice: i }); }}
                className={cx('rounded-2xl border-2 border-b-4 px-4 py-3 text-left text-base font-semibold transition', ex.type !== 'tf' && 'en',
                  showRight ? 'border-ok bg-ok-soft' : showWrong ? 'border-bad bg-bad-soft' : isChosen ? 'border-brand bg-brand-soft' : 'border-line bg-surface hover:bg-surface-2')}>
                {o.text}
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
          className={cx(inputClass, 'en text-lg font-semibold', locked && (grade!.correct ? 'border-ok bg-ok-soft' : 'border-bad bg-bad-soft'))} />
      )}

      {ex.type === 'arrange' && (
        <div className="space-y-4">
          <div className="en flex min-h-16 flex-wrap items-start gap-2 rounded-2xl border-2 border-dashed border-line p-3" aria-label="Kalimatmu">
            {picked.map((ti, pos) => (
              <button key={pos} type="button" disabled={locked} onClick={() => { const next = picked.filter((_, p) => p !== pos); setPicked(next); onChange(next.length ? { text: next.map((t) => tiles[t]).join(' ') } : null); }}
                className="rounded-xl border-2 border-b-4 border-brand bg-brand-soft px-3 py-1.5 font-bold">{tiles[ti]}</button>
            ))}
            {!picked.length && <span className="px-1 py-1.5 text-muted">Ketuk kata di bawah untuk menyusun kalimat.</span>}
          </div>
          <div className="en flex flex-wrap gap-2">
            {tiles.map((t, ti) => (
              <button key={ti} type="button" disabled={locked || picked.includes(ti)} onClick={() => { const next = [...picked, ti]; setPicked(next); onChange({ text: next.map((x) => tiles[x]).join(' ') }); }}
                className={cx('rounded-xl border-2 border-b-4 border-line bg-surface px-3 py-1.5 font-bold transition', picked.includes(ti) && 'invisible')}>{t}</button>
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
                  className={cx('en flex w-full items-start gap-3 rounded-2xl border-2 border-b-4 px-4 py-3 text-left font-semibold transition', pos >= 0 ? 'border-brand bg-brand-soft' : 'border-line bg-surface')}>
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
                className={cx('rounded-xl border-2 border-b-4 px-3 py-2 transition', locked && isWrongWord ? 'border-ok bg-ok-soft' : locked && wordIndex === i ? 'border-bad bg-bad-soft' : wordIndex === i ? 'border-brand bg-brand-soft' : 'border-line bg-surface')}>{w}</button>
            );
          })}
        </div>
      )}

      {ex.type === 'match' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            {ex.pairs!.map(([l], i) => (
              <button key={i} type="button" disabled={locked || matchState.doneL.includes(i)} onClick={() => setMatchState((m) => ({ ...m, left: i, flash: null }))}
                className={cx('en w-full rounded-2xl border-2 border-b-4 px-3 py-3 text-left font-bold transition', matchState.doneL.includes(i) ? 'border-ok bg-ok-soft opacity-70' : matchState.left === i ? 'border-brand bg-brand-soft' : 'border-line bg-surface')}>{l}</button>
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
                className={cx('w-full rounded-2xl border-2 border-b-4 px-3 py-3 text-left font-bold transition', matchState.doneR.includes(ri) ? 'border-ok bg-ok-soft opacity-70' : matchState.flash === ri ? 'border-bad bg-bad-soft' : 'border-line bg-surface')}>{ex.pairs![ri][1]}</button>
            ))}
          </div>
          <p className="col-span-2 text-sm text-muted">Ketuk satu kata di kiri, lalu pasangannya di kanan.{matchState.mistakes > 0 && ` Salah pasang: ${matchState.mistakes}.`}</p>
        </div>
      )}
    </div>
  );
}
