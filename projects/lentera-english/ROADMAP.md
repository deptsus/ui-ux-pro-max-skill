# ROADMAP — Lentera English (November 2026 – Juni 2027)

Rencana pembaruan jangka panjang yang dikerjakan **per rilis besar**. Satu rilis =
satu kali deploy, berisi banyak pembaruan sekaligus. Tujuannya menghemat kredit
Netlify dan token pengerjaan: tidak ada lagi deploy kecil-kecil untuk tiap
perubahan.

Tanggal di bawah adalah perkiraan, bukan janji. Urutan rilis boleh diubah pemilik.

---

## 1. Cara kerja rilis

### Siklus satu rilis

1. **Pemilik** mengirim satu pesan: "Kerjakan Rilis N", ditambah daftar masukan
   bernomor bila ada (salah ketik, soal yang kurang pas, permintaan tampilan).
2. **Claude** mengerjakan seluruh isi rilis di branch `ccr-17d3d5e4-jx43zs`.
   Setiap push hanya **menyimpan** pekerjaan di GitHub; Netlify tidak membangun
   apa pun (lihat aturan `[deploy]` di bawah).
3. Semua pemeriksaan dijalankan: `npx tsc --noEmit`, `npm run content:check`,
   unit test, dan seluruh suite e2e (`e2e:admin`, `e2e`, `e2e:admin-app`,
   `e2e:skills`, `e2e:curriculum`).
4. Satu commit bertanda `[deploy]` menerbitkan seluruh rilis ke situs live.
5. **Pemilik** memeriksa materi baru di `/admin` lalu menerbitkannya:
   Terbitkan → Impor ulang paket bawaan (ketik IMPOR) → Terbitkan kurikulum.
   Langkah ini tidak memakai deploy.
6. Bila rilis butuh perubahan basis data, pemilik menempelkan satu berkas SQL di
   Supabase SQL Editor (sekali per rilis, disiapkan lengkap oleh Claude).

### Aturan `[deploy]`

- Push biasa: tersimpan di GitHub, situs **tidak** dibangun ulang.
- Commit yang baris judulnya memuat `[deploy]`: Netlify membangun dan menerbitkan
  semua perubahan sejak deploy terakhir.
- Saklar darurat: variabel Netlify `LENTERA_ALWAYS_BUILD=1` membuat setiap push
  dibangun lagi. Tombol "Trigger deploy" di Netlify juga tunduk pada aturan ini.
- Skrip: `scripts/netlify-ignore.sh`, dipanggil dari `netlify.toml`.

### Apa yang butuh deploy, apa yang tidak

| Perubahan | Butuh deploy? | Caranya |
|---|---|---|
| Memperbaiki salah ketik, kunci jawaban, penjelasan soal | **Tidak** | `/admin` → Konten → edit → Terbitkan kurikulum |
| Menambah soal atau materi lewat CMS | **Tidak** | `/admin` → Konten → tambah → Terbitkan kurikulum |
| Materi baru yang ditulis Claude di `content/*.ts` | Ya, ikut rilis | Diimpor pemilik setelah rilis live |
| Tampilan, animasi, fitur baru | Ya, ikut rilis | — |
| Struktur basis data (tabel baru) | Ya + SQL Editor | Satu berkas SQL per rilis |
| Aplikasi Android (APK) | Hanya bila ikon, notifikasi, atau izin berubah | Aplikasi memuat situs live, jadi tampilan dan materi baru otomatis ikut |
| Bug yang merusak (tidak bisa masuk, tidak bisa bayar) | Ya, deploy darurat di luar jadwal | — |

### Kebiasaan hemat token

- Satu pesan per rilis berisi semua permintaan, bukan banyak pesan kecil.
- Masukan pemilik dikumpulkan dulu (mulai Rilis 1: fitur **Catatan Pemeriksaan**
  di `/admin`, lihat di bawah), lalu dikerjakan sekaligus di rilis berikutnya.
- Materi yang hanya perlu dibetulkan sedikit: betulkan langsung di `/admin`,
  tidak perlu menunggu rilis.

---

## 2. Kondisi sekarang (14 November 2026, versi konten 2026.11.4)

| Bagian | Jumlah | Catatan |
|---|---|---|
| Pelajaran 8 langkah | 38 | A1 12, A2 6, B1 5, B2 5, C1 5, C2 5 |
| Soal | 706 | 14 jenis soal + dikte |
| Materi menyimak | 17 | Audio suara perangkat (belum rekaman penutur asli) |
| Skenario percakapan | 16 | A1 2, A2 4, B1 3, B2 3, C1 2, C2 2 |
| PR | 50 | Tugas menulis baru ada di bab pertama A1 |
| Ujian | 21 | 15 ujian unit, 6 ujian level; soal ujian diambil dari soal pelajaran |
| Kosakata | 148 | |
| Rencana mingguan | ada | Untuk paket tahunan |
| Maskot Pijar | bergerak (Rilis 1) | 7 ekspresi beranimasi, bereaksi saat menjawab |
| Soal cerita | 6 cerita A1–A2 (Rilis 1) | 30 soal, adegan beranimasi |

Celah terbesar untuk paket tahunan: A2–C2 masih tipis (5–6 pelajaran per level),
ujian memakai soal yang sudah dilihat di pelajaran, tugas menulis hampir tidak
ada di atas A1, dan aplikasi belum terasa "hidup" (maskot dan cerita).

---

## 3. Rencana rilis

### Rilis 1 — "Pijar Hidup dan Cerita Bergambar" — **SELESAI 14 November 2026** (versi konten 2026.12.1)

**Maskot Pijar bergerak**
- Animasi SVG + CSS saja (tanpa pustaka tambahan, ringan untuk HP):
  melayang dan berkedip saat diam, melompat dengan percikan saat jawaban benar,
  menyemangati saat jawaban salah, berpikir saat memuat, tertidur saat beruntun
  terputus, menari saat pelajaran atau ujian lulus.
- Muncul di tempat yang tepat: hasil jawaban, akhir sesi, Beranda, halaman kosong.
- Menghormati pengaturan "kurangi gerakan" di HP (tetap gambar diam).

**Soal cerita bergambar (jenis latihan baru)**
- Cerita pendek 4–8 adegan: latar (rumah, sekolah, pasar, stasiun, kantor) dan
  tokoh tetap (Pijar dan 4–5 tokoh yang muncul berulang), digambar SVG dan
  dianimasikan: tokoh masuk, berbicara dengan balon kata, berpindah tempat.
- Tiap kalimat dibacakan (suara perangkat), dengan teks Inggris dan terjemahan
  yang bisa disembunyikan. Bisa diputar otomatis atau ketuk untuk lanjut.
- Setelah cerita: soal pemahaman, urutkan kejadian, kosakata dalam konteks,
  "siapa yang mengatakan ini".
- Isi awal: 6 cerita A1–A2 yang memakai tata bahasa pelajaran yang sudah ada.
- Tampil di Pusat Menyimak (tab "Cerita") dan masuk rencana mingguan.

**Catatan Pemeriksaan untuk pemilik**
- Di `/admin`, setiap soal/pelajaran/cerita bisa diberi catatan "perlu
  diperbaiki". Daftar catatan dibaca Claude di awal rilis berikutnya dan
  dikerjakan sekaligus.

**Basis data**: migrasi 0008 (tabel cerita dan catatan pemeriksaan), satu kali
lewat SQL Editor. Cerita bisa diedit di CMS tanpa deploy.

**Selesai bila**: semua cerita dimainkan sampai habis oleh e2e baru, animasi
lolos pemeriksaan "kurangi gerakan", tidak ada error konsol, unit test lolos.

### Rilis 2 — "Kedalaman A2–B1" — **SELESAI 14 November 2026** (versi konten 2026.12.2)

Dikerjakan dengan penyesuaian: present perfect dan passive sudah ada di B1/B2, jadi diganti should (A2) dan too/enough (B1). Isi akhirnya: A2 frekuensi, much/many/some/any, past continuous, must/have to, should, imperatif dan arah; B1 used to, gerund/to-infinitive, question tags, too/enough; 4 cerita, 2 percakapan, 2 materi menyimak, PR menulis tiap bab A2–B1.

Rencana awal:

- **+6 pelajaran A2** (A2 jadi 12, setara A1): present perfect dasar,
  kata keterangan frekuensi, countable/uncountable lanjutan, imperatif dan
  petunjuk arah, must/have to, past continuous.
- **+4 pelajaran B1**: used to, gerund vs to-infinitive, passive dasar,
  question tags.
- 4 cerita bergambar A2–B1, 2 skenario percakapan A2–B1, 2 materi menyimak.
- PR menulis untuk setiap bab A2 dan B1 (daftar periksa + contoh jawaban).
- Semua materi mengikuti aturan mutu yang sama: kesalahan khas penutur bahasa
  Indonesia, semua jawaban alternatif yang benar diterima, gerbang mutu lolos.

### Rilis 3 — "Ujian yang Sungguhan" — **SELESAI 14 November 2026** (versi konten 2027.1.0, migrasi 0009)

Isi akhirnya: bank soal khusus ujian per level (12 soal tata bahasa & kosakata, 2 teks bacaan × 4 soal, 2 rekaman × 4 soal, 2 tugas menulis), ujian empat bagian yang diambil dan dinilai di server (8 + 4 + 4 soal + 1 tugas per percobaan; waktu 30–45 menit), pembahasan per bagian dan per topik dengan tautan perbaikan, jeda 20 jam (dicek server) + latihan wajib untuk maksimal dua topik terlemah, sertifikat dengan kode verifikasi di `/sertifikat`. Ikut terbit: perbaikan urutan cerita di rencana mingguan (commit `ca64712`).

Catatan untuk rilis berikutnya: bank soal masih kecil (percobaan ulang sering memunculkan soal yang sama dalam urutan lain). Tambahkan soal ke bank lewat CMS (tahap soal "exam", lalu daftarkan ID-nya di kolom "Bagian ujian level") atau di `content/exam-bank.ts`.

Rencana awal:

- **Bank soal khusus ujian** yang tidak muncul di pelajaran, supaya ujian
  menguji pemahaman, bukan hafalan soal.
- **Ujian level bergaya CEFR** dengan bagian terpisah: tata bahasa & kosakata,
  membaca, menyimak, menulis (daftar periksa). Lulus bila tiap bagian ≥ 60% dan
  total ≥ 80%.
- **Halaman pembahasan ujian**: nilai per bagian dan per topik, langsung
  terhubung ke latihan perbaikan untuk topik yang lemah.
- **Sertifikat penyelesaian level** (halaman siap cetak dengan kode
  verifikasi). Ditulis jujur sebagai sertifikat dari Lentera, bukan sertifikat
  CEFR resmi.
- Jadwal ujian ulang yang wajar (jeda dan latihan wajib sebelum mengulang).

### Rilis 4 — "PR dan Menulis" — **SELESAI 15 November 2026** (versi konten 2027.2.0, migrasi 0010)

Isi akhirnya:
- **PR Mingguan otomatis** (`src/lib/engine/weekly.ts`): sekitar 10 soal, disusun sekali seminggu dengan aturan tetap: soal dari topik yang dilatih 7 hari terakhir (maks. 3 topik, bergiliran) dan soal dari kesalahan sendiri (soal yang terakhir dijawab salah dalam 30 hari, lalu soal baru dari pola kesalahan yang belum dibereskan). Tenggat Minggu 23.59, minimal dua hari setelah PR tersusun. Tidak dibuat bila bahannya kurang dari 4 soal.
- **Tugas menulis B2–C2** (`content/writing-upper.ts`): ringkasan berita (B2), email melaporkan rapat (B2), opini (C1), ringkasan akademik (C1), surat formal usulan (C2), kolom opini (C2). Ringkasan punya teks sumber dan batas atas kata. Tiap tugas punya tiga contoh bertingkat (Cukup, Baik, Sangat baik) yang semuanya lolos daftar periksa, masing-masing dengan catatan apa yang membuatnya lebih baik.
- **Kalender PR** di Pusat PR, plus tombol simpan tenggat ke kalender HP (.ics, alarm pukul 18.00 sehari sebelumnya).
- **Pengingat PR di HP** untuk semua pelajar yang masuk akun: sekali per PR, sekitar sehari sebelum tenggat, pukul 07.00–20.00 WIB, dikirim fungsi terjadwal Netlify setiap jam.
- **Tab "PR" di `/admin`**: ringkasan, grafik pengumpulan per minggu, per PR (PR mingguan digabung), per pelajar.

Rencana awal:

- **PR mingguan otomatis**: campuran soal dari topik minggu itu dan
  kesalahan si pelajar sendiri (aturan tetap, tanpa AI).
- **Tugas menulis untuk setiap bab B2–C2** (email, opini, ringkasan) dengan
  daftar periksa dan contoh jawaban bertingkat.
- **Kalender PR** dengan tenggat, plus pengingat di HP untuk pelajar yang
  mengizinkan notifikasi (saat ini notifikasi HP baru untuk admin).
- Pemilik bisa melihat ringkasan PR seluruh pelajar di `/admin`.

### Rilis 5 — "B2–C2 Lanjutan dan Cerita Bercabang" (perkiraan Maret 2027)

- **+4 pelajaran per level B2, C1, C2** (jadi 9 per level), misalnya: wish/if
  only, participle clauses, inversi lanjutan, register formal vs informal,
  bahasa persuasi, idiom dalam konteks kerja.
- **Cerita bercabang B1–C2**: pilihan pelajar menentukan jalan cerita
  (menggabungkan cerita bergambar dengan simulator percakapan).
- 4 skenario percakapan dan 4 materi menyimak tambahan untuk C1–C2.
- Rencana mingguan ikut bertambah otomatis karena jalurnya lebih panjang.

### Rilis 6 — "Suara Asli dan Poles UI/UX" (perkiraan April 2027)

- **Unggah rekaman audio** dari `/admin` (Supabase Storage). Rekaman penutur
  asli (aksen US dan UK) dipakai bila ada; suara perangkat tetap jadi cadangan.
  Butuh rekaman dari pemilik atau pengisi suara.
- **Audit UI/UX menyeluruh** dengan skill `ui-ux-pro-max` di repo ini:
  kontras, ukuran sentuh, alur pertama kali buka aplikasi (onboarding),
  pengaturan ukuran huruf, mode gelap, pemutar pelajaran di HP layar kecil.
- **Getaran ringan** saat benar/salah di Android (bisa dimatikan).
- Bila perlu: APK 1.3.0 (ikon/splash baru, izin notifikasi pelajar).

### Setelah Rilis 6 (Mei–Juni 2027, untuk dipilih pemilik)

- Liga mingguan dan tantangan antarteman.
- Dasbor guru/orang tua (melihat progres beberapa pelajar).
- Mode belajar luring penuh untuk materi Premium yang sudah dibuka.
- Rilis Play Store (butuh akun Play Console).

---

## 4. Pekerjaan berkelanjutan tanpa deploy

- Pemilik memeriksa dan memperbaiki materi lewat `/admin` kapan saja.
- Pemilik menandai masalah dengan Catatan Pemeriksaan (mulai Rilis 1).
- Cadangan kurikulum berkala: `npm run content:export -- --published`.
- Pantau kredit Netlify (Billing/Usage) dan batas paket gratis Supabase.

## 5. Ringkasan target akhir (Juni 2027)

| Bagian | Sekarang | Target |
|---|---|---|
| Pelajaran | 38 | ±60 (A1 12, A2 12, B1 9, B2 9, C1 9, C2 9) |
| Cerita bergambar | 0 | ±16, sebagian bercabang |
| Tugas menulis | 1 | 1 per bab, semua level |
| Ujian level | soal dari pelajaran | bank soal khusus, 4 bagian, sertifikat |
| Maskot | diam | bergerak, bereaksi |
| Audio | suara perangkat | rekaman asli bila tersedia |
| Deploy | sering, kecil | ±1–2 per bulan, besar |
