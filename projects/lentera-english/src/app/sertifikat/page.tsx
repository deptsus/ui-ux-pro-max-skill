import { Suspense } from 'react';
import { CertificateView } from './view';

export const metadata = { title: 'Verifikasi Sertifikat' };

export default function Page() {
  return <Suspense><CertificateView /></Suspense>;
}
