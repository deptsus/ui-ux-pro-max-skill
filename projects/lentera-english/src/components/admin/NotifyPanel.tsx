'use client';
// Phone notifications for this admin device: turn on, send a test, turn off.
import { useState } from 'react';
import { Bell, BellOff, BellRing } from 'lucide-react';
import { disablePush, enablePush, sendTestPush, usePushStatus } from '@/lib/client/admin';
import { Badge, Button, Card, cx } from '@/components/ui';

const LABEL = {
  on: ['Aktif di perangkat ini', 'ok'],
  off: ['Belum aktif', 'muted'],
  denied: ['Diblokir', 'bad'],
  unsupported: ['Tidak didukung', 'muted'],
  busy: ['Memeriksa...', 'muted'],
} as const;

export function NotifyPanel() {
  const { status, refresh, setBusy } = usePushStatus();
  const [message, setMessage] = useState<{ tone: 'ok' | 'bad'; text: string } | null>(null);

  const run = async (fn: () => Promise<string>) => {
    setBusy();
    setMessage(null);
    try {
      setMessage({ tone: 'ok', text: await fn() });
    } catch (e) {
      setMessage({ tone: 'bad', text: (e as Error).message });
    }
    await refresh();
  };
  const turnOn = () => run(async () => {
    await enablePush();
    const r = await sendTestPush();
    return r.sent > 0 ? 'Notifikasi aktif. Notifikasi uji baru saja dikirim ke perangkat ini.' : 'Notifikasi aktif, tetapi notifikasi uji belum terkirim. Coba tombol "Kirim uji" sebentar lagi.';
  });
  const test = () => run(async () => {
    const r = await sendTestPush();
    if (r.sent > 0) return `Notifikasi uji dikirim ke ${r.sent} perangkat.`;
    if (r.removed > 0) return 'Perangkat ini sudah tidak terdaftar. Tekan "Aktifkan notifikasi" lagi.';
    throw new Error('Notifikasi uji gagal dikirim. Coba lagi sebentar lagi.');
  });
  const turnOff = () => run(async () => {
    await disablePush();
    return 'Notifikasi dimatikan untuk perangkat ini.';
  });

  const [label, tone] = LABEL[status];
  return (
    <Card className="flex flex-wrap items-center gap-3">
      <span className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-full', status === 'on' ? 'bg-ok-soft text-ok' : 'bg-surface-2 text-muted')} aria-hidden>
        {status === 'on' ? <BellRing size={22} /> : status === 'denied' ? <BellOff size={22} /> : <Bell size={22} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 font-extrabold">Notifikasi HP <Badge tone={tone}>{label}</Badge></p>
        <p className="text-sm text-muted">
          {status === 'denied'
            ? 'Notifikasi untuk Lentera diblokir. Buka pengaturan HP → Aplikasi → Lentera (atau Chrome) → Notifikasi, izinkan, lalu muat ulang halaman ini.'
            : status === 'unsupported'
              ? 'Browser ini tidak bisa menerima notifikasi. Pakai aplikasi Android Lentera atau Chrome terbaru.'
              : 'Setiap pelajar menekan "Saya sudah bayar", HP ini berbunyi walau aplikasi sedang ditutup. Aktifkan di setiap HP admin.'}
        </p>
        {message && <p role="status" className={cx('mt-1 text-sm font-bold', message.tone === 'ok' ? 'text-ok' : 'text-bad')}>{message.text}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {status === 'on' ? (
          <>
            <Button size="sm" variant="secondary" onClick={() => void test()}>Kirim uji</Button>
            <Button size="sm" variant="ghost" onClick={() => void turnOff()}>Matikan</Button>
          </>
        ) : (
          <Button size="sm" disabled={status === 'busy' || status === 'unsupported' || status === 'denied'} onClick={() => void turnOn()}>Aktifkan notifikasi</Button>
        )}
      </div>
    </Card>
  );
}
