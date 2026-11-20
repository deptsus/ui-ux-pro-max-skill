// Design system gallery and illustration library (owner review). Local servers only:
// on the live site it is a 404, and search engines are told not to index it.
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Gallery } from './Gallery';
import { StylePreview } from './StylePreview';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Design system', robots: { index: false, follow: false } };

export default function Page() {
  if (!process.env.LENTERA_ALLOW_EMBEDDED) notFound();
  return <main><Gallery /><StylePreview /></main>;
}
