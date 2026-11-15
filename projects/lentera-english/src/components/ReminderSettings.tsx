'use client';
// "Pengingat di HP" (Rilis 8): the daily study reminder at the learner's own
// hour, PR deadline reminders on or off, and this device's notifications.
// Devices are shared by both reminders (reminder_subscriptions); the settings
// decide what is sent (reminder_prefs).
import { useEffect, useState } from 'react';
import { AlarmClock, BellOff, BellRing } from 'lucide-react';
import { deviceTimeZone, getReminderPrefs, hourLabel, REMINDER_HOURS, saveReminderPrefs, zoneLabel, type ReminderPrefs } from '@/lib/client/habits';
import { disableReminders, enableReminders, sendTestReminder, useReminderStatus } from '@/lib/client/reminders';
import { useServerInfo, useSession } from '@/lib/client/session';
import { Button, Card, LinkButton, Notice, inputClass } from '@/components/ui';

export function ReminderSettings() {
  const session = useSession();
  const info = useServerInfo();
  const { status, refresh, setBusy } = useReminderStatus();
  const [prefs, setPrefs] = useState<ReminderPrefs | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // Feedback appears next to the control that caused it.
  const [msg, setMsg] = useState<{ tone: 'ok' | 'bad'; text: string; where: 'daily' | 'homework' | 'device' } | null>(null);
  const zone = zoneLabel(prefs?.time_zone ?? deviceTimeZone());

  useEffect(() => {
    if (!session) return;
    getReminderPrefs().then(setPrefs, (e: Error) => setLoadError(e.message));
  }, [session?.userId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!session) {
    return (
      <Card className="flex flex-wrap items-center gap-3" >
        <AlarmClock className="text-brand" aria-hidden />
        <p className="min-w-0 flex-1 text-sm">Pengingat belajar harian dan tenggat PR di HP tersedia setelah kamu masuk ke akun.</p>
        {info.backend !== 'none' && <LinkButton href="/daftar" size="sm" variant="secondary">Buat akun</LinkButton>}
      </Card>
    );
  }

  async function save(patch: Partial<Pick<ReminderPrefs, 'daily_hour' | 'homework'>>, ok: string) {
    const where = 'daily_hour' in patch ? 'daily' : 'homework';
    setSaving(true);
    setMsg(null);
    try {
      setPrefs(await saveReminderPrefs(patch));
      setMsg({ tone: 'ok', text: ok, where });
    } catch (e) {
      setMsg({ tone: 'bad', text: (e as Error).message, where });
    }
    setSaving(false);
  }
  async function device(fn: () => Promise<unknown>, ok: string) {
    setBusy();
    setMsg(null);
    try {
      await fn();
      setMsg({ tone: 'ok', text: ok, where: 'device' });
    } catch (e) {
      setMsg({ tone: 'bad', text: (e as Error).message, where: 'device' });
    }
    await refresh();
    getReminderPrefs().then(setPrefs, () => {});
  }

  const wantsSome = !!prefs && (prefs.daily_hour !== null || prefs.homework);
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 font-extrabold"><AlarmClock size={18} className="text-brand" aria-hidden />Pengingat di HP</h2>
        <p className="text-sm text-muted">Notifikasi singkat agar kebiasaan belajarmu tetap terjaga. Tidak ada iklan, tidak ada spam.</p>
      </div>

      <section className="space-y-2" aria-labelledby="pengingat-harian">
        <h3 id="pengingat-harian" className="font-bold">Pengingat belajar harian</h3>
        {loadError ? <Notice tone="bad">{loadError}</Notice> : (
          <label className="block max-w-xs">
            <span className="mb-1 block text-sm font-bold">Jam pengingat ({zone})</span>
            <select className={inputClass} value={prefs?.daily_hour ?? ''} disabled={!prefs || saving}
              onChange={(e) => {
                const h = e.target.value === '' ? null : Number(e.target.value);
                void save({ daily_hour: h }, h === null ? 'Pengingat harian dimatikan.' : `Pengingat harian diatur pukul ${hourLabel(h)} ${zone}.`);
              }}>
              <option value="">Mati</option>
              {REMINDER_HOURS.map((h) => <option key={h} value={h}>Pukul {hourLabel(h)}</option>)}
            </select>
          </label>
        )}
        {msg?.where === 'daily' && <div role="status"><Notice tone={msg.tone}>{msg.text}</Notice></div>}
        <p className="text-sm text-muted">Satu notifikasi pada jam itu, <strong>hanya di hari kamu belum belajar</strong>. Kalau beruntunmu sedang berjalan, kami sebutkan agar tidak putus.</p>
      </section>

      <section className="space-y-2" aria-labelledby="pengingat-pr">
        <h3 id="pengingat-pr" className="font-bold">Pengingat tenggat PR</h3>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="pengingat-pr">
          {([[true, 'Nyala'], [false, 'Mati']] as const).map(([on, label]) => (
            <Button key={label} role="radio" size="sm" aria-checked={prefs?.homework === on} variant={prefs?.homework === on ? 'primary' : 'secondary'} disabled={!prefs || saving}
              onClick={() => void save({ homework: on }, on ? 'Pengingat PR dinyalakan.' : 'Pengingat PR dimatikan.')}>{label}</Button>
          ))}
        </div>
        {msg?.where === 'homework' && <div role="status"><Notice tone={msg.tone}>{msg.text}</Notice></div>}
        <p className="text-sm text-muted">Sekali, sekitar sehari sebelum tenggat PR yang belum dikumpulkan (07.00–20.00 WIB).</p>
      </section>

      <section className="space-y-2 rounded-2xl bg-surface-2 p-3" aria-labelledby="notif-perangkat">
        <h3 id="notif-perangkat" className="flex items-center gap-2 font-bold">
          {status === 'on' ? <BellRing size={16} className="text-ok" aria-hidden /> : <BellOff size={16} className="text-muted" aria-hidden />}
          Notifikasi di HP ini: {status === 'on' ? 'aktif' : status === 'busy' ? 'memeriksa…' : status === 'denied' ? 'diblokir' : status === 'unsupported' ? 'tidak didukung' : 'mati'}
        </h3>
        <p className="text-sm text-muted">
          {status === 'denied' ? 'Notifikasi untuk Lentera diblokir. Izinkan di pengaturan HP atau browser, lalu muat ulang halaman ini.'
            : status === 'unsupported' ? 'Perangkat atau browser ini belum mendukung notifikasi. Di HP Android, pakai aplikasi Lentera atau Chrome.'
            : status === 'on' ? `Pengingat dikirim ke HP ini${prefs && prefs.devices > 1 ? ` dan ${prefs.devices - 1} perangkat lain` : ''}.`
            : 'Nyalakan agar pengingat bisa sampai ke HP ini.'}
        </p>
        <div className="flex flex-wrap gap-2">
          {status === 'off' && <Button size="sm" onClick={() => void device(enableReminders, 'Notifikasi aktif di perangkat ini.')}>Nyalakan notifikasi</Button>}
          {status === 'on' && <Button size="sm" variant="secondary" onClick={() => void device(async () => { const r = await sendTestReminder(); if (!r.sent) throw new Error('Pengingat uji belum terkirim. Coba matikan lalu nyalakan lagi.'); }, 'Pengingat uji dikirim. Periksa notifikasi HP-mu.')}>Kirim pengingat uji</Button>}
          {status === 'on' && <Button size="sm" variant="ghost" onClick={() => void device(disableReminders, 'Notifikasi dimatikan di perangkat ini.')}>Matikan di HP ini</Button>}
        </div>
        {msg?.where === 'device' && <div role="status"><Notice tone={msg.tone}>{msg.text}</Notice></div>}
      </section>

      {wantsSome && status === 'off' && prefs && prefs.devices === 0 && <Notice tone="accent">Pengingat sudah diatur, tapi belum ada HP yang menerima notifikasi. Tekan <strong>Nyalakan notifikasi</strong> di atas.</Notice>}
    </Card>
  );
}
