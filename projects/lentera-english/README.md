# Lentera English

Sekolah bahasa Inggris digital untuk pelajar Indonesia, CEFR A1 sampai C2, tanpa AI.
Live: https://lentera-english-app.netlify.app

## Dokumen

| Berkas | Isi |
|---|---|
| `PROJECT_STATUS.md` | Apa yang sudah jadi dan teruji, posisi terakhir, langkah berikutnya. Baca ini dulu. |
| `TODO.md` | Daftar pekerjaan per prioritas, termasuk yang ditunda pemilik. |
| `ROADMAP.md` | Cara kerja rilis (aturan `[deploy]`) dan rencana rilis. |
| `ARCHITECTURE.md` | Struktur kode, alur data, keamanan. |
| `DECISIONS.md` | Keputusan pemilik (harga, pembayaran, materi). |
| `SCALING.md` | Rencana naik paket Supabase/Netlify. |
| `PEMBAYARAN-OTOMATIS.md` | Menyalakan QRIS otomatis (Xendit), saat pemilik siap. |
| `play-store/README.md` | Paket dan langkah Google Play Store. |
| `android/README.md` | Aplikasi Android (WebView, tanpa Chrome). |

## Menjalankan

```bash
npm install
npm run typecheck && npm test           # tes unit (PGlite, tanpa Supabase)
npx next build
LENTERA_BACKEND=embedded LENTERA_ALLOW_EMBEDDED=1 LENTERA_DEV_ADMIN_EMAIL=admin@lentera.test \
  LENTERA_DATA_DIR=/tmp/lentera-e2e/pglite npx next start -p 3100
npm run e2e                              # dan e2e:* lainnya (lihat package.json)
```

Hanya commit yang judulnya memuat `[deploy]` yang memicu deploy ke Netlify.
Migrasi basis data produksi dijalankan pemilik lewat `supabase/manual/apply-*.sql`.
