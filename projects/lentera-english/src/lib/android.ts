// The Android app and its update notice.
// No 'use client': the landing page (server) and the app shell both use it.
//
// 1.x was a Trusted Web Activity (needs Chrome, android/generate.cjs); 2.0 is
// the app's own WebView (android/native, no Chrome). Both share the package
// name and signing key, so 2.0 installs as an update of 1.x. The APK tells the
// site its version by opening /app?apk=<versionCode> (from 1.2.0 on). Older
// installs (1.0.0, 1.1.0) open /app without it; Chrome then marks the page
// with document.referrer "android-app://id.lenteraenglish.app/", which is how
// they are recognised as an outdated app.

export const ANDROID_APP = {
  packageId: 'id.lenteraenglish.app',
  /** Must match appVersionCode / appVersion of the APK in public/download. */
  versionCode: 5,
  versionName: '2.0.0',
  /** One line for the update notice: what the new APK brings. */
  news: 'Tidak perlu Chrome lagi: suara, pengingat, dan berbagi langsung dari aplikasinya.',
  url: '/download/lentera-english.apk',
} as const;

/**
 * Versions before this one kept the login and progress in Chrome, which the
 * 2.0 WebView cannot read: after updating from them, learners sign in again,
 * and guests lose progress that was only on the phone.
 */
export const RELOGIN_BELOW = 5;
export const needsRelogin = (installed: number | null) => installed !== null && installed < RELOGIN_BELOW;

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
