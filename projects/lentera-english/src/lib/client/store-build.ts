'use client';
// Is this page running inside the Play Store build of the Android app? The
// app says so once (?store=play on its start URL); later pages of the same app
// session remember it. See installedStore() in src/lib/android.ts.
import { useEffect, useState } from 'react';
import { installedStore } from '@/lib/android';

const KEY = 'lentera.store';

export function playBuild(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const store = installedStore(window.location.search, sessionStorage.getItem(KEY));
    if (store) sessionStorage.setItem(KEY, store);
    return store === 'play';
  } catch {
    return false;
  }
}

export function usePlayBuild(): boolean {
  const [play, setPlay] = useState(false);
  useEffect(() => setPlay(playBuild()), []);
  return play;
}
