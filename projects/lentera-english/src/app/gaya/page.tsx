// Style preview for the Rilis 14 redesign (owner review). Local servers only:
// on the live site it is a 404, and search engines are told not to index it.
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { StylePreview } from './StylePreview';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Pratinjau gaya', robots: { index: false, follow: false } };

export default function Page() {
  if (!process.env.LENTERA_ALLOW_EMBEDDED) notFound();
  return <StylePreview />;
}
