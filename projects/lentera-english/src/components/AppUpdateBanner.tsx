'use client';
// "A new version of the Android app is available" notice, shown only inside
// an outdated Lentera Android app (never in a normal browser).
import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import Link from 'next/link';
import { ANDROID_APP, installedApk, needsRelogin, shouldOfferUpdate } from '@/lib/android';
import { useSession } from '@/lib/client/session';
import { playBuild } from '@/lib/client/store-build';

const SESSION_KEY = 'lentera.apk';
const DISMISS_KEY = 'lentera.apk.dismissed';

export function AppUpdateBanner() {
  const [show, setShow] = useState(false);
  const [relogin, setRelogin] = useState(false);
  const [tapped, setTapped] = useState(false);
  const session = useSession();

  useEffect(() => {
    try {
      const installed = installedApk(window.location.search, document.referrer, sessionStorage.getItem(SESSION_KEY));
      // Remember for the rest of this app session: later pages have no ?apk= or referrer.
      if (installed !== null) sessionStorage.setItem(SESSION_KEY, String(installed));
      // Play Store installs are updated by Google Play, never by downloading an APK.
      setShow(!playBuild() && shouldOfferUpdate(installed, localStorage.getItem(DISMISS_KEY)));
      setRelogin(needsRelogin(installed));
    } catch {
      setShow(false);
    }
  }, []);

  if (!show) return null;
  const later = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(ANDROID_APP.versionCode));
    } catch {
      /* storage blocked: hide for this view only */
    }
    setShow(false);
  };
  return (
    <div role="status" className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-brand bg-brand-soft p-3 text-sm">
      <Download size={20} className="shrink-0 text-brand" aria-hidden />
      <p className="min-w-0 flex-1">
        <span className="font-extrabold">Versi baru aplikasi Lentera ({ANDROID_APP.versionName}) tersedia.</span>{' '}
        {tapped
          ? relogin ? 'Buka file yang terunduh, pilih Perbarui, lalu masuk lagi dengan akunmu.' : 'Buka file yang terunduh, lalu pilih Perbarui. Login dan progresmu tetap aman.'
          : `${ANDROID_APP.news} ${relogin ? (session ? 'Setelah memperbarui, masuk sekali lagi dengan akun ini.' : 'Kamu belajar sebagai tamu: buat akun dulu agar progresmu ikut pindah, karena progres tamu hanya tersimpan di aplikasi lama.') : 'Perbarui agar fitur terbaru di HP berjalan dengan baik.'}`}
      </p>
      {relogin && !session && !tapped && <Link href="/daftar" className="rounded-full border-2 border-brand px-3 py-1 font-extrabold text-brand">Buat akun</Link>}
      <a href={ANDROID_APP.url} download onClick={() => setTapped(true)} className="rounded-full bg-brand px-3 py-1.5 font-extrabold text-on-brand">Perbarui</a>
      <button type="button" onClick={later} className="text-muted" aria-label="Nanti saja"><X size={18} aria-hidden /></button>
    </div>
  );
}
