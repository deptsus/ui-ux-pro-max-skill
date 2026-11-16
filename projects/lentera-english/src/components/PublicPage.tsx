// Frame for simple public pages (privacy, contact): logo home link, readable
// width, and the same footer links everywhere.
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Logo } from '@/components/Mascot';

export function PublicPage({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-3">
          <Link href="/" className="text-lg" aria-label="Lentera English, ke halaman depan"><Logo size={24} /></Link>
          <Link href="/app" className="inline-flex min-h-11 items-center font-bold text-brand">Mulai belajar</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-8">
        <h1 className="text-3xl font-extrabold">{title}</h1>
        {intro && <p className="mt-2 text-muted">{intro}</p>}
        <div className="mt-6">{children}</div>
      </main>
      <footer className="border-t border-line py-6">
        <nav className="mx-auto flex max-w-3xl flex-wrap gap-x-5 px-5 text-sm text-muted" aria-label="Tautan kaki">
          <Link href="/" className="inline-flex min-h-11 items-center hover:text-ink">Beranda</Link>
          <Link href="/materi" className="inline-flex min-h-11 items-center hover:text-ink">Materi</Link>
          <Link href="/sekolah" className="inline-flex min-h-11 items-center hover:text-ink">Untuk sekolah</Link>
          <Link href="/privasi" className="inline-flex min-h-11 items-center hover:text-ink">Kebijakan privasi</Link>
          <Link href="/kontak" className="inline-flex min-h-11 items-center hover:text-ink">Hubungi kami</Link>
        </nav>
      </footer>
    </div>
  );
}
