'use client';
import { useEffect, useState } from 'react';
import type { ContentIndex } from '@/lib/content/types';
import { isPremium } from '@/lib/engine/types';
import { useContent } from './content';
import { useEntitlement, useLearner } from './store';

/** Everything a page needs. Pages render only after the shell loaded content. */
export function useApp() {
  const ix = useContent() as ContentIndex;
  const learner = useLearner();
  const ent = useEntitlement();
  const now = useNow();
  return { ix, learner, ent, now, premium: isPremium(ent, now) };
}

/** Current time, refreshed every 30 s so due dates and hearts stay accurate. */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function setTheme(theme: 'light' | 'dark' | 'system') {
  localStorage.setItem('lentera.theme', theme);
  const dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
}
export const getTheme = (): 'light' | 'dark' | 'system' => (typeof localStorage === 'undefined' ? 'system' : ((localStorage.getItem('lentera.theme') as 'light' | 'dark' | 'system') ?? 'system'));
