'use client';
import { useEffect, useRef, useState } from 'react';
import { Check, Crown, LogOut, ShieldCheck } from 'lucide-react';
import { ACHIEVEMENTS, liveStreak, playerLevel } from '@/lib/engine/gamification';
import { useApp } from '@/lib/client/hooks';
import { signOut, useServerInfo, useSession } from '@/lib/client/session';
import { isAdminPlan } from '@/lib/engine/types';
import { act, pushProfile, syncNow, useRole, useSyncStatus } from '@/lib/client/store';
import { AVATARS, Avatar } from '@/components/Avatar';
import { Badge, Button, Card, Field, LinkButton, Notice, PageHeader, StatRow, cx, dateId, inputClass } from '@/components/ui';
import { ParentLinkCard } from '@/components/ParentLinkCard';
import { SchoolLevelPicker, chooseSchoolLevel } from '@/components/school/SchoolLevel';

export default function ProfilePage() {
  const { ix, learner, ent, now, premium } = useApp();
  const session = useSession();
  const info = useServerInfo();
  const sync = useSyncStatus();
  const admin = useRole() === 'admin' && !!session;
  // Name and avatar are a draft until "Simpan"; either change enables it.
  const [name, setName] = useState(learner.profile.name);
  const [avatar, setAvatar] = useState(learner.profile.avatar);
  const [saved, setSaved] = useState(false);
  const edited = useRef(false);
  // Follow the saved profile (e.g. after sync from another device) until the learner starts editing.
  useEffect(() => {
    if (edited.current) return;
    setName(learner.profile.name);
    setAvatar(learner.profile.avatar);
  }, [learner.profile.name, learner.profile.avatar]);
  const cleanName = name.trim().slice(0, 40);
  const nameChanged = !!cleanName && cleanName !== learner.profile.name;
  const avatarChanged = avatar !== learner.profile.avatar;
  const dirty = nameChanged || avatarChanged;
  const save = () => {
    act((d) => {
      if (nameChanged) d.profile.name = cleanName;
      d.profile.avatar = avatar;
    });
    edited.current = false;
    setSaved(true);
    void syncNow();
    void pushProfile({ display_name: nameChanged ? cleanName : learner.profile.name, avatar });
  };
  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 4000);
    return () => clearTimeout(t);
  }, [saved]);
  const level = playerLevel(learner.xp);
  const done = Object.values(learner.lessons).filter((l) => l.completedAt).length;
  const mastered = Object.values(learner.topics).filter((t) => t.stage === 'mastered').length;
  const earned = ACHIEVEMENTS.filter((a) => learner.achievements[a.id]).length;
  const stats: [string, string][] = [['Total XP', learner.xp.toLocaleString('id-ID')], ['Tingkat', String(level.level)], ['Beruntun', `${liveStreak(learner.streak, now)} hari`], ['Terpanjang', `${learner.streak.longest} hari`], ['Pelajaran tuntas', `${done}/${ix.pack.lessons.length}`], ['Topik dikuasai', String(mastered)], ['Lencana', `${earned}/${ACHIEVEMENTS.length}`], ['Level penempatan', learner.profile.placementLevel ?? 'Belum tes']];

  return (
    <div className="space-y-5">
      <PageHeader title="Profil" />
      <Card className="flex flex-wrap items-center gap-4">
        <Avatar index={learner.profile.avatar} size={72} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-2xl font-extrabold">{learner.profile.name}</h2>
          <p className="text-sm text-muted">{session ? <span className="break-all">{session.email}</span> : 'Tamu · progres hanya di perangkat ini'} · bergabung {dateId(learner.createdAt)}</p>
          <div className="mt-2 flex flex-wrap gap-2">{premium ? <Badge tone="accent"><Crown size={12} aria-hidden />{isAdminPlan(ent) ? 'Premium · Admin' : `Premium sampai ${dateId(ent.expiresAt!)}`}</Badge> : <Badge tone="muted">Paket Free</Badge>}{session && <Badge tone={sync === 'idle' ? 'ok' : sync === 'syncing' ? 'brand' : 'bad'}>{sync === 'idle' ? `Tersinkron${learner.outbox.length ? ` · ${learner.outbox.length} menunggu` : ''}` : sync === 'syncing' ? 'Menyinkronkan...' : sync === 'offline' ? 'Offline · disimpan di perangkat' : 'Sinkronisasi gagal'}</Badge>}</div>
        </div>
      </Card>

      <section aria-label="Statistik"><StatRow items={stats.map(([label, value]) => ({ label, value }))} /></section>

      <Card className="space-y-3" as="section">
        <h2 className="text-lg font-extrabold">Jenjang sekolah</h2>
        <p className="text-sm text-muted">Pilih jenjangmu agar Lentera menyarankan Jalur Sekolah yang sesuai.</p>
        <SchoolLevelPicker value={learner.profile.schoolLevel} onPick={chooseSchoolLevel} />
        {learner.profile.schoolLevel === 'sd' && <Notice tone="accent" title="Mode SD aktif">Huruf lebih besar, petunjuk soal bisa dibacakan (tombol "Bacakan"), nama tidak tampil di liga umum kecuali bagi teman, dan pembelian Premium perlu dibuka orang tua.</Notice>}
        {learner.profile.schoolLevel && learner.profile.schoolLevel !== 'umum' && <LinkButton href={`/app/jalur#${learner.profile.schoolLevel}`} variant="secondary" size="sm">Buka Jalur {learner.profile.schoolLevel.toUpperCase()}</LinkButton>}
      </Card>
      <Card className="space-y-4">
        <h2 className="font-extrabold">Ubah profil</h2>
        <Field label="Nama tampilan" hint="Nama ini muncul di papan peringkat."><input value={name} maxLength={40} onChange={(e) => { edited.current = true; setSaved(false); setName(e.target.value); }} className={inputClass} /></Field>
        {!cleanName && <p className="-mt-2 text-sm text-bad" role="alert">Nama tampilan tidak boleh kosong.</p>}
        <fieldset>
          <legend className="mb-2 text-sm font-bold">Avatar: <span className="font-extrabold text-brand">{AVATARS[avatar % AVATARS.length]?.name}</span></legend>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8" role="radiogroup" aria-label="Avatar">
            {AVATARS.map((a, i) => (
              <button key={a.id} type="button" role="radio" aria-checked={avatar === i} aria-label={`${a.name}, ${a.label}`} title={a.name}
                onClick={() => { edited.current = true; setSaved(false); setAvatar(i); }}
                className={cx('relative grid place-items-center rounded-full p-1 transition', avatar === i ? 'bg-brand ring-2 ring-brand ring-offset-2 ring-offset-surface' : 'hover:bg-surface-2')}>
                <Avatar index={i} size={56} decorative />
                {avatar === i && <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-brand text-on-brand" aria-hidden><Check size={12} strokeWidth={3} /></span>}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-wrap items-center gap-2">
          <Button disabled={!dirty || !cleanName} onClick={save}>Simpan perubahan</Button>
          {dirty && <Button variant="ghost" onClick={() => { edited.current = false; setName(learner.profile.name); setAvatar(learner.profile.avatar); }}>Batal</Button>}
          <span role="status" className="text-sm font-bold text-ok">{saved && !dirty ? 'Profil tersimpan.' : ''}</span>
        </div>
      </Card>

      {admin && (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-ink/30"><div className="flex items-center gap-3"><ShieldCheck size={28} className="shrink-0" aria-hidden /><div><p className="font-extrabold">Kamu admin</p><p className="text-sm text-muted">Konfirmasi pembayaran, kelola materi, dan atur notifikasi HP. Semua fitur Premium aktif gratis untuk akun admin.</p></div></div><LinkButton href="/admin">Dashboard admin</LinkButton></Card>
      )}
      <ParentLinkCard />
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
