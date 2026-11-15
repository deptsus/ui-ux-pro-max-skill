// Rilis 6: recordings uploaded from /admin (matched by text, filtered per
// pack, stored safely), the UI audit's contrast rules, and the guest
// "Bercabang" label.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { buildPack } from '@content/index';
import { C } from '@content/stories';
import { indexContent, type AudioResource, type ContentPack } from '@/lib/content/types';
import { packForFree, packToRows, rowsToPack, type Rows } from '@/lib/content/rows';
import { audioForPack, recordingKey, spokenKey, textHash } from '@/lib/content/spoken';
import { recordingFor } from '@/lib/client/audio';
import { bankIds, packForClient } from '@/lib/engine/levelExam';
import { audioFileName, isSafeAudioName, sniffAudio, storedAudioName } from '@/lib/server/audio-store';
import { openEmbedded, type RawDb } from '@/lib/server/db';
import { textOn } from '@/components/ui';
import { newUser } from './helpers';

const pack = buildPack();
const rec = (text: string, accent: 'us' | 'uk' = 'us', extra: Partial<AudioResource> = {}): AudioResource => ({ key: recordingKey(text, accent), accent, url: `/api/audio/${recordingKey(text, accent)}.abc.wav`, transcript: text, ...extra });
const withAudio = (audio: AudioResource[]): ContentPack => ({ ...pack, audio });

describe('Rilis 6: rekaman dicocokkan dengan teks', () => {
  it('huruf besar, tanda baca, dan kutip lengkung tidak berpengaruh', () => {
    expect(spokenKey("Nice to meet you!")).toBe(spokenKey('  nice to meet YOU. '));
    expect(spokenKey('I’m used to getting up early.')).toBe(spokenKey("I'm used to getting up early"));
    expect(spokenKey("'Hello,' she said.")).toBe('hello she said');
    expect(spokenKey('Is it big?')).not.toBe(spokenKey('It is big.'));
    expect(textHash('abc')).toBe(textHash('abc'));
    expect(textHash('abc')).not.toBe(textHash('abd'));
  });

  it('satu kunci per teks dan aksen; unggah ulang teks yang sama menggantikan', () => {
    expect(recordingKey('Good morning!', 'us')).toBe(recordingKey('good morning', 'us'));
    expect(recordingKey('Good morning!', 'us')).not.toBe(recordingKey('Good morning!', 'uk'));
    expect(recordingKey('Good morning!', 'uk')).toMatch(/^rec\.[a-z0-9]{1,16}\.uk$/);
  });

  it('pemutar memilih rekaman dengan aksen pelajar, lalu aksen lain, lalu suara perangkat', () => {
    const text = pack.listening.find((l) => !l.premium)!.transcript;
    const ix = indexContent(withAudio([rec(text, 'us'), rec(text, 'uk')]));
    expect(recordingFor(ix, text, 'uk')?.accent).toBe('uk');
    expect(recordingFor(ix, text.toUpperCase(), 'us')?.accent).toBe('us');
    const onlyUk = indexContent(withAudio([rec(text, 'uk')]));
    expect(recordingFor(onlyUk, text, 'us')?.accent).toBe('uk');
    expect(recordingFor(onlyUk, 'A sentence nobody recorded.', 'us')).toBeUndefined();
    const keyed = indexContent(withAudio([{ key: 'vocab.apple.us', accent: 'us', url: 'https://cdn.example.test/apple.mp3' }]));
    expect(recordingFor(keyed, 'apple', 'us', 'vocab.apple.us')?.url).toBe('https://cdn.example.test/apple.mp3');
  });

  it('tamu hanya menerima rekaman teks yang ada di paketnya', () => {
    const free = pack.listening.find((l) => !l.premium)!;
    const premium = pack.listening.find((l) => l.premium)!;
    const premiumLine = pack.stories.find((s) => s.premium && !s.branch)!.scenes[0].lines[0].en;
    const word = pack.vocabulary.find((v) => !v.premium)!.word;
    const p = withAudio([rec(free.transcript), rec(premium.transcript), rec(premiumLine), rec(word), rec('Text that appears nowhere in the curriculum.')]);
    const guest = packForFree(p).audio.map((a) => a.transcript);
    expect(guest).toContain(free.transcript);
    expect(guest).toContain(word);
    expect(guest).not.toContain(premium.transcript);
    expect(guest).not.toContain(premiumLine);
    expect(guest).not.toContain('Text that appears nowhere in the curriculum.');
    const full = audioForPack(packForClient(p)).map((a) => a.transcript);
    expect(full).toEqual(expect.arrayContaining([free.transcript, premium.transcript, premiumLine, word]));
  });

  it('rekaman teks bank ujian tidak ikut ke perangkat (bank ujian juga tidak)', () => {
    const bank = bankIds(pack);
    const bankEx = pack.exercises.find((e) => bank.has(e.id) && typeof e.audioText === 'string' && e.audioText.length > 40)!;
    expect(bankEx).toBeTruthy();
    const p = withAudio([rec(bankEx.audioText!)]);
    expect(audioForPack(packForClient(p))).toEqual([]);
    expect(audioForPack(p)).toHaveLength(1);
  });
});

describe('Rilis 6: berkas rekaman', () => {
  const bytes = (...b: (number | string)[]) => {
    const out: number[] = [];
    for (const x of b) if (typeof x === 'string') out.push(...[...x].map((c) => c.charCodeAt(0))); else out.push(x);
    while (out.length < 16) out.push(0);
    return new Uint8Array(out);
  };
  it('format dikenali dari isi berkas, bukan dari nama atau klaim browser', () => {
    expect(sniffAudio(bytes('RIFF', 0, 0, 0, 0, 'WAVE'))?.type).toBe('audio/wav');
    expect(sniffAudio(bytes('ID3', 3, 0))?.type).toBe('audio/mpeg');
    expect(sniffAudio(bytes(0xff, 0xfb, 0x90, 0x44))?.type).toBe('audio/mpeg');
    expect(sniffAudio(bytes(0xff, 0xf1, 0x50, 0x80))?.type).toBe('audio/aac');
    expect(sniffAudio(bytes('OggS'))?.type).toBe('audio/ogg');
    expect(sniffAudio(bytes(0x1a, 0x45, 0xdf, 0xa3))?.type).toBe('audio/webm');
    expect(sniffAudio(bytes(0, 0, 0, 0x20, 'ftypM4A '))?.type).toBe('audio/mp4');
    expect(sniffAudio(bytes('fLaC'))?.type).toBe('audio/flac');
    expect(sniffAudio(bytes('<html><body>'))).toBeNull();
    expect(sniffAudio(bytes(0x89, 'PNG'))).toBeNull();
    expect(sniffAudio(new Uint8Array(4))).toBeNull();
  });
  it('nama berkas acak dan aman; URL lain tidak pernah dihapus', () => {
    const a = audioFileName('rec.abc123.us', 'wav');
    const b = audioFileName('rec.abc123.us', 'wav');
    expect(a).not.toBe(b);
    expect(isSafeAudioName(a)).toBe(true);
    for (const bad of ['../etc/passwd', 'a/b.mp3', '.hidden', '', 'x'.repeat(200)]) expect(isSafeAudioName(bad)).toBe(false);
    expect(storedAudioName(`/api/audio/${a}`)).toBe(a);
    expect(storedAudioName('/api/audio/../../secret')).toBeNull();
    expect(storedAudioName('https://evil.example.test/storage/v1/object/public/audio/x.mp3')).toBeNull();
  });
});

describe('Rilis 6: kontras warna (audit UI/UX)', () => {
  const css = fs.readFileSync(path.resolve(__dirname, '../src/app/globals.css'), 'utf8');
  const tokens = (sel: string) => Object.fromEntries([...css.match(new RegExp(`${sel} \\{([^}]*)\\}`))![1].matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));
  const lum = (hex: string) => { const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const ratio = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const TEXT: [string, string][] = [['ink', 'bg'], ['ink', 'surface'], ['ink', 'surface-2'], ['muted', 'bg'], ['muted', 'surface'], ['muted', 'surface-2'], ['brand', 'surface'], ['brand', 'bg'], ['brand', 'brand-soft'], ['brand', 'surface-2'], ['on-brand', 'brand'], ['accent-strong', 'accent-soft'], ['ok', 'ok-soft'], ['ok', 'surface'], ['bad', 'bad-soft'], ['bad', 'surface'], ['on-brand', 'ok'], ['on-brand', 'bad']];
  for (const [theme, sel] of [['terang', ':root'], ['gelap', '\\.dark']] as const) {
    it(`tema ${theme}: teks minimal 4,5:1, batas kotak isian minimal 3:1`, () => {
      const t = tokens(sel);
      for (const [fg, bg] of TEXT) expect(ratio(t[fg], t[bg]), `${fg} di atas ${bg}`).toBeGreaterThanOrEqual(4.5);
      expect(ratio('#1e1b3a', t.accent), 'teks tombol aksen').toBeGreaterThanOrEqual(4.5);
      for (const bg of ['surface', 'bg', 'surface-2']) expect(ratio(t['line-strong'], t[bg]), `batas isian di atas ${bg}`).toBeGreaterThanOrEqual(3);
    });
  }
  it('huruf di atas warna avatar selalu terbaca (minimal 4,5:1)', () => {
    const colors = ['#4b3fd6', '#f59e0b', '#15803d', '#be123c', '#0e7490', '#7c3aed', '#c2410c', '#0f766e'];
    for (const c of colors) expect(ratio(textOn(c), c), c).toBeGreaterThanOrEqual(4.5);
  });
  it('nama tokoh tidak lagi ditulis di atas warna bajunya (beberapa warna tidak bisa terbaca, mis. ungu Nenek)', () => {
    expect(Object.values(C).some((c) => Math.max(ratio('#ffffff', c.shirt), ratio('#1e1b3a', c.shirt)) < 4.5)).toBe(true);
    const files = ['src/components/story/BranchPlayer.tsx', 'src/app/app/stories/page.tsx'].map((f) => fs.readFileSync(path.resolve(__dirname, '..', f), 'utf8'));
    for (const src of files) expect(src).not.toMatch(/text-white" style=\{\{ background: \w+\.shirt/);
  });
});

describe('Rilis 6: label "Bercabang" untuk tamu', () => {
  it('cerita bercabang terkunci membawa jumlah keputusan, tanpa cabang dan adegan', () => {
    const free = packForFree(pack);
    for (const s of pack.stories.filter((x) => x.branch)) {
      const g = free.stories.find((x) => x.id === s.id)!;
      expect(g.locked).toBe(true);
      expect(g.branch).toBeUndefined();
      expect(g.scenes).toEqual([]);
      expect(g.decisions).toBe(s.branch!.nodes.filter((n) => n.choices?.length).length);
    }
    for (const s of free.stories.filter((x) => !pack.stories.find((y) => y.id === x.id)?.branch)) expect(s.decisions).toBeUndefined();
  });
});

describe('Rilis 6: basis data (0012)', () => {
  let db: RawDb;
  let admin: string;
  let student: string;
  const ROOT = path.resolve(__dirname, '..');
  const save = (actor: string, key: string, accent: string, url: string, transcript: string) => db.rpc<{ key: string; url: string; replaced: string | null }>('admin_save_recording', { p_actor: actor, p_key: key, p_accent: accent, p_url: url, p_speaker: ' Sarah ', p_transcript: transcript });
  beforeAll(async () => {
    db = await openEmbedded(undefined, ROOT);
    admin = await newUser(db, 'Admin Rekaman', 'admin');
    student = await newUser(db, 'Siswa');
  });
  afterAll(async () => {
    await db.close();
  });

  it('fitur terdaftar; hanya admin yang bisa menyimpan dan menghapus rekaman', async () => {
    const [f] = await db.query<{ f: string[] }>('select content_features() as f');
    expect(f.f).toContain('audio_uploads');
    const key = recordingKey('Good morning!', 'us');
    await expect(save(student, key, 'us', '/api/audio/x.wav', 'Good morning!')).rejects.toThrow(/forbidden/);
    await expect(db.rpc('admin_delete_recording', { p_actor: student, p_key: key })).rejects.toThrow(/forbidden/);
  });

  it('menolak kunci, aksen, teks, dan URL yang tidak sah', async () => {
    const key = recordingKey('Good morning!', 'us');
    await expect(save(admin, 'vocab.x', 'us', '/api/audio/x.wav', 'Good morning!')).rejects.toThrow(/invalid_key/);
    await expect(save(admin, key, 'uk', '/api/audio/x.wav', 'Good morning!')).rejects.toThrow(/invalid_accent/);
    await expect(save(admin, key, 'us', '/api/audio/x.wav', '  ')).rejects.toThrow(/invalid_transcript/);
    await expect(save(admin, key, 'us', 'javascript:alert(1)', 'Good morning!')).rejects.toThrow(/invalid_url/);
  });

  it('menyimpan, mengganti (mengembalikan URL lama), lalu menghapus', async () => {
    const key = recordingKey('Good morning!', 'us');
    expect((await save(admin, key, 'us', '/api/audio/a.wav', 'Good morning!')).replaced).toBeNull();
    const again = await save(admin, key, 'us', '/api/audio/b.wav', 'good morning');
    expect(again.replaced).toBe('/api/audio/a.wav');
    const [row] = await db.query<{ url: string; speaker: string; transcript: string }>('select url, speaker, transcript from audio_resources where key = $1', [key]);
    expect(row).toEqual({ url: '/api/audio/b.wav', speaker: 'Sarah', transcript: 'good morning' });
    expect(await db.rpc('admin_delete_recording', { p_actor: admin, p_key: key })).toEqual({ deleted: true, url: '/api/audio/b.wav' });
    expect(await db.rpc('admin_delete_recording', { p_actor: admin, p_key: key })).toEqual({ deleted: false, url: null });
  });

  it('rekaman ikut terbit bersama kurikulum dan kembali utuh', async () => {
    await db.rpc('import_content', { p_actor: admin, p_rows: packToRows(pack) });
    const text = pack.listening.find((l) => !l.premium)!.transcript;
    await save(admin, recordingKey(text, 'uk'), 'uk', '/api/audio/c.wav', text);
    expect((await db.rpc<{ published: boolean }>('publish_curriculum', { p_actor: admin, p_label: 'r6', p_notes: 'rekaman' })).published).toBe(true);
    const back = rowsToPack((await db.rpc<{ rows: Rows }>('get_published_content')).rows, 'db-x');
    expect(back.audio).toEqual([{ key: recordingKey(text, 'uk'), accent: 'uk', url: '/api/audio/c.wav', speaker: 'Sarah', transcript: text }]);
    expect(packForFree(back).audio).toHaveLength(1);
  });
});
