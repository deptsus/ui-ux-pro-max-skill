'use client';
// Curriculum editor. Lists and forms are generated from schema.ts; every write
// goes through POST /api/admin (upsert / delete), which re-checks the admin
// role and lets the database constraints validate the row.
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronRight, Plus, Search, Trash2 } from 'lucide-react';
import { Badge, Button, Card, Empty, Notice, cx } from '@/components/ui';
import { admin, unpublished } from './api';
import { Confirm } from './Confirm';
import { FieldControl, input } from './fields';
import { TABLE, TABLES, pkOf, readField, refLabel, toPayload, validateRow, type Data, type Field, type Row, type TableDef, type TableId } from './schema';

export interface CmsTarget { table: TableId; id?: string; filters?: Record<string, string>; n: number }

const PAGE = 40;
const NONE = '__none__';
const SHORT = ['text', 'number', 'select', 'ref', 'date', 'bool'];
const GROUPS = ['Struktur kurikulum', 'Latihan dan penilaian', 'Pustaka'] as const;

function RowEditor({ def, initial, isNew, data, reload, onClose, onJump }: { def: TableDef; initial: Row; isNew: boolean; data: Data; reload: () => Promise<void>; onClose: () => void; onJump: (t: Omit<CmsTarget, 'n'>) => void }) {
  const [row, setRow] = useState<Row>(initial);
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  const [created, setCreated] = useState(!isNew);
  const [badJson, setBadJson] = useState<string[]>([]);
  const [problems, setProblems] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ask, setAsk] = useState<'delete' | 'leave' | null>(null);
  const dirty = JSON.stringify(row) !== saved;
  const id = row[def.pk];

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const setField = (f: Field, v: unknown) => {
    setStatus(null);
    setRow((r) => (f.payload ? { ...r, payload: { ...(r.payload ?? {}), [f.key]: v } } : { ...r, [f.key]: v }));
  };
  const save = async () => {
    setError(null);
    setStatus(null);
    const found = validateRow(def, row, data, !created);
    if (badJson.length) found.push('Perbaiki JSON yang belum valid sebelum menyimpan.');
    setProblems(found);
    if (found.length) return;
    setBusy(true);
    try {
      await admin('upsert', { table: def.id, row: toPayload(def, row) });
      unpublished.set(true);
      await reload();
      setSaved(JSON.stringify(row));
      setCreated(true);
      setStatus('Tersimpan. Pelajar baru melihat perubahan ini setelah kurikulum diterbitkan.');
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(false);
  };
  const remove = async () => {
    setBusy(true);
    try {
      await admin('delete', { table: def.id, id });
      unpublished.set(true);
      await reload();
      onClose();
    } catch (e) {
      setError((e as Error).message);
      setAsk(null);
      setBusy(false);
    }
  };
  const cascade = created && def.cascade ? def.cascade(row, data) : [];
  const visible = def.fields.filter((f) => !f.when || f.when(row));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => (dirty ? setAsk('leave') : onClose())}><ArrowLeft size={16} aria-hidden />Kembali ke daftar {def.label.toLowerCase()}</Button>
        {dirty && <Badge tone="accent">Belum disimpan</Badge>}
      </div>
      <Card className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <h2 className="text-xl font-extrabold">{created ? `Edit ${def.singular}` : `${def.singular.charAt(0).toUpperCase()}${def.singular.slice(1)} baru`}</h2>
          {created && <p className="mt-1 break-all font-mono text-sm text-muted">{def.pk === 'key' ? 'Kunci' : def.pk === 'code' ? 'Kode' : 'ID'}: {String(id)}</p>}
        </div>
        {!created && (
          <div className="sm:col-span-2">
            <label htmlFor="cms-new-id" className="mb-1 block text-sm font-bold">{def.pk === 'key' ? 'Kunci' : 'ID'}<span className="text-bad" aria-hidden> *</span></label>
            <input id="cms-new-id" value={id ?? ''} onChange={(e) => setRow((r) => ({ ...r, [def.pk]: e.target.value.trim() }))} autoCapitalize="none" spellCheck={false} className={cx(input, 'font-mono')} />
            <p className="mt-1 text-xs text-muted">{def.idHint} Tidak bisa diubah setelah disimpan.</p>
          </div>
        )}
        {visible.map((f) => (
          // Short controls sit two to a row on wide screens; long text and structured editors take the full width.
          <div key={`${f.payload ? 'p.' : ''}${f.key}`} className={cx('min-w-0', !SHORT.includes(f.kind) && 'sm:col-span-2')}>
            <FieldControl field={f} value={readField(row, f)} onChange={(v) => setField(f, v)} data={data}
              onValidity={(ok) => setBadJson((b) => (ok ? b.filter((k) => k !== f.key) : b.includes(f.key) ? b : [...b, f.key]))} />
          </div>
        ))}
      </Card>

      {created && def.related && (
        <Card>
          <h3 className="font-extrabold">Terkait</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {def.related.map((rel) => {
              const n = (data[rel.table] ?? []).filter((r) => r[rel.filterKey] === id).length;
              return <Button key={rel.table} size="sm" variant="secondary" disabled={dirty} title={dirty ? 'Simpan dulu perubahanmu.' : undefined} onClick={() => onJump({ table: rel.table, filters: { [rel.filterKey]: String(id) } })}>{rel.label} ({n})<ChevronRight size={16} aria-hidden /></Button>;
            })}
          </div>
        </Card>
      )}

      <div className="sticky bottom-0 z-10 -mx-1 space-y-2 rounded-2xl border border-line bg-surface p-3 shadow-card">
        {problems.length > 0 && (
          <div className="rounded-xl bg-bad-soft px-3 py-2 text-sm" role="alert">
            <p className="font-bold text-bad">Belum bisa disimpan:</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5">{problems.map((p) => <li key={p}>{p}</li>)}</ul>
          </div>
        )}
        {error && <p className="rounded-xl bg-bad-soft px-3 py-2 text-sm font-bold text-bad" role="alert">{error}</p>}
        {status && <p className="rounded-xl bg-ok-soft px-3 py-2 text-sm font-bold text-ok" role="status">{status}</p>}
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={save} disabled={busy || (!dirty && created)}>{busy ? 'Menyimpan...' : 'Simpan'}</Button>
          {created && !def.fixed && <Button variant="ghost" className="ml-auto text-bad" onClick={() => setAsk('delete')} disabled={busy}><Trash2 size={16} aria-hidden />Hapus</Button>}
        </div>
      </div>

      <Confirm open={ask === 'leave'} title="Buang perubahan?" confirmLabel="Buang perubahan" onCancel={() => setAsk(null)} onConfirm={onClose}>
        <p>Perubahan pada {def.singular} ini belum disimpan dan akan hilang.</p>
      </Confirm>
      <Confirm open={ask === 'delete'} title={`Hapus ${def.singular} ini?`} confirmLabel="Hapus permanen" busy={busy} onCancel={() => setAsk(null)} onConfirm={remove}>
        <p className="font-bold text-ink">{def.title(row)}</p>
        {cascade.length > 0 && <p>Ikut terhapus atau terlepas: {cascade.join(', ')}.</p>}
        <p>Penghapusan tidak bisa dibatalkan dari dashboard ini. Versi kurikulum yang sudah terbit tidak berubah sampai kamu menerbitkan lagi.</p>
        {def.id === 'questions' && <p>Riwayat jawaban pelajar merujuk ID soal. Untuk soal yang sudah pernah terbit, lebih aman mengubah statusnya menjadi Draf.</p>}
      </Confirm>
    </div>
  );
}

export function CmsPanel({ data, reload, target, onPublish }: { data: Data; reload: () => Promise<void>; target: CmsTarget | null; onPublish: () => void }) {
  const [table, setTable] = useState<TableId>('lessons');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<{ row: Row; isNew: boolean; key: number } | null>(null);
  const [pending, setPending] = useState(unpublished.get);
  useEffect(() => unpublished.subscribe(() => setPending(unpublished.get())), []);

  const def = TABLE[table];
  const go = (t: Omit<CmsTarget, 'n'>) => {
    setTable(t.table);
    setFilters(t.filters ?? {});
    setQuery('');
    setPage(0);
    const hit = t.id ? (data[t.table] ?? []).find((r) => r[TABLE[t.table].pk] === t.id) : null;
    setEditing(hit ? { row: structuredClone(hit), isNew: false, key: Date.now() } : null);
  };
  // Opened from elsewhere (e.g. a quality-gate problem on the publish tab).
  const [seen, setSeen] = useState(0);
  if (target && target.n !== seen) {
    setSeen(target.n);
    go(target);
  }

  const filterFields = def.fields.filter((f) => f.filter);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = [...(data[table] ?? [])];
    for (const [key, want] of Object.entries(filters)) {
      if (!want) continue;
      list = list.filter((r) => (want === NONE ? r[key] === null || r[key] === undefined : String(r[key]) === want));
    }
    if (q) list = list.filter((r) => `${r[def.pk]} ${def.title(r)} ${def.subtitle?.(r, data) ?? ''}`.toLowerCase().includes(q));
    if (def.sort) list.sort(def.sort);
    return list;
  }, [data, table, filters, query, def]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const shown = rows.slice(Math.min(page, pages - 1) * PAGE, Math.min(page, pages - 1) * PAGE + PAGE);

  const create = () => {
    // A new row starts inside whatever the list is filtered to.
    const preset = Object.fromEntries(Object.entries(filters).filter(([, v]) => v && v !== NONE));
    setEditing({ row: { ...def.blank(), ...preset }, isNew: true, key: Date.now() });
  };

  if (editing) {
    return <RowEditor key={editing.key} def={def} initial={editing.row} isNew={editing.isNew} data={data} reload={reload} onClose={() => setEditing(null)} onJump={go} />;
  }

  return (
    <div className="space-y-4">
      {pending && (
        <Notice tone="accent" title="Ada perubahan yang belum diterbitkan">
          <p>Kamu menyimpan perubahan dari browser ini sejak terakhir menerbitkan. Pelajar masih menerima versi yang terbit sampai kamu menerbitkan versi baru.</p>
          <Button size="sm" className="mt-2" onClick={onPublish}>Buka Terbitkan</Button>
        </Notice>
      )}
      <div className="grid gap-4 lg:grid-cols-[15rem_1fr]">
        <div>
          <label className="lg:hidden">
            <span className="mb-1 block text-sm font-bold">Jenis konten</span>
            <select value={table} onChange={(e) => go({ table: e.target.value as TableId })} className={input}>
              {GROUPS.map((g) => <optgroup key={g} label={g}>{TABLES.filter((t) => t.group === g).map((t) => <option key={t.id} value={t.id}>{t.label} ({(data[t.id] ?? []).length})</option>)}</optgroup>)}
            </select>
          </label>
          <nav aria-label="Jenis konten" className="hidden space-y-3 lg:block">
            {GROUPS.map((g) => (
              <div key={g}>
                <p className="px-3 text-xs font-bold uppercase tracking-wide text-muted">{g}</p>
                <ul className="mt-1 space-y-0.5">
                  {TABLES.filter((t) => t.group === g).map((t) => (
                    <li key={t.id}>
                      <button type="button" onClick={() => go({ table: t.id })} aria-current={t.id === table ? 'page' : undefined} className={cx('flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold transition', t.id === table ? 'bg-brand-soft text-brand' : 'text-muted hover:bg-surface-2 hover:text-ink')}>
                        {t.label}<span className="text-xs tabular-nums">{(data[t.id] ?? []).length}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-end gap-2">
            <label className="min-w-48 flex-1">
              <span className="mb-1 block text-xs font-bold text-muted">Cari {def.label.toLowerCase()}</span>
              <span className="relative block">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
                <input type="search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} className={cx(input, 'pl-9')} placeholder="Judul atau ID" />
              </span>
            </label>
            {filterFields.map((f) => {
              const pk = f.ref ? pkOf(f.ref) : '';
              return (
                <label key={f.key} className="min-w-36 max-w-56 flex-1">
                  <span className="mb-1 block text-xs font-bold text-muted">{f.label}</span>
                  <select value={filters[f.key] ?? ''} onChange={(e) => { setFilters({ ...filters, [f.key]: e.target.value }); setPage(0); }} className={input}>
                    <option value="">Semua</option>
                    {f.nullable && <option value={NONE}>(tidak ada)</option>}
                    {f.ref ? (data[f.ref] ?? []).map((r) => <option key={r[pk]} value={r[pk]}>{refLabel(f.ref!, r).slice(0, 80)}</option>) : f.choices!.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </label>
              );
            })}
            {!def.fixed && <Button onClick={create}><Plus size={18} aria-hidden />Tambah {def.singular}</Button>}
          </div>

          <p className="text-sm text-muted" role="status">{rows.length} {def.label.toLowerCase()}{rows.length !== (data[table] ?? []).length ? ` dari ${(data[table] ?? []).length}` : ''}</p>

          {rows.length === 0 ? (
            <Empty title={(data[table] ?? []).length === 0 ? `Belum ada ${def.label.toLowerCase()}` : 'Tidak ada yang cocok'}>
              {(data[table] ?? []).length === 0 ? (def.id === 'audio_resources' ? 'Belum ada rekaman terdaftar. Selama kosong, audio dibacakan oleh suara bawaan perangkat pelajar.' : 'Tambahkan yang pertama dengan tombol di atas.') : 'Ubah kata kunci atau filter.'}
            </Empty>
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
              {shown.map((r) => (
                <li key={r[def.pk]}>
                  <button type="button" onClick={() => setEditing({ row: structuredClone(r), isNew: false, key: Date.now() })} className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-surface-2">
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 font-bold">{def.title(r) || '(tanpa judul)'}</span>
                      {def.subtitle && <span className="mt-0.5 block truncate text-sm text-muted">{def.subtitle(r, data)}</span>}
                    </span>
                    <span className="flex shrink-0 flex-wrap justify-end gap-1">{def.badges?.(r).map(([label, tone]) => <Badge key={label} tone={tone}>{label}</Badge>)}</span>
                    <ChevronRight size={18} className="shrink-0 text-muted" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {pages > 1 && (
            <div className="flex items-center justify-between gap-2">
              <Button size="sm" variant="secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>Sebelumnya</Button>
              <span className="text-sm text-muted">Halaman {Math.min(page, pages - 1) + 1} dari {pages}</span>
              <Button size="sm" variant="secondary" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Berikutnya</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
