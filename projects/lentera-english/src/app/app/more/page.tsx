'use client';
import Link from 'next/link';
import { NAV } from '@/components/nav';
import { PageHeader } from '@/components/ui';

const DESC: Record<string, string> = {
  '/app/plan': 'Target tiap minggu sampai C2 untuk paket tahunan.',
  '/app/homework': 'Tugas tiap pelajaran dan bab, lengkap dengan tenggat.',
  '/app/exams': 'Tes penempatan, ujian unit, dan ujian level CEFR.',
  '/app/vocabulary': 'Kata, IPA, arti, contoh, dan audio.',
  '/app/grammar': 'Rujukan semua topik tata bahasa.',
  '/app/stories': 'Cerita pendek beranimasi, lalu pertanyaan tentang ceritanya.',
  '/app/listening': 'Latihan menyimak dan panduan pelafalan.',
  '/app/shadowing': 'Dengar, rekam suaramu, lalu bandingkan sendiri.',
  '/app/conversations': 'Simulasi situasi nyata dengan dialog bercabang.',
  '/app/analytics': 'Ketepatan, waktu belajar, dan pola kesalahanmu.',
  '/app/achievements': 'Lencana, tonggak XP, dan hadiah bab.',
  '/app/leaderboard': 'Liga mingguan, teman, dan tantangan XP.',
  '/app/subscription': 'Paket Free dan Premium, riwayat transaksi.',
  '/app/settings': 'Tema, pengingat harian, aksen, dan mode offline.',
};

export default function MorePage() {
  return (
    <div>
      <PageHeader title="Kelas" subtitle="Semua ruang belajar di sekolah digitalmu." />
      <ul className="grid gap-3 sm:grid-cols-2">
        {NAV.filter((n) => DESC[n.href]).map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link href={href} className="flex h-full items-center gap-3 rounded-3xl border border-line bg-surface p-4 shadow-card transition hover:border-brand">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand"><Icon size={24} aria-hidden /></span>
              <span><span className="block font-extrabold">{label}</span><span className="block text-sm text-muted">{DESC[href]}</span></span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
