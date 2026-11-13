'use client';
// Form controls for the CMS editor. One generic control per field kind, plus
// structured editors for answer options, lesson material, and writing tasks.
import { useId, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Button, cx } from '@/components/ui';
import { pkOf, refLabel, type Data, type Field, type Row } from './schema';

export const input = 'w-full rounded-xl border-2 border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none disabled:bg-surface-2 disabled:text-muted';
const small = 'text-xs font-bold text-muted';

function Labeled({ label, hint, required, htmlFor, children }: { label: string; hint?: string; required?: boolean; htmlFor?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-bold">{label}{required && <span className="text-bad" aria-hidden> *</span>}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function IconButton({ label, onClick, disabled, children, tone = 'muted' }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode; tone?: 'muted' | 'bad' }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled} className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line bg-surface transition hover:bg-surface-2 disabled:opacity-40', tone === 'bad' ? 'text-bad' : 'text-muted')}>
      {children}
    </button>
  );
}

let seq = 0;
/** Add / remove / reorder wrapper shared by every repeating editor. */
function Repeater<T>({ items, onChange, make, addLabel, itemLabel, render, min = 0 }: { items: T[]; onChange: (next: T[]) => void; make: () => T; addLabel: string; itemLabel: string; render: (item: T, set: (next: T) => void, index: number) => ReactNode; min?: number }) {
  // Stable keys travel with their item, so editors that keep local text
  // (lists, tables) stay attached to the right row after a move or delete.
  const [keys, setKeys] = useState<number[]>(() => items.map(() => seq++));
  if (keys.length !== items.length) setKeys(items.map(() => seq++));
  const move = (i: number, by: number) => {
    const next = [...items];
    const k = [...keys];
    [next[i], next[i + by]] = [next[i + by], next[i]];
    [k[i], k[i + by]] = [k[i + by], k[i]];
    setKeys(k);
    onChange(next);
  };
  const remove = (i: number) => {
    setKeys(keys.filter((_, j) => j !== i));
    onChange(items.filter((_, j) => j !== i));
  };
  const add = () => {
    setKeys([...keys, seq++]);
    onChange([...items, make()]);
  };
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={keys[i] ?? `i${i}`} className="flex items-start gap-2 rounded-2xl border border-line bg-bg p-3">
          <div className="min-w-0 flex-1">{render(item, (next) => onChange(items.map((x, j) => (j === i ? next : x))), i)}</div>
          <div className="flex flex-col gap-1">
            <IconButton label={`Naikkan ${itemLabel} ${i + 1}`} onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp size={16} aria-hidden /></IconButton>
            <IconButton label={`Turunkan ${itemLabel} ${i + 1}`} onClick={() => move(i, 1)} disabled={i === items.length - 1}><ArrowDown size={16} aria-hidden /></IconButton>
            <IconButton label={`Hapus ${itemLabel} ${i + 1}`} tone="bad" onClick={() => remove(i)} disabled={items.length <= min}><Trash2 size={16} aria-hidden /></IconButton>
          </div>
        </div>
      ))}
      <Button type="button" size="sm" variant="secondary" onClick={add}><Plus size={16} aria-hidden />{addLabel}</Button>
    </div>
  );
}

const toLines = (v: unknown) => (Array.isArray(v) ? v.join('\n') : '');
const fromLines = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean);

function LinesInput({ id, value, onChange, rows = 4, en }: { id: string; value: unknown; onChange: (v: string[]) => void; rows?: number; en?: boolean }) {
  // Keep the raw text while typing so a trailing newline is not eaten.
  const [text, setText] = useState(() => toLines(value));
  const [seen, setSeen] = useState(value);
  if (value !== seen) {
    setSeen(value);
    if (JSON.stringify(fromLines(text)) !== JSON.stringify(value ?? [])) setText(toLines(value));
  }
  return <textarea id={id} rows={rows} value={text} lang={en ? 'en' : undefined} spellCheck={!en ? undefined : true} onChange={(e) => { setText(e.target.value); onChange(fromLines(e.target.value)); }} className={cx(input, 'font-mono')} />;
}

function JsonInput({ id, value, onChange, onValidity, rows = 8 }: { id: string; value: unknown; onChange: (v: unknown) => void; onValidity: (ok: boolean) => void; rows?: number }) {
  const [text, setText] = useState(() => JSON.stringify(value ?? null, null, 2));
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <textarea id={id} rows={rows} value={text} spellCheck={false} aria-invalid={!!error} className={cx(input, 'font-mono text-xs', error && 'border-bad')}
        onChange={(e) => {
          setText(e.target.value);
          try {
            onChange(JSON.parse(e.target.value));
            setError(null);
            onValidity(true);
          } catch (err) {
            setError((err as Error).message);
            onValidity(false);
          }
        }} />
      {error && <p className="mt-1 text-xs font-bold text-bad" role="alert">JSON belum valid: {error}</p>}
    </>
  );
}

function RefSelect({ id, table, value, onChange, data, allowEmpty }: { id: string; table: string; value: unknown; onChange: (v: string | null) => void; data: Data; allowEmpty: boolean }) {
  const pk = pkOf(table);
  const rows = data[table] ?? [];
  const known = rows.some((r) => r[pk] === value);
  return (
    <select id={id} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value || null)} className={input}>
      {(allowEmpty || !value) && <option value="">{allowEmpty ? '(tidak ada)' : 'Pilih...'}</option>}
      {!!value && !known && <option value={String(value)}>{String(value)} (tidak ditemukan)</option>}
      {rows.map((r) => <option key={r[pk]} value={r[pk]}>{refLabel(table, r).slice(0, 110)}</option>)}
    </select>
  );
}

// ───────────── Answer options (multiple-choice style questions) ─────────────
function OptionsEditor({ value, onChange, data }: { value: Row[]; onChange: (v: Row[]) => void; data: Data }) {
  const name = useId();
  return (
    <Repeater items={value} onChange={onChange} make={() => ({ text: '', why: '' })} addLabel="Tambah pilihan" itemLabel="pilihan" render={(o, set, i) => (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="radio" name={name} checked={!!o.correct} onChange={() => onChange(value.map((x, j) => ({ ...x, correct: j === i ? true : undefined })))} className="h-5 w-5 accent-[var(--ok)]" />
            Jawaban benar
          </label>
          <span className={small}>Pilihan {i + 1}</span>
        </div>
        <input aria-label={`Teks pilihan ${i + 1}`} value={o.text ?? ''} onChange={(e) => set({ ...o, text: e.target.value })} className={input} placeholder="Teks pilihan" />
        {!o.correct && (
          <div className="grid gap-2 sm:grid-cols-[1fr_14rem]">
            <textarea aria-label={`Alasan pilihan ${i + 1} salah`} rows={2} value={o.why ?? ''} onChange={(e) => set({ ...o, why: e.target.value })} className={input} placeholder="Kenapa pilihan ini salah (wajib)" />
            <div>
              <RefSelect id={`${name}-tag-${i}`} table="misconception_tags" value={o.tag ?? null} onChange={(v) => set({ ...o, tag: v ?? undefined })} data={data} allowEmpty />
              <p className="mt-1 text-xs text-muted">Pola kesalahan yang ditunjukkan pilihan ini (opsional).</p>
            </div>
          </div>
        )}
      </div>
    )} />
  );
}

// ───────────── Known wrong answers for typed questions ─────────────
function ErrorsEditor({ value, onChange, data }: { value: Record<string, Row>; onChange: (v: Record<string, Row>) => void; data: Data }) {
  const id = useId();
  // Edited as a list so a half-typed answer does not collide with another key.
  const [list, setList] = useState<Row[]>(() => Object.entries(value ?? {}).map(([wrong, e]) => ({ wrong, why: e.why ?? '', tag: e.tag })));
  const push = (next: Row[]) => {
    setList(next);
    onChange(Object.fromEntries(next.filter((e) => e.wrong.trim()).map((e) => [e.wrong.trim(), { why: e.why, ...(e.tag ? { tag: e.tag } : {}) }])));
  };
  return (
    <>
      <p className="mb-2 text-xs text-muted">Jawaban keliru yang sering muncul, masing-masing dengan penjelasan khusus. Jawaban salah lain tetap mendapat pembahasan umum.</p>
      <Repeater items={list} onChange={push} make={() => ({ wrong: '', why: '' })} addLabel="Tambah jawaban salah" itemLabel="jawaban salah" render={(e, set, i) => (
        <div className="grid gap-2 sm:grid-cols-2">
          <input aria-label={`Jawaban salah ${i + 1}`} lang="en" value={e.wrong} onChange={(ev) => set({ ...e, wrong: ev.target.value })} className={input} placeholder="Jawaban salah, mis. were" />
          <RefSelect id={`${id}-${i}`} table="misconception_tags" value={e.tag ?? null} onChange={(v) => set({ ...e, tag: v ?? undefined })} data={data} allowEmpty />
          <textarea aria-label={`Penjelasan jawaban salah ${i + 1}`} rows={2} value={e.why} onChange={(ev) => set({ ...e, why: ev.target.value })} className={cx(input, 'sm:col-span-2')} placeholder="Kenapa jawaban ini salah (wajib)" />
        </div>
      )} />
    </>
  );
}

function PairsEditor({ value, onChange }: { value: string[][]; onChange: (v: string[][]) => void }) {
  return (
    <Repeater items={value} onChange={onChange} make={() => ['', '']} addLabel="Tambah pasangan" itemLabel="pasangan" render={(p, set, i) => (
      <div className="grid gap-2 sm:grid-cols-2">
        <input aria-label={`Pasangan ${i + 1}, sisi kiri`} value={p[0] ?? ''} onChange={(e) => set([e.target.value, p[1] ?? ''])} className={input} placeholder="Sisi kiri" />
        <input aria-label={`Pasangan ${i + 1}, sisi kanan`} value={p[1] ?? ''} onChange={(e) => set([p[0] ?? '', e.target.value])} className={input} placeholder="Sisi kanan" />
      </div>
    )} />
  );
}

// ───────────── Lesson material (step 2) ─────────────
const tableToText = (t?: string[][]) => (t ?? []).map((r) => r.join(' | ')).join('\n');
const textToTable = (s: string) => s.split('\n').filter((l) => l.trim()).map((l) => l.split('|').map((c) => c.trim()));

function TeachingEditor({ value, onChange }: { value: Row[]; onChange: (v: Row[]) => void }) {
  return (
    <Repeater items={value} onChange={onChange} make={() => ({ heading: '', body: '' })} addLabel="Tambah bagian materi" itemLabel="bagian" render={(s, set, i) => (
      <div className="space-y-2">
        <input aria-label={`Judul bagian ${i + 1}`} value={s.heading ?? ''} onChange={(e) => set({ ...s, heading: e.target.value })} className={cx(input, 'font-bold')} placeholder="Judul bagian" />
        <textarea aria-label={`Penjelasan bagian ${i + 1}`} rows={4} value={s.body ?? ''} onChange={(e) => set({ ...s, body: e.target.value })} className={input} placeholder="Penjelasan dalam bahasa Indonesia" />
        <details open={(s.examples?.length ?? 0) > 0}>
          <summary className={cx(small, 'cursor-pointer')}>Contoh kalimat ({s.examples?.length ?? 0})</summary>
          <div className="mt-2">
            <Repeater items={(s.examples ?? []) as Row[]} onChange={(ex) => set({ ...s, examples: ex.length ? ex : undefined })} make={() => ({ en: '', id: '' })} addLabel="Tambah contoh" itemLabel="contoh" render={(x, setX, j) => (
              <div className="grid gap-2 sm:grid-cols-2">
                <input aria-label={`Contoh ${j + 1} bahasa Inggris`} lang="en" value={x.en ?? ''} onChange={(e) => setX({ ...x, en: e.target.value })} className={input} placeholder="Kalimat bahasa Inggris" />
                <input aria-label={`Contoh ${j + 1} terjemahan`} value={x.id ?? ''} onChange={(e) => setX({ ...x, id: e.target.value })} className={input} placeholder="Terjemahan" />
                <input aria-label={`Contoh ${j + 1} catatan`} value={x.note ?? ''} onChange={(e) => setX({ ...x, note: e.target.value || undefined })} className={cx(input, 'sm:col-span-2')} placeholder="Catatan (opsional)" />
              </div>
            )} />
          </div>
        </details>
        <details open={(s.table?.length ?? 0) > 0}>
          <summary className={cx(small, 'cursor-pointer')}>Tabel ({s.table?.length ? `${s.table.length} baris` : 'tidak ada'})</summary>
          <textarea aria-label={`Tabel bagian ${i + 1}`} rows={5} defaultValue={tableToText(s.table)} onChange={(e) => { const t = textToTable(e.target.value); set({ ...s, table: t.length ? t : undefined }); }} className={cx(input, 'mt-2 font-mono text-xs')} placeholder={'Subjek | To be\nI | am\nHe / She / It | is'} />
          <p className="mt-1 text-xs text-muted">Satu baris tabel per baris teks, kolom dipisahkan dengan tanda |. Baris pertama menjadi judul kolom.</p>
        </details>
      </div>
    )} />
  );
}

function DemoEditor({ value, onChange }: { value: Row[]; onChange: (v: Row[]) => void }) {
  return (
    <Repeater items={value} onChange={onChange} make={() => ({ good: '', bad: '', why: '' })} addLabel="Tambah contoh benar dan salah" itemLabel="contoh" render={(d, set, i) => (
      <div className="grid gap-2 sm:grid-cols-2">
        <input aria-label={`Contoh ${i + 1}: kalimat benar`} lang="en" value={d.good ?? ''} onChange={(e) => set({ ...d, good: e.target.value })} className={input} placeholder="Kalimat yang benar" />
        <input aria-label={`Contoh ${i + 1}: kalimat salah`} lang="en" value={d.bad ?? ''} onChange={(e) => set({ ...d, bad: e.target.value })} className={input} placeholder="Kalimat yang salah" />
        <textarea aria-label={`Contoh ${i + 1}: alasan`} rows={2} value={d.why ?? ''} onChange={(e) => set({ ...d, why: e.target.value })} className={cx(input, 'sm:col-span-2')} placeholder="Kenapa yang kedua salah" />
      </div>
    )} />
  );
}

function WritingEditor({ value, onChange }: { value: Row | null | undefined; onChange: (v: Row | null) => void }) {
  const id = useId();
  if (!value) return <Button type="button" size="sm" variant="secondary" onClick={() => onChange({ prompt: '', minWords: 20, mustInclude: [], model: '' })}><Plus size={16} aria-hidden />Tambah tugas menulis</Button>;
  return (
    <div className="space-y-3 rounded-2xl border border-line bg-bg p-3">
      <p className="text-xs text-muted">Tulisan pelajar diperiksa dengan daftar periksa yang pasti (jumlah kata dan unsur wajib), lalu dibandingkan dengan contoh jawaban. Mutu tulisan tidak dinilai otomatis.</p>
      <Labeled label="Instruksi" htmlFor={`${id}-p`} required><textarea id={`${id}-p`} rows={3} value={value.prompt ?? ''} onChange={(e) => onChange({ ...value, prompt: e.target.value })} className={input} /></Labeled>
      <Labeled label="Jumlah kata minimal" htmlFor={`${id}-n`} required><input id={`${id}-n`} type="number" min={1} value={value.minWords ?? ''} onChange={(e) => onChange({ ...value, minWords: e.target.value === '' ? null : Number(e.target.value) })} className={cx(input, 'max-w-40')} /></Labeled>
      <Labeled label="Unsur wajib" htmlFor={`${id}-m`} hint='Satu unsur per baris, dengan format "Label yang dilihat pelajar::frasa1|frasa2". Unsur terpenuhi bila salah satu frasa muncul di tulisan.'><LinesInput id={`${id}-m`} value={value.mustInclude} onChange={(v) => onChange({ ...value, mustInclude: v })} /></Labeled>
      <Labeled label="Contoh jawaban" htmlFor={`${id}-x`} required><textarea id={`${id}-x`} rows={3} lang="en" value={value.model ?? ''} onChange={(e) => onChange({ ...value, model: e.target.value })} className={input} /></Labeled>
      <Button type="button" size="sm" variant="ghost" onClick={() => onChange(null)}><Trash2 size={16} aria-hidden />Hapus tugas menulis</Button>
    </div>
  );
}

/** Renders one schema field. `onValidity` reports JSON parse state. */
export function FieldControl({ field: f, value, onChange, data, onValidity }: { field: Field; value: unknown; onChange: (v: unknown) => void; data: Data; onValidity: (ok: boolean) => void }) {
  const id = useId();
  if (f.kind === 'bool') {
    return (
      <label className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm font-bold">
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-[var(--brand)]" />
        {f.label}
      </label>
    );
  }
  const group = ['options', 'pairs', 'errors', 'teaching', 'demo', 'writing'].includes(f.kind);
  const control = (() => {
    switch (f.kind) {
      case 'text': return <input id={id} value={(value as string) ?? ''} lang={f.en ? 'en' : undefined} onChange={(e) => onChange(e.target.value)} className={input} />;
      case 'textarea': return <textarea id={id} rows={f.rows ?? 3} value={(value as string) ?? ''} lang={f.en ? 'en' : undefined} onChange={(e) => onChange(e.target.value)} className={input} />;
      case 'number': return <input id={id} type="number" inputMode="numeric" min={f.min} max={f.max} value={(value as number) ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} className={cx(input, 'max-w-40')} />;
      case 'date': return <input id={id} type="date" value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value || null)} className={cx(input, 'max-w-52')} />;
      case 'select': return (
        <select id={id} value={value === null || value === undefined ? '' : String(value)} onChange={(e) => onChange(e.target.value || null)} className={input}>
          {(f.nullable || value === null || value === undefined || value === '') && <option value="">{f.nullable ? '(tidak ada)' : 'Pilih...'}</option>}
          {f.choices!.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      );
      case 'ref': return <RefSelect id={id} table={f.ref!} value={value} onChange={onChange} data={data} allowEmpty={!!f.nullable} />;
      case 'lines': return <LinesInput id={id} value={value} onChange={onChange} rows={f.rows} en={f.en} />;
      case 'json': return <JsonInput id={id} value={value} onChange={onChange} onValidity={onValidity} rows={f.rows} />;
      case 'options': return <OptionsEditor value={(value as Row[]) ?? []} onChange={onChange} data={data} />;
      case 'errors': return <ErrorsEditor value={(value as Record<string, Row>) ?? {}} onChange={onChange} data={data} />;
      case 'pairs': return <PairsEditor value={(value as string[][]) ?? []} onChange={onChange} />;
      case 'teaching': return <TeachingEditor value={(value as Row[]) ?? []} onChange={onChange} />;
      case 'demo': return <DemoEditor value={(value as Row[]) ?? []} onChange={onChange} />;
      case 'writing': return <WritingEditor value={value as Row | null} onChange={onChange} />;
    }
  })();
  if (group) {
    return (
      <fieldset>
        <legend className="mb-1 text-sm font-bold">{f.label}{f.required && <span className="text-bad" aria-hidden> *</span>}</legend>
        {f.hint && <p className="mb-2 text-xs text-muted">{f.hint}</p>}
        {control}
      </fieldset>
    );
  }
  return <Labeled label={f.label} hint={f.hint} required={f.required} htmlFor={id}>{control}</Labeled>;
}
