'use client';
// Review notes ("Catatan Pemeriksaan"): while reviewing content the owner marks
// what needs work; the open notes are worked through together in the next
// release. Stored in content_notes (migration 0008) via POST /api/admin.
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { Check, ChevronRight, MessageSquareWarning } from 'lucide-react';
import { ApiError } from '@/lib/client/api';
import { dateTimeId } from '@/lib/format';
import { Badge, Button, Card, Empty, Notice } from '@/components/ui';
import { admin } from './api';
import { input } from './fields';
import { TABLE, type Data, type TableId } from './schema';

export interface ContentNote {
  id: number;
  table: TableId;
  target: string;
  note: string;
  status: 'open' | 'resolved';
  created_at: string;
  resolved_at: string | null;
  resolution: string | null;
  author: string | null;
}

// One shared list for the tab and every open form.
let notes: ContentNote[] = [];
let problem: string | null = null;
let loaded = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => (listeners.add(l), () => void listeners.delete(l));

export async function loadNotes(): Promise<void> {
  try {
    notes = await admin<ContentNote[]>('notes', { all: true });
    problem = null;
  } catch (e) {
    problem = e instanceof ApiError ? e.message : 'Catatan gagal dimuat.';
  }
  loaded = true;
  emit();
}

export function useNotes() {
  const list = useSyncExternalStore(subscribe, () => notes, () => notes);
  const err = useSyncExternalStore(subscribe, () => problem, () => problem);
  const ready = useSyncExternalStore(subscribe, () => loaded, () => false);
  useEffect(() => { if (!loaded) void loadNotes(); }, []);
  return { notes: list, error: err, ready };
}

export const openNoteCount = (list: ContentNote[]) => list.filter((n) => n.status === 'open').length;

/** Inside a CMS form: the notes on this row and a box to add one. */
export function RowNotes({ table, target }: { table: TableId; target: string }) {
  const { notes: all, error } = useNotes();
  const mine = all.filter((n) => n.table === table && n.target === target && n.status === 'open');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const add = async () => {
    setBusy(true);
    setMsg(null);
    try {
      await admin('add-note', { table, target, note: text });
      setText('');
      setMsg({ ok: true, text: 'Catatan tersimpan. Akan dikerjakan di rilis berikutnya.' });
      await loadNotes();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof ApiError ? e.message : 'Catatan gagal disimpan.' });
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card className="space-y-3" aria-labelledby={`notes-${table}-${target}`}>
      <h3 id={`notes-${table}-${target}`} className="flex items-center gap-2 font-extrabold"><MessageSquareWarning size={18} className="text-accent-strong" aria-hidden />Catatan pemeriksaan</h3>
      {error && !msg && <p className="text-sm text-bad">{error}</p>}
      {mine.length > 0 && (
        <ul className="space-y-2">
          {mine.map((n) => <li key={n.id} className="rounded-xl bg-accent-soft px-3 py-2 text-sm"><p className="whitespace-pre-wrap">{n.note}</p><p className="mt-1 text-xs text-muted">{dateTimeId(n.created_at)}</p></li>)}
        </ul>
      )}
      <label className="block">
        <span className="text-sm font-bold">Tandai yang perlu diperbaiki</span>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} maxLength={2000} className={`${input} mt-1`} placeholder="Contoh: pilihan B juga benar; penjelasannya kurang jelas." />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="secondary" disabled={busy || !text.trim()} onClick={add}>{busy ? 'Menyimpan...' : 'Simpan catatan'}</Button>
        {msg && <p role={msg.ok ? 'status' : 'alert'} className={msg.ok ? 'text-sm font-bold text-ok' : 'text-sm font-bold text-bad'}>{msg.text}</p>}
      </div>
      <p className="text-xs text-muted">Catatan tidak mengubah konten. Perbaikan kecil bisa langsung kamu lakukan di formulir ini; catatan untuk hal yang perlu dikerjakan di rilis berikutnya.</p>
    </Card>
  );
}

/** The "Catatan" tab: every note, open first, with a link to its row. */
export function NotesPanel({ data, onOpen }: { data: Data | null; onOpen: (t: { table: TableId; id: string }) => void }) {
  const { notes: all, error, ready } = useNotes();
  const [showDone, setShowDone] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const resolve = useCallback(async (id: number) => {
    setBusy(id);
    try {
      await admin('resolve-note', { noteId: id, resolution: '' });
      await loadNotes();
    } finally {
      setBusy(null);
    }
  }, []);
  const open = all.filter((n) => n.status === 'open');
  const done = all.filter((n) => n.status === 'resolved');
  const title = (n: ContentNote) => {
    const def = TABLE[n.table];
    const row = data?.[n.table]?.find((r) => String(r[def?.pk ?? 'id']) === n.target);
    return row && def ? def.title(row) : n.target;
  };
  if (error) return <Notice tone="bad" title="Catatan belum bisa dipakai"><p>{error}</p><Button size="sm" className="mt-2" onClick={() => void loadNotes()}>Coba lagi</Button></Notice>;
  if (!ready) return <p className="py-10 text-center font-bold text-muted" role="status">Memuat catatan...</p>;
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="flex items-center gap-2 text-lg font-extrabold"><MessageSquareWarning size={20} className="text-accent-strong" aria-hidden />Catatan pemeriksaan</h2>
        <p className="mt-1 text-sm text-muted">Tandai soal, pelajaran, atau cerita yang perlu diperbaiki dari formulirnya di tab Konten. Semua catatan terbuka dikerjakan sekaligus di rilis berikutnya, lalu ditandai selesai.</p>
      </Card>
      {open.length === 0 ? (
        <Empty title="Tidak ada catatan terbuka">Semua catatan sudah dikerjakan, atau belum ada yang ditandai.</Empty>
      ) : (
        <ul className="space-y-3" aria-label="Catatan terbuka">
          {open.map((n) => (
            <li key={n.id}>
              <Card className="space-y-2">
                <div className="flex flex-wrap items-center gap-2"><Badge tone="accent">{TABLE[n.table]?.singular ?? n.table}</Badge><span className="font-extrabold">{title(n)}</span></div>
                <p className="whitespace-pre-wrap">{n.note}</p>
                <p className="text-xs text-muted">{dateTimeId(n.created_at)}{n.author ? ` · ${n.author}` : ''}</p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => onOpen({ table: n.table, id: n.target })}>Buka<ChevronRight size={16} aria-hidden /></Button>
                  <Button size="sm" variant="ghost" disabled={busy === n.id} onClick={() => void resolve(n.id)}><Check size={16} aria-hidden />Tandai selesai</Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
      {done.length > 0 && (
        <div>
          <Button size="sm" variant="ghost" aria-expanded={showDone} onClick={() => setShowDone((v) => !v)}>{showDone ? 'Sembunyikan' : 'Tampilkan'} {done.length} catatan selesai</Button>
          {showDone && (
            <ul className="mt-2 space-y-2">
              {done.map((n) => <li key={n.id} className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm"><p className="font-bold">{title(n)}</p><p className="text-muted">{n.note}</p>{n.resolution && <p className="mt-1 text-ok">{n.resolution}</p>}<p className="mt-1 text-xs text-muted">Selesai {n.resolved_at ? dateTimeId(n.resolved_at) : ''}</p></li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
