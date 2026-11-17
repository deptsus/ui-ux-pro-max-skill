'use client';
// Audio playback. Recordings uploaded in /admin (audio_resources) are used
// when one exists for the text being played, matched by audio key or by the
// text itself. Otherwise the device's built-in speech engine
// reads the text, and the UI says so. Nothing is sent to any service.
import { isNativeApp, speakNative, stopNativeSpeech } from './native';
import type { AudioResource, ContentIndex } from '@/lib/content/types';
import { spokenKey } from '@/lib/content/spoken';

export interface PlayOptions {
  accent: 'us' | 'uk';
  slow?: boolean;
  audioKey?: string;
}

export type AudioSource = 'recording' | 'device' | 'none';
let current: HTMLAudioElement | null = null;

// Recordings by spoken text (Rilis 6), built once per content pack.
const byText = new WeakMap<ContentIndex, Map<string, AudioResource[]>>();
function recordingsOf(ix: ContentIndex, text: string): AudioResource[] {
  let map = byText.get(ix);
  if (!map) {
    map = new Map();
    for (const a of ix.pack.audio) {
      if (!a.transcript) continue;
      const k = spokenKey(a.transcript);
      map.set(k, [...(map.get(k) ?? []), a]);
    }
    byText.set(ix, map);
  }
  return map.get(spokenKey(text)) ?? [];
}

/** The recording for this text (or audio key), in the learner's accent when there is one. */
export function recordingFor(ix: ContentIndex | null, text: string, accent: 'us' | 'uk', audioKey?: string): AudioResource | undefined {
  if (!ix?.pack.audio.length) return undefined;
  const keyed = audioKey ? ix.pack.audio.filter((a) => a.key === audioKey) : [];
  const list = keyed.length ? keyed : text ? recordingsOf(ix, text) : [];
  return list.find((a) => a.accent === accent) ?? list[0];
}

export function audioSource(ix: ContentIndex | null, audioKey?: string, text = '', accent: 'us' | 'uk' = 'us'): AudioSource {
  if (recordingFor(ix, text, accent, audioKey)) return 'recording';
  return typeof window !== 'undefined' && ('speechSynthesis' in window || isNativeApp()) ? 'device' : 'none';
}

export function stopAudio() {
  current?.pause();
  current = null;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  if (isNativeApp()) stopNativeSpeech();
}

export function play(ix: ContentIndex | null, text: string, opts: PlayOptions): Promise<AudioSource> {
  stopAudio();
  const rec = recordingFor(ix, text, opts.accent, opts.audioKey);
  if (rec) {
    return new Promise((resolve) => {
      const el = new Audio(rec.url);
      current = el;
      el.playbackRate = opts.slow ? 0.75 : 1;
      el.onended = () => resolve('recording');
      el.onerror = () => resolve('none');
      el.play().catch(() => resolve('none'));
    });
  }
  // The Android app's WebView has no speechSynthesis: the app reads aloud with
  // the phone's own text-to-speech engine instead.
  if (!('speechSynthesis' in window)) return isNativeApp() ? speakNative(text, opts.accent, !!opts.slow).then((ok) => (ok ? 'device' : 'none')) : Promise.resolve('none');
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    const lang = opts.accent === 'uk' ? 'en-GB' : 'en-US';
    u.lang = lang;
    const voice = window.speechSynthesis.getVoices().find((v) => v.lang === lang) ?? window.speechSynthesis.getVoices().find((v) => v.lang.startsWith('en'));
    if (voice) u.voice = voice;
    u.rate = opts.slow ? 0.6 : 0.95;
    const done = () => resolve('device');
    u.onend = done;
    u.onerror = done;
    // Some engines never fire "end"; never leave the UI stuck.
    setTimeout(done, Math.max(4000, text.length * 180));
    window.speechSynthesis.speak(u);
  });
}

/**
 * Can this device read Indonesian aloud (Mode SD, Rilis 16)? Browsers only: the
 * Android app 2.0.0 reads every language with an English voice (Speech.java),
 * so the button stays hidden there until an app update supports id-ID.
 */
export const canSpeakIndonesian = () => typeof window !== 'undefined' && 'speechSynthesis' in window;
/** Reads an instruction aloud in Indonesian with the device voice. */
export function speakIndonesian(text: string): Promise<boolean> {
  stopAudio();
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (!('speechSynthesis' in window)) return Promise.resolve(false);
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'id-ID';
    const voice = window.speechSynthesis.getVoices().find((v) => v.lang === 'id-ID' || v.lang === 'id_ID' || v.lang.startsWith('id'));
    if (voice) u.voice = voice;
    u.rate = 0.95;
    const done = () => resolve(true);
    u.onend = done;
    u.onerror = () => resolve(false);
    setTimeout(done, Math.max(4000, text.length * 120));
    window.speechSynthesis.speak(u);
  });
}
