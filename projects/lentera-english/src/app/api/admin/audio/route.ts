// Recordings (Rilis 6): upload one file for one text and accent, or delete it.
// The admin role is checked in the database (assert_admin) before anything is stored.
import { recordingKey } from '@/lib/content/spoken';
import { HttpError, json, readJson, requireAdmin, route } from '@/lib/server/api';
import { MAX_AUDIO_BYTES, audioFileName, deleteAudio, putAudio, sniffAudio } from '@/lib/server/audio-store';

export const dynamic = 'force-dynamic';

const NEEDS_0012 = 'Basis data belum diperbarui untuk Rilis 6 (unggah rekaman). Jalankan supabase/manual/apply-0012.sql di Supabase SQL Editor, lalu ulangi.';
type Rpc = { rpc<T>(fn: string, args?: Record<string, unknown>): Promise<T> };
async function ready(db: Rpc, userId: string) {
  await db.rpc('assert_admin', { p_actor: userId });
  const features = await db.rpc<string[]>('content_features').catch(() => null);
  if (!Array.isArray(features) || !features.includes('audio_uploads')) throw new HttpError(409, NEEDS_0012, 'needs_migration');
}

export const POST = route(async (req) => {
  const { db, userId } = await requireAdmin(req);
  await ready(db, userId);
  const declared = Number(req.headers.get('content-length') ?? 0);
  if (declared > MAX_AUDIO_BYTES + 64 * 1024) throw new HttpError(413, 'Berkas terlalu besar. Maksimal 4 MB per rekaman.', 'too_large');
  const form = await req.formData().catch(() => null);
  if (!form) throw new HttpError(400, 'Format unggahan tidak valid.', 'bad_form');
  const file = form.get('file');
  const accent = String(form.get('accent') ?? '');
  const text = String(form.get('text') ?? '').trim();
  const speaker = String(form.get('speaker') ?? '').trim().slice(0, 80);
  if (accent !== 'us' && accent !== 'uk') throw new HttpError(400, 'Pilih aksen US atau UK.', 'bad_accent');
  if (!text || text.length > 5000) throw new HttpError(400, 'Teks rekaman wajib diisi (maksimal 5000 karakter).', 'bad_text');
  if (!(file instanceof Blob) || !file.size) throw new HttpError(400, 'Pilih berkas audio.', 'no_file');
  if (file.size > MAX_AUDIO_BYTES) throw new HttpError(413, 'Berkas terlalu besar. Maksimal 4 MB per rekaman.', 'too_large');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = sniffAudio(bytes);
  if (!kind) throw new HttpError(415, 'Format audio tidak dikenali. Gunakan MP3, M4A, OGG, WEBM, WAV, atau FLAC.', 'bad_type');
  const key = recordingKey(text, accent);
  const url = await putAudio(audioFileName(key, kind.ext), bytes, kind.type);
  let saved: { key: string; url: string; replaced: string | null };
  try {
    saved = await db.rpc('admin_save_recording', { p_actor: userId, p_key: key, p_accent: accent, p_url: url, p_speaker: speaker, p_transcript: text });
  } catch (e) {
    await deleteAudio(url).catch(() => false);
    throw e;
  }
  // The previous file of this text and accent is no longer used by the draft.
  if (saved.replaced && saved.replaced !== url) await deleteAudio(saved.replaced).catch(() => false);
  return json({ key, accent, url, speaker: speaker || null, transcript: text, bytes: bytes.length, type: kind.type });
});

export const DELETE = route(async (req) => {
  const { db, userId } = await requireAdmin(req);
  await ready(db, userId);
  const b = await readJson<{ key?: string }>(req);
  const r = await db.rpc<{ deleted: boolean; url: string | null }>('admin_delete_recording', { p_actor: userId, p_key: String(b.key ?? '') });
  if (r.url) await deleteAudio(r.url).catch(() => false);
  return json({ deleted: r.deleted });
});
