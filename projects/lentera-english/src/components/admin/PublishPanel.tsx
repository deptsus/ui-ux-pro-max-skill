'use client';
// Publish, version history and rollback. Learners only ever receive the
// snapshot marked "current"; edits made in the CMS stay invisible until a new
// version passes the quality gate here.
import { useCallback, useEffect, useState } from 'react';
import { History, RotateCcw, Send, TriangleAlert } from 'lucide-react';
import { Badge, Button, Card, Field, Notice, inputClass } from '@/components/ui';
import { dateTimeId } from '@/lib/format';
import { admin, unpublished } from './api';
import type { CmsTarget } from './CmsPanel';
import { Confirm } from './Confirm';
import type { Data } from './schema';

interface Version { id: number; label: string; notes: string; is_current: boolean; published_at: string; lessons: number; questions: number }
type PublishResult = { published: true; version: number } | { published: false; problems: string[] };

export function PublishPanel({ data, reload, onOpen, active }: { data: Data; reload: () => Promise<void>; onOpen: (t: Omit<CmsTarget, 'n'>) => void; active: boolean }) {
  const [versions, setVersions] = useState<Version[] | null>(null);
  const [label, setLabel] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [problems, setProblems] = useState<string[] | null>(null);
  const [ask, setAsk] = useState<{ kind: 'publish' } | { kind: 'restore'; v: Version } | { kind: 'import' } | null>(null);
  const [pending, setPending] = useState(unpublished.get);
  useEffect(() => unpublished.subscribe(() => setPending(unpublished.get())), []);

  const loadVersions = useCallback(async () => {
    try {
      setVersions(await admin<Version[]>('versions'));
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);
  useEffect(() => { if (active) void loadVersions(); }, [active, loadVersions]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(false);
    setAsk(null);
  };
  const publish = () => run(async () => {
    const r = await admin<PublishResult>('publish', { label, notes });
    if (!r.published) {
      setProblems(r.problems);
      return;
    }
    setProblems(null);
    setLabel('');
    setNotes('');
    unpublished.set(false);
    setDone(`Versi ${r.version} terbit. Pelajar menerima kurikulum baru saat membuka aplikasi lagi (paling lama sekitar setengah menit).`);
    await loadVersions();
  });
  const restore = (v: Version) => run(async () => {
    await admin('restore', { version: v.id });
    setDone(`Versi ${v.id} (${v.label}) sekarang menjadi versi yang diterima pelajar.`);
    await loadVersions();
  });
  const importBundled = () => run(async () => {
    const r = await admin<{ rows: number }>('import-bundled');
    unpublished.set(true);
    await reload();
    setDone(`${r.rows} baris diimpor dari paket bawaan ke konten kerja. Terbitkan agar pelajar menerimanya.`);
  });

  /** Quality-gate messages start with the id of the offending row. */
  const locate = (msg: string): Omit<CmsTarget, 'n'> | null => {
    const id = msg.split(': ')[0];
    if ((data.questions ?? []).some((q) => q.id === id)) return { table: 'questions', id };
    if ((data.lessons ?? []).some((l) => l.id === id)) return { table: 'lessons', id };
    return null;
  };
  const drafts = { lessons: (data.lessons ?? []).filter((l) => l.status === 'draft').length, questions: (data.questions ?? []).filter((q) => q.status === 'draft').length };
  const willPublish = { lessons: (data.lessons ?? []).length - drafts.lessons, questions: (data.questions ?? []).filter((q) => q.status === 'published' && (!q.lesson_id || (data.lessons ?? []).some((l) => l.id === q.lesson_id && l.status === 'published'))).length };
  const current = versions?.find((v) => v.is_current);

  return (
    <div className="space-y-5">
      {error && <Notice tone="bad" title="Gagal">{error}</Notice>}
      {done && <Notice tone="ok" title="Berhasil">{done}</Notice>}

      <Card className="space-y-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-extrabold"><Send size={20} className="text-brand" aria-hidden />Terbitkan kurikulum</h2>
          <p className="mt-1 text-sm text-muted">Menerbitkan membuat salinan seluruh konten berstatus Terbit dan menjadikannya versi yang diterima pelajar. Sebelum itu, gerbang kualitas memeriksa kunci jawaban, pembahasan, materi, dan soal tes penguasaan.</p>
        </div>
        {pending && <Notice tone="accent">Ada perubahan yang kamu simpan dari browser ini sejak terakhir menerbitkan.</Notice>}
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-2xl bg-surface-2 p-3"><dt className="font-bold text-muted">Versi yang diterima pelajar</dt><dd className="mt-1 font-extrabold">{versions === null ? 'Memuat...' : current ? `Versi ${current.id} · ${current.label}` : 'Belum ada (memakai paket bawaan)'}</dd></div>
          <div className="rounded-2xl bg-surface-2 p-3"><dt className="font-bold text-muted">Akan diterbitkan</dt><dd className="mt-1 font-extrabold">{willPublish.lessons} pelajaran · {willPublish.questions} soal</dd></div>
          <div className="rounded-2xl bg-surface-2 p-3"><dt className="font-bold text-muted">Draf (tidak ikut terbit)</dt><dd className="mt-1 font-extrabold">{drafts.lessons} pelajaran · {drafts.questions} soal</dd></div>
        </dl>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Label versi (opsional)" hint="Bila kosong, memakai tanggal dan jam terbit."><input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={60} className={inputClass} placeholder="mis. A2 unit 3" /></Field>
          <Field label="Catatan (opsional)"><input value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} className={inputClass} placeholder="Apa yang berubah" /></Field>
        </div>
        <Button onClick={() => setAsk({ kind: 'publish' })} disabled={busy}><Send size={18} aria-hidden />Periksa dan terbitkan</Button>

        {problems && (
          <div className="rounded-2xl border-2 border-bad bg-bad-soft p-4" role="alert">
            <p className="flex items-center gap-2 font-extrabold text-bad"><TriangleAlert size={18} aria-hidden />Belum diterbitkan: {problems.length}{problems.length === 50 ? ' atau lebih' : ''} masalah ditemukan</p>
            <p className="mt-1 text-sm">Perbaiki masalah berikut, lalu terbitkan lagi. Versi yang diterima pelajar tidak berubah.</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {problems.map((msg) => {
                const t = locate(msg);
                return <li key={msg} className="flex flex-wrap items-center gap-2 rounded-xl bg-surface px-3 py-2"><span className="min-w-0 flex-1 break-words">{msg}</span>{t && <Button size="sm" variant="secondary" onClick={() => onOpen(t)}>Buka</Button>}</li>;
              })}
            </ul>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 text-lg font-extrabold"><History size={20} className="text-brand" aria-hidden />Riwayat versi</h2>
        <p className="mt-1 text-sm text-muted">Memulihkan versi lama mengganti apa yang diterima pelajar. Konten kerja di tab Konten tidak ikut berubah.</p>
        {versions === null ? <p className="mt-3 text-sm text-muted" role="status">Memuat...</p> : versions.length === 0 ? <p className="mt-3 text-sm text-muted">Belum ada versi yang terbit. Pelajar memakai paket kurikulum bawaan.</p> : (
          <ul className="mt-3 divide-y divide-line">
            {versions.map((v) => (
              <li key={v.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-bold">Versi {v.id} · {v.label} {v.is_current && <Badge tone="ok" className="ml-1">Dipakai pelajar</Badge>}</p>
                  <p className="text-sm text-muted">{dateTimeId(v.published_at)} · {v.lessons} pelajaran · {v.questions} soal</p>
                  {v.notes && <p className="mt-0.5 text-sm">{v.notes}</p>}
                </div>
                {!v.is_current && <Button size="sm" variant="secondary" disabled={busy} onClick={() => setAsk({ kind: 'restore', v })}><RotateCcw size={16} aria-hidden />Pulihkan</Button>}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="border-bad">
        <h2 className="text-lg font-extrabold">Impor ulang paket bawaan</h2>
        <p className="mt-1 text-sm text-muted">Menyalin kurikulum bawaan dari kode aplikasi ke konten kerja. Baris dengan ID yang sama <strong className="text-ink">ditimpa</strong>, termasuk suntingan yang sudah dibuat di sini. Baris yang hanya ada di CMS tidak dihapus. Biasanya hanya diperlukan sekali, saat basis data masih kosong.</p>
        <Button variant="secondary" className="mt-3" disabled={busy} onClick={() => setAsk({ kind: 'import' })}>Impor ulang...</Button>
      </Card>

      <Confirm open={ask?.kind === 'publish'} tone="primary" title="Terbitkan kurikulum?" confirmLabel="Terbitkan" busy={busy} onCancel={() => setAsk(null)} onConfirm={publish}>
        <p>{willPublish.lessons} pelajaran dan {willPublish.questions} soal akan diperiksa. Bila lolos, semua pelajar langsung menerima versi baru.</p>
        <p>Kamu bisa kembali ke versi sebelumnya kapan pun dari riwayat versi.</p>
      </Confirm>
      <Confirm open={ask?.kind === 'restore'} tone="primary" title="Pulihkan versi ini?" confirmLabel="Pulihkan" busy={busy} onCancel={() => setAsk(null)} onConfirm={() => ask?.kind === 'restore' && restore(ask.v)}>
        {ask?.kind === 'restore' && <p className="font-bold text-ink">Versi {ask.v.id} · {ask.v.label} ({ask.v.lessons} pelajaran, {ask.v.questions} soal)</p>}
        <p>Semua pelajar akan menerima versi ini menggantikan versi yang sekarang. Konten kerja tidak diubah.</p>
      </Confirm>
      <Confirm open={ask?.kind === 'import'} title="Timpa konten kerja dengan paket bawaan?" confirmLabel="Impor dan timpa" typeToConfirm="IMPOR" busy={busy} onCancel={() => setAsk(null)} onConfirm={importBundled}>
        <p>Setiap bab, unit, pelajaran, soal, kosakata, dan materi lain yang ID-nya ada di paket bawaan akan dikembalikan ke isi bawaan. Suntingan CMS pada baris itu hilang dan tidak bisa dikembalikan dari dashboard ini.</p>
        <p>Versi yang sudah terbit tidak berubah sampai kamu menerbitkan lagi.</p>
      </Confirm>
    </div>
  );
}
