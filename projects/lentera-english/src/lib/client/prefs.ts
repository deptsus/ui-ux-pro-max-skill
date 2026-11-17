'use client';
// Per-device preferences (Rilis 6): text size and vibration feedback. Kept in
// localStorage like the theme, applied before the first paint by the script
// in app/layout.tsx so the page never jumps.
export type FontScale = 'normal' | 'large' | 'xlarge';
export const FONT_KEY = 'lentera.fontScale';
export const HAPTICS_KEY = 'lentera.haptics';
const FONT_CLASS: Record<FontScale, string> = { normal: '', large: 'fs-lg', xlarge: 'fs-xl' };

export function getFontScale(): FontScale {
  if (typeof localStorage === 'undefined') return 'normal';
  const v = localStorage.getItem(FONT_KEY);
  return v === 'large' || v === 'xlarge' ? v : 'normal';
}
export function setFontScale(scale: FontScale) {
  localStorage.setItem(FONT_KEY, scale);
  const el = document.documentElement;
  el.classList.remove('fs-lg', 'fs-xl');
  if (FONT_CLASS[scale]) el.classList.add(FONT_CLASS[scale]);
}

/**
 * Mode SD (Rilis 16): for primary-school learners the text is larger by default
 * (unless a size was chosen in Settings). Remembered per device so the script
 * in app/layout.tsx can apply it before the first paint.
 */
export const SD_KEY = 'lentera.sdMode';
export function applySdMode(on: boolean) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(SD_KEY, on ? '1' : '0');
  const el = document.documentElement;
  el.classList.toggle('sd-mode', on);
  if (localStorage.getItem(FONT_KEY)) return;
  el.classList.toggle('fs-lg', on);
}

/** Android phones (and the Android app) can vibrate; iPhones and most desktops cannot. */
export const hapticsSupported = () => typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
export const hapticsOn = () => typeof localStorage !== 'undefined' && localStorage.getItem(HAPTICS_KEY) !== '0';
export const setHaptics = (on: boolean) => localStorage.setItem(HAPTICS_KEY, on ? '1' : '0');

/** A short tap when right, a double tap when wrong. Does nothing when off or unsupported. */
export function buzz(kind: 'ok' | 'bad') {
  if (!hapticsSupported() || !hapticsOn()) return;
  try {
    navigator.vibrate(kind === 'ok' ? 18 : [35, 60, 35]);
  } catch {
    // Some browsers throw when the page has not been interacted with yet.
  }
}

// Sound effects (Rilis 14): short tones made on the device with WebAudio (no audio files),
// on by default and switchable in Pengaturan.
export const SOUND_KEY = 'lentera.sound';
export const soundOn = () => typeof localStorage !== 'undefined' && localStorage.getItem(SOUND_KEY) !== '0';
export const setSound = (on: boolean) => localStorage.setItem(SOUND_KEY, on ? '1' : '0');

let audio: AudioContext | null = null;
const TUNES: Record<'ok' | 'bad' | 'combo' | 'done', { wave: OscillatorType; notes: [number, number][]; len: number }> = {
  ok: { wave: 'sine', notes: [[660, 0], [990, 0.09]], len: 0.22 },
  bad: { wave: 'triangle', notes: [[262, 0], [196, 0.13]], len: 0.26 },
  combo: { wave: 'sine', notes: [[784, 0], [988, 0.07], [1175, 0.14], [1568, 0.21]], len: 0.2 },
  done: { wave: 'sine', notes: [[523, 0], [659, 0.11], [784, 0.22], [1047, 0.34]], len: 0.42 },
};

/** Plays a short tune. Silent when switched off, unsupported, or before the first tap. */
export function chime(kind: keyof typeof TUNES) {
  if (!soundOn() || typeof window === 'undefined') return;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  try {
    audio ??= new AC();
    if (audio.state === 'suspended') void audio.resume();
    const { wave, notes, len } = TUNES[kind];
    for (const [freq, delay] of notes) {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      const at = audio.currentTime + delay;
      osc.type = wave;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.16, at + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + len);
      osc.connect(gain).connect(audio.destination);
      osc.start(at);
      osc.stop(at + len + 0.05);
    }
  } catch {
    // Audio is a nicety; never let it break a session.
  }
}
