'use client';
// Homework reminders on the learner's phone (Web Push, Rilis 4). Same keys and
// helpers as the admin notifications, but its own worker and scope, so turning
// one off never touches the other.
import { useEffect, useRef, useState } from 'react';
import { api } from './api';
import { activated, pushSupported, urlBase64ToUint8Array, type PushStatus } from './admin';

const SW_URL = '/reminder-sw.js';
const SW_SCOPE = '/app/pengingat/';

async function currentSubscription(): Promise<PushSubscription | null> {
  const reg = await navigator.serviceWorker.getRegistration(SW_SCOPE);
  return (await reg?.pushManager.getSubscription()) ?? null;
}

export async function enableReminders(): Promise<void> {
  if (!pushSupported()) throw new Error('Perangkat atau browser ini belum mendukung notifikasi.');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Izin notifikasi ditolak. Izinkan notifikasi untuk Lentera di pengaturan HP, lalu coba lagi.');
  const { publicKey } = await api<{ publicKey: string }>('/api/push');
  const reg = await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE });
  await activated(reg);
  let sub = await reg.pushManager.getSubscription();
  const key = sub?.options.applicationServerKey;
  if (sub && key && btoa(String.fromCharCode(...new Uint8Array(key))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') !== publicKey) {
    await sub.unsubscribe();
    sub = null;
  }
  try {
    sub ??= await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) });
  } catch {
    throw new Error('HP ini belum bisa didaftarkan ke layanan notifikasi. Pastikan internet tersambung, lalu coba lagi.');
  }
  await api('/api/push', { body: { action: 'subscribe-reminders', subscription: sub.toJSON() } });
}

export async function disableReminders(): Promise<void> {
  if (!pushSupported()) return;
  const sub = await currentSubscription();
  if (!sub) return;
  await api('/api/push', { body: { action: 'unsubscribe-reminders', endpoint: sub.endpoint } }).catch(() => {});
  await sub.unsubscribe();
}

export async function sendTestReminder(): Promise<{ sent: number; failed: number; removed: number }> {
  return api('/api/push', { body: { action: 'test-reminder' } });
}

export function useReminderStatus(): { status: PushStatus; refresh: () => Promise<void>; setBusy: () => void } {
  const [status, setStatus] = useState<PushStatus>('busy');
  const mounted = useRef(true);
  const refresh = async () => {
    let next: PushStatus;
    if (!pushSupported()) next = 'unsupported';
    else if (Notification.permission === 'denied') next = 'denied';
    else next = (await currentSubscription().catch(() => null)) ? 'on' : 'off';
    if (mounted.current) setStatus(next);
  };
  useEffect(() => {
    mounted.current = true;
    void refresh();
    return () => {
      mounted.current = false;
    };
  }, []);
  return { status, refresh, setBusy: () => setStatus('busy') };
}
