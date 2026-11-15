'use client';
// Pantau Anak (Rilis 10): a parent links to their child's account with the
// one-time code the child makes in Profil, then sees the week at a glance.
import { useEffect, useState } from 'react';
import { Award, BookOpen, CalendarCheck, ClipboardList, Flame, HeartHandshake, School, Zap } from 'lucide-react';
import { dueText, KIND_LABEL, parentAction, parentData, type Child } from '@/lib/client/classes';
import { useServerInfo, useSession } from '@/lib/client/session';
import { Avatar } from '@/components/Avatar';
import { Badge, Button, Card, Empty, LinkButton, Notice, PageHeader, cx, dateId, inputClass } from '@/components/ui';

function Stat({ icon: Icon, label, value, tone }: { icon: typeof Flame; label: string; value: string; tone?: 'bad' | 'ok' }) {
  return (
    <div className="rounded-2xl bg-surface-2 p-3">
      <p className="flex items-center gap-1.5 text-xs font-bold text-muted"><Icon size={14} aria-hidden />{label}</p>
      <p className={cx('text-lg font-extrabold', tone === 'bad' && 'text-bad', tone === 'ok' && 'text-ok')}>{value}</p>
    </div>
  );
}

function ChildCard({ c, onUnlink }: { c: Child; onUnlink: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const open = c.classes.flatMap((k) => k.assignments.filter((a) => !a.result && new Date(a.due_at) > new Date()).map((a) => ({ ...a, cls: k.name })));
  const missed = c.classes.flatMap((k) => k.assignments.filter((a) => !a.result && new Date(a.due_at) <= new Date()));
  return (
    <Card as="section" className="space-y-4">
      <div className="flex items-center gap-3">
        <Avatar index={c.avatar} size={52} decorative />
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-extrabold">{c.name}{c.level && <Badge className="ml-2">{c.level}</Badge>}</h2>
          <p className="text-sm text-muted">{c.last_active ? `Terakhir belajar ${dateId(c.last_active)}` : 'Belum ada aktivitas tercatat'}</p>
          {c.classes.length > 0 && <p className="text-sm text-muted">Kelas: {c.classes.map((k) => `${k.name} (${k.school})`).join(', ')}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat icon={CalendarCheck} label="Hari aktif minggu ini" value={`${c.days_active_week}/7`} tone={c.days_active_week >= 4 ? 'ok' : undefined} />
        <Stat icon={Flame} label="Beruntun" value={`${c.streak} hari`} />
        <Stat icon={Zap} label="XP minggu ini" value={String(c.xp_week)} />
        <Stat icon={BookOpen} label="Pelajaran minggu ini" value={`${c.lessons_week} (total ${c.lessons})`} />
        <Stat icon={ClipboardList} label="PR terbuka" value={String(c.homework.open)} />
        <Stat icon={ClipboardList} label="PR lewat tenggat" value={String(c.homework.overdue)} tone={c.homework.overdue ? 'bad' : undefined} />
        <Stat icon={School} label="Tugas guru belum selesai" value={String(open.length)} />
        <Stat icon={School} label="Tugas guru terlewat" value={String(missed.length)} tone={missed.length ? 'bad' : undefined} />
      </div>
      {open.length > 0 && (
        <div>
          <h3 className="mb-1 font-bold">Tugas dari guru</h3>
          <ul className="space-y-1 text-sm">{open.map((a) => <li key={a.id}><Badge tone="brand" className="mr-1">{KIND_LABEL[a.kind]}</Badge>{a.title} <span className="text-muted">· {a.cls} · tenggat {dueText(a.due_at)}</span></li>)}</ul>
        </div>
      )}
      {c.certificates.length > 0 && (
        <p className="flex flex-wrap items-center gap-2 text-sm"><Award size={16} className="text-accent-strong" aria-hidden />Sertifikat: {c.certificates.map((x) => <a key={x.code} href={`/sertifikat/${x.code}`} className="font-bold text-brand underline">{x.level}</a>)}</p>
      )}
      <div className="border-t border-line pt-2">
        {confirm ? <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-bold text-bad">Berhenti memantau {c.name}?</span><Button size="sm" variant="danger" onClick={onUnlink}>Ya</Button><Button size="sm" variant="ghost" onClick={() => setConfirm(false)}>Batal</Button></div>
          : <Button size="sm" variant="ghost" onClick={() => setConfirm(true)}>Putuskan tautan</Button>}
      </div>
    </Card>
  );
}

export default function ParentPage() {
  const session = useSession();
  const info = useServerInfo();
  const [children, setChildren] = useState<Child[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<{ tone: 'ok' | 'bad'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const load = () => parentData().then((d) => setChildren(d.children), (e: Error) => setError(e.message));
  useEffect(() => { if (session) void load(); }, [session?.userId]); // eslint-disable-line react-hooks/exhaustive-deps
  const act = async (body: Record<string, unknown>) => {
    setBusy(true);
    setMsg(null);
    try {
      setMsg({ tone: 'ok', text: (await parentAction(body)).message });
      setCode('');
      await load();
    } catch (e) {
      setMsg({ tone: 'bad', text: (e as Error).message });
    }
    setBusy(false);
  };

  if (!session) {
    return (
      <div>
        <PageHeader title="Pantau Anak" subtitle="Lihat kebiasaan dan progres belajar anak." />
        <Empty title="Masuk untuk memantau anak" action={info.backend === 'none' ? undefined : <LinkButton href="/daftar">Buat akun gratis</LinkButton>}>Orang tua memakai akun Lentera sendiri (gratis), lalu menghubungkannya dengan kode dari akun anak.</Empty>
      </div>
    );
  }
  return (
    <div className="space-y-5">
      <PageHeader title="Pantau Anak" subtitle="Kebiasaan dan progres belajar anak minggu ini: hari aktif, pelajaran, PR, dan tugas dari guru." />
      {msg && <div role="status"><Notice tone={msg.tone}>{msg.text}</Notice></div>}
      <Card className="space-y-3">
        <h2 className="flex items-center gap-2 font-extrabold"><HeartHandshake size={18} className="text-brand" aria-hidden />Hubungkan akun anak</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          <li>Di HP anak, buka <strong>Profil → Orang tua</strong>, lalu tekan <strong>Buat kode untuk orang tua</strong>.</li>
          <li>Masukkan kode 8 karakter itu di sini (berlaku 7 hari, sekali pakai).</li>
        </ol>
        <form className="flex flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); if (code.length === 8) void act({ action: 'link', code }); }}>
          <label className="block"><span className="mb-1 block text-sm font-bold">Kode dari anak</span>
            <input className={cx(inputClass, 'w-52 font-mono text-lg uppercase tracking-[0.2em]')} value={code} maxLength={8} autoComplete="off" spellCheck={false} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, '').slice(0, 8))} />
          </label>
          <Button type="submit" disabled={busy || code.length !== 8}>Hubungkan</Button>
        </form>
      </Card>
      {error ? <Notice tone="bad">{error}</Notice> : !children ? <Card className="text-muted"><span role="status">Memuat...</span></Card>
        : children.length === 0 ? <Card className="text-center text-muted">Belum ada akun anak yang terhubung.</Card>
        : children.map((c) => <ChildCard key={c.id} c={c} onUnlink={() => void act({ action: 'unlink', id: c.id })} />)}
      <p className="text-xs text-muted">Orang tua hanya melihat ringkasan progres, bukan jawaban latihan. Anak bisa melihat siapa yang terhubung dan memutuskannya di Profil.</p>
    </div>
  );
}
