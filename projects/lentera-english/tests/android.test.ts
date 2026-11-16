// Android app version detection for the "update available" notice.
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ANDROID_APP, installedApk, installedStore, needsRelogin, shouldOfferUpdate } from '@/lib/android';

const TWA_REFERRER = 'android-app://id.lenteraenglish.app/';

describe('installedApk', () => {
  it('reads the version the app sends in ?apk=', () => {
    expect(installedApk('?apk=3', TWA_REFERRER, null)).toBe(3);
    expect(installedApk('?apk=7&x=1', '', null)).toBe(7);
  });
  it('treats an app that sends no version (1.0.0, 1.1.0) as outdated', () => {
    expect(installedApk('', TWA_REFERRER, null)).toBe(1);
  });
  it('remembers the version for later pages of the same app session', () => {
    expect(installedApk('', '', '3')).toBe(3);
  });
  it('is null in a normal browser and ignores junk', () => {
    expect(installedApk('', 'https://www.google.com/', null)).toBeNull();
    expect(installedApk('?apk=abc', '', null)).toBeNull();
    expect(installedApk('?apk=-2', '', 'x')).toBeNull();
    expect(installedApk('', 'android-app://com.other.app/', null)).toBeNull();
  });
});

describe('shouldOfferUpdate', () => {
  it('offers the download only to older app versions', () => {
    expect(shouldOfferUpdate(1, null, 3)).toBe(true);
    expect(shouldOfferUpdate(3, null, 3)).toBe(false);
    expect(shouldOfferUpdate(null, null, 3)).toBe(false);
  });
  it('stays hidden after "later" until an even newer version exists', () => {
    expect(shouldOfferUpdate(1, '3', 3)).toBe(false);
    expect(shouldOfferUpdate(1, '3', 4)).toBe(true);
  });
});

describe('pindah dari 1.x (Chrome) ke 2.0 (WebView sendiri)', () => {
  it('versi 1.x perlu masuk lagi setelah memperbarui; 2.0 dan browser biasa tidak', () => {
    expect(needsRelogin(1)).toBe(true);
    expect(needsRelogin(4)).toBe(true);
    expect(needsRelogin(5)).toBe(false);
    expect(needsRelogin(null)).toBe(false);
  });
});

describe('versi Play Store', () => {
  it('dikenali dari ?store=play dan diingat sepanjang sesi aplikasi', () => {
    expect(installedStore('?apk=5&store=play', null)).toBe('play');
    expect(installedStore('', 'play')).toBe('play');
    expect(installedStore('?apk=5', null)).toBeNull();
    expect(installedStore('?store=web', null)).toBeNull();
  });
  it('bundle Play membuka /app dengan store=play; APK situs tidak', () => {
    const gradle = fs.readFileSync(path.resolve(__dirname, '../android/native/app/build.gradle'), 'utf8');
    const activity = fs.readFileSync(path.resolve(__dirname, '../android/native/app/src/main/java/id/lenteraenglish/app/MainActivity.java'), 'utf8');
    expect(gradle).toContain("project.findProperty('store') ?: 'web'");
    expect(activity).toContain('"play".equals(BuildConfig.STORE) ? "&store=play" : ""');
  });
});

describe('site and APK agree on the version', () => {
  const root = path.resolve(__dirname, '../android/native');
  const gradle = fs.readFileSync(path.join(root, 'app/build.gradle'), 'utf8');
  const activity = fs.readFileSync(path.join(root, 'app/src/main/java/id/lenteraenglish/app/MainActivity.java'), 'utf8');
  it('the native app builds the version the site announces and opens /app?apk=<versionCode>', () => {
    expect(gradle).toMatch(new RegExp(`versionCode ${ANDROID_APP.versionCode}\\b`));
    expect(gradle).toContain(`versionName '${ANDROID_APP.versionName}'`);
    expect(gradle).toContain(`applicationId '${ANDROID_APP.packageId}'`);
    expect(activity).toContain('"/app?apk=" + BuildConfig.VERSION_CODE');
  });
  it('the app only talks to the site it was built for', () => {
    expect(gradle).toContain(`buildConfigField 'String', 'SITE', '"https://lentera-english-app.netlify.app"'`);
    const bridge = fs.readFileSync(path.join(root, 'app/src/main/java/id/lenteraenglish/app/Bridge.java'), 'utf8');
    expect(bridge).toMatch(/isMainFrame/);
    expect(bridge).toMatch(/"https"\.equals\(sourceOrigin\.getScheme\(\)\)/);
    const net = fs.readFileSync(path.join(root, 'app/src/main/res/xml/network_security_config.xml'), 'utf8');
    expect(net).toMatch(/cleartextTrafficPermitted="false"/);
  });
  it('the download link points at a file in public/', () => {
    expect(fs.existsSync(path.resolve(__dirname, '../public', `.${ANDROID_APP.url}`))).toBe(true);
  });
});
