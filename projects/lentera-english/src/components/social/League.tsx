'use client';
// Weekly league (Rilis 8): the learner's group of up to 30 in their division,
// with the move-up and move-down zones. Placement and results come from the
// server (get_league, migration 0013).
import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Clock, Crown, RefreshCw, Users } from 'lucide-react';
import { DIVISIONS, division, getLeague, timeLeft, zoneOf, type League } from '@/lib/client/habits';
import { syncIfPending } from '@/lib/client/store';
import { Avatar } from '@/components/Avatar';
import { Badge, Button, Card, Empty, LinkButton, Notice, cx } from '@/components/ui';
import { DivisionBadge } from './DivisionBadge';

function Outcome({ l }: { l: League }) {
  const name = division(l.division).name;
  const prev = l.prev_division ? division(l.prev_division).name : '';
  const rank = l.prev_rank ? ` (peringkat ${l.prev_rank} minggu lalu)` : '';
  switch (l.outcome) {
    case 'promoted': return <Notice tone="ok" title={`Selamat, kamu naik ke Liga ${name}!`}>Kamu termasuk yang teratas di Liga {prev}{rank}.</Notice>;
    case 'demoted': return <Notice tone="accent" title={`Minggu ini kamu di Liga ${name}`}>Minggu lalu kamu di zona turun Liga {prev}{rank}. Kumpulkan XP untuk naik lagi.</Notice>;
    case 'inactive': return <Notice tone="accent" title={`Selamat datang kembali di Liga ${name}`}>Kamu sempat absen seminggu penuh, jadi turun satu divisi dari Liga {prev}.</Notice>;
    case 'new': return <Notice tone="brand" title="Selamat datang di liga mingguan!">Semua mulai dari Liga Lilin. Masuk zona naik di akhir minggu untuk naik ke Liga Pelita.</Notice>;
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

  if (error) return <Empty title="Liga belum bisa dimuat" action={<Button onClick={load}>Coba lagi</Button>}>{error}</Empty>;
  if (!league) return <Card className="text-muted"><span role="status">Memuat liga...</span></Card>;
  const d = division(league.division);
  const ladder = (
    <ol className="flex items-end justify-center gap-1.5 sm:gap-3" aria-label="Lima divisi liga, dari bawah ke atas">
      {DIVISIONS.map((x, i) => (
        <li key={x.name} className={cx('flex flex-col items-center gap-1', i + 1 !== league.division && 'opacity-45')} aria-current={i + 1 === league.division ? 'true' : undefined}>
          <DivisionBadge n={i + 1} size={i + 1 === league.division ? 44 : 32} />
          <span className={cx('text-[11px] font-bold', i + 1 === league.division ? 'text-ink' : 'text-muted')}>{x.name}</span>
        </li>
      ))}
    </ol>
  );

  if (!league.joined) {
    return (
      <div className="space-y-4">
        <Card className="grid place-items-center gap-3 py-8 text-center">
          <DivisionBadge n={league.division} size={72} />
          <p className="text-lg font-extrabold">Minggu ini kamu mulai di Liga {d.name}</p>
          <p className="max-w-md text-muted">Kumpulkan XP pertamamu minggu ini untuk masuk grup liga bersama hingga 30 pelajar lain. Liga berakhir dalam {timeLeft(league.ends_at)}.</p>
          <LinkButton href="/app">Mulai belajar</LinkButton>
        </Card>
        <Card>{ladder}</Card>
      </div>
    );
  }

  const rows = league.rows ?? [];
  const size = rows.length;
  const promote = league.promote ?? 0;
  const demote = league.demote ?? 0;
  const me = rows.find((r) => r.me);
  const upName = league.division < 5 ? division(league.division + 1).name : '';
  const downName = league.division > 1 ? division(league.division - 1).name : '';
  return (
    <div className="space-y-4">
      <Outcome l={league} />
      <Card className="space-y-4">
        <div className="flex items-center gap-4">
          <DivisionBadge n={league.division} size={64} />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-extrabold">Liga {d.name}</h2>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              <span className="inline-flex items-center gap-1"><Users size={14} aria-hidden />Grup {league.cohort} · {size} pelajar</span>
              <span className="inline-flex items-center gap-1"><Clock size={14} aria-hidden />Berakhir dalam {timeLeft(league.ends_at)}</span>
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={load} disabled={loading} aria-label="Muat ulang liga"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} aria-hidden /></Button>
        </div>
        {me && <p className="rounded-2xl bg-brand-soft px-4 py-3 font-bold">Posisimu: #{me.rank} · {me.xp} XP{zoneOf(me.rank, size, promote, demote) === 'up' ? ' · di zona naik' : zoneOf(me.rank, size, promote, demote) === 'down' ? ' · di zona turun' : ''}</p>}
        <ul className="space-y-1 text-sm text-muted">
          {promote > 0 && <li className="flex items-center gap-2"><ArrowUp size={14} className="text-ok" aria-hidden />{promote} teratas (minimal 50 XP) naik ke Liga {upName}.</li>}
          {demote > 0 ? <li className="flex items-center gap-2"><ArrowDown size={14} className="text-bad" aria-hidden />{demote} terbawah turun ke Liga {downName}.</li>
            : league.division > 1 && <li className="flex items-center gap-2"><ArrowDown size={14} aria-hidden />Belum ada yang turun: grup ini kurang dari 5 pelajar.</li>}
          {league.division === 5 && <li className="flex items-center gap-2"><Crown size={14} className="text-accent-strong" aria-hidden />Mercusuar adalah divisi tertinggi. Pertahankan posisimu!</li>}
        </ul>
      </Card>
      <Card className="p-0">
        <ol aria-label={`Peringkat Liga ${d.name}, grup ${league.cohort}`}>
          {rows.map((r) => {
            const zone = zoneOf(r.rank, size, promote, demote);
            return (
              <li key={r.rank} className={cx('flex items-center gap-3 border-b border-l-4 border-b-line px-4 py-3 last:border-b-0',
                zone === 'up' ? 'border-l-ok' : zone === 'down' ? 'border-l-bad' : 'border-l-transparent', r.me && 'bg-brand-soft',
                r.rank === promote && promote < size && 'border-b-2 border-b-ok', demote > 0 && r.rank === size - demote && 'border-b-2 border-b-bad')}>
                <span className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-extrabold', r.rank === 1 ? 'bg-accent text-[#1e1b3a]' : 'bg-surface-2')}>{r.rank === 1 ? <Crown size={16} aria-label="Peringkat 1" /> : r.rank}</span>
                <Avatar index={r.avatar} size={36} decorative className="shrink-0" />
                <span className="flex min-w-0 flex-1 items-center gap-2"><span className="truncate font-bold">{r.name}</span>{r.me && <span className="shrink-0 text-xs font-bold text-brand">kamu</span>}{r.friend && <Badge tone="muted" className="shrink-0">teman</Badge>}</span>
                {zone === 'up' && <ArrowUp size={16} className="shrink-0 text-ok" aria-label="zona naik" />}
                {zone === 'down' && <ArrowDown size={16} className="shrink-0 text-bad" aria-label="zona turun" />}
                <span className="shrink-0 font-extrabold tabular-nums">{r.xp} XP</span>
              </li>
            );
          })}
        </ol>
      </Card>
      <Card>{ladder}</Card>
      <p className="text-xs text-muted">Minggu liga berjalan Senin 00.00 sampai Minggu 23.59 WIB. Hanya XP dari kegiatan belajar yang tercatat di server yang dihitung.</p>
    </div>
  );
}
