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
- [~] Uji di browser bagian dashboard admin yang baru tampil: editor jawaban salah yang dikenali, pasangan, tugas menulis, kolom JSON, form PR/ujian/kosakata/audio, pindah urutan baris, impor ulang paket bawaan. Tambahkan ke `e2e/admin.mjs`.
- [ ] **Perbaiki skrip `package.json` yang menunjuk file tidak ada**: buat `e2e/run.mjs` dan `scripts/export-content.ts`, atau hapus skripnya.
- [ ] **Buat `e2e/run.mjs`** memakai `e2e/lib.mjs` (helper `answerCurrent`, `runSession`, `check` sudah ada). Ulangi alur yang sudah diverifikasi manual di sesi serah terima: pelajaran penuh sebagai tamu, daftar + progres tamu pindah, checkout QRIS + simulasi bayar → Premium aktif, checkout DANA tertunda + riwayat, percakapan sampai selesai, tes penempatan berhenti di A2, cek semua rute tanpa error.
- [x] Mesin belajar deterministik (penilaian, penguasaan, pengulangan berjarak, rekomendasi, buka-kunci, ujian, penempatan, gamifikasi).
- [x] Model konten + validator kualitas konten.
- [x] Skema database, RLS, fungsi SQL, sinkronisasi progres.
- [x] Backend pembayaran Xendit + simulator + 30 tes.
- [x] Akun lokal (mode embedded) dan alur daftar/masuk.
- [ ] Siapkan proyek Supabase: terapkan migrasi `0001`–`0004` (bukan `test-shim.sql`), aktifkan Auth email, set env, buat admin, impor + terbitkan kurikulum. Uji ulang daftar, sync, papan peringkat di sana.
- [ ] Verifikasi Xendit sandbox dengan kredensial uji: semua titik `VERIFY` di `src/lib/server/xendit.ts`, aktivasi QRIS/DANA/GOPAY, webhook ke URL HTTPS, simulasi + transaksi uji nyata. Sesudahnya baru boleh menyebut pembayaran siap produksi.

## P1 — Fitur utama

- [x] Ruang pelajaran 8 langkah (diuji ujung ke ujung).
- [x] Jalur belajar dengan aturan buka-kunci.
- [x] Dashboard dengan rekomendasi beralasan, misi, ringkasan.
- [x] Tes penempatan (diuji ujung ke ujung).
- [x] Simulator percakapan bercabang (diuji ujung ke ujung).
- [x] Halaman paket + checkout QRIS/DANA/GoPay + bukti dan riwayat transaksi (diuji dengan simulator).
- [x] Registrasi dan login (diuji dengan akun lokal).
- [~] Pusat Ulangan, Pusat PR (termasuk PR menulis), Pusat Ujian, Pusat Menyimak, latihan perbaikan/topik/tes ulang/Tantangan Kilat: halaman tampil tanpa error, logikanya teruji di unit test, tetapi sesinya belum dijalankan sampai selesai di browser. Tambahkan ke `e2e/run.mjs`.
- [~] Pustaka kosakata, pustaka tata bahasa, analitik, pencapaian, profil, pengaturan: tampil tanpa error; analitik dengan data dan tombol pengaturan belum diuji di browser.
- [~] Papan peringkat: SQL teruji; UI hanya diperiksa sebagai tamu. Uji dengan beberapa akun.
- [ ] Rekaman audio penutur asli (aksen US dan UK) untuk contoh, kosakata, menyimak, fonem. Daftarkan di `audio_resources`; pemutar sudah mendukung. Saat ini fallback ke suara perangkat.
- [ ] Tulis 24 pelajaran yang masih "Sedang disusun" (daftar di `content/index.ts`, field `planned`), lengkap 8 langkah.
- [ ] Ujian level B1, B2, C1, C2 (baru ada A1 dan A2).
- [ ] Tegakkan batas paket Free di server (nyawa, 10 ulangan per hari). Sekarang hanya di klien; konten Premium sudah dipangkas di server.
- [ ] Deploy (hosting Next.js + Supabase), domain HTTPS, env produksi.

## P2 — Fitur tambahan

- [ ] Alur admin untuk transaksi `NEEDS_REVIEW` (periksa, aktifkan manual, atau catat refund).
- [ ] Rekonsiliasi berkala transaksi `PENDING` (sekarang status hanya dicek ulang saat pengguna membuka halaman checkout; webhook tetap sumber utama).
- [ ] Pengingat masa aktif Premium hampir habis (saat ini hanya lencana "Segera berakhir" di halaman paket bila ≤ 7 hari).
- [ ] Unggah audio dari dashboard admin (storage). Saat ini admin hanya bisa mendaftarkan URL berkas yang sudah diunggah.
- [ ] Editor visual untuk skenario percakapan dan panduan pelafalan di dashboard admin (sekarang kolom JSON).
- [ ] Uji mode belajar offline (IndexedDB + `public/sw.js`) di browser, termasuk sinkronisasi setelah kembali online.
- [ ] `scripts/export-content.ts`: ekspor kurikulum dari DB ke file, agar perubahan CMS bisa dicadangkan.
- [ ] README khusus proyek (ringkas, menunjuk ke empat dokumen ini).
- [ ] CI untuk folder ini (workflow repo tidak mencakup `projects/**`).

## P3 — Penyempurnaan

- [ ] QA visual mode gelap di semua halaman.
- [ ] Audit aksesibilitas (pembaca layar pada `SessionRunner`, kontras, fokus).
- [x] Peringatan React "script tag" dari skrip tema di `src/app/layout.tsx`: tidak muncul lagi setelah bug landing diperbaiki.
- [ ] Rapikan ekspresi progress bar di `SessionRunner` (`items.length + (result ? 0 : 0)`; tidak salah, hanya berlebihan).
- [ ] Optimasi ukuran pack konten yang dikirim ke klien bila kurikulum membesar (mis. muat per level).
