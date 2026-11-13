'use client';
import { api } from '@/lib/client/api';

/** Calls the single admin endpoint. The server re-checks the admin role on every action. */
export const admin = <T,>(action: string, extra: Record<string, unknown> = {}) => api<T>('/api/admin', { body: { action, ...extra } });

// Remembers, on this browser, that something was saved after the last publish.
const KEY = 'lentera.admin.unpublished';
const listeners = new Set<() => void>();
export const unpublished = {
  get: () => (typeof localStorage === 'undefined' ? false : localStorage.getItem(KEY) === '1'),
  set(value: boolean) {
    if (value) localStorage.setItem(KEY, '1');
    else localStorage.removeItem(KEY);
    listeners.forEach((l) => l());
  },
  subscribe: (l: () => void) => (listeners.add(l), () => void listeners.delete(l)),
};
