'use client';
import { useEffect, useState } from 'react';
import { Crown, Download, Monitor, Moon, Sun } from 'lucide-react';
import { GAME } from '@/lib/engine/config';
import { setOffline, useOffline } from '@/lib/client/content';
import { getTheme, setTheme, useApp } from '@/lib/client/hooks';
import { act, resetLearner } from '@/lib/client/store';
import { Badge, Button, Card, LinkButton, Notice, PageHeader } from '@/components/ui';

export default function SettingsPage() {
  const { ix, learner, premium } = useApp();
  const offline = useOffline();
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('system');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  useEffect(() => setThemeState(getTheme()), []);
  const pick = (t: 'light' | 'dark' | 'system') => { setTheme(t); setThemeState(t); };
  const toggleOffline = async (on: boolean) => {
    setError(null);
    setBusy('Menyiapkan...');
    try { await setOffline(on, setBusy); } catch (e) { setError((e as Error).message); }
    setBusy(null);
  };
  // Premium ended: offline copies are removed with it.
  useEffect(() => { if (offline && !premium) void setOffline(false); }, [offline, premium]);

  return (
    <div className="space-y-5">
      <PageHeader title="Pengaturan" />
      <Card className="space-y-3">
        <h2 className="font-extrabold">Tampilan</h2>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tema">
          {([['light', 'Terang', Sun], ['dark', 'Gelap', Moon], ['system', 'Ikuti perangkat', Monitor]] as const).map(([t, label, Icon]) => <Button key={t} role="radio" aria-checked={theme === t} variant={theme === t ? 'primary' : 'secondary'} size="sm" onClick={() => pick(t)}><Icon size={16} aria-hidden />{label}</Button>)}
        </div>
      </Card>
      <Card className="space-y-3">
        <h2 className="font-extrabold">Target harian</h2>
        <p className="text-sm text-muted">Target yang realistis lebih baik daripada target tinggi yang jarang tercapai.</p>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Target XP harian">
          {GAME.dailyGoalOptions.map((g, i) => <Button key={g} role="radio" aria-checked={learner.profile.dailyGoalXp === g} variant={learner.profile.dailyGoalXp === g ? 'primary' : 'secondary'} size="sm" onClick={() => act((d) => { d.profile.dailyGoalXp = g; })}>{g} XP · {['Santai', 'Rutin', 'Serius', 'Intensif'][i]}</Button>)}
        </div>
      </Card>
      <Card className="space-y-3">
        <h2 className="font-extrabold">Aksen audio</h2>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Aksen">
          {(['us', 'uk'] as const).map((a) => <Button key={a} role="radio" aria-checked={learner.profile.accent === a} variant={learner.profile.accent === a ? 'primary' : 'secondary'} size="sm" onClick={() => act((d) => { d.profile.accent = a; })}>{a === 'us' ? 'Amerika' : 'Inggris (British)'}</Button>)}
        </div>
      </Card>
      <Card className="space-y-3">
        <h2 className="flex items-center gap-2 font-extrabold"><Download size={18} aria-hidden />Belajar offline {premium ? <Badge tone="accent"><Crown size={12} aria-hidden />Premium</Badge> : <Badge tone="muted">Premium</Badge>}</h2>
        <p className="text-sm text-muted">Mengunduh {ix.pack.lessons.filter((l) => !l.locked).length} pelajaran, kosakata, dan halaman aplikasi ke perangkat ini. Progres yang dibuat saat offline dikirim ke server ketika tersambung lagi. Pembayaran, papan peringkat, dan sinkronisasi tetap butuh internet.</p>
        {!premium ? <LinkButton href="/app/subscription" variant="accent" size="sm">Buka dengan Premium</LinkButton> : offline ? <><Notice tone="ok" title="Pelajaran tersimpan di perangkat ini">Versi konten {ix.pack.version}.</Notice><div className="flex flex-wrap gap-2"><Button size="sm" variant="secondary" disabled={!!busy} onClick={() => toggleOffline(true)}>Perbarui unduhan</Button><Button size="sm" variant="ghost" disabled={!!busy} onClick={() => toggleOffline(false)}>Hapus unduhan</Button></div></> : <Button disabled={!!busy} onClick={() => toggleOffline(true)}>Unduh untuk offline</Button>}
        {busy && <p className="text-sm font-bold text-brand" role="status">{busy}</p>}
        {error && <p className="text-sm text-bad">{error}</p>}
      </Card>
      <Card className="space-y-3">
        <h2 className="font-extrabold">Data belajar</h2>
        <p className="text-sm text-muted">Menghapus progres di perangkat ini: XP, beruntun, penguasaan topik, dan jadwal ulangan. Langganan tidak terpengaruh.</p>
        {confirm ? <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-bold text-bad">Yakin? Tindakan ini tidak bisa dibatalkan.</span><Button size="sm" variant="danger" onClick={() => { resetLearner(); setConfirm(false); }}>Ya, hapus progres</Button><Button size="sm" variant="secondary" onClick={() => setConfirm(false)}>Batal</Button></div> : <Button size="sm" variant="secondary" onClick={() => setConfirm(true)}>Mulai dari nol</Button>}
      </Card>
      <p className="text-center text-xs text-muted">Lentera English · konten {ix.pack.version} · seluruh mesin belajar berjalan tanpa layanan AI.</p>
    </div>
  );
}
