'use client';
// Jenjang sekolah (Rilis 16): the learner picks SD, SMP, SMA, or "Umum". The
// choice opens the matching school track, and SD turns on Mode SD (bigger text,
// instructions read aloud in Indonesian, name hidden in the public league,
// purchases behind a parent check).
import { useState } from 'react';
import { Lock, Volume2 } from 'lucide-react';
import type { Profile } from '@/lib/engine/types';
import { canSpeakIndonesian, speakIndonesian } from '@/lib/client/audio';
import { act, pushProfile, syncNow, useLearner } from '@/lib/client/store';
import { Button, Card, cx, inputClass } from '@/components/ui';

export type SchoolChoice = NonNullable<Profile['schoolLevel']>;
export const SCHOOL_CHOICES: [SchoolChoice, string, string][] = [
  ['sd', 'SD', 'Kelas 1–6'],
  ['smp', 'SMP', 'Kelas 7–9'],
  ['sma', 'SMA/SMK', 'Kelas 10–12'],
  ['umum', 'Umum', 'Kuliah, kerja, atau lainnya'],
];

/** Saves the choice on this device and on the account (the league reads it there). */
export function chooseSchoolLevel(level: SchoolChoice) {
  act((d) => { d.profile.schoolLevel = level; });
  void syncNow();
  void pushProfile({ school_level: level });
}

export const useSdMode = () => useLearner().profile.schoolLevel === 'sd';

/** Four large choices; the selected one is highlighted. */
export function SchoolLevelPicker({ value, onPick, label = 'Jenjang sekolah' }: { value?: SchoolChoice; onPick: (v: SchoolChoice) => void; label?: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {SCHOOL_CHOICES.map(([id, title, sub]) => (
        <button key={id} type="button" role="radio" aria-checked={value === id} onClick={() => onPick(id)}
          className={cx('tile flex min-h-16 flex-col items-center justify-center rounded-xl px-2 py-2 text-center', value === id ? 'border-brand bg-brand-soft [--edge:var(--brand)]' : 'border-line bg-surface')}>
          <span className="text-lg font-extrabold leading-tight">{title}</span>
          <span className="text-xs text-muted">{sub}</span>
        </button>
      ))}
    </div>
  );
}

/** Mode SD: a button that reads an instruction aloud in Indonesian. */
export function ReadAloud({ text, className }: { text: string; className?: string }) {
  const sd = useSdMode();
  const [busy, setBusy] = useState(false);
  if (!sd || !canSpeakIndonesian()) return null;
  return (
    <button type="button" onClick={async () => { setBusy(true); await speakIndonesian(text); setBusy(false); }} aria-label="Bacakan petunjuk"
      className={cx('inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 border-line bg-surface px-3 text-sm font-bold text-brand', busy && 'animate-pulse', className)}>
      <Volume2 size={16} aria-hidden />Bacakan
    </button>
  );
}

const PARENT_KEY = 'lentera.parentGate';
const pair = () => [12 + Math.floor(Math.random() * 8), 3 + Math.floor(Math.random() * 6)] as const;

/**
 * Mode SD: payment screens open only after a grown-up answers a sum a young
 * child is unlikely to know. Passing once lasts for this browser tab.
 */
export function ParentGate({ children }: { children: React.ReactNode }) {
  const sd = useSdMode();
  const [open, setOpen] = useState(() => typeof sessionStorage !== 'undefined' && sessionStorage.getItem(PARENT_KEY) === '1');
  const [[a, b], setQ] = useState(pair);
  const [answer, setAnswer] = useState('');
  const [wrong, setWrong] = useState(false);
  if (!sd || open) return <>{children}</>;
  const check = () => {
    if (Number(answer.trim()) === a * b) {
      sessionStorage.setItem(PARENT_KEY, '1');
      setOpen(true);
    } else {
      setWrong(true);
      setAnswer('');
      setQ(pair());
    }
  };
  return (
    <Card className="space-y-3">
      <h2 className="flex items-center gap-2 text-lg font-extrabold"><Lock size={20} className="text-brand" aria-hidden />Khusus orang tua</h2>
      <p className="text-sm text-muted">Akun ini memakai Mode SD. Pembelian Premium dibuka oleh orang tua atau wali. Ayah/Ibu, jawab pertanyaan ini untuk melanjutkan.</p>
      <form className="flex flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); check(); }}>
        <label className="min-w-0 flex-1">
          <span className="mb-1 block text-sm font-bold">Berapa {a} × {b}?</span>
          <input value={answer} onChange={(e) => { setAnswer(e.target.value); setWrong(false); }} inputMode="numeric" autoComplete="off" className={inputClass} aria-invalid={wrong || undefined} aria-describedby={wrong ? 'parent-gate-wrong' : undefined} />
        </label>
        <Button type="submit">Buka</Button>
      </form>
      {wrong && <p id="parent-gate-wrong" role="alert" className="text-sm font-bold text-bad">Jawabannya belum tepat. Coba pertanyaan baru di atas.</p>}
    </Card>
  );
}
