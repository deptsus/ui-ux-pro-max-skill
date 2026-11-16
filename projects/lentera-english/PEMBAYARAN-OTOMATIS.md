# Menyalakan QRIS otomatis (Xendit)

Sekarang Lentera memakai **QRIS manual**: pelajar membayar ke QRIS milik pemilik,
melaporkan pembayaran, lalu admin mengonfirmasi di /admin. Dengan **QRIS
otomatis**, Lentera meminta QR baru ke Xendit untuk setiap pembelian, dan
Premium aktif sendiri begitu Xendit memberi tahu server bahwa uangnya masuk.
Tidak ada konfirmasi manual.

Kodenya sudah ada (`src/lib/server/xendit.ts`, `src/lib/server/payments.ts`,
`/api/webhooks/xendit`) dan teruji dengan simulator (`tests/payments.test.ts`).
Yang belum bisa dilakukan dari sini: akun Xendit atas nama pemilik, kuncinya,
dan uji sungguhan di mode uji Xendit.

**Aman dicoba:** selama kunci belum lengkap, situs tetap memakai QRIS manual
(Rilis 12). Untuk kembali ke manual kapan saja, hapus variabel
`PAYMENT_PROVIDER` di Netlify lalu deploy ulang.

## Biaya

Xendit memotong biaya per transaksi QRIS (sekitar 0,7%; cek angka terbaru di
halaman harga Xendit). Uang masuk ke saldo Xendit dan ditarik ke rekening bank
pemilik. Tidak ada biaya bulanan untuk akun dasar (cek syarat terbaru di Xendit).

## Langkah

1. **Daftar Xendit** di dashboard.xendit.co dan selesaikan verifikasi yang
   diminta (identitas dan rekening bank pencairan). Aktifkan kanal **QRIS**
   (Payment Channels / Activate). Proses verifikasi bisa memakan beberapa hari.
2. **Mode uji dulu.** Di dashboard Xendit, pastikan sedang di **Test mode**:
   - Settings → API Keys → buat **Secret Key** dengan izin *Money-in* (tulis).
     Kunci uji berawalan `xnd_development_`.
   - Settings → Webhooks → isi URL untuk notifikasi pembayaran (Payments API):
     `https://lentera-english-app.netlify.app/api/webhooks/xendit`, lalu salin
     **Verification Token**.
3. **Masukkan ke Netlify** (bukan ke chat, bukan ke kode): Project configuration
   → Environment variables → Add a variable. Tandai kunci dan token sebagai
   rahasia (*Contains secret values*).
   | Nama | Isi |
   |---|---|
   | `PAYMENT_PROVIDER` | `xendit` |
   | `XENDIT_SECRET_KEY` | Secret Key dari langkah 2 |
   | `XENDIT_WEBHOOK_TOKEN` | Verification Token dari langkah 2 |
   Lalu **Deploys → Trigger deploy** (variabel baru berlaku setelah deploy).
4. **Uji satu pembelian.** Masuk dengan akun biasa, pilih paket Premium. QR
   muncul di halaman pembayaran, dan karena mode uji ada tombol **"Simulasikan
   pembayaran berhasil"**. Tekan, lalu pastikan Premium aktif sendiri dan di
   /admin → Pembayaran ada catatan dari Xendit. Tab Pembayaran juga
   menampilkan "QRIS otomatis · mode uji".
   - Kalau pembuatan QR gagal dengan pesan tentang `expires_at`, tambahkan
     variabel `XENDIT_CHANNEL_PROPERTIES_JSON` berisi `{"QRIS":{}}` lalu deploy
     ulang (QR memakai masa berlaku bawaan Xendit, 48 jam).
5. **Mulai sungguhan.** Ganti ke **Live mode** di Xendit, buat Secret Key live
   (berawalan `xnd_production_`) dan atur webhook yang sama di Live mode (token
   live berbeda dari token uji). Ganti kedua nilai di Netlify, deploy ulang,
   lalu beli paket termurah sekali dengan uang sungguhan untuk memastikan.

## Keamanan

- Server hanya menerima notifikasi yang membawa `x-callback-token` yang sama
  dengan `XENDIT_WEBHOOK_TOKEN`, mencatat setiap notifikasi sekali saja
  (notifikasi ganda diabaikan), dan memeriksa nominal terhadap paket.
- Kunci rahasia hanya ada di Netlify. Jangan pernah menempelkannya di chat,
  di kode, atau di dashboard Lentera.
- Bila kunci bocor: Xendit → API Keys → hapus kunci itu, buat yang baru,
  ganti di Netlify, deploy ulang.
