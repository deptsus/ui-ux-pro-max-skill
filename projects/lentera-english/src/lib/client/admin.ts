'use client';
// Admin helpers used inside the learner app and the admin dashboard:
// the pending-confirmation count (badge + in-app alert) and phone
// notifications (Web Push through /admin-sw.js).
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { api } from './api';

// ───────────────────────── Pending payments ─────────────────────────

let pending: number | null = null;
/** A one-line alert shown when the count goes up while the app is open. */
let alertText: string | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => (listeners.add(l), () => void listeners.delete(l));

export async function refreshPending(): Promise<number | null> {
  try {
    const r = await api<{ pending: number }>('/api/admin', { body: { action: 'pending-count' } });
    if (pending !== null && r.pending > pending) {
      const n = r.pending - pending;
      alertText = n === 1 ? 'Ada 1 pembayaran baru menunggu konfirmasi.' : `Ada ${n} pembayaran baru menunggu konfirmasi.`;
    }
    pending = r.pending;
  } catch {
    // Offline or no longer an admin: keep the last known number.
  }
  emit();
  return pending;
}

export const dismissPendingAlert = () => {
  alertText = null;
  emit();
};

/** Polls the count while `enabled` (the account is an admin) and the page is visible. */
export function useAdminPending(enabled: boolean, intervalMs = 30_000): { pending: number | null; alert: string | null } {
  const value = useSyncExternalStore(subscribe, () => pending, () => null);
  const alert = useSyncExternalStore(subscribe, () => alertText, () => null);
  useEffect(() => {
    if (!enabled) return;
    void refreshPending();
    const tick = () => { if (document.visibilityState === 'visible') void refreshPending(); };
    const t = setInterval(tick, intervalMs);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [enabled, intervalMs]);
  return { pending: enabled ? value : null, alert: enabled ? alert : null };
}

// ───────────────────────── Phone notifications ─────────────────────────

/** The admin worker only covers /admin/, so it never touches the learner app's offline worker. */
const SW_URL = '/admin-sw.js';
const SW_SCOPE = '/admin/';

export type PushStatus = 'unsupported' | 'denied' | 'off' | 'on' | 'busy';

const supported = () => typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(padded);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

/**
 * Waits until this registration's worker is active. navigator.serviceWorker.ready
 * cannot be used: it only settles for a worker whose scope covers the current
 * page, and /admin (no trailing slash) is outside the /admin/ scope.
 */
async function activated(reg: ServiceWorkerRegistration, timeoutMs = 15_000): Promise<void> {
  if (reg.active) return;
  const worker = reg.installing ?? reg.waiting;
  if (!worker) throw new Error('Layanan notifikasi gagal dipasang. Muat ulang halaman, lalu coba lagi.');
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Layanan notifikasi terlalu lama dipasang. Coba lagi.')), timeoutMs);
    const check = () => {
      if (worker.state === 'activated') {
        clearTimeout(timer);
        resolve();
      } else if (worker.state === 'redundant') {
        clearTimeout(timer);
        reject(new Error('Layanan notifikasi gagal dipasang. Muat ulang halaman, lalu coba lagi.'));
      }
    };
    worker.addEventListener('statechange', check);
    check();
  });
}

async function currentSubscription(): Promise<PushSubscription | null> {
  const reg = await navigator.serviceWorker.getRegistration(SW_SCOPE);
  return (await reg?.pushManager.getSubscription()) ?? null;
}

/** Turns phone notifications on for this device and stores the subscription on the server. */
export async function enablePush(): Promise<void> {
  if (!supported()) throw new Error('Perangkat atau browser ini belum mendukung notifikasi.');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Izin notifikasi ditolak. Izinkan notifikasi untuk Lentera di pengaturan HP, lalu coba lagi.');
  const { publicKey } = await api<{ publicKey: string }>('/api/push');
  const reg = await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE });
  await activated(reg);
  let sub = await reg.pushManager.getSubscription();
  // A subscription made with another key cannot be used: replace it.
  const key = sub?.options.applicationServerKey;
  if (sub && key && btoa(String.fromCharCode(...new Uint8Array(key))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') !== publicKey) {
    await sub.unsubscribe();
    sub = null;
  }
  try {
    sub ??= await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) });
  } catch {
    throw new Error('HP ini belum bisa didaftarkan ke layanan notifikasi. Pastikan Google Play Services aktif dan internet tersambung, lalu coba lagi.');
  }
  await api('/api/push', { body: { action: 'subscribe', subscription: sub.toJSON() } });
}

export async function disablePush(): Promise<void> {
  if (!supported()) return;
  const sub = await currentSubscription();
  if (!sub) return;
  await api('/api/push', { body: { action: 'unsubscribe', endpoint: sub.endpoint } }).catch(() => {});
  await sub.unsubscribe();
}

export async function sendTestPush(): Promise<{ sent: number; failed: number; removed: number }> {
  return api('/api/push', { body: { action: 'test' } });
}

/** Notification status of this device, re-read after every change. */
export function usePushStatus(): { status: PushStatus; refresh: () => Promise<void>; setBusy: () => void } {
  const [status, setStatus] = useState<PushStatus>('busy');
  const mounted = useRef(true);
  const refresh = async () => {
    let next: PushStatus;
    if (!supported()) next = 'unsupported';
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
