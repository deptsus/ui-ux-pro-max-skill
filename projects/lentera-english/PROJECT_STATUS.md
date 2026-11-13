# PROJECT_STATUS — Lentera English

Terakhir diperbarui: 13 November 2026, saat serah terima ke sesi berikutnya.
Branch kerja: `ccr-33e68053-ob8ny7` di repo `deptsus/ui-ux-pro-max-skill`.
Lokasi proyek: `projects/lentera-english/` (lihat bagian "Konteks repo" di bawah).

Semua status di dokumen ini diperiksa langsung pada kode dan dengan menjalankan
aplikasi, bukan dari ingatan percakapan. Label yang dipakai:

- **Teruji**: dibuktikan oleh unit test, atau dijalankan ujung ke ujung di browser.
- **Tampil**: halaman terbuka tanpa error JavaScript, tetapi alurnya belum dijalankan sampai selesai di browser.
- **Belum dibuat**: tidak ada kodenya.

---

## 1. Deskripsi dan tujuan produk

Lentera English adalah sekolah bahasa Inggris digital untuk pelajar Indonesia,
dari A1 sampai C2 (CEFR). Prinsip utamanya: **seluruh sistem belajar berjalan
tanpa AI**. Materi, soal, pembahasan, dialog, dan rekomendasi semuanya berasal
dari konten tertulis dan algoritma deterministik (aturan, skor berbobot, ambang
penguasaan, pengulangan berjarak).

Tujuannya bukan sekadar membuat pengguna menyelesaikan kuis, tetapi membuat mereka
paham, ingat, dan berani memakai bahasa Inggris. Setiap pelajaran mengikuti 8 langkah:
pengantar, materi, contoh benar/salah, latihan terbimbing, latihan mandiri, PR,
tes penguasaan, jadwal ulangan.

Model bisnis: Free (Rp0), Premium Bulanan (Rp58.500 / 30 hari), Premium Tahunan
(Rp585.000 / 365 hari). Pembayaran hanya QRIS, DANA, GoPay lewat Xendit. Tidak ada
perpanjangan otomatis.

Nama produk, maskot (Pijar, kunang-kunang), dan desain adalah orisinal.

## Konteks repo (penting)

Repo `ui-ux-pro-max-skill` adalah produk lain (toolkit desain). Aplikasi ini hanya
"menumpang" di folder `projects/lentera-english/`. Akibatnya:

- `CLAUDE.md` di root repo menjelaskan produk lain, bukan aplikasi ini. **Mulailah dari folder proyek ini.**
- Workflow CI repo (`.github/workflows/*`) **tidak** berjalan untuk folder ini (filter path tidak mencakup `projects/**`). Tes harus dijalankan manual.
- Aturan git repo tetap berlaku: jangan push ke `main`; kerja di branch.

---

## 2. Fitur yang sudah selesai dan benar-benar berfungsi

### 2a. Mesin belajar (Teruji: `tests/engine.test.ts`, 28 tes lolos)

| Fitur | File | Bukti |
|---|---|---|
| Penilaian 14 jenis soal + umpan balik "kenapa salah" | `src/lib/engine/grading.ts` | tiap soal di kurikulum diuji: kunci lolos, jawaban salah memberi umpan balik |
| Deteksi pola kesalahan (mis. tertukar was/were) | `grading.ts`, `state.ts` | tes "Student A" |
| Skor penguasaan berbobot (kesulitan, waktu, petunjuk, kebaruan) | `src/lib/engine/mastery.ts` | tes mastery |
| Penguasaan butuh 85% + tes ulang tertunda di hari berbeda | `mastery.ts`, `state.ts` | tes mastery dan Student A |
| Pengulangan berjarak 1/3/7/14/30 hari, salah memendekkan jarak | `src/lib/engine/srs.ts` | tes spaced repetition |
| Rekomendasi deterministik berbobot, dengan alasan | `src/lib/engine/recommend.ts` | tes Student A |
| Latihan perbaikan bertingkat (mudah ke sulit) | `src/lib/engine/sessions.ts` | tes ladder |
| Aturan buka-kunci (pelajaran, unit, level, Premium) | `src/lib/engine/unlock.ts` | tes unlock |
| Ujian unit/level + skor per topik | `sessions.ts` | tes exam |
| Tes penempatan bertahap | `src/lib/engine/placement.ts` | tes placement |
| XP, beruntun + pelindung, nyawa, misi, lencana | `src/lib/engine/gamification.ts`, `state.ts` | tes gamification |

### 2b. Kurikulum (Teruji: `npm run content:check` dan tes kualitas konten)

- 14 pelajaran lengkap 8 langkah: A1 (7), A2 (3), B1 (1), B2 (1), C1 (1), C2 (1).
- 276 soal, mencakup ke-14 jenis soal. Setiap soal punya kunci, penjelasan, dan alasan untuk setiap pilihan salah (divalidasi otomatis).
- 74 kosakata (dengan IPA dan contoh), 11 skenario percakapan bercabang, 6 materi menyimak, 8 panduan pelafalan, 20 soal tes penempatan, 18 PR, 10 ujian (8 ujian unit, ujian level A1 dan A2), 25 pola kesalahan, 15 topik.
- 24 pelajaran lain ada di silabus dan tampil sebagai "Sedang disusun" (belum ada isinya).

### 2c. Database dan keamanan (Teruji: `tests/db.test.ts`, 16 tes lolos, di Postgres sungguhan via PGlite)

- 36 tabel ternormalisasi, RLS aktif di semua tabel.
- Klien (kunci publik) hanya bisa membaca baris miliknya, tidak bisa menulis apa pun, tidak bisa menaikkan diri jadi admin atau Premium (diuji).
- CMS di sisi database: impor, edit sebagian, gerbang kualitas sebelum terbit, versi kurikulum, rollback (diuji).
- Sinkronisasi progres: event idempoten, batas XP di server (200 per event, 3000 per hari), snapshot lama tidak menimpa yang baru (diuji).
- Papan peringkat mingguan dari ledger XP (diuji).

### 2d. Pembayaran Xendit (Teruji: `tests/payments.test.ts`, 30 tes lolos, dengan simulator Xendit)

- Checkout QRIS/DANA/GoPay, harga ditentukan server dari tabel `subscription_plans`.
- Premium **hanya** aktif lewat webhook terverifikasi (`x-callback-token`) atau lewat status dari API resmi. Halaman redirect tidak mengaktifkan apa pun.
- Validasi nominal, mata uang IDR, metode, dan ID transaksi gateway.
- Idempotensi dua lapis: webhook duplikat (termasuk 4 kiriman bersamaan) hanya memberi satu periode.
- Kasus diuji: sukses, gagal, tertunda, kedaluwarsa, webhook duplikat, nominal tidak sesuai, token palsu, ID gateway milik transaksi lain, uang masuk setelah jendela lokal habis, Premium kedaluwarsa kembali Free tanpa kehilangan progres, perpanjangan lebih awal ditumpuk setelah periode berjalan.
- Data pembayar dari payload webhook tidak disimpan (diuji).
- Ringkasan admin: jumlah pengguna Free/Premium, transaksi per status, pendapatan bulanan/tahunan, riwayat, masa aktif, log webhook (fungsi SQL dan API diuji; **UI belum dibuat**).

**Belum siap produksi.** Lihat bagian 4.

### 2e. Aplikasi web (diperiksa di browser dengan dev server + basis data lokal)

Diuji ujung ke ujung di browser (layar ponsel) pada sesi ini:

| Alur | Hasil |
|---|---|
| Tamu menuntaskan pelajaran "Sapaan dan Perkenalan" (8 langkah, latihan, PR, tes penguasaan) | Lulus; pelajaran berikutnya terbuka; PR muncul; jadwal ulangan terisi; XP bertambah |
| Daftar akun (mode lokal) | Berhasil; progres tamu ikut pindah ke akun |
| Beli Premium Tahunan via QRIS, lalu simulasi bayar | Kode QR tampil; status berubah "Pembayaran berhasil"; Premium aktif; server mengirim konten Premium |
| Checkout DANA | Status "Menunggu pembayaran" + instruksi; muncul di riwayat transaksi |
| Simulator percakapan "Restoran" sampai selesai | Umpan balik tata bahasa/kewajaran/alternatif tampil; skor akhir tampil |
| Tes penempatan (benar 4 dari 8) | Berhenti di A2 setelah 8 soal |
| Non-admin memanggil `/api/admin` | Ditolak 403 |
| Webhook tanpa token | Ditolak 401 |
| Akun admin memanggil `/api/admin` (payments, versions, content) | Berfungsi |

Halaman yang **Tampil** tanpa error (dibuka sebagai tamu, alurnya belum dijalankan sampai selesai):
`/masuk`, `/daftar`, `/app`, `/app/path`, `/app/review`, `/app/homework`, `/app/exams`,
`/app/exams?id=...`, `/app/vocabulary`, `/app/grammar`, `/app/grammar?topic=...`,
`/app/listening` (dua tab), `/app/listening?id=...`, `/app/conversations`,
`/app/analytics`, `/app/achievements`, `/app/leaderboard`, `/app/profile`,
`/app/subscription`, `/app/settings`, `/app/more`, `/app/practice` (mode drill dan timed),
`/app/checkout`, `/app/lesson` untuk pelajaran Premium yang terkunci.

Sebagian besar sesi latihan memakai komponen yang sama (`SessionRunner`), yang sudah
teruji di alur pelajaran dan tes penempatan.

`npx tsc --noEmit` lolos tanpa error.

---

## 3. Fitur yang sedang dikerjakan (belum selesai)

| Fitur | Kondisi sebenarnya |
|---|---|
| Halaman landing `/` | Kode ada di `src/app/page.tsx`, **tetapi rusak**: error 500 dan membuat `next build` gagal (lihat Bug #1). Ini file terakhir yang ditulis. |
| Dashboard admin (CMS + pembayaran) | Backend (SQL + `POST /api/admin`) selesai dan teruji. **Halaman UI belum dibuat**: `/admin` mengembalikan 404, padahal footer landing menautkannya. |
| Suite e2e | Helper `e2e/lib.mjs` ada. Runner `e2e/run.mjs` yang dirujuk `npm run e2e` **belum ada**. Skrip uji alur sesi ini hanya ada di scratchpad sesi (tidak ikut repo). |

## 4. Fitur yang belum dibuat

- UI admin: kelola kursus/bab/unit/pelajaran/soal/opsi/audio, terbitkan & rollback versi, dashboard pembayaran.
- Rekaman audio penutur asli. Tabel `audio_resources` kosong; saat ini audio dibacakan oleh suara bawaan perangkat (`speechSynthesis`) dan UI menyatakannya terang-terangan. Pemutar sudah siap memakai rekaman bila diunggah.
- 24 pelajaran yang masih "Sedang disusun", serta ujian level B1 sampai C2.
- Koneksi ke Supabase sungguhan: migrasi belum pernah diterapkan ke proyek Supabase mana pun; jalur Supabase Auth dan PostgREST belum pernah dijalankan.
- Uji sandbox Xendit sungguhan (butuh kredensial). Poin yang wajib diverifikasi ditandai `VERIFY` di `src/lib/server/xendit.ts`.
- Deploy/hosting, domain HTTPS untuk webhook, monitoring.
- Batas paket Free di sisi server (nyawa, 10 ulangan per hari): saat ini hanya ditegakkan di klien. Pembatasan **konten** Premium sudah di server.
- Skrip `npm run content:export` (file `scripts/export-content.ts` tidak ada).
- README khusus proyek.

## 5. Bug yang masih ditemukan

| # | Tingkat | Bug | Bukti | Perbaikan yang disarankan |
|---|---|---|---|---|
| 1 | **Kritis** | `/` error 500 dan `next build` gagal: `src/app/page.tsx` (server component) memanggil `rupiah()` dari `src/components/ui.tsx` yang bertanda `'use client'`. | `next build` → "Attempted to call rupiah() from the server" di `page.tsx:111`. | Pindahkan `rupiah`, `dateId`, `dateTimeId` ke file baru tanpa `'use client'` (mis. `src/lib/format.ts`), ekspor ulang dari `ui.tsx` agar impor lama tetap jalan, lalu impor dari `@/lib/format` di `page.tsx`. Jalankan ulang `npx next build`. |
| 2 | Tinggi | `/admin` 404, ditautkan dari footer landing. | Pengecekan rute. | Buat halaman admin (lihat TODO P0). |
| 3 | Sedang | `package.json` merujuk file yang tidak ada: `e2e/run.mjs` (`npm run e2e`) dan `scripts/export-content.ts` (`npm run content:export`). | `ls e2e scripts`. | Buat file tersebut atau hapus skripnya. |
| 4 | Rendah | Peringatan React "Encountered a script tag while rendering React component" (skrip tema di `src/app/layout.tsx`). Terlihat hanya saat halaman error `/` dirender. | Log browser. | Periksa ulang setelah Bug #1 diperbaiki; bila masih muncul, pakai `next/script` dengan `strategy="beforeInteractive"`. |

Catatan: satu cek otomatis sempat gagal ("riwayat transaksi tampil"), tetapi setelah diulang dengan menunggu data selesai dimuat, fitur itu terbukti berfungsi. Itu masalah waktu tunggu di skrip uji, bukan bug.

## 6. Pekerjaan terakhir yang dilakukan

Urutan commit di branch:

1. `4a36fca` mesin belajar deterministik + kurikulum.
2. `1b5fab5` skema Postgres, RLS, fungsi CMS, pembayaran Xendit, tes DB dan pembayaran.
3. `3c0053e` (WIP) API routes, client store, UI latihan, sebagian besar halaman pembelajar.
4. Sesudah itu (di-commit bersama dokumen serah terima ini): halaman `profile`, `settings`, `more`, `subscription`, `checkout`, `masuk`, `daftar`, `src/components/AuthForm.tsx`, `src/lib/plans.ts`, dan halaman landing `src/app/page.tsx` (yang masih rusak, Bug #1).

Lalu sesi serah terima ini: memeriksa kode, menjalankan typecheck, validasi konten, 74 unit test, `next build`, pengecekan semua rute, dan uji alur di browser. Tidak ada kode aplikasi yang diubah di sesi ini.

## 7. File terakhir yang diubah

1. `src/app/page.tsx` — landing (terakhir ditulis; berisi Bug #1).
2. `src/app/app/checkout/page.tsx`, `src/app/app/subscription/page.tsx`, `src/lib/plans.ts`.
3. `src/components/AuthForm.tsx`, `src/app/masuk/page.tsx`, `src/app/daftar/page.tsx`.
4. `src/app/app/profile/page.tsx`, `src/app/app/settings/page.tsx`, `src/app/app/more/page.tsx`.
5. Dokumen ini: `PROJECT_STATUS.md`, `ARCHITECTURE.md`, `TODO.md`, `DECISIONS.md`.

## 8. Langkah persis berikutnya

1. `cd projects/lentera-english && npm install` (bila `node_modules` belum ada).
2. Perbaiki Bug #1 seperti di tabel bagian 5. Verifikasi: `npx next build` sukses dan `/` tampil.
3. Jalankan `npx tsc --noEmit`, `TZ=UTC npx vitest run` (harus 74/74), `npx tsx scripts/check-content.ts`.
4. Buat dashboard admin di `src/app/admin/page.tsx` (lihat TODO P0-2). Backend-nya sudah ada: `src/app/api/admin/route.ts`.
5. Buat `e2e/run.mjs` memakai `e2e/lib.mjs` untuk mengulang alur di bagian 2e.

Cara menjalankan lokal (tanpa layanan luar):

```bash
cd projects/lentera-english
LENTERA_BACKEND=embedded LENTERA_DEV_ADMIN_EMAIL=admin@lentera.test npx next dev -p 3100
# daftar dengan email admin@lentera.test di /daftar untuk mendapat peran admin
```
