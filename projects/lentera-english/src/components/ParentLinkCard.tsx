'use client';
// In the learner's Profil (Rilis 10): make a one-time code for a parent, and
// see and remove who can follow your progress.
import { useEffect, useState } from 'react';
import { HeartHandshake } from 'lucide-react';
import { parentAction, parentData, type ParentLink } from '@/lib/client/classes';
import { useSession } from '@/lib/client/session';
import { Button, Card, Notice, dateId } from '@/components/ui';

export function ParentLinkCard() {
  const session = useSession();
  const [parents, setParents] = useState<ParentLink[] | null>(null);
  const [code, setCode] = useState<{ code: string; expires_at: string } | null>(null);
  const [msg, setMsg] = useState<{ tone: 'ok' | 'bad'; text: string } | null>(null);
  const load = () => parentData().then((d) => setParents(d.parents), () => setParents([]));
  useEffect(() => { if (session) void load(); }, [session?.userId]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!session) return null;
  return (
    <Card className="space-y-3">
      <h2 className="flex items-center gap-2 font-extrabold"><HeartHandshake size={18} className="text-brand" aria-hidden />Orang tua</h2>
      <p className="text-sm text-muted">Orang tua bisa melihat ringkasan progresmu (hari aktif, pelajaran, PR, tugas guru) di halaman Pantau Anak, tanpa melihat jawabanmu.</p>
      {code ? (
        <div className="rounded-2xl bg-brand-soft p-3 text-center">
          <p className="text-sm font-bold">Berikan kode ini ke orang tuamu</p>
          <p className="select-all font-mono text-3xl font-extrabold tracking-[0.25em] text-brand">{code.code}</p>
          <p className="text-xs text-muted">Berlaku sampai {dateId(code.expires_at)}, sekali pakai. Orang tua memasukkannya di menu Pantau Anak.</p>
        </div>
      ) : <Button size="sm" onClick={async () => { try { setCode(await parentAction<{ code: string; expires_at: string }>({ action: 'code' })); } catch (e) { setMsg({ tone: 'bad', text: (e as Error).message }); } }}>Buat kode untuk orang tua</Button>}
      {parents && parents.length > 0 && (
        <ul className="space-y-1">
          {parents.map((p) => (
            <li key={p.id} className="flex items-center gap-2 text-sm">
              <span className="min-w-0 flex-1"><strong>{p.name}</strong> <span className="text-muted">· sejak {dateId(p.since)}</span></span>
              <Button size="sm" variant="ghost" onClick={async () => { await parentAction({ action: 'unlink', id: p.id }).catch(() => undefined); setMsg({ tone: 'ok', text: `${p.name} tidak lagi bisa melihat progresmu.` }); void load(); }}>Hapus</Button>
            </li>
          ))}
        </ul>
      )}
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
    </Card>
  );
}
