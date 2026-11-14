// The Android app (Trusted Web Activity) and its update notice.
// No 'use client': the landing page (server) and the app shell both use it.
//
// The APK cannot tell the site its version by itself, so from 1.2.0 on it
// opens /app?apk=<versionCode> (startUrl in android/generate.cjs). Older
// installs (1.0.0, 1.1.0) open /app without it; Chrome then marks the page
// with document.referrer "android-app://id.lenteraenglish.app/", which is how
// they are recognised as an outdated app.

export const ANDROID_APP = {
  packageId: 'id.lenteraenglish.app',
  /** Must match appVersionCode / appVersion of the APK in public/download. */
  versionCode: 3,
  versionName: '1.2.0',
  url: '/download/lentera-english.apk',
} as const;

/** Installs that predate the ?apk= parameter (1.0.0 and 1.1.0). */
const UNVERSIONED = 1;

/**
 * Version of the Android app this page runs in, or null in a normal browser.
 * `stored` is what an earlier page of the same app session found.
 */
export function installedApk(search: string, referrer: string, stored: string | null): number | null {
  const fromUrl = Number(new URLSearchParams(search).get('apk'));
  if (Number.isInteger(fromUrl) && fromUrl > 0 && fromUrl < 10_000) return fromUrl;
  const remembered = Number(stored);
  if (Number.isInteger(remembered) && remembered > 0) return remembered;
  return referrer.startsWith(`android-app://${ANDROID_APP.packageId}`) ? UNVERSIONED : null;
}

/** Offer the download when the app is older than the APK on the site, unless this version was dismissed. */
export function shouldOfferUpdate(installed: number | null, dismissed: string | null, latest: number = ANDROID_APP.versionCode): boolean {
  return installed !== null && installed < latest && dismissed !== String(latest);
}
