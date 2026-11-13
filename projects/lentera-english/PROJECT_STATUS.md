# PROJECT_STATUS — Lentera English

Terakhir diperbarui: 13 November 2026, setelah sesi kedua (perbaikan landing + dashboard admin).
Branch kerja: `ccr-17d3d5e4-jx43zs` di repo `deptsus/ui-ux-pro-max-skill` (melanjutkan `ccr-33e68053-ob8ny7`).
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
- Ringkasan admin: jumlah pengguna Free/Premium, transaksi per status, pendapatan bulanan/tahunan, riwayat, masa aktif, log webhook (fungsi SQL dan API diuji; UI ada di `/admin`, lihat 2f).

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

### 2f. Landing dan dashboard admin (sesi kedua)

- **Landing `/`**: Bug #1 diperbaiki. `npx next build` sukses, `/` merespons 200 dan tampil tanpa error atau peringatan konsol (dev dan build produksi).
- **Dashboard admin `/admin`** (`src/app/admin/page.tsx`, komponen di `src/components/admin/`). Tiga tab:
  - **Pembayaran**: pengguna total/Free/Premium, transaksi berhasil/tertunda/gagal/perlu ditinjau, pendapatan bulan dan tahun ini, grafik pendapatan 12 bulan (dengan tampilan tabel), riwayat pembayaran (cari + filter status), masa aktif pelanggan, status dan log webhook. Semua angka dari `admin_payment_overview`.
  - **Konten (CMS)**: daftar, cari, filter, tambah, edit, hapus untuk 14 tabel: level, bab, unit, pelajaran, soal + pilihan jawaban, PR, ujian, topik, pola kesalahan, kosakata, percakapan, menyimak, pelafalan, audio. Form dibangkitkan dari `schema.ts`; validasi dijalankan sebelum kirim dan diulang oleh basis data.
  - **Terbitkan**: terbitkan dengan gerbang kualitas (daftar masalah + tombol "Buka" ke baris yang bermasalah), riwayat versi, pulihkan versi lama, impor ulang paket bawaan (dengan konfirmasi ketik "IMPOR").
  - Gerbang akses: tamu diminta masuk, non-admin melihat "Akses ditolak" dan tidak memicu permintaan data admin; server tetap menolak dengan 403.

**Teruji** (`npm run e2e:admin`, 42 pemeriksaan lolos di dev dan di build produksi, desktop + layar ponsel 390 px, tanpa error konsol):

| Alur | Hasil |
|---|---|
| Tamu dan non-admin membuka `/admin` | Ditolak di halaman; API 403 |
| Tab Pembayaran setelah 1 QRIS berhasil + 1 DANA tertunda | Tile, riwayat, filter status, masa aktif, log webhook, grafik cocok dengan data server |
| Edit ringkasan pelajaran lalu simpan | Tersimpan di DB; materi dan tujuan tidak berubah; pelajar belum menerimanya sebelum terbit |
| Hapus alasan pilihan salah lalu simpan | Ditolak sebelum dikirim; "Buang perubahan" tidak mengubah soal |
| Tambah soal pilihan ganda baru, lalu hapus | Tersimpan sebagai draf dengan pilihan + alasan; terhapus setelah konfirmasi |
| Terbitkan pelajaran tanpa soal tes penguasaan | Ditolak gerbang kualitas; versi pelajar tetap; "Buka" membawa ke pelajarannya |
| Terbitkan setelah diperbaiki | Versi 2 dipakai pelajar; `/api/content` berisi perubahan; draf tidak ikut |
| Pulihkan versi 1 | Pelajar kembali ke versi 1; konten kerja tidak berubah |

**Teruji** (`tests/admin.test.ts`, 4 tes, Postgres sungguhan via PGlite): setiap kolom di `schema.ts` ada di tabelnya; semua baris kurikulum bawaan lolos validasi form; menyimpan ulang **setiap** baris dari semua 14 tabel tanpa perubahan menghasilkan kurikulum yang identik; kunci payload yang tidak dikenal form tetap tersimpan.

**Tampil tetapi belum dijalankan di browser**: editor jawaban salah yang dikenali, pasangan, tugas menulis, kolom JSON (percakapan, pelafalan), form PR/ujian/kosakata/audio, pindah urutan baris, dan aksi impor ulang paket bawaan. Logika simpannya tercakup oleh tes bolak-balik di atas, tetapi interaksi UI-nya belum diuji.

Total unit test sekarang 78 (74 lama + 4 baru), semua lolos dengan `TZ=UTC npx vitest run`.

---

## 3. Fitur yang sedang dikerjakan (belum selesai)

| Fitur | Kondisi sebenarnya |
|---|---|
| Suite e2e | Helper `e2e/lib.mjs` dan `e2e/admin.mjs` (dashboard admin) ada. Runner `e2e/run.mjs` untuk alur pembelajar, yang dirujuk `npm run e2e`, **belum ada**. |
| Dashboard admin | Berfungsi dan teruji (lihat 2f). Yang belum: tindak lanjut transaksi `NEEDS_REVIEW` dan unggah berkas audio (keduanya P2); editor percakapan dan pelafalan masih berupa kolom JSON. |

## 4. Fitur yang belum dibuat

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
| 1 | ~~Kritis~~ **Selesai** | `/` error 500 dan `next build` gagal karena `page.tsx` memanggil `rupiah()` dari modul `'use client'`. | Diperbaiki: formatter dipindah ke `src/lib/format.ts`, diekspor ulang dari `ui.tsx`. `next build` sukses, `/` 200. | — |
| 2 | ~~Tinggi~~ **Selesai** | `/admin` 404. | Halaman dibuat; `/admin` 200 dan teruji (2f). | — |
| 3 | Sedang | `package.json` merujuk file yang tidak ada: `e2e/run.mjs` (`npm run e2e`) dan `scripts/export-content.ts` (`npm run content:export`). | `ls e2e scripts`. | Buat file tersebut atau hapus skripnya. |
| 4 | ~~Rendah~~ **Tidak muncul lagi** | Peringatan React "Encountered a script tag" dari skrip tema. | Setelah Bug #1 diperbaiki, `/`, `/masuk`, `/daftar`, `/admin`, `/app`, `/app/analytics`, `/app/subscription` dibuka di dev tanpa error maupun peringatan konsol. | — |

Catatan: satu cek otomatis sempat gagal ("riwayat transaksi tampil"), tetapi setelah diulang dengan menunggu data selesai dimuat, fitur itu terbukti berfungsi. Itu masalah waktu tunggu di skrip uji, bukan bug.

## 6. Pekerjaan terakhir yang dilakukan

Urutan commit di branch:

1. `4a36fca` mesin belajar deterministik + kurikulum.
2. `1b5fab5` skema Postgres, RLS, fungsi CMS, pembayaran Xendit, tes DB dan pembayaran.
3. `3c0053e` (WIP) API routes, client store, UI latihan, sebagian besar halaman pembelajar.
4. Sesudah itu (di-commit bersama dokumen serah terima ini): halaman `profile`, `settings`, `more`, `subscription`, `checkout`, `masuk`, `daftar`, `src/components/AuthForm.tsx`, `src/lib/plans.ts`, dan halaman landing `src/app/page.tsx` (yang masih rusak, Bug #1).

Lalu sesi serah terima: memeriksa kode, menjalankan typecheck, validasi konten, 74 unit test, `next build`, pengecekan semua rute, dan uji alur di browser. Tidak ada kode aplikasi yang diubah di sesi itu.

Sesi kedua (branch `ccr-17d3d5e4-jx43zs`):

5. Perbaikan Bug #1: `src/lib/format.ts` baru, ekspor ulang di `ui.tsx`, impor di `page.tsx`.
6. Dashboard admin: `src/app/admin/page.tsx`, `src/components/admin/*`, mode nilai besar di `BarChart` (`src/components/Charts.tsx`), `compactId` di `format.ts`, `e2e/admin.mjs`, `tests/admin.test.ts`, skrip `npm run e2e:admin`.

## 7. File terakhir yang diubah

1. `src/app/admin/page.tsx`, `src/components/admin/{schema.ts,fields.tsx,CmsPanel.tsx,PaymentsPanel.tsx,PublishPanel.tsx,Confirm.tsx,api.ts}`.
2. `e2e/admin.mjs`, `tests/admin.test.ts`, `package.json` (skrip `e2e:admin`).
3. `src/components/Charts.tsx` (prop `format` dan `column` pada `BarChart`; grafik lama tidak berubah), `src/lib/format.ts`.
4. `src/components/ui.tsx`, `src/app/page.tsx` (perbaikan Bug #1).
5. Dokumen: `PROJECT_STATUS.md`, `ARCHITECTURE.md`, `TODO.md`.

## 8. Langkah persis berikutnya

1. `cd projects/lentera-english && npm install` (bila `node_modules` belum ada).
2. Jalankan `npx tsc --noEmit`, `TZ=UTC npx vitest run` (harus 78/78), `npx tsx scripts/check-content.ts`, `npx next build`.
3. Buat `e2e/run.mjs` memakai `e2e/lib.mjs` untuk mengulang alur pembelajar di bagian 2e, dan bereskan Bug #3 (`scripts/export-content.ts`).
4. Uji di browser bagian dashboard admin yang baru "Tampil" (daftar di 2f).
5. Lanjut ke TODO P0 sisanya: proyek Supabase dan verifikasi sandbox Xendit (keduanya butuh kredensial dari pemilik produk).

Menguji dashboard admin (butuh basis data embedded yang masih baru, karena skrip memeriksa nomor versi):

```bash
cd projects/lentera-english
LENTERA_BACKEND=embedded LENTERA_DEV_ADMIN_EMAIL=admin@lentera.test \
  LENTERA_DATA_DIR=/tmp/lentera-e2e/pglite npx next dev -p 3100   # hapus folder itu dulu bila sudah ada
npm run e2e:admin
```

Cara menjalankan lokal (tanpa layanan luar):

```bash
cd projects/lentera-english
LENTERA_BACKEND=embedded LENTERA_DEV_ADMIN_EMAIL=admin@lentera.test npx next dev -p 3100
# daftar dengan email admin@lentera.test di /daftar untuk mendapat peran admin
```
