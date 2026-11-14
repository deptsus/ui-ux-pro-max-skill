# Aplikasi Android Lentera English

Aplikasi Android ini adalah **Trusted Web Activity (TWA)**: aplikasi kecil yang
membuka situs live https://lentera-english-app.netlify.app/app layar penuh,
tanpa bilah alamat. Semua isi tetap dari situs, jadi setiap deploy Netlify
langsung terlihat di aplikasi tanpa perlu membuat APK baru.

| | |
|---|---|
| Nama paket | `id.lenteraenglish.app` (permanen setelah terbit di Play Store) |
| Versi | 1.2.0 (versionCode 3): membuka `/app?apk=3` agar situs tahu versi yang terpasang (pemberitahuan update). 1.1.0 (2): notifikasi tampil sebagai notifikasi aplikasi Lentera (izin `POST_NOTIFICATIONS`). 1.0.0 (1): versi pertama. |
| Android minimum | 7.0 (API 24); target API 36 |
| Unduhan | `/download/lentera-english.apk` (tombol di halaman depan) |
| Verifikasi situs | `public/.well-known/assetlinks.json` |
| Sidik jari sertifikat (SHA-256, publik) | `74:B2:DD:32:1D:1F:DC:49:6B:C9:E0:3C:BC:B9:0B:98:DB:29:9C:E3:AD:FF:F6:4B:84:EE:7E:77:29:E9:DA:A5` |

## Notifikasi admin

Notifikasi pembayaran untuk admin dikirim lewat Web Push dari situs (`/api/push`,
`public/admin-sw.js`). Di aplikasi Android 1.1.0 ke atas, notifikasi itu tampil
sebagai notifikasi aplikasi Lentera. Admin mengaktifkannya sekali per HP di
`/admin` → panel "Notifikasi HP" → "Aktifkan notifikasi". Memasang APK baru di
atas versi lama tidak menghapus data maupun login.

## Pemberitahuan versi baru

APK yang dipasang di luar Play Store tidak diperbarui otomatis. Sebagai gantinya,
situs menampilkan ajakan "Versi baru aplikasi Lentera tersedia" (tombol
Perbarui → unduh APK) **hanya di dalam aplikasi Android yang lebih lama** dari
versi di `src/lib/android.ts`, tidak pernah di browser biasa:

- 1.2.0 ke atas membuka `/app?apk=<versionCode>`.
- 1.0.0 dan 1.1.0 tidak mengirim versi; Chrome menandai halamannya dengan
  referrer `android-app://id.lenteraenglish.app/`, sehingga tetap dikenali
  sebagai versi lama. (Bila HP memakai browser lain sebagai pembuka aplikasi,
  referrer itu bisa kosong dan ajakan tidak muncul.)
- "Nanti saja" menyembunyikan ajakan sampai ada versi yang lebih baru lagi.

Hampir semua perubahan (materi, tampilan, fitur) **tidak** butuh APK baru,
karena aplikasi membuka situs live. APK baru hanya untuk perubahan di
aplikasinya sendiri (izin, ikon, nama, layar pembuka).

### Merilis versi APK berikutnya

1. `android/generate.cjs`: naikkan `appVersionCode`, `appVersion`, dan angka di
   `startUrl: '/app?apk=N'` (N = versionCode baru).
2. `src/lib/android.ts`: samakan `versionCode` dan `versionName`.
   `tests/android.test.ts` gagal bila keduanya tidak sama.
3. Build dan tanda tangani (langkah di bawah), salin APK ke `public/download/`,
   deploy. Semua pengguna versi lama melihat ajakan Perbarui.

## Kunci tanda tangan

`lentera-upload.jks` (alias `lentera`) dan kata sandinya dipegang pemilik
produk, **tidak pernah di-commit** (`.gitignore` menolak `*.jks`, `*.keystore`,
`.storepass`). Setiap APK atau AAB baru wajib ditandatangani dengan kunci yang
sama; tanpa kunci itu, pembaruan tidak bisa dipasang di atas versi lama.

Bila nanti terbit di Play Store dengan Play App Signing, Google menandatangani
ulang aplikasi dengan kuncinya sendiri. Tambahkan sidik jari "App signing key"
dari Play Console (Setup → App integrity) ke `sha256_cert_fingerprints` di
`assetlinks.json`, di samping sidik jari di atas; tanpa itu versi Play Store
akan menampilkan bilah alamat.

## Membuat ulang APK dan AAB

Butuh JDK 17+, Android SDK (`platforms;android-36`, `build-tools;35.0.0`;
memasangnya berarti menyetujui Perjanjian Lisensi Android SDK), dan akses ke
`dl.google.com`, `maven.google.com`, `services.gradle.org`.

```bash
# di folder kerja di luar repo
npm i @bubblewrap/core
node /path/ke/repo/projects/lentera-english/android/generate.cjs ./twa-project ./lentera-upload.jks
# naikkan appVersionCode dan appVersion di generate.cjs untuk setiap rilis
cd twa-project && ANDROID_HOME=/path/ke/android-sdk ./gradlew assembleRelease bundleRelease

BT=/path/ke/android-sdk/build-tools/35.0.0
$BT/zipalign -f -p 4 app/build/outputs/apk/release/app-release-unsigned.apk aligned.apk
$BT/apksigner sign --ks lentera-upload.jks --ks-key-alias lentera --out lentera-english.apk aligned.apk
jarsigner -sigalg SHA256withRSA -digestalg SHA-256 -keystore lentera-upload.jks \
  app/build/outputs/bundle/release/app-release.aab lentera
$BT/apksigner verify --print-certs lentera-english.apk   # sidik jari harus sama dengan tabel di atas
```

Lalu salin `lentera-english.apk` ke `public/download/` dan deploy. AAB
(`app-release.aab`) adalah berkas yang diunggah ke Play Console.
