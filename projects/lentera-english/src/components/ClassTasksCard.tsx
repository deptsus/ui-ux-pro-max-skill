'use client';
// Beranda (Rilis 10): the next open assignments from the learner's teachers.
// Only asks the server when the learner is known to be in a class (class
// Premium, or a class seen on this device), so other learners cost nothing.
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { School } from 'lucide-react';
import { assignmentHref, dueText, KIND_LABEL, myClasses, type Assignment } from '@/lib/client/classes';
import { useSession } from '@/lib/client/session';
import { Badge, Card } from '@/components/ui';

export const IN_CLASS_KEY = 'lentera:in-class';
export const rememberInClass = (yes: boolean) => {
  try {
    if (yes) localStorage.setItem(IN_CLASS_KEY, '1');
    else localStorage.removeItem(IN_CLASS_KEY);
  } catch { /* private mode */ }
};
const knownInClass = () => {
  try { return localStorage.getItem(IN_CLASS_KEY) === '1'; } catch { return false; }
};

type Open = Assignment & { className: string };

export function ClassTasksCard({ plan }: { plan: string | null | undefined }) {
  const session = useSession();
  const [open, setOpen] = useState<Open[] | null>(null);
  useEffect(() => {
    if (!session || !(plan === 'class' || plan === 'teacher' || knownInClass())) return;
    let live = true;
    myClasses().then((r) => {
      rememberInClass(r.classes.length > 0);
      const now = Date.now();
      const list = r.classes.filter((c) => c.active).flatMap((c) => c.assignments.filter((a) => !a.result && Date.parse(a.due_at) > now).map((a) => ({ ...a, className: c.name })));
      if (live) setOpen(list.sort((a, b) => Date.parse(a.due_at) - Date.parse(b.due_at)));
    }, () => {});
    return () => { live = false; };
  }, [session?.userId, plan]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!open || open.length === 0) return null;
  return (
    <section aria-labelledby="class-tasks-title">
      <h2 id="class-tasks-title" className="mb-2 flex items-center gap-2 text-lg font-extrabold"><School size={20} className="text-brand" aria-hidden />Tugas dari guru</h2>
      <Card className="divide-y divide-line p-0">
        {open.slice(0, 3).map((a) => (
          <Link key={a.id} href={assignmentHref(a)} className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-brand-soft/40">
            <span className="min-w-0 flex-1">
              <span className="block font-bold"><Badge tone="brand" className="mr-1">{KIND_LABEL[a.kind]}</Badge>{a.title}</span>
              <span className="block text-sm text-muted">{a.className} · tenggat {dueText(a.due_at)}</span>
            </span>
          </Link>
        ))}
        <Link href="/app/kelas" className="block px-5 py-3 text-sm font-bold text-brand">{open.length > 3 ? `Lihat semua ${open.length} tugas` : 'Buka Kelas Saya'}</Link>
      </Card>
    </section>
  );
}
