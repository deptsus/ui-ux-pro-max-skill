'use client';
// "Rekaman" tab (Rilis 6): every text in the curriculum that can be played,
// with its recording status per accent. The owner records straight from the
// phone's microphone or uploads a file; the app then plays that recording
// wherever the same text is played (matched by text), in the learner's accent.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Circle, Mic, Pause, Play, RotateCcw, Square, Trash2, Upload } from 'lucide-react';
import { spokenKey } from '@/lib/content/spoken';
import { getToken } from '@/lib/client/session';
import { Badge, Button, Notice, cx } from '@/components/ui';
import { input } from './fields';
import { unpublished } from './api';
import type { Data, Row } from './schema';

type Accent = 'us' | 'uk';
type Category = 'listening' | 'words' | 'examples' | 'stories' | 'scenarios';
interface Item { text: string; where: string; level: string }
interface Recording { key: string; accent: Accent; url: string; speaker?: string | null; transcript?: string | null }

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'listening', label: 'Materi menyimak' },
  { id: 'words', label: 'Kosakata' },
  { id: 'examples', label: 'Contoh kalimat kosakata' },
  { id: 'stories', label: 'Cerita' },
  { id: 'scenarios', label: 'Percakapan' },
];
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const ACCENT_LABEL: Record<Accent, string> = { us: 'Amerika (US)', uk: 'Inggris (UK)' };
const SPEAKER_KEY = 'lentera.admin.speaker';
const PAGE = 20;
const MAX_SECONDS = 180;

/** Playable text per category, from the editable curriculum rows; repeated text appears once. */
export function recordableItems(data: Data, category: Category): Item[] {
  const out = new Map<string, Item>();
  const add = (text: unknown, where: string, level: string) => {
    if (typeof text !== 'string' || !text.trim()) return;
    const k = spokenKey(text);
    if (k && !out.has(k)) out.set(k, { text: text.trim(), where, level });
  };
  const lines = (scene: Row | undefined) => (Array.isArray(scene?.lines) ? (scene!.lines as Row[]) : []);
  if (category === 'listening') for (const l of data.listening_items ?? []) add(l.transcript, `${l.title} · ${l.id}`, l.level_code);
  if (category === 'words') for (const v of data.vocabulary ?? []) add(v.word, `${v.set_name ?? 'Kosakata'} · ${v.meaning ?? ''}`, v.level_code);
  if (category === 'examples') for (const v of data.vocabulary ?? []) add(v.example, `Contoh untuk "${v.word}"`, v.level_code);
  if (category === 'stories') {
    for (const s of data.stories ?? []) {
      const name = (who: string) => (who === 'narrator' ? 'Narator' : (s.characters as Row[] | undefined)?.find((c) => c.id === who)?.name ?? who);
      for (const sc of (s.scenes as Row[] | undefined) ?? []) for (const ln of lines(sc)) add(ln.en, `${s.title} · ${name(ln.who)}`, s.level_code);
      const branch = s.branch as Row | null | undefined;
      for (const n of (branch?.nodes as Row[] | undefined) ?? []) {
        for (const ln of lines(n.scene)) add(ln.en, `${s.title} · ${name(ln.who)}`, s.level_code);
        for (const c of (n.choices as Row[] | undefined) ?? []) add(c.text, `${s.title} · pilihan ${name(branch!.as)}`, s.level_code);
      }
    }
  }
  if (category === 'scenarios') {
    for (const s of data.conversation_scenarios ?? []) {
      for (const n of (s.nodes as Row[] | undefined) ?? []) {
        add(n.line ?? n.text ?? n.en, `${s.title} · lawan bicara`, s.level_code);
        for (const o of (n.options as Row[] | undefined) ?? []) add(o.text, `${s.title} · pilihan pelajar`, s.level_code);
      }
    }
  }
  return [...out.values()];
}

async function upload(blob: Blob, text: string, accent: Accent, speaker: string, filename: string): Promise<Recording> {
  const fd = new FormData();
  fd.append('file', blob, filename);
  fd.append('text', text);
  fd.append('accent', accent);
  fd.append('speaker', speaker);
  const token = await getToken();
  let res: Response;
  try {
    res = await fetch('/api/admin/audio', { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd });
  } catch {
    throw new Error('Tidak ada koneksi internet.');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? 'Unggahan gagal.');
  return body as Recording;
}

async function remove(key: string): Promise<void> {
  const token = await getToken();
  const res = await fetch('/api/admin/audio', { method: 'DELETE', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ key }) });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Gagal menghapus.');
}

let playing: HTMLAudioElement | null = null;
function playUrl(url: string, onEnd: () => void) {
  playing?.pause();
  const el = new Audio(url);
  playing = el;
  el.onended = onEnd;
  el.onerror = onEnd;
  void el.play().catch(onEnd);
}

/** Records from the microphone: record → listen back → upload or redo. */
function Recorder({ onDone, onCancel, busy }: { onDone: (b: Blob, name: string) => void; onCancel: () => void; busy: boolean }) {
  const [state, setState] = useState<'idle' | 'recording' | 'review' | 'error'>('idle');
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState('');
  const rec = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); rec.current?.stream.getTracks().forEach((t) => t.stop()); }, []);

  async function start() {
    if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setState('error');
      setError('Browser ini tidak bisa merekam. Rekam dengan aplikasi perekam di HP, lalu pakai tombol Unggah.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const type = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'].find((t) => MediaRecorder.isTypeSupported(t));
      const r = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
      const chunks: Blob[] = [];
      r.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timer.current) clearInterval(timer.current);
        setBlob(new Blob(chunks, { type: r.mimeType || type || 'audio/webm' }));
        setState('review');
      };
      rec.current = r;
      r.start();
      setSeconds(0);
      setState('recording');
      timer.current = setInterval(() => setSeconds((s) => { if (s + 1 >= MAX_SECONDS) r.stop(); return s + 1; }), 1000);
    } catch {
      setState('error');
      setError('Mikrofon tidak bisa dipakai. Izinkan akses mikrofon untuk situs ini, lalu coba lagi.');
    }
  }
  const ext = blob?.type.includes('mp4') ? 'm4a' : blob?.type.includes('ogg') ? 'ogg' : 'webm';

  return (
    <div className="mt-3 space-y-2 rounded-2xl border-2 border-brand/40 bg-brand-soft/40 p-3" role="group" aria-label="Perekam">
      {state === 'idle' && (
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="danger" onClick={() => void start()}><Circle size={14} aria-hidden fill="currentColor" />Mulai rekam</Button>
          <Button size="sm" variant="ghost" onClick={onCancel}>Batal</Button>
          <p className="w-full text-xs text-muted">Bacakan teks di atas dengan jelas di tempat yang tenang. Maksimal 3 menit.</p>
        </div>
      )}
      {state === 'recording' && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 font-bold text-bad" role="status"><span className="h-3 w-3 animate-pulse rounded-full bg-bad" aria-hidden />Merekam {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</span>
          <Button size="sm" onClick={() => rec.current?.stop()}><Square size={14} aria-hidden fill="currentColor" />Selesai</Button>
        </div>
      )}
      {state === 'review' && url && (
        <div className="space-y-2">
          <audio src={url} controls className="w-full" aria-label="Dengarkan hasil rekaman" />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="success" disabled={busy} onClick={() => blob && onDone(blob, `rekaman.${ext}`)}><Upload size={14} aria-hidden />{busy ? 'Mengunggah...' : 'Simpan rekaman'}</Button>
            <Button size="sm" variant="secondary" disabled={busy} onClick={() => { setBlob(null); setState('idle'); }}><RotateCcw size={14} aria-hidden />Ulangi</Button>
            <Button size="sm" variant="ghost" disabled={busy} onClick={onCancel}>Batal</Button>
          </div>
        </div>
      )}
      {state === 'error' && (
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-bad">{error}</p>
          <Button size="sm" variant="ghost" onClick={onCancel}>Tutup</Button>
        </div>
      )}
    </div>
  );
}

function ItemRow({ item, accent, recs, speaker, onSaved, onDeleted }: { item: Item; accent: Accent; recs: Recording[]; speaker: string; onSaved: (r: Recording) => void; onDeleted: (key: string) => void }) {
  const mine = recs.find((r) => r.accent === accent);
  const other = recs.find((r) => r.accent !== accent);
  const [mode, setMode] = useState<'none' | 'record'>('none');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [isPlaying, setPlaying] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  async function save(blob: Blob, name: string) {
    setBusy(true);
    setError('');
    try {
      onSaved(await upload(blob, item.text, accent, speaker, name));
      setMode('none');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function drop() {
    if (!mine || !window.confirm(`Hapus rekaman aksen ${ACCENT_LABEL[accent]} untuk teks ini?`)) return;
    setBusy(true);
    setError('');
    try {
      await remove(mine.key);
      onDeleted(mine.key);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded-2xl border border-line bg-surface p-3" data-recording={mine ? 'yes' : 'no'}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge tone="muted">{item.level}</Badge>
        <span className="min-w-0 flex-1 truncate text-muted">{item.where}</span>
        {mine ? <Badge tone="ok"><Check size={12} aria-hidden />{accent.toUpperCase()} sudah</Badge> : <Badge tone="accent">{accent.toUpperCase()} belum</Badge>}
        {other && <Badge tone="muted">{other.accent.toUpperCase()} sudah</Badge>}
      </div>
      <p className="en mt-2 line-clamp-4 font-semibold">{item.text}</p>
      {mine?.speaker && <p className="mt-1 text-xs text-muted">Penutur: {mine.speaker}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        <Button size="sm" variant={mine ? 'secondary' : 'primary'} disabled={busy} onClick={() => setMode(mode === 'record' ? 'none' : 'record')} aria-expanded={mode === 'record'}><Mic size={14} aria-hidden />{mine ? 'Rekam ulang' : 'Rekam'}</Button>
        <Button size="sm" variant="secondary" disabled={busy} onClick={() => file.current?.click()}><Upload size={14} aria-hidden />Unggah berkas</Button>
        <input ref={file} type="file" accept="audio/*,.mp3,.m4a,.wav,.ogg,.webm,.flac,.aac" className="sr-only" tabIndex={-1} aria-label={`Berkas rekaman untuk: ${item.text.slice(0, 60)}`}
          onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void save(f, f.name); }} />
        {mine && (
          <>
            <Button size="sm" variant="ghost" onClick={() => { if (isPlaying) { playing?.pause(); setPlaying(false); } else { setPlaying(true); playUrl(mine.url, () => setPlaying(false)); } }}>
              {isPlaying ? <Pause size={14} aria-hidden /> : <Play size={14} aria-hidden />}{isPlaying ? 'Jeda' : 'Putar'}
            </Button>
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => void drop()} aria-label="Hapus rekaman"><Trash2 size={14} aria-hidden />Hapus</Button>
          </>
        )}
        {busy && mode === 'none' && <span className="self-center text-xs font-bold text-muted" role="status">Mengunggah...</span>}
      </div>
      {mode === 'record' && <Recorder busy={busy} onCancel={() => setMode('none')} onDone={(b, n) => void save(b, n)} />}
      {error && <p className="mt-2 text-sm text-bad" role="alert">{error}</p>}
    </li>
  );
}

export function RecordingsPanel({ data }: { data: Data }) {
  const [recs, setRecs] = useState<Recording[]>(() => (data.audio_resources ?? []) as Recording[]);
  useEffect(() => setRecs((data.audio_resources ?? []) as Recording[]), [data]);
  const [category, setCategory] = useState<Category>('listening');
  const [accent, setAccent] = useState<Accent>('us');
  const [level, setLevel] = useState('');
  const [status, setStatus] = useState<'missing' | 'done' | 'all'>('missing');
  const [query, setQuery] = useState('');
  const [shown, setShown] = useState(PAGE);
  const [speaker, setSpeaker] = useState('');
  const [freeText, setFreeText] = useState('');
  useEffect(() => setSpeaker(localStorage.getItem(SPEAKER_KEY) ?? ''), []);
  useEffect(() => setShown(PAGE), [category, accent, level, status, query]);

  const byText = useMemo(() => {
    const m = new Map<string, Recording[]>();
    for (const r of recs) if (r.transcript) m.set(spokenKey(r.transcript), [...(m.get(spokenKey(r.transcript)) ?? []), r]);
    return m;
  }, [recs]);
  const all = useMemo(() => recordableItems(data, category), [data, category]);
  const recsOf = (text: string) => byText.get(spokenKey(text)) ?? [];
  const done = all.filter((it) => recsOf(it.text).some((r) => r.accent === accent)).length;
  const q = query.trim().toLowerCase();
  const items = all.filter((it) => (!level || it.level === level)
    && (status === 'all' || (status === 'done') === recsOf(it.text).some((r) => r.accent === accent))
    && (!q || it.text.toLowerCase().includes(q) || it.where.toLowerCase().includes(q)));
  const onSaved = (r: Recording) => { setRecs((list) => [...list.filter((x) => x.key !== r.key), r]); unpublished.set(true); };
  const onDeleted = (key: string) => { setRecs((list) => list.filter((x) => x.key !== key)); unpublished.set(true); };
  const freeItem: Item | null = freeText.trim() ? { text: freeText.trim(), where: 'Teks lain', level: '–' } : null;

  return (
    <div className="space-y-4">
      <Notice title="Rekaman suara">
        <p>Rekam langsung dari mikrofon HP atau unggah berkas (MP3, M4A, WAV, OGG, WEBM, FLAC; maksimal 4 MB). Rekaman dipakai di mana pun teks yang sama diputar, sesuai aksen pilihan pelajar. Teks tanpa rekaman tetap dibacakan suara bawaan perangkat.</p>
        <p className="mt-1 font-bold">Rekaman baru sampai ke pelajar setelah kurikulum diterbitkan (tab Terbitkan).</p>
      </Notice>

      <div className="grid gap-3 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm font-bold">Nama penutur (opsional)
          <input className={input} value={speaker} maxLength={80} placeholder="Misalnya: Sarah (US)" onChange={(e) => { setSpeaker(e.target.value); localStorage.setItem(SPEAKER_KEY, e.target.value); }} />
        </label>
        <fieldset className="space-y-1 text-sm font-bold">
          <legend>Aksen yang sedang direkam</legend>
          <div className="flex gap-2">
            {(['us', 'uk'] as const).map((a) => <Button key={a} size="sm" variant={accent === a ? 'primary' : 'secondary'} aria-pressed={accent === a} onClick={() => setAccent(a)}>{ACCENT_LABEL[a]}</Button>)}
          </div>
        </fieldset>
      </div>

      <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="Jenis teks">
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" role="tab" aria-selected={category === c.id} onClick={() => setCategory(c.id)}
            className={cx('shrink-0 rounded-full border-2 px-3 py-2 text-sm font-bold', category === c.id ? 'border-brand bg-brand text-on-brand' : 'border-line bg-surface text-ink')}>{c.label}</button>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <select className={input} value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Level"><option value="">Semua level</option>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select>
        <select className={input} value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Status rekaman">
          <option value="missing">Belum direkam ({accent.toUpperCase()})</option>
          <option value="done">Sudah direkam ({accent.toUpperCase()})</option>
          <option value="all">Semua</option>
        </select>
        <input className={input} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari teks..." aria-label="Cari teks" />
      </div>

      <p className="text-sm font-bold" role="status" data-recorded={done} data-total={all.length}>{done} dari {all.length} teks sudah direkam dengan aksen {ACCENT_LABEL[accent]}. Tampil {Math.min(shown, items.length)} dari {items.length}.</p>

      <ul className="space-y-2">
        {items.slice(0, shown).map((it) => <ItemRow key={`${accent}:${spokenKey(it.text)}`} item={it} accent={accent} recs={recsOf(it.text)} speaker={speaker} onSaved={onSaved} onDeleted={onDeleted} />)}
      </ul>
      {items.length > shown && <Button variant="secondary" full onClick={() => setShown((n) => n + PAGE)}>Tampilkan {Math.min(PAGE, items.length - shown)} lagi</Button>}
      {!items.length && <p className="rounded-2xl border border-dashed border-line p-4 text-center text-sm text-muted">{status === 'missing' ? 'Semua teks di sini sudah direkam untuk aksen ini.' : 'Tidak ada teks yang cocok.'}</p>}

      <section className="space-y-2 rounded-2xl border border-line bg-surface p-4" aria-labelledby="rekaman-teks-lain">
        <h3 id="rekaman-teks-lain" className="font-extrabold">Teks lain</h3>
        <p className="text-sm text-muted">Untuk kalimat yang tidak ada di daftar (misalnya contoh di pelajaran). Ketik persis seperti di materi; tanda baca dan huruf besar tidak berpengaruh.</p>
        <textarea className={input} lang="en" rows={2} value={freeText} onChange={(e) => setFreeText(e.target.value)} placeholder="Contoh: I'm used to getting up early." aria-label="Teks yang akan direkam" />
        {freeItem && <ul><ItemRow key={`free:${accent}:${spokenKey(freeItem.text)}`} item={freeItem} accent={accent} recs={recsOf(freeItem.text)} speaker={speaker} onSaved={onSaved} onDeleted={onDeleted} /></ul>}
      </section>
    </div>
  );
}
