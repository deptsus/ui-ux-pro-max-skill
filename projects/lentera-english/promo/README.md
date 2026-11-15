# Video promosi Lentera English

Video di halaman depan (`public/promo/lentera-promo.mp4`) dibuat dari tampilan
asli aplikasi, bukan gambar rekaan. Buat ulang setiap kali tampilan aplikasi
berubah banyak.

1. Build dan jalankan server dengan basis data embedded yang masih baru:
   ```bash
   npx next build
   LENTERA_BACKEND=embedded LENTERA_ALLOW_EMBEDDED=1 LENTERA_DEV_ADMIN_EMAIL=admin@lentera.test \
     LENTERA_DATA_DIR=/tmp/lentera-promo/pglite npx next start -p 3100
   ```
2. `node promo/capture.mjs`: memainkan aplikasi dengan akun demo "Rina"
   (tes penempatan, Premium Tahunan lewat alur QRIS + konfirmasi admin,
   pelajaran, cerita bercabang, percakapan, menyimak, PR, ujian level A2 +
   sertifikat, rencana, profil, liga, teman dan tantangan, shadowing dengan
   mikrofon tiruan, pengingat harian, pengaturan) dan menyimpan
   tangkapan layar setiap langkah di `promo/out/shots/` (tidak di-commit).
3. `node promo/render.mjs`: merangkai tangkapan layar menjadi animasi UI
   (`promo/composer.html`, 1280×720, 30 fps), menulis
   `public/promo/lentera-promo.mp4`, `public/promo/lentera-promo-poster.jpg`,
   dan daftar bab `src/components/promo-chapters.ts`.
   `PROMO_PREVIEW=7,30` hanya merender beberapa detik tertentu untuk dicek.

Alur cerita dan teks penjelasan ada di `promo/render.mjs` (`scenes`). Teksnya
hanya boleh menyebut apa yang tampil di layar. Formulir daftar (menampilkan
"Mode pengembangan" di server lokal) dan kode QRIS sungguhan sengaja tidak
dipakai di video.
