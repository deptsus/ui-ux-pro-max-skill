'use client';
// Loads the published curriculum. Every device keeps the pack it received in
// IndexedDB and starts from it; the server is only asked whether a newer
// version exists ("unchanged" costs a few bytes). The full pack is downloaded
// on first use, after a new curriculum is published, or when the tier changes
// (Free ↔ Premium). "Offline learning" (Premium) also caches the app pages.
import { useSyncExternalStore } from 'react';
import { indexContent, type ContentIndex, type ContentPack } from '@/lib/content/types';
import { packForFree } from '@/lib/content/rows';
import { api } from './api';
import { latestContentVersion } from './session';
import { premiumNow } from './store';

interface Stored { version: string; tier: string; pack: ContentPack; savedAt: number }
const OFFLINE_FLAG = 'lentera.offline';
let ix: ContentIndex | null = null;
let meta: { version: string; tier: string } | null = null;
let error: string | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => (listeners.add(l), () => void listeners.delete(l));

function idb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('lentera', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('kv');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbGet<T>(key: string): Promise<T | null> {
  try {
    const db = await idb();
    return await new Promise((resolve) => {
      const req = db.transaction('kv').objectStore('kv').get(key);
      req.onsuccess = () => resolve((req.result as T) ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}
async function idbSet(key: string, value: unknown): Promise<void> {
  try {
    const db = await idb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction('kv', 'readwrite');
      if (value === null) tx.objectStore('kv').delete(key);
      else tx.objectStore('kv').put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    /* IndexedDB unavailable (private mode): online-only */
  }
}

export const offlineEnabled = () => typeof localStorage !== 'undefined' && localStorage.getItem(OFFLINE_FLAG) === '1';

/**
 * Loads run one after another: a sign-in that turns Premium on and the app's
 * own start both ask at once, and the second then finds the pack already
 * there instead of downloading it a second time.
 */
let queue: Promise<void> = Promise.resolve();
export function loadContent(force = false): Promise<void> {
  const next = queue.then(() => loadContentNow(force));
  queue = next.catch(() => {});
  return next;
}

async function loadContentNow(force: boolean): Promise<void> {
  if (ix && !force) return;
  // A Premium pack is never shown to a device that is not Premium now (plan
  // ended, signed out, another account): it is cut down to the Free pack right
  // here, with the server's own rules, so Free lessons keep working even
  // offline; the real Free pack is then fetched. A Free pack held by a new
  // Premium learner is shown until the Premium pack arrives.
  const want = premiumNow() ? 'premium' : 'free';
  const stored = ix ? null : await idbGet<Stored>('pack');
  if (stored?.pack) {
    ix = indexContent(stored.tier === 'premium' && want === 'free' ? packForFree(stored.pack) : stored.pack);
    meta = stored.tier === want ? { version: stored.version, tier: stored.tier } : null;
    emit();
  } else if (ix && meta && meta.tier !== want) {
    if (meta.tier === 'premium') ix = indexContent(packForFree(ix.pack));
    meta = null;
    emit();
  }
  // The server already told this page its curriculum version (with /api/me):
  // when the device holds exactly that version for its tier, nothing to fetch.
  if (ix && meta && meta.tier === want && latestContentVersion() === meta.version) {
    error = null;
    emit();
    return;
  }
  try {
    const q = meta ? `?v=${encodeURIComponent(meta.version)}&tier=${meta.tier}` : '';
    const res = await api<{ unchanged?: boolean; version: string; tier: string; pack?: ContentPack }>(`/api/content${q}`);
    if (!res.unchanged && res.pack) {
      ix = indexContent(res.pack);
      meta = { version: res.version, tier: res.tier };
      await idbSet('pack', { version: res.version, tier: res.tier, pack: res.pack, savedAt: Date.now() } satisfies Stored);
    }
    error = null;
  } catch (e) {
    if (!ix) error = (e as Error).message;
  }
  emit();
}

/** Turns offline learning on or off: stores the pack and pre-caches the app. */
export async function setOffline(on: boolean, onProgress?: (msg: string) => void): Promise<void> {
  if (!on) {
    localStorage.removeItem(OFFLINE_FLAG);
    // The pack itself stays (every device keeps it); a Free pack replaces a Premium one when Premium ends.
    if ('caches' in window) await caches.delete('lentera-pages');
    // Only the offline worker: the admin notification worker (/admin-sw.js) stays.
    const regs = (await navigator.serviceWorker?.getRegistrations?.()) ?? [];
    await Promise.all(regs.filter((r) => [r.active, r.waiting, r.installing].some((w) => w?.scriptURL.endsWith('/sw.js'))).map((r) => r.unregister()));
    emit();
    return;
  }
  if (!ix || !meta) throw new Error('Konten belum dimuat.');
  onProgress?.('Menyimpan pelajaran...');
  await idbSet('pack', { version: meta.version, tier: meta.tier, pack: ix.pack, savedAt: Date.now() } satisfies Stored);
  if ('serviceWorker' in navigator && 'caches' in window) {
    await navigator.serviceWorker.register('/sw.js');
    const cache = await caches.open('lentera-pages');
    const routes = ['/app', '/app/path', '/app/plan', '/app/jalur', '/app/lesson', '/app/practice', '/app/review', '/app/homework', '/app/exams', '/app/vocabulary', '/app/pasangan', '/app/grammar', '/app/listening', '/app/stories', '/app/conversations', '/app/analytics', '/app/achievements', '/app/profile', '/app/settings', '/app/more'];
    const assets = new Set<string>();
    for (const [i, route] of routes.entries()) {
      onProgress?.(`Menyimpan halaman ${i + 1}/${routes.length}...`);
      const res = await fetch(route, { cache: 'reload' });
      if (!res.ok) continue;
      const html = await res.clone().text();
      await cache.put(route, res);
      for (const m of html.matchAll(/["'(](\/_next\/static\/[^"')\s\\]+)/g)) assets.add(m[1]);
    }
    onProgress?.('Menyimpan berkas aplikasi...');
    await Promise.all([...assets].map((a) => cache.add(a).catch(() => undefined)));
  }
  localStorage.setItem(OFFLINE_FLAG, '1');
  emit();
}

export const useContent = (): ContentIndex | null => useSyncExternalStore(subscribe, () => ix, () => null);
export const useContentError = (): string | null => useSyncExternalStore(subscribe, () => error, () => null);
export const useOffline = (): boolean => useSyncExternalStore(subscribe, offlineEnabled, () => false);
export const getContent = () => ix;
