import Link from 'next/link';
import { BookOpen, Brain, CalendarClock, Check, ClipboardList, GraduationCap, Headphones, MessagesSquare, ShieldCheck, Smartphone, Target, WifiOff, Wrench } from 'lucide-react';
import { Logo, Mascot } from '@/components/Mascot';
import { Badge, Card, LinkButton } from '@/components/ui';
import { ANDROID_APP } from '@/lib/android';
import { rupiah } from '@/lib/format';
import { BENCHMARK_MONTHLY, FREE_FEATURES, PLANS, PREMIUM_FEATURES } from '@/lib/plans';

/** Android app (Trusted Web Activity around this site), served from public/download. */
const ANDROID_APK = ANDROID_APP.url;

const STEPS = [
  ['Pengantar', 'Kamu tahu persis apa yang akan dipelajari.'],
  ['Materi', 'Penjelasan berbahasa Indonesia dengan contoh bahasa Inggris.'],
  ['Contoh benar dan salah', 'Kesalahan khas pelajar Indonesia dibedah satu per satu.'],
  ['Latihan terbimbing', 'Ada petunjuk, pembahasan langsung muncul.'],
  ['Latihan mandiri', 'Tanpa petunjuk, untuk menguji pemahamanmu.'],
  ['PR', 'Tugas tambahan dengan tenggat.'],
  ['Tes penguasaan', 'Minimal 85% untuk membuka pelajaran berikutnya.'],
  ['Ulangan terjadwal', 'Materi kembali di hari ke-1, 3, 7, 14, dan 30.'],
];
const FEATURES = [
  [Wrench, 'Mengenali pola kesalahanmu', 'Sering tertukar was dan were? Sistem mendeteksinya, memberi latihan khusus dari mudah ke sulit, lalu mengujimu lagi.'],
  [Target, 'Dikuasai, bukan sekadar selesai', 'Satu kuis bagus tidak cukup. Topik baru dianggap dikuasai setelah skor 85% yang konsisten dan lulus tes ulang di hari lain.'],
  [CalendarClock, 'Ulangan tepat sebelum lupa', 'Jawaban salah memendekkan jarak ulangan, jawaban benar memanjangkannya.'],
  [MessagesSquare, 'Simulasi percakapan nyata', 'Restoran, bandara, wawancara kerja. Tiap pilihan dinilai dari tata bahasa dan kewajarannya.'],
  [Headphones, 'Menyimak dan pelafalan', 'Putar normal atau lambat, lihat posisi lidah dan bibir, rekam suaramu sendiri.'],
  [GraduationCap, 'PR dan ujian sungguhan', 'Tes penempatan, ujian unit, dan ujian level CEFR dengan pembahasan lengkap.'],
] as const;
const LEVELS = [['A1', 'Pemula'], ['A2', 'Dasar'], ['B1', 'Menengah'], ['B2', 'Menengah Atas'], ['C1', 'Mahir'], ['C2', 'Sangat Mahir']];
const FAQ = [
  ['Apakah aplikasi ini memakai AI saat aku belajar?', 'Tidak. Semua materi diperiksa dan dikembangkan sebelum terbit. Penilaian jawaban dan rekomendasi belajar dihitung dengan aturan dan skor yang bisa dijelaskan, bukan model bahasa, dan tidak ada jawabanmu yang dikirim ke layanan AI.'],
  ['Apakah pelafalanku dinilai otomatis?', 'Tidak. Kami tidak mengklaim penilaian pelafalan otomatis. Kamu mendapat contoh audio, panduan posisi mulut, dan perekam untuk membandingkan sendiri.'],
  ['Apakah Premium diperpanjang otomatis?', 'Tidak ada auto-debit. Kamu memperpanjang sendiri. Saat masa aktif habis, akun kembali ke Free dan seluruh progresmu tetap tersimpan.'],
  ['Metode pembayaran apa yang tersedia?', 'QRIS, yang bisa dibayar dari aplikasi mobile banking atau e-wallet apa pun (DANA, GoPay, OVO, ShopeePay, BCA, dan lainnya). Setelah membayar, laporkan pembayaranmu di aplikasi; Premium aktif setelah kami mengonfirmasinya. Kami tidak menyimpan data rekening atau e-wallet.'],
  ['Apakah semua level sudah lengkap?', 'Kurikulum A1 sampai C2 sudah dipetakan dan setiap level punya pelajaran yang bisa dikerjakan. Unit yang masih disusun ditandai jelas di jalur belajar.'],
];

export default function Landing() {
  const saving = Math.round((1 - PLANS.premium_monthly.price / BENCHMARK_MONTHLY) * 100);
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4">
        <Link href="/" className="text-lg"><Logo /></Link>
        <nav className="flex items-center gap-2" aria-label="Navigasi">
          <a href="#harga" className="hidden rounded-xl px-3 py-2 text-sm font-bold text-muted hover:text-ink sm:block">Harga</a>
          <LinkButton href="/masuk" variant="secondary" size="sm">Masuk</LinkButton>
          <LinkButton href="/app" size="sm">Mulai gratis</LinkButton>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 pb-14 pt-8 lg:grid-cols-[1.2fr_1fr] lg:pt-16">
          <div>
            <Badge tone="accent"><ShieldCheck size={14} aria-hidden />Semua materi diperiksa dan dikembangkan</Badge>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">Belajar bahasa Inggris sampai <span className="text-brand">benar-benar paham</span>.</h1>
            <p className="mt-4 max-w-xl text-lg text-muted">Lentera English adalah sekolah bahasa Inggris digital untuk pelajar Indonesia: kurikulum CEFR dari A1 sampai C2, penjelasan berbahasa Indonesia, PR, ujian, dan ulangan terjadwal yang menyesuaikan diri dengan kesalahanmu.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/app" size="lg">Mulai belajar gratis</LinkButton>
              <LinkButton href="/app/placement" size="lg" variant="secondary">Ikuti tes penempatan</LinkButton>
            </div>
            <p className="mt-3 text-sm text-muted">Tanpa kartu kredit. Bisa langsung dicoba sebagai tamu.</p>
            {/* A plain <a>: the APK is a static file, not a route. */}
            <a href={ANDROID_APK} download className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-brand underline underline-offset-4 hover:text-ink"><Smartphone size={18} aria-hidden />Unduh aplikasi Android (APK {ANDROID_APP.versionName})</a>
          </div>
          <Card className="relative mx-auto w-full max-w-sm">
            <Mascot mood="cheer" size={120} className="mx-auto" />
            <p className="mt-2 text-center text-sm font-bold text-muted">Kenalkan, Pijar si kunang-kunang.</p>
            <div className="mt-4 rounded-2xl border-2 border-bad bg-bad-soft p-3 text-sm">
              <p className="font-extrabold text-bad">Belum tepat</p>
              <p className="en mt-1 font-bold">I <span className="line-through decoration-bad">were</span> sick yesterday.</p>
              <p className="mt-1"><span className="font-bold">Kenapa salah: </span>&ldquo;I&rdquo; berpasangan dengan &ldquo;was&rdquo;.</p>
            </div>
            <div className="mt-2 rounded-2xl bg-brand-soft p-3 text-sm"><p className="font-extrabold text-brand">Langkah berikutnya untukmu</p><p className="mt-1">Latihan perbaikan: tertukar was / were. Kamu 3× keliru pada pola ini minggu ini.</p></div>
          </Card>
        </section>

        <section className="bg-surface py-14">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="text-3xl font-extrabold tracking-tight">Bukan kumpulan kuis. Ini sekolah.</h2>
            <p className="mt-2 max-w-2xl text-muted">Setiap pelajaran mengikuti delapan langkah yang sama, seperti kelas yang dirancang guru berpengalaman.</p>
            <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map(([title, desc], i) => (
                <li key={title} className="rounded-3xl border border-line bg-bg p-4"><span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-extrabold text-on-brand">{i + 1}</span><p className="mt-3 font-extrabold">{title}</p><p className="mt-1 text-sm text-muted">{desc}</p></li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-14">
          <h2 className="text-3xl font-extrabold tracking-tight">Personal tanpa AI</h2>
          <p className="mt-2 max-w-2xl text-muted">Mesin belajar kami memakai aturan, skor berbobot, dan ambang penguasaan. Setiap rekomendasi disertai alasannya.</p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(([Icon, title, desc]) => (
              <Card as="li" key={title}><span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand"><Icon size={24} aria-hidden /></span><h3 className="mt-3 text-lg font-extrabold">{title}</h3><p className="mt-1 text-sm text-muted">{desc}</p></Card>
            ))}
          </ul>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {([[Brain, '14 jenis latihan', 'Dari pilihan ganda sampai menyusun paragraf.'], [BookOpen, 'Selalu ada alasannya', 'Tiap jawaban salah dijelaskan, bukan hanya ditandai.'], [WifiOff, 'Bisa offline', 'Premium dapat mengunduh pelajaran ke perangkat.']] as const).map(([Icon, t, d]) => (
              <div key={t} className="flex items-start gap-3 rounded-2xl bg-surface-2 p-4"><Icon size={22} className="mt-0.5 shrink-0 text-brand" aria-hidden /><div><p className="font-extrabold">{t}</p><p className="text-sm text-muted">{d}</p></div></div>
            ))}
          </div>
        </section>

        <section className="bg-surface py-14">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="text-3xl font-extrabold tracking-tight">Dari nol sampai mahir</h2>
            <p className="mt-2 max-w-2xl text-muted">Kurikulum mengikuti kerangka CEFR. Naik level hanya setelah lulus ujian.</p>
            <ol className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {LEVELS.map(([code, name]) => <li key={code} className="rounded-3xl border border-line bg-bg p-4 text-center"><p className="text-3xl font-extrabold text-brand">{code}</p><p className="mt-1 text-sm font-bold">{name}</p></li>)}
            </ol>
            <p className="mt-4 flex items-start gap-2 text-sm text-muted"><ClipboardList size={18} className="mt-0.5 shrink-0" aria-hidden />Setiap level sudah memiliki pelajaran lengkap. Unit lanjutan di tiap level masih terus ditambahkan dan ditandai &ldquo;sedang disusun&rdquo; di jalur belajar.</p>
          </div>
        </section>

        <section id="harga" className="mx-auto max-w-6xl scroll-mt-6 px-5 py-14">
          <h2 className="text-3xl font-extrabold tracking-tight">Harga yang jujur</h2>
          <p className="mt-2 max-w-2xl text-muted">Sekitar {saving}% di bawah patokan {rupiah(BENCHMARK_MONTHLY)} per bulan. Tanpa perpanjangan otomatis.</p>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <Card><h3 className="text-xl font-extrabold">Free</h3><p className="mt-2 text-4xl font-extrabold">Rp0</p><p className="text-sm text-muted">selamanya</p><ul className="mt-4 space-y-2">{FREE_FEATURES.map((f) => <li key={f} className="flex gap-2 text-sm"><Check size={18} className="mt-0.5 shrink-0 text-ok" aria-hidden />{f}</li>)}</ul><LinkButton href="/app" variant="secondary" full className="mt-5">Mulai gratis</LinkButton></Card>
            <Card className="border-2 border-brand"><h3 className="text-xl font-extrabold">Premium Bulanan</h3><p className="mt-2 text-4xl font-extrabold">{rupiah(PLANS.premium_monthly.price)}</p><p className="text-sm text-muted">untuk 30 hari</p><ul className="mt-4 space-y-2">{PREMIUM_FEATURES.slice(0, 6).map((f) => <li key={f} className="flex gap-2 text-sm"><Check size={18} className="mt-0.5 shrink-0 text-ok" aria-hidden />{f}</li>)}<li className="text-sm text-muted">dan semua manfaat Premium lainnya</li></ul><LinkButton href="/app/subscription" full className="mt-5">Pilih bulanan</LinkButton></Card>
            <Card className="border-2 border-accent"><div className="flex items-center gap-2"><h3 className="text-xl font-extrabold">Premium Tahunan</h3><Badge tone="ok">Diskon {PLANS.premium_yearly.discountPct}%</Badge></div><p className="mt-2 text-lg font-bold text-muted line-through" aria-label={`Harga normal ${rupiah(PLANS.premium_yearly.listPrice)}`}>{rupiah(PLANS.premium_yearly.listPrice)}</p><p className="text-4xl font-extrabold">{rupiah(PLANS.premium_yearly.price)}</p><p className="text-sm text-muted">untuk 365 hari · setara ±Rp41.438 per bulan</p><ul className="mt-4 space-y-2">{PREMIUM_FEATURES.slice(6).map((f) => <li key={f} className="flex gap-2 text-sm"><Check size={18} className="mt-0.5 shrink-0 text-ok" aria-hidden />{f}</li>)}<li className="text-sm text-muted">dan semua manfaat paket bulanan</li></ul><LinkButton href="/app/subscription" variant="accent" full className="mt-5">Pilih tahunan</LinkButton></Card>
          </div>
          <p className="mt-4 text-sm text-muted">Bayar dengan QRIS dari aplikasi mobile banking atau e-wallet apa pun. Premium aktif setelah pembayaranmu kami konfirmasi.</p>
        </section>

        <section className="bg-surface py-14">
          <div className="mx-auto max-w-3xl px-5">
            <h2 className="text-3xl font-extrabold tracking-tight">Pertanyaan umum</h2>
            <div className="mt-6 space-y-3">
              {FAQ.map(([q, a]) => <details key={q} className="rounded-2xl border border-line bg-bg p-4"><summary className="cursor-pointer font-extrabold">{q}</summary><p className="mt-2 text-muted">{a}</p></details>)}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-14 text-center">
          <Mascot mood="happy" size={96} className="mx-auto" />
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight">Nyalakan lenteramu hari ini</h2>
          <p className="mt-2 text-muted">Lima belas menit sehari, dengan urutan belajar yang benar.</p>
          <LinkButton href="/app" size="lg" className="mt-5">Mulai belajar gratis</LinkButton>
        </section>
      </main>

      <footer className="border-t border-line py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 text-sm text-muted">
          <Logo size={22} />
          <p>Seluruh mesin belajar berjalan tanpa layanan AI.</p>
          <nav className="flex flex-wrap gap-4" aria-label="Tautan kaki"><a href={ANDROID_APK} download className="hover:text-ink">Aplikasi Android</a><Link href="/masuk" className="hover:text-ink">Masuk</Link><Link href="/daftar" className="hover:text-ink">Daftar</Link><Link href="/admin" className="hover:text-ink">Admin</Link></nav>
        </div>
      </footer>
    </div>
  );
}
