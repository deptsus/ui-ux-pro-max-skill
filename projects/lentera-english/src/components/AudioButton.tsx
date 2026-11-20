'use client';
import { useState } from 'react';
import { Snail, Volume2 } from 'lucide-react';
import { audioSource, play, recordingFor } from '@/lib/client/audio';
import { useContent } from '@/lib/client/content';
import { useLearner } from '@/lib/client/store';
import { cx } from './ui';

/** Plays a recording, or the device voice when no recording exists yet. */
export function AudioButton({ text, audioKey, size = 'md', label = 'Putar audio', showSource = false }: { text: string; audioKey?: string; size?: 'sm' | 'md' | 'lg'; label?: string; showSource?: boolean }) {
  const ix = useContent();
  const accent = useLearner().profile.accent;
  const [busy, setBusy] = useState<'normal' | 'slow' | null>(null);
  const [failed, setFailed] = useState(false);
  const source = audioSource(ix, audioKey, text, accent);
  const rec = source === 'recording' ? recordingFor(ix, text, accent, audioKey) : undefined;
  const accentName = (a: 'us' | 'uk') => (a === 'uk' ? 'Inggris' : 'Amerika');
  const run = async (slow: boolean) => {
    setBusy(slow ? 'slow' : 'normal');
    const result = await play(ix, text, { accent, slow, audioKey });
    setFailed(result === 'none');
    setBusy(null);
  };
  const dim = size === 'lg' ? 'h-16 w-16' : size === 'sm' ? 'h-11 w-11' : 'h-12 w-12';
  const icon = size === 'lg' ? 30 : size === 'sm' ? 16 : 22;
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button type="button" onClick={() => run(false)} aria-label={label} className={cx('grid shrink-0 place-items-center rounded-xl bg-brand text-on-brand shadow-[0_2px_0_var(--brand-strong)] transition active:translate-y-[2px] active:shadow-none', dim, busy === 'normal' && 'animate-pulse')}>
        <Volume2 size={icon} aria-hidden />
      </button>
      <button type="button" onClick={() => run(true)} aria-label={`${label} (lambat)`} title="Putar lambat" className={cx('grid shrink-0 place-items-center rounded-xl border border-line-strong bg-surface text-brand transition hover:bg-surface-2 active:bg-surface-2', size === 'lg' ? 'h-12 w-12' : 'h-11 w-11', busy === 'slow' && 'animate-pulse')}>
        <Snail size={size === 'lg' ? 22 : 16} aria-hidden />
      </button>
      {showSource && (
        <span className="text-xs text-muted">
          {rec
            ? `Rekaman suara · aksen ${accentName(rec.accent)}${rec.speaker ? ` · ${rec.speaker}` : ''}${rec.accent !== accent ? ` (aksen ${accentName(accent)} belum direkam)` : ''}`
            : source === 'device' ? `Suara bawaan perangkat · aksen ${accentName(accent)}` : 'Perangkat ini tidak punya pemutar suara.'}
        </span>
      )}
      {failed && <span className="text-xs text-bad">Audio tidak dapat diputar di perangkat ini.</span>}
    </span>
  );
}
