# PROJECT_STATUS — Lentera English

Terakhir diperbarui: 14 November 2026, setelah sesi kelima (Supabase terisi, aplikasi live di Netlify).
Alamat live: https://lentera-english-app.netlify.app (backend Supabase, pembayaran QRIS manual).
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
(Rp585.000 dicoret, diskon 15%, dibayar Rp497.250 / 365 hari). Pembayaran hanya
lewat QRIS milik pemilik produk; Premium aktif setelah admin mengonfirmasi
pembayaran. Tidak ada perpanjangan otomatis. Lihat DECISIONS A3, A4, B6.

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

### 2d-1. Pembayaran QRIS manual (aktif; Teruji: `tests/manual-payments.test.ts`, 17 tes, dan e2e)

- Dua QR dari pemilik produk (QRIS dinamis DANA, NMID ID1026639132426) tersimpan per paket. Isi kodenya sudah dibaca dari foto: nominal Rp58.500 dan Rp497.250, mata uang rupiah, checksum benar.
- Aplikasi menggambar QR dari isi kodenya; hasil gambar dipindai ulang dan **identik** dengan QR asli.
- Server menolak menampilkan QR bila nominal di dalamnya berbeda dari harga paket (diuji).
- Alur diuji di browser (`e2e/run.mjs` skenario `payment`, `e2e/admin.mjs`): pilih paket tahunan (harga coret + diskon tampil) → QR Rp497.250 + tombol simpan gambar → "Saya sudah bayar" dengan nama pembayar → antrean admin → admin konfirmasi → halaman pelajar berubah sendiri menjadi "Pembayaran dikonfirmasi", Premium 365 hari, isi Premium dikirim server. Penolakan dengan alasan tampil ke pelajar.
- Diuji di SQL: hanya admin yang bisa konfirmasi/tolak; konfirmasi ganda dan bersamaan hanya memberi satu periode; perpanjangan ditumpuk; checkout tak dilaporkan kedaluwarsa 24 jam tetapi tetap bisa dikonfirmasi; laporan tidak pernah kedaluwarsa sendiri; peran API tidak bisa memanggil fungsi pembayaran.
- **Belum diuji dengan uang sungguhan.** Sebelum dibuka ke publik: bayar kedua QR dengan nominal sebenarnya dari minimal dua aplikasi berbeda, lalu konfirmasi lewat dashboard di server produksi.

### 2d-2. Pembayaran Xendit (nonaktif, disimpan; Teruji: `tests/payments.test.ts`, 30 tes lolos, dengan simulator Xendit)

Hanya aktif dengan `PAYMENT_PROVIDER=xendit`. Kunci uji Xendit yang tersimpan di environment cloud ditolak Xendit (`401 INVALID_API_KEY`) dan tidak lagi diperlukan.

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

**Teruji** (`npm run e2e:admin`, 61 pemeriksaan lolos di dev dan di build produksi, desktop + layar ponsel 390 px, tanpa error konsol):

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
| Editor jawaban salah yang dikenali (tambah, wajib penjelasan, hapus) | Tersimpan tanpa mengubah entri lama; menghapus memulihkan soal persis seperti semula |
| Pindah urutan pasangan pada soal mencocokkan | Urutan tersimpan; dipindah kembali memulihkan soal |
| Tugas menulis PR, pengaturan ujian (termasuk angka di luar batas) | Tersimpan; unsur wajib utuh; angka di luar batas ditolak |
| Kolom JSON percakapan diisi JSON rusak | Ditandai, tidak bisa disimpan, data di server tidak berubah |
| Daftarkan audio (URL tidak aman ditolak), hubungkan ke kosakata, hapus | Terdaftar; terhubung; penghapusan melepas tautan dari kosakata |
| Impor ulang paket bawaan | Terkunci sampai "IMPOR" diketik; suntingan CMS tertimpa isi bawaan; versi pelajar tidak berubah |

**Teruji** (`tests/admin.test.ts`, 5 tes, Postgres sungguhan via PGlite): setiap kolom di `schema.ts` ada di tabelnya; semua baris kurikulum bawaan lolos validasi form; menyimpan ulang **setiap** baris dari semua 14 tabel tanpa perubahan menghasilkan kurikulum yang identik; kunci payload yang tidak dikenal form tetap tersimpan; hasil ekspor `content_rows` bila diimpor ke basis data kosong menghasilkan kurikulum yang identik.

**Tampil tetapi belum dijalankan di browser**: menambah dan mengedit bagian materi beserta tabel dan contoh kalimatnya secara mendalam (hanya "tambah satu bagian" yang diuji), form topik, pola kesalahan, pelafalan, menyimak, bab, unit, dan level. Logika simpannya tercakup oleh tes bolak-balik di atas.

Total unit test sekarang 79 (74 lama + 5 baru), semua lolos dengan `TZ=UTC npx vitest run`.

### 2g. Suite e2e pembelajar (sesi ketiga)

`npm run e2e` (`e2e/run.mjs`) menjalankan aplikasi pembelajar lewat UI sungguhan di layar ponsel 390 px, menjawab soal dari kunci di paket konten yang terbit. 64 pemeriksaan lolos di dev dan di build produksi, tanpa error konsol:

| Skenario | Yang dibuktikan |
|---|---|
| `routes` | 29 rute terbuka dengan status 200 tanpa error konsol |
| `lesson` | Pelajaran kedua terkunci; pelajaran pertama tuntas 8 langkah; jawaban salah memberi alasan + jawaban benar + penjelasan; XP, jadwal ulangan, dan PR tercatat; pelajaran berikutnya terbuka; PR soal dikumpulkan (100); PR menulis (tulisan pendek gagal, contoh jawaban 100%); Tantangan Kilat sempurna memberi bonus XP; ulangan terjadwal dua hari kemudian berjalan sampai selesai, jarak naik 1 → 3 hari, maksimal 10 materi untuk Free; analitik dengan data; tema gelap tersimpan; aksen tersimpan; daftar akun memindahkan progres, nama, dan XP ke server; akun muncul di papan peringkat |
| `exam` | Ujian unit terkunci; tiga pelajaran unit dituntaskan; ujian lulus dengan dua jawaban salah; nilai sesuai; nilai per topik dan pembahasan tampil; Pusat Ujian menandai lulus |
| `drill` | Latihan perbaikan selesai dan pola dinyatakan teratasi; kesulitan tidak turun selama benar; menyimak (transkrip, sumber audio dinyatakan jujur, sesi selesai); audio Premium tertutup untuk tamu |
| `conversation` | Percakapan bercabang sampai selesai; respons dinilai tata bahasa dan kewajarannya; nilai tersimpan; skenario Premium tertutup |
| `placement` | Benar di blok A1, salah di A2: tes berhenti setelah blok A2, penempatan A2, tanpa XP |
| `payment` | Akun Free menerima pelajaran Premium tanpa isi; PATCH profil tidak bisa menjadikan admin/Premium; harga tahunan coret + diskon 15%; hanya QRIS; QR berisi Rp497.250 dan bisa disimpan; laporan bayar tidak mengaktifkan Premium; pelajar tidak bisa mengonfirmasi sendiri; konfirmasi admin → Premium 365 hari; penolakan dengan alasan tampil ke pelajar dan tidak memperpanjang; webhook Xendit 404; simulasi Xendit 403 |

Belum tercakup: tes ulang penguasaan (butuh jeda 20 jam dan dua hari berbeda), ujian level, belajar offline, pengaturan target harian, dan reset data belajar.

---

## 3. Fitur yang sedang dikerjakan (belum selesai)

| Fitur | Kondisi sebenarnya |
|---|---|
| Dashboard admin | Berfungsi dan teruji (lihat 2f). Yang belum: tindak lanjut transaksi `NEEDS_REVIEW` dan unggah berkas audio (keduanya P2); editor percakapan dan pelafalan masih berupa kolom JSON. |

## 4. Fitur yang belum dibuat

- Rekaman audio penutur asli. Tabel `audio_resources` kosong; saat ini audio dibacakan oleh suara bawaan perangkat (`speechSynthesis`) dan UI menyatakannya terang-terangan. Pemutar sudah siap memakai rekaman bila diunggah.
- 24 pelajaran yang masih "Sedang disusun", serta ujian level B1 sampai C2.
- Pembayaran sungguhan di server live (bayar QR → "Saya sudah bayar" → konfirmasi admin). Alur belajar dan akun di live sudah teruji (bagian 8).
- Pembayaran nyata ke kedua QR lalu konfirmasi di server produksi (lihat 2d-1).
- Admin belum bisa mengganti QR dari dashboard; QR baru dipasang lewat migrasi atau SQL (`subscription_plans.qris_payload`).
- Pemberitahuan ke admin saat ada pembayaran baru dilaporkan (sekarang admin harus membuka dashboard).
- Domain sendiri dan monitoring/peringatan error. (Hosting HTTPS di Netlify sudah jalan, lihat bagian 8.)
- Batas paket Free di sisi server (nyawa, 10 ulangan per hari): saat ini hanya ditegakkan di klien. Pembatasan **konten** Premium sudah di server.
- README khusus proyek.

## 5. Bug yang masih ditemukan

| # | Tingkat | Bug | Bukti | Perbaikan yang disarankan |
|---|---|---|---|---|
| 1 | ~~Kritis~~ **Selesai** | `/` error 500 dan `next build` gagal karena `page.tsx` memanggil `rupiah()` dari modul `'use client'`. | Diperbaiki: formatter dipindah ke `src/lib/format.ts`, diekspor ulang dari `ui.tsx`. `next build` sukses, `/` 200. | — |
| 2 | ~~Tinggi~~ **Selesai** | `/admin` 404. | Halaman dibuat; `/admin` 200 dan teruji (2f). | — |
| 3 | ~~Sedang~~ **Selesai** | `package.json` merujuk file yang tidak ada. | `e2e/run.mjs` dan `scripts/export-content.ts` dibuat dan dijalankan. | — |
| 5 | ~~Sedang~~ **Selesai** | Nama yang diketik di form daftar tidak pernah dipakai: profil memakai nama bawaan tamu atau awalan email, lalu sinkronisasi menimpa nama di server. | Ditemukan oleh `e2e/run.mjs`. Diperbaiki di `loadLearner()` (`src/lib/client/store.ts`): nama diambil dari profil server. | — |
| 6 | ~~Sedang~~ **Selesai** | XP yang didapat sebagai tamu tidak sampai ke ledger server saat mendaftar (event yang belum terkirim dibuang), sehingga papan peringkat kosong untuk akun itu. | Ditemukan oleh `e2e/run.mjs`. Diperbaiki: event tamu ikut dikirim (idempoten, batas XP server tetap berlaku). Lihat DECISIONS B5. | — |
| 7 | Rendah (lingkungan dev) | Cache dev Turbopack di `.next/dev` dua kali menjadi basi: semua halaman memuat ulang tanpa henti ("HMR hash mismatch") dan aplikasi tertahan di layar pembuka tanpa pesan error. Pemicunya tidak berhasil direproduksi. | Menghapus `.next/dev` menyembuhkan 3 dari 3 kali. | Cache dev di disk dimatikan di `next.config.ts`. Bila masih terjadi: hentikan server, hapus `.next/dev`, jalankan lagi. |
| 8 | ~~Sedang~~ **Selesai** | Di Netlify setiap halaman memunculkan React error #418 (hydration gagal) dan dirender ulang penuh di browser. Penyebab: edge Netlify menyisipkan baris baru dan komentar HTML ("This site is hosted on Netlify ...") ke dalam `<head>`. Skrip HUD Netlify setelah `</html>` tidak berpengaruh. | Dibuktikan dengan mengubah respons live di browser: hanya membuang komentar itu yang menghilangkan error. Diperbaiki di `src/instrumentation-client.ts` (berjalan sebelum hydrate, membuang komentar dan teks kosong di `<head>`); diuji lokal dengan sisipan yang sama di 4 halaman, dan uji kontrol tanpa perbaikan tetap memunculkan #418. | — |
| 9 | ~~Tinggi~~ **Selesai** | Di HP, lencana "Powered by Netlify" (iframe `#nl-badge-frame`, 201×64 px, pojok kanan bawah, z-index maksimum) menutupi tombol utama di bawah layar, misalnya "Periksa" di pelajaran. Ketukan di sisi kanan tombol mengenai lencana. | Ditemukan oleh `e2e/run.mjs` saat dijalankan ke situs live (macet di "Periksa"). Pemilik mematikannya di Netlify: Project configuration → General → Powered by Netlify badge. Sesudahnya skrip dan iframe lencana tidak ada lagi di halaman. | Jangan nyalakan lagi lencana itu. |
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

Sesi ketiga:

7. `e2e/run.mjs` (suite pembelajar) dan perbaikan dua bug serah terima tamu → akun di `src/lib/client/store.ts` (Bug #5 dan #6).
8. `scripts/export-content.ts` (`npm run content:export`), perluasan `e2e/admin.mjs` ke editor lain, tes ekspor-impor di `tests/admin.test.ts`.
9. Editor CMS: JSON yang belum valid dihitung sebagai perubahan belum disimpan (`CmsPanel.tsx`). Cache dev Turbopack dimatikan (`next.config.ts`).

Sesi keempat dan kelima:

10. `9b1d192` dukungan kunci API Supabase baru (`sb_publishable_`/`sb_secret_`). `b5b13ba` pembayaran QRIS manual milik pemilik + konfirmasi admin; Xendit disimpan tetapi nonaktif. `6506129` `LENTERA_BACKEND=embedded` selalu menang.
11. `7e21185`..`dd59ec1` Supabase: migrasi 0001–0006, kurikulum terbit, admin pertama.
12. `efce061`, `468e48f` konfigurasi Netlify (`netlify.toml`, adapter `@netlify/plugin-nextjs` wajib ditulis; tanpanya semua rute 404). `ae39e72` perbaikan hydration di Netlify (Bug #8).
13. `ad8ffbf` e2e membaca sesi Supabase (`sb-<project>-auth-token`) selain `lentera.session`, sehingga suite pembelajar bisa dijalankan ke situs live.

## 7. File terakhir yang diubah

1. Sesi kelima: `src/instrumentation-client.ts`, `e2e/run.mjs`, `netlify.toml`, `.gitignore`.
2. Sesi keempat: `src/lib/qris.ts`, `src/lib/server/manual-payments.ts`, `src/components/ManualQrisCheckout.tsx`, `supabase/migrations/0005_manual_qris.sql`, `0006_lint_fixes.sql`, `src/lib/server/db.ts`, `src/lib/server/api.ts`.
3. Sesi ketiga: `e2e/run.mjs`, `e2e/admin.mjs`, `scripts/export-content.ts`, `tests/admin.test.ts`.
4. `src/lib/client/store.ts` (serah terima tamu → akun), `src/components/admin/CmsPanel.tsx`, `next.config.ts`.
5. Sesi kedua: `src/app/admin/page.tsx`, `src/components/admin/*`, `src/components/Charts.tsx`, `src/lib/format.ts`, `src/components/ui.tsx`, `src/app/page.tsx`.
6. Dokumen: `PROJECT_STATUS.md`, `ARCHITECTURE.md`, `TODO.md`, `DECISIONS.md`.

## 8. Langkah persis berikutnya

1. `cd projects/lentera-english && npm install` (bila `node_modules` belum ada).
2. Jalankan `npx tsc --noEmit`, `TZ=UTC npx vitest run` (harus 100/100), `npx tsx scripts/check-content.ts`, `npx next build`, lalu kedua suite e2e di bawah.
3. Supabase: proyek "Lentera english" (ref `jewotwcnnvjrvxcflamn`, region Tokyo, organisasi `deptsus`). Dua proyek sebelumnya (`tjcnvrfrtipzksohvstd`, `vkajprusgayizxhbdwcz`) sudah tidak dipakai.
   - **Migrasi lengkap 0001–0006** (0003–0005 lewat SQL Editor dengan `supabase/manual/apply-0003-0005.body.sql` dari commit `564ee6c`; lainnya lewat konektor). Diperiksa: 36 tabel semuanya ber-RLS; 36 fungsi, isi tiap fungsi identik (md5) dengan migrasi lokal, tidak ada yang bisa dipanggil `anon`/`authenticated`; trigger `on_auth_user_created` terpasang; harga dan kedua QR benar. Security advisor: tinggal 20 catatan INFO "RLS tanpa policy" pada tabel kurikulum/log, disengaja (hanya dibaca lewat server).
   - **Kurikulum terbit**: versi 1 "Kurikulum bawaan" (14 pelajaran, 276 soal, 74 kosakata, 11 skenario), diimpor dari `supabase/manual/content-rows.json` (commit `e667eae`). Jangan impor ulang setelah CMS dipakai (DECISIONS B2).
   - Isi kurikulum terbit dicocokkan dengan versi lokal (md5 soal, kosakata, percakapan, pelajaran, ujian, PR): identik. Ekstensi `http` yang dipakai untuk mengambil berkas sudah dimatikan pemilik.
   - Environment cloud `ui-ux-pro-max-skill` berisi `SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` dan izin host proyek ini. **Belum**: `SUPABASE_SECRET_KEY` (rahasia; diisi pemilik sendiri sebagai environment variable, bukan network secret, karena browser di container juga lewat proxy dan Supabase menolak kunci rahasia dari browser).
   - Auth: periksa "Confirm email" (Authentication → Sign In / Providers). Pengirim email bawaan Supabase hanya mengirim ke anggota tim proyek, jadi sebelum dibuka ke publik pilih: matikan konfirmasi email, atau pasang SMTP sendiri.
   - **Admin pertama**: akun pemilik dibuat lewat Authentication → Users (auto confirm); trigger `on_auth_user_created` terbukti membuat profil dan baris `streaks` di Supabase sungguhan; peran dinaikkan ke `admin` dan fungsi admin (`list_curriculum_versions`, `admin_payment_overview`) menerimanya.
   - **Belum**: uji daftar/sinkronisasi/papan peringkat/pembayaran dengan akun pelajar di server live (menunggu keputusan konfirmasi email, butir 4b).
4. **Live di Netlify**: proyek `lentera-english-app` (id `7ac1ecfe-43de-428e-8dc4-8a7f54524227`), https://lentera-english-app.netlify.app. Repo GitHub tersambung (branch `ccr-17d3d5e4-jx43zs`, base directory `projects/lentera-english`), jadi setiap push ke branch itu otomatis dideploy. Variabel di Netlify: `SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `APP_URL`, dan `SUPABASE_SECRET_KEY` (diisi pemilik, ditandai secret). Tanpa baris `[[plugins]] package = "@netlify/plugin-nextjs"` di `netlify.toml` semua rute 404.
   - **Diperiksa di server live** (Playwright, ukuran Pixel 7, 11/11 lolos): landing dengan harga coret, aplikasi tamu, pelajaran pertama berjalan, pelajaran Premium terkunci, halaman paket (diskon 15%, hanya QRIS), `/masuk` tersambung ke Supabase Auth (sandi salah ditolak dengan pesan berbahasa Indonesia), `/admin` meminta masuk, **nol error di konsol** setelah Bug #8 diperbaiki.
   - **Tugas pemilik yang belum**: (a) ~~Ganti kunci rahasia yang sempat terlihat di tangkapan layar~~ **Selesai 14 Nov 2026**: kunci baru dibuat, dipasang di Netlify, dideploy ulang, kunci lama dihapus; setelah penghapusan `/api/content` live tetap `db-1` (tabel kurikulum hanya terbaca dengan kunci rahasia). (b) ~~Konfirmasi email~~ **Dimatikan** (`mailer_autoconfirm: true`): pengirim email bawaan Supabase hanya mengirim ke anggota tim. Bila nanti memasang SMTP sendiri, konfirmasi bisa dinyalakan lagi. (c) ~~Site URL~~ **Selesai**: Site URL `https://lentera-english-app.netlify.app`, Redirect URL `https://lentera-english-app.netlify.app/**`. (d) Proyek Netlify kosong lama `lentera-english` (id `584512cc-…`) boleh dihapus. (e) Uji bayar sungguhan kedua QR, lalu konfirmasi di `/admin` live.
   - **Uji akun pelajar di live (14 Nov 2026)**: `E2E_BASE=https://lentera-english-app.netlify.app node e2e/run.mjs routes lesson` lolos semua (29 rute; tamu menuntaskan pelajaran, PR, ulangan, tantangan kilat, analitik, tema; daftar lewat Supabase Auth; progres tamu pindah ke akun; sinkron ke server; muncul di papan peringkat). Ditambah uji perangkat kedua: masuk ke akun yang sama di browser baru → XP, pelajaran tuntas, dan nama diambil dari server; tombol "Bayar Rp497.250 dengan QRIS" tampil (tidak ditekan); keluar menghapus sesi. Akun uji (`tamu…@lentera.test`) sudah dihapus, tidak ada baris tersisa.
   - Menjalankan e2e ke situs live **membuat akun sungguhan** di Supabase. Hapus sesudahnya (akun tanpa pembayaran bisa dihapus; `payment_transactions` sengaja menahan penghapusan akun yang punya transaksi). Jangan jalankan skenario `payment` atau `e2e/admin.mjs` ke live: keduanya butuh server embedded.
   - Render ditolak karena meminta kartu pembayaran walau paket gratis; Vercel belum diotorisasi.
   - `LENTERA_BACKEND=embedded` selalu memakai basis data lokal walaupun variabel Supabase ada (tes dan e2e tidak pernah menyentuh proyek sungguhan).
   - Konektor Supabase meminta konfirmasi pemilik untuk perintah yang dianggap merusak (`drop`, trigger pada `auth.users`, isi fungsi dengan `delete`); di aplikasi pemilik, pertanyaan itu tidak tampil sehingga selalu habis waktu. Jalur yang terbukti: SQL Editor.
5. Tanpa kredensial, pekerjaan berikutnya yang paling bernilai: menulis 24 pelajaran yang masih "Sedang disusun", ujian level B1 sampai C2, dan batas paket Free di server (TODO P1).

Menjalankan kedua suite e2e terhadap build produksi (basis data embedded harus masih baru untuk `e2e:admin`, karena skrip memeriksa nomor versi; jalankan `e2e:admin` lebih dulu):

```bash
cd projects/lentera-english
rm -rf /tmp/lentera-e2e && npx next build
LENTERA_BACKEND=embedded LENTERA_ALLOW_EMBEDDED=1 LENTERA_DEV_ADMIN_EMAIL=admin@lentera.test \
  LENTERA_DATA_DIR=/tmp/lentera-e2e/pglite npx next start -p 3100 &
npm run e2e:admin     # 67 pemeriksaan
npm run e2e           # 75 pemeriksaan; npm run e2e -- lesson exam untuk skenario tertentu
```

Mencadangkan kurikulum dari basis data: `npm run content:export` (konten kerja) atau `npm run content:export -- --published` (versi terbit). Berkas tersimpan di `backups/`. Untuk mode embedded, hentikan server lebih dulu.

Cara menjalankan lokal (tanpa layanan luar):

```bash
cd projects/lentera-english
LENTERA_BACKEND=embedded LENTERA_DEV_ADMIN_EMAIL=admin@lentera.test npx next dev -p 3100
# daftar dengan email admin@lentera.test di /daftar untuk mendapat peran admin
```
