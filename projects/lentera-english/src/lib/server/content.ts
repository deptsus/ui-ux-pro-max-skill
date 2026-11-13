// Serves the published curriculum. Free accounts get a stripped pack.
import { buildPack } from '@content/index';
import { packForFree, rowsToPack, type Rows } from '@/lib/content/rows';
import type { ContentPack } from '@/lib/content/types';
import type { ServerDb } from './db';

interface Cached { version: string; full: ContentPack; free: ContentPack; checkedAt: number }
const g = globalThis as unknown as { __lenteraPack?: Cached };
const TTL = 30_000;

export function invalidateContent() {
  g.__lenteraPack = undefined;
}

export async function loadContent(db: ServerDb | null): Promise<Cached> {
  const now = Date.now();
  const cached = g.__lenteraPack;
  if (cached && now - cached.checkedAt < TTL) return cached;
  if (!db) {
    const full = buildPack();
    return (g.__lenteraPack = { version: `bundled-${full.version}`, full, free: packForFree(full), checkedAt: now });
  }
  const current = await db.rpc<{ version: number; label: string } | null>('get_content_version');
  if (!current) {
    // Nothing published yet: fall back to the bundled curriculum.
    const full = buildPack();
    return (g.__lenteraPack = { version: `bundled-${full.version}`, full, free: packForFree(full), checkedAt: now });
  }
  const version = `db-${current.version}`;
  if (cached && cached.version === version) return (g.__lenteraPack = { ...cached, checkedAt: now });
  const published = await db.rpc<{ rows: Rows }>('get_published_content');
  const full = rowsToPack(published.rows, version);
  return (g.__lenteraPack = { version, full, free: packForFree(full), checkedAt: now });
}
