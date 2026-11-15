// Lentera untuk Sekolah (Rilis 10): what schools, teachers and parents get,
// how a license works, and the way to ask for one (contact form, topic
// "sekolah"). Static: costs nothing per visit.
import type { Metadata } from 'next';
import Link from 'next/link';
import { BarChart3, ClipboardCheck, Crown, HeartHandshake, KeyRound, School, Users } from 'lucide-react';
import { PublicPage } from '@/components/PublicPage';

export const metadata: Metadata = {
  title: 'Lentera untuk Sekolah',
  description: 'Kelas bahasa Inggris digital untuk sekolah dan kursus: guru memberi tugas dan memantau progres siswa, siswa mendapat Premium selama lisensi, orang tua ikut memantau.',
};

const FEATURES = [
  [School, 'Kelas dengan kode', 'Guru membuat kelas dan membagikan kode 6 karakter. Siswa bergabung dari HP atau komputer, tanpa formulir panjang.'],
  [ClipboardCheck, 'Tugas dengan tenggat', 'Pilih pelajaran, PR, atau ujian unit dari kurikulum CEFR A1–C2, beri tenggat, dan lihat siapa yang sudah selesai serta nilainya.'],
  [BarChart3, 'Progres per siswa', 'XP minggu ini, pelajaran tuntas, rata-rata penguasaan, beruntun, dan tugas yang terlewat. Unduh rekap CSV untuk rapor.'],
  [Crown, 'Siswa otomatis Premium', 'Selama lisensi berlaku, setiap siswa di kelas mendapat semua materi Premium, nyawa tak terbatas, dan ujian level.'],
  [HeartHandshake, 'Dasbor orang tua', 'Anak membuat kode sekali pakai; orang tua melihat hari aktif, pelajaran, PR, dan tugas guru, tanpa melihat jawaban.'],
  [Users, 'Aman dan sederhana', 'Tanpa iklan, tanpa AI generatif. Guru hanya melihat siswa di kelasnya sendiri; siswa bisa keluar kapan saja.'],
] as const;

export default function SchoolPage() {
  return (
    <PublicPage title="Lentera untuk Sekolah" intro="Satu ruang belajar bahasa Inggris untuk guru, siswa, dan orang tua, mengikuti kurikulum CEFR A1 sampai C2.">
      <ul className="grid gap-4 sm:grid-cols-2">
        {FEATURES.map(([Icon, title, body]) => (
          <li key={title} className="rounded-3xl border border-line bg-surface p-5">
            <Icon className="text-brand" aria-hidden />
            <h2 className="mt-2 text-lg font-extrabold">{title}</h2>
            <p className="mt-1 text-sm text-muted">{body}</p>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-2xl font-extrabold">Cara memulai</h2>
      <ol className="mt-4 space-y-3">
        {[
          ['Hubungi kami', 'Ceritakan jumlah guru, kelas, dan siswa. Kami sepakati harga dan masa lisensi.'],
          ['Terima kode lisensi', 'Sekolah mendapat kode lisensi 8 karakter untuk para guru.'],
          ['Guru mengaktifkan', 'Guru membuat akun Lentera (gratis), membuka Ruang Guru, memasukkan kode lisensi, lalu membuat kelas.'],
          ['Siswa bergabung', 'Siswa memasukkan kode kelas di menu Kelas Saya dan langsung mendapat Premium.'],
        ].map(([t, d], i) => (
          <li key={t} className="flex gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand font-extrabold text-on-brand">{i + 1}</span>
            <span><strong>{t}.</strong> <span className="text-muted">{d}</span></span>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/kontak?topik=sekolah" className="inline-flex min-h-12 items-center gap-2 rounded-2xl border-2 border-b-4 border-brand-strong bg-brand px-6 font-extrabold text-on-brand">Minta penawaran untuk sekolah</Link>
        <Link href="/app/guru" className="inline-flex min-h-12 items-center gap-2 rounded-2xl border-2 border-b-4 border-line bg-surface px-6 font-extrabold"><KeyRound size={18} aria-hidden />Sudah punya kode lisensi</Link>
      </div>
      <p className="mt-4 text-sm text-muted">Orang tua yang ingin memantau anak: buat akun gratis, lalu buka <Link href="/app/orang-tua" className="font-bold text-brand underline">Pantau Anak</Link>.</p>
    </PublicPage>
  );
}
