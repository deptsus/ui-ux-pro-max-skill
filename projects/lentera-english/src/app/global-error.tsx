'use client';
// Last-resort screen when even the root layout fails. Plain markup: the app's
// styles may not have loaded.
import { useEffect } from 'react';
import { reportClientError } from '@/lib/client/errors';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportClientError(error.message || 'Root error', error.stack);
  }, [error]);
  return (
    <html lang="id">
      <body style={{ fontFamily: 'system-ui, sans-serif', display: 'grid', placeItems: 'center', minHeight: '100vh', margin: 0, padding: 24, textAlign: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24 }}>Lentera English sedang bermasalah</h1>
          <p>Masalahnya sudah dilaporkan otomatis. Coba muat ulang sebentar lagi.</p>
          <button type="button" onClick={reset} style={{ minHeight: 44, padding: '0 20px', fontSize: 16, fontWeight: 700, borderRadius: 12 }}>Coba lagi</button>
        </div>
      </body>
    </html>
  );
}
