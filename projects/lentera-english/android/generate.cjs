// Generates the Android (Trusted Web Activity) project for the live Lentera site.
// Usage: see android/README.md. Needs @bubblewrap/core installed outside this repo.
const { TwaManifest, TwaGenerator, ConsoleLog } = require('@bubblewrap/core');
const path = require('path');
const fs = require('fs');
const HOST = 'lentera-english-app.netlify.app';
const out = process.argv[2];
(async () => {
  const twa = new TwaManifest({
    packageId: 'id.lenteraenglish.app',
    host: HOST,
    name: 'Lentera English',
    launcherName: 'Lentera',
    display: 'standalone',
    themeColor: '#4b3fd6',
    navigationColor: '#f6f5fb',
    navigationColorDark: '#121022',
    themeColorDark: '#121022',
    backgroundColor: '#f6f5fb',
    enableNotifications: false,
    startUrl: '/app',
    iconUrl: `https://${HOST}/icon-512.png`,
    maskableIconUrl: `https://${HOST}/icon-maskable-512.png`,
    splashScreenFadeOutDuration: 300,
    signingKey: { path: path.resolve(process.argv[3]), alias: 'lentera' },
    appVersionCode: 1,
    appVersion: '1.0.0',
    webManifestUrl: `https://${HOST}/manifest.webmanifest`,
    fallbackType: 'customtabs',
    enableSiteSettingsShortcut: true,
    minSdkVersion: 24,
    orientation: 'default',
    generatorApp: 'bubblewrap-core',
  });
  const v = twa.validate();
  if (v) throw new Error('invalid TWA manifest: ' + v);
  fs.mkdirSync(out, { recursive: true });
  await new TwaGenerator().createTwaProject(out, twa, new ConsoleLog('twa'));
  fs.writeFileSync(path.join(out, 'twa-manifest.json'), JSON.stringify(twa.toJson(), null, 2));
  console.log('generated', out);
})().catch((e) => { console.error(e); process.exit(1); });
