'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { ArrowLeft, Crown } from 'lucide-react';
import { CEFR_ORDER, type Cefr } from '@/lib/content/types';
import { band } from '@/lib/engine/mastery';
import { activeTagErrors } from '@/lib/engine/recommend';
import { useApp } from '@/lib/client/hooks';
import { Demo, Teaching } from '@/components/LessonContent';
import { Badge, Card, Empty, LinkButton, ListGroup, ListRow, Notice, PageHeader, Progress, Segmented } from '@/components/ui';

const STAGE_LABEL: Record<string, string> = { new: 'Belum dimulai', learning: 'Sedang dipelajari', practicing: 'Berlatih', provisional: 'Kuat · menunggu tes ulang', mastered: 'Dikuasai', 'needs-review': 'Perlu diulang' };

function Grammar() {
  const params = useSearchParams();
  const topicId = params.get('topic');
  const { ix, learner, now } = useApp();
  const topic = topicId ? ix.topicById.get(topicId) : undefined;
  const levels = CEFR_ORDER.filter((l) => ix.pack.topics.some((t) => t.level === l && t.lessonId));
  const [show, setShow] = useState<Cefr | 'all'>(() => (learner.profile.placementLevel && levels.includes(learner.profile.placementLevel) ? learner.profile.placementLevel : 'all'));

  if (topicId && !topic) return <Empty title="Topik tidak ditemukan" action={<LinkButton href="/app/grammar">Pustaka Tata Bahasa</LinkButton>} />;
  if (topic) {
    const lesson = topic.lessonId ? ix.lessonById.get(topic.lessonId) : undefined;
    const stat = learner.topics[topic.id];
    const tags = ix.pack.tags.filter((t) => t.topic === topic.id);
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Link href="/app/grammar" className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-xl px-2 text-sm font-bold text-muted hover:bg-surface-2 hover:text-ink"><ArrowLeft size={16} aria-hidden />Pustaka Tata Bahasa</Link>
        <PageHeader title={topic.title} subtitle={topic.summary} action={<Badge>{topic.level}</Badge>} />
        <Card className="space-y-2">
          <div className="flex items-center justify-between"><p className="font-extrabold">Penguasaanmu</p><Badge tone={stat?.stage === 'mastered' ? 'ok' : stat?.stage === 'needs-review' ? 'bad' : 'brand'}>{STAGE_LABEL[stat?.stage ?? 'new']}</Badge></div>
          <Progress value={stat?.score ?? 0} tone={(stat?.score ?? 0) >= 85 ? 'ok' : 'brand'} label="Skor penguasaan" />
          <p className="text-sm text-muted">{stat ? `Skor ${stat.score}% (${band(stat.score).label}) dari ${stat.attempts} percobaan, ${stat.correct} benar.` : 'Belum ada percobaan pada topik ini.'}</p>
          {lesson && !lesson.locked && <LinkButton href={`/app/practice?mode=topic&topic=${encodeURIComponent(topic.id)}`} size="sm" variant="secondary">Latihan topik ini</LinkButton>}
        </Card>
        {lesson?.locked ? (
          <Notice tone="accent" title="Materi Premium"><span className="inline-flex items-center gap-1"><Crown size={14} aria-hidden />Penjelasan lengkap topik ini ada di kurikulum Premium.</span><LinkButton href="/app/subscription" size="sm" variant="accent" className="mt-2">Lihat paket</LinkButton></Notice>
        ) : lesson ? (
          <>
            <Teaching sections={lesson.teaching} />
            <h2 className="text-lg font-extrabold">Benar dan salah</h2>
            <Demo lesson={lesson} />
          </>
        ) : (
          <Card className="text-muted">Topik ini dilatih lewat Pusat Menyimak.</Card>
        )}
        {tags.length > 0 && (
          <Card>
            <h2 className="font-extrabold">Kesalahan umum pada topik ini</h2>
            <ul className="mt-3 space-y-2">
              {tags.map((t) => {
                const n = learner.tags[t.id]?.wrong ?? 0;
                return (
                  <li key={t.id} className="rounded-xl bg-surface-2 p-3 dark:bg-line/60">
                    <p className="font-bold">{t.title} {n > 0 && <Badge tone={activeTagErrors(learner, t.id, now) >= 2 ? 'bad' : 'muted'}>{n}× kamu alami</Badge>}</p>
                    <p className="text-sm text-muted">{t.tip}</p>
                    {n > 0 && !lesson?.locked && <Link href={`/app/practice?mode=drill&tag=${encodeURIComponent(t.id)}`} className="mt-1 inline-block text-sm font-bold text-brand underline">Latihan perbaikan</Link>}
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
        {lesson && !lesson.locked && <LinkButton href={`/app/lesson?id=${lesson.id}&revise=1`} full>Buka pelajaran lengkapnya</LinkButton>}
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Pustaka Tata Bahasa" subtitle="Rujukan semua topik tata bahasa beserta skor penguasaanmu. Buka kapan saja, termasuk saat kamu ragu di tengah latihan." />
      <Segmented label="Tampilkan level" value={show} onChange={setShow} full className="mb-5" options={[{ value: 'all' as const, label: 'Semua' }, ...levels.map((l) => ({ value: l, label: l }))]} />
      <div className="space-y-6">
        {levels.filter((level) => show === 'all' || show === level).map((level) => {
          const topics = ix.pack.topics.filter((t) => t.level === level && t.lessonId);
          return (
            <section key={level} aria-labelledby={`tb-${level}`}>
              <h2 id={`tb-${level}`} className="mb-2 px-1 text-base font-extrabold">{level} · {ix.pack.levels.find((l) => l.code === level)?.title}</h2>
              <ListGroup>
                {topics.map((t) => {
                  const stat = learner.topics[t.id];
                  const locked = ix.lessonById.get(t.lessonId!)?.locked;
                  return (
                    <ListRow key={t.id} href={`/app/grammar?topic=${encodeURIComponent(t.id)}`}
                      title={<>{t.title} {locked && <Badge tone="accent" className="ml-1 align-middle"><Crown size={12} aria-hidden />Premium</Badge>}</>}
                      subtitle={<span lang="en">{t.summary}</span>}
                      trailing={stat ? <Badge tone={stat.score >= 85 ? 'ok' : 'brand'}>{stat.score}%</Badge> : undefined} />
                  );
                })}
              </ListGroup>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default function GrammarPage() {
  return <Suspense><Grammar /></Suspense>;
}
