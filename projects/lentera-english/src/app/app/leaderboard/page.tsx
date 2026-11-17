'use client';
// Liga & Teman (Rilis 8): the weekly league in divisions, friends and friend
// challenges, and the all-learners weekly board that came before them.
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Crown, RefreshCw } from 'lucide-react';
import { api } from '@/lib/client/api';
import { useServerInfo, useSession } from '@/lib/client/session';
import { syncIfPending, useLearner } from '@/lib/client/store';
import { Avatar } from '@/components/Avatar';
import { FriendsView } from '@/components/social/Friends';
import { LeagueView } from '@/components/social/League';
import { Button, Card, Empty, LinkButton, PageHeader, cx, dateId } from '@/components/ui';
import { useSdMode } from '@/components/school/SchoolLevel';

interface Board { week_start: string; top: { rank: number; name: string; avatar: number; xp: number; me: boolean }[]; me: { rank: number; xp: number } | null }

function AllBoard() {
  const learner = useLearner();
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      await syncIfPending();
      setBoard(await api<Board>('/api/leaderboard'));
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  if (error) return <Empty title="Papan peringkat belum bisa dimuat" action={<Button onClick={load}>Coba lagi</Button>}>{error}</Empty>;
  if (!board) return <Card className="text-muted"><span role="status">Memuat...</span></Card>;
  if (board.top.length === 0) return <Empty title="Belum ada yang mengumpulkan XP minggu ini" action={<LinkButton href="/app/path">Jadilah yang pertama</LinkButton>}>Minggu dimulai {dateId(board.week_start)}.</Empty>;
  return (
    <>
      <Card className="mb-4 flex flex-wrap items-center justify-between gap-2 p-4">
        <p className="font-bold">Posisimu minggu ini</p>
        <p className="text-xl font-extrabold">{board.me ? `#${board.me.rank} · ${board.me.xp} XP` : 'Belum ada XP minggu ini'}</p>
        <Button size="sm" variant="secondary" onClick={load} disabled={loading} aria-label="Muat ulang papan peringkat"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} aria-hidden /></Button>
      </Card>
      <Card className="p-0">
        <ol aria-label="30 teratas minggu ini">
          {board.top.map((r) => (
            <li key={r.rank + r.name} className={cx('flex items-center gap-3 border-b border-line px-4 py-3 last:border-0', r.me && 'bg-brand-soft')}>
              <span className={cx('grid h-8 w-8 place-items-center rounded-full text-sm font-extrabold', r.rank === 1 ? 'bg-accent text-[#1e1b3a]' : 'bg-surface-2')}>{r.rank === 1 ? <Crown size={16} aria-label="Peringkat 1" /> : r.rank}</span>
              <Avatar index={r.avatar} size={36} decorative className="shrink-0" />
              <span className="min-w-0 flex-1 truncate font-bold">{r.name}{r.me && <span className="ml-2 text-xs font-bold text-brand">kamu</span>}</span>
              <span className="font-extrabold">{r.xp} XP</span>
            </li>
          ))}
        </ol>
      </Card>
      <p className="mt-3 text-xs text-muted">XP lokalmu {learner.xp}. Server membatasi XP per kegiatan dan per hari agar papan peringkat adil.</p>
    </>
  );
}

const TABS = [
  { id: 'liga', label: 'Liga' },
  { id: 'teman', label: 'Teman' },
  { id: 'semua', label: 'Semua' },
] as const;

function Leaderboard() {
  const params = useSearchParams();
  const session = useSession();
  const info = useServerInfo();
  const tab = TABS.find((t) => t.id === params.get('tab'))?.id ?? 'liga';
  const invite = params.get('kode') ?? '';
  const sd = useSdMode();

  return (
    <div>
      <PageHeader title="Liga & Teman" subtitle="Bersaing sehat setiap minggu. XP hanya datang dari kegiatan belajar, jadi yang rajin yang menang." />
      {sd && <p className="mb-4 rounded-2xl bg-brand-soft px-4 py-3 text-sm"><b>Mode SD:</b> di liga dan papan umum, namamu tampil sebagai "Pelajar SD". Hanya teman yang kamu tambahkan yang melihat namamu.</p>}
      <nav className="mb-4 flex gap-2" aria-label="Bagian papan peringkat">
        {TABS.map((t) => <LinkButton key={t.id} href={t.id === 'liga' ? '/app/leaderboard' : `/app/leaderboard?tab=${t.id}`} size="sm" variant={tab === t.id ? 'primary' : 'secondary'}>{t.label}</LinkButton>)}
      </nav>
      {!session ? (
        <Empty title={invite ? `Masuk untuk berteman dengan kode ${invite.toUpperCase()}` : 'Masuk untuk ikut liga dan berteman'} action={info.backend === 'none' ? undefined : <LinkButton href="/daftar">Buat akun gratis</LinkButton>}>
          {info.backend === 'none' ? 'Server ini berjalan tanpa backend akun, jadi liga dan teman belum tersedia. Progresmu tetap tersimpan di perangkat.' : 'Liga, teman, dan tantangan membandingkan XP antar akun, jadi butuh akun. Progres tamu ikut dipindahkan saat kamu mendaftar.'}
          {invite && info.backend !== 'none' && ' Setelah masuk, buka lagi tautan undangannya.'}
        </Empty>
      ) : tab === 'teman' ? <FriendsView initialCode={invite} /> : tab === 'semua' ? <AllBoard /> : <LeagueView />}
    </div>
  );
}

export default function LeaderboardPage() {
  return <Suspense><Leaderboard /></Suspense>;
}
