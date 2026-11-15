'use client';
import { useEffect, useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { CONTACT_TOPICS, isContactTopic, type ContactTopic } from '@/lib/contact';
import { api } from '@/lib/client/api';
import { Button, Card, Notice, cx, inputClass } from '@/components/ui';

export function ContactForm() {
  const [topic, setTopic] = useState<ContactTopic>('umum');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('topik');
    if (isContactTopic(t)) setTopic(t);
  }, []);
  if (done) return <Card className="grid place-items-center gap-3 py-10 text-center" ><CheckCircle2 size={40} className="text-ok" aria-hidden /><p className="text-lg font-extrabold" role="status">Pesanmu sudah terkirim. Terima kasih!</p><p className="text-muted">Kami membalas lewat kontak yang kamu tulis, biasanya dalam 1–2 hari kerja.</p></Card>;
  return (
    <form className="space-y-4" onSubmit={async (e) => {
      e.preventDefault();
      setBusy(true);
      setError(null);
      try {
        await api('/api/contact', { body: { topic, name, contact, message, website } });
        setDone(true);
      } catch (err) {
        setError((err as Error).message);
      }
      setBusy(false);
    }}>
      <fieldset>
        <legend className="mb-2 font-bold">Topik</legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CONTACT_TOPICS) as ContactTopic[]).map((t) => (
            <label key={t} className={cx('inline-flex min-h-11 cursor-pointer items-center rounded-2xl border-2 px-4 text-sm font-bold', topic === t ? 'border-brand bg-brand-soft text-brand' : 'border-line-strong')}>
              <input type="radio" name="topik" value={t} checked={topic === t} onChange={() => setTopic(t)} className="sr-only" />{CONTACT_TOPICS[t]}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block"><span className="mb-1 block font-bold">Nama</span><input className={inputClass} value={name} maxLength={80} required autoComplete="name" onChange={(e) => setName(e.target.value)} /></label>
      <label className="block"><span className="mb-1 block font-bold">Email atau nomor WhatsApp untuk balasan <span className="font-normal text-muted">(opsional)</span></span><input className={inputClass} value={contact} maxLength={120} autoComplete="email" onChange={(e) => setContact(e.target.value)} /></label>
      <label className="block"><span className="mb-1 block font-bold">Pesan</span><textarea className={cx(inputClass, 'min-h-36')} value={message} maxLength={3000} required onChange={(e) => setMessage(e.target.value)} /></label>
      {/* Hidden from people; bots that fill every field are ignored. */}
      <label className="hidden" aria-hidden>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
      {topic === 'privasi' && <Notice tone="brand">Untuk menghapus akun sendiri, kamu tidak perlu menunggu kami: buka Pengaturan → Hapus akun.</Notice>}
      {error && <Notice tone="bad">{error}</Notice>}
      <Button type="submit" disabled={busy || !name.trim() || message.trim().length < 5}><Send size={16} aria-hidden />{busy ? 'Mengirim...' : 'Kirim pesan'}</Button>
    </form>
  );
}
