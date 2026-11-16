# TODO — Lentera English

Status: **[x] selesai** (teruji) · **[~] berjalan** (ada kodenya, belum tuntas atau belum teruji penuh) · **[ ] belum dimulai**

Bukti dan detail setiap item ada di `PROJECT_STATUS.md`. Jangan membangun ulang item yang sudah `[x]`.

---

## P0 — Bug kritis dan fondasi

- [x] **Perbaiki `/` (error 500) dan `next build` yang gagal.** `src/app/page.tsx` memanggil `rupiah()` dari modul `'use client'` (`src/components/ui.tsx`). Pindahkan `rupiah`, `dateId`, `dateTimeId` ke `src/lib/format.ts` (tanpa `'use client'`), ekspor ulang dari `ui.tsx`, impor dari `@/lib/format` di `page.tsx`. Selesai bila `npx next build` sukses dan `/` tampil.
- [x] **Buat dashboard admin** `src/app/admin/page.tsx` (teruji: `npm run e2e:admin` 42 pemeriksaan, `tests/admin.test.ts`; detail di PROJECT_STATUS 2f). Backend: `POST /api/admin` dengan aksi `content`, `upsert`, `delete`, `publish`, `versions`, `restore`, `import-bundled`, `payments`. Isi minimal:
  - Pembayaran: jumlah pengguna Free/Premium, transaksi berhasil/tertunda/gagal/ditinjau, pendapatan bulan dan tahun ini, pendapatan per bulan, riwayat pembayaran, masa aktif pelanggan, status dan log webhook (semua sudah dikembalikan oleh aksi `payments`).
  - CMS: daftar dan form edit untuk bab, unit, pelajaran (status draft/published, passing score, materi, contoh, tujuan), soal + opsi (kunci, penjelasan, alasan salah, tingkat kesulitan, audio), PR, ujian, audio; tombol terbitkan dengan daftar masalah dari gerbang kualitas; daftar versi + rollback.
  - Halaman menolak non-admin (API sudah menolak dengan 403).
- [x] Uji di browser editor admin lainnya: jawaban salah yang dikenali, pasangan, tugas menulis, kolom JSON, form PR/ujian/kosakata/audio, pindah urutan baris, impor ulang paket bawaan (`e2e/admin.mjs`, 61 pemeriksaan).
- [x] **Perbaiki skrip `package.json` yang menunjuk file tidak ada**: buat `e2e/run.mjs` dan `scripts/export-content.ts`, atau hapus skripnya.
- [x] **Buat `e2e/run.mjs`** (64 pemeriksaan, detail di PROJECT_STATUS 2g) memakai `e2e/lib.mjs` (helper `answerCurrent`, `runSession`, `check` sudah ada). Ulangi alur yang sudah diverifikasi manual di sesi serah terima: pelajaran penuh sebagai tamu, daftar + progres tamu pindah, checkout QRIS + simulasi bayar → Premium aktif, checkout DANA tertunda + riwayat, percakapan sampai selesai, tes penempatan berhenti di A2, cek semua rute tanpa error.
- [x] Mesin belajar deterministik (penilaian, penguasaan, pengulangan berjarak, rekomendasi, buka-kunci, ujian, penempatan, gamifikasi).
- [x] Model konten + validator kualitas konten.
- [x] Skema database, RLS, fungsi SQL, sinkronisasi progres.
- [x] Backend pembayaran Xendit + simulator + 30 tes.
- [x] Akun lokal (mode embedded) dan alur daftar/masuk.
- [ ] Siapkan proyek Supabase: terapkan migrasi `0001`–`0004` (bukan `test-shim.sql`), aktifkan Auth email, set env, buat admin, impor + terbitkan kurikulum. Uji ulang daftar, sync, papan peringkat di sana.
- [x] ~~Verifikasi Xendit sandbox~~ Diganti: pemilik produk memilih QRIS milik sendiri dengan konfirmasi admin (DECISIONS A4). Kode Xendit disimpan nonaktif.
- [x] Pembayaran QRIS manual: QR per paket, laporan "Saya sudah bayar", antrean konfirmasi/tolak di dashboard admin, harga tahunan diskon 15% (tes SQL + e2e).
- [ ] Uji pembayaran nyata ke kedua QR dari minimal dua aplikasi berbeda, lalu konfirmasi lewat dashboard di server produksi.
- [ ] (Lama, hanya bila Xendit dihidupkan lagi) Verifikasi Xendit sandbox dengan kredensial uji: semua titik `VERIFY` di `src/lib/server/xendit.ts`, aktivasi QRIS/DANA/GOPAY, webhook ke URL HTTPS, simulasi + transaksi uji nyata. Sesudahnya baru boleh menyebut pembayaran siap produksi.

## P1 — Fitur utama

- [x] Ruang pelajaran 8 langkah (diuji ujung ke ujung).
- [x] Jalur belajar dengan aturan buka-kunci.
- [x] Dashboard dengan rekomendasi beralasan, misi, ringkasan.
- [x] Tes penempatan (diuji ujung ke ujung).
- [x] Simulator percakapan bercabang (diuji ujung ke ujung).
- [x] Halaman paket + checkout QRIS/DANA/GoPay + bukti dan riwayat transaksi (diuji dengan simulator).
- [x] Registrasi dan login (diuji dengan akun lokal).
- [x] Pusat Ulangan, Pusat PR (termasuk PR menulis), Pusat Ujian (ujian unit), Pusat Menyimak, latihan perbaikan, Tantangan Kilat: sesinya dijalankan sampai selesai di browser oleh `e2e/run.mjs`.
- [~] Tes ulang penguasaan (jeda 20 jam, dua hari berbeda), latihan per topik, dan ujian level: logikanya teruji di unit test, sesinya belum dijalankan di browser.
- [~] Pustaka kosakata, pustaka tata bahasa, pencapaian, profil: tampil tanpa error. Analitik dengan data, tema, dan aksen sudah diuji; target harian dan reset data belum.
- [x] Papan peringkat: SQL teruji; sejak Rilis 8 liga dan teman diuji dengan beberapa akun sekaligus (`e2e:habits`).
- [ ] Rekaman audio penutur asli (aksen US dan UK) untuk contoh, kosakata, menyimak, fonem. Daftarkan di `audio_resources`; pemutar sudah mendukung. Saat ini fallback ke suara perangkat.
- [x] Tahap 1: 8 pelajaran A1–A2 (`content/a1-4.ts`, `content/a2-2.ts`). Sudah terbit (db-2).
- [x] Tahap 2: 16 pelajaran B1–C2 + ujian level B1–C2 (`content/b1-2.ts`, `b2-2.ts`, `c1-2.ts`, `c2-2.ts`). Sudah terbit (db-4).
- [x] Tahap 3: 11 materi menyimak B1–C2 (dengan dikte) dan 5 skenario percakapan B2–C2, PR menyimak per bab B1–C2 (`content/listening-upper.ts`, `content/conversations-upper.ts`; `npm run e2e:skills`). Menunggu pemeriksaan pemilik sebelum diterbitkan.
- [x] Rilis 1 dari `ROADMAP.md`: Pijar bergerak, 6 cerita bergambar A1–A2, Catatan Pemeriksaan (migrasi 0008). Pemilik: jalankan `apply-0008.sql`, lalu impor dan terbitkan.
- [x] Rilis 2 dari `ROADMAP.md`: 10 pelajaran A2–B1, 4 cerita, 2 percakapan, 2 materi menyimak, PR menulis tiap bab A2–B1.
- [x] Rilis 3 dari `ROADMAP.md`: ujian level bergaya CEFR dinilai di server, bank soal khusus ujian A1–C2, pembahasan + latihan perbaikan, jeda dan latihan wajib, sertifikat dengan kode verifikasi (`tests/rilis3.test.ts`, `e2e/level-exams.mjs`). Pemilik: jalankan `apply-0009.sql`, lalu impor ulang + terbitkan.
- [x] Ikut deploy Rilis 3: perbaikan urutan cerita di rencana mingguan (commit `ca64712`).
- [x] Rilis 4 dari `ROADMAP.md`: PR mingguan otomatis, tugas menulis B2–C2 dengan contoh bertingkat, kalender PR (.ics), pengingat PR di HP, tab PR di `/admin` (`tests/rilis4.test.ts`, `e2e/homework.mjs`). Pemilik: jalankan `apply-0010.sql`, lalu impor ulang + terbitkan.
- [x] Rilis 5 dari `ROADMAP.md`: 12 pelajaran B2–C2 (9 per level), 4 cerita bercabang B1–C2, 4 skenario dan 4 materi menyimak C1–C2 (`tests/rilis5.test.ts`, `e2e:skills`). Pemilik: jalankan `apply-0011.sql`, lalu impor ulang + terbitkan.
- [x] Rilis 6 dari `ROADMAP.md`: tab Rekaman (rekam/unggah, Supabase Storage), audit UI/UX dengan `ui-ux-pro-max` (kontras, target 44 px, layar 320 px, sambutan), ukuran huruf, getaran, label "Bercabang" untuk tamu (`tests/rilis6.test.ts`, `e2e:recordings`, `e2e:ui`). Pemilik: jalankan `apply-0012.sql`, lalu rekam di tab Rekaman dan terbitkan.
- [x] Keputusan pemilik (15 Nov 2026): audio tetap memakai suara bawaan perangkat; tab Rekaman tidak diisi. Fiturnya tetap tersedia bila suatu saat ada rekaman (pemilik atau pengisi suara).
- [x] Perbaikan simpan profil (avatar saja bisa disimpan; avatar sampai ke papan peringkat), 8 avatar karakter (satu pink #E89EB8), logo baru (`tests/profil.test.ts`, `e2e:ui`).
- [x] Rilis 8 "Kebiasaan Belajar": pengingat belajar harian pada jam pilihan pelajar, liga mingguan 5 divisi, teman lewat kode/tautan undangan, tantangan XP 3/7 hari, latihan shadowing, APK 1.3.0 dengan ikon lentera (`tests/rilis8.test.ts`, `e2e:habits`). `apply-0013.sql` sudah dijalankan pemilik dan diperiksa (15 Nov 2026).
- [x] Penghematan Liga & Teman (sinkron hanya bila ada event, indeks XP per pelajar, penempatan liga massal per 5 menit): selesai di Rilis 9.
- [x] Rilis 9 "Aman & Terukur": header keamanan + CSP, batas permintaan, verifikasi 2 langkah admin, privasi + hapus akun + Hubungi Kami, pemantauan error, cadangan harian, Analitik dan Kesehatan di /admin, `SCALING.md` (`tests/rilis9.test.ts`, `e2e:ops`). Pemilik: jalankan `apply-0014.sql`, lalu aktifkan verifikasi 2 langkah di /admin → Kesehatan dan nyalakan auto recharge Netlify.
- [x] `apply-0014.sql` dijalankan pemilik dan diperiksa; verifikasi 2 langkah admin aktif (16 Nov 2026). Sisa: nyalakan auto recharge Netlify.
- [x] Rilis 10 "Kelas" + aplikasi Android 2.0.0 tanpa Chrome: lisensi sekolah di /admin → Sekolah, Ruang Guru, Kelas Saya, Pantau Anak, `/sekolah`, APK 2.0.0 WebView (`tests/rilis10.test.ts`, `e2e:classes`, `e2e:native`). `apply-0015.sql` sudah dijalankan pemilik dan diperiksa (16 Nov 2026). Pemilik: buat lisensi pertama di /admin → Sekolah bila ada sekolah yang berminat.
- [ ] Uji APK 2.0.0 di HP sungguhan (suara, pengingat harian pada jamnya, izin mikrofon untuk shadowing, berbagi, cetak sertifikat).
- [x] Rilis 11 "Jalur Khusus & SEO": 3 jalur (Kerja, TOEFL ITP/IELTS, Anak) × 3 pelajaran, pelajaran pertama gratis, `/app/jalur`, halaman materi publik `/materi`, sitemap, robots, data terstruktur (`tests/rilis11.test.ts`, `e2e:tracks`). Pemilik: jalankan `apply-0016.sql`, lalu /admin → Konten → "Impor materi bawaan" → Terbitkan; daftarkan situs di Google Search Console dan kirim `sitemap.xml`.
- [ ] Tambah pelajaran tiap jalur khusus (IELTS Speaking dan Reading, TOEFL Listening, presentasi kerja, cerita anak bergambar).
- [ ] Sesudah Rilis 11: Rilis 7 "Siap Tumbuh" (Play Store, QRIS otomatis) bila pemilik siap.
- [x] Pengingat PR terbukti sampai di HP sungguhan (15 Nov 2026, HP Android pemilik). Fungsi terjadwal Netlify `homework-reminders` terdaftar (`@hourly`).
- [ ] Perbesar bank soal ujian level (sekarang 12 + 8 + 8 soal per level); batas waktu ujian level belum dicek server (hanya di perangkat).
- [x] Tahap 4: rencana belajar mingguan untuk pelanggan tahunan (`src/lib/engine/plan.ts`, `/app/plan`, kartu di Beranda; `tests/plan.test.ts`, e2e `payment`).
- [x] Ujian level B1, B2, C1, C2 (Rilis 3: semua level A1–C2 punya ujian empat bagian).
- [ ] Tegakkan batas paket Free di server (nyawa, 10 ulangan per hari). Sekarang hanya di klien; konten Premium sudah dipangkas di server.
- [ ] Deploy (hosting Next.js + Supabase), domain HTTPS, env produksi.

## P2 — Fitur tambahan

- [ ] Ganti QR paket dari dashboard admin (unggah foto atau tempel isi kode; server memvalidasi nominal dan checksum).
- [ ] Beri tahu admin (mis. email) saat ada pembayaran baru yang dilaporkan.
- [ ] Alur admin untuk transaksi `NEEDS_REVIEW` (hanya relevan bila Xendit dihidupkan).
- [ ] Rekonsiliasi berkala transaksi `PENDING` Xendit (hanya relevan bila Xendit dihidupkan).
- [ ] Pengingat masa aktif Premium hampir habis (saat ini hanya lencana "Segera berakhir" di halaman paket bila ≤ 7 hari).
- [ ] Unggah audio dari dashboard admin (storage). Saat ini admin hanya bisa mendaftarkan URL berkas yang sudah diunggah.
- [ ] Editor visual untuk skenario percakapan dan panduan pelafalan di dashboard admin (sekarang kolom JSON).
- [ ] Uji mode belajar offline (IndexedDB + `public/sw.js`) di browser, termasuk sinkronisasi setelah kembali online.
- [x] `scripts/export-content.ts`: ekspor kurikulum dari DB ke file (`npm run content:export`), teruji bolak-balik ekspor → impor.
- [ ] Outbox event tamu tumbuh tanpa batas selama pengguna tidak pernah mendaftar (tersimpan di localStorage). Batasi atau ringkas untuk tamu jangka panjang.
- [ ] README khusus proyek (ringkas, menunjuk ke empat dokumen ini).
- [ ] CI untuk folder ini (workflow repo tidak mencakup `projects/**`).

## P3 — Penyempurnaan

- [ ] QA visual mode gelap di semua halaman.
- [ ] Audit aksesibilitas (pembaca layar pada `SessionRunner`, kontras, fokus).
- [x] Peringatan React "script tag" dari skrip tema di `src/app/layout.tsx`: tidak muncul lagi setelah bug landing diperbaiki.
- [ ] Rapikan ekspresi progress bar di `SessionRunner` (`items.length + (result ? 0 : 0)`; tidak salah, hanya berlebihan).
- [ ] Optimasi ukuran pack konten yang dikirim ke klien bila kurikulum membesar (mis. muat per level).
