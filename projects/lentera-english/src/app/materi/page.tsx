// /materi (Rilis 11): free public index of every lesson, by CEFR level and
// special track, for search engines and for people deciding to start.
import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicPage } from '@/components/PublicPage';
import { TRACKS } from '@/lib/content/tracks';
import { SITE, mainLessonsByLevel, trackLessonsOf } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Materi Bahasa Inggris Gratis A1–C2',
  description: 'Ringkasan tata bahasa dan keterampilan bahasa Inggris dari A1 sampai C2 dalam bahasa Indonesia, plus persiapan TOEFL ITP/IELTS, bahasa Inggris untuk kerja, dan jalur anak.',
  alternates: { canonical: `${SITE}/materi` },
  openGraph: { title: 'Materi Bahasa Inggris Gratis A1–C2 · Lentera English', url: `${SITE}/materi`, type: 'website', locale: 'id_ID' },
};

const LEVEL_NAME: Record<string, string> = { A1: 'Pemula', A2: 'Dasar', B1: 'Menengah', B2: 'Menengah Atas', C1: 'Mahir', C2: 'Sangat Mahir' };

export default function MateriIndex() {
  return (
    <PublicPage title="Materi Bahasa Inggris" intro="Ringkasan setiap pelajaran Lentera English dalam bahasa Indonesia, dari A1 sampai C2. Latihan, PR, dan tes penguasaannya ada di aplikasi.">
      <nav aria-label="Lompat ke level" className="mb-6 flex flex-wrap gap-2">
        {mainLessonsByLevel().map(({ level }) => <a key={level} href={`#${level}`} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-line px-3 font-extrabold">{level}</a>)}
        <a href="#jalur" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line px-3 font-extrabold">Jalur khusus</a>
      </nav>
      <div className="space-y-8">
        {mainLessonsByLevel().map(({ level, lessons }) => lessons.length > 0 && (
          <section key={level} id={level} className="scroll-mt-4">
            <h2 className="text-2xl font-extrabold">{level} · {LEVEL_NAME[level]}</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {lessons.map(({ lesson }) => (
                <li key={lesson.id}><Link href={`/materi/${lesson.id}`} className="block h-full rounded-2xl border border-line bg-surface p-3 hover:border-brand"><span className="block font-bold">{lesson.title}</span><span className="block text-sm text-muted">{lesson.summary}</span></Link></li>
              ))}
            </ul>
          </section>
        ))}
        <section id="jalur" className="scroll-mt-4">
          <h2 className="text-2xl font-extrabold">Jalur khusus</h2>
          {TRACKS.map((t) => (
            <div key={t.id} className="mt-4">
              <h3 className="text-lg font-extrabold">{t.title}</h3>
              <p className="text-sm text-muted">{t.pitch}</p>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {trackLessonsOf(t.id).map(({ lesson }) => (
                  <li key={lesson.id}><Link href={`/materi/${lesson.id}`} className="block h-full rounded-2xl border border-line bg-surface p-3 hover:border-brand"><span className="block font-bold">{lesson.title}</span><span className="block text-sm text-muted">{lesson.summary}</span></Link></li>
                ))}
              </ul>
              {t.note && <p className="mt-2 text-xs text-muted">{t.note}</p>}
            </div>
          ))}
        </section>
      </div>
    </PublicPage>
  );
}
