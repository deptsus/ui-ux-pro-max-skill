'use client';
// "Pengingat PR di HP": turns homework reminders on or off for this device.
import { useState } from 'react';
import { BellOff, BellRing } from 'lucide-react';
import { disableReminders, enableReminders, sendTestReminder, useReminderStatus } from '@/lib/client/reminders';
import { useSession } from '@/lib/client/session';
import { Button, Card, LinkButton, Notice } from '@/components/ui';

export function ReminderToggle() {
  const session = useSession();
  const { status, refresh, setBusy } = useReminderStatus();
  const [msg, setMsg] = useState<{ tone: 'ok' | 'bad'; text: string } | null>(null);
  if (!session) {
    return (
      <Card className="flex flex-wrap items-center gap-3">
        <BellRing className="text-brand" aria-hidden />
        <p className="min-w-0 flex-1 text-sm">Pengingat tenggat PR di HP tersedia setelah kamu masuk ke akun.</p>
        <LinkButton href="/daftar" size="sm" variant="secondary">Buat akun</LinkButton>
      </Card>
    );
  }
  async function run(fn: () => Promise<unknown>, ok: string) {
    setBusy();
    setMsg(null);
    try {
      await fn();
      setMsg({ tone: 'ok', text: ok });
    } catch (e) {
      setMsg({ tone: 'bad', text: (e as Error).message });
    }
    await refresh();
  }
  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {status === 'on' ? <BellRing className="text-ok" aria-hidden /> : <BellOff className="text-muted" aria-hidden />}
        <div className="min-w-0 flex-1">
          <h2 className="font-extrabold">Pengingat PR di HP</h2>
          <p className="text-sm text-muted">
            {status === 'on' ? 'Aktif di perangkat ini. Kami mengingatkan sekali, sekitar sehari sebelum tenggat PR yang belum dikumpulkan (pukul 07.00–20.00 WIB).'
              : status === 'denied' ? 'Notifikasi untuk Lentera diblokir. Izinkan di pengaturan HP atau browser, lalu muat ulang halaman ini.'
              : status === 'unsupported' ? 'Perangkat atau browser ini belum mendukung notifikasi. Simpan tenggat ke kalender HP lewat tombol di Kalender PR.'
              : 'Dapatkan satu pengingat sekitar sehari sebelum tenggat PR yang belum dikumpulkan.'}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {status === 'off' && <Button size="sm" onClick={() => void run(enableReminders, 'Pengingat PR aktif di perangkat ini.')}>Nyalakan pengingat</Button>}
        {status === 'on' && <Button size="sm" variant="secondary" onClick={() => void run(async () => { const r = await sendTestReminder(); if (!r.sent) throw new Error('Pengingat uji belum terkirim. Coba matikan lalu nyalakan lagi.'); }, 'Pengingat uji dikirim. Periksa notifikasi HP-mu.')}>Kirim pengingat uji</Button>}
        {status === 'on' && <Button size="sm" variant="ghost" onClick={() => void run(disableReminders, 'Pengingat PR dimatikan di perangkat ini.')}>Matikan</Button>}
        {status === 'busy' && <Button size="sm" disabled>Memproses…</Button>}
      </div>
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
    </Card>
  );
}
