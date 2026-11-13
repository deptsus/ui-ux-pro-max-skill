'use client';
// Admin dashboard: payments, curriculum CMS, publishing. This page only shows
// or hides UI; the real gate is the server, which checks the admin role inside
// every database function behind POST /api/admin.
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { BookOpen, LogOut, Send, ShieldCheck, Wallet } from 'lucide-react';
import { admin } from '@/components/admin/api';
import { CmsPanel, type CmsTarget } from '@/components/admin/CmsPanel';
import { PaymentsPanel, type Overview } from '@/components/admin/PaymentsPanel';
import { PublishPanel } from '@/components/admin/PublishPanel';
import type { Data } from '@/components/admin/schema';
import { Logo, Mascot } from '@/components/Mascot';
import { Badge, Button, Card, LinkButton, Notice, cx } from '@/components/ui';
import { api } from '@/lib/client/api';
import { initSession, signOut, useServerInfo, useSession } from '@/lib/client/session';

type Gate = 'loading' | 'no-backend' | 'signed-out' | 'forbidden' | 'error' | 'admin';
type Tab = 'payments' | 'content' | 'publish';
const TABS: { id: Tab; label: string; icon: typeof Wallet }[] = [
  { id: 'payments', label: 'Pembayaran', icon: Wallet },
  { id: 'content', label: 'Konten', icon: BookOpen },
  { id: 'publish', label: 'Terbitkan', icon: Send },
];

function Gatekeeper({ gate, email, onRetry }: { gate: Exclude<Gate, 'admin'>; email?: string; onRetry: () => void }) {
  const body = {
    loading: <p className="font-bold text-muted" role="status">Memeriksa akses...</p>,
    'no-backend': <><h1 className="text-2xl font-extrabold">Dashboard admin belum tersedia</h1><p className="text-muted">Server ini berjalan tanpa basis data, jadi tidak ada akun admin maupun konten yang bisa dikelola.</p><LinkButton href="/" variant="secondary">Kembali ke beranda</LinkButton></>,
    'signed-out': <><h1 className="text-2xl font-extrabold">Masuk sebagai admin</h1><p className="text-muted">Dashboard ini hanya untuk akun dengan peran admin. Setelah masuk, buka kembali halaman ini.</p><LinkButton href="/masuk">Masuk</LinkButton></>,
    forbidden: <><h1 className="text-2xl font-extrabold">Akses ditolak</h1><p className="text-muted">Akun {email} tidak memiliki peran admin. Bila seharusnya punya, minta pemilik produk mengubah peranmu di basis data.</p><div className="flex flex-wrap justify-center gap-2"><LinkButton href="/app">Buka aplikasi belajar</LinkButton><Button variant="secondary" onClick={() => void signOut()}>Keluar</Button></div></>,
    error: <><h1 className="text-2xl font-extrabold">Akses belum bisa diperiksa</h1><p className="text-muted">Server tidak menjawab. Periksa koneksimu, lalu coba lagi.</p><Button onClick={onRetry}>Coba lagi</Button></>,
  }[gate];
  return (
    <main className="mx-auto grid min-h-dvh max-w-md content-center gap-5 p-5 text-center">
      <Link href="/" className="mx-auto text-xl"><Logo /></Link>
      <Card className="space-y-4"><Mascot mood={gate === 'forbidden' || gate === 'error' ? 'sad' : 'think'} size={88} className="mx-auto" />{body}</Card>
    </main>
  );
}

export default function AdminPage() {
  const session = useSession();
  const info = useServerInfo();
  const [gate, setGate] = useState<Gate>('loading');
  const [attempt, setAttempt] = useState(0);
  const [tab, setTab] = useState<Tab>('payments');
  const [content, setContent] = useState<Data | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [overviewAt, setOverviewAt] = useState<number | null>(null);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [target, setTarget] = useState<CmsTarget | null>(null);

  // Decide what to show. A non-admin never triggers an admin data request.
  useEffect(() => {
    let alive = true;
    (async () => {
      setGate('loading');
      const s = await initSession();
      try {
        const me = await api<{ backend: string; user: { profile: { role: string } } | null }>('/api/me');
        if (!alive) return;
        if (me.backend === 'none') setGate('no-backend');
        else if (!s || !me.user) setGate('signed-out');
        else setGate(me.user.profile.role === 'admin' ? 'admin' : 'forbidden');
      } catch {
        if (alive) setGate('error');
      }
    })();
    return () => { alive = false; };
  }, [session?.userId, attempt]);

  const loadContent = useCallback(async () => {
    try {
      setContent(await admin<Data>('content'));
      setContentError(null);
    } catch (e) {
      setContentError((e as Error).message);
    }
  }, []);
  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      setOverview(await admin<Overview>('payments'));
      setOverviewAt(Date.now());
      setOverviewError(null);
    } catch (e) {
      setOverviewError((e as Error).message);
    }
    setOverviewLoading(false);
  }, []);
  useEffect(() => {
    if (gate !== 'admin') return;
    void loadOverview();
    void loadContent();
  }, [gate, loadOverview, loadContent]);

  if (gate !== 'admin') return <Gatekeeper gate={gate} email={session?.email} onRetry={() => setAttempt((n) => n + 1)} />;

  const openInCms = (t: Omit<CmsTarget, 'n'>) => {
    setTarget({ ...t, n: Date.now() });
    setTab('content');
  };
  const contentState = content ? null : contentError
    ? <Notice tone="bad" title="Konten gagal dimuat"><p>{contentError}</p><Button size="sm" className="mt-2" onClick={() => void loadContent()}>Coba lagi</Button></Notice>
    : <p className="py-10 text-center font-bold text-muted" role="status">Memuat konten...</p>;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5">
          <Link href="/" className="text-lg"><Logo size={24} /></Link>
          <Badge tone="brand"><ShieldCheck size={14} aria-hidden />Admin</Badge>
          <span className="ml-auto hidden truncate text-sm font-bold text-muted sm:block">{session?.email}</span>
          <LinkButton href="/app" variant="secondary" size="sm" className="ml-auto sm:ml-0">Aplikasi belajar</LinkButton>
          <Button variant="ghost" size="sm" onClick={() => void signOut()}><LogOut size={16} aria-hidden />Keluar</Button>
        </div>
        <div className="mx-auto max-w-7xl px-4">
          <div role="tablist" aria-label="Bagian dashboard" className="flex gap-1 overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} role="tab" id={`tab-${id}`} aria-selected={tab === id} aria-controls={`panel-${id}`} onClick={() => setTab(id)} className={cx('flex flex-1 shrink-0 items-center justify-center gap-2 border-b-[3px] px-2 py-2.5 text-sm font-extrabold transition sm:flex-none sm:px-4', tab === id ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-ink')}>
                <Icon size={18} aria-hidden />{label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Panels stay mounted so an unsaved form survives a tab switch. */}
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-6">
        <h1 className="sr-only">Dashboard admin Lentera English</h1>
        <div role="tabpanel" id="panel-payments" aria-labelledby="tab-payments" hidden={tab !== 'payments'}>
          <PaymentsPanel data={overview} loadedAt={overviewAt} loading={overviewLoading} error={overviewError} reload={() => void loadOverview()} payments={info.payments} />
        </div>
        <div role="tabpanel" id="panel-content" aria-labelledby="tab-content" hidden={tab !== 'content'}>
          {content ? <CmsPanel data={content} reload={loadContent} target={target} onPublish={() => setTab('publish')} /> : contentState}
        </div>
        <div role="tabpanel" id="panel-publish" aria-labelledby="tab-publish" hidden={tab !== 'publish'}>
          {content ? <PublishPanel data={content} reload={loadContent} onOpen={openInCms} active={tab === 'publish'} /> : contentState}
        </div>
      </main>
    </div>
  );
}
