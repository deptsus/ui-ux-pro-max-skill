'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BellRing, CloudOff, Crown, Flame, Heart, ShieldCheck, X, Zap } from 'lucide-react';
import { NAV_GROUPS, TABS } from '@/components/nav';
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
import { Button, Toaster, cx } from '@/components/ui';

// Header stats: icon + number with a full name for screen readers; the hit area grows to 44 px.
const CHIP_BASE = "relative flex h-9 min-w-11 shrink-0 items-center justify-center gap-1 rounded-full border px-2.5 text-sm font-extrabold tabular-nums before:absolute before:inset-x-0 before:-inset-y-1 before:content-['']";
const CHIP = cx(CHIP_BASE, 'border-line bg-surface');
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
          <p className="font-bold text-muted" role="status">Menyalakan lentera…</p>
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
  // Bottom nav: a tab is current for its own pages; "Lainnya" for every page listed in it.
  const tabOn = (t: (typeof TABS)[number]) => (t.href === '/app' ? pathname === '/app' : t.match.some((m) => pathname.startsWith(m)))
    || (t.href === '/app/more' && pathname !== '/app' && !TABS.some((o) => o.href !== '/app/more' && o.match.some((m) => pathname.startsWith(m))));

  return (
    <div className="min-h-dvh lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-line bg-surface px-3 pb-4 pt-[max(1rem,env(safe-area-inset-top))] lg:flex">
        <Link href="/app" className="mb-3 flex min-h-11 items-center px-3 text-lg"><Logo /></Link>
        <nav aria-label="Navigasi utama" className="-mx-1 flex-1 space-y-4 overflow-y-auto px-1">
          {NAV_GROUPS.map((g) => (
            <div key={g.title}>
              <p className="px-3 pb-1 text-xs font-bold text-muted">{g.title}</p>
              <ul className="space-y-0.5">
                {g.items.map(({ href, label, icon: Icon }) => (
                  <li key={href}>
                    <Link href={href} aria-current={active(href) ? 'page' : undefined} className={cx('flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold transition-colors', active(href) ? 'bg-brand-soft text-brand-ink' : 'text-muted hover:bg-surface-2 hover:text-ink')}>
                      <Icon size={18} aria-hidden />
                      {label}
                      {href === '/app/review' && due > 0 && <span className="ml-auto rounded-full bg-accent px-2 text-xs text-on-accent">{due}<span className="sr-only"> menunggu</span></span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        {admin && (
          <Link href="/admin" className="mt-3 flex min-h-11 items-center gap-3 rounded-xl bg-ink px-3 py-2.5 text-sm font-bold text-bg">
            <ShieldCheck size={18} aria-hidden />
            Dashboard admin
            {!!pending && <span className="ml-auto rounded-full bg-bad px-2 text-xs text-on-brand">{pending}</span>}
          </Link>
        )}
      </aside>

      <header className="sticky top-0 z-10 border-b border-line bg-bg/90 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-1.5 px-4 py-2">
          <Link href="/app" className="mr-auto flex min-h-11 min-w-11 items-center lg:hidden" aria-label="Lentera English, ke Beranda"><Logo size={24} compact /></Link>
          <span className="mr-auto hidden text-sm font-bold text-muted lg:block">{session ? session.email : 'Mode tamu · progres tersimpan di perangkat ini'}</span>
          {admin && (
            <Link href="/admin" className={cx(CHIP_BASE, 'border-ink bg-ink text-bg lg:hidden')} aria-label={pending ? `Dashboard admin, ${pending} pembayaran menunggu konfirmasi` : 'Dashboard admin'}>
              <ShieldCheck size={16} aria-hidden /><span aria-hidden>Admin</span>
              {!!pending && <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-bad px-1 text-xs text-on-brand" aria-hidden>{pending}</span>}
            </Link>
          )}
          {sync === 'offline' && <span title="Sedang offline. Progres disimpan di perangkat dan dikirim saat tersambung." className="grid h-11 w-8 place-items-center text-muted"><CloudOff size={18} aria-hidden /><span className="sr-only">Offline</span></span>}
          <Link href="/app/profile" className={CHIP} aria-label={`Beruntun ${streak} hari`}><Flame size={16} className="text-accent-strong" fill="var(--accent)" aria-hidden />{streak}</Link>
          <Link href="/app/achievements" className={CHIP} aria-label={`${learner.xp} XP`}><Zap size={16} className="text-brand" fill="currentColor" aria-hidden />{learner.xp}</Link>
          {premium ? (
            <Link href="/app/subscription" className={cx(CHIP_BASE, 'border-accent bg-accent text-on-accent')}><Crown size={16} aria-hidden /><span className={admin ? 'sr-only min-[420px]:not-sr-only' : undefined}>Premium</span></Link>
          ) : (
            <Link href="/app/subscription" className={CHIP} aria-label={`${hearts} nyawa`}><Heart size={16} className="text-bad" fill="currentColor" aria-hidden />{hearts}</Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-[calc(var(--bottom-nav)+env(safe-area-inset-bottom)+2rem)] pt-5 lg:pb-12">
        <AppUpdateBanner />
        <NativeSync />
        {admin && alert && (
          <div role="status" className="mb-4 flex items-center gap-3 rounded-xl bg-bad-soft px-4 py-2 text-sm">
            <BellRing size={20} className="shrink-0 text-bad" aria-hidden />
            <p className="flex-1 font-bold">{alert}</p>
            <Link href="/admin" onClick={dismissPendingAlert} className="inline-flex min-h-11 items-center rounded-xl bg-bad px-4 font-bold text-on-brand">Buka</Link>
            <button type="button" onClick={dismissPendingAlert} className="-mr-2 grid h-11 w-11 place-items-center rounded-full text-muted hover:bg-surface" aria-label="Tutup pemberitahuan"><X size={18} aria-hidden /></button>
          </div>
        )}
        {admin && !alert && !!pending && pathname === '/app' && (
          <Link href="/admin" className="mb-4 flex min-h-11 items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm hover:bg-surface-2">
            <ShieldCheck size={20} className="shrink-0 text-brand" aria-hidden />
            <span className="flex-1"><span className="font-bold">{pending} pembayaran menunggu konfirmasi.</span> <span className="text-muted">Ketuk untuk membuka dashboard admin.</span></span>
          </Link>
        )}
        {children}
      </main>
      <Toaster />

      <nav aria-label="Navigasi bawah" className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <ul className="mx-auto grid h-16 max-w-md grid-cols-5">
          {TABS.map((t) => {
            const on = tabOn(t);
            const Icon = t.icon;
            return (
              <li key={t.href}>
                <Link href={t.href} aria-current={on ? 'page' : undefined} className={cx('group relative flex h-full flex-col items-center justify-center gap-0.5 text-xs font-bold transition-colors', on ? 'text-brand-ink dark:text-brand' : 'text-muted hover:text-ink')}>
                  <span className={cx('grid h-8 w-14 place-items-center rounded-full transition-[background-color,transform] duration-150 group-active:scale-90', on && 'bg-brand-soft')}><Icon size={22} strokeWidth={on ? 2.4 : 2} aria-hidden /></span>
                  {t.label}
                  {t.href === '/app/review' && due > 0 && <><span className="absolute right-[calc(50%-1.5rem)] top-2 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-surface" aria-hidden /><span className="sr-only">, {due} ulangan menunggu</span></>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
