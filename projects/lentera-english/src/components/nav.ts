import { Award, BarChart3, BookOpen, ClipboardList, Crown, GraduationCap, Headphones, Home, LayoutGrid, Library, Map, MessagesSquare, Repeat, Settings, User, Users } from 'lucide-react';

export const NAV = [
  { href: '/app', label: 'Beranda', icon: Home },
  { href: '/app/path', label: 'Jalur Belajar', icon: Map },
  { href: '/app/review', label: 'Ulangan', icon: Repeat },
  { href: '/app/homework', label: 'PR', icon: ClipboardList, desc: 'Tugas tiap pelajaran dan bab, lengkap dengan tenggat.' },
  { href: '/app/exams', label: 'Ujian', icon: GraduationCap },
  { href: '/app/vocabulary', label: 'Kosakata', icon: Library },
  { href: '/app/grammar', label: 'Tata Bahasa', icon: BookOpen },
  { href: '/app/listening', label: 'Menyimak', icon: Headphones },
  { href: '/app/conversations', label: 'Percakapan', icon: MessagesSquare },
  { href: '/app/analytics', label: 'Analitik', icon: BarChart3 },
  { href: '/app/achievements', label: 'Pencapaian', icon: Award },
  { href: '/app/leaderboard', label: 'Papan Peringkat', icon: Users },
  { href: '/app/profile', label: 'Profil', icon: User },
  { href: '/app/subscription', label: 'Premium', icon: Crown },
  { href: '/app/settings', label: 'Pengaturan', icon: Settings },
];
export const TABS = [
  { href: '/app', label: 'Beranda', icon: Home },
  { href: '/app/path', label: 'Jalur', icon: Map },
  { href: '/app/review', label: 'Ulangan', icon: Repeat },
  { href: '/app/more', label: 'Kelas', icon: LayoutGrid },
  { href: '/app/profile', label: 'Profil', icon: User },
];

