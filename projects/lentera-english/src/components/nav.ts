import { AudioLines, Shapes, Compass, Award, BarChart3, BookHeart, BookOpen, CalendarCheck, ClipboardList, Crown, GraduationCap, Headphones, HeartHandshake, Home, LayoutGrid, Library, Map, MessagesSquare, Presentation, Repeat, School, Settings, User, Users } from 'lucide-react';

type Item = { href: string; label: string; icon: typeof Home; desc?: string };

// Grouped navigation (redesign 2026): the desktop sidebar and the Lainnya page use the same groups.
// `desc` is the one-line description shown in Lainnya (items without one are bottom-nav tabs).
export const NAV_GROUPS: { title: string; items: Item[] }[] = [
  {
    title: 'Belajar',
    items: [
      { href: '/app', label: 'Beranda', icon: Home },
      { href: '/app/path', label: 'Jalur Belajar', icon: Map },
      { href: '/app/jalur', label: 'Jalur Sekolah & Khusus', icon: Compass, desc: 'Jalur SD, SMP, SMA sesuai kurikulum sekolah, TOEFL ITP/IELTS, dan bahasa Inggris untuk kerja.' },
      { href: '/app/plan', label: 'Rencana Mingguan', icon: CalendarCheck, desc: 'Target tiap minggu sampai C2 untuk Premium.' },
      { href: '/app/review', label: 'Ulangan', icon: Repeat },
      { href: '/app/homework', label: 'PR', icon: ClipboardList, desc: 'Tugas tiap pelajaran dan bab, lengkap dengan tenggat.' },
      { href: '/app/exams', label: 'Ujian', icon: GraduationCap, desc: 'Tes penempatan, ujian unit, dan ujian level CEFR.' },
    ],
  },
  {
    title: 'Latihan',
    items: [
      { href: '/app/vocabulary', label: 'Kosakata', icon: Library, desc: 'Kata, IPA, arti, contoh, dan audio.' },
      { href: '/app/grammar', label: 'Tata Bahasa', icon: BookOpen, desc: 'Rujukan semua topik tata bahasa.' },
      { href: '/app/listening', label: 'Menyimak', icon: Headphones, desc: 'Latihan menyimak dan panduan pelafalan.' },
      { href: '/app/shadowing', label: 'Shadowing', icon: AudioLines, desc: 'Dengar, rekam suaramu, lalu bandingkan sendiri.' },
      { href: '/app/conversations', label: 'Percakapan', icon: MessagesSquare, desc: 'Simulasi situasi nyata dengan dialog bercabang.' },
      { href: '/app/stories', label: 'Cerita', icon: BookHeart, desc: 'Cerita pendek beranimasi, lalu pertanyaan tentang ceritanya.' },
      { href: '/app/pasangan', label: 'Pasangan Kilat', icon: Shapes, desc: 'Permainan memori: cocokkan kata dengan gambarnya, kejar kombo dan rekor.' },
    ],
  },
  {
    title: 'Kemajuan',
    items: [
      { href: '/app/analytics', label: 'Analitik', icon: BarChart3, desc: 'Ketepatan, waktu belajar, dan pola kesalahanmu.' },
      { href: '/app/achievements', label: 'Pencapaian', icon: Award, desc: 'Lencana, tonggak XP, dan hadiah bab.' },
      { href: '/app/leaderboard', label: 'Liga & Teman', icon: Users, desc: 'Liga mingguan, teman, dan tantangan XP.' },
    ],
  },
  {
    title: 'Kelas & keluarga',
    items: [
      { href: '/app/kelas', label: 'Kelas Saya', icon: School, desc: 'Gabung ke kelas gurumu dengan kode, lihat tugas dan tenggatnya.' },
      { href: '/app/guru', label: 'Ruang Guru', icon: Presentation, desc: 'Untuk guru: buat kelas, beri tugas, pantau progres siswa.' },
      { href: '/app/orang-tua', label: 'Pantau Anak', icon: HeartHandshake, desc: 'Untuk orang tua: pantau hari aktif, pelajaran, dan PR anak.' },
    ],
  },
  {
    title: 'Akun',
    items: [
      { href: '/app/profile', label: 'Profil', icon: User },
      { href: '/app/subscription', label: 'Premium', icon: Crown, desc: 'Paket Free dan Premium, riwayat transaksi.' },
      { href: '/app/settings', label: 'Pengaturan', icon: Settings, desc: 'Tema, pengingat harian, aksen, dan mode offline.' },
    ],
  },
];
export const NAV = NAV_GROUPS.flatMap((g) => g.items);

// Bottom nav (phones). "Belajar" covers both learning paths and the lesson screens; "Lainnya"
// lights up for every page that lives in the Lainnya menu.
export const TABS = [
  { href: '/app', label: 'Beranda', icon: Home, match: [] as string[] },
  { href: '/app/path', label: 'Belajar', icon: Map, match: ['/app/path', '/app/jalur', '/app/lesson', '/app/placement'] },
  { href: '/app/review', label: 'Ulangan', icon: Repeat, match: ['/app/review', '/app/practice'] },
  { href: '/app/more', label: 'Lainnya', icon: LayoutGrid, match: ['/app/more'] },
  { href: '/app/profile', label: 'Profil', icon: User, match: ['/app/profile'] },
];
