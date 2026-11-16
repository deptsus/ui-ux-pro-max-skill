# Paket Google Play Store — Lentera English 2.0.0

Isi folder ini:

| Berkas | Untuk |
|---|---|
| `lentera-english-2.0.0-play.aab` | Berkas yang diunggah ke Play Console (versi Play Store, versionCode 5), ditandatangani dengan kunci unggah Lentera (SHA-256 `74:B2:DD:32:…:DA:A5`). |
| `listing.md` | Nama, deskripsi singkat, deskripsi lengkap, kategori. |
| `data-safety.md` | Jawaban formulir keamanan data, rating konten, iklan, akses aplikasi. |
| `graphics/` | Ikon 512 × 512, grafik fitur 1024 × 500, 8 screenshot ponsel 1080 × 1920. |
| `make-graphics.mjs` | Membuat ulang grafik dari aplikasi asli (lihat bagian akhir). |

## Beda versi Play Store dan APK di situs

Versi Play Store dibangun dengan `-Pstore=play`. Aplikasinya membuka
`/app?apk=5&store=play`, dan di dalamnya situs:

- **tidak menjual Premium** dan tidak menampilkan harga atau QRIS. Kebijakan
  pembayaran Google Play mewajibkan pembelian konten digital di aplikasi Play
  memakai Google Play Billing. Premium yang dibeli lewat situs tetap berlaku
  karena status Premium mengikuti akun.
- **tidak pernah menawarkan unduhan APK**, karena pembaruan aplikasi Play hanya
  boleh lewat Google Play.

APK di situs (`/download/lentera-english.apk`) tetap seperti biasa, dengan QRIS.

Kalau nanti ingin menjual Premium di dalam aplikasi Play Store, perlu
integrasi Google Play Billing (potongan Google) atau program pembayaran
alternatif yang berlaku di Indonesia. Itu pekerjaan terpisah.

## Langkah pemilik

1. **Buat akun Play Console** di play.google.com/console. Biaya sekali
   US$25 dan verifikasi identitas. Akun **pribadi** yang dibuat setelah
   13 November 2023 wajib menjalankan **uji tertutup minimal 12 penguji
   selama 14 hari berturut-turut** sebelum boleh terbit ke publik. Akun
   **organisasi** tidak terkena aturan itu, tetapi butuh nomor D-U-N-S.
2. **Buat aplikasi**: nama "Lentera English", bahasa default Indonesia,
   jenis *App*, *Free*. Centang pernyataan kebijakan.
3. **Penandatanganan (Play App Signing)**: pilih kunci yang dibuat Google
   (disarankan). Akibatnya, aplikasi dari Play dan APK dari situs bertanda
   tangan berbeda. Pengguna APK yang ingin pindah ke versi Play cukup
   menghapus APK lalu memasang dari Play, lalu masuk lagi dengan akunnya;
   progresnya ada di server. Setelah itu, salin sidik jari SHA-256 "App
   signing key" dari Play Console (Setup → App integrity) dan kirimkan ke
   pengembang untuk ditambahkan ke `public/.well-known/assetlinks.json`,
   supaya tautan `/app` terbuka langsung di aplikasi.
4. **Uji tertutup** (Testing → Closed testing → Create track): unggah
   `lentera-english-2.0.0-play.aab`, tambahkan minimal 12 penguji (daftar
   email atau Google Group), bagikan tautan ikut serta, dan pastikan mereka
   tetap ikut selama 14 hari.
5. **Lengkapi halaman toko dan "App content"** dengan `listing.md`,
   `data-safety.md`, dan isi folder `graphics/`.
6. **Ajukan akses produksi** setelah 14 hari, lalu terbitkan ke *Production*.

## Keputusan pemilik: anak-anak (Target audience)

Lentera punya **Jalur Anak** (7–12 tahun, didampingi orang tua). Di Play
Console → Target audience and content ada dua pilihan:

- **A. Usia 13 tahun ke atas** (disarankan untuk mulai). Jalur Anak tetap
  ada, dan kebijakan privasi sudah menyatakan bahwa anak di bawah 13 tahun
  memakai Lentera bersama orang tua atau guru yang mengelola akunnya. Google
  bisa tetap menilai aplikasi "menarik bagi anak" dan meminta penyesuaian.
- **B. Termasuk di bawah 13 tahun**: aplikasi wajib memenuhi **Families
  Policy**, misalnya persetujuan orang tua sebelum data anak dikumpulkan,
  kebijakan privasi khusus anak, dan hanya SDK yang disertifikasi untuk anak.
  Ini butuh perubahan alur pendaftaran.

## Memperbarui versi Play Store

1. `android/native/app/build.gradle`: naikkan `versionCode` dan
   `versionName`. Samakan `src/lib/android.ts`; tes `tests/android.test.ts`
   memeriksanya.
2. Bangun dan tanda tangani bundle Play:
   ```bash
   cd android/native
   ANDROID_HOME=/path/ke/android-sdk ./gradlew testReleaseUnitTest bundleRelease -Pstore=play
   jarsigner -sigalg SHA256withRSA -digestalg SHA-256 -keystore lentera-upload.jks \
     app/build/outputs/bundle/release/app-release.aab lentera
   ```
3. Unggah ke Play Console (track uji dulu, lalu produksi).

Hampir semua pembaruan (materi, tampilan, fitur) tidak butuh versi baru di
Play Store, karena aplikasinya membuka situs live.

## Membuat ulang grafik

```bash
PROMO_W=360 PROMO_H=640 PROMO_DPR=3 PROMO_OUT=/tmp/store node promo/capture.mjs   # server embedded di port 3100
node play-store/make-graphics.mjs /tmp/store
```
