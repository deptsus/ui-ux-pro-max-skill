// Privacy policy (Rilis 9): what Lentera English collects, why, where it is
// kept, and how to remove it. Plain language, matching what the code does.
import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicPage } from '@/components/PublicPage';

export const metadata: Metadata = { title: 'Kebijakan Privasi', description: 'Data apa yang disimpan Lentera English, untuk apa, di mana, dan cara menghapusnya.' };

const H2 = ({ children }: { children: React.ReactNode }) => <h2 className="mt-8 text-xl font-extrabold">{children}</h2>;

export default function PrivacyPage() {
  return (
    <PublicPage title="Kebijakan Privasi" intro="Berlaku sejak 15 November 2026. Ringkasnya: kami hanya menyimpan yang dibutuhkan untuk mengajar dan menagih, tidak menjual data, dan tidak mengirim jawabanmu ke layanan AI.">
      <div className="space-y-3 leading-relaxed">
        <H2>Data yang kami simpan</H2>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Akun</strong>: email, nama tampilan, avatar, dan peran (pelajar atau admin). Kata sandi disimpan oleh layanan login dalam bentuk tersandi; kami tidak bisa membacanya.</li>
          <li><strong>Progres belajar</strong>: jawaban latihan, skor, XP, beruntun, jadwal ulangan, PR, ujian, dan sertifikat. Tanpa akun, semua ini hanya tersimpan di perangkatmu.</li>
          <li><strong>Pembayaran</strong>: paket, nominal, waktu, dan nama/catatan yang kamu tulis saat melaporkan pembayaran QRIS. Kami tidak pernah menerima nomor rekening, kartu, atau PIN.</li>
          <li><strong>Fitur sosial</strong>: kode teman, daftar teman, tantangan, dan grup liga. Teman dan anggota liga hanya melihat nama, avatar, XP mingguan, dan beruntunmu.</li>
          <li><strong>Pengingat</strong>: alamat notifikasi HP yang kamu izinkan, jam pengingat, dan zona waktu HP.</li>
          <li><strong>Laporan error</strong>: pesan error, halaman, versi aplikasi, dan jenis browser, untuk memperbaiki masalah. Tidak berisi jawaban atau isi akunmu.</li>
          <li><strong>Pesan ke kami</strong>: isi formulir Hubungi Kami.</li>
        </ul>
        <p>Rekaman suara dari latihan shadowing dan pelafalan <strong>tidak pernah diunggah</strong>: rekaman hanya ada di memori perangkatmu selama latihan.</p>

        <H2>Untuk apa</H2>
        <p>Menjalankan pelajaran dan rekomendasi, menyimpan progres antarperangkat, mengaktifkan Premium, mengirim pengingat yang kamu minta, menjaga keamanan (misalnya membatasi percobaan yang mencurigakan), dan melihat jumlah pendaftar dan pelajar aktif secara keseluruhan. Kami tidak menjual data dan tidak menampilkan iklan dari pihak lain.</p>

        <H2>Di mana disimpan</H2>
        <p>Basis data dan berkas ada di Supabase (pusat data Asia Timur, Tokyo). Situs dijalankan oleh Netlify. Notifikasi dikirim lewat layanan notifikasi browser atau HP-mu (misalnya Google). Setiap malam dibuat cadangan di penyimpanan pribadi yang hanya bisa dibuka server (tanpa kata sandi); cadangan disimpan 14 hari.</p>

        <H2>Keamanan</H2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Semua koneksi memakai HTTPS. Data hanya dibaca dan diubah oleh server lewat fungsi yang memeriksa siapa pemiliknya.</li>
          <li>Akun admin bisa dilindungi verifikasi 2 langkah, dan setiap tindakan admin diperiksa ulang di basis data.</li>
          <li>Percobaan berulang (misalnya menebak kode) dibatasi otomatis.</li>
        </ul>

        <H2>Hak kamu</H2>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Melihat dan memperbaiki</strong>: nama dan avatar bisa diubah di Profil.</li>
          <li><strong>Menghapus akun</strong>: di <Link href="/app/settings" className="font-bold text-brand underline">Pengaturan → Hapus akun</Link>. Akun dan seluruh progres terhapus seketika; catatan pembayaran tetap disimpan untuk pembukuan tanpa nama dan tanpa tautan ke akunmu. Salinan di cadangan hilang paling lambat 14 hari kemudian.</li>
          <li><strong>Pertanyaan atau permintaan lain</strong> tentang datamu: kirim lewat <Link href="/kontak" className="font-bold text-brand underline">Hubungi kami</Link> dengan topik &ldquo;Privasi dan data&rdquo;.</li>
        </ul>

        <H2>Anak-anak</H2>
        <p>Pelajar di bawah 13 tahun sebaiknya memakai Lentera bersama orang tua atau guru, yang membuat dan mengelola akunnya.</p>

        <H2>Perubahan</H2>
        <p>Bila kebijakan ini berubah, tanggal di atas ikut berubah dan perubahan penting kami umumkan di aplikasi.</p>
      </div>
    </PublicPage>
  );
}
