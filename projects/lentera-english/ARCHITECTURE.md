# ARCHITECTURE — Lentera English

Dokumen ini menjelaskan cara aplikasi disusun. Untuk status pengerjaan lihat
`PROJECT_STATUS.md`; untuk keputusan yang sudah disepakati lihat `DECISIONS.md`.

## 1. Teknologi

| Lapisan | Pilihan | Versi (package.json) |
|---|---|---|
| Framework | Next.js App Router, React | next ^16.4.6, react ^19.3.1 |
| Bahasa | TypeScript (strict) | ^5.9.3 (dipatok ke mayor 5) |
| Styling | Tailwind CSS v4 + CSS variables (tema terang/gelap) | ^4.3.5 |
| Ikon | lucide-react | ^1.72.0 |
| Font | Plus Jakarta Sans (self-hosted via @fontsource) | ^5.3.0 |
| QR | qrcode (render QRIS di klien) | ^1.5.4 |
| Database produksi | Supabase (PostgreSQL + Auth) | @supabase/supabase-js ^2.119.0 |
| Database dev/tes | PGlite (Postgres WASM, menjalankan migrasi yang sama) | @electric-sql/pglite ^0.5.16 |
| Tes | Vitest | ^5.1.0 |
| Skrip | tsx | ^4.23.15 |
| Pembayaran | Xendit Payments API v3 (fetch langsung, tanpa SDK) | `api-version: 2024-11-11` |
| E2E | Playwright global dari lingkungan (bukan dependency npm) | — |

Tidak ada dependency AI atau LLM.

## 2. Struktur folder

```
projects/lentera-english/
├── content/                  Kurikulum yang ditulis tangan (TypeScript)
│   ├── dsl.ts                Helper penulisan soal: mc, fill, tr, fix, arrange, spot, match, para, ...
│   ├── a1-1.ts a1-2.ts a1-3.ts   Pelajaran A1
│   ├── a2.ts                 Pelajaran A2 + bank latihan was/were
│   ├── upper.ts              Satu pelajaran untuk B1, B2, C1, C2
│   ├── vocabulary.ts         74 kosakata
│   ├── conversations.ts      11 skenario dialog bercabang
│   ├── listening.ts          Materi menyimak, fonem, soal tes penempatan
│   └── index.ts              Silabus, topik, pola kesalahan, buildPack() → ContentPack
├── scripts/check-content.ts  Gerbang kualitas konten (npm run content:check)
├── scripts/export-content.ts Cadangkan kurikulum dari basis data ke backups/*.json (npm run content:export)
├── src/
│   ├── app/
│   │   ├── page.tsx          Landing (server component)
│   │   ├── admin/page.tsx    Dashboard admin: gerbang akses + tab Pembayaran, Konten, Terbitkan
│   │   ├── layout.tsx        Root layout, skrip tema sebelum paint
│   │   ├── globals.css       Token warna (CSS variables) + Tailwind
│   │   ├── masuk/, daftar/   Login & registrasi (AuthForm)
│   │   ├── app/              Aplikasi pembelajar (semua client component)
│   │   │   ├── layout.tsx    Shell: boot sesi → muat state → muat konten; navigasi
│   │   │   ├── page.tsx      Dashboard
│   │   │   ├── path/ lesson/ practice/ placement/ review/ homework/ exams/
│   │   │   ├── vocabulary/ grammar/ listening/ conversations/
│   │   │   ├── analytics/ achievements/ leaderboard/ profile/ settings/ more/
│   │   │   └── subscription/ checkout/
│   │   └── api/              Route handler (server)
│   │       ├── content/      GET paket konten (Free dipangkas di server)
│   │       ├── me/           GET info backend + akun, PATCH profil
│   │       ├── sync/         GET snapshot, POST event + snapshot
│   │       ├── leaderboard/  GET peringkat mingguan
│   │       ├── payments/     GET riwayat, POST buat checkout
│   │       ├── payments/[id] GET status (+rekonsiliasi), POST simulate (non-live)
│   │       ├── webhooks/xendit/ POST webhook Xendit
│   │       ├── admin/        POST aksi CMS & dashboard (cek admin di SQL)
│   │       └── dev-auth/     Akun lokal (hanya mode embedded)
│   ├── components/           UI: ui.tsx (primitif), ExerciseCard, SessionRunner, LessonContent,
│   │                         AudioButton, Charts, Mouth, Mascot, AuthForm, nav.ts
│   │   └── admin/            Dashboard admin: schema.ts (definisi form tiap tabel CMS + validasi),
│   │                         fields.tsx (kontrol form), CmsPanel, PaymentsPanel, PublishPanel, Confirm, api.ts
│   └── lib/
│       ├── content/          types.ts (model konten), validate.ts, rows.ts (pack ⇄ baris DB, packForFree)
│       ├── engine/           Mesin belajar murni (tanpa React/IO): grading, mastery, srs, state,
│       │                     recommend, unlock, sessions, placement, gamification, analytics, config
│       ├── client/           session.ts, store.ts (state offline-first), content.ts (IndexedDB/offline),
│       │                     api.ts, audio.ts, hooks.ts
│       ├── server/           db.ts, auth.ts, api.ts, content.ts, manual-payments.ts (QRIS, aktif),
│       │                     payments.ts + xendit.ts + xendit-mock.ts (Xendit, nonaktif)
│       ├── format.ts         rupiah, dateId, dateTimeId, compactId. Tanpa 'use client', aman untuk server component
│       ├── qris.ts           Baca dan validasi isi QRIS (TLV, CRC, nominal tag 54)
│       └── plans.ts          Teks paket untuk tampilan (harga tagihan tetap dari DB)
├── supabase/
│   ├── migrations/0001_schema.sql     Tabel
│   ├── migrations/0002_security.sql   RLS dan hak akses
│   ├── migrations/0003_functions.sql  Akun, sync, leaderboard, CMS
│   ├── migrations/0004_payments.sql   Pembayaran Xendit + kunci semua fungsi ke service_role
│   ├── migrations/0005_manual_qris.sql QRIS manual: QR per paket, harga tahunan diskon, laporan + konfirmasi admin
│   └── test-shim.sql                  Tiruan auth/roles Supabase. HANYA untuk PGlite. Jangan dijalankan di Supabase.
├── tests/                    engine, db, payments (Xendit), manual-payments (QRIS), admin, supabase-keys, helpers
├── e2e/lib.mjs               Helper Playwright (menjawab soal apa pun memakai kunci dari pack)
├── e2e/run.mjs               Suite e2e pembelajar di layar ponsel (npm run e2e): rute, pelajaran, PR, ulangan, ujian, percakapan, penempatan, pembayaran
├── e2e/admin.mjs             Uji ujung ke ujung dashboard admin (npm run e2e:admin, butuh basis data embedded baru)
├── public/                   sw.js (service worker offline), manifest, icon
└── PROJECT_STATUS.md, ARCHITECTURE.md, TODO.md, DECISIONS.md
```

## 3. Arsitektur frontend

- **Semua halaman `/app/*` adalah client component.** Shell `src/app/app/layout.tsx` saat mount: `initSession()` → `loadLearner()` → `loadContent()`, lalu menampilkan halaman.
- **State pembelajar offline-first** (`src/lib/client/store.ts`): satu objek `LearnerState` di `localStorage` (`lentera.state.<userId>` atau `lentera.state.guest`). Semua perubahan lewat `act(fn)`: klon → jalankan fungsi murni dari `src/lib/engine/state.ts` → `finalize` (beruntun, lencana) → simpan → jadwalkan sync.
- **Outbox**: setiap perubahan penting menambah event ber-ID unik ke `state.outbox`; `syncNow()` mengirim event + snapshot ke `/api/sync`, lalu menghapus event yang terkirim.
- **Tamu**: aplikasi berfungsi penuh tanpa akun. Saat pertama login di perangkat yang sama, progres tamu dipindahkan ke akun.
- **Konten**: `/api/content` mengembalikan `ContentPack`. Untuk akun Free, server memangkas isi pelajaran Premium (`packForFree`). Klien membuat indeks (`indexContent`). Bila "belajar offline" aktif (Premium), pack disimpan di IndexedDB dan `public/sw.js` menyimpan halaman/aset.
- **Sesi latihan**: `SessionRunner` menjalankan daftar soal tetap atau adaptif (`next()`), umpan balik langsung atau ditunda, nyawa, timer ujian, timer per soal. `ExerciseCard` merender 14 jenis soal dan memasang `data-ex`/`data-type` untuk e2e.
- **Tema**: token di `globals.css` (`--brand`, `--surface`, `--chart`, dll.), kelas `.dark` di `<html>`; pilihan tersimpan di `localStorage['lentera.theme']`.
- **Audio**: `src/lib/client/audio.ts` memutar rekaman dari `audio_resources` bila ada; bila tidak, memakai `speechSynthesis` perangkat dan UI memberitahukannya.

## 4. Arsitektur backend

- **Satu pintu ke database**: `ServerDb.rpc(fn, args)` (`src/lib/server/db.ts`). Semua logika data ada di fungsi SQL `SECURITY DEFINER`.
  - Produksi: `fetch(SUPABASE_URL/rest/v1/rpc/<fn>)` dengan kunci rahasia (hanya di server). Kunci baru `sb_...` hanya di header `apikey`; kunci JWT lama di `apikey` + `Authorization` (`supabaseKeyHeaders()` di `db.ts`).
  - Dev/tes: PGlite memuat `test-shim.sql` + semua migrasi; data di `.data/pglite` (diabaikan git). Pada start pertama, kurikulum bawaan diimpor dan diterbitkan otomatis.
- **Mode backend** (`backendMode()`): `supabase` bila `SUPABASE_URL` + `SUPABASE_SECRET_KEY` (atau `SUPABASE_SERVICE_ROLE_KEY` lama) ada; `embedded` bila `LENTERA_BACKEND=embedded` dan bukan build produksi (kecuali `LENTERA_ALLOW_EMBEDDED=1`); selain itu `none` (aplikasi tetap jalan sebagai mode perangkat, tanpa akun/pembayaran).
- **Route helper** `src/lib/server/api.ts`: `route()` memetakan error ke JSON berbahasa Indonesia, `requireUser()`, `paymentMode()` (`live`/`test`/`mock`/`off`), `paymentDeps()`.
- **Cache konten** `src/lib/server/content.ts`: cek versi terbit setiap 30 detik; `invalidateContent()` dipanggil setelah publish/restore.

## 5. Database dan relasi tabel

36 tabel di `supabase/migrations/0001_schema.sql`.

**Kurikulum** (diedit lewat CMS, disajikan sebagai snapshot terbit):

```
cefr_levels (code) 1─1 courses ─< chapters ─< units ─< lessons ─< learning_objectives
                                                        lessons ─< questions ─< answer_options
grammar_topics ─< misconception_tags          questions.topic_id → grammar_topics
lessons.topic_id → grammar_topics             questions.focus_tag / answer_options.misconception_tag → misconception_tags
listening_items ─< questions (listening_item_id)   audio_resources ← questions / vocabulary / listening_items (audio_key)
homework ─< homework_questions >─ questions    exams ─< exam_questions >─ questions
vocabulary, conversation_scenarios (nodes JSONB), pronunciation_guides, achievements
curriculum_versions (snapshot JSONB, satu is_current)
```

Batasan penting: tepat satu jawaban benar per soal (unique partial index), setiap opsi salah wajib punya `feedback`, penjelasan soal tidak boleh kosong, level/difficulty/skor dibatasi `check`.

**Pengguna** (semua `user_id → profiles.id → auth.users.id`):
`profiles` (role student/admin), `exercise_attempts`, `mastery_records`, `review_schedules`,
`review_history`, `lesson_progress`, `learning_history`, `xp_transactions`, `streaks`,
`user_achievements`, `learner_snapshots`. Tabel event memakai `unique (user_id, client_event_id)` untuk idempotensi.

**Billing**: `subscription_plans` (free, premium_monthly, premium_yearly) ─< `payment_transactions`
(status PENDING/SUCCEEDED/FAILED/EXPIRED/CANCELED/NEEDS_REVIEW, channel QRIS/DANA/GOPAY, currency IDR)
─1 `subscriptions` (`source_transaction_id` unique: satu pembayaran = maksimal satu periode),
`payment_webhook_events` (`event_key` unique, `duplicate_count`, `outcome`).

Status Premium **tidak disimpan sebagai flag**: `get_entitlement()` menghitungnya dari periode `subscriptions` yang belum berakhir.

**Fungsi SQL** (semua hanya bisa dieksekusi `service_role`):
akun `get_account`, `get_entitlement`, `update_profile`; progres `sync_learner`, `get_snapshot`, `get_leaderboard`;
CMS `admin_content`, `admin_upsert`, `admin_delete`, `import_content`, `publish_curriculum`, `get_published_content`,
`get_content_version`, `list_curriculum_versions`, `restore_curriculum_version`;
pembayaran `create_payment_intent`, `attach_gateway_payment`, `fail_payment_intent`, `process_payment_event`,
`get_payment`, `list_payments`, `admin_payment_overview`.

## 6. Autentikasi dan otorisasi

- **Produksi (Supabase Auth)**: email + kata sandi di klien (`src/lib/client/session.ts`). Server memverifikasi bearer token dengan `GET {SUPABASE_URL}/auth/v1/user` (`src/lib/server/auth.ts`). Trigger `on_auth_user_created` membuat `profiles` + `streaks`. *Belum pernah dijalankan terhadap Supabase sungguhan.*
- **Dev (embedded)**: `/api/dev-auth` menyimpan akun di `auth.users` lokal (scrypt), token HMAC 7 hari. Ditolak di build produksi. Email di `LENTERA_DEV_ADMIN_EMAIL` otomatis jadi admin.
- **Otorisasi**: RLS (baca baris sendiri saja, tanpa tulis dari klien) + fungsi admin memanggil `assert_admin()` di dalam SQL. Konten Premium dipangkas di server sebelum dikirim.

## 7. Integrasi API eksternal

**Xendit** (`src/lib/server/xendit.ts`, `payments.ts`):

| Operasi | Endpoint |
|---|---|
| Buat | `POST https://api.xendit.co/v3/payment_requests` (type PAY, country ID, currency IDR, capture AUTOMATIC) |
| Status | `GET /v3/payment_requests/{id}` |
| Batal | `POST /v3/payment_requests/{id}/cancel` |
| Simulasi (mode uji) | `POST /v3/payment_requests/{id}/simulate` |
| Webhook masuk | `POST /api/webhooks/xendit`, diverifikasi header `x-callback-token` (perbandingan waktu-konstan) |

Header `api-version: 2024-11-11`, HTTP Basic auth. Event yang diproses: `payment.capture`,
`payment.failure`, `payment.expiry`, `payment_request.expiry`. Kunci de-duplikasi:
`<event>:<payment_id atau payment_request_id>`. Rekonsiliasi lewat API status memakai kunci
`reconcile:<payment_request_id>:<status>` dan gerbang validasi yang sama.

Hal yang **belum terverifikasi** terhadap Xendit sungguhan ditandai `VERIFY` di `xendit.ts`
(konvensi Basic auth, `channel_properties` per kanal, ketersediaan GOPAY di API v3, QRIS sebagai
pembayaran sekali pakai, prefiks kunci). `channel_properties` bisa diganti tanpa deploy lewat
`XENDIT_CHANNEL_PROPERTIES_JSON`.

**Simulator** `src/lib/server/xendit-mock.ts`: meniru bentuk request/response/webhook yang
didokumentasikan; dipakai otomatis di mode embedded dan di tes. Bukan bukti Xendit asli menerima request kita.

Tidak ada integrasi AI, analytics pihak ketiga, atau iklan.

## 8. Cara menjalankan

```bash
cd projects/lentera-english
npm install

# Dev lengkap tanpa layanan luar (DB PGlite + akun lokal + simulator Xendit)
LENTERA_BACKEND=embedded LENTERA_DEV_ADMIN_EMAIL=admin@lentera.test npx next dev -p 3100

# Pemeriksaan
npx tsc --noEmit
TZ=UTC npx vitest run              # 74 tes: engine 28, db 16, payments 30
npx tsx scripts/check-content.ts   # gerbang kualitas konten
npx next build                     # SAAT INI GAGAL karena Bug #1 di PROJECT_STATUS.md
```

Reset data dev: hentikan server, hapus `.data/pglite`.

Produksi (belum pernah dilakukan): terapkan `supabase/migrations/0001..0004` ke proyek Supabase
(**jangan** `test-shim.sql`), set env di bawah, tetapkan satu admin dengan
`update profiles set role='admin' where id='<uuid>'`, impor kurikulum lewat aksi admin
`import-bundled` lalu `publish`, daftarkan URL webhook HTTPS di dashboard Xendit.

## 9. Environment variables

Jangan pernah commit nilainya. `.env*` sudah di-ignore.

| Variabel | Sisi | Wajib | Fungsi |
|---|---|---|---|
| `SUPABASE_URL` | server | produksi | URL proyek Supabase |
| `SUPABASE_SECRET_KEY` | server (rahasia) | produksi | Kunci rahasia baru (`sb_secret_...`) untuk memanggil fungsi SQL. Dikirim hanya di header `apikey`. Jangan pernah ke klien |
| `SUPABASE_SERVICE_ROLE_KEY` | server (rahasia) | produksi, lama | Alternatif untuk proyek lama (kunci JWT `service_role`, berlaku sampai akhir 2026). Dipakai bila `SUPABASE_SECRET_KEY` kosong |
| `NEXT_PUBLIC_SUPABASE_URL` | klien | produksi | Supabase Auth di browser |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | klien | produksi | Kunci publik baru (`sb_publishable_...`) untuk Supabase Auth di browser |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | klien | produksi, lama | Alternatif untuk proyek lama (kunci JWT `anon`). Dipakai bila kunci publishable kosong |
| `PAYMENT_PROVIDER` | server | opsional | Kosong = QRIS manual (bawaan). `xendit` = pakai Xendit (butuh dua variabel di bawah) |
| `XENDIT_SECRET_KEY` | server (rahasia) | hanya bila `PAYMENT_PROVIDER=xendit` | Kunci Xendit; prefiks produksi → mode `live`, lainnya → `test` |
| `XENDIT_WEBHOOK_TOKEN` | server (rahasia) | hanya bila `PAYMENT_PROVIDER=xendit` | Token verifikasi webhook dari dashboard Xendit |
| `XENDIT_CHANNEL_PROPERTIES_JSON` | server | opsional | Override `channel_properties` per kanal; mendukung `{RETURN_URL}`, `{EXPIRES_AT}` |
| `APP_URL` | server | disarankan | URL publik aplikasi untuk return URL pembayaran |
| `LENTERA_BACKEND` | server | dev | `embedded` untuk PGlite |
| `LENTERA_ALLOW_EMBEDDED` | server | jangan di produksi | Izinkan embedded di build produksi (hanya untuk e2e) |
| `LENTERA_DATA_DIR` | server | opsional | Lokasi data PGlite (default `.data/pglite`) |
| `LENTERA_DEV_SECRET` | server | dev | Kunci HMAC token dev. Ada nilai default di kode; hanya aman untuk dev |
| `LENTERA_DEV_ADMIN_EMAIL` | server | dev | Email yang otomatis jadi admin di mode embedded |
