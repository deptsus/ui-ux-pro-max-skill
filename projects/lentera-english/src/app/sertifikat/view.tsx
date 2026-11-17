'use client';
// Public certificate page: anyone with the code can verify it, no account needed.
// Printable on A4 landscape. Worded honestly: a completion certificate issued by
// Lentera English, not an official CEFR certificate.
import { printPage } from '@/lib/client/native';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Printer, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/Mascot';
import { Button, Card, Notice, inputClass } from '@/components/ui';

interface Cert { code: string; name: string; level: string; exam: string; score: number; sections: { id: string; title: string; score: number }[]; issued_at: string }

const LEVEL_NAME: Record<string, string> = { A1: 'Pemula (Beginner)', A2: 'Dasar (Elementary)', B1: 'Menengah (Intermediate)', B2: 'Menengah Atas (Upper-Intermediate)', C1: 'Mahir (Advanced)', C2: 'Sangat Mahir (Proficiency)' };
/** School track final exams (Rilis 16): exam id exam.track.sd|smp|sma. */
const TRACK_NAME: Record<string, string> = { 'exam.track.sd': 'Jalur SD', 'exam.track.smp': 'Jalur SMP', 'exam.track.sma': 'Jalur SMA' };
const longDate = (iso: string) => new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

export function CertificateView() {
  const params = useSearchParams();
  const router = useRouter();
  const code = (params.get('kode') ?? '').trim().toUpperCase();
  const [cert, setCert] = useState<Cert | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'found' | 'missing' | 'error'>('idle');
  const [input, setInput] = useState(code);

  useEffect(() => {
    if (!code) { setState('idle'); return; }
    setState('loading');
    fetch(`/api/certificates?code=${encodeURIComponent(code)}`)
      .then(async (r) => {
        if (r.status === 404) return setState('missing');
        if (!r.ok) return setState('error');
        setCert(((await r.json()) as { certificate: Cert }).certificate);
        setState('found');
      })
      .catch(() => setState('error'));
  }, [code]);

  const verifyUrl = typeof window === 'undefined' ? '' : `${window.location.origin}/sertifikat?kode=${code}`;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 print:max-w-none print:p-0">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href="/" className="text-xl"><Logo /></Link>
        {state === 'found' && <Button variant="secondary" size="sm" onClick={() => printPage(document.title)}><Printer size={16} aria-hidden /> Cetak / simpan PDF</Button>}
      </div>

      <Card className="mb-6 space-y-3 print:hidden">
        <h1 className="text-xl font-extrabold">Verifikasi sertifikat Lentera English</h1>
        <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); router.push(`/sertifikat?kode=${encodeURIComponent(input.trim().toUpperCase())}`); }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} aria-label="Kode sertifikat" placeholder="Kode 10 karakter, mis. ABCD2EFGH3" maxLength={10} className={`${inputClass} flex-1 font-mono uppercase tracking-widest`} />
          <Button type="submit">Periksa</Button>
        </form>
        {state === 'loading' && <p className="text-sm text-muted">Memeriksa…</p>}
        {state === 'missing' && <Notice tone="bad" title="Kode tidak ditemukan">Periksa lagi penulisannya. Kode sertifikat asli terdiri dari 10 huruf dan angka.</Notice>}
        {state === 'error' && <Notice tone="bad">Tidak bisa memeriksa sekarang. Coba lagi sebentar lagi.</Notice>}
        {state === 'found' && <Notice tone="ok" title="Sertifikat ini asli">Diterbitkan oleh Lentera English dan tercatat di sistem kami.</Notice>}
      </Card>

      {state === 'found' && cert && (
        <article className="certificate relative overflow-hidden rounded-3xl border-4 border-brand bg-surface p-8 text-center shadow-sm print:rounded-none print:border-[6px] print:shadow-none sm:p-12" aria-label="Sertifikat">
          <div className="pointer-events-none absolute inset-3 rounded-2xl border-2 border-brand/30 print:rounded-none" aria-hidden />
          <div className="relative space-y-4">
            <div className="flex justify-center text-2xl"><Logo size={36} /></div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-muted">{TRACK_NAME[cert.exam] ? 'Sertifikat Penyelesaian Jalur Sekolah' : 'Sertifikat Penyelesaian Level'}</p>
            <p className="text-muted">diberikan kepada</p>
            <p className="text-3xl font-extrabold sm:text-4xl">{cert.name}</p>
            <p className="mx-auto max-w-xl text-muted">yang telah lulus {TRACK_NAME[cert.exam] ? <><b className="text-ink">Ujian Akhir {TRACK_NAME[cert.exam]}</b> (setara level {cert.level})</> : <><b className="text-ink">Ujian Level {cert.level}</b> · {LEVEL_NAME[cert.level] ?? cert.level}</>} di Lentera English, dengan nilai akhir</p>
            <p className="text-5xl font-extrabold text-brand">{cert.score}%</p>
            {cert.sections?.length > 0 && (
              <ul className="mx-auto grid max-w-xl grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                {cert.sections.map((s) => <li key={s.id} className="rounded-xl bg-surface-2 px-2 py-1.5"><span className="block text-muted">{s.title}</span><b>{s.score}%</b></li>)}
              </ul>
            )}
            <div className="flex flex-wrap items-end justify-between gap-4 pt-4 text-left text-sm">
              <div><p className="text-muted">Tanggal terbit</p><p className="font-bold">{longDate(cert.issued_at)}</p></div>
              <div className="text-right"><p className="text-muted">Kode verifikasi</p><p className="font-mono text-lg font-bold tracking-widest">{cert.code}</p></div>
            </div>
            <p className="flex items-center justify-center gap-1 text-xs text-muted"><ShieldCheck size={14} aria-hidden /> Periksa keaslian di {verifyUrl || '/sertifikat'}</p>
            <p className="mx-auto max-w-2xl text-xs leading-relaxed text-muted">
              Sertifikat ini diterbitkan oleh Lentera English sebagai bukti menyelesaikan {TRACK_NAME[cert.exam] ? `ujian akhir ${TRACK_NAME[cert.exam]}` : `ujian level ${cert.level}`} di aplikasi Lentera.{TRACK_NAME[cert.exam] ? ' Jalur Sekolah mengikuti tema pelajaran bahasa Inggris di sekolah; ini bukan rapor atau ijazah sekolah.' : ''}
              Level mengikuti kerangka CEFR, tetapi ini <b>bukan sertifikat CEFR resmi</b> dan bukan hasil tes standar internasional seperti IELTS, TOEFL, atau Cambridge English.
            </p>
          </div>
        </article>
      )}
    </main>
  );
}
