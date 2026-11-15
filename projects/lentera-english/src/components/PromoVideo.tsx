'use client';
// Landing page promo: the UI animation made from real app screens (promo/),
// with a clickable list of the features it shows. The video file is only
// downloaded when someone presses play (preload="none"), to spare bandwidth.
import { useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { PROMO_CHAPTERS, PROMO_DURATION } from './promo-chapters';
import { cx } from './ui';

const VIDEO = '/promo/lentera-promo.mp4';
const POSTER = '/promo/lentera-promo-poster.jpg';
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function PromoVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [now, setNow] = useState(0);
  const active = PROMO_CHAPTERS.reduce((k, c, i) => (now >= c.t ? i : k), -1);

  const play = (t?: number) => {
    const v = video.current;
    if (!v) return;
    setStarted(true);
    const go = () => { if (t !== undefined) v.currentTime = t; void v.play().catch(() => {}); };
    if (v.readyState >= 1) go();
    else { v.addEventListener('loadedmetadata', go, { once: true }); v.load(); }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
      <div className="relative overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
        <video ref={video} className="block aspect-video w-full bg-surface-2" controls={started} preload="none" playsInline poster={POSTER}
          aria-label={`Video promosi Lentera English, ${clock(PROMO_DURATION)}, tanpa suara: memperlihatkan fitur aplikasi dari tampilan aslinya`}
          onTimeUpdate={(e) => setNow(e.currentTarget.currentTime)} onPlay={() => setStarted(true)}>
          <source src={VIDEO} type="video/mp4" />
          Browser ini tidak bisa memutar video. Daftar fitur di samping menjelaskan isinya.
        </video>
        {!started && (
          <button type="button" onClick={() => play()} className="absolute inset-0 grid place-items-center bg-[#1e1b3a]/15 transition hover:bg-[#1e1b3a]/25" aria-label={`Putar video promosi (${clock(PROMO_DURATION)})`}>
            <span className="flex items-center gap-3 rounded-full bg-brand px-6 py-3.5 text-lg font-extrabold text-on-brand shadow-card">
              <Play size={22} fill="currentColor" aria-hidden />Putar video · {clock(PROMO_DURATION)}
            </span>
          </button>
        )}
      </div>
      <div>
        <p className="text-sm font-bold text-muted">Isi video ({PROMO_CHAPTERS.length} fitur). Ketuk untuk langsung ke bagiannya:</p>
        <ol className="mt-2 grid gap-1.5 lg:max-h-[26rem] lg:overflow-y-auto lg:pr-1" aria-label="Bab video promosi">
          {PROMO_CHAPTERS.map((c, i) => (
            <li key={c.t}>
              <button type="button" onClick={() => play(c.t)} aria-current={i === active ? 'true' : undefined}
                className={cx('flex min-h-11 w-full items-start gap-3 rounded-2xl px-3 py-2 text-left transition', i === active ? 'bg-brand-soft' : 'hover:bg-surface-2')}>
                <span className="mt-0.5 shrink-0 rounded-md bg-surface-2 px-1.5 py-0.5 text-xs font-bold tabular-nums text-muted">{clock(c.t)}</span>
                <span className="min-w-0"><span className="block font-extrabold">{c.title}</span><span className="block text-sm text-muted">{c.sub}</span></span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
