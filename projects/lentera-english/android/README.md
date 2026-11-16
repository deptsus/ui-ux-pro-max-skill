# Aplikasi Android Lentera English

Sejak **2.0.0** aplikasi Android adalah aplikasi **WebView sendiri**
(`android/native/`, Java, tanpa pustaka pihak ketiga selain AndroidX). Aplikasi
ini membuka situs live https://lentera-english-app.netlify.app/app layar penuh
dan **tidak membutuhkan Chrome**, jadi juga jalan di HP yang Chrome-nya mati,
lama, atau diganti browser lain. Semua isi tetap dari situs: setiap deploy
Netlify langsung terlihat di aplikasi tanpa APK baru.

Versi 1.x adalah Trusted Web Activity (TWA) yang menumpang Chrome
(`android/generate.cjs`, dibuat dengan Bubblewrap). Generatornya disimpan
sebagai arsip; APK 1.3.0 tetap bisa diunduh di
`/download/lentera-english-1.3.0.apk` sebagai cadangan.

| | |
|---|---|
| Nama paket | `id.lenteraenglish.app` (sama dengan 1.x, permanen setelah terbit di Play Store) |
| Versi | **2.0.0 (versionCode 5)**: WebView sendiri, tanpa Chrome; suara dari mesin suara HP; pengingat dijadwalkan di HP (tetap berbunyi tanpa internet); lembar berbagi, simpan berkas kalender, dan cetak/PDF dari Android. 1.3.0 (4): ikon lentera. 1.2.0 (3): membuka `/app?apk=3`. 1.1.0 (2): notifikasi aplikasi. 1.0.0 (1): versi pertama. |
| Android minimum | 7.0 (API 24); target API 36 |
| Ukuran APK | ±250 KB (1.3.0: ±2 MB) |
| Unduhan | `/download/lentera-english.apk` (tombol di halaman depan) |
| Sidik jari sertifikat (SHA-256, publik) | `74:B2:DD:32:1D:1F:DC:49:6B:C9:E0:3C:BC:B9:0B:98:DB:29:9C:E3:AD:FF:F6:4B:84:EE:7E:77:29:E9:DA:A5` |

## Pindah dari 1.x ke 2.0

APK 2.0 memakai nama paket dan kunci yang sama, jadi terpasang sebagai
**pembaruan** di atas 1.x. Satu hal berbeda: login dan progres tamu di 1.x
tersimpan di Chrome, yang tidak bisa dibaca WebView aplikasi 2.0. Karena itu:

- Pengguna berakun cukup **masuk sekali lagi**; progresnya ada di server.
- Tamu (tanpa akun) kehilangan progres yang hanya ada di HP. Ajakan
  memperbarui di aplikasi lama meminta tamu **membuat akun dulu** (tombol
  "Buat akun") agar progresnya tersinkron sebelum memperbarui.

Teksnya diatur `needsRelogin()` di `src/lib/android.ts` dan
`src/components/AppUpdateBanner.tsx`.

## Yang dikerjakan aplikasi untuk situs

WebView tidak punya `speechSynthesis`, Web Push, `navigator.share`, maupun
`window.print`. Aplikasi menggantinya lewat `window.LenteraNative`
(`WebViewCompat.addWebMessageListener`), yang **hanya** diberikan ke halaman
utama situs Lentera lewat HTTPS (aturan asal di WebView, diperiksa lagi di
`Bridge.java`). Pesan berupa JSON kecil dengan `type`:

| `type` | Fungsi | Di situs |
|---|---|---|
| `hello` | versi aplikasi, status izin notifikasi | `nativeInfo()` |
| `speak`, `stop-speech` | membacakan teks dengan TextToSpeech HP | `src/lib/client/audio.ts` |
| `notify-permission` | minta izin notifikasi; bila sudah ditolak permanen, membuka pengaturan notifikasi aplikasi | `ReminderSettings` |
| `daily`, `streak`, `homework` | menjadwalkan pengingat harian, pengingat beruntun, dan pengingat PR dengan AlarmManager (dijadwalkan ulang setelah HP dinyalakan) | `ReminderSettings`, `NativeSync` |
| `share`, `share-file` | lembar berbagi Android; berkas (`.ics` tenggat PR, rekap CSV kelas) lewat FileProvider | `Friends`, `HomeworkCalendar`, Ruang Guru |
| `print` | dialog cetak Android (termasuk "Simpan sebagai PDF") | sertifikat, bukti bayar |

Di browser biasa `window.LenteraNative` tidak ada dan semua pemanggil kembali
ke cara web. `e2e/native.mjs` menguji sisi situs dengan jembatan tiruan.

Notifikasi **admin** (pembayaran masuk, error baru) tetap Web Push dari situs.
WebView tidak menerimanya, jadi admin mengaktifkannya sekali di Chrome
(`/admin` → "Notifikasi HP"); panel itu menjelaskannya bila dibuka di aplikasi.

Keamanan aplikasi: hanya HTTPS (`network_security_config.xml`, sertifikat
sistem), tautan ke situs lain dibuka di browser, tidak ada akses berkas di
WebView, cadangan Android dimatikan (`allowBackup=false`), dan izin mikrofon
hanya diberikan ke situs Lentera setelah pengguna mengizinkan.

## Pemberitahuan versi baru

APK di luar Play Store tidak diperbarui otomatis. Situs menampilkan ajakan
"Versi baru aplikasi Lentera tersedia" **hanya di dalam aplikasi Android yang
lebih lama** dari versi di `src/lib/android.ts`, tidak pernah di browser biasa:

- 1.2.0 ke atas (termasuk 2.0) membuka `/app?apk=<versionCode>`.
- 1.0.0 dan 1.1.0 dikenali dari referrer `android-app://id.lenteraenglish.app/`.
- "Nanti saja" menyembunyikan ajakan sampai ada versi yang lebih baru lagi.

Hampir semua perubahan **tidak** butuh APK baru. APK baru hanya untuk
perubahan di aplikasinya sendiri (izin, ikon, nama, jembatan).

### Merilis versi APK berikutnya

1. `android/native/app/build.gradle`: naikkan `versionCode` dan `versionName`.
2. `src/lib/android.ts`: samakan `versionCode`, `versionName`, dan tulis `news`.
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

## Membuat ulang APK

Butuh JDK 17+, Android SDK (`platforms;android-36`, `build-tools;35.0.0`;
memasangnya berarti menyetujui Perjanjian Lisensi Android SDK), dan akses ke
`maven.google.com`, `repo.maven.apache.org`, `services.gradle.org`.

```bash
cd projects/lentera-english/android/native
ANDROID_HOME=/path/ke/android-sdk ./gradlew testReleaseUnitTest assembleRelease

BT=/path/ke/android-sdk/build-tools/35.0.0
$BT/zipalign -f -p 4 app/build/outputs/apk/release/app-release-unsigned.apk aligned.apk
$BT/apksigner sign --ks lentera-upload.jks --ks-key-alias lentera --out lentera-english.apk aligned.apk
$BT/apksigner verify --print-certs lentera-english.apk   # sidik jari harus sama dengan tabel di atas
```

Lalu salin `lentera-english.apk` ke `public/download/` dan deploy. Untuk Play
Store, `./gradlew bundleRelease` membuat AAB yang ditandatangani dengan
`jarsigner -sigalg SHA256withRSA -digestalg SHA-256 -keystore lentera-upload.jks
app/build/outputs/bundle/release/app-release.aab lentera`.

Versi 1.x (arsip): `node android/generate.cjs ./twa-project ./lentera-upload.jks`
dengan `@bubblewrap/core`, lalu langkah tanda tangan yang sama.
