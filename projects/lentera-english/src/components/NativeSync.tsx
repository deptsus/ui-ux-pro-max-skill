'use client';
// Android app 2.0 only (no-op in browsers): keeps the app's on-device
// reminders in step with the learner. The WebView has no Web Push, so the app
// schedules the daily reminder, the "streak about to break" nudge and the PR
// deadline reminders itself, from what this component tells it.
import { useEffect, useMemo, useRef } from 'react';
import { useApp } from '@/lib/client/hooks';
import { getReminderPrefs } from '@/lib/client/habits';
import { isNativeApp, setNativeDaily, setNativeHomework, setNativeStreak } from '@/lib/client/native';
import { useSession } from '@/lib/client/session';

export const NATIVE_HW_KEY = 'lentera:native-homework';
export const nativeHomeworkOn = () => {
  try { return localStorage.getItem(NATIVE_HW_KEY) !== '0'; } catch { return true; }
};
const NATIVE_HW_EVENT = 'lentera:native-homework';
export const rememberNativeHomework = (on: boolean) => {
  try { localStorage.setItem(NATIVE_HW_KEY, on ? '1' : '0'); } catch { /* private mode */ }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(NATIVE_HW_EVENT));
};

export function NativeSync() {
  const { learner, ix } = useApp(); // ix is null while the content pack loads
  const session = useSession();
  const { current, lastDate, freezes } = learner.streak;

  useEffect(() => {
    if (isNativeApp()) setNativeStreak({ current, lastDate, freezes });
  }, [current, lastDate, freezes]);

  const titles = useMemo(() => new Map((ix?.pack.homework ?? []).map((h) => [h.id, h.title])), [ix]);
  const open = Object.entries(learner.homework)
    .filter(([, r]) => !r.submissions.length && r.dueAt > Date.now())
    .map(([id, r]) => ({ id, title: titles.get(id) ?? 'PR mingguan', dueAt: r.dueAt }));
  const key = open.map((h) => `${h.id}@${h.dueAt}`).join('|');
  const latest = useRef(open);
  latest.current = open;
  useEffect(() => {
    if (isNativeApp()) setNativeHomework(open, nativeHomeworkOn());
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  // Settings changed the PR reminder switch: reschedule with the current list.
  useEffect(() => {
    const again = () => { if (isNativeApp()) setNativeHomework(latest.current, nativeHomeworkOn()); };
    window.addEventListener(NATIVE_HW_EVENT, again);
    return () => window.removeEventListener(NATIVE_HW_EVENT, again);
  }, []);

  // Once per app start: the reminder hour chosen on any device (stored on the server).
  useEffect(() => {
    if (!isNativeApp() || !session) return;
    try { if (sessionStorage.getItem('lentera:native-prefs')) return; sessionStorage.setItem('lentera:native-prefs', '1'); } catch { /* ignore */ }
    getReminderPrefs().then((p) => {
      rememberNativeHomework(p.homework);
      void setNativeDaily(p.daily_hour);
    }, () => {});
  }, [session?.userId]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
