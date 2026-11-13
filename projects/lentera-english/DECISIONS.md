# DECISIONS — Lentera English

Keputusan di bawah sudah berlaku di kode. **Jangan mengubahnya tanpa persetujuan pemilik produk.**
Bagian A berasal langsung dari permintaan pemilik produk. Bagian B adalah keputusan teknis
yang diambil saat implementasi; ikuti juga, dan minta persetujuan sebelum mengubahnya.

---

## A. Keputusan pemilik produk

### A1. Tanpa AI
- Tidak ada ChatGPT, Claude, Gemini, API LLM, AI generatif, tutor AI, soal buatan AI saat runtime, rekomendasi berbasis AI/ML, atau penilaian ucapan berbasis AI.
- Semua pelajaran, penjelasan, soal, jawaban, koreksi, dan rekomendasi berasal dari konten terstruktur dan algoritma deterministik.
- Tidak boleh mengklaim penilaian pelafalan otomatis. Yang ada: contoh audio, IPA, ilustrasi posisi mulut, dan perekam untuk membandingkan sendiri.

### A2. Kurikulum dan pedagogi
- Pengguna Indonesia, CEFR A1 sampai C2, penjelasan berbahasa Indonesia dengan contoh bahasa Inggris.
- Urutan wajib setiap pelajaran: pengantar → materi → contoh benar/salah → latihan terbimbing → latihan mandiri → PR → tes penguasaan → jadwal ulangan.
- Setiap soal wajib punya jawaban benar, penjelasan, alasan setiap jawaban salah, petunjuk opsional, dan tingkat kesulitan. Jangan hanya menampilkan "Salah".
- Pita penguasaan: <50 perlu mengulang dasar, 50–69 perlu latihan tambahan, 70–84 berkembang, 85–94 kuat, 95–100 sangat baik.
- Minimal 85% untuk membuka tingkat berikutnya. Penguasaan tidak boleh ditentukan dari satu kuis; butuh performa berulang dan ulangan tertunda.
- Pengulangan berjarak 1, 3, 7, 14, 30 hari; salah memendekkan jarak; benar berulang memanjangkannya; riwayat disimpan di database.
- Ada tes penempatan, ujian pelajaran, ujian unit, dan ujian level CEFR.
- Kualitas di atas kuantitas: jangan mengisi aplikasi dengan ratusan soal berulang.
- Jangan ada tombol kosong atau fungsi palsu.

### A3. Paket dan harga
- Free: Rp0. Premium Bulanan: Rp58.500 untuk 30 hari. Premium Tahunan: Rp585.000 untuk 365 hari.
- Posisi harga sekitar 70% di bawah patokan Rp195.000 per bulan.
- Manfaat Free dan Premium sesuai daftar di `src/lib/plans.ts`.

### A4. Pembayaran
- Hanya tiga metode: **QRIS, DANA, GoPay**. Gateway: **Xendit**, dengan endpoint dari dokumentasi resmi (tidak mengarang endpoint atau SDK). Sandbox dulu.
- Alur: pilih paket → pilih metode → backend membuat transaksi di Xendit → pengguna membayar → backend menerima dan memverifikasi webhook → Premium aktif otomatis → bukti dan riwayat tampil di akun.
- Premium tidak pernah aktif hanya dari halaman redirect sukses.
- Validasi nominal, mata uang IDR, ID transaksi, dan status. Webhook duplikat tidak boleh memperpanjang dua kali.
- API key dan secret hanya di environment variable backend. Data sensitif pembayaran pengguna tidak disimpan. Pengguna tidak bisa mengubah dirinya sendiri menjadi Premium.
- Masa aktif dihitung sejak pembayaran berhasil (30 / 365 hari). Tidak ada auto-debit; pengguna memperpanjang sendiri.
- Saat masa aktif habis, akun otomatis kembali Free; riwayat belajar, XP, beruntun, pencapaian, dan progres tetap tersimpan.
- Dashboard admin wajib menampilkan: total pengguna Free dan Premium, transaksi berhasil/tertunda/gagal, pendapatan bulanan dan tahunan, riwayat pembayaran, masa aktif Premium pengguna, status webhook dan log transaksi.
- **Jangan menyebut sistem pembayaran siap produksi** sebelum kredensial produksi, aktivasi metode pembayaran, webhook HTTPS, dan transaksi nyata berhasil diuji. Status saat ini: belum siap produksi.

### A5. Produk dan teknologi
- Frontend Next.js + TypeScript + Tailwind. Backend Supabase (PostgreSQL).
- Mobile-first, modern, premium, ramah, berwarna tapi tidak kekanak-kanakan, mode terang dan gelap, maskot orisinal.
- Identitas orisinal: terinspirasi mekanik belajar terbaik, bukan meniru produk lain.
- Biaya awal rendah: tanpa biaya API AI, tanpa layanan berbayar yang tidak perlu, arsitektur sederhana.
- Konten bisa diedit administrator tanpa mengubah kode.
- Serah terima: jangan memulai dari nol atau membangun ulang pekerjaan yang sudah berfungsi.

---

## B. Keputusan teknis implementasi

### B1. Struktur dan alat
- Aplikasi berada di `projects/lentera-english/` di dalam repo `ui-ux-pro-max-skill`; kerja di branch, tidak push ke `main`.
- TypeScript dipatok ke versi 5 (`^5.9.3`). Saat instalasi awal npm memasang TS 7; versi itu sengaja diganti ke 5. Jangan menaikkan mayor versi tanpa menjalankan ulang typecheck, tes, dan build.
- Playwright diambil dari instalasi global lingkungan, bukan dependency npm.
- Antarmuka berbahasa Indonesia; konten belajar berbahasa Inggris.

### B2. Konten
- Kurikulum awal ditulis sebagai TypeScript di `content/` lewat DSL (`content/dsl.ts`), divalidasi oleh `src/lib/content/validate.ts`.
- **Sumber kebenaran setelah impor pertama adalah database** (diedit lewat CMS). Pengguna hanya menerima snapshot versi yang terbit (`curriculum_versions.is_current`). Paket bawaan dari `content/` hanya dipakai bila belum ada versi terbit.
- Perhatian: aksi admin `import-bundled` melakukan upsert dan akan menimpa perubahan CMS pada baris yang sama. Jangan menjalankannya lagi setelah CMS dipakai tanpa persetujuan.
- ID soal stabil: `<lessonId>.<huruf tahap><nomor>` (mis. `a2-past-be.g1`). Jangan ubah ID soal yang sudah terbit; riwayat jawaban merujuk ID itu.
- Pelajaran yang belum ditulis ditampilkan sebagai "Sedang disusun", bukan disembunyikan dan bukan diisi soal tiruan.
- Konten gratis: bab A1 "Kenalan Pertama" dan "Kegiatan Sehari-hari", skenario `introduce` dan `restaurant`, 4 materi menyimak A1, kosakata A1. Sisanya Premium.

### B3. Mesin belajar (nilai di `src/lib/engine/config.ts`)
- Jendela bukti 20 jawaban terakhir; skor diskalakan turun bila jawaban < 8; bobot kesulitan 0.8–1.6; jawaban terbaru berbobot lebih; jawaban dengan petunjuk bernilai 0.5; jawaban sangat lambat 0.9.
- Topik "provisional" pada skor ≥85 dengan ≥8 jawaban; "mastered" hanya setelah tes ulang (7 soal, ≥85%) minimal 20 jam kemudian dan di ≥2 hari berbeda. Ulangan terjadwal yang gagal mencabut status dikuasai.
- Rekomendasi kelemahan dinilai dari akurasi bukti (bukan skor yang diskalakan), agar "bukti belum cukup" tidak dianggap "lemah".
- Pola kesalahan aktif bila ≥2 kesalahan dalam 7 hari sejak terakhir dibereskan; latihan perbaikan 8 soal, naik tingkat setelah 2 benar berturut-turut, turun setelah salah, lulus 85%.
- Kelulusan: tes penguasaan pelajaran 85%, ujian unit dan level 80%, blok tes penempatan 75%.
- Pengulangan berjarak: setelah 30 hari jarak dikali 1,5 (maks 120 hari); salah mundur 2 langkah.
- Pemilihan dan pengacakan soal memakai seed deterministik (mulberry32), sehingga dapat direproduksi.
- Penilaian jawaban ketik: normalisasi (huruf kecil, tanda baca, kontraksi) lalu cocok persis dengan jawaban yang ditulis; tidak ada pencocokan "mirip".
- PR menulis dinilai dengan daftar periksa deterministik (jumlah kata, unsur wajib) dan contoh jawaban; tidak menilai mutu tulisan.

### B4. Gamifikasi
- XP hanya dari kegiatan belajar. Server membatasi 200 XP per event dan 3.000 XP per hari.
- Nyawa: 5, pulih 1 per 60 menit; berkurang hanya pada latihan mandiri dan tes penguasaan, hanya untuk Free; menyelesaikan sesi ulangan memberi +1. Free dibatasi 10 ulangan per hari.
- Beruntun dihitung per hari kalender; 1 pelindung awal, +1 tiap bab tuntas (maks 3).
- Misi harian/mingguan dirotasi deterministik per tanggal. Papan peringkat mingguan mulai Senin waktu Jakarta, dari ledger XP server.

### B5. Arsitektur data dan keamanan
- State pembelajar offline-first di perangkat, disinkronkan lewat outbox event idempoten + snapshot. Mode tamu berfungsi penuh; progres tamu pindah ke akun saat login pertama.
- Klien tidak pernah menulis langsung ke database. Semua tulis lewat fungsi SQL `SECURITY DEFINER` yang hanya bisa dieksekusi `service_role`, dipanggil dari API route setelah sesi diverifikasi. RLS: baca baris sendiri saja.
- Status Premium dihitung dari periode `subscriptions` dan waktu sekarang, bukan dari flag tersimpan.
- Konten Premium dipangkas di server untuk akun Free.
- PGlite + migrasi yang sama untuk dev dan tes; `test-shim.sql` tidak pernah dijalankan di Supabase. Mode embedded ditolak di build produksi.
- Audio: rekaman manusia dari `audio_resources` bila ada; bila belum, suara bawaan perangkat dengan keterangan jujur di UI.
- Belajar offline (Premium): pack di IndexedDB + service worker untuk halaman dan aset.

### B6. Detail pembayaran
- Xendit Payments API v3, `api-version: 2024-11-11`, Basic auth, `type: PAY`, `capture_method: AUTOMATIC`.
- Jendela checkout 30 menit; setelah itu request dibatalkan di Xendit dan transaksi ditandai EXPIRED.
- Pembukaan checkout yang sama dipakai ulang (bukan duplikat); maksimal 10 checkout per akun per jam.
- Webhook diverifikasi dengan `x-callback-token` (perbandingan waktu-konstan). Kunci de-duplikasi `<event>:<payment_id>`. Rekonsiliasi lewat API status memakai gerbang validasi yang sama.
- Satu pembayaran maksimal satu periode langganan (unique `source_transaction_id`).
- Nominal/mata uang/metode/ID gateway tidak cocok → `NEEDS_REVIEW`, Premium tidak aktif. Uang yang masuk setelah jendela lokal habis tetap dihormati (Premium aktif).
- Perpanjangan lebih awal dimulai saat periode berjalan berakhir (hari yang sudah dibayar tidak hilang).
- Metadata ke Xendit hanya ID transaksi dan paket, tanpa data pribadi. Payload webhook disimpan tanpa `payment_details`.
- Endpoint simulasi pembayaran hanya untuk mode uji; ditolak bila kunci produksi.

### B7. Desain
- Warna brand ungu `#4b3fd6`, aksen amber `#f59e0b`, font Plus Jakarta Sans, sudut membulat besar, tombol bergaya "tekan" (border bawah tebal).
- Maskot Pijar (kunang-kunang berlentera) dalam SVG, dengan suasana happy/cheer/think/sad.
- Grafik SVG tanpa library; warna grafik `--chart` (`#4b3fd6` terang, `#7d72f2` gelap) sudah divalidasi kontras dan buta warna; setiap grafik punya tampilan tabel.
- Navigasi: sidebar di desktop, tab bawah 5 item di ponsel (Beranda, Jalur, Ulangan, Kelas, Profil).
