'use client';
// Design system gallery (redesign 2026): tokens and every core component in its states,
// in the current theme. Local servers only (see page.tsx).
import { useState } from 'react';
import { BookOpen, Flame, Headphones, Library, Settings, Trash2, Zap } from 'lucide-react';
import { Badge, Button, Card, ConfirmDialog, Empty, Field, IconButton, ListGroup, ListRow, Loading, Notice, PageHeader, Progress, Ring, SectionHeader, Segmented, Sheet, Skeleton, StatRow, TabLinks, Toaster, cx, inputClass, toast } from '@/components/ui';

const COLORS = ['bg', 'surface', 'surface-2', 'ink', 'muted', 'line', 'line-strong', 'brand', 'brand-strong', 'brand-soft', 'brand-ink', 'accent', 'accent-soft', 'warn', 'warn-soft', 'ok', 'ok-soft', 'bad', 'bad-soft'];
const TYPE: [string, string, string][] = [
  ['display · 32/40 · Baloo 2', 'font-display text-3xl font-extrabold', '1.240 XP'],
  ['title-1 · 24/32 · 700', 'text-2xl font-extrabold', 'Jalur Belajar'],
  ['title-2 · 20/28 · 700', 'text-xl font-extrabold', 'Lanjutkan belajar'],
  ['title-3 · 17/24 · 600', 'text-lg font-bold', 'Sapaan dan Perkenalan'],
  ['body · 16/24 · 400', 'text-base', 'Menyapa sesuai waktu dan memperkenalkan diri.'],
  ['small · 14/20 · 400', 'text-sm text-muted', '8 langkah · sekitar 12 menit'],
  ['caption · 12/16 · 600', 'text-xs font-bold text-muted', 'A1 · PEMULA'],
];

function Block({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cx('space-y-3', className)}>
      <h2 className="text-xl font-extrabold">{title}</h2>
      {children}
    </section>
  );
}

export function Gallery() {
  const [seg, setSeg] = useState<'a' | 'b' | 'c'>('a');
  const [sheet, setSheet] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-8">
      <PageHeader title="Design system Lentera" subtitle="Token dan komponen inti dengan semua state-nya. Ganti tema di perangkat untuk melihat mode gelap." />

      <Block title="Warna">
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
          {COLORS.map((c) => (
            <li key={c} className="overflow-hidden rounded-xl border border-line bg-surface">
              <span className="block h-12" style={{ background: `var(--${c})` }} aria-hidden />
              <span className="block px-2 py-1.5 text-xs font-bold">{c}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Tipografi">
        <Card className="space-y-3">
          {TYPE.map(([label, cls, sample]) => (
            <div key={label} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-4">
              <span className="w-56 shrink-0 text-xs font-bold text-muted">{label}</span>
              <span className={cls}>{sample}</span>
            </div>
          ))}
          <p>IPA: <span className="ipa">/ɡʊd ˈmɔːnɪŋ/ · /θæŋk juː/ · /ˈtʃɪldrən/</span></p>
        </Card>
      </Block>

      <Block title="Tombol">
        <Card className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button>Mulai belajar</Button>
            <Button variant="secondary">Lewati</Button>
            <Button variant="ghost">Lihat semua</Button>
            <Button variant="accent">Lihat Premium</Button>
            <Button variant="success">Lanjut</Button>
            <Button variant="danger">Hapus</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Kecil</Button>
            <Button size="lg">Besar</Button>
            <Button disabled>Nonaktif</Button>
            <Button busy={busy} onClick={() => { setBusy(true); setTimeout(() => setBusy(false), 1500); }}>Simpan</Button>
            <IconButton label="Pengaturan"><Settings size={20} aria-hidden /></IconButton>
          </div>
        </Card>
      </Block>

      <div className="grid gap-10 lg:grid-cols-2">
        <Block title="Formulir">
          <Card className="space-y-4">
            <Field label="Nama tampilan" hint="Terlihat oleh teman di liga."><input className={inputClass} defaultValue="Rina" /></Field>
            <Field label="Email" error="Format email belum benar."><input className={inputClass} aria-invalid defaultValue="rina@" /></Field>
            <Field label="Kode kelas"><input className={inputClass} disabled placeholder="Nonaktif" /></Field>
          </Card>
        </Block>

        <Block title="Pilihan & tab">
          <Card className="space-y-4">
            <Segmented label="Tema" value={seg} onChange={setSeg} options={[{ value: 'a', label: 'Terang' }, { value: 'b', label: 'Gelap' }, { value: 'c', label: 'Ikuti perangkat' }]} full />
            <TabLinks label="Jenis jalur" items={[{ href: '/gaya', label: 'CEFR', current: true }, { href: '/gaya#sekolah', label: 'Sekolah', current: false }, { href: '/gaya#khusus', label: 'Khusus', current: false }]} />
            <div className="flex flex-wrap gap-2">
              <Badge>Disarankan</Badge><Badge tone="ok">Selesai</Badge><Badge tone="accent">Premium</Badge><Badge tone="warn">Jatuh tempo</Badge><Badge tone="bad">Belum tepat</Badge><Badge tone="muted">Terkunci</Badge>
            </div>
          </Card>
        </Block>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <Block title="Daftar">
          <SectionHeader title="Latihan" as="h3" action={<Button variant="ghost" size="sm">Semua</Button>} />
          <ListGroup label="Contoh daftar">
            <ListRow href="/gaya" icon={<Library size={20} />} title="Kosakata" subtitle="Kata, IPA, arti, contoh, dan audio" />
            <ListRow href="/gaya" icon={<BookOpen size={20} />} iconTone="ok" title="Tata Bahasa" subtitle="24 topik" trailing={<Badge tone="ok">80%</Badge>} />
            <ListRow onClick={() => toast('Tersimpan')} icon={<Headphones size={20} />} iconTone="accent" title="Tampilkan toast" subtitle="Tombol di dalam baris" chevron />
            <ListRow icon={<Trash2 size={20} />} iconTone="bad" title="Baris nonaktif" subtitle="Tidak bisa dipilih" disabled />
          </ListGroup>
        </Block>

        <Block title="Progres & statistik">
          <Card className="space-y-4">
            <div className="flex items-center gap-4">
              <Ring value={60} size={72} stroke={8}><span className="text-sm font-extrabold">30/50</span></Ring>
              <div className="flex-1 space-y-2">
                <Progress value={30} max={50} label="Target hari ini" />
                <Progress value={9} max={12} tone="ok" label="Unit 1" />
                <Progress value={2} max={5} tone="accent" label="Misi" />
              </div>
            </div>
          </Card>
          <StatRow items={[{ label: 'Beruntun', value: '12 hari', icon: <Flame size={14} aria-hidden /> }, { label: 'XP minggu ini', value: '340', icon: <Zap size={14} aria-hidden /> }, { label: 'Akurasi', value: '86%' }]} />
        </Block>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <Block title="Pemberitahuan">
          <div className="space-y-3">
            <Notice title="Info">Rekaman diproses di perangkatmu.</Notice>
            <Notice tone="ok" title="Berhasil">Pembayaran dikonfirmasi.</Notice>
            <Notice tone="warn" title="Perhatian">Premium berakhir 3 hari lagi.</Notice>
            <Notice tone="bad" title="Gagal memuat">Periksa koneksi lalu coba lagi.</Notice>
          </div>
        </Block>
        <Block title="Memuat & kosong">
          <Loading lines={2} />
          <div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-3/4" /></div></div>
          <Empty title="Belum ada ulangan" mood="sleep">Kata yang mulai lupa akan muncul di sini.</Empty>
        </Block>
      </div>

      <Block title="Sheet, konfirmasi, toast">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setSheet(true)}>Buka sheet</Button>
          <Button variant="danger" onClick={() => setConfirm(true)}>Hapus riwayat</Button>
          <Button variant="secondary" onClick={() => toast('Pengaturan tersimpan')}>Toast sukses</Button>
          <Button variant="secondary" onClick={() => toast('Gagal menyimpan', 'bad')}>Toast gagal</Button>
        </div>
        <Sheet open={sheet} onClose={() => setSheet(false)} title="apple /ˈæp.əl/" footer={<Button full onClick={() => setSheet(false)}>Pelajari kata ini</Button>}>
          <p className="text-muted">(noun) apel</p>
          <p className="mt-2" lang="en">I eat an apple every day.</p>
        </Sheet>
        <ConfirmDialog open={confirm} title="Hapus riwayat latihan?" confirmLabel="Hapus" onCancel={() => setConfirm(false)} onConfirm={() => { setConfirm(false); toast('Riwayat dihapus'); }}>
          Riwayat latihan di perangkat ini dihapus. XP dan pelajaran yang sudah tuntas tidak berubah.
        </ConfirmDialog>
      </Block>
      <Toaster />
    </div>
  );
}
