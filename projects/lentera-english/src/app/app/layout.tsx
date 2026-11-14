'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BellRing, CloudOff, Crown, Flame, Heart, ShieldCheck, X, Zap } from 'lucide-react';
import { NAV, TABS } from '@/components/nav';
import { currentHearts, liveStreak } from '@/lib/engine/gamification';
import { dueItems } from '@/lib/engine/srs';
import { isPremium } from '@/lib/engine/types';
import { loadContent, useContent, useContentError } from '@/lib/client/content';
import { useNow } from '@/lib/client/hooks';
import { initSession, useSession } from '@/lib/client/session';
import { dismissPendingAlert, useAdminPending } from '@/lib/client/admin';
import { loadLearner, onPremiumChange, useEntitlement, useLearner, useRole, useSyncStatus } from '@/lib/client/store';
import { Logo, Mascot } from '@/components/Mascot';
import { Button, cx } from '@/components/ui';

function Splash({ error, onRetry }: { error?: string | null; onRetry?: () => void }) {
  return (
    <div className="grid min-h-dvh place-items-center p-6 text-center">
      <div className="space-y-4">
        <Mascot mood={error ? 'sad' : 'happy'} size={112} className="mx-auto" />
        {error ? (
          <>
            <p className="text-lg font-bold">Pelajaran belum bisa dimuat</p>
            <p className="max-w-sm text-muted">{error} Pelajaran offline tersedia untuk Premium yang sudah mengunduhnya di perangkat ini.</p>
            <Button onClick={onRetry}>Coba lagi</Button>
          </>
        ) : (
          <p className="font-bold text-muted" role="status">Menyalakan lentera...</p>
        )}
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const session = useSession();
  const ix = useContent();
  const error = useContentError();
  const learner = useLearner();
  const ent = useEntitlement();
  const sync = useSyncStatus();
  const now = useNow();
  const [booted, setBooted] = useState(false);
  const admin = useRole() === 'admin' && !!session;
  const { pending, alert } = useAdminPending(admin && booted);

  useEffect(() => {
    let alive = true;
    (async () => {
      await initSession();
      await loadLearner();
      await loadContent();
      if (alive) setBooted(true);
    })();
    const off = onPremiumChange(() => void loadContent(true));
    return () => {
      alive = false;
      off();
    };
  }, []);
  // Switch local state when the account changes.
  useEffect(() => {
    if (booted) void loadLearner().then(() => loadContent(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.userId]);

  if (!booted || !ix) return <Splash error={booted ? error : null} onRetry={() => void loadContent(true)} />;

  const premium = isPremium(ent, now);
  const hearts = currentHearts(learner.hearts, now).count;
  const streak = liveStreak(learner.streak, now);
  const due = dueItems(learner.reviews, now).length;
  const active = (href: string) => (href === '/app' ? pathname === '/app' : pathname.startsWith(href));

  return (
    <div className="min-h-dvh lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-line bg-surface p-4 lg:flex">
        <Link href="/app" className="mb-4 px-2 text-lg"><Logo /></Link>
        <nav aria-label="Navigasi utama" className="flex-1 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} aria-current={active(href) ? 'page' : undefined} className={cx('flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold transition', active(href) ? 'bg-brand-soft text-brand' : 'text-muted hover:bg-surface-2 hover:text-ink')}>
              <Icon size={18} aria-hidden />
              {label}
              {href === '/app/review' && due > 0 && <span className="ml-auto rounded-full bg-accent px-2 text-xs text-[#1e1b3a]">{due}</span>}
            </Link>
          ))}
        </nav>
        {admin && (
          <Link href="/admin" className="mt-3 flex items-center gap-3 rounded-xl bg-ink px-3 py-2.5 text-sm font-extrabold text-bg">
            <ShieldCheck size={18} aria-hidden />
            Dashboard admin
            {!!pending && <span className="ml-auto rounded-full bg-bad px-2 text-xs text-white">{pending}</span>}
          </Link>
        )}
      </aside>

      <header className="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-2.5">
          <Link href="/app" className="mr-auto lg:hidden"><Logo size={24} /></Link>
          <span className="mr-auto hidden text-sm font-bold text-muted lg:block">{session ? session.email : 'Mode tamu · progres tersimpan di perangkat ini'}</span>
          {admin && (
            <Link href="/admin" className="relative flex items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-sm font-extrabold text-bg lg:hidden" aria-label={pending ? `Dashboard admin, ${pending} pembayaran menunggu konfirmasi` : 'Dashboard admin'}>
              <ShieldCheck size={16} aria-hidden /><span className="hidden min-[400px]:inline">Admin</span>
              {!!pending && <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-bad px-1 text-[11px] text-white" aria-hidden>{pending}</span>}
            </Link>
          )}
          {sync === 'offline' && <span title="Sedang offline. Progres disimpan di perangkat dan dikirim saat tersambung." className="text-muted"><CloudOff size={18} aria-label="Offline" /></span>}
          <Link href="/app/profile" className="flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-sm font-extrabold text-accent-strong" title="Hari belajar beruntun"><Flame size={16} aria-hidden /><span aria-label={`Beruntun ${streak} hari`}>{streak}</span></Link>
          <Link href="/app/achievements" className="flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-sm font-extrabold text-brand" title="Total XP"><Zap size={16} aria-hidden /><span aria-label={`${learner.xp} XP`}>{learner.xp}</span></Link>
          {premium ? (
            <Link href="/app/subscription" className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-sm font-extrabold text-[#1e1b3a]"><Crown size={16} aria-hidden />Premium</Link>
          ) : (
            <Link href="/app/subscription" className="flex items-center gap-1 rounded-full bg-bad-soft px-2.5 py-1 text-sm font-extrabold text-bad" title="Nyawa. Berkurang saat salah di latihan mandiri dan tes."><Heart size={16} fill="currentColor" aria-hidden /><span aria-label={`${hearts} nyawa`}>{hearts}</span></Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-28 pt-5 lg:pb-12">
        {admin && alert && (
          <div role="status" className="mb-4 flex items-center gap-3 rounded-2xl border-2 border-bad bg-bad-soft p-3 text-sm">
            <BellRing size={20} className="shrink-0 text-bad" aria-hidden />
            <p className="flex-1 font-bold">{alert}</p>
            <Link href="/admin" onClick={dismissPendingAlert} className="rounded-full bg-bad px-3 py-1.5 font-extrabold text-white">Buka</Link>
            <button type="button" onClick={dismissPendingAlert} className="text-muted" aria-label="Tutup pemberitahuan"><X size={18} aria-hidden /></button>
          </div>
        )}
        {admin && !alert && !!pending && pathname === '/app' && (
          <Link href="/admin" className="mb-4 flex items-center gap-3 rounded-2xl border-2 border-line bg-surface p-3 text-sm">
            <ShieldCheck size={20} className="shrink-0 text-brand" aria-hidden />
            <span className="flex-1"><span className="font-extrabold">{pending} pembayaran menunggu konfirmasi.</span> <span className="text-muted">Ketuk untuk membuka dashboard admin.</span></span>
          </Link>
        )}
        {children}
      </main>

      <nav aria-label="Navigasi bawah" className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-5">
          {TABS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link href={href} aria-current={active(href) ? 'page' : undefined} className={cx('relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold', active(href) ? 'text-brand' : 'text-muted')}>
                <Icon size={22} aria-hidden />
                {label}
                {href === '/app/review' && due > 0 && <span className="absolute right-4 top-1 h-2.5 w-2.5 rounded-full bg-accent" aria-label={`${due} ulangan menunggu`} />}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
