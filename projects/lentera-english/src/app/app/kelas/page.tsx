'use client';
// Kelas Saya (Rilis 10): join a teacher's class with a 6-character code, see
// the work the teacher gave with deadlines and your own result, and leave.
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { CheckCircle2, Clock, School, Users } from 'lucide-react';
import { assignmentHref, classAction, dueText, KIND_LABEL, myClasses, type Assignment, type MyClass } from '@/lib/client/classes';
import { useServerInfo, useSession } from '@/lib/client/session';
import { rememberInClass } from '@/components/ClassTasksCard';
import { Badge, Button, Card, Empty, LinkButton, Notice, PageHeader, cx, inputClass } from '@/components/ui';

const CHARS = /[^A-HJ-NP-Z2-9]/g;

function Status({ a }: { a: Assignment }) {
  if (a.result) return <Badge tone={a.result.late ? 'accent' : 'ok'}><CheckCircle2 size={12} aria-hidden />{a.result.score !== null ? `Selesai · ${a.result.score}` : 'Selesai'}{a.result.late ? ' · terlambat' : ''}</Badge>;
  if (new Date(a.due_at) < new Date()) return <Badge tone="bad">Lewat tenggat</Badge>;
  return <Badge tone="muted"><Clock size={12} aria-hidden />Belum</Badge>;
}

function Classes() {
  const params = useSearchParams();
  const session = useSession();
  const info = useServerInfo();
  const [classes, setClasses] = useState<MyClass[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState((params.get('kode') ?? '').toUpperCase().replace(CHARS, '').slice(0, 6));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'ok' | 'bad'; text: string } | null>(null);
  const [leaving, setLeaving] = useState<number | null>(null);

  useEffect(() => {
    if (!session) return;
    myClasses().then((r) => { setClasses(r.classes); rememberInClass(r.classes.length > 0); }, (e: Error) => setError(e.message));
  }, [session?.userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const run = async (body: Parameters<typeof classAction>[0]) => {
    setBusy(true);
    setMsg(null);
    try {
      const r = await classAction(body);
      setClasses(r.classes);
      rememberInClass(r.classes.length > 0);
      setMsg({ tone: 'ok', text: r.message });
      if (body.action === 'join') setCode('');
      setLeaving(null);
    } catch (e) {
      setMsg({ tone: 'bad', text: (e as Error).message });
    }
    setBusy(false);
  };

  if (!session) {
    return (
      <div>
        <PageHeader title="Kelas Saya" subtitle="Bergabung dengan kelas gurumu dan lihat tugas darinya." />
        <Empty title={code ? `Masuk untuk bergabung ke kelas ${code}` : 'Masuk untuk bergabung ke kelas'} action={info.backend === 'none' ? undefined : <LinkButton href="/daftar">Buat akun gratis</LinkButton>}>
          Kelas butuh akun supaya gurumu bisa melihat progresmu.{code ? ' Setelah masuk, buka lagi tautan dari gurumu.' : ''}
        </Empty>
      </div>
    );
  }

  const open = (classes ?? []).flatMap((c) => c.assignments.filter((a) => !a.result && new Date(a.due_at) > new Date()));
  return (
    <div className="space-y-5">
      <PageHeader title="Kelas Saya" subtitle="Bergabung dengan kelas gurumu dan lihat tugas darinya. Siswa di kelas sekolah berlisensi mendapat Premium selama lisensinya berlaku." />
      {msg && <div role="status"><Notice tone={msg.tone}>{msg.text}</Notice></div>}

      <Card className="space-y-3">
        <h2 className="flex items-center gap-2 font-extrabold"><Users size={18} className="text-brand" aria-hidden />Gabung ke kelas</h2>
        <form className="flex flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); if (code.length === 6) void run({ action: 'join', code }); }}>
          <label className="block">
            <span className="mb-1 block text-sm font-bold">Kode kelas dari guru (6 karakter)</span>
            <input className={cx(inputClass, 'w-44 font-mono text-xl uppercase tracking-[0.25em]')} value={code} maxLength={6} autoComplete="off" autoCapitalize="characters" spellCheck={false}
              placeholder="ABC234" onChange={(e) => setCode(e.target.value.toUpperCase().replace(CHARS, '').slice(0, 6))} />
          </label>
          <Button type="submit" disabled={busy || code.length !== 6}>Gabung</Button>
        </form>
        <p className="text-xs text-muted">Dengan bergabung, guru kelas itu bisa melihat nama, avatar, dan progres belajarmu (XP, pelajaran, nilai tugas). Kamu bisa keluar kapan saja.</p>
      </Card>

      {error ? <Notice tone="bad">{error}</Notice> : !classes ? <Card className="text-muted"><span role="status">Memuat kelas...</span></Card> : classes.length === 0 ? (
        <Card className="text-center text-muted">Belum ada kelas. Minta kode kelas ke gurumu.</Card>
      ) : (
        <>
          {open.length > 0 && <Notice tone="accent" title={`${open.length} tugas belum dikerjakan`}>Kerjakan sebelum tenggatnya, nilainya langsung terlihat oleh gurumu.</Notice>}
          {classes.map((c) => (
            <Card key={c.id} className="space-y-3" as="section">
              <div className="flex flex-wrap items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand"><School size={22} aria-hidden /></span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-extrabold">{c.name}{c.level && <Badge className="ml-2">{c.level}</Badge>}</h2>
                  <p className="text-sm text-muted">{c.school} · Guru: {c.teacher}</p>
                </div>
                {!c.active && <Badge tone="muted">Kelas ditutup</Badge>}
              </div>
              {c.assignments.length === 0 ? <p className="text-sm text-muted">Belum ada tugas.</p> : (
                <ul className="divide-y divide-line">
                  {c.assignments.map((a) => (
                    <li key={a.id} className="flex flex-wrap items-center gap-2 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold"><Badge tone="brand" className="mr-1">{KIND_LABEL[a.kind]}</Badge>{a.title}</p>
                        <p className="text-sm text-muted">Tenggat {dueText(a.due_at)}{a.note ? ` · ${a.note}` : ''}</p>
                      </div>
                      <Status a={a} />
                      {!a.result && <LinkButton size="sm" href={assignmentHref(a)}>Kerjakan</LinkButton>}
                    </li>
                  ))}
                </ul>
              )}
              <div className="border-t border-line pt-2">
                {leaving === c.id ? (
                  <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-bold text-bad">Keluar dari {c.name}?</span><Button size="sm" variant="danger" disabled={busy} onClick={() => void run({ action: 'leave', classId: c.id })}>Ya, keluar</Button><Button size="sm" variant="ghost" onClick={() => setLeaving(null)}>Batal</Button></div>
                ) : <Button size="sm" variant="ghost" onClick={() => setLeaving(c.id)}>Keluar dari kelas</Button>}
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}

export default function ClassesPage() {
  return <Suspense><Classes /></Suspense>;
}
