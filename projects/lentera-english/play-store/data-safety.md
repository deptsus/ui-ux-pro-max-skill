# Formulir keamanan data (Play Console → Policy → App content → Data safety)

Jawaban di bawah sesuai cara kerja Lentera saat ini (lihat juga /privasi).
Periksa lagi bila fitur berubah.

## Pengumpulan dan pembagian
- Apakah aplikasi mengumpulkan atau membagikan data pengguna yang wajib dilaporkan? **Ya** (mengumpulkan).
- Apakah data dibagikan ke pihak ketiga? **Tidak.** Supabase (basis data) dan Netlify (hosting) adalah penyedia layanan yang memproses data atas nama Lentera, jadi tidak dihitung sebagai "berbagi".
- Apakah semua data dienkripsi saat dikirim? **Ya** (HTTPS saja; aplikasi menolak koneksi tanpa enkripsi).
- Apakah pengguna bisa meminta data dihapus? **Ya.** Di aplikasi: Pengaturan → Hapus akun. Lewat web: https://lentera-english-app.netlify.app/privasi (bagian "Hak kamu").

## Jenis data yang dikumpulkan
| Kategori Play | Jenis | Wajib? | Tujuan |
|---|---|---|---|
| Info pribadi | Nama (nama tampilan) | Ya, untuk akun | Fungsi aplikasi, pengelolaan akun |
| Info pribadi | Alamat email | Ya, untuk akun | Pengelolaan akun |
| Info pribadi | ID pengguna | Ya | Fungsi aplikasi, pengelolaan akun |
| Info keuangan | Riwayat pembelian | Hanya bila membeli Premium lewat situs | Fungsi aplikasi (mengaktifkan Premium) |
| Aktivitas aplikasi | Interaksi aplikasi (progres, jawaban latihan, XP) | Ya | Fungsi aplikasi, analitik |
| Aktivitas aplikasi | Konten buatan pengguna lainnya (tulisan PR, jawaban menulis ujian) | Opsional | Fungsi aplikasi |
| Info dan performa aplikasi | Log error (crash logs) dan diagnostik | Ya | Analitik (memperbaiki error) |

Semua data di atas **terkait dengan akun** pengguna, **tidak dipakai untuk iklan**, dan tidak dijual.

## Yang TIDAK dikumpulkan
- Rekaman suara latihan shadowing: diproses dan disimpan hanya di HP, tidak pernah diunggah.
- Lokasi, kontak, foto, data kartu/rekening (pembayaran QRIS terjadi di aplikasi bank atau e-wallet pengguna).
- ID iklan.

## Bagian lain di "App content"
- **Kebijakan privasi**: https://lentera-english-app.netlify.app/privasi
- **Iklan**: Tidak, aplikasi tidak berisi iklan pihak ketiga.
- **Akses aplikasi**: Sebagian fitur butuh akun. Berikan akun uji untuk peninjau Google (buat akun biasa, misalnya `reviewer@…`, dengan kata sandinya), dan tulis bahwa Premium tidak dibeli di dalam aplikasi.
- **Rating konten (kuesioner IARC)**: kategori Pendidikan/Referensi. Tidak ada kekerasan, konten seksual, kata kasar, narkoba, atau perjudian. Tidak ada obrolan antarpengguna (liga dan teman hanya menampilkan nama tampilan, avatar, dan XP). Hasil yang diharapkan: untuk semua umur.
- **Target audiens dan konten**: lihat README.md bagian "Keputusan pemilik: anak-anak".
- **Aplikasi berita / COVID-19 / pemerintah**: Tidak.
- **Penghapusan akun**: Ya, di aplikasi (Pengaturan → Hapus akun) dan URL web di atas.
