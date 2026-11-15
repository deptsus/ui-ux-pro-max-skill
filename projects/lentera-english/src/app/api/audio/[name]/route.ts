// Serves recordings stored on disk in embedded mode (local runs and e2e).
// On Supabase, recordings come straight from Supabase Storage instead.
import fs from 'node:fs';
import path from 'node:path';
import { backendMode } from '@/lib/server/db';
import { isSafeAudioName, localAudioDir, sniffAudio } from '@/lib/server/audio-store';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  if (backendMode() !== 'embedded' || !isSafeAudioName(name)) return new Response('Not found', { status: 404 });
  const file = path.join(localAudioDir(), name);
  if (!fs.existsSync(file)) return new Response('Not found', { status: 404 });
  const bytes = fs.readFileSync(file);
  return new Response(bytes, { headers: { 'Content-Type': sniffAudio(bytes)?.type ?? 'application/octet-stream', 'Cache-Control': 'public, max-age=31536000, immutable', 'Content-Length': String(bytes.length) } });
}
