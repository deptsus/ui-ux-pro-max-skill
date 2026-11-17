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
import { act, loadLearner, onPremiumChange, useEntitlement, useLearner, useRole, useSyncStatus } from '@/lib/client/store';
import { weekStart } from '@/lib/engine/plan';
import { buildWeekly, ensureWeekly, weeklyId } from '@/lib/engine/weekly';
import { AppUpdateBanner } from '@/components/AppUpdateBanner';
import { NativeSync } from '@/components/NativeSync';
import { Logo, Mascot } from '@/components/Mascot';
import { Button, cx } from '@/components/ui';
import { applySdMode } from '@/lib/client/prefs';

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
  // Mode SD (Rilis 16): larger text for primary-school learners, remembered for the first paint.
  const sdMode = learner.profile.schoolLevel === 'sd';
  useEffect(() => { if (booted) applySdMode(sdMode); }, [booted, sdMode]);
  // Weekly PR (Rilis 4): put together once per week, as soon as there is recent work to build it from.
  const weekId = weeklyId(weekStart(now));
  const hasWeekly = !!learner.homework[weekId];
  useEffect(() => {
    if (!booted || !ix || hasWeekly) return;
    if (buildWeekly(ix, learner, Date.now())) act((d, at) => void ensureWeekly(ix, d, at));
  }, [booted, ix, hasWeekly, weekId, learner]);
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
            <Link key={href} href={href} aria-current={active(href) ? 'page' : undefined} className={cx('flex items-center gap-3 rounded-2xl border-2 px-3 py-2 font-display text-base font-bold transition', active(href) ? 'border-brand bg-brand-soft text-brand' : 'border-transparent text-muted hover:bg-surface-2 hover:text-ink')}>
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
            {!!pending && <span className="ml-auto rounded-full bg-bad px-2 text-xs text-on-brand">{pending}</span>}
          </Link>
        )}
      </aside>

      <header className="sticky top-0 z-10 border-b-2 border-outline/10 bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-2.5">
          <Link href="/app" className="mr-auto flex min-h-11 min-w-11 items-center lg:hidden"><Logo size={24} compact /></Link>
          <span className="mr-auto hidden text-sm font-bold text-muted lg:block">{session ? session.email : 'Mode tamu · progres tersimpan di perangkat ini'}</span>
          {admin && (
            <Link href="/admin" className="relative flex min-w-11 shrink-0 items-center justify-center gap-1 rounded-full bg-ink before:absolute before:inset-x-0 before:-inset-y-2.5 before:content-[''] px-2.5 py-1 text-sm font-extrabold text-bg lg:hidden" aria-label={pending ? `Dashboard admin, ${pending} pembayaran menunggu konfirmasi` : 'Dashboard admin'}>
              <ShieldCheck size={16} aria-hidden /><span className="hidden min-[400px]:inline">Admin</span>
              {!!pending && <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-bad px-1 text-[11px] text-on-brand" aria-hidden>{pending}</span>}
            </Link>
          )}
          {sync === 'offline' && <span title="Sedang offline. Progres disimpan di perangkat dan dikirim saat tersambung." className="text-muted"><CloudOff size={18} aria-label="Offline" /></span>}
          <Link href="/app/profile" className="relative flex shrink-0 items-center gap-1 rounded-full border-2 border-outline px-2.5 py-0.5 font-display text-base font-bold shadow-[0_2px_0_var(--outline)] before:absolute before:inset-x-0 before:-inset-y-2.5 before:content-[''] bg-[#fff1d6] text-[#c2410c] dark:bg-accent-soft dark:text-accent-strong" title="Hari belajar beruntun"><Flame size={17} fill="#fb923c" aria-hidden /><span aria-label={`Beruntun ${streak} hari`}>{streak}</span></Link>
          <Link href="/app/achievements" className="relative flex shrink-0 items-center gap-1 rounded-full border-2 border-outline px-2.5 py-0.5 font-display text-base font-bold shadow-[0_2px_0_var(--outline)] before:absolute before:inset-x-0 before:-inset-y-2.5 before:content-[''] bg-brand-soft text-brand" title="Total XP"><Zap size={17} fill="currentColor" aria-hidden /><span aria-label={`${learner.xp} XP`}>{learner.xp}</span></Link>
          {premium ? (
            <Link href="/app/subscription" className="relative flex shrink-0 items-center gap-1 rounded-full border-2 border-outline px-2.5 py-0.5 font-display text-base font-bold shadow-[0_2px_0_var(--outline)] before:absolute before:inset-x-0 before:-inset-y-2.5 before:content-[''] min-w-11 justify-center bg-accent text-[#1e1b3a]"><Crown size={17} aria-hidden /><span className="sr-only min-[420px]:not-sr-only">Premium</span></Link>
          ) : (
            <Link href="/app/subscription" className="relative flex shrink-0 items-center gap-1 rounded-full border-2 border-outline px-2.5 py-0.5 font-display text-base font-bold shadow-[0_2px_0_var(--outline)] before:absolute before:inset-x-0 before:-inset-y-2.5 before:content-[''] bg-bad-soft text-bad" title="Nyawa. Berkurang saat salah di latihan mandiri dan tes."><Heart size={17} fill="currentColor" aria-hidden /><span aria-label={`${hearts} nyawa`}>{hearts}</span></Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-28 pt-5 lg:pb-12">
        <AppUpdateBanner />
        <NativeSync />
        {admin && alert && (
          <div role="status" className="mb-4 flex items-center gap-3 rounded-2xl border-2 border-bad bg-bad-soft p-3 text-sm">
            <BellRing size={20} className="shrink-0 text-bad" aria-hidden />
            <p className="flex-1 font-bold">{alert}</p>
            <Link href="/admin" onClick={dismissPendingAlert} className="inline-flex min-h-11 items-center rounded-full bg-bad px-4 font-extrabold text-on-brand">Buka</Link>
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

      <nav aria-label="Navigasi bawah" className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-outline bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-5">
          {TABS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link href={href} aria-current={active(href) ? 'page' : undefined} className={cx('relative flex flex-col items-center gap-0.5 py-1.5 font-display text-xs font-bold', active(href) ? 'text-brand' : 'text-muted')}>
                <span className={cx('grid h-8 w-12 place-items-center rounded-xl border-2 transition', active(href) ? 'border-brand bg-brand-soft' : 'border-transparent')}><Icon size={22} strokeWidth={active(href) ? 2.6 : 2} aria-hidden /></span>
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
