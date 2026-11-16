// sitemap.xml (Rilis 11): the public pages search engines should index.
import type { MetadataRoute } from 'next';
import { SITE, publicLessons } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const fixed: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/materi`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE}/sekolah`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE}/sertifikat`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE}/kontak`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE}/privasi`, changeFrequency: 'yearly', priority: 0.2 },
  ];
  return [...fixed, ...publicLessons().map(({ lesson }) => ({ url: `${SITE}/materi/${lesson.id}`, changeFrequency: 'monthly' as const, priority: lesson.premium ? 0.5 : 0.7 }))];
}
