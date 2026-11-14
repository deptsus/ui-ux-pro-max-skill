'use client';
import { useState } from 'react';
import { Crown, LogOut, ShieldCheck } from 'lucide-react';
import { ACHIEVEMENTS, liveStreak, playerLevel } from '@/lib/engine/gamification';
import { useApp } from '@/lib/client/hooks';
import { signOut, useServerInfo, useSession } from '@/lib/client/session';
import { isAdminPlan } from '@/lib/engine/types';
import { act, syncNow, useRole, useSyncStatus } from '@/lib/client/store';
import { Badge, Button, Card, Field, LinkButton, Notice, PageHeader, cx, dateId, inputClass } from '@/components/ui';

const COLORS = ['#4b3fd6', '#f59e0b', '#15803d', '#be123c', '#0e7490', '#7c3aed', '#c2410c', '#0f766e'];

export default function ProfilePage() {
  const { ix, learner, ent, now, premium } = useApp();
  const session = useSession();
  const info = useServerInfo();
  const sync = useSyncStatus();
  const admin = useRole() === 'admin' && !!session;
  const [name, setName] = useState(learner.profile.name);
  const level = playerLevel(learner.xp);
  const done = Object.values(learner.lessons).filter((l) => l.completedAt).length;
  const mastered = Object.values(learner.topics).filter((t) => t.stage === 'mastered').length;
  const earned = ACHIEVEMENTS.filter((a) => learner.achievements[a.id]).length;
  const stats: [string, string][] = [['Total XP', learner.xp.toLocaleString('id-ID')], ['Tingkat', String(level.level)], ['Beruntun', `${liveStreak(learner.streak, now)} hari`], ['Terpanjang', `${learner.streak.longest} hari`], ['Pelajaran tuntas', `${done}/${ix.pack.lessons.length}`], ['Topik dikuasai', String(mastered)], ['Lencana', `${earned}/${ACHIEVEMENTS.length}`], ['Level penempatan', learner.profile.placementLevel ?? 'Belum tes']];

  return (
    <div className="space-y-5">
      <PageHeader title="Profil" />
      <Card className="flex flex-wrap items-center gap-4">
        <span className="grid h-20 w-20 place-items-center rounded-full text-3xl font-extrabold text-white" style={{ background: COLORS[learner.profile.avatar % COLORS.length] }} aria-hidden>{learner.profile.name.slice(0, 1).toUpperCase()}</span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-2xl font-extrabold">{learner.profile.name}</h2>
          <p className="text-sm text-muted">{session ? session.email : 'Tamu · progres hanya di perangkat ini'} · bergabung {dateId(learner.createdAt)}</p>
          <div className="mt-2 flex flex-wrap gap-2">{premium ? <Badge tone="accent"><Crown size={12} aria-hidden />{isAdminPlan(ent) ? 'Premium · Admin' : `Premium sampai ${dateId(ent.expiresAt!)}`}</Badge> : <Badge tone="muted">Paket Free</Badge>}{session && <Badge tone={sync === 'idle' ? 'ok' : sync === 'syncing' ? 'brand' : 'bad'}>{sync === 'idle' ? `Tersinkron${learner.outbox.length ? ` · ${learner.outbox.length} menunggu` : ''}` : sync === 'syncing' ? 'Menyinkronkan...' : sync === 'offline' ? 'Offline · disimpan di perangkat' : 'Sinkronisasi gagal'}</Badge>}</div>
        </div>
      </Card>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Statistik">
        {stats.map(([label, value]) => <Card key={label} className="p-4"><p className="text-xs font-bold text-muted">{label}</p><p className="mt-1 text-xl font-extrabold">{value}</p></Card>)}
      </section>

      <Card className="space-y-4">
        <h2 className="font-extrabold">Ubah profil</h2>
        <Field label="Nama tampilan" hint="Nama ini muncul di papan peringkat."><input value={name} maxLength={40} onChange={(e) => setName(e.target.value)} className={inputClass} /></Field>
        <div>
          <p className="mb-1 text-sm font-bold">Warna avatar</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Warna avatar">{COLORS.map((c, i) => <button key={c} type="button" role="radio" aria-checked={learner.profile.avatar === i} aria-label={`Warna ${i + 1}`} onClick={() => act((d) => { d.profile.avatar = i; })} className={cx('h-10 w-10 rounded-full border-4', learner.profile.avatar === i ? 'border-ink' : 'border-transparent')} style={{ background: c }} />)}</div>
        </div>
        <Button disabled={!name.trim() || name.trim() === learner.profile.name} onClick={() => { act((d) => { d.profile.name = name.trim().slice(0, 40); }); void syncNow(); }}>Simpan</Button>
      </Card>

      {admin && (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-2 border-ink"><div className="flex items-center gap-3"><ShieldCheck size={28} className="shrink-0" aria-hidden /><div><p className="font-extrabold">Kamu admin</p><p className="text-sm text-muted">Konfirmasi pembayaran, kelola materi, dan atur notifikasi HP. Semua fitur Premium aktif gratis untuk akun admin.</p></div></div><LinkButton href="/admin">Dashboard admin</LinkButton></Card>
      )}
      {session ? (
        <Card className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-extrabold">Akun</p><p className="text-sm text-muted">{session.email}</p></div><Button variant="secondary" onClick={() => void syncNow().then(signOut)}><LogOut size={16} aria-hidden />Keluar</Button></Card>
      ) : info.backend === 'none' ? (
        <Notice tone="muted" title="Mode perangkat">Server ini berjalan tanpa backend akun. Semua fitur belajar tetap berfungsi dan progres tersimpan di perangkat ini.</Notice>
      ) : (
        <Card className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-extrabold">Cadangkan progresmu</p><p className="text-sm text-muted">Buat akun agar progres tersimpan di server dan bisa dilanjutkan di perangkat lain.</p></div><div className="flex gap-2"><LinkButton href="/masuk" variant="secondary" size="sm">Masuk</LinkButton><LinkButton href="/daftar" size="sm">Daftar</LinkButton></div></Card>
      )}
    </div>
  );
}
