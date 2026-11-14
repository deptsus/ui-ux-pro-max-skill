'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui';
import { input } from './fields';

/** Modal confirmation built on <dialog> (focus trap and Escape come for free). */
export function Confirm({ open, title, children, confirmLabel, tone = 'danger', typeToConfirm, busy, confirmDisabled, onConfirm, onCancel }: { open: boolean; title: string; children: ReactNode; confirmLabel: string; tone?: 'danger' | 'primary' | 'success'; typeToConfirm?: string; busy?: boolean; confirmDisabled?: boolean; onConfirm: () => void; onCancel: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [typed, setTyped] = useState('');
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      setTyped('');
      el.showModal();
    } else if (!open && el.open) el.close();
  }, [open]);
  return (
    <dialog ref={ref} onCancel={(e) => { e.preventDefault(); if (!busy) onCancel(); }} className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-3xl border border-line bg-surface p-0 text-ink shadow-card backdrop:bg-[#121022]/60">
      {open && (
        <div className="space-y-4 p-5">
          <h2 className="text-xl font-extrabold">{title}</h2>
          <div className="space-y-2 text-sm text-muted">{children}</div>
          {typeToConfirm && (
            <label className="block text-sm font-bold">Ketik {typeToConfirm} untuk melanjutkan
              <input value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" className={`${input} mt-1`} />
            </label>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" onClick={onCancel} disabled={busy}>Batal</Button>
            <Button variant={tone} onClick={onConfirm} disabled={busy || confirmDisabled || (!!typeToConfirm && typed.trim() !== typeToConfirm)}>{busy ? 'Memproses...' : confirmLabel}</Button>
          </div>
        </div>
      )}
    </dialog>
  );
}
