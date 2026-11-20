# Chatbot Pijar: analisis arsitektur AI hybrid

**Status: analisis saja; belum ada kode aplikasi yang diubah.** Implementasi dimulai setelah pemilik menjawab keputusan di bagian 9.

- Tanggal: 20 November 2026
- Basis: branch `ccr-17d3d5e4-jx43zs` (redesign 2026 sudah live)

---

## 1. Hasil audit codebase (yang relevan untuk chatbot)

| Bagian | Kondisi sekarang | Dipakai ulang untuk Pijar |
|---|---|---|
| Hosting | Next.js 16 di Netlify. Route `src/app/api/*` berjalan sebagai Netlify Functions. Batas: **60 detik** per permintaan, termasuk respons streaming (maks. 20 MB). Variabel env dibekukan per deploy; total semua env maks. ±4 KB. | Endpoint `/api/pijar` streaming, batas waktu internal 45 detik |
| Autentikasi | `requireUser()` (`src/lib/server/api.ts`) memverifikasi JWT Supabase; dev memakai akun lokal. Tamu tidak punya akun. | Chatbot wajib login |
| Hak Premium | `get_entitlement()` (SQL, migrasi 0015). Urutan: admin → langganan berbayar → lisensi sekolah → free. Klien memeriksa ulang lewat `isPremium()` dengan `expiresAt`. Konten Premium dikunci di server (`/api/content`). | Trial cukup jadi sumber hak baru di fungsi ini; semua fitur Premium ikut terbuka otomatis |
| Rate limit | `rateLimit()` (`src/lib/server/security.ts`), memakai `hit_rate_limit()` di Postgres. Fixed window, kunci di-hash. | Batas per pengguna dan per IP |
| Error | `route()` memetakan error ke JSON rapi. `reportServerError()` mengirim ke tab Kesehatan admin (R9). | Error AI ikut tercatat |
| Basis data | Supabase + RLS. Semua fungsi `SECURITY DEFINER` dan hanya bisa dipanggil `service_role`. Uji memakai PGlite. Migrasi terakhir **0020**; SQL dijalankan pemilik lewat SQL Editor. | Migrasi baru **0021** |
| Secret | `SUPABASE_SECRET_KEY` hanya di env Netlify. CSP `connect-src 'self' supabase`. | Kunci AI hanya di env backend. Browser hanya bicara ke `/api/pijar` (domain sendiri), jadi CSP tidak berubah. |
| Deploy | Hanya commit dengan `[deploy]` di subjek yang dibangun. Perubahan env butuh deploy ulang. | Ganti server AI = ubah env, lalu deploy ulang (bagian 6) |
| UI | Redesign 2026 sudah punya kit lengkap: Sheet, Toast, Skeleton, Segmented. Maskot Pijar (14 ekspresi). ParentGate untuk Mode SD. | Halaman chat `/app/pijar` dengan Pijar sebagai avatar |
| Fungsi server | Backend di Netlify berada di AS (`cmh`). Supabase di Tokyo. Fungsi serverless **tidak bisa bergabung ke jaringan privat** (VPN/tailnet) karena tidak punya proses yang terus hidup. | Koneksi ke Ollama harus berupa **terowongan terautentikasi**, bukan VPN (bagian 3) |

**Kesimpulan audit:** pola yang dibutuhkan semuanya sudah ada. Yang baru:
- satu lapisan provider AI;
- satu endpoint;
- satu migrasi (kuota, log, trial);
- satu halaman chat.

Logika belajar, XP, progres, dan pembayaran tidak disentuh. Satu-satunya perubahan logika bisnis adalah **trial 3 hari**, atas permintaan pemilik.

---

## 2. Arsitektur yang diusulkan

```
HP / browser ──HTTPS──▶ Netlify: /api/pijar  (Next.js route, streaming)
                          │ 1. requireUser (JWT Supabase)
                          │ 2. akses: PIJAR_ACCESS (admin | premium)
                          │ 3. rate limit (per user + per IP)
                          │ 4. ai_begin(): hak Premium/Trial + kuota harian + slot paralel (SQL, atomik)
                          │ 5. provider.stream()  ── timeout, batal bila pengguna menutup
                          │ 6. ai_finish(): token, latensi, status (gagal = kuota dikembalikan)
                          ▼
                 AIProvider (dipilih dari env)
          ┌──────────────┬───────────────┬────────────────┐
          │ OllamaProvider│ GroqProvider  │ GeminiProvider │  MockProvider (uji)
          │  (aktif)      │ (siap, mati)  │ (siap, mati)   │
          └──────┬───────┴───────────────┴────────────────┘
                 │ HTTPS + header rahasia (dari env)
                 ▼
   Dev : Cloudflare Tunnel ─▶ PC pemilik: Ollama 127.0.0.1:11434 (tidak ada port terbuka)
   Prod: Cloudflare Tunnel ─▶ server cloud (GPU): Ollama 127.0.0.1:11434
```

### Abstraksi provider (`src/lib/server/ai/`)

```ts
interface ChatMessage { role: 'system' | 'user' | 'assistant'; content: string }
interface ChatOptions { maxTokens: number; temperature: number; signal: AbortSignal }
interface ChatUsage { tokensIn?: number; tokensOut?: number; model: string }
interface AIProvider {
  readonly id: 'ollama' | 'groq' | 'gemini' | 'mock';
  readonly model: string;
  stream(messages: ChatMessage[], opts: ChatOptions): AsyncGenerator<string, ChatUsage>; // teks per potongan
  health(signal: AbortSignal): Promise<boolean>;
}
```

| Berkas | Isi |
|---|---|
| `ai/types.ts` | Antarmuka di atas, ditambah `AIError` dengan kode: `unavailable`, `timeout`, `busy`, `bad_response`, `config`. |
| `ai/providers/ollama.ts` | `POST {OLLAMA_BASE_URL}/api/chat` dengan `stream: true` (NDJSON). Membaca `prompt_eval_count`/`eval_count` untuk token. |
| `ai/providers/groq.ts` | API kompatibel OpenAI (`/openai/v1/chat/completions`, SSE). **Mati** sampai `GROQ_API_KEY` diisi dan dipilih. |
| `ai/providers/gemini.ts` | `streamGenerateContent?alt=sse`, header `x-goog-api-key`. **Mati** sampai diisi dan dipilih. |
| `ai/providers/mock.ts` | Jawaban tetap, untuk unit test dan e2e. Otomatis dipakai di server uji (embedded); tidak pernah dipakai di produksi. |
| `ai/registry.ts` | Membaca env, memvalidasi (URL harus `https://` di produksi, kunci wajib ada), lalu mengembalikan provider utama dan cadangan (opsional, default mati). |
| `ai/pijar.ts` | Prompt sistem Pijar (bahasa Indonesia; menyesuaikan level CEFR dan Mode SD). Juga pemangkas riwayat: maks. 6 giliran, input maks. 1.000 karakter. |
| `app/api/pijar/route.ts` | `POST` untuk chat (streaming) dan `GET` untuk status (sisa kuota, server menyala atau tidak). |

Ganti penyedia tanpa mengubah kode: `AI_PROVIDER=ollama|groq|gemini|off`, ditambah variabel milik penyedia itu.

### Timeout dan penanganan error

| Batas | Nilai awal (env) | Alasan |
|---|---|---|
| Sambungan ke server AI | 5 detik | Server mati langsung ketahuan |
| Token pertama | 20 detik | Antrean terlalu panjang langsung dihentikan |
| Total jawaban | 45 detik | Di bawah batas Netlify 60 detik |
| Panjang jawaban | 350 token | Jawaban ringkas, waktu tetap terkendali |

Jawaban dialirkan kata demi kata, jadi pengguna langsung melihat tulisan muncul. Pengguna menutup layar berarti permintaan ke server AI ikut dibatalkan.

Setiap kegagalan menghasilkan pesan yang ramah (misalnya "Pijar sedang istirahat, coba lagi sebentar"), **kuota dikembalikan**, dan error tercatat di tab Kesehatan admin.

| Kode HTTP | Arti |
|---|---|
| 401 | Belum login |
| 403 `premium_required` | Akun Free |
| 429 `quota` | Kuota hari ini habis |
| 429 `busy` | Server AI sedang penuh |
| 503 `unavailable` | Server AI mati |
| 504 `timeout` | Jawaban terlalu lama |

---

## 3. Koneksi privat ke Ollama (tanpa membuka port)

Ollama tidak punya autentikasi sendiri, jadi **tidak boleh** dibuka langsung ke internet. Backend berjalan di Netlify dan tidak bisa masuk VPN. Karena itu sambungannya berupa terowongan keluar dari komputer pemilik, ditambah kunci rahasia yang hanya dimiliki backend.

**Opsi A, disarankan: Cloudflare Tunnel + Cloudflare Access (service token).** Gratis.
- `cloudflared` di PC pemilik membuka sambungan **keluar** ke Cloudflare. Tidak ada port router yang dibuka, dan Ollama tetap di `127.0.0.1`.
- Alamat seperti `https://ollama-dev.<domain-anda>` hanya bisa dipakai bila permintaan membawa header `CF-Access-Client-Id` dan `CF-Access-Client-Secret`. Kedua nilai itu disimpan di env Netlify.
- Permintaan tanpa token ditolak di Cloudflare dan tidak pernah sampai ke PC.
- Syarat: akun Cloudflare dan **satu domain** yang dikelola di Cloudflare (±Rp150 rb/tahun bila belum punya).

**Opsi B, tanpa domain: Tailscale Funnel atau ngrok, plus proxy kecil berpassword di PC.**
- Proxy (misalnya Caddy) mewajibkan header `Authorization: Bearer <rahasia>` lalu meneruskan ke Ollama di `127.0.0.1`.
- Alamatnya tetap publik, tetapi semua permintaan tanpa token ditolak proxy.
- Lebih banyak bagian yang harus dijaga daripada opsi A.

Untuk produksi dipakai cara yang sama di server cloud: `cloudflared` di VPS, firewall menutup semua port masuk. **Pindah dari PC ke cloud cukup mengganti env:**

```
OLLAMA_BASE_URL=https://ollama.<domain>   (sebelumnya https://ollama-dev.<domain>)
OLLAMA_ACCESS_CLIENT_ID / OLLAMA_ACCESS_CLIENT_SECRET   (token baru untuk server produksi)
OLLAMA_MODEL=llama3.1:8b-instruct-q4_K_M
```

Setelah itu deploy ulang. Tidak ada baris kode yang berubah.

---

## 4. Akses, kuota, dan rate limit

| Pengguna | Pijar | Kuota/hari (reset 00.00 WIB) |
|---|---|---|
| Tamu | Tidak (diajak buat akun) | – |
| Free | Tidak. Halaman Pijar menampilkan ajakan ke Premium. | 0 |
| **Trial 3 hari (akun baru)** | Ya | 5 |
| Premium (bulanan/tahunan/lisensi sekolah) | Ya | **5** (rekomendasi, alasan di bagian 5) |
| Admin | Ya, untuk uji | 30 |

**Hitungan kuota:**
- 1 kuota = 1 pertanyaan yang **berhasil** dijawab.
- Jawaban yang gagal atau terputus karena server tidak dihitung.
- Kuota dihitung atomik di SQL (`ai_begin`), jadi membuka banyak tab tidak bisa melewati batas.

**Rate limit tambahan** (memakai `hit_rate_limit` yang sudah ada):
- 1 pertanyaan per 6 detik per pengguna;
- 20 per jam per pengguna;
- 60 per jam per IP.

**Slot paralel global:** maksimal 4 jawaban diproses bersamaan (env `AI_MAX_INFLIGHT`). Selebihnya langsung dijawab "Pijar sedang sibuk", bukan menggantung sampai batas waktu.

**Saklar akses:** `PIJAR_ACCESS=admin` selama tahap development. Live site tidak boleh bergantung pada PC pemilik untuk pengguna sungguhan. Setelah server produksi siap, ubah ke `PIJAR_ACCESS=premium`.

---

## 5. Kapasitas: kenapa 5 per hari (bukan 8) untuk 500 pengguna aktif

**Asumsi per jawaban:**
- ±1.000 token masuk (prompt sistem + riwayat singkat + pertanyaan);
- ±250 token keluar;
- jam sibuk 19.00–22.00 WIB memuat sekitar 15% pemakaian harian, dengan lonjakan sampai 3× rata-rata.

| | 5 per hari | 8 per hari |
|---|---|---|
| Maksimum per hari (500 × kuota) | 2.500 | 4.000 |
| Perkiraan nyata (±50% terpakai) | ±1.250 | ±2.000 |
| Jam sibuk, rata-rata | ±3 jawaban/menit | ±5 jawaban/menit |
| Jam sibuk, lonjakan | ±10 jawaban/menit | ±15 jawaban/menit |

**Perkiraan kemampuan server** (dari pengalaman umum, belum diukur di server Anda):

| Server | Kecepatan | Kapasitas |
|---|---|---|
| CPU 8 core tanpa GPU, Llama 3.2 3B | ±25 detik per jawaban | ±2–3 jawaban/menit, tidak cukup untuk 500 pengguna pada kuota mana pun |
| 1 GPU 24 GB (mis. L4/RTX 4090), Llama 3.1 8B, 4 paralel | ±5–8 detik per jawaban | ±30–40 jawaban/menit, cukup untuk 5/hari dengan ruang 3×; untuk 8/hari ruangnya tipis saat lonjakan |
| PC pemilik (tahap dev) | Tergantung spesifikasi | Hanya untuk uji, bukan 500 pengguna |

**Rekomendasi: 5 pertanyaan per hari.**
- Muat dengan nyaman di 1 GPU, jadi jawaban tetap cepat di jam sibuk.
- Menaikkan kuota nanti terasa sebagai hadiah; menurunkannya terasa sebagai pengurangan.
- Angkanya disimpan di env (`PIJAR_DAILY_PREMIUM`), sehingga naik ke 8 cukup dengan ubah env setelah dua minggu data admin menunjukkan p95 latensi di bawah 10 detik.

Skrip uji beban (`scripts/pijar-bench.mjs`) disiapkan untuk mengukur angka sungguhan di server Anda.

---

## 6. Trial Premium 3 hari untuk akun baru

**Cara kerja:**
- Kolom baru `profiles.trial_ends_at`, diisi otomatis saat akun dibuat (trigger `handle_new_user`): `now() + 3 hari`.
- `get_entitlement()` menambah sumber hak keempat dengan urutan: admin → berbayar → sekolah → **trial** (`plan: 'trial'`, `expires_at` = akhir trial).
- Langganan berbayar selalu menang. Membayar saat trial tidak menghilangkan sisa hari bayar.

**Dampak otomatis** (karena semua fitur Premium membaca hak yang sama):
- semua materi Premium terbuka;
- nyawa tak terbatas;
- ujian level dan unduhan offline bisa dipakai;
- Pijar 5 per hari.

Saat trial habis, akun kembali Free. Unduhan offline dihapus, sama seperti Premium yang berakhir sekarang. Progres, XP, dan sertifikat yang sudah didapat tetap ada.

**Batas:**
- Hanya untuk akun yang dibuat **setelah** rilis ini; akun lama tidak berubah.
- Satu kali per akun.
- Tamu tidak mendapat trial (perlu akun).

**UI:**
- Lencana "Premium uji coba · sisa 2 hari" di header/Profil.
- Pengingat di Beranda 1 hari sebelum habis, memakai kartu "Premium-mu berakhir" yang sudah ada dan ikut menghitung trial.
- Paket Free/Premium di halaman Premium menjelaskan trial.

**Risiko penyalahgunaan:** membuat banyak akun demi trial. Dampaknya kecil (15 pertanyaan Pijar per akun). Bila jadi masalah, aktifkan "Confirm email" di Supabase atau batasi pendaftaran per IP.

---

## 7. Keamanan, privasi, dan anak

**Kunci dan rahasia**
- Hanya di env Netlify (scope Functions), tanpa `NEXT_PUBLIC_`.
- Tidak pernah dikirim ke browser, tidak dicatat di log, dan tidak masuk repo.
- Cocok dengan aturan proyek: `SUPABASE_SECRET_KEY` juga tidak pernah di-commit.

**Isi percakapan**
- Rekomendasi: **tidak disimpan di server.** Riwayat chat ada di perangkat. Server hanya mencatat metadata: siapa, kapan, model, token, latensi, status.
- Alasannya: lebih ringan untuk UU PDP, apalagi banyak pengguna di bawah umur.
- Opsi lain (keputusan 4): simpan isi 7 hari untuk peninjauan keamanan.

**Prompt sistem Pijar**
- Hanya membahas bahasa Inggris dan belajar.
- Menjawab dalam bahasa Indonesia sederhana, dengan contoh bahasa Inggris.
- Menolak topik dewasa, kekerasan, dan data pribadi.
- Tidak mengaku manusia dan tidak mengerjakan ujian untuk pengguna.

**Mode SD**
- Bahasa lebih sederhana.
- Di layar ada pengingat "minta bantuan orang dewasa bila bingung".
- Usulan: pembukaan pertama memakai ParentGate yang sudah ada (keputusan 5).

**Lapisan pengaman lain**
- Pijar tidak punya akses ke data pengguna lain, tidak bisa memanggil fungsi, dan tidak bisa mengubah progres. Kerugian terbesar dari prompt injection hanyalah jawaban di luar topik.
- Filter kata kasar sederhana untuk masukan dan jawaban.
- Tombol "Laporkan jawaban" yang mengirim catatan anonim ke admin.

**Penyedia pihak ketiga (Groq/Gemini)** berarti pesan pengguna diproses perusahaan di luar negeri. Bila kelak diaktifkan, kebijakan privasi `/privasi` harus diperbarui dulu. Karena itu keduanya dibuat siap pakai tetapi **mati**.

---

## 8. Rencana implementasi

Setiap fase:
- diperiksa dengan typecheck, lint, unit test, build, e2e, dan suite `redesign`;
- tidak mengubah fitur yang ada.

| Fase | Isi | Uji baru |
|---|---|---|
| **A. Data** | Migrasi `0021_pijar_trial.sql` dan `supabase/manual/apply-0021.sql`: kolom trial, `get_entitlement` + trial, tabel `ai_usage` (RLS, hanya service role, retensi 90 hari lewat cron), fungsi `ai_begin` / `ai_finish` / `ai_quota`. | Unit test PGlite: urutan hak (bayar > sekolah > trial), trial habis, kuota atomik, refund saat gagal, slot paralel |
| **B. Provider** | `src/lib/server/ai/*`: Ollama, Groq (mati), Gemini (mati), Mock; registry, validasi env, timeout, pemetaan error. | Unit test dengan `fetch` palsu: streaming, token, timeout, server mati, respons rusak |
| **C. API** | `/api/pijar` POST (stream) + GET (status). Auth, saklar akses, rate limit, kuota, log, pembatalan, `reportServerError`. | Unit + e2e: Free 403, trial/Premium dijawab, kuota habis 429, provider mati → kuota kembali |
| **D. UI** | `/app/pijar` "Tanya Pijar": avatar maskot Pijar, gelembung chat, teks mengalir, sisa kuota, ajakan Premium untuk Free, info trial, pesan error ramah. Pintu masuk di Lainnya (grup Latihan) dan Beranda. Lencana trial. | e2e + axe terang/gelap, layar 320 px, pembaca layar (live region) |
| **E. Admin dan dokumen** | Tab admin "Pijar": pemakaian hari ini, p50/p95 latensi, tingkat error, status server AI. `docs/PIJAR-SETUP.md`: langkah dev (Ollama + model + Cloudflare Tunnel + Access + env Netlify) dan produksi (VPS GPU, Ollama systemd, cloudflared, firewall, ganti env, uji beban). Kebijakan privasi diperbarui. | e2e admin |

**Urutan rilis:**
1. Deploy dengan `PIJAR_ACCESS=admin`. Hanya Anda yang memakai Pijar, lewat PC Anda.
2. Pemilik menjalankan `apply-0021.sql`. Trial langsung berlaku untuk akun baru.
3. Server produksi siap: ganti env ke server cloud, ubah `PIJAR_ACCESS=premium`, deploy.

---

## 9. Keputusan yang perlu dijawab pemilik

1. **Kuota Premium: 5 pertanyaan per hari** (rekomendasi; bisa naik ke 8 lewat env setelah data jam sibuk terkumpul). Trial juga 5 per hari.
2. **Cara menyambung ke Ollama:** Opsi A (Cloudflare Tunnel + Access, perlu satu domain di Cloudflare; disarankan) atau Opsi B (Tailscale Funnel/ngrok + proxy berpassword, tanpa domain).
3. **Spesifikasi PC Anda** untuk tahap dev: RAM, GPU (merek/VRAM), sistem operasi. Ini menentukan model: Llama 3.1 8B bila ada GPU ≥ 8 GB atau RAM ≥ 16 GB; Llama 3.2 3B bila lebih kecil.
4. **Isi chat:** tidak disimpan di server, hanya metadata (rekomendasi), atau disimpan 7 hari untuk peninjauan.
5. **Pelajar Mode SD:** boleh memakai Pijar setelah pemeriksaan orang tua (ParentGate) satu kali (rekomendasi), atau Pijar tidak tersedia untuk SD.
6. **Trial:** Premium penuh selama 3 hari, termasuk ujian level dan sertifikat (rekomendasi), atau tanpa ujian level.
