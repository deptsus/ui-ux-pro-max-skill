'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowLeft, ChevronRight, Crown } from 'lucide-react';
import { CEFR_ORDER } from '@/lib/content/types';
import { band } from '@/lib/engine/mastery';
import { activeTagErrors } from '@/lib/engine/recommend';
import { useApp } from '@/lib/client/hooks';
import { Demo, Teaching } from '@/components/LessonContent';
import { Badge, Card, Empty, LinkButton, Notice, PageHeader, Progress } from '@/components/ui';

const STAGE_LABEL: Record<string, string> = { new: 'Belum dimulai', learning: 'Sedang dipelajari', practicing: 'Berlatih', provisional: 'Kuat · menunggu tes ulang', mastered: 'Dikuasai', 'needs-review': 'Perlu diulang' };

function Grammar() {
  const params = useSearchParams();
  const topicId = params.get('topic');
  const { ix, learner, now } = useApp();
  const topic = topicId ? ix.topicById.get(topicId) : undefined;

  if (topicId && !topic) return <Empty title="Topik tidak ditemukan" action={<LinkButton href="/app/grammar">Pustaka Tata Bahasa</LinkButton>} />;
  if (topic) {
    const lesson = topic.lessonId ? ix.lessonById.get(topic.lessonId) : undefined;
    const stat = learner.topics[topic.id];
    const tags = ix.pack.tags.filter((t) => t.topic === topic.id);
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Link href="/app/grammar" className="inline-flex items-center gap-1 text-sm font-bold text-muted hover:text-ink"><ArrowLeft size={16} aria-hidden />Pustaka Tata Bahasa</Link>
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
                  <li key={t.id} className="rounded-2xl bg-surface-2 p-3">
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
      {CEFR_ORDER.map((level) => {
        const topics = ix.pack.topics.filter((t) => t.level === level && t.lessonId);
        if (!topics.length) return null;
        return (
          <section key={level} className="mb-6">
            <h2 className="mb-2 text-lg font-extrabold">{level} · {ix.pack.levels.find((l) => l.code === level)?.title}</h2>
            <ul className="space-y-2">
              {topics.map((t) => {
                const stat = learner.topics[t.id];
                const locked = ix.lessonById.get(t.lessonId!)?.locked;
                return (
                  <li key={t.id}>
                    <Link href={`/app/grammar?topic=${encodeURIComponent(t.id)}`} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition hover:border-brand">
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold">{t.title} {locked && <Badge tone="accent"><Crown size={12} aria-hidden />Premium</Badge>}</p>
                        <p className="en text-sm text-muted">{t.summary}</p>
                        {stat && <div className="mt-1.5 flex items-center gap-2"><Progress value={stat.score} tone={stat.score >= 85 ? 'ok' : 'brand'} className="h-2 max-w-40" label={`Skor ${t.title}`} /><span className="text-xs font-bold text-muted">{stat.score}% · {STAGE_LABEL[stat.stage]}</span></div>}
                      </div>
                      <ChevronRight className="shrink-0 text-muted" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export default function GrammarPage() {
  return <Suspense><Grammar /></Suspense>;
}
