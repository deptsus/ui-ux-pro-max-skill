'use client';
// Shown when a page crashes while rendering. The error is reported, and the
// learner gets a way back instead of a blank screen. Progress is saved on the
// device after every answer, so nothing learned is lost.
import { useEffect } from 'react';
import { reportClientError } from '@/lib/client/errors';

export default function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportClientError(error.message || 'Render error', error.stack);
  }, [error]);
  return (
    <main className="mx-auto grid min-h-dvh max-w-md content-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-extrabold">Ada yang tidak beres di halaman ini</h1>
      <p className="text-muted">Masalahnya sudah dilaporkan otomatis. Progres belajarmu tetap tersimpan di perangkat.</p>
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" onClick={reset} className="min-h-11 rounded-2xl border-2 border-b-4 border-brand-strong bg-brand px-5 font-bold text-on-brand">Coba lagi</button>
        <a href="/app" className="inline-flex min-h-11 items-center rounded-2xl border-2 border-b-4 border-line bg-surface px-5 font-bold">Ke beranda</a>
      </div>
    </main>
  );
}
