'use client';
// Admin dashboard: payments, curriculum CMS, publishing. This page only shows
// or hides UI; the real gate is the server, which checks the admin role inside
// every database function behind POST /api/admin.
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Activity, BarChart3, BellRing, BookOpen, ClipboardList, KeyRound, LogOut, MessageSquareWarning, Mic, School, Send, ShieldCheck, Wallet, X } from 'lucide-react';
import { admin } from '@/components/admin/api';
import { AnalyticsPanel } from '@/components/admin/AnalyticsPanel';
import { HealthPanel } from '@/components/admin/HealthPanel';
import { CmsPanel, type CmsTarget } from '@/components/admin/CmsPanel';
import { HomeworkPanel } from '@/components/admin/HomeworkPanel';
import { NotesPanel, openNoteCount, useNotes } from '@/components/admin/NotesPanel';
import { NotifyPanel } from '@/components/admin/NotifyPanel';
import { PaymentsPanel, type Overview } from '@/components/admin/PaymentsPanel';
import { PublishPanel } from '@/components/admin/PublishPanel';
import { RecordingsPanel } from '@/components/admin/RecordingsPanel';
import { SchoolsPanel } from '@/components/admin/SchoolsPanel';
import type { Data } from '@/components/admin/schema';
import { Logo, Mascot } from '@/components/Mascot';
import { Badge, Button, Card, LinkButton, Notice, cx, inputClass, rupiah } from '@/components/ui';
import { api } from '@/lib/client/api';
import { initSession, mfaState, mfaVerify, signOut, useServerInfo, useSession } from '@/lib/client/session';

type Gate = 'loading' | 'no-backend' | 'signed-out' | 'forbidden' | 'error' | 'mfa' | 'admin';
type Tab = 'payments' | 'analytics' | 'health' | 'schools' | 'homework' | 'content' | 'recordings' | 'publish' | 'notes';
const TABS: { id: Tab; label: string; icon: typeof Wallet }[] = [
  { id: 'payments', label: 'Pembayaran', icon: Wallet },
  { id: 'analytics', label: 'Analitik', icon: BarChart3 },
  { id: 'health', label: 'Kesehatan', icon: Activity },
  { id: 'schools', label: 'Sekolah', icon: School },
  { id: 'homework', label: 'PR', icon: ClipboardList },
  { id: 'content', label: 'Konten', icon: BookOpen },
  { id: 'recordings', label: 'Rekaman', icon: Mic },
  { id: 'publish', label: 'Terbitkan', icon: Send },
  { id: 'notes', label: 'Catatan', icon: MessageSquareWarning },
];

/** Second step for admins with an authenticator app (Rilis 9). */
function MfaStep({ onDone }: { onDone: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const st = await mfaState();
      await mfaVerify(st.factors[0].id, code);
      onDone();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };
  return (
    <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
      <h1 className="flex items-center justify-center gap-2 text-2xl font-extrabold"><KeyRound aria-hidden />Verifikasi 2 langkah</h1>
      <p className="text-muted">Masukkan 6 angka dari aplikasi authenticator di HP-mu.</p>
      <input className={cx(inputClass, 'text-center font-mono text-2xl tracking-[0.4em]')} aria-label="Kode verifikasi 6 angka" inputMode="numeric" autoComplete="one-time-code" autoFocus maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} />
      {error && <p className="text-sm text-bad">{error}</p>}
      <Button type="submit" full disabled={busy || code.length !== 6}>{busy ? 'Memeriksa...' : 'Masuk ke dashboard'}</Button>
      <Button type="button" variant="ghost" onClick={() => void signOut()}>Keluar</Button>
    </form>
  );
}

function Gatekeeper({ gate, email, onRetry }: { gate: Exclude<Gate, 'admin'>; email?: string; onRetry: () => void }) {
  const body = {
    loading: <p className="font-bold text-muted" role="status">Memeriksa akses...</p>,
    'no-backend': <><h1 className="text-2xl font-extrabold">Dashboard admin belum tersedia</h1><p className="text-muted">Server ini berjalan tanpa basis data, jadi tidak ada akun admin maupun konten yang bisa dikelola.</p><LinkButton href="/" variant="secondary">Kembali ke beranda</LinkButton></>,
    'signed-out': <><h1 className="text-2xl font-extrabold">Masuk sebagai admin</h1><p className="text-muted">Dashboard ini hanya untuk akun dengan peran admin. Setelah masuk, kamu langsung kembali ke sini.</p><LinkButton href="/masuk?next=/admin">Masuk</LinkButton></>,
    forbidden: <><h1 className="text-2xl font-extrabold">Akses ditolak</h1><p className="text-muted">Akun {email} tidak memiliki peran admin. Bila seharusnya punya, minta pemilik produk mengubah peranmu di basis data.</p><div className="flex flex-wrap justify-center gap-2"><LinkButton href="/app">Buka aplikasi belajar</LinkButton><Button variant="secondary" onClick={() => void signOut()}>Keluar</Button></div></>,
    error: <><h1 className="text-2xl font-extrabold">Akses belum bisa diperiksa</h1><p className="text-muted">Server tidak menjawab. Periksa koneksimu, lalu coba lagi.</p><Button onClick={onRetry}>Coba lagi</Button></>,
    mfa: <MfaStep onDone={onRetry} />,
  }[gate];
  return (
    <main className="mx-auto grid min-h-dvh max-w-md content-center gap-5 p-5 text-center">
      <Link href="/" className="mx-auto text-xl"><Logo /></Link>
      <Card className="space-y-4"><Mascot mood={gate === 'forbidden' || gate === 'error' ? 'sad' : 'think'} size={88} className="mx-auto" />{body}</Card>
    </main>
  );
}

/** Open review notes, shown on the "Catatan" tab. */
function NotesCount() {
  const n = openNoteCount(useNotes().notes);
  return n ? <Badge tone="accent">{n}</Badge> : null;
}

export default function AdminPage() {
  const session = useSession();
  const info = useServerInfo();
  const [gate, setGate] = useState<Gate>('loading');
  const [attempt, setAttempt] = useState(0);
  const [tab, setTab] = useState<Tab>('payments');
  // Notifications link straight to a tab (/admin?tab=health).
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('tab');
    if (t && TABS.some((x) => x.id === t)) setTab(t as Tab);
  }, []);
  const [content, setContent] = useState<Data | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [overviewAt, setOverviewAt] = useState<number | null>(null);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [target, setTarget] = useState<CmsTarget | null>(null);
  /** In-page alert for payment reports that arrived while the dashboard was open. */
  const [fresh, setFresh] = useState<string | null>(null);
  const seen = useRef<Set<string> | null>(null);

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
        else if (me.user.profile.role !== 'admin') setGate('forbidden');
        else setGate((await mfaState().catch(() => null))?.needsCode ? 'mfa' : 'admin');
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
  const loadOverview = useCallback(async (quiet = false) => {
    if (!quiet) setOverviewLoading(true);
    try {
      const next = await admin<Overview>('payments');
      const waiting = next.queue.filter((q) => q.status === 'AWAITING_CONFIRMATION');
      if (seen.current) {
        const added = waiting.filter((q) => !seen.current!.has(q.id));
        if (added.length === 1) setFresh(`Pembayaran baru: ${added[0].payer_name ?? added[0].user} · ${rupiah(added[0].amount_idr)}. Cocokkan dengan mutasi QRIS, lalu konfirmasi.`);
        else if (added.length > 1) setFresh(`${added.length} pembayaran baru menunggu konfirmasi.`);
      }
      seen.current = new Set(waiting.map((q) => q.id));
      setOverview(next);
      setOverviewAt(Date.now());
      setOverviewError(null);
    } catch (e) {
      if (!quiet) setOverviewError((e as Error).message);
    }
    if (!quiet) setOverviewLoading(false);
  }, []);
  useEffect(() => {
    if (gate !== 'admin') return;
    void loadOverview();
    void loadContent();
  }, [gate, loadOverview, loadContent]);
  // Keep payments fresh while the dashboard is open and visible.
  useEffect(() => {
    if (gate !== 'admin') return;
    const tick = () => { if (document.visibilityState === 'visible') void loadOverview(true); };
    const t = setInterval(tick, 20_000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [gate, loadOverview]);

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
                <Icon size={18} aria-hidden />{label}{id === 'notes' && <NotesCount />}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Panels stay mounted so an unsaved form survives a tab switch. */}
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-6">
        <h1 className="sr-only">Dashboard admin Lentera English</h1>
        {fresh && (
          <div role="status" className="mb-4 flex items-center gap-3 rounded-2xl border-2 border-bad bg-bad-soft p-3 text-sm">
            <BellRing size={20} className="shrink-0 text-bad" aria-hidden />
            <p className="flex-1 font-bold">{fresh}</p>
            <Button size="sm" onClick={() => { setTab('payments'); setFresh(null); document.getElementById('antrean-konfirmasi')?.scrollIntoView({ behavior: 'smooth' }); }}>Lihat</Button>
            <button type="button" onClick={() => setFresh(null)} className="text-muted" aria-label="Tutup pemberitahuan"><X size={18} aria-hidden /></button>
          </div>
        )}
        <div role="tabpanel" id="panel-payments" aria-labelledby="tab-payments" hidden={tab !== 'payments'}>
          <div className="mb-5"><NotifyPanel /></div>
          <PaymentsPanel data={overview} loadedAt={overviewAt} loading={overviewLoading} error={overviewError} reload={() => void loadOverview()} payments={info.payments} />
        </div>
        <div role="tabpanel" id="panel-analytics" aria-labelledby="tab-analytics" hidden={tab !== 'analytics'}>
          <AnalyticsPanel active={tab === 'analytics'} />
        </div>
        <div role="tabpanel" id="panel-health" aria-labelledby="tab-health" hidden={tab !== 'health'}>
          <HealthPanel active={tab === 'health'} />
        </div>
        <div role="tabpanel" id="panel-schools" aria-labelledby="tab-schools" hidden={tab !== 'schools'}>
          <SchoolsPanel active={tab === 'schools'} />
        </div>
        <div role="tabpanel" id="panel-homework" aria-labelledby="tab-homework" hidden={tab !== 'homework'}>
          <HomeworkPanel data={content} active={tab === 'homework'} />
        </div>
        <div role="tabpanel" id="panel-content" aria-labelledby="tab-content" hidden={tab !== 'content'}>
          {content ? <CmsPanel data={content} reload={loadContent} target={target} onPublish={() => setTab('publish')} /> : contentState}
        </div>
        <div role="tabpanel" id="panel-recordings" aria-labelledby="tab-recordings" hidden={tab !== 'recordings'}>
          {content ? <RecordingsPanel data={content} /> : contentState}
        </div>
        <div role="tabpanel" id="panel-publish" aria-labelledby="tab-publish" hidden={tab !== 'publish'}>
          {content ? <PublishPanel data={content} reload={loadContent} onOpen={openInCms} active={tab === 'publish'} /> : contentState}
        </div>
        <div role="tabpanel" id="panel-notes" aria-labelledby="tab-notes" hidden={tab !== 'notes'}>
          <NotesPanel data={content} onOpen={(t) => openInCms(t)} />
        </div>
      </main>
    </div>
  );
}
