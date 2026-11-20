'use client';
// Liga Rank (migration 0022): one rank ladder, Lilin -> Pelita -> Obor ->
// Lentera -> Mercusuar, climbed with Poin Rank. Each week gives at most 100
// points (XP up to 250 and study days up to 4, the weekly plan), a week without
// XP costs 50, so following the plan Lilin to Mercusuar takes about a year.
// Points, rank and the players in the same rank come from the server
// (get_league); the rules shown here come with them.
import { useEffect, useState } from 'react';
import { CalendarCheck, Clock, Crown, RefreshCw, TrendingDown, Users, Zap } from 'lucide-react';
import { DIVISIONS, RANK, division, getLeague, rankProgress, timeLeft, weeksToNext, type League } from '@/lib/client/habits';
import { syncIfPending } from '@/lib/client/store';
import { Avatar } from '@/components/Avatar';
import { Badge, Button, Card, Empty, Notice, Progress, cx, Loading } from '@/components/ui';
import { DivisionBadge } from './DivisionBadge';

const num = (n: number) => n.toLocaleString('id-ID');

function Outcome({ l }: { l: League }) {
  const name = division(l.division).name;
  const prev = l.prev_division ? division(l.prev_division).name : '';
  switch (l.outcome) {
    case 'promoted': return <Notice tone="ok" title={`Selamat, kamu naik ke Rank ${name}!`}>Kerja kerasmu terbayar. Terus ikuti rencana mingguan untuk rank berikutnya.</Notice>;
    case 'demoted': return <Notice tone="accent" title={`Rankmu turun ke ${name}`}>Ada minggu tanpa belajar sejak terakhir kamu di Rank {prev} (−50 poin per minggu). Belajar minggu ini untuk naik lagi.</Notice>;
    case 'converted': return <Notice tone="brand" title="Liga sekarang menjadi Liga Rank">Grup mingguan diganti satu tangga rank dari Lilin sampai Mercusuar. Rankmu dihitung dari riwayat XP setiap minggu{prev ? ` (sebelumnya kamu di Liga ${prev})` : ''}.</Notice>;
    case 'new': return <Notice tone="brand" title="Selamat datang di Liga Rank!">Semua mulai dari Lilin. Kumpulkan Poin Rank setiap minggu dan naik sampai Mercusuar.</Notice>;
    default: return null;
  }
}

export function LeagueView() {
  const [league, setLeague] = useState<League | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      await syncIfPending();
      setLeague(await getLeague());
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  if (error) return <Empty title="Liga Rank belum bisa dimuat" action={<Button onClick={load}>Coba lagi</Button>}>{error}</Empty>;
  if (!league) return <Loading label="Memuat Liga Rank…" lines={4} />;
  // The server has not been updated to migration 0022 yet.
  if (league.mode !== 'rank') return <Empty title="Liga Rank sedang disiapkan" action={<Button onClick={load}>Coba lagi</Button>}>Liga sedang diperbarui menjadi Liga Rank. Coba buka lagi sebentar lagi.</Empty>;

  const rules = league.rules ?? RANK;
  const d = division(league.division);
  const prog = rankProgress(league.points, rules);
  const next = prog.next === null ? null : division(league.division + 1);
  const weeks = weeksToNext(prog.need, rules);
  const rows = league.rows ?? [];
  const me = rows.find((r) => r.me);

  return (
    <div className="space-y-4">
      <Outcome l={league} />

      <Card className="space-y-4">
        <div className="flex items-center gap-4">
          <DivisionBadge n={league.division} size={88} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-muted">Rank kamu</p>
            <h2 className="text-2xl font-extrabold">Rank {d.name}</h2>
            <p className="tabular-nums"><span className="font-display text-2xl font-bold">{num(league.points)}</span> <span className="text-sm font-bold text-muted">Poin Rank</span></p>
          </div>
          <Button size="sm" variant="secondary" onClick={load} disabled={loading} aria-label="Muat ulang Liga Rank"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} aria-hidden /></Button>
        </div>
        {next ? (
          <div className="space-y-2">
            <Progress value={prog.pct} label={`Menuju Rank ${next.name}`} tone="accent" className="h-3" />
            <p className="text-sm text-muted"><span className="font-bold text-ink">{num(prog.need)} poin lagi ke Rank {next.name}</span> · sekitar {weeks} minggu bila rencana mingguan tuntas</p>
          </div>
        ) : (
          <p className="flex items-center gap-2 rounded-xl bg-accent-soft px-4 py-3 text-sm font-bold text-accent-strong"><Crown size={16} aria-hidden />Mercusuar adalah rank tertinggi. Jaga poinmu dengan belajar setiap minggu.</p>
        )}
      </Card>

      <Card className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 className="text-lg font-extrabold">Poin minggu ini</h3>
          <p className="inline-flex items-center gap-1 text-sm text-muted"><Clock size={14} aria-hidden />Minggu berakhir dalam {timeLeft(league.ends_at)}</p>
        </div>
        <div className="space-y-1.5">
          <p className="flex items-center justify-between gap-2 text-sm"><span className="inline-flex items-center gap-1.5 font-bold"><Zap size={15} className="text-accent-strong" aria-hidden />XP minggu ini</span><span className="tabular-nums text-muted">{num(Math.min(league.week_xp, rules.xp_full))} / {num(rules.xp_full)} XP</span></p>
          <Progress value={league.week_xp} max={rules.xp_full} label="XP minggu ini" />
        </div>
        <div className="space-y-1.5">
          <p className="flex items-center justify-between gap-2 text-sm"><span className="inline-flex items-center gap-1.5 font-bold"><CalendarCheck size={15} className="text-ok" aria-hidden />Hari belajar</span><span className="tabular-nums text-muted">{Math.min(league.week_days, rules.days_full)} / {rules.days_full} hari</span></p>
          <Progress value={league.week_days} max={rules.days_full} tone="ok" label="Hari belajar minggu ini" />
        </div>
        <p className="rounded-xl bg-brand-soft px-4 py-3 font-bold text-brand-ink">+{league.week_points} dari {rules.week_max} poin minggu ini</p>
        <p className="flex items-start gap-2 text-xs text-muted"><TrendingDown size={14} className="mt-0.5 shrink-0" aria-hidden />Poin penuh: {num(rules.xp_full)} XP di {rules.days_full} hari berbeda. XP lebih banyak tidak menambah poin, dan minggu tanpa belajar sama sekali mengurangi {Math.abs(rules.inactive)} poin.</p>
      </Card>

      <Card className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
          <h3 className="text-lg font-extrabold">Pemain Rank {d.name}</h3>
          <p className="inline-flex items-center gap-1 text-sm text-muted"><Users size={14} aria-hidden />{num(league.players)} pemain{me ? ` · kamu #${me.rank}` : ''}</p>
        </div>
        <ol aria-label={`Pemain Rank ${d.name}`}>
          {rows.map((r) => (
            <li key={`${r.rank}-${r.name}`} className={cx('flex items-center gap-3 border-b border-line px-4 py-3 last:border-b-0', r.me && 'bg-brand-soft')}>
              <span className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-extrabold tabular-nums', r.rank === 1 ? 'bg-accent text-on-accent' : 'bg-surface-2')}>{r.rank === 1 ? <Crown size={16} aria-label="Peringkat 1" /> : r.rank}</span>
              <Avatar index={r.avatar} size={36} decorative className="shrink-0" />
              <span className="flex min-w-0 flex-1 items-center gap-2"><span className="truncate font-bold">{r.name}</span>{r.me && <span className="shrink-0 text-xs font-bold text-brand">kamu</span>}{r.friend && <Badge tone="muted" className="shrink-0">teman</Badge>}</span>
              <span className="shrink-0 text-right font-extrabold tabular-nums">{num(r.points)}<span className="block text-xs font-bold text-muted">poin</span></span>
            </li>
          ))}
        </ol>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-lg font-extrabold">Tangga rank</h3>
        <ol className="grid grid-cols-5 gap-1 pt-3 sm:gap-3" aria-label="Lima rank, dari Lilin sampai Mercusuar">
          {DIVISIONS.map((x, i) => {
            const current = i + 1 === league.division;
            return (
              <li key={x.name} aria-current={current ? 'true' : undefined}
                className={cx('flex flex-col items-center gap-1 rounded-xl px-0.5 py-2 text-center', current && 'bg-brand-soft ring-2 ring-brand')}>
                <DivisionBadge n={i + 1} size={48} />
                <span className={cx('text-xs font-bold', current ? 'text-ink' : 'text-muted')}>{x.name}</span>
                <span className="text-xs tabular-nums text-muted">{i === 0 ? 'Mulai' : `${num(rules.thresholds[i])}+`}</span>
              </li>
            );
          })}
        </ol>
        <p className="text-sm text-muted">Dengan poin penuh setiap minggu: {DIVISIONS.slice(1).map((x, i) => `${x.name} minggu ke-${weeksToNext(rules.thresholds[i + 1], rules)}`).join(', ')}. Sekitar satu tahun belajar.</p>
      </Card>
      <p className="text-xs text-muted">Minggu berjalan Senin 00.00 sampai Minggu 23.59 WIB. Hanya XP dari kegiatan belajar yang tercatat di server yang dihitung.</p>
    </div>
  );
}
