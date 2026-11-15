import type { Metadata } from 'next';
import { PublicPage } from '@/components/PublicPage';
import { ContactForm } from './ContactForm';

export const metadata: Metadata = { title: 'Hubungi Kami', description: 'Kirim pertanyaan, laporan masalah, permintaan privasi, atau minat sekolah ke tim Lentera English.' };

export default function ContactPage() {
  return (
    <PublicPage title="Hubungi Kami" intro="Pertanyaan, laporan masalah, permintaan tentang datamu, atau minat memakai Lentera di sekolah. Pesan dibaca langsung oleh pemilik Lentera English.">
      <ContactForm />
    </PublicPage>
  );
}
