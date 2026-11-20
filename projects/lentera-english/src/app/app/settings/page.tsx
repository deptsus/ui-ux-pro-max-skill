'use client';
import { useEffect, useState } from 'react';
import { Crown, Download, Monitor, Moon, Sun, Type, Vibrate, Volume2 } from 'lucide-react';
import { GAME } from '@/lib/engine/config';
import { setOffline, useOffline } from '@/lib/client/content';
import { getTheme, setTheme, useApp } from '@/lib/client/hooks';
import { act, resetLearner } from '@/lib/client/store';
import { api } from '@/lib/client/api';
import { signOut, useSession } from '@/lib/client/session';
import { buzz, chime, getFontScale, hapticsOn, hapticsSupported, setFontScale, setHaptics, setSound, soundOn, type FontScale } from '@/lib/client/prefs';
import { Badge, Button, Card, LinkButton, Notice, PageHeader, Segmented, inputClass, merge } from '@/components/ui';
import { ReminderSettings } from '@/components/ReminderSettings';

export default function SettingsPage() {
  const { ix, learner, premium } = useApp();
  const session = useSession();
  const offline = useOffline();
  const [deleting, setDeleting] = useState<'idle' | 'confirm' | 'busy'>('idle');
  const [deleteText, setDeleteText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteAccount = async () => {
    setDeleting('busy');
    setDeleteError(null);
    try {
      await api('/api/me', { method: 'DELETE', body: { confirm: 'HAPUS' } });
      const id = session?.userId;
      resetLearner();
      await signOut();
      if (id) localStorage.removeItem(`lentera.state.${id}`);
      window.location.href = '/?akun=dihapus';
    } catch (e) {
      setDeleteError((e as Error).message);
      setDeleting('confirm');
    }
  };
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('system');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [font, setFont] = useState<FontScale>('normal');
  const [haptics, setHapticsState] = useState<{ supported: boolean; on: boolean }>({ supported: false, on: true });
  const [sound, setSoundState] = useState(true);
  useEffect(() => {
    setThemeState(getTheme());
    setFont(getFontScale());
    setHapticsState({ supported: hapticsSupported(), on: hapticsOn() });
    setSoundState(soundOn());
  }, []);
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
        <Segmented radio full label="Tema" value={theme} onChange={pick} options={([['light', 'Terang', Sun], ['dark', 'Gelap', Moon], ['system', 'Ikuti perangkat', Monitor]] as const).map(([t, label, Icon]) => ({ value: t, label, icon: <Icon size={16} aria-hidden /> }))} />
        <h3 className="flex items-center gap-2 pt-2 font-bold" id="ukuran-huruf"><Type size={16} aria-hidden />Ukuran huruf</h3>
        <Segmented radio full labelledBy="ukuran-huruf" value={font} onChange={(f) => { setFontScale(f); setFont(f); }} options={([['normal', 'Normal'], ['large', 'Besar'], ['xlarge', 'Sangat besar']] as const).map(([f, label]) => ({ value: f, label }))} />
        <p className="text-sm text-muted">Mengubah ukuran seluruh tampilan di perangkat ini, termasuk tombol.</p>
        <h3 className="flex items-center gap-2 pt-2 font-bold" id="getaran"><Vibrate size={16} aria-hidden />Getaran saat menjawab</h3>
        {haptics.supported ? (
          <>
            <Segmented radio labelledBy="getaran" value={haptics.on ? 'on' : 'off'} onChange={(v) => { const on = v === 'on'; setHaptics(on); setHapticsState((h) => ({ ...h, on })); if (on) buzz('ok'); }} options={[{ value: 'on', label: 'Nyala' }, { value: 'off', label: 'Mati' }]} />
            <p className="text-sm text-muted">Getar singkat saat jawaban benar, dua kali saat belum tepat.</p>
          </>
        ) : <p className="text-sm text-muted">Perangkat atau browser ini tidak mendukung getaran (misalnya iPhone dan komputer). Di HP Android, getaran menyala otomatis.</p>}
        <h3 className="flex items-center gap-2 pt-2 font-bold" id="suara"><Volume2 size={16} aria-hidden />Efek suara</h3>
        <Segmented radio labelledBy="suara" value={sound ? 'on' : 'off'} onChange={(v) => { const on = v === 'on'; setSound(on); setSoundState(on); if (on) chime('ok'); }} options={[{ value: 'on', label: 'Nyala' }, { value: 'off', label: 'Mati' }]} />
        <p className="text-sm text-muted">Bunyi singkat saat jawaban benar atau belum tepat, saat kombo, dan saat sesi selesai. Mengikuti volume perangkat.</p>
      </Card>
      <Card className="space-y-3">
        <h2 className="font-extrabold">Target harian</h2>
        <p className="text-sm text-muted">Target yang realistis lebih baik daripada target tinggi yang jarang tercapai.</p>
        <Segmented radio full label="Target XP harian" className="grid grid-cols-2 sm:flex" value={String(learner.profile.dailyGoalXp)} onChange={(v) => act((d) => { d.profile.dailyGoalXp = Number(v); })} options={GAME.dailyGoalOptions.map((g, i) => ({ value: String(g), label: `${g} XP · ${['Santai', 'Rutin', 'Serius', 'Intensif'][i]}` }))} />
      </Card>
      <section id="pengingat" className="scroll-mt-24"><ReminderSettings /></section>
      <Card className="space-y-3">
        <h2 className="font-extrabold">Aksen audio</h2>
        <Segmented radio full label="Aksen" value={learner.profile.accent} onChange={(a) => act((d) => { d.profile.accent = a; })} options={[{ value: 'us' as const, label: 'Amerika' }, { value: 'uk' as const, label: 'Inggris (British)' }]} />
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
        {session && (
          <section className="space-y-2 border-t border-line pt-3" aria-labelledby="hapus-akun">
            <h3 id="hapus-akun" className="font-bold text-bad">Hapus akun</h3>
            <p className="text-sm text-muted">Menghapus akun {session.email} beserta seluruh progres, teman, dan sertifikatnya dari server. Catatan pembayaran tetap disimpan untuk pembukuan, tanpa nama dan tanpa tautan ke akunmu. <a href="/privasi" className="font-bold text-brand underline">Kebijakan privasi</a></p>
            {deleting === 'idle' ? <Button size="sm" variant="secondary" onClick={() => setDeleting('confirm')}>Hapus akun saya</Button> : (
              <form className="flex flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); if (deleteText === 'HAPUS') void deleteAccount(); }}>
                <label className="block"><span className="mb-1 block text-sm font-bold">Ketik HAPUS untuk mengonfirmasi</span>
                  <input className={merge(inputClass, 'w-40 font-mono')} value={deleteText} autoComplete="off" onChange={(e) => setDeleteText(e.target.value.toUpperCase())} />
                </label>
                <Button type="submit" size="sm" variant="danger" disabled={deleteText !== 'HAPUS' || deleting === 'busy'}>{deleting === 'busy' ? 'Menghapus...' : 'Hapus akun selamanya'}</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => { setDeleting('idle'); setDeleteText(''); }}>Batal</Button>
              </form>
            )}
            {deleteError && <Notice tone="bad">{deleteError}</Notice>}
          </section>
        )}
      </Card>
      <p className="text-center text-xs text-muted">Lentera English · konten {ix.pack.version} · seluruh mesin belajar berjalan tanpa layanan AI</p>
      <p className="-mt-3 flex justify-center gap-2 text-sm"><a href="/privasi" className="inline-flex min-h-11 items-center px-2 font-bold text-muted underline">Privasi</a><a href="/kontak" className="inline-flex min-h-11 items-center px-2 font-bold text-muted underline">Hubungi kami</a></p>
    </div>
  );
}
