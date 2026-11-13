'use client';
import { useEffect, useState } from 'react';
import { Crown, RefreshCw } from 'lucide-react';
import { api } from '@/lib/client/api';
import { useServerInfo, useSession } from '@/lib/client/session';
import { syncNow, useLearner } from '@/lib/client/store';
import { Button, Card, Empty, LinkButton, PageHeader, cx, dateId } from '@/components/ui';

interface Board { week_start: string; top: { rank: number; name: string; avatar: number; xp: number; me: boolean }[]; me: { rank: number; xp: number } | null }
const AVATAR_COLORS = ['#4b3fd6', '#f59e0b', '#15803d', '#be123c', '#0e7490', '#7c3aed', '#c2410c', '#0f766e'];

export default function LeaderboardPage() {
  const session = useSession();
  const info = useServerInfo();
  const learner = useLearner();
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      await syncNow();
      setBoard(await api<Board>('/api/leaderboard'));
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  };
  useEffect(() => { if (session) void load(); }, [session?.userId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <PageHeader title="Papan Peringkat Mingguan" subtitle="Peringkat dihitung dari XP yang tercatat di server sejak Senin. XP hanya datang dari kegiatan belajar." action={session ? <Button size="sm" variant="secondary" onClick={load} disabled={loading}><RefreshCw size={14} className={loading ? 'animate-spin' : ''} aria-hidden />Muat ulang</Button> : undefined} />
      {!session ? (
        <Empty title="Masuk untuk ikut papan peringkat" action={info.backend === 'none' ? undefined : <LinkButton href="/daftar">Buat akun gratis</LinkButton>}>{info.backend === 'none' ? 'Server ini berjalan tanpa backend akun, jadi papan peringkat belum tersedia. Progresmu tetap tersimpan di perangkat.' : 'Papan peringkat membandingkan XP antar akun, jadi butuh akun. Progres tamu ikut dipindahkan saat kamu mendaftar.'}</Empty>
      ) : error ? (
        <Empty title="Papan peringkat belum bisa dimuat" action={<Button onClick={load}>Coba lagi</Button>}>{error}</Empty>
      ) : !board ? (
        <Card className="text-muted"><span role="status">Memuat...</span></Card>
      ) : board.top.length === 0 ? (
        <Empty title="Belum ada yang mengumpulkan XP minggu ini" action={<LinkButton href="/app/path">Jadilah yang pertama</LinkButton>}>Minggu dimulai {dateId(board.week_start)}.</Empty>
      ) : (
        <>
          <Card className="mb-4 flex items-center justify-between p-4"><p className="font-bold">Posisimu minggu ini</p><p className="text-xl font-extrabold">{board.me ? `#${board.me.rank} · ${board.me.xp} XP` : 'Belum ada XP minggu ini'}</p></Card>
          <Card className="p-0">
            <ol>
              {board.top.map((r) => (
                <li key={r.rank + r.name} className={cx('flex items-center gap-3 border-b border-line px-4 py-3 last:border-0', r.me && 'bg-brand-soft')}>
                  <span className={cx('grid h-8 w-8 place-items-center rounded-full text-sm font-extrabold', r.rank === 1 ? 'bg-accent text-[#1e1b3a]' : 'bg-surface-2')}>{r.rank === 1 ? <Crown size={16} aria-label="Peringkat 1" /> : r.rank}</span>
                  <span className="grid h-9 w-9 place-items-center rounded-full text-sm font-extrabold text-white" style={{ background: AVATAR_COLORS[r.avatar % AVATAR_COLORS.length] }} aria-hidden>{r.name.slice(0, 1).toUpperCase()}</span>
                  <span className="min-w-0 flex-1 truncate font-bold">{r.name}{r.me && <span className="ml-2 text-xs font-bold text-brand">kamu</span>}</span>
                  <span className="font-extrabold">{r.xp} XP</span>
                </li>
              ))}
            </ol>
          </Card>
          <p className="mt-3 text-xs text-muted">XP lokalmu {learner.xp}. Server membatasi XP per kegiatan dan per hari agar papan peringkat adil.</p>
        </>
      )}
    </div>
  );
}
