'use client';
// The Lentera Android app 2.0 (WebView, no Chrome). The app injects
// window.LenteraNative for this site only (WebMessageListener with an
// allowed-origin rule). Through it the site uses the phone's own speech
// engine (WebView has no speechSynthesis), on-device reminders (WebView has
// no Web Push), the share sheet, saving calendar files, and printing.
// In a normal browser none of this exists and every caller falls back.

interface NativePort { postMessage(data: string): void; addEventListener(type: 'message', fn: (e: { data: string }) => void): void }
type Msg = Record<string, unknown> & { type: string };

const port = (): NativePort | null => (typeof window === 'undefined' ? null : ((window as unknown as { LenteraNative?: NativePort }).LenteraNative ?? null));
export const isNativeApp = () => port() !== null;

const waiters: ((m: Msg) => boolean)[] = [];
let listening = false;
function listen() {
  const p = port();
  if (!p || listening) return;
  listening = true;
  p.addEventListener('message', (e) => {
    let m: Msg;
    try { m = JSON.parse(e.data) as Msg; } catch { return; }
    for (let i = waiters.length - 1; i >= 0; i--) if (waiters[i](m)) waiters.splice(i, 1);
  });
}

export function send(m: Msg): boolean {
  const p = port();
  if (!p) return false;
  listen();
  p.postMessage(JSON.stringify(m));
  return true;
}

/** Sends and waits for the first reply that `match` accepts (or null after `ms`). */
export function request(m: Msg, match: (r: Msg) => boolean, ms = 8000): Promise<Msg | null> {
  if (!port()) return Promise.resolve(null);
  listen();
  return new Promise((resolve) => {
    const t = setTimeout(() => { const i = waiters.indexOf(w); if (i >= 0) waiters.splice(i, 1); resolve(null); }, ms);
    const w = (r: Msg) => { if (!match(r)) return false; clearTimeout(t); resolve(r); return true; };
    waiters.push(w);
    send(m);
  });
}

export interface NativeInfo { version: string; versionCode: number; notifications: 'granted' | 'denied' | 'default'; speech: boolean; dailyHour: number }
export const nativeInfo = () => request({ type: 'hello' }, (r) => r.type === 'hello', 3000) as Promise<NativeInfo & Msg | null>;

let seq = 0;
/** Reads text with the phone's speech engine; resolves when done (false if it could not). */
export async function speakNative(text: string, accent: 'us' | 'uk', slow: boolean): Promise<boolean> {
  const id = `s${Date.now().toString(36)}${++seq}`;
  const r = await request({ type: 'speak', id, text, lang: accent === 'uk' ? 'en-GB' : 'en-US', slow }, (m) => m.type === 'spoken' && m.id === id, Math.max(8000, text.length * 220));
  return !!r?.ok;
}
export const stopNativeSpeech = () => send({ type: 'stop-speech' });

export const askNativeNotifications = () => request({ type: 'notify-permission' }, (r) => r.type === 'notify-permission', 60_000) as Promise<{ state: NativeInfo['notifications'] } & Msg | null>;
export const setNativeDaily = (hour: number | null) => request({ type: 'daily', hour }, (r) => r.type === 'daily');
export const setNativeStreak = (s: { current: number; lastDate: string; freezes: number }) => send({ type: 'streak', ...s });
export const setNativeHomework = (items: { id: string; title: string; dueAt: number }[], on: boolean) => send({ type: 'homework', items, on });
export const nativeShare = (title: string, text: string) => send({ type: 'share', title, text });
export const nativePrint = (title: string) => send({ type: 'print', title });

/** Saves a file through the app (a calendar file opens in the calendar app). */
export async function nativeShareFile(name: string, mime: string, content: string): Promise<boolean> {
  const bytes = new TextEncoder().encode(content);
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return send({ type: 'share-file', name, mime, base64: btoa(bin) });
}

/** window.print() does nothing inside a WebView; the app opens Android's print dialog instead (also "Save as PDF"). */
export function printPage(title: string) {
  if (!isNativeApp() || !nativePrint(title)) window.print();
}
