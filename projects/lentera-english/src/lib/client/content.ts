'use client';
// Loads the published curriculum. With "offline learning" on (Premium), the
// pack is kept in IndexedDB so lessons open without a connection.
import { useSyncExternalStore } from 'react';
import { indexContent, type ContentIndex, type ContentPack } from '@/lib/content/types';
import { api } from './api';

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

export async function loadContent(force = false): Promise<void> {
  if (ix && !force) return;
  const offline = offlineEnabled();
  const stored = offline ? await idbGet<Stored>('pack') : null;
  if (stored && !ix) {
    ix = indexContent(stored.pack);
    meta = { version: stored.version, tier: stored.tier };
    emit();
  }
  try {
    const q = meta ? `?v=${encodeURIComponent(meta.version)}&tier=${meta.tier}` : '';
    const res = await api<{ unchanged?: boolean; version: string; tier: string; pack?: ContentPack }>(`/api/content${q}`);
    if (!res.unchanged && res.pack) {
      ix = indexContent(res.pack);
      meta = { version: res.version, tier: res.tier };
      if (offline) await idbSet('pack', { version: res.version, tier: res.tier, pack: res.pack, savedAt: Date.now() } satisfies Stored);
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
    await idbSet('pack', null);
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
    const routes = ['/app', '/app/path', '/app/lesson', '/app/practice', '/app/review', '/app/homework', '/app/exams', '/app/vocabulary', '/app/grammar', '/app/listening', '/app/conversations', '/app/analytics', '/app/achievements', '/app/profile', '/app/settings', '/app/more'];
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
