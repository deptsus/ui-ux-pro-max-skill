'use client';
// "Kesehatan" (Rilis 9): what needs the owner's attention: errors learners
// hit, messages from the contact form, backups, scheduled jobs, how full the
// Supabase Free plan is, and two-step verification for this admin account.
import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, DatabaseBackup, Download, KeyRound, Mail, RefreshCw, ShieldCheck } from 'lucide-react';
import { Badge, Button, Card, Notice, Progress, cx, dateTimeId, inputClass } from '@/components/ui';
import { api } from '@/lib/client/api';
import { getToken, mfaEnroll, mfaRemove, mfaState, mfaVerify, type MfaState } from '@/lib/client/session';
import { CONTACT_TOPICS, type ContactTopic } from '@/lib/contact';
import { admin } from './api';

interface ErrorRow { id: number; source: 'client' | 'server'; message: string; stack: string | null; path: string | null; release: string | null; user_agent: string | null; count: number; users: number; status: 'open' | 'resolved'; first_seen: string; last_seen: string }
interface Message { id: number; topic: ContactTopic; name: string; contact: string | null; message: string; status: 'open' | 'done'; created_at: string }
interface Health {
  db_bytes: number;
  tables: { name: string; rows: number; bytes: number }[];
  storage: { bucket: string; files: number; bytes: number }[];
  jobs: { job: string; last_run_at: string }[];
  backups: { id: number; name: string; bytes: number; rows: number; tables: number; ms: number; trigger: string; created_at: string }[];
  errors_open: number;
  messages_open: number;
  learners: number;
  active_30d: number;
}
interface Data { health: Health; errors: ErrorRow[]; messages: Message[]; files: string[] }

/** Supabase Free plan limits (supabase.com/pricing, November 2026). */
export const FREE_PLAN = { dbBytes: 500 * 1024 ** 2, storageBytes: 1024 ** 3, mau: 50_000 };
const mb = (b: number) => `${(b / 1024 ** 2).toLocaleString('id-ID', { maximumFractionDigits: b < 10 * 1024 ** 2 ? 1 : 0 })} MB`;
const JOB_NAMES: Record<string, string> = { 'homework-reminders': 'Pengingat PR (tiap jam)', 'daily-reminders': 'Pengingat harian (tiap jam)' };

function MfaCard() {
  const [state, setState] = useState<MfaState | null>(null);
  const [enroll, setEnroll] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<{ tone: 'ok' | 'bad'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const refresh = () => mfaState().then(setState, () => setState(null));
  useEffect(() => { void refresh(); }, []);
  const run = async (fn: () => Promise<void>, ok: string) => {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      setMsg({ tone: 'ok', text: ok });
    } catch (e) {
      setMsg({ tone: 'bad', text: (e as Error).message });
    }
    setBusy(false);
    await refresh();
  };
  return (
    <Card className="space-y-3">
      <h3 className="flex items-center gap-2 font-extrabold"><KeyRound size={18} className="text-brand" aria-hidden />Verifikasi 2 langkah akun admin</h3>
      {!state ? <p className="text-sm text-muted" role="status">Memeriksa...</p>
        : !state.supported ? <p className="text-sm text-muted">Tersedia di server dengan Supabase (bukan basis data pengembangan lokal).</p>
        : state.factors.length ? (
          <>
            <Notice tone="ok" title="Aktif">Dashboard admin hanya terbuka setelah memasukkan kode dari aplikasi authenticator ({state.factors.map((f) => f.name).join(', ')}).</Notice>
            <p className="text-xs text-muted">Bila HP authenticator hilang: hapus faktornya di dashboard Supabase (Authentication → Users → akun admin → MFA), lalu daftarkan ulang di sini.</p>
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => { if (window.confirm('Nonaktifkan verifikasi 2 langkah? Akun admin menjadi kurang aman.')) void run(() => mfaRemove(state.factors[0].id), 'Verifikasi 2 langkah dinonaktifkan.'); }}>Nonaktifkan</Button>
          </>
        ) : enroll ? (
          <div className="space-y-3">
            <ol className="list-decimal space-y-1 pl-5 text-sm">
              <li>Buka aplikasi authenticator (Google Authenticator, Microsoft Authenticator, Authy, atau 2FAS).</li>
              <li>Pindai kode QR ini, atau ketik kuncinya.</li>
              <li>Masukkan 6 angka yang muncul.</li>
            </ol>
            {/* The QR is an SVG data URL returned by Supabase Auth. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={enroll.qr} alt="Kode QR untuk aplikasi authenticator" className="h-44 w-44 rounded-xl bg-white p-2" />
            <p className="break-all font-mono text-sm">Kunci: <span className="select-all font-bold">{enroll.secret}</span></p>
            <form className="flex flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); void run(async () => { await mfaVerify(enroll.id, code); setEnroll(null); setCode(''); }, 'Verifikasi 2 langkah aktif.'); }}>
              <label className="block"><span className="mb-1 block text-sm font-bold">Kode 6 angka</span>
                <input className={cx(inputClass, 'w-40 font-mono text-lg tracking-widest')} inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} />
              </label>
              <Button type="submit" disabled={busy || code.length !== 6}>Aktifkan</Button>
              <Button type="button" variant="ghost" onClick={() => setEnroll(null)}>Batal</Button>
            </form>
          </div>
        ) : (
          <>
            <p className="text-sm">Tanpa verifikasi 2 langkah, siapa pun yang tahu kata sandi admin bisa mengonfirmasi pembayaran dan mengubah kurikulum. <strong>Sangat disarankan.</strong></p>
            <Button size="sm" disabled={busy} onClick={() => void run(async () => setEnroll(await mfaEnroll()), 'Pindai kode QR, lalu masukkan kodenya.')}><ShieldCheck size={16} aria-hidden />Aktifkan verifikasi 2 langkah</Button>
          </>
        )}
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
    </Card>
  );
}

export function HealthPanel({ active }: { active: boolean }) {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [all, setAll] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ tone: 'ok' | 'bad'; text: string } | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const load = async (showAll = all) => {
    setError(null);
    try {
      setData(await admin<Data>('health', { all: showAll }));
    } catch (e) {
      setError((e as Error).message);
    }
  };
  useEffect(() => { if (active && !data) void load(); }, [active]); // eslint-disable-line react-hooks/exhaustive-deps
  const act = async (key: string, fn: () => Promise<string>) => {
    setBusy(key);
    setMsg(null);
    try {
      setMsg({ tone: 'ok', text: await fn() });
      await load();
    } catch (e) {
      setMsg({ tone: 'bad', text: (e as Error).message });
    }
    setBusy(null);
  };
  const download = (name: string) => act(`dl-${name}`, async () => {
    const r = await admin<{ url?: string; download?: string }>('backup-link', { name });
    if (r.url) {
      window.location.href = r.url;
    } else if (r.download) {
      const res = await fetch(r.download, { headers: { Authorization: `Bearer ${await getToken()}` } });
      if (!res.ok) throw new Error('Cadangan gagal diunduh.');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(await res.blob());
      a.download = `lentera-${name.replace('daily/', '')}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
    }
    return 'Unduhan dimulai.';
  });

  if (error) return <Notice tone="bad" title="Data kesehatan gagal dimuat"><p>{error}</p><Button size="sm" className="mt-2" onClick={() => void load()}>Coba lagi</Button></Notice>;
  if (!data) return <p className="py-10 text-center font-bold text-muted" role="status">Memuat...</p>;
  const h = data.health;
  const storageBytes = h.storage.reduce((n, s) => n + Number(s.bytes), 0);
  const lastBackup = h.backups[0];
  const stale = !lastBackup || Date.now() - new Date(lastBackup.created_at).getTime() > 36 * 3600_000;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="mr-auto text-xl font-extrabold">Kesehatan aplikasi</h2>
        <Button size="sm" variant="ghost" onClick={() => void load()} aria-label="Muat ulang"><RefreshCw size={14} aria-hidden /></Button>
      </div>
      {msg && <div role="status"><Notice tone={msg.tone}>{msg.text}</Notice></div>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="p-4"><p className="text-sm font-bold text-muted">Error terbuka</p><p className={cx('text-2xl font-extrabold', h.errors_open > 0 && 'text-bad')}>{h.errors_open}</p></Card>
        <Card className="p-4"><p className="text-sm font-bold text-muted">Pesan baru</p><p className="text-2xl font-extrabold">{h.messages_open}</p></Card>
        <Card className="p-4"><p className="text-sm font-bold text-muted">Cadangan terakhir</p><p className={cx('text-lg font-extrabold', stale && 'text-bad')}>{lastBackup ? dateTimeId(lastBackup.created_at) : 'Belum ada'}</p></Card>
        <Card className="p-4"><p className="text-sm font-bold text-muted">Pelajar aktif 30 hari</p><p className="text-2xl font-extrabold">{h.active_30d}</p><p className="text-xs text-muted">dari {h.learners} akun pelajar</p></Card>
      </div>

      <Card className="space-y-3">
        <h3 className="font-extrabold">Pemakaian paket Supabase Free</h3>
        {[
          ['Basis data', h.db_bytes, FREE_PLAN.dbBytes, mb(h.db_bytes), '500 MB'],
          ['Penyimpanan berkas (rekaman, cadangan)', storageBytes, FREE_PLAN.storageBytes, mb(storageBytes), '1 GB'],
          ['Pengguna aktif bulanan (perkiraan)', h.active_30d, FREE_PLAN.mau, String(h.active_30d), '50.000'],
        ].map(([label, used, limit, usedText, limitText]) => (
          <div key={label as string}>
            <div className="flex justify-between text-sm"><span className="font-bold">{label as string}</span><span className="tabular-nums">{usedText as string} / {limitText as string}</span></div>
            <Progress value={Number(used)} max={Number(limit)} tone={Number(used) / Number(limit) > 0.8 ? 'accent' : 'brand'} className="mt-1 h-2" label={`${label}: ${usedText} dari ${limitText}`} />
          </div>
        ))}
        <p className="text-xs text-muted">Bila salah satu melewati 80%, atau Netlify sering menghabiskan kreditnya, saatnya naik paket. Rinciannya di <code>projects/lentera-english/SCALING.md</code>.</p>
      </Card>

      <MfaCard />

      <Card className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="mr-auto flex items-center gap-2 font-extrabold"><AlertTriangle size={18} className="text-bad" aria-hidden />Error dari pelajar dan server</h3>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={all} onChange={(e) => { setAll(e.target.checked); void load(e.target.checked); }} />Tampilkan yang sudah selesai</label>
        </div>
        {data.errors.length === 0 ? <p className="flex items-center gap-2 text-sm text-ok"><CheckCircle2 size={16} aria-hidden />Tidak ada error terbuka.</p> : (
          <ul className="divide-y divide-line">
            {data.errors.map((e) => (
              <li key={e.id} className="py-3">
                <div className="flex flex-wrap items-start gap-2">
                  <Badge tone={e.source === 'server' ? 'bad' : 'accent'}>{e.source === 'server' ? 'Server' : 'Aplikasi'}</Badge>
                  {e.status === 'resolved' && <Badge tone="ok">Selesai</Badge>}
                  <p className="min-w-0 flex-1 break-words font-bold">{e.message}</p>
                  <span className="shrink-0 text-sm font-bold tabular-nums">{e.count}×</span>
                </div>
                <p className="mt-1 text-xs text-muted">{e.path ?? '—'} · terakhir {dateTimeId(e.last_seen)} · pertama {dateTimeId(e.first_seen)}{e.users ? ` · ${e.users} akun` : ''}{e.release ? ` · versi ${e.release}` : ''}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {e.stack && <Button size="sm" variant="ghost" aria-expanded={open === e.id} onClick={() => setOpen(open === e.id ? null : e.id)}>{open === e.id ? 'Sembunyikan rincian' : 'Rincian'}</Button>}
                  {e.status === 'open' && <Button size="sm" variant="secondary" disabled={!!busy} onClick={() => void act(`e${e.id}`, async () => { await admin('resolve-error', { errorId: e.id }); return 'Ditandai selesai. Bila muncul lagi, Anda diberi tahu lagi.'; })}>Tandai selesai</Button>}
                </div>
                {open === e.id && <pre className="mt-2 max-h-60 overflow-auto rounded-xl bg-surface-2 p-3 text-xs">{e.stack}{e.user_agent ? `\n\n${e.user_agent}` : ''}</pre>}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="space-y-3">
        <h3 className="flex items-center gap-2 font-extrabold"><Mail size={18} className="text-brand" aria-hidden />Pesan dari formulir Hubungi Kami</h3>
        {data.messages.length === 0 ? <p className="text-sm text-muted">Belum ada pesan baru.</p> : (
          <ul className="divide-y divide-line">
            {data.messages.map((m) => (
              <li key={m.id} className="space-y-1 py-3">
                <div className="flex flex-wrap items-center gap-2"><Badge tone={m.topic === 'privasi' ? 'bad' : m.topic === 'sekolah' ? 'ok' : 'brand'}>{CONTACT_TOPICS[m.topic]}</Badge>{m.status === 'done' && <Badge tone="muted">Selesai</Badge>}<span className="font-bold">{m.name}</span>{m.contact && <span className="select-all text-sm text-muted">{m.contact}</span>}<span className="ml-auto text-xs text-muted">{dateTimeId(m.created_at)}</span></div>
                <p className="whitespace-pre-wrap text-sm">{m.message}</p>
                {m.status === 'open' && <Button size="sm" variant="secondary" disabled={!!busy} onClick={() => void act(`m${m.id}`, async () => { await admin('close-message', { messageId: m.id }); return 'Pesan ditandai selesai.'; })}>Tandai selesai</Button>}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="mr-auto flex items-center gap-2 font-extrabold"><DatabaseBackup size={18} className="text-brand" aria-hidden />Cadangan basis data</h3>
          <Button size="sm" disabled={!!busy} onClick={() => void act('backup', async () => { const r = await admin<{ name: string; bytes: number; rows: number }>('backup-now'); return `Cadangan dibuat: ${r.rows.toLocaleString('id-ID')} baris, ${mb(r.bytes)}.`; })}>{busy === 'backup' ? 'Mencadangkan...' : 'Buat cadangan sekarang'}</Button>
        </div>
        <p className="text-sm text-muted">Otomatis setiap malam pukul 02.00 WIB; 14 hari terakhir disimpan di penyimpanan pribadi (tidak bisa dibuka publik). Berisi semua data pelajar, pembayaran, dan kurikulum, tanpa kata sandi. Simpan salinan bulanan di tempat lain (misalnya Google Drive pribadi).</p>
        {stale && <Notice tone="accent">Belum ada cadangan dalam 36 jam terakhir. Buat sekarang, lalu periksa lagi besok.</Notice>}
        {data.files.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {data.files.map((f) => <li key={f}><Button size="sm" variant="secondary" disabled={!!busy} onClick={() => void download(f)}><Download size={14} aria-hidden />{f.replace('daily/', '').replace('.json.gz', '')}</Button></li>)}
          </ul>
        )}
        {h.backups.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted"><tr><th className="py-1">Waktu</th><th className="py-1 text-right">Baris</th><th className="py-1 text-right">Ukuran</th><th className="py-1 text-right">Oleh</th></tr></thead>
            <tbody>{h.backups.slice(0, 7).map((b) => <tr key={b.id} className="border-t border-line"><td className="py-1">{dateTimeId(b.created_at)}</td><td className="py-1 text-right tabular-nums">{Number(b.rows).toLocaleString('id-ID')}</td><td className="py-1 text-right tabular-nums">{mb(Number(b.bytes))}</td><td className="py-1 text-right">{b.trigger === 'schedule' ? 'Jadwal' : 'Admin'}</td></tr>)}</tbody>
          </table>
        )}
      </Card>

      <Card className="space-y-2">
        <h3 className="font-extrabold">Tugas terjadwal</h3>
        <ul className="space-y-1 text-sm">
          {h.jobs.length === 0 && <li className="text-muted">Belum ada yang berjalan.</li>}
          {h.jobs.map((j) => <li key={j.job} className="flex justify-between gap-2"><span>{JOB_NAMES[j.job] ?? j.job}</span><span className="text-muted">{dateTimeId(j.last_run_at)}</span></li>)}
        </ul>
        <details className="text-sm">
          <summary className="cursor-pointer font-bold">Tabel terbesar</summary>
          <table className="mt-2 w-full text-left"><tbody>{h.tables.map((t) => <tr key={t.name} className="border-t border-line"><td className="py-1 font-mono text-xs">{t.name}</td><td className="py-1 text-right tabular-nums">{Number(t.rows).toLocaleString('id-ID')} baris</td><td className="py-1 text-right tabular-nums">{mb(Number(t.bytes))}</td></tr>)}</tbody></table>
        </details>
      </Card>
    </div>
  );
}
