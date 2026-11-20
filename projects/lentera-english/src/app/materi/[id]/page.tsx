// /materi/<lesson> (Rilis 11): one public, static page per lesson. Free
// lessons show the full explanation; Premium lessons show the introduction,
// goals and first section. Exercises stay in the app.
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Check, X } from 'lucide-react';
import { PublicPage } from '@/components/PublicPage';
import { PublicTeaching } from '@/components/PublicTeaching';
import { trackInfo } from '@/lib/content/tracks';
import { SITE, publicLesson, publicLessons } from '@/lib/seo';

export const dynamicParams = false;
export const generateStaticParams = () => publicLessons().map(({ lesson }) => ({ id: lesson.id }));

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = publicLesson((await params).id);
  if (!p) return {};
  const where = p.chapter.track ? trackInfo(p.chapter.track)?.title ?? p.chapter.title : `Level ${p.level}`;
  const title = `${p.lesson.title} (${where})`;
  const url = `${SITE}/materi/${p.lesson.id}`;
  return {
    title,
    description: `${p.lesson.summary} Penjelasan dalam bahasa Indonesia dengan contoh, dari Lentera English.`,
    alternates: { canonical: url },
    openGraph: { title: `${title} · Lentera English`, description: p.lesson.summary, url, type: 'article', locale: 'id_ID' },
  };
}

export default async function MateriLesson({ params }: Props) {
  const p = publicLesson((await params).id);
  if (!p) notFound();
  const { lesson, chapter, level } = p;
  const track = trackInfo(chapter.track);
  const free = !lesson.premium;
  const sections = free ? lesson.teaching : lesson.teaching.slice(0, 1);
  const url = `${SITE}/materi/${lesson.id}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LearningResource',
        name: lesson.title,
        description: lesson.summary,
        url,
        inLanguage: 'id',
        learningResourceType: 'Lesson',
        educationalLevel: `CEFR ${level}`,
        teaches: lesson.objectives,
        isAccessibleForFree: free,
        provider: { '@type': 'Organization', name: 'Lentera English', url: SITE },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Materi', item: `${SITE}/materi` },
          { '@type': 'ListItem', position: 2, name: track ? track.title : `Level ${level}`, item: `${SITE}/materi#${track ? 'jalur' : level}` },
          { '@type': 'ListItem', position: 3, name: lesson.title, item: url },
        ],
      },
    ],
  };
  return (
    <PublicPage title={lesson.title} intro={lesson.summary}>
      {/* Structured data for search engines; not executed by the browser. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <p className="-mt-3 mb-6 text-sm text-muted">
        <Link href="/materi" className="font-bold text-brand underline">Materi</Link> · {track ? track.title : `Level ${level} · ${chapter.title}`}{free ? ' · Gratis' : ' · Premium'}
      </p>
      <p className="leading-relaxed">{lesson.intro}</p>
      <h2 className="mt-6 text-xl font-extrabold">Yang dipelajari</h2>
      <ul className="mt-2 space-y-1">{lesson.objectives.map((o) => <li key={o} className="flex gap-2"><Check size={18} className="mt-0.5 shrink-0 text-ok" aria-hidden />{o}</li>)}</ul>
      <div className="mt-8"><PublicTeaching sections={sections} /></div>
      {free && lesson.demo.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-extrabold">Benar atau salah?</h2>
          <ul className="mt-3 space-y-3">
            {lesson.demo.map((d) => (
              <li key={d.good} className="rounded-2xl border border-line p-3">
                <p className="flex gap-2 font-bold" lang="en"><Check size={18} className="mt-0.5 shrink-0 text-ok" aria-label="Benar" />{d.good}</p>
                <p className="flex gap-2 text-muted line-through" lang="en"><X size={18} className="mt-0.5 shrink-0 text-bad" aria-label="Salah" />{d.bad}</p>
                <p className="mt-1 text-sm">{d.why}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="mt-10 rounded-2xl border border-brand/40 bg-brand-soft p-5">
        <p className="text-lg font-extrabold">{free ? 'Latih sampai benar-benar paham' : 'Lanjutkan materi lengkapnya di aplikasi'}</p>
        <p className="mt-1 text-sm">{free ? 'Di aplikasi: latihan terbimbing dengan pembahasan, PR, tes penguasaan, dan ulangan terjadwal. Gratis, tanpa iklan.' : 'Materi lengkap, latihan, PR, dan tes penguasaan pelajaran ini tersedia untuk Premium. Coba dulu pelajaran gratisnya di aplikasi.'}</p>
        <Link href={`/app/lesson?id=${lesson.id}`} className="mt-3 inline-flex min-h-12 items-center gap-2 rounded-xl bg-brand shadow-[0_2px_0_var(--brand-strong)] active:translate-y-[2px] active:shadow-none px-5 font-extrabold text-on-brand">Buka di aplikasi<ArrowRight size={18} aria-hidden /></Link>
      </div>
      {track?.note && <p className="mt-6 text-xs text-muted">{track.note}</p>}
    </PublicPage>
  );
}
