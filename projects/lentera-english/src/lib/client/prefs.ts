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
