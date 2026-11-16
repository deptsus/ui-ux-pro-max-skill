import { AudioLines, Shapes, Compass, Award, BarChart3, BookHeart, BookOpen, CalendarCheck, ClipboardList, Crown, GraduationCap, Headphones, HeartHandshake, Home, LayoutGrid, Library, Map, MessagesSquare, Presentation, Repeat, School, Settings, User, Users } from 'lucide-react';

export const NAV = [
  { href: '/app', label: 'Beranda', icon: Home },
  { href: '/app/path', label: 'Jalur Belajar', icon: Map },
  { href: '/app/jalur', label: 'Jalur Khusus', icon: Compass },
  { href: '/app/plan', label: 'Rencana Mingguan', icon: CalendarCheck },
  { href: '/app/review', label: 'Ulangan', icon: Repeat },
  { href: '/app/homework', label: 'PR', icon: ClipboardList, desc: 'Tugas tiap pelajaran dan bab, lengkap dengan tenggat.' },
  { href: '/app/exams', label: 'Ujian', icon: GraduationCap },
  { href: '/app/vocabulary', label: 'Kosakata', icon: Library },
  { href: '/app/pasangan', label: 'Pasangan Kilat', icon: Shapes },
  { href: '/app/grammar', label: 'Tata Bahasa', icon: BookOpen },
  { href: '/app/stories', label: 'Cerita', icon: BookHeart },
  { href: '/app/listening', label: 'Menyimak', icon: Headphones },
  { href: '/app/shadowing', label: 'Shadowing', icon: AudioLines },
  { href: '/app/conversations', label: 'Percakapan', icon: MessagesSquare },
  { href: '/app/analytics', label: 'Analitik', icon: BarChart3 },
  { href: '/app/achievements', label: 'Pencapaian', icon: Award },
  { href: '/app/leaderboard', label: 'Liga & Teman', icon: Users },
  { href: '/app/kelas', label: 'Kelas Saya', icon: School },
  { href: '/app/guru', label: 'Ruang Guru', icon: Presentation },
  { href: '/app/orang-tua', label: 'Pantau Anak', icon: HeartHandshake },
  { href: '/app/profile', label: 'Profil', icon: User },
  { href: '/app/subscription', label: 'Premium', icon: Crown },
  { href: '/app/settings', label: 'Pengaturan', icon: Settings },
];
export const TABS = [
  { href: '/app', label: 'Beranda', icon: Home },
  { href: '/app/path', label: 'Jalur', icon: Map },
  { href: '/app/review', label: 'Ulangan', icon: Repeat },
  { href: '/app/more', label: 'Lainnya', icon: LayoutGrid },
  { href: '/app/profile', label: 'Profil', icon: User },
];

