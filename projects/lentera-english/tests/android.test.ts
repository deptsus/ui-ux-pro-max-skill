// Android app version detection for the "update available" notice.
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ANDROID_APP, installedApk, shouldOfferUpdate } from '@/lib/android';

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

describe('site and APK agree on the version', () => {
  const generator = fs.readFileSync(path.resolve(__dirname, '../android/generate.cjs'), 'utf8');
  it('generate.cjs builds the version the site announces', () => {
    expect(generator).toMatch(new RegExp(`appVersionCode: ${ANDROID_APP.versionCode},`));
    expect(generator).toMatch(new RegExp(`appVersion: '${ANDROID_APP.versionName.replace(/\./g, '\\.')}',`));
    expect(generator).toMatch(new RegExp(`startUrl: '/app\\?apk=${ANDROID_APP.versionCode}',`));
    expect(generator).toContain(`packageId: '${ANDROID_APP.packageId}'`);
  });
  it('the download link points at a file in public/', () => {
    expect(fs.existsSync(path.resolve(__dirname, '../public', `.${ANDROID_APP.url}`))).toBe(true);
  });
});
