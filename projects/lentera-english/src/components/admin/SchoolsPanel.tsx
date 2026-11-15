'use client';
// Schools (Rilis 10): the owner creates a license per school after agreeing
// on a price (outside the app), hands its code to the teachers, and can
// extend, change or stop it. Students in its classes get Premium while it runs.
import { useEffect, useState } from 'react';
import { Copy, Plus, School } from 'lucide-react';
import { Badge, Button, Card, Notice, cx, dateId, inputClass } from '@/components/ui';
import { admin } from './api';

interface License {
  id: number; code: string; school: string; contact: string | null; max_teachers: number; max_classes: number; seats_per_class: number;
  starts_on: string; ends_on: string; note: string | null; revoked: boolean; active: boolean; teachers: number; classes: number; students: number; teacher_names: string[];
}
/** Dates in WIB, the way license_active() compares them. */
const today = () => new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
const plusMonths = (n: number) => { const d = new Date(Date.now() + 7 * 3600_000); d.setUTCMonth(d.getUTCMonth() + n); return d.toISOString().slice(0, 10); };

export function SchoolsPanel({ active }: { active: boolean }) {
  const [list, setList] = useState<License[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ tone: 'ok' | 'bad'; text: string } | null>(null);
  const [form, setForm] = useState({ school: '', contact: '', max_teachers: 3, max_classes: 3, seats: 40, starts: today(), ends: plusMonths(6), note: '' });
  const [busy, setBusy] = useState(false);
  const [extend, setExtend] = useState<Record<number, string>>({});
  const load = () => admin<License[]>('licenses').then(setList, (e: Error) => setError(e.message));
  useEffect(() => { if (active && !list) void load(); }, [active]); // eslint-disable-line react-hooks/exhaustive-deps
  const run = async (fn: () => Promise<string>) => {
    setBusy(true);
    setMsg(null);
    try {
      setMsg({ tone: 'ok', text: await fn() });
      await load();
    } catch (e) {
      setMsg({ tone: 'bad', text: (e as Error).message });
    }
    setBusy(false);
  };
  const num = (k: 'max_teachers' | 'max_classes' | 'seats') => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: Math.max(1, Number(e.target.value) || 1) }));

  if (error) return <Notice tone="bad" title="Lisensi sekolah gagal dimuat"><p>{error}</p><Button size="sm" className="mt-2" onClick={() => void load()}>Coba lagi</Button></Notice>;
  return (
    <div className="space-y-5">
      <h2 className="flex items-center gap-2 text-xl font-extrabold"><School aria-hidden />Lisensi sekolah</h2>
      {msg && <div role="status"><Notice tone={msg.tone}>{msg.text}</Notice></div>}
      <Card className="space-y-3">
        <h3 className="font-extrabold">Buat lisensi baru</h3>
        <p className="text-sm text-muted">Sepakati harga dengan sekolah lebih dulu (pesan bertopik &ldquo;Sekolah dan guru&rdquo; masuk ke tab Kesehatan). Kode lisensi diberikan ke guru; siswa di kelas mereka mendapat Premium sampai tanggal berakhir.</p>
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => {
          e.preventDefault();
          void run(async () => {
            const l = await admin<License>('create-license', { license: form });
            setForm((f) => ({ ...f, school: '', contact: '', note: '' }));
            return `Lisensi dibuat untuk ${l.school}. Kode untuk guru: ${l.code}`;
          });
        }}>
          <label className="block"><span className="mb-1 block text-sm font-bold">Nama sekolah/kursus</span><input className={inputClass} required minLength={2} maxLength={120} value={form.school} onChange={(e) => setForm((f) => ({ ...f, school: e.target.value }))} /></label>
          <label className="block"><span className="mb-1 block text-sm font-bold">Kontak <span className="font-normal text-muted">(opsional)</span></span><input className={inputClass} maxLength={120} value={form.contact} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} /></label>
          <div className="grid grid-cols-3 gap-2 sm:col-span-2">
            <label className="block"><span className="mb-1 block text-sm font-bold">Guru</span><input type="number" min={1} max={200} className={inputClass} value={form.max_teachers} onChange={num('max_teachers')} /></label>
            <label className="block"><span className="mb-1 block text-sm font-bold">Kelas</span><input type="number" min={1} max={500} className={inputClass} value={form.max_classes} onChange={num('max_classes')} /></label>
            <label className="block"><span className="mb-1 block text-sm font-bold">Siswa per kelas</span><input type="number" min={1} max={500} className={inputClass} value={form.seats} onChange={num('seats')} /></label>
          </div>
          <label className="block"><span className="mb-1 block text-sm font-bold">Mulai</span><input type="date" className={inputClass} required value={form.starts} onChange={(e) => setForm((f) => ({ ...f, starts: e.target.value }))} /></label>
          <label className="block"><span className="mb-1 block text-sm font-bold">Berakhir</span><input type="date" className={inputClass} required min={form.starts} value={form.ends} onChange={(e) => setForm((f) => ({ ...f, ends: e.target.value }))} /></label>
          <label className="block sm:col-span-2"><span className="mb-1 block text-sm font-bold">Catatan (harga, bukti bayar) <span className="font-normal text-muted">(hanya terlihat admin)</span></span><input className={inputClass} maxLength={500} value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} /></label>
          <Button type="submit" disabled={busy || form.school.trim().length < 2} className="sm:col-span-2 sm:justify-self-start"><Plus size={16} aria-hidden />Buat lisensi</Button>
        </form>
      </Card>

      {!list ? <p className="text-muted" role="status">Memuat...</p> : list.length === 0 ? <Card className="text-center text-muted">Belum ada lisensi.</Card> : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {list.map((l) => (
            <Card as="li" key={l.id} className={cx('space-y-2', !l.active && 'opacity-80')}>
              <div className="flex flex-wrap items-start gap-2">
                <div className="min-w-0 flex-1"><p className="text-lg font-extrabold">{l.school}</p><p className="text-sm text-muted">{l.contact ?? 'tanpa kontak'}</p></div>
                {l.revoked ? <Badge tone="bad">Dihentikan</Badge> : l.active ? <Badge tone="ok">Aktif</Badge> : <Badge tone="muted">Tidak aktif</Badge>}
              </div>
              <p className="flex flex-wrap items-center gap-2"><span className="text-sm font-bold">Kode guru:</span><span className="select-all font-mono text-lg font-extrabold tracking-widest text-brand">{l.code}</span>
                <Button size="sm" variant="ghost" aria-label={`Salin kode ${l.code}`} onClick={() => { void navigator.clipboard?.writeText(l.code).catch(() => {}); setMsg({ tone: 'ok', text: `Kode ${l.code} disalin.` }); }}><Copy size={14} aria-hidden /></Button></p>
              <p className="text-sm">{dateId(l.starts_on)} – {dateId(l.ends_on)} · guru {l.teachers}/{l.max_teachers} · kelas {l.classes}/{l.max_classes} · {l.students} siswa (maks {l.seats_per_class}/kelas)</p>
              {l.teacher_names.length > 0 && <p className="text-xs text-muted">Guru: {l.teacher_names.join(', ')}</p>}
              {l.note && <p className="text-xs text-muted">Catatan: {l.note}</p>}
              <div className="flex flex-wrap items-end gap-2 border-t border-line pt-2">
                <label className="block"><span className="mb-1 block text-xs font-bold">Perpanjang sampai</span><input type="date" className={cx(inputClass, 'py-2')} value={extend[l.id] ?? l.ends_on} onChange={(e) => setExtend((x) => ({ ...x, [l.id]: e.target.value }))} /></label>
                <Button size="sm" variant="secondary" disabled={busy || !extend[l.id] || extend[l.id] === l.ends_on} onClick={() => void run(async () => { await admin('update-license', { id: l.id, patch: { ends_on: extend[l.id] } }); return `Lisensi ${l.school} berlaku sampai ${dateId(extend[l.id])}.`; })}>Simpan</Button>
                <Button size="sm" variant={l.revoked ? 'secondary' : 'ghost'} disabled={busy} onClick={() => { if (l.revoked || window.confirm(`Hentikan lisensi ${l.school}? Siswanya kehilangan Premium dan tidak bisa bergabung ke kelas.`)) void run(async () => { await admin('update-license', { id: l.id, patch: { revoked: !l.revoked } }); return l.revoked ? 'Lisensi diaktifkan lagi.' : 'Lisensi dihentikan.'; }); }}>{l.revoked ? 'Aktifkan lagi' : 'Hentikan'}</Button>
              </div>
            </Card>
          ))}
        </ul>
      )}
    </div>
  );
}
