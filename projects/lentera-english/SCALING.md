# Rencana naik paket Supabase dan Netlify

Disusun 15 November 2026 (Rilis 9). Angka harga dan kuota diambil dari halaman
resmi pada tanggal itu: [supabase.com/pricing](https://supabase.com/pricing),
[Netlify: credit-based pricing plans](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/)
dan [Netlify: how credits work](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/).
Harga bisa berubah: periksa lagi sebelum membayar.

## Posisi sekarang

| | Paket | Kuota penting | Terpakai (15 Nov 2026) |
|---|---|---|---|
| Supabase | Free | DB 500 MB, berkas 1 GB, egress 5 GB/bulan, 50.000 MAU; **tanpa cadangan otomatis**; proyek dijeda setelah 1 minggu tanpa aktivitas | DB 22 MB |
| Netlify | Personal | 1.000 kredit/bulan; deploy 15 kredit, bandwidth 20 kredit/GB, 10.000 permintaan 2 kredit, compute 10 kredit/GB-jam | dipantau di Netlify → Billing → Usage |

Bila kredit Netlify habis, **seluruh situs dijeda** ("Site not available")
sampai bulan berikutnya, kecuali *auto recharge* dinyalakan (Personal: 500
kredit seharga US$5; hanya pemilik tim yang bisa menyalakannya). **Saran:
nyalakan auto recharge sekarang**, supaya situs tidak pernah mati di tengah
bulan karena ramai.

## Apa yang paling cepat penuh

Diukur dengan data tiruan (Rilis 9): setiap jawaban latihan menulis ±450
byte ke `exercise_attempts` dan, bila benar, ±450 byte lagi ke
`xp_transactions` (termasuk indeks). Pelajar aktif yang menjawab ±800 soal
sebulan menambah **±0,6 MB per bulan**.

| Pelajar aktif per bulan | Pertambahan DB per bulan | Basis data Free (500 MB) penuh dalam |
|---|---|---|
| 50 | ±30 MB | ±16 bulan |
| 200 | ±120 MB | ±4 bulan |
| 500 | ±300 MB | ±1,5 bulan |

Jadi di Supabase, **ukuran basis data** adalah batas pertama yang tercapai,
jauh sebelum 50.000 MAU atau 5 GB egress (paket materi sudah 0 KB untuk
pembukaan berulang; satu pembukaan Liga/Teman ±3 KB).

Di Netlify, yang terbesar adalah compute fungsi server (setiap permintaan API
menjalankan fungsi Next.js) dan deploy. Setiap pembukaan halaman belajar oleh
pelajar yang masuk memicu beberapa permintaan kecil (`/api/me`, sinkronisasi
progres). Perkiraan kasar dari pengukuran sebelumnya: paket Personal cukup
untuk ±700–800 pelajar aktif harian sebelum penghematan paket materi, dan
lebih banyak sesudahnya.

## Kapan naik paket (lihat /admin → Kesehatan)

Tab **Kesehatan** di `/admin` menampilkan ukuran basis data, penyimpanan
berkas, dan pelajar aktif 30 hari dibandingkan kuota Free. Patokannya:

1. **Basis data > 400 MB (80%)** atau **penyimpanan berkas > 800 MB**, atau
   pendapatan Premium per bulan sudah > ±Rp1 juta → naik ke **Supabase Pro**.
2. **Kredit Netlify habis sebelum akhir bulan** dua bulan berturut-turut
   (walau auto recharge sudah menutupinya) → naik ke **Netlify Pro**.

## Supabase Pro (mulai US$25/bulan per organisasi)

- DB 8 GB per proyek (lalu US$0,125/GB), egress 250 GB (lalu US$0,09/GB),
  berkas 100 GB, 100.000 MAU.
- Termasuk kredit compute US$10/bulan = satu instance Micro (1 GB RAM). Satu
  proyek Lentera cukup dengan Micro sampai ribuan pelajar aktif.
- **Cadangan harian otomatis disimpan 7 hari**, proyek tidak pernah dijeda,
  perlindungan kata sandi bocor (leaked password protection) tersedia.
- Batas belanja (spend cap) menyala bawaan: tagihan tidak melonjak diam-diam.

Langkah saat naik (5 menit, tanpa downtime): Supabase → Organization →
Billing → Change plan → Pro. Lalu di Authentication → Policies (atau
Security) nyalakan **Leaked password protection**. Cadangan harian buatan
Lentera tetap berjalan sebagai salinan kedua.

## Netlify Pro

Mulai 3.000 kredit/bulan (pilihan 3.000 sampai 20.000), 3 build bersamaan,
kredit tidak terpakai bisa dibawa ke bulan berikutnya untuk pilihan ≥5.000.
Auto recharge Pro: 1.500 kredit seharga US$10. Harga dolar per bulan ada di
[netlify.com/pricing](https://www.netlify.com/pricing/) (sumber pihak ketiga
menyebut US$20 untuk 3.000 kredit; pastikan di halaman resmi).

## Sebelum membayar: penghematan yang bisa dilakukan

- **Retensi riwayat jawaban** (keputusan pemilik): jawaban latihan lebih dari
  12 bulan bisa dirangkum menjadi skor per topik (`mastery_records` sudah
  menyimpannya) lalu dihapus. Ini memperlambat pertumbuhan basis data sekitar
  separuhnya. Belum dijalankan.
- Deploy hanya dengan `[deploy]` (sudah berlaku): setiap deploy 15 kredit.
- Halaman materi publik (Rilis 11) dibuat statis saat build, supaya
  pengunjung dari Google tidak memakai compute.

## Cadangan

- Lentera membuat cadangan sendiri setiap malam pukul 02.00 WIB ke bucket
  pribadi `backups` (14 hari terakhir), dan bisa diunduh dari /admin →
  Kesehatan. Isinya semua tabel pelajar, pembayaran, dan kurikulum, plus
  daftar akun **tanpa kata sandi**.
- Batas yang perlu diingat: fungsi terjadwal Netlify berhenti setelah 30
  detik. Cadangan sekarang selesai dalam hitungan detik; bila basis data
  sudah ratusan MB, andalkan cadangan harian Supabase Pro dan gunakan
  cadangan Lentera hanya sebagai salinan kedua.
- **Simpan salinan bulanan di luar Supabase** (misalnya Google Drive pribadi):
  unduh dari /admin → Kesehatan.

### Memulihkan dari cadangan

Berkas `daily/YYYY-MM-DD.json.gz` berisi `{ tables: { nama_tabel: [baris...] }, auth_users: [...] }`.
Untuk proyek baru: jalankan semua `supabase/migrations/*.sql` (kecuali
`test-shim.sql`), buat ulang akun dari `auth_users` (pelajar perlu "lupa kata
sandi" untuk membuat sandi baru, karena sandi memang tidak ikut dicadangkan),
lalu impor tabel dengan urutan: `profiles` → tabel kurikulum → tabel
pelajar → pembayaran. Minta bantuan sesi Claude berikutnya dengan berkas
cadangan bila ini perlu dilakukan.
