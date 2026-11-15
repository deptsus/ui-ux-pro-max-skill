// Where uploaded recordings live (Rilis 6). On Supabase: the public "audio"
// bucket of Supabase Storage (created by migration 0012), written with the
// server's secret key; learners fetch the files from Supabase's public URL.
// In embedded mode (local runs and e2e): a folder next to the database,
// served by /api/audio/<name>.
import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { backendMode, supabaseKeyHeaders, supabaseSecretKey } from './db';

export const AUDIO_BUCKET = 'audio';
/** Netlify functions take at most ~6 MB per request; a 4 MB clip is about 4 minutes of speech. */
export const MAX_AUDIO_BYTES = 4 * 1024 * 1024;

export interface SniffedAudio { type: string; ext: string }

/** Identifies the format from the file's first bytes; the browser's claim is not trusted. */
export function sniffAudio(b: Uint8Array): SniffedAudio | null {
  const ascii = (from: number, to: number) => String.fromCharCode(...b.subarray(from, to));
  if (b.length < 12) return null;
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WAVE') return { type: 'audio/wav', ext: 'wav' };
  if (ascii(0, 4) === 'OggS') return { type: 'audio/ogg', ext: 'ogg' };
  if (ascii(0, 4) === 'fLaC') return { type: 'audio/flac', ext: 'flac' };
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return { type: 'audio/webm', ext: 'webm' };
  if (ascii(4, 8) === 'ftyp') return { type: 'audio/mp4', ext: 'm4a' };
  if (ascii(0, 3) === 'ID3') return { type: 'audio/mpeg', ext: 'mp3' };
  if (b[0] === 0xff && (b[1] & 0xf6) === 0xf0) return { type: 'audio/aac', ext: 'aac' };
  if (b[0] === 0xff && (b[1] & 0xe0) === 0xe0 && ((b[1] >> 1) & 3) !== 0) return { type: 'audio/mpeg', ext: 'mp3' };
  return null;
}

/** Local folder for embedded mode, next to the PGlite data. */
export function localAudioDir(): string {
  const data = process.env.LENTERA_DATA_DIR ?? path.join(process.cwd(), '.data', 'pglite');
  return path.join(path.dirname(data), 'audio');
}

const SAFE_NAME = /^[a-z0-9][a-z0-9._-]{0,120}$/;
export const isSafeAudioName = (name: string) => SAFE_NAME.test(name) && !name.includes('..');

/** A fresh, unguessable file name for a recording key. */
export function audioFileName(key: string, ext: string): string {
  const base = key.toLowerCase().replace(/[^a-z0-9.-]+/g, '-').replace(/^[-.]+/, '').slice(0, 80) || 'rekaman';
  return `${base}.${randomBytes(6).toString('hex')}.${ext}`;
}

const publicPrefix = () => `${process.env.SUPABASE_URL}/storage/v1/object/public/${AUDIO_BUCKET}/`;

/** Stores the file and returns the URL learners play it from. */
export async function putAudio(name: string, bytes: Uint8Array, type: string): Promise<string> {
  if (!isSafeAudioName(name)) throw new Error('bad audio name');
  if (backendMode() === 'embedded') {
    const dir = localAudioDir();
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, name), bytes);
    return `/api/audio/${name}`;
  }
  const res = await fetch(`${process.env.SUPABASE_URL}/storage/v1/object/${AUDIO_BUCKET}/${name}`, {
    method: 'POST',
    headers: { ...supabaseKeyHeaders(supabaseSecretKey()), 'Content-Type': type, 'Cache-Control': 'max-age=31536000', 'x-upsert': 'true' },
    body: Buffer.from(bytes),
  });
  if (!res.ok) throw new Error(`storage upload failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
  return publicPrefix() + name;
}

/** The file name behind a URL that this app stored, or null for any other URL. */
export function storedAudioName(url: string): string | null {
  const name = url.startsWith('/api/audio/') ? url.slice('/api/audio/'.length) : process.env.SUPABASE_URL && url.startsWith(publicPrefix()) ? url.slice(publicPrefix().length) : null;
  return name && isSafeAudioName(name) ? name : null;
}

/** Removes a stored file. Files this app did not store are left alone. */
export async function deleteAudio(url: string): Promise<boolean> {
  const name = storedAudioName(url);
  if (!name) return false;
  if (url.startsWith('/api/audio/')) {
    fs.rmSync(path.join(localAudioDir(), name), { force: true });
    return true;
  }
  const res = await fetch(`${process.env.SUPABASE_URL}/storage/v1/object/${AUDIO_BUCKET}/${name}`, { method: 'DELETE', headers: supabaseKeyHeaders(supabaseSecretKey()) });
  return res.ok;
}
