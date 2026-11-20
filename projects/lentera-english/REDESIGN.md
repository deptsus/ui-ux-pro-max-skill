# Redesign UI/UX Lentera English: Tahap 1 (audit, design system, rencana, risiko)

**Status: hanya audit. Belum ada kode aplikasi yang diubah.** Fase 1 dimulai setelah pemilik menyetujui keputusan di bagian 8.

- Tanggal: 20 November 2026
- Basis: branch `ccr-17d3d5e4-jx43zs`, Rilis 16, kurikulum v13
- Bukti visual: `bukti-audit.png` (12 screenshot bernomor [1]–[12], dikirim terpisah)

---

## 0. Ringkasan

Fondasi teknisnya sudah sehat:
- Tidak ada scroll horizontal di lebar 320–430 px, dan CLS sekitar 0.
- Ikon konsisten (lucide).
- Suite axe lulus di mode terang dan gelap.
- Ada mode huruf besar dan Mode SD.

Masalah utamanya ada di **hierarki dan kepadatan visual**, bukan di fungsi:

1. **Hampir semuanya kartu tebal.** Ada 196 pemakaian `Card` dan 83 kotak berbingkai ad-hoc. Di Jalur Sekolah ada 43 kartu di dalam kartu. Tidak ada yang terasa "utama".
2. **Gaya clay dipakai di semua permukaan.** Outline 2–2,5 px plus bayangan keras 4 px terasa berat di mode terang. Di mode gelap, outline `#05040c` hanya 1,09:1 terhadap latar, jadi batas komponen hilang.
3. **Halaman sangat panjang tanpa navigasi:** Kosakata sekitar 48.000 px, Jalur A1–C2 sekitar 17.000 px, Grammar sekitar 10.600 px, Ujian sekitar 9.900 px.
4. **Beranda sekitar 2.900 px dengan 7 blok yang sama beratnya.** Rekomendasi utama tidak menonjol.
5. **Tipografi tanpa hierarki.** `font-extrabold` dipakai 343 kali, tidak ada skala huruf, dan font Baloo 2 dipakai sampai h3.
6. **Token belum lengkap.** Belum ada token warning, skala huruf, spasi, radius, dan elevasi. Ada 31 bayangan ad-hoc.
7. **State belum lengkap.** Belum ada skeleton (ada 20 teks "Memuat…"). Aplikasi pelajar belum punya toast, dialog, atau bottom sheet.
8. **Beberapa masalah a11y dan mobile:**
   - Indikator langkah pelajaran bisa diketuk tetapi hanya 31×10 px.
   - Ada teks di bawah 12 px.
   - Label sumbu grafik terpotong ("00%").
   - Safe area hanya dipakai di bottom nav.

**Usulan arah: "tenang tapi hangat".**
- Permukaan netral; ungu hanya untuk aksi dan posisi sekarang.
- Pijar dan tokoh pemeran muncul hanya di momen yang bermakna.
- Kartu hanya untuk mengelompokkan; koleksi ditampilkan sebagai daftar baris.

---

## 1. Cara audit

**Lingkungan.** Build lokal terbaru (DB tertanam) dijalankan dengan Playwright Chromium, emulasi ponsel, rasio piksel 2.

**239 pengukuran:**
- 34 halaman × 6 lebar (320, 360, 375, 390, 412, 430) sebagai tamu, mode terang.
- 29 halaman Premium mode terang di 360 px.
- 6 halaman Premium mode gelap di 360 px.
- Akun pelajar yang sudah menuntaskan 1 pelajaran: Beranda, Analitik, Jalur, Ulangan, Profil, Pencapaian, Rencana, Peringkat.
- 7 langkah alur pelajaran: materi, contoh, soal, salah, benar, hasil, lulus.

**Yang diukur per halaman:**
- overflow horizontal;
- elemen interaktif di bawah 44 px;
- jumlah kartu dan kartu bersarang;
- jumlah ukuran dan bobot huruf;
- teks di bawah 12 px;
- tinggi halaman;
- CLS.

**Tambahan:**
- Pemindaian statis `src/**/*.tsx`, `globals.css`, `ui.tsx`, dan `nav.ts`.
- Pengukuran performa: ukuran JS, CSS, dan font, serta LCP lokal.
- Screenshot "sebelum" disimpan untuk perbandingan di setiap fase.

---

## 2. Peta halaman

Ada 39 rute: 28 aplikasi, 10 publik, dan 1 admin.

| Modul yang diminta | Rute / komponen |
|---|---|
| Beranda | `/app` |
| Jalur A1–C2 | `/app/path` (tab "Jalur") |
| Jalur Sekolah & Khusus | `/app/jalur` |
| Materi detail | `/materi/[id]` (publik) dan layar pengantar di `/app/lesson` |
| Lesson player | `/app/lesson` (`SessionRunner`, `ExerciseCard`, `Interactive`) |
| Kuis & umpan balik | `SessionRunner`, `/app/practice`, `/app/exams` (`LevelExam`), `/app/placement` |
| Pusat Ulangan | `/app/review` |
| PR | `/app/homework` |
| Kosakata | `/app/vocabulary` |
| Grammar | `/app/grammar` |
| Listening | `/app/listening` |
| Shadowing | `/app/shadowing` |
| Speaking Simulator | `/app/conversations` (Percakapan) dan `/app/shadowing` |
| Analitik | `/app/analytics` (`Charts.tsx`) |
| Pencapaian | `/app/achievements`, `/app/leaderboard` |
| Profil | `/app/profile` |
| Premium/QRIS | `/app/subscription`, `/app/checkout` (`ManualQrisCheckout`) |
| Pengaturan | `/app/settings` |
| Chatbot | **Tidak ada.** Tidak dibuat dalam redesign ini karena itu fitur baru. |

**Halaman lain yang ikut memakai design system baru:**
- Aplikasi: `/app/more`, `/app/plan`, `/app/stories`, `/app/pasangan`, `/app/kelas`, `/app/guru`, `/app/orang-tua`.
- Publik: `/`, `/materi`, `/sekolah`, `/masuk`, `/daftar`, `/sertifikat`, `/privasi`, `/kontak`, `/gaya`.
- Admin: `/admin`, hanya tokennya.

**Navigasi saat ini:**
- Bottom nav 5 tab: Beranda, Jalur, Ulangan, Lainnya, Profil.
- Sidebar desktop: 23 item datar.
- Header: logo, chip beruntun, chip XP, chip nyawa (atau Premium), dan chip Admin.

---

## 3. Temuan

Prioritas:
- **P0** menghalangi tujuan brief atau merupakan masalah aksesibilitas nyata.
- **P1** menyangkut konsistensi dan kejelasan.
- **P2** menyangkut poles dan perawatan.

Angka [n] merujuk ke gambar di `bukti-audit.png`.

### 3.1 Hierarki & kepadatan (P0)

- **[1][2] Beranda pelajar, sekitar 2.900 px.**
  - Isinya berurutan: sapaan dengan ring XP besar, langkah berikutnya, rencana minggu, 4 statistik, 4 pintasan, misi, dan milestone.
  - Semuanya kartu tebal dengan bobot yang sama.
  - Ring target harian lebih dominan daripada rekomendasi.
  - Belum ada blok "area yang perlu ditingkatkan".
- **[4] Jalur A1–C2, sekitar 17.000 px.**
  - Semua level terbuka sekaligus dan tidak ada navigasi CEFR.
  - Banner unit ditulis dengan HURUF KAPITAL.
  - Status pelajaran (selesai, sekarang, terkunci, disarankan) dibedakan terutama lewat ikon bulat.
- **[10] Kosakata** berisi 195 kartu (sekitar 48.000 px dan sekitar 1.460 node DOM).
- **Grammar** berisi 100 baris berbentuk kartu. **Ujian** berisi 47 kartu.
- **[7] Lainnya** berisi 20 kartu besar yang setara, tanpa pengelompokan.
- **Profil** menampilkan 10 kartu di layar pertama; 8 di antaranya kartu statistik.

### 3.2 Kartu berlebihan & bersarang (P0)

- Ada 196 `Card` di 59 berkas, ditambah 83 kotak `border rounded` ad-hoc.
- **[3] Jalur Sekolah:** 49 kartu, 43 di antaranya bersarang (baris pelajaran berbingkai di dalam kartu jalur).
- **Halaman Langganan:** 4 kartu bersarang.
- **Pola baris "ikon | teks | tombol"** memeras teks menjadi kolom sempit di 360 px. Contohnya kartu admin langganan, ajakan upgrade di Analitik, dan baris jalur yang ber-badge.

### 3.3 Gaya visual & mode gelap (P0)

- **Clay R14 menutupi hampir semua permukaan.** Polanya `border-[2.5px] border-outline` plus `shadow-[0_4px_0_var(--outline)]`. Ada 31 bayangan keras ad-hoc dan 6 pemakaian konstanta `CLAY`.
- **[9] Mode gelap.**
  - `--outline: #05040c` hanya 1,09:1 terhadap latar `#121022` dan 1,2:1 terhadap surface.
  - Akibatnya batas kartu dan tombol praktis hilang, jadi mode gelap belum setara dengan mode terang.
- **Warna mentah di komponen**, misalnya:
  - `text-[#1e1b3a]` di atas warna aksen;
  - `bg-[#fff1d6] text-[#c2410c]` di chip beruntun;
  - `fill="#fb923c"`.
- **Gradien dan glow** hanya ada di maskot dan ilustrasi. Itu sudah tepat.
- **Emoji** hanya ada 2, di `LevelExam`; keduanya akan diganti ikon.

### 3.4 Tipografi (P1)

- `font-extrabold` dipakai 343 kali dan `font-bold` 329 kali. Hampir semua teks tebal, jadi hierarki hilang.
- Tidak ada skala huruf. Tiap halaman memakai 3–7 ukuran yang ditentukan sendiri-sendiri oleh komponennya.
- Baloo 2 dipakai untuk h1–h3, chip, dan label nav. Akibatnya semua jenjang, termasuk TOEFL/IELTS dan Kerja, terasa seperti aplikasi anak.
- **[11] Teks di bawah 12 px:** 6 elemen di Pencapaian, 5 di Peringkat, dan 4 kelas `text-[9–11px]` di kode.
- Banner unit ditulis HURUF KAPITAL, yang lebih sulit dibaca, terutama untuk anak SD.

### 3.5 Token & konsistensi (P1)

- **Sudah ada:** `bg`, `surface`, `surface-2`, `ink`, `muted`, `line`, `line-strong`, `brand` (+strong, +soft), `accent` (+strong, +soft), `ok` (+soft), `bad` (+soft), `chart`, `shadow`, `outline`.
- **Belum ada:**
  - warna *warning* dan *info*;
  - skala huruf, spasi, dan radius (sekarang `rounded-xl`, `2xl`, `3xl`, dan `full` dicampur);
  - elevasi;
  - durasi gerak.

### 3.6 Navigasi (P1)

- **Dua "jalur" dengan arti berbeda.** Tab "Jalur" membuka `/app/path` ("Jalur Belajar"), sedangkan "Jalur Sekolah & Khusus" ada di `/app/jalur`.
- **Chip header:**
  - Di 360 px, chip Admin (perisai) dan Premium (mahkota) hanya berupa ikon. Labelnya baru muncul di lebar ≥ 400 px dan ≥ 420 px.
  - Arti chip nyawa dan beruntun hanya ada di atribut `title`, yang tidak tampil di layar sentuh.
- **Ulangan** mencampur promo permainan (Pasangan Kilat) dengan antrean ulangan.
- **Sidebar desktop** berisi 23 item datar tanpa kelompok.

### 3.7 Target sentuh

- **P0:** Indikator langkah pelajaran berisi 8 tombol berukuran 31–36 × 10 px.
- **P1:** Tautan mandiri "← Jalur belajar" hanya 100×20 px.
- **P1:** Tautan "Privasi" dan "Hubungi kami" di Pengaturan hanya setinggi 15 px.
- **Bukan pelanggaran:** chip header terlihat setinggi 32 px, tetapi area ketuknya sudah diperluas sampai sekitar 52 px lewat `::before`. Secara visual tetap terlihat kecil dan rapat.
- **Perlu dicek:** radio di Langganan berukuran 20×20 px. Kemungkinan labelnya ikut menjadi target; akan dipastikan di Fase 4.

### 3.8 Belajar: pelajaran, kuis, umpan balik (P0/P1)

- **[5] Umpan balik salah (P0).**
  - Tampil sebagai lembar merah penuh yang padat: jawaban salah, jawaban benar, penjelasan, pola kesalahan, dan tautan materi.
  - Terasa menghukum dan sulit dipindai.
- **Opsi jawaban.** Ukurannya sudah besar (bagus). Namun state terpilih, benar, dan salah dibedakan terutama lewat warna latar.
- **CTA bawah (Periksa/Lanjut)** sudah konsisten. Akan dipertahankan dan ditambah safe area.
- **Pengantar pelajaran.** Teks panjang ditaruh di kartu tebal, dan tujuan pelajaran ada di kartu terpisah.

### 3.9 Modul lain (P1)

- **[6] Analitik.**
  - Label sumbu "100%" terpotong menjadi "00%", dan label sumbunya kecil.
  - Belum ada insight yang bisa ditindaklanjuti.
- **[12] Menyimak.** Tab (Menyimak/Pelafalan/Shadowing) dan pilihan aksen terlihat sama dengan tombol aksi.
- **[8] Pengaturan.**
  - Opsi berupa tombol clay yang membungkus ke baris berikutnya, tanpa kelompok daftar.
  - Hapus akun sudah memakai konfirmasi ketik "HAPUS" (pertahankan).
- **Premium.** Harga dan periode sudah tampil, tetapi kartunya bersarang. Alur QRIS (manual dan otomatis) bisa dibuat lebih jelas sebagai langkah 1-2-3.
- **Shadowing.** Penjelasan privasi rekaman di dekat tombol rekam akan disesuaikan dengan perilaku kode yang sebenarnya (dicek di Fase 4).

### 3.10 State (P1)

- **Loading:** Splash saat aplikasi dibuka, lalu teks "Memuat…" di 20 tempat. Tidak ada skeleton, jadi tinggi halaman berubah ketika data datang.
- **Kosong:** komponen `Empty` dengan maskot sudah bagus, tetapi pemakaiannya tidak seragam.
- **Error:** `Notice` plus teks, tidak seragam, dan belum ada tombol "coba lagi" yang konsisten.
- **Sukses dan konfirmasi:** belum ada toast di aplikasi pelajar. `Confirm.tsx` hanya dipakai di admin.

### 3.11 Aksesibilitas (sudah baik; sisanya P1)

**Yang sudah baik:**
- Suite axe R13 lulus di semua halaman, mode terang dan gelap.
- `:focus-visible` 3 px.
- `prefers-reduced-motion` diterapkan secara global.
- 10 region `aria-live`.
- Mode huruf besar `fs-lg` (112,5%) dan Mode SD.

**Yang masih perlu diperbaiki:**
- Teks di bawah 12 px.
- Label sumbu grafik.
- Arti chip yang hanya ada di `title`.
- State terpilih tab dan aksen: perlu `aria-selected`/`aria-pressed` dan penanda selain warna.
- `aria-label` yang ditaruh di `<span>` dalam chip header tidak dibaca dengan andal oleh semua pembaca layar.

### 3.12 Responsif & safe area (P1)

- **Sudah baik:** tidak ada overflow horizontal di keenam lebar, dan CLS sekitar 0.
- **Safe area:**
  - Hanya bottom nav yang memakai `pb-[env(safe-area-inset-bottom)]`.
  - Viewport belum memakai `viewport-fit=cover`.
  - Header dan CTA lengket di pelajaran tidak punya inset.
  - Ini berisiko di Android 15 (WebView edge-to-edge) dan iPhone dengan home indicator.
- **Keyboard:** belum dicek apakah input tulis/dikte tertutup CTA lengket saat keyboard muncul. Akan dicek di Fase 3.

### 3.13 Performa (P2)

- **Ukuran unduhan:**
  - JS sekitar 743–846 KB per halaman (sebelum kompresi).
  - `/api/content` 349 KB.
  - CSS 67 KB.
  - Font 59–80 KB (2 keluarga).
- **Kecepatan lokal:** LCP 148–312 ms. DOM terbesar sekitar 1.460 node (Kosakata).
- **Target redesign:** mengurangi DOM (daftar ringkas, filter per level) **tanpa menambah library**.

### 3.14 Duplikasi kode (P2)

- Baris pelajaran dan pemetaan status → ikon → warna ditulis ulang di Jalur A1–C2, Jalur Sekolah, dan Rencana.
- Chip header ditulis 4 kali dengan string kelas panjang yang sama.
- Kartu statistik di Beranda, Profil, Analitik, dan Pencapaian memakai markup yang berbeda-beda.
- Tidak ada skrip `lint` di proyek. Saat ini pemeriksaan dilakukan dengan `typecheck` dan `build`.

### Yang dipertahankan

- Bottom nav 5 tab dan ikon lucide.
- CTA bawah di sesi latihan.
- Maskot dan tokoh pemeran, dengan porsi lebih kecil.
- Mode SD, ReadAloud, dan ParentGate.
- Konfirmasi ketik HAPUS dan mode offline.
- **Semua fitur dan semua logika** (penguncian, XP, nyawa, beruntun, pembayaran, kurikulum).

---

## 4. Usulan design system (Tahap 2)

### 4.1 Prinsip

1. **Satu fokus per layar:** hanya ada satu CTA primer.
2. **Kartu hanya untuk mengelompokkan.** Koleksi ditampilkan sebagai daftar baris, dan **tidak ada kartu di dalam kartu**.
3. **Warna punya arti tetap:**
   - ungu untuk aksi dan posisi sekarang;
   - hijau untuk benar dan selesai;
   - kuning-oranye untuk peringatan, beruntun, dan Premium;
   - merah untuk salah dan aksi destruktif.

   Status tidak pernah ditunjukkan hanya dengan warna; selalu ada ikon dan teks.
4. **Karakter untuk momen tertentu saja:** onboarding, state kosong, umpan balik, dan perayaan.
5. **Gerak harus memberi arti.** Durasinya 120–300 ms, gerak keluar lebih cepat daripada masuk, dan semuanya mati saat *reduced motion*.

### 4.2 Warna

Semua kontras sudah dihitung dengan rumus WCAG.

**Mode terang**

| Token | Nilai | Pemakaian | Kontras |
|---|---|---|---|
| bg | `#F7F7FA` | latar | — |
| surface | `#FFFFFF` | kartu, sheet | — |
| surface-2 | `#F1F0F6` | latar sekunder, input | — |
| ink | `#17162B` | teks utama | 17,7:1 |
| muted | `#5B596E` | teks sekunder | 6,8:1 (6,0:1 di surface-2) |
| line | `#E3E2EA` | pemisah dekoratif | — |
| line-strong | `#8A889B` | batas input/kontrol | 3,5:1 (≥ 3:1 untuk non-teks) |
| brand | `#5B3FD9` | CTA, tautan, posisi sekarang | 6,7:1; teks putih di atasnya 6,7:1 |
| brand-strong | `#4530B8` | tekan/aktif | teks putih 8,9:1 |
| brand-soft / on | `#EEEBFD` / `#3F2BA6` | badge, pilihan aktif | 8,5:1 |
| success / soft | `#13773A` / `#E3F6E8` | benar, selesai | 5,6:1 / 5,0:1 |
| **warning** / soft | `#A85A06` / `#FDF1DC` | peringatan, kuota | 5,1:1 / 4,6:1 |
| error / soft | `#C0183F` / `#FDE8EC` | salah, destruktif | 6,1:1 / 5,2:1 |
| gold | `#F5A524` | beruntun, Premium (isian dengan teks gelap) | ink di atasnya 8,7:1 |

**Mode gelap (dirancang sendiri, bukan dibalik)**

| Token | Nilai | Kontras |
|---|---|---|
| bg / surface / surface-2 | `#0E0D16` / `#17162A` / `#211F38` | — |
| ink | `#F2F1F8` | 15,8:1 |
| muted | `#A8A6BC` | 7,5:1 |
| line / line-strong | `#2D2B45` / `#6E6B8C` | — / 3,5:1 |
| brand (teks gelap di atasnya) | `#A496FF` | 7,1:1; teks gelap 7,7:1 |
| brand-soft / on | `#2A2456` / `#D3CCFF` | 9,3:1 |
| success / warning / error | `#4ADE80` / `#FBBF24` / `#FB7185` | 10,2 / 10,6 / 6,6:1 |

Mode gelap tidak memakai outline hitam. Batas dibuat dengan `line`, dan kedalaman dengan perbedaan permukaan (bg → surface → surface-2).

### 4.3 Tipografi

- **Plus Jakarta Sans** untuk semua UI, judul, dan isi.
- **Baloo 2** hanya untuk momen display: angka besar (XP, skor), judul perayaan, dan wordmark. Ini perlu persetujuan (keputusan 2).
- Ukuran memakai `rem`, jadi tetap ikut mode huruf besar dan ukuran huruf sistem.

| Peran | Ukuran / tinggi baris | Bobot |
|---|---|---|
| display | 32/40 | Baloo 2, 700 |
| title-1 (h1, judul halaman) | 24/32 | 700 |
| title-2 (h2, bagian) | 20/28 | 700 |
| title-3 (h3, kartu/baris) | 17/24 | 600 |
| body | 16/24 | 400 |
| body-strong | 16/24 | 600 |
| small | 14/20 | 400 |
| caption (minimum) | 12/16 | 500 |

- Bobot huruf hanya 400, 600, dan 700. Bobot 800 dihapus.
- Semua teks memakai huruf kalimat. HURUF KAPITAL hanya untuk kode level seperti "A1".
- IPA dirender dengan tumpukan font yang punya simbol IPA lengkap (diuji di Fase 4).

### 4.4 Spasi (grid 4/8)

- **Skala:** 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 px.
- **Tepi halaman:** 16 px di layar < 375 px, 20 px di ≥ 375 px.
- **Jarak antarbagian:** 32 px. **Padding kartu:** 16 px.
- **Baris daftar:** tinggi minimal 56 px, dipisahkan garis tipis.

### 4.5 Radius

| Ukuran | Nilai | Pemakaian |
|---|---|---|
| sm | 8 | badge |
| md | 12 | tombol, input, opsi jawaban |
| lg | 16 | kartu, grup daftar |
| xl | 24 | bottom sheet, dialog |
| full | — | pill, avatar, tombol ikon |

### 4.6 Elevasi

| Level | Bentuk | Pemakaian |
|---|---|---|
| e0 | datar + border 1 px `line` | default kartu |
| e1 | bayangan lembut 1–8 px | kartu interaktif saat ditekan/hover |
| e2 | bayangan 8–24 px | sheet, dialog, toast, CTA lengket |

- **Tidak ada lagi bayangan keras offset 4 px atau outline hitam.**
- Sentuhan taktil (pinggiran 2–3 px berwarna `brand-strong`, bukan hitam) hanya dipertahankan di tombol utama dan opsi jawaban di dalam pelajaran (keputusan 1).

### 4.7 Ikon

- Hanya lucide, stroke 2, ukuran 16 (inline), 20 (default), dan 24 (nav/header).
- Ikon dekoratif diberi `aria-hidden`. Tombol yang hanya berisi ikon wajib punya label.
- 2 emoji di `LevelExam` diganti ikon.

### 4.8 Gerak

| Kecepatan | Durasi | Pemakaian |
|---|---|---|
| fast | 120 ms | tekan |
| base | 200 ms | perubahan state |
| slow | 300 ms | sheet masuk |

- Kurva *ease-out*.
- Perayaan boleh lebih panjang, tetapi bisa dilewati.
- Semua gerak mati saat *reduced motion*.

### 4.9 Inventaris komponen dan state

| Komponen | Varian | State | Status |
|---|---|---|---|
| Button | primary, secondary, tertiary, destructive; md 44, lg 52 | default, hover, pressed, focus, disabled, loading (label tetap) | ubah |
| IconButton | 44×44 | + label wajib | baru |
| Input/Textarea/Select (`Field`) | label di atas, helper, error di bawah field | default, focus, error, disabled, read-only | ubah |
| Card | plain, interactive (seluruh kartu = tautan) | default, pressed, focus | ubah (tanpa outline tebal, tidak boleh bersarang) |
| ListGroup + ListRow | ikon, judul, subjudul, nilai/badge, chevron | default, pressed, disabled, selected | **baru**: Lainnya, Pengaturan, Grammar, Kosakata, Profil |
| SegmentedControl / Tabs | `role=tablist`, `aria-selected` | default, selected, focus, disabled | **baru**: level CEFR, Listening, periode Analitik, tema |
| Progress | linear 8 px, Ring (hanya satu di Beranda), StepProgress | — | ubah |
| Badge / StatusPill | neutral, brand, success, warning, error, premium | — | ubah |
| StatTile | angka + label (+ perubahan) | loading | **baru**: menggantikan 4 jenis kartu statistik |
| Sheet / Dialog / ConfirmDialog | bottom sheet di ponsel, dialog di desktop; `<dialog>` native | buka, tutup, focus trap, Esc | **baru** |
| Toast | `role=status`, tutup otomatis 4 detik, bisa ditutup | info, sukses, error | **baru** |
| Skeleton | dimensi tetap agar tidak ada layout shift | — | **baru** |
| EmptyState / ErrorState | dengan tombol "Coba lagi" | — | ubah |
| PageHeader / SectionHeader | judul, subjudul, aksi | — | ubah |
| StickyActionBar | CTA bawah + safe area + keyboard | — | **baru** (diekstrak dari `SessionRunner`) |
| AnswerOption | ikon ✓/✕ + teks, bukan warna saja | default, selected, correct, incorrect, disabled | ubah |
| FeedbackPanel | benar (ringkas), salah (jawaban benar dulu, "Kenapa?" bisa dibuka) | — | ubah |
| LessonRow / UnitSection / CefrTabs | 4 state pelajaran | done, current, locked, recommended | **baru**: menghapus duplikasi di 3 halaman |
| AudioPlayer / Recorder | — | idle, memuat, memutar, jeda, merekam (+ waktu), memproses, selesai, izin ditolak, error | ubah |
| HeaderStat | beruntun, XP, nyawa/Premium | dengan label terlihat | ubah |

Halaman `/gaya` (pratinjau gaya dari R14) dijadikan galeri komponen dan state agar setiap perubahan bisa dilihat dalam satu tempat.

---

## 5. Arah per halaman (Tahap 3, ringkas)

### Beranda

Susunan baru, dengan target maksimal 2 layar:
1. Sapaan singkat.
2. Target harian (bar kecil dengan teks x/y XP).
3. **Satu kartu rekomendasi utama** dengan CTA besar.
4. **Satu area perbaikan**, diambil dari data penguasaan atau kesalahan yang sudah dihitung. Bila datanya belum cukup, blok ini disembunyikan, **bukan diisi data contoh**.
5. Satu baris statistik ringkas.
6. Rencana dan misi sebagai daftar.

### Jalur A1–C2

- Tab level CEFR yang lengket di atas.
- Unit sebagai bagian dengan progres sendiri; unit di luar level aktif bisa dibuka-tutup.
- Pelajaran sebagai baris dengan 4 state, masing-masing ikon + teks:
  - selesai;
  - sedang ("Lanjutkan");
  - terkunci, dengan alasannya;
  - disarankan.
- Garis penghubung vertikal menggantikan peta berliku (keputusan 4).

### Jalur Sekolah & Khusus

- Halaman awal: ringkasan per jenjang (progres + tombol Lanjutkan).
- Detail unit ditampilkan sebagai daftar, tanpa kartu bersarang.
- Anchor `#sd`, `#smp`, dan `#sma` tetap berfungsi.

### Pengantar pelajaran / materi

- Judul, tujuan (3 poin), dan jumlah langkah.
- CTA lengket "Mulai".
- Indikator langkah dibuat tidak bisa diketuk, atau targetnya dijadikan 44 px.

### Lesson player & kuis

- Header berisi tombol tutup, progres, dan nyawa.
- Opsi jawaban minimal 56 px.
- CTA lengket "Periksa".
- **Panel umpan balik dibuat lembut, bukan merah penuh:** ikon + "Benar!" atau "Belum tepat", jawaban benar, lalu bagian "Kenapa?" yang bisa dibuka, dan tombol Lanjut.

### Ulangan & PR

- Ulangan: antrean jatuh tempo dan tombol mulai. Permainan dipindah ke bagian "Latihan santai" yang terpisah.
- PR: daftar dengan tenggat dan status.

### Kosakata & Grammar

- Filter level, pencarian yang lengket, dan baris ringkas.
- Detail kata dibuka di bottom sheet.
- Hanya level yang dipilih yang dirender, sehingga DOM turun drastis.

### Listening & Shadowing

- Langkah 1-2-3: Dengar → Rekam → Bandingkan.
- State pemutar dan perekam terlihat jelas.
- IPA mudah dibaca.
- Catatan privasi rekaman di dekat tombol rekam, sesuai perilaku kode yang sebenarnya.

### Analitik

- Pilihan periode, terbatas pada data yang sudah tersedia.
- Insight teks di atas grafik.
- Label sumbu ≥ 12 px dan tidak terpotong.
- Tabel alternatif tetap ada.

### Pencapaian & Peringkat

- Grid lencana, teks ≥ 12 px, dan progres ke tingkat berikutnya.

### Profil

- Kepala profil, 3 statistik, lalu daftar akun dan sertifikat.

### Premium / QRIS

- Paket dibandingkan dengan transparan: harga total, harga per bulan, dan apa yang didapat. Teksnya diambil dari konfigurasi harga yang ada.
- Langkah QRIS 1-2-3 dengan status pembayaran yang jelas.
- ParentGate tetap.

### Pengaturan

- Daftar berkelompok: Tampilan, Belajar, Notifikasi, Akun, Tentang.
- Segmented control untuk tema dan ukuran huruf.
- Aksi destruktif ada di grup terakhir dengan ConfirmDialog; ketik "HAPUS" tetap dipakai.

### Lainnya

- Dikelompokkan sebagai daftar: Latihan, Jalur & Ujian, Sosial & Kelas, Akun.

### Header

- Chip memakai label pendek yang terlihat dan ikon lucide, bukan hanya ikon.

---

## 6. Rencana implementasi bertahap

### Gerbang verifikasi setiap fase

Setiap fase baru selesai jika semua langkah ini lulus. Regresi diperbaiki sebelum lanjut ke fase berikutnya.

1. `npm run typecheck` dan `npm run build`. Proyek belum punya skrip `lint`; lihat keputusan 7.
2. `npm test`: 367 unit test.
3. **Semua 20 suite e2e**, termasuk axe di mode terang dan gelap.
4. Screenshot sebelum/sesudah di 320/360/375/390/412/430 px, terang dan gelap, untuk tamu, Premium, dan pelajar.
5. Metrik ulang: overflow, target sentuh < 44 px, kartu bersarang, teks < 12 px, CLS, ukuran JS. Tidak boleh lebih buruk dari baseline.
6. `git diff` di `src/lib/**`, `src/app/api/**`, `supabase/**`, dan `content/**` harus **kosong**, kecuali bila disebutkan dan disetujui.

### Fase dan cakupannya

| Fase | Isi | Halaman terdampak |
|---|---|---|
| **0. Pagar pengaman** | Skrip audit dan screenshot dipindah ke `e2e/ui-audit.mjs` (hanya dev) supaya bisa diulang. Baseline dikunci. | — |
| **1. Token & komponen inti** | `globals.css`: warna terang/gelap, skala huruf, spasi, radius, elevasi, gerak, safe area, `viewport-fit=cover`. `ui.tsx`: Button, Card, Badge, Progress, Field, Notice, Empty, PageHeader ditata ulang **dengan API yang sama**. Komponen baru: ListGroup/ListRow, SegmentedControl, Sheet/Dialog/ConfirmDialog, Toast, Skeleton, StatTile, StickyActionBar, IconButton. Galeri `/gaya`. | Semua halaman berubah gaya, tata letaknya belum |
| **2. Shell, navigasi, Beranda** | Header (chip berlabel), bottom nav, sidebar berkelompok, Beranda versi baru, Lainnya berkelompok. | `/app`, `/app/more`, layout |
| **3. Belajar** | Jalur A1–C2, Jalur Sekolah & Khusus, pengantar pelajaran, `SessionRunner`/`ExerciseCard`/`Interactive` (opsi, umpan balik, CTA), latihan, tes penempatan, ujian, Ulangan, PR. | `/app/path`, `/app/jalur`, `/app/lesson`, `/app/practice`, `/app/placement`, `/app/exams`, `/app/review`, `/app/homework` |
| **4. Modul lain** | Kosakata, Grammar, Listening, Shadowing, Percakapan, Cerita, Analitik, Pencapaian, Peringkat, Profil, Premium/QRIS, Pengaturan, Rencana, Pasangan, Kelas/Guru/Orang tua. | 17 halaman |
| **5. Penutup** | Halaman publik; admin hanya diberi token. Pemeriksaan akhir responsif, a11y, dan performa. Laporan akhir dengan screenshot sebelum/sesudah. Dokumen DECISIONS dan PROJECT_STATUS diperbarui. | publik + semua |

**Deploy** (subjek commit `[deploy]`) dilakukan setelah pemilik melihat screenshot. Usulannya: deploy pertama setelah Fase 2, supaya situs live tidak pernah menampilkan shell setengah baru. Sesudah itu deploy per fase.

---

## 7. Risiko & mitigasi

| # | Risiko | Mitigasi |
|---|---|---|
| 1 | **Uji e2e bergantung pada teks dan role** (472 `getByRole`, 227 `getByText`, 89 `getByLabel`). Mengganti label bisa merusak 20 suite. | Nama aksesibel dan teks tombol dipertahankan. Bila teks harus berubah, ujinya diubah di commit yang sama dan dicatat di laporan. |
| 2 | **`ui.tsx` dipakai 59 berkas**, jadi Fase 1 mengubah tampilan semua halaman sekaligus. | API komponen tetap. Screenshot semua halaman diambil di Fase 1. Deploy ditahan sampai Fase 2. |
| 3 | **Logika ikut tersentuh** tanpa sengaja (penguncian, XP, nyawa, beruntun, pembayaran). | Hanya JSX dan kelas yang diubah. `git diff` pada logika, API, skema, dan konten harus kosong. 367 unit test plus e2e run/habits/level-exams/admin. |
| 4 | **Regresi a11y** dari warna baru, fokus, atau dialog baru. | Axe terang dan gelap di setiap fase. `<dialog>` native dengan focus trap. Uji keyboard. |
| 5 | **Mode SD, `fs-lg` 112,5%, dan ukuran huruf sistem Android** membuat teks meluber. | Semua ukuran memakai `rem` dan tidak ada tinggi tetap pada teks. Diuji di 320 px dengan `fs-lg` dan Mode SD. |
| 6 | **Gaya ilustrasi berbenturan:** tokoh 2.5D ber-outline tebal di UI yang lebih tenang. | Karakter hanya di momen tertentu, ukurannya konsisten, dan wadahnya tanpa outline. Karakter tidak digambar ulang (di luar cakupan). |
| 7 | **Mode gelap tertinggal** dari mode terang. | Token gelap dirancang terpisah dengan kontras yang sudah dihitung. Screenshot gelap di setiap fase. |
| 8 | **Android WebView (aplikasi 2.0):** redesign langsung tampil tanpa update APK, dan Android 15 memakai tampilan edge-to-edge. | Safe area dan `viewport-fit=cover` diuji. Fitur khusus aplikasi native tidak diubah. |
| 9 | **Performa memburuk.** | Tanpa library baru. DOM dikurangi di Kosakata, Grammar, dan Jalur. JS per halaman diukur sebelum dan sesudah. |
| 10 | **Halaman yang dipecah dengan tab atau accordion menyembunyikan target deep link.** | Anchor dan `?id=` membuka tab/accordion yang tepat. Uji tracks dan school memakai anchor. |
| 11 | **Pengguna sudah terbiasa** dengan tata letak dan nama tab lama. | Nama tab hanya diganti bila disetujui (keputusan 5). Tidak ada fitur yang dipindah tanpa jalan masuk. |
| 12 | **Godaan data contoh** untuk blok baru (area perbaikan, insight). | Hanya memakai data yang sudah dihitung aplikasi. Bila datanya belum cukup, blok disembunyikan. |
| 13 | **Teks harga dan privasi tidak sesuai kenyataan.** | Diambil dari kode dan konfigurasi yang ada, bukan ditulis ulang bebas. |

---

## 8. Keputusan yang perlu disetujui pemilik

1. **Arah visual "tenang tapi hangat".**
   - Kartu datar dengan border tipis, tanpa outline hitam dan bayangan keras.
   - Sentuhan taktil hanya di tombol utama dan opsi jawaban di dalam pelajaran.
   - *Rekomendasi: setuju.*
2. **Font.**
   - Plus Jakarta Sans untuk semua judul dan teks; Baloo 2 hanya untuk angka besar, perayaan, dan wordmark.
   - Alternatif: Baloo 2 tetap dipakai untuk h1.
   - *Rekomendasi: opsi pertama.*
3. **Warna brand.**
   - Bergeser sedikit dari `#4B3FD6` ke `#5B3FD9` (lebih ungu, kontras tetap ≥ 6,6:1). Logo tidak berubah.
   - Alternatif: tetap `#4B3FD6`.
   - *Rekomendasi: geser.*
4. **Tampilan Jalur A1–C2.**
   - Daftar bertingkat dengan tab CEFR dan garis penghubung, menggantikan peta berliku R14.
   - Alternatif: peta dipertahankan dan hanya ditambah tab CEFR.
   - *Rekomendasi: daftar.*
5. **Nama tab.**
   - Tab "Jalur" diganti "Belajar", berisi pilihan CEFR | Sekolah | Khusus. Rute `/app/path` dan `/app/jalur` tetap.
   - Alternatif: nama tetap.
   - *Rekomendasi: ganti.*
6. **Ritme deploy.**
   - Deploy pertama setelah Fase 2, lalu per fase setelah pemilik melihat screenshot.
   - *Rekomendasi: setuju.*
7. **Lint.**
   - Menambah ESLint (`next/core-web-vitals` + aturan aksesibilitas JSX) sebagai alat pengembangan saja, tidak memengaruhi aplikasi.
   - Alternatif: tetap `typecheck` + `build`.
   - *Rekomendasi: tambah.*
