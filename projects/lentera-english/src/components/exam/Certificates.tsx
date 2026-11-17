'use client';
// "Sertifikat saya" on the exam hub: certificates the server has issued to this learner.
import { useEffect, useState } from 'react';
import { Award } from 'lucide-react';
import { api } from '@/lib/client/api';
import { Card, LinkButton, dateTimeId } from '@/components/ui';

interface Cert { code: string; level: string; exam?: string; score: number; issued_at: string }

export function CertificatesCard() {
  const [list, setList] = useState<Cert[]>([]);
  useEffect(() => {
    // Guests and databases without migration 0009 simply have none to show.
    api<{ certificates: Cert[] }>('/api/certificates').then((r) => setList(r.certificates ?? [])).catch(() => setList([]));
  }, []);
  if (!list.length) return null;
  return (
    <Card className="mb-5 space-y-2">
      <h2 className="flex items-center gap-2 font-extrabold"><Award size={20} className="text-accent-strong" aria-hidden /> Sertifikat saya</h2>
      <ul className="divide-y divide-line">
        {list.map((c) => (
          <li key={c.code} className="flex flex-wrap items-center gap-2 py-2">
            <span className="min-w-0 flex-1"><b>{c.exam?.startsWith('exam.track.') ? `Jalur ${c.exam.slice('exam.track.'.length).toUpperCase()}` : `Level ${c.level}`}</b> <span className="text-sm text-muted">· nilai {c.score}% · {dateTimeId(new Date(c.issued_at).getTime())}</span></span>
            <LinkButton href={`/sertifikat?kode=${c.code}`} size="sm" variant="secondary">Lihat</LinkButton>
          </li>
        ))}
      </ul>
    </Card>
  );
}
