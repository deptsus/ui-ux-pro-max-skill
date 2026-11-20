'use client';
// Friends and friend challenges (Rilis 8). Friends are added with a six-
// character invite code (or an invite link that fills it in); a challenge is
// "who earns more XP in 3 or 7 days", scored from server XP only.
import { isNativeApp, nativeShare } from '@/lib/client/native';
import { useEffect, useState } from 'react';
import { Check, Copy, Flame, Share2, Swords, Trophy, UserPlus, X } from 'lucide-react';
import { getSocial, inviteUrl, socialAction, timeLeft, type Challenge, type Social } from '@/lib/client/habits';
import { syncIfPending } from '@/lib/client/store';
import { Avatar } from '@/components/Avatar';
import { Button, Card, Empty, Notice, Progress, cx, inputClass, Loading } from '@/components/ui';

const CODE_CHARS = /[^A-HJ-NP-Z2-9]/g;

function ChallengeCard({ c, busy, act }: { c: Challenge; busy: boolean; act: (body: Parameters<typeof socialAction>[0]) => void }) {
  const head = (
    <div className="flex items-center gap-3">
      <Avatar index={c.avatar} size={36} decorative className="shrink-0" />
      <p className="min-w-0 flex-1 font-bold">
        {c.status === 'pending' && !c.mine && <>{c.name} menantangmu</>}
        {c.status === 'pending' && c.mine && <>Menunggu jawaban {c.name}</>}
        {c.status !== 'pending' && <>Tantangan dengan {c.name}</>}
        <span className="block text-sm font-normal text-muted">XP terbanyak dalam {c.days} hari</span>
      </p>
      <Swords size={18} className="shrink-0 text-brand" aria-hidden />
    </div>
  );
  if (c.status === 'pending') {
    return (
      <Card className="space-y-3">
        {head}
        <p className="text-sm text-muted">Undangan berlaku {timeLeft(c.expires_at)} lagi. Waktu tantangan baru berjalan setelah diterima.</p>
        <div className="flex flex-wrap gap-2">
          {c.mine ? <Button size="sm" variant="ghost" disabled={busy} onClick={() => act({ action: 'cancel', id: c.id })}>Batalkan tantangan</Button> : <>
            <Button size="sm" disabled={busy} onClick={() => act({ action: 'respond', id: c.id, accept: true })}><Check size={14} aria-hidden />Terima</Button>
            <Button size="sm" variant="secondary" disabled={busy} onClick={() => act({ action: 'respond', id: c.id, accept: false })}><X size={14} aria-hidden />Tolak</Button>
          </>}
        </div>
      </Card>
    );
  }
  if (c.status === 'active' || c.status === 'finished') {
    const mine = c.my_xp ?? 0;
    const theirs = c.their_xp ?? 0;
    const max = Math.max(mine, theirs, 1);
    const result = c.status === 'finished' ? (mine > theirs ? 'Kamu menang!' : mine < theirs ? `${c.name} menang` : 'Seri') : null;
    return (
      <Card className={cx('space-y-3', c.status === 'finished' && mine > theirs && 'border-2 border-ok')}>
        {head}
        <div className="space-y-2">
          <div><div className="flex justify-between text-sm font-bold"><span>Kamu</span><span className="tabular-nums">{mine} XP</span></div><Progress value={mine} max={max} tone="brand" className="mt-1 h-2.5" label={`XP-mu dalam tantangan: ${mine}`} /></div>
          <div><div className="flex justify-between text-sm font-bold"><span>{c.name}</span><span className="tabular-nums">{theirs} XP</span></div><Progress value={theirs} max={max} tone="accent" className="mt-1 h-2.5" label={`XP ${c.name} dalam tantangan: ${theirs}`} /></div>
        </div>
        <p className="text-sm font-bold">{result ? <span className={mine > theirs ? 'text-ok' : ''}>{mine > theirs && <Trophy size={14} className="mr-1 inline" aria-hidden />}{result}</span> : <span className="text-muted">Berakhir dalam {timeLeft(c.ends_at!)}</span>}</p>
      </Card>
    );
  }
  const label = { declined: 'ditolak', cancelled: 'dibatalkan', expired: 'kedaluwarsa (tidak dijawab dalam 3 hari)' }[c.status];
  return <li className="flex items-center gap-2 text-sm text-muted"><Swords size={14} aria-hidden />Tantangan {c.days} hari dengan {c.name} {label}.</li>;
}

export function FriendsView({ initialCode = '' }: { initialCode?: string }) {
  const [social, setSocial] = useState<Social | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState(initialCode.toUpperCase().replace(CODE_CHARS, '').slice(0, 6));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'ok' | 'bad'; text: string } | null>(null);
  const [challenging, setChallenging] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    setError(null);
    try {
      await syncIfPending();
      setSocial(await getSocial());
    } catch (e) {
      setError((e as Error).message);
    }
  };
  useEffect(() => { void load(); }, []);

  async function act(body: Parameters<typeof socialAction>[0]) {
    setBusy(true);
    setMsg(null);
    try {
      const r = await socialAction(body);
      setSocial(r.social);
      setMsg({ tone: 'ok', text: r.message });
      if (body.action === 'add') setCode('');
      setChallenging(null);
      setRemoving(null);
    } catch (e) {
      setMsg({ tone: 'bad', text: (e as Error).message });
    }
    setBusy(false);
  }

  if (error) return <Empty title="Daftar teman belum bisa dimuat" action={<Button onClick={load}>Coba lagi</Button>}>{error}</Empty>;
  if (!social) return <Loading label="Memuat teman…" lines={3} />;

  const link = typeof window === 'undefined' ? '' : inviteUrl(window.location.origin, social.code);
  const shareText = `Ayo belajar bahasa Inggris bareng di Lentera English! Tambahkan aku sebagai teman dengan kode ${social.code}: ${link}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setMsg({ tone: 'bad', text: `Tidak bisa menyalin otomatis. Kodemu: ${social.code}` });
    }
  };
  const share = async () => {
    if (isNativeApp()) nativeShare('Belajar bareng di Lentera English', shareText);
    else if (navigator.share) {
      try { await navigator.share({ title: 'Belajar bareng di Lentera English', text: shareText }); } catch { /* cancelled */ }
    } else await copy();
  };
  const friends = social.friends;
  const others = friends.filter((f) => !f.me);
  const open = social.challenges.filter((c) => c.status === 'pending' || c.status === 'active');
  const finished = social.challenges.filter((c) => c.status === 'finished');
  const closed = social.challenges.filter((c) => !['pending', 'active', 'finished'].includes(c.status));
  const incoming = open.filter((c) => c.status === 'pending' && !c.mine);

  return (
    <div className="space-y-5">
      {msg && <div role="status"><Notice tone={msg.tone}>{msg.text}</Notice></div>}
      {incoming.length > 0 && <Notice tone="accent" title={`${incoming.length} tantangan menunggu jawabanmu`}>Lihat bagian Tantangan di bawah.</Notice>}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="font-extrabold">Kode temanmu</h2>
          <p className="select-all text-center font-mono text-3xl font-extrabold tracking-[0.3em] text-brand" aria-label={`Kode temanmu: ${social.code.split('').join(' ')}`}>{social.code}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button size="sm" onClick={share}><Share2 size={14} aria-hidden />Bagikan undangan</Button>
            <Button size="sm" variant="secondary" onClick={copy}>{copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}{copied ? 'Tersalin' : 'Salin'}</Button>
            <a className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-line-strong px-4 text-sm font-bold hover:border-brand" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </div>
          <p className="text-xs text-muted">Teman bisa melihat nama, avatar, XP mingguan, dan beruntunmu. Kamu bisa menghapus teman kapan saja.</p>
        </Card>
        <Card className="space-y-3">
          <h2 className="font-extrabold">Tambah teman</h2>
          <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); if (code.length === 6) void act({ action: 'add', code }); }}>
            <label className="block">
              <span className="mb-1 block text-sm font-bold">Kode teman (6 karakter)</span>
              <input className={cx(inputClass, 'font-mono text-xl uppercase tracking-[0.25em]')} value={code} maxLength={6} autoComplete="off" autoCapitalize="characters" spellCheck={false} inputMode="text"
                placeholder="ABC234" onChange={(e) => setCode(e.target.value.toUpperCase().replace(CODE_CHARS, '').slice(0, 6))} />
            </label>
            {initialCode && code === initialCode.toUpperCase().replace(CODE_CHARS, '').slice(0, 6) && <p className="text-sm text-muted">Kode dari tautan undangan. Tekan <strong>Tambah teman</strong> untuk berteman.</p>}
            <Button type="submit" disabled={busy || code.length !== 6}><UserPlus size={16} aria-hidden />Tambah teman</Button>
          </form>
          <p className="text-xs text-muted">Kode memakai huruf A–Z dan angka 2–9, tanpa O, 0, I, dan 1 agar tidak tertukar.</p>
        </Card>
      </div>

      <section aria-labelledby="tantangan" className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="tantangan" className="text-lg font-extrabold">Tantangan</h2>
          <p className="text-sm text-muted">Rekor: {social.record.won} menang · {social.record.lost} kalah · {social.record.draw} seri</p>
        </div>
        {open.length + finished.length === 0 && <p className="text-sm text-muted">Belum ada tantangan. Tekan <strong>Tantang</strong> di samping nama teman: siapa yang mengumpulkan XP terbanyak dalam 3 atau 7 hari.</p>}
        <div className="grid gap-3 md:grid-cols-2">
          {[...open, ...finished].map((c) => <ChallengeCard key={c.id} c={c} busy={busy} act={act} />)}
        </div>
        {closed.length > 0 && <ul className="space-y-1">{closed.map((c) => <ChallengeCard key={c.id} c={c} busy={busy} act={act} />)}</ul>}
      </section>

      <section aria-labelledby="daftar-teman" className="space-y-3">
        <h2 id="daftar-teman" className="text-lg font-extrabold">Teman minggu ini</h2>
        {others.length === 0 ? (
          <Card className="text-center text-muted">Belum ada teman. Bagikan kodemu atau masukkan kode temanmu di atas.</Card>
        ) : (
          <Card className="p-0">
            <ol aria-label="Peringkat teman berdasarkan XP minggu ini">
              {friends.map((f, i) => (
                <li key={f.code ?? 'me'} className={cx('border-b border-line px-4 py-3 last:border-0', f.me && 'bg-brand-soft')}>
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-extrabold">{i + 1}</span>
                    <Avatar index={f.avatar} size={36} decorative className="shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2"><span className="truncate font-bold">{f.name}</span>{f.me && <span className="shrink-0 text-xs font-bold text-brand">kamu</span>}</span>
                      <span className="flex items-center gap-1 text-xs text-muted"><Flame size={12} className={f.streak > 0 ? 'text-accent' : ''} aria-hidden />{f.streak > 0 ? `${f.streak} hari beruntun` : 'Belum beruntun'}</span>
                    </span>
                    <span className="shrink-0 font-extrabold tabular-nums">{f.xp} XP</span>
                  </div>
                  {!f.me && f.code && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 pl-11">
                      {challenging === f.code ? <>
                        <span className="text-sm font-bold">Lama tantangan:</span>
                        <Button size="sm" disabled={busy} onClick={() => act({ action: 'challenge', code: f.code!, days: 3 })}>3 hari</Button>
                        <Button size="sm" disabled={busy} onClick={() => act({ action: 'challenge', code: f.code!, days: 7 })}>7 hari</Button>
                        <Button size="sm" variant="ghost" onClick={() => setChallenging(null)}>Batal</Button>
                      </> : removing === f.code ? <>
                        <span className="text-sm font-bold text-bad">Hapus {f.name} dari teman?</span>
                        <Button size="sm" variant="danger" disabled={busy} onClick={() => act({ action: 'remove', code: f.code! })}>Ya, hapus</Button>
                        <Button size="sm" variant="ghost" onClick={() => setRemoving(null)}>Batal</Button>
                      </> : <>
                        <Button size="sm" variant="secondary" onClick={() => { setChallenging(f.code); setRemoving(null); }}><Swords size={14} aria-hidden />Tantang</Button>
                        <Button size="sm" variant="ghost" onClick={() => { setRemoving(f.code); setChallenging(null); }}>Hapus</Button>
                      </>}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </Card>
        )}
        {others.length > 0 && <p className="text-xs text-muted">Maksimal 3 tantangan berjalan sekaligus, satu per teman. Tantangan yang tidak dijawab dalam 3 hari kedaluwarsa.</p>}
      </section>
    </div>
  );
}
