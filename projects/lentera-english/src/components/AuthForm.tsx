'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { initSession, signIn, signUp, useServerInfo, useSession } from '@/lib/client/session';
import { Logo, Mascot } from './Mascot';
import { Button, Card, Field, Notice, inputClass } from './ui';

export function AuthForm({ mode }: { mode: 'signin' | 'signup' }) {
  const router = useRouter();
  const session = useSession();
  const info = useServerInfo();
  const [ready, setReady] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { void initSession().then(() => setReady(true)); }, []);
  useEffect(() => {
    if (!ready || !session) return;
    // ?next=/admin brings an admin straight back to the dashboard. Only local paths.
    const next = new URLSearchParams(window.location.search).get('next') ?? '';
    router.replace(/^\/(?!\/)[\w\-/?=&]*$/.test(next) ? next : '/app');
  }, [ready, session, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'signup') {
        const r = await signUp(email, password, name.trim() || 'Pelajar');
        if (r === 'confirm') setNotice('Akun dibuat. Buka tautan konfirmasi yang kami kirim ke emailmu, lalu masuk.');
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError((err as Error).message);
    }
    setBusy(false);
  };
  const signup = mode === 'signup';
  return (
    <main className="mx-auto grid min-h-dvh max-w-md content-center gap-5 p-5">
      <Link href="/" className="mx-auto text-xl"><Logo /></Link>
      <Card className="space-y-4">
        <div className="flex items-center gap-3"><Mascot size={56} /><div><h1 className="text-2xl font-extrabold">{signup ? 'Buat akun gratis' : 'Masuk'}</h1><p className="text-sm text-muted">{signup ? 'Progresmu tersimpan dan bisa dilanjutkan di perangkat lain.' : 'Lanjutkan belajarmu.'}</p></div></div>
        {ready && info.backend === 'none' && <Notice tone="accent" title="Akun belum tersedia di server ini">Server berjalan tanpa backend akun. Kamu tetap bisa memakai semua fitur belajar sebagai tamu.</Notice>}
        {ready && info.backend === 'embedded' && <Notice tone="muted">Mode pengembangan: akun disimpan di basis data lokal server ini.</Notice>}
        <form onSubmit={submit} className="space-y-3" noValidate>
          {signup && <Field label="Nama"><input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={40} className={inputClass} placeholder="Nama panggilanmu" /></Field>}
          <Field label="Email"><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={inputClass} placeholder="nama@email.com" /></Field>
          <Field label="Kata sandi" hint={signup ? 'Minimal 8 karakter.' : undefined}><input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={signup ? 'new-password' : 'current-password'} className={inputClass} /></Field>
          {error && <p className="rounded-xl bg-bad-soft px-3 py-2 text-sm font-bold text-bad" role="alert">{error}</p>}
          {notice && <p className="rounded-xl bg-ok-soft px-3 py-2 text-sm font-bold text-ok" role="status">{notice}</p>}
          <Button type="submit" full size="lg" disabled={busy || !ready || !email || !password}>{busy ? 'Memproses...' : signup ? 'Daftar' : 'Masuk'}</Button>
        </form>
        <p className="text-center text-sm text-muted">{signup ? 'Sudah punya akun? ' : 'Belum punya akun? '}<Link href={signup ? '/masuk' : '/daftar'} className="font-bold text-brand underline">{signup ? 'Masuk' : 'Daftar gratis'}</Link></p>
        <p className="text-center text-sm"><Link href="/app" className="font-bold text-muted underline">Lanjut sebagai tamu</Link></p>
      </Card>
    </main>
  );
}
