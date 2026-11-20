'use client';
// Ruang Guru (Rilis 10): activate a school license with its code, make
// classes, share the class code, give lessons/PR/unit exams with deadlines,
// and follow every student's progress. Everything is re-checked in SQL.
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Archive, Copy, Download, GraduationCap, KeyRound, Plus, RefreshCw, Share2, Trash2, Users } from 'lucide-react';
import { CEFR_ORDER } from '@/lib/content/types';
import { useApp } from '@/lib/client/hooks';
import { dueText, KIND_LABEL, rosterCsv, teacherAction, teacherOverview, type Assignment, type ClassDetail, type TeacherOverview } from '@/lib/client/classes';
import { isNativeApp, nativeShare, nativeShareFile } from '@/lib/client/native';
import { useServerInfo, useSession } from '@/lib/client/session';
import { Avatar } from '@/components/Avatar';
import { Badge, Button, Card, Empty, LinkButton, Notice, PageHeader, cx, dateId, inputClass, Loading } from '@/components/ui';

type Msg = { tone: 'ok' | 'bad'; text: string } | null;
const inviteText = (code: string, name: string) => `Gabung ke kelas ${name} di Lentera English dengan kode ${code}: ${window.location.origin}/app/kelas?kode=${code}`;
const defaultDue = () => { const d = new Date(Date.now() + 7 * 86_400_000); d.setHours(23, 59, 0, 0); return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16); };

function AssignForm({ classId, onDone }: { classId: number; onDone: (m: Msg) => void }) {
  const { ix } = useApp();
  const [kind, setKind] = useState<Assignment['kind']>('lesson');
  const [ref, setRef] = useState('');
  const [due, setDue] = useState(defaultDue);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const levelOfChapter = useMemo(() => new Map(ix.pack.chapters.map((c) => [c.id, c.level])), [ix]);
  const levelOfUnit = useMemo(() => new Map(ix.pack.units.map((u) => [u.id, levelOfChapter.get(u.chapterId)])), [ix, levelOfChapter]);
  const options = useMemo(() => {
    const list: { id: string; title: string; level: string }[] =
      kind === 'lesson' ? ix.pack.lessons.map((l) => ({ id: l.id, title: l.title, level: levelOfUnit.get(l.unitId) ?? '' }))
      : kind === 'homework' ? ix.pack.homework.filter((h) => !h.id.startsWith('hw.week')).map((h) => ({ id: h.id, title: h.title, level: levelOfChapter.get(h.chapterId) ?? '' }))
      : ix.pack.exams.filter((e) => e.scope === 'unit').map((e) => ({ id: e.id, title: e.title, level: levelOfUnit.get(e.ref) ?? '' }));
    return CEFR_ORDER.map((lv) => ({ level: lv, items: list.filter((x) => x.level === lv) })).filter((g) => g.items.length);
  }, [ix, kind, levelOfChapter, levelOfUnit]);
  const chosen = options.flatMap((g) => g.items).find((x) => x.id === ref);
  return (
    <form className="space-y-3" onSubmit={async (e) => {
      e.preventDefault();
      if (!chosen) return;
      setBusy(true);
      try {
        const r = await teacherAction({ action: 'assign', classId, kind, refId: chosen.id, title: chosen.title, note, dueAt: new Date(due).toISOString() });
        onDone({ tone: 'ok', text: r.message });
        setRef('');
        setNote('');
      } catch (err) {
        onDone({ tone: 'bad', text: (err as Error).message });
      }
      setBusy(false);
    }}>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Jenis tugas">
        {(Object.keys(KIND_LABEL) as Assignment['kind'][]).map((k) => <Button key={k} type="button" size="sm" role="radio" aria-checked={kind === k} variant={kind === k ? 'primary' : 'secondary'} onClick={() => { setKind(k); setRef(''); }}>{KIND_LABEL[k]}</Button>)}
      </div>
      <label className="block"><span className="mb-1 block text-sm font-bold">Materi</span>
        <select className={inputClass} value={ref} onChange={(e) => setRef(e.target.value)} required>
          <option value="">Pilih {KIND_LABEL[kind].toLowerCase()}…</option>
          {options.map((g) => <optgroup key={g.level} label={`Level ${g.level}`}>{g.items.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}</optgroup>)}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block"><span className="mb-1 block text-sm font-bold">Tenggat</span><input type="datetime-local" className={inputClass} value={due} onChange={(e) => setDue(e.target.value)} required /></label>
        <label className="block"><span className="mb-1 block text-sm font-bold">Catatan untuk siswa <span className="font-normal text-muted">(opsional)</span></span><input className={inputClass} value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} /></label>
      </div>
      <Button type="submit" disabled={busy || !chosen}><Plus size={16} aria-hidden />Berikan tugas</Button>
    </form>
  );
}

function ClassView({ id, back }: { id: number; back: () => void }) {
  const [d, setD] = useState<ClassDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const [tab, setTab] = useState<'students' | 'work'>('students');
  const [confirm, setConfirm] = useState<string | null>(null);
  const load = () => teacherAction<ClassDetail>({ action: 'class', classId: id }).then(setD, (e: Error) => setError(e.message));
  useEffect(() => { void load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  const act = async (body: Record<string, unknown>) => {
    setMsg(null);
    try {
      setMsg({ tone: 'ok', text: (await teacherAction(body)).message });
      setConfirm(null);
      await load();
    } catch (e) {
      setMsg({ tone: 'bad', text: (e as Error).message });
    }
  };
  if (error) return <Empty title="Kelas tidak bisa dibuka" action={<Button onClick={back}>Kembali</Button>}>{error}</Empty>;
  if (!d) return <Loading label="Memuat kelas…" lines={3} />;
  const c = d.class;
  const share = async () => {
    const text = inviteText(c.join_code, c.name);
    if (isNativeApp()) nativeShare(`Kelas ${c.name}`, text);
    else if (navigator.share) await navigator.share({ title: `Kelas ${c.name}`, text }).catch(() => {});
    else { await navigator.clipboard.writeText(text).catch(() => {}); setMsg({ tone: 'ok', text: 'Ajakan disalin. Tempel di grup kelas.' }); }
  };
  const exportCsv = async () => {
    const csv = `﻿${rosterCsv(d)}`;
    const name = `kelas-${c.name.replace(/[^A-Za-z0-9]+/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`;
    if (isNativeApp()) { await nativeShareFile(name, 'text/csv', csv); return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  };
  const now = Date.now();
  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={back}><ArrowLeft size={16} aria-hidden />Semua kelas</Button>
      <Card className="space-y-3">
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-extrabold">{c.name}{c.level && <Badge className="ml-2">{c.level}</Badge>}{c.archived && <Badge tone="muted" className="ml-2">Diarsipkan</Badge>}</h2>
            <p className="text-sm text-muted">{c.school} · {d.students.length}/{c.seats} siswa · lisensi sampai {dateId(c.ends_on)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-muted">Kode kelas</p>
            <p className="select-all font-mono text-2xl font-extrabold tracking-[0.25em] text-brand" aria-label={`Kode kelas ${c.join_code.split('').join(' ')}`}>{c.join_code}</p>
          </div>
        </div>
        {!c.license_active && <Notice tone="accent">Lisensi sekolah tidak aktif: siswa baru tidak bisa bergabung dan Premium siswa berhenti. Hubungi pemilik Lentera untuk memperpanjang.</Notice>}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => void share()}><Share2 size={14} aria-hidden />Bagikan ajakan</Button>
          <Button size="sm" variant="secondary" onClick={() => void exportCsv()} disabled={!d.students.length}><Download size={14} aria-hidden />Unduh rekap (CSV)</Button>
          <Button size="sm" variant="ghost" onClick={() => void act({ action: 'update-class', classId: id, newCode: true })}><RefreshCw size={14} aria-hidden />Kode baru</Button>
          <Button size="sm" variant="ghost" onClick={() => void act({ action: 'update-class', classId: id, archived: !c.archived })}><Archive size={14} aria-hidden />{c.archived ? 'Buka lagi' : 'Arsipkan'}</Button>
        </div>
      </Card>
      {msg && <div role="status"><Notice tone={msg.tone}>{msg.text}</Notice></div>}
      <nav className="flex gap-2" aria-label="Bagian kelas">
        <Button size="sm" variant={tab === 'students' ? 'primary' : 'secondary'} aria-pressed={tab === 'students'} onClick={() => setTab('students')}><Users size={14} aria-hidden />Siswa ({d.students.length})</Button>
        <Button size="sm" variant={tab === 'work' ? 'primary' : 'secondary'} aria-pressed={tab === 'work'} onClick={() => setTab('work')}><GraduationCap size={14} aria-hidden />Tugas ({d.assignments.length})</Button>
      </nav>

      {tab === 'students' ? (d.students.length === 0 ? <Card className="text-center text-muted">Belum ada siswa. Bagikan kode <strong className="font-mono">{c.join_code}</strong> ke siswa.</Card> : (() => {
        const rows = d.students.map((s) => {
          const done = d.assignments.filter((a) => s.results[String(a.id)]).length;
          const missed = d.assignments.filter((a) => new Date(a.due_at).getTime() < now && !s.results[String(a.id)]).length;
          return { s, done, missed, work: `${done}/${d.assignments.length}${missed > 0 ? ` · ${missed} terlewat` : ''}`, mastery: s.mastery !== null ? `${s.mastery}%` : '–', seen: s.last_active ? dateId(s.last_active) : 'belum pernah' };
        });
        const remove = (s: (typeof rows)[number]['s'], align: string) => confirm === s.id
          ? <span className={cx('flex gap-1', align)}><Button size="sm" variant="danger" onClick={() => void act({ action: 'remove-student', classId: id, studentId: s.id })}>Keluarkan</Button><Button size="sm" variant="ghost" onClick={() => setConfirm(null)}>Batal</Button></span>
          : <Button size="sm" variant="ghost" aria-label={`Keluarkan ${s.name} dari kelas`} onClick={() => setConfirm(s.id)}><Trash2 size={14} aria-hidden /></Button>;
        return (
          <>
            {/* Phones: one card per student, nothing to scroll sideways. */}
            <ul className="space-y-2 sm:hidden" aria-label={`Progres siswa kelas ${c.name}`}>
              {rows.map(({ s, missed, work, mastery, seen }) => (
                <Card as="li" key={s.id} className="space-y-2 p-4">
                  <div className="flex items-center gap-2">
                    <Avatar index={s.avatar} size={32} decorative />
                    <span className="min-w-0 flex-1 font-bold">{s.name}{s.level && <Badge tone="muted" className="ml-1">{s.level}</Badge>}</span>
                    {remove(s, 'justify-end')}
                  </div>
                  <dl className="grid grid-cols-3 gap-x-2 gap-y-1 text-sm">
                    <div><dt className="text-xs text-muted">XP minggu ini</dt><dd className="font-bold tabular-nums">{s.xp_week}</dd></div>
                    <div><dt className="text-xs text-muted">Pelajaran</dt><dd className="font-bold tabular-nums">{s.lessons}</dd></div>
                    <div><dt className="text-xs text-muted">Penguasaan</dt><dd className="font-bold tabular-nums">{mastery}</dd></div>
                    <div><dt className="text-xs text-muted">Beruntun</dt><dd className="font-bold tabular-nums">{s.streak}</dd></div>
                    <div><dt className="text-xs text-muted">Tugas</dt><dd className={cx('font-bold tabular-nums', missed > 0 && 'text-bad')}>{work}</dd></div>
                    <div><dt className="text-xs text-muted">Terakhir aktif</dt><dd className="font-bold">{seen}</dd></div>
                  </dl>
                </Card>
              ))}
            </ul>
            <Card className="hidden overflow-x-auto p-0 sm:block">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <caption className="sr-only">Progres siswa kelas {c.name}</caption>
                <thead className="text-xs font-bold text-muted"><tr><th className="px-4 py-2">Siswa</th><th className="px-2 py-2 text-right">XP minggu ini</th><th className="px-2 py-2 text-right">Pelajaran</th><th className="px-2 py-2 text-right">Penguasaan</th><th className="px-2 py-2 text-right">Beruntun</th><th className="px-2 py-2 text-right">Tugas</th><th className="px-2 py-2">Terakhir aktif</th><th className="px-4 py-2"><span className="sr-only">Aksi</span></th></tr></thead>
                <tbody>
                  {rows.map(({ s, missed, work, mastery, seen }) => (
                    <tr key={s.id} className="border-t border-line">
                      <td className="px-4 py-2"><span className="flex items-center gap-2"><Avatar index={s.avatar} size={28} decorative /><span className="font-bold">{s.name}</span>{s.level && <Badge tone="muted">{s.level}</Badge>}</span></td>
                      <td className="px-2 py-2 text-right tabular-nums">{s.xp_week}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{s.lessons}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{mastery}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{s.streak}</td>
                      <td className={cx('px-2 py-2 text-right tabular-nums', missed > 0 && 'font-bold text-bad')}>{work}</td>
                      <td className="px-2 py-2 text-muted">{seen}</td>
                      <td className="px-4 py-2 text-right">{remove(s, 'justify-end')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </>
        );
      })()) : (
        <div className="space-y-4">
          <Card className="space-y-3"><h3 className="font-extrabold">Tugas baru</h3><AssignForm classId={id} onDone={(m) => { setMsg(m); if (m?.tone === 'ok') void load(); }} /></Card>
          {d.assignments.length > 0 && (
            <Card className="p-0">
              <ul className="divide-y divide-line">
                {d.assignments.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center gap-2 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold"><Badge tone="brand" className="mr-1">{KIND_LABEL[a.kind]}</Badge>{a.title}</p>
                      <p className="text-sm text-muted">Tenggat {dueText(a.due_at)}{a.note ? ` · ${a.note}` : ''}</p>
                    </div>
                    <Badge tone={a.done === d.students.length && d.students.length > 0 ? 'ok' : 'muted'}>{a.done}/{d.students.length} selesai</Badge>
                    <Button size="sm" variant="ghost" aria-label={`Hapus tugas ${a.title}`} onClick={() => void act({ action: 'unassign', assignmentId: a.id })}><Trash2 size={14} aria-hidden /></Button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function Teacher() {
  const params = useSearchParams();
  const session = useSession();
  const info = useServerInfo();
  const [data, setData] = useState<TeacherOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [level, setLevel] = useState('');
  const [license, setLicense] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(Number(params.get('kelas')) || null);
  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);
  const load = () => teacherOverview().then((d) => { setData(d); setLicense((l) => l ?? d.licenses.find((x) => x.active)?.id ?? null); }, (e: Error) => setError(e.message));
  useEffect(() => { if (session) void load(); }, [session?.userId]); // eslint-disable-line react-hooks/exhaustive-deps
  const act = async (body: Record<string, unknown>, after?: (r: { message: string; id?: number }) => void) => {
    setBusy(true);
    setMsg(null);
    try {
      const r = await teacherAction<{ message: string; id?: number }>(body);
      setMsg({ tone: 'ok', text: r.message });
      after?.(r);
      await load();
    } catch (e) {
      setMsg({ tone: 'bad', text: (e as Error).message });
    }
    setBusy(false);
  };

  if (!session) {
    return (
      <div>
        <PageHeader title="Ruang Guru" subtitle="Kelola kelas, beri tugas, dan pantau progres siswa." />
        <Empty title="Masuk sebagai guru" action={info.backend === 'none' ? undefined : <LinkButton href="/masuk?next=/app/guru">Masuk</LinkButton>}>Akun guru memakai akun Lentera biasa ditambah kode lisensi dari sekolah.</Empty>
      </div>
    );
  }
  if (open) return <ClassView id={open} back={() => { setOpen(null); void load(); }} />;
  return (
    <div className="space-y-5">
      <PageHeader title="Ruang Guru" subtitle="Kelola kelas, beri tugas dengan tenggat, dan pantau progres setiap siswa." />
      {msg && <div role="status"><Notice tone={msg.tone}>{msg.text}</Notice></div>}
      {error ? <Notice tone="bad">{error}</Notice> : !data ? <Loading label="Memuat…" lines={2} /> : (
        <>
          <Card className="space-y-3">
            <h2 className="flex items-center gap-2 font-extrabold"><KeyRound size={18} className="text-brand" aria-hidden />{data.licenses.length ? 'Tambah lisensi sekolah' : 'Aktifkan akun guru'}</h2>
            <form className="flex flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); if (code.length === 8) void act({ action: 'activate', code }, () => setCode('')); }}>
              <label className="block"><span className="mb-1 block text-sm font-bold">Kode lisensi sekolah (8 karakter)</span>
                <input className={cx(inputClass, 'w-52 font-mono text-lg uppercase tracking-[0.2em]')} value={code} maxLength={8} autoComplete="off" spellCheck={false} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, '').slice(0, 8))} />
              </label>
              <Button type="submit" disabled={busy || code.length !== 8}>Aktifkan</Button>
            </form>
            {!data.licenses.length && <p className="text-sm text-muted">Kode lisensi diberikan pemilik Lentera kepada sekolah. Belum punya? <a href="/sekolah" className="font-bold text-brand underline">Lentera untuk Sekolah</a></p>}
          </Card>

          {data.licenses.length > 0 && (
            <>
              <ul className="grid gap-3 sm:grid-cols-2">
                {data.licenses.map((l) => (
                  <Card as="li" key={l.id} className="p-4">
                    <p className="font-extrabold">{l.school} {l.active ? <Badge tone="ok">Aktif</Badge> : <Badge tone="bad">Tidak aktif</Badge>}</p>
                    <p className="text-sm text-muted">Sampai {dateId(l.ends_on)} · kelas {l.classes_used}/{l.max_classes} · maks {l.seats_per_class} siswa per kelas</p>
                  </Card>
                ))}
              </ul>
              <Card className="space-y-3">
                <h2 className="font-extrabold">Buat kelas</h2>
                <form className="grid gap-3 sm:grid-cols-[1fr_8rem_auto] sm:items-end" onSubmit={(e) => { e.preventDefault(); if (name.trim() && license) void act({ action: 'create-class', licenseId: license, name, level: level || null }, (r) => { setName(''); if (r.id) setOpen(r.id); }); }}>
                  <label className="block"><span className="mb-1 block text-sm font-bold">Nama kelas</span><input className={inputClass} value={name} maxLength={80} placeholder="Kelas 8A" onChange={(e) => setName(e.target.value)} /></label>
                  <label className="block"><span className="mb-1 block text-sm font-bold">Level</span>
                    <select className={inputClass} value={level} onChange={(e) => setLevel(e.target.value)}><option value="">Campuran</option>{CEFR_ORDER.map((c) => <option key={c} value={c}>{c}</option>)}</select>
                  </label>
                  <Button type="submit" disabled={busy || !name.trim() || !license}><Plus size={16} aria-hidden />Buat</Button>
                  {data.licenses.filter((l) => l.active).length > 1 && (
                    <label className="block sm:col-span-3"><span className="mb-1 block text-sm font-bold">Lisensi</span>
                      <select className={inputClass} value={license ?? ''} onChange={(e) => setLicense(Number(e.target.value))}>{data.licenses.filter((l) => l.active).map((l) => <option key={l.id} value={l.id}>{l.school}</option>)}</select>
                    </label>
                  )}
                </form>
              </Card>
              {data.classes.length > 0 && (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {data.classes.map((c) => (
                    <Card as="li" key={c.id} className={cx('space-y-2', c.archived && 'opacity-70')}>
                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1"><p className="text-lg font-extrabold">{c.name}{c.level && <Badge className="ml-2">{c.level}</Badge>}</p><p className="text-sm text-muted">{c.school}{c.archived ? ' · diarsipkan' : ''}</p></div>
                        <span className="font-mono text-lg font-extrabold tracking-widest text-brand">{c.join_code}</span>
                      </div>
                      <p className="text-sm">{c.students} siswa · {c.open_assignments} tugas berjalan</p>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => setOpen(c.id)}>Buka kelas</Button>
                        <Button size="sm" variant="ghost" onClick={() => { void navigator.clipboard?.writeText(inviteText(c.join_code, c.name)).catch(() => {}); setMsg({ tone: 'ok', text: 'Ajakan disalin.' }); }}><Copy size={14} aria-hidden />Salin ajakan</Button>
                      </div>
                    </Card>
                  ))}
                </ul>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default function TeacherPage() {
  return <Suspense><Teacher /></Suspense>;
}
