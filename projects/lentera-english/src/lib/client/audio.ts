'use client';
// Audio playback. Human recordings registered in the CMS (audio_resources)
// are used when available. Otherwise the device's built-in speech engine
// reads the text, and the UI says so. Nothing is sent to any service.
import type { ContentIndex } from '@/lib/content/types';

export interface PlayOptions {
  accent: 'us' | 'uk';
  slow?: boolean;
  audioKey?: string;
}

export type AudioSource = 'recording' | 'device' | 'none';
let current: HTMLAudioElement | null = null;

export function audioSource(ix: ContentIndex | null, audioKey?: string): AudioSource {
  if (audioKey && ix?.pack.audio.some((a) => a.key === audioKey)) return 'recording';
  return typeof window !== 'undefined' && 'speechSynthesis' in window ? 'device' : 'none';
}

export function stopAudio() {
  current?.pause();
  current = null;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
}

export function play(ix: ContentIndex | null, text: string, opts: PlayOptions): Promise<AudioSource> {
  stopAudio();
  const recordings = opts.audioKey ? ix?.pack.audio.filter((a) => a.key === opts.audioKey) ?? [] : [];
  const rec = recordings.find((a) => a.accent === opts.accent) ?? recordings[0];
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
  if (!('speechSynthesis' in window)) return Promise.resolve('none');
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
