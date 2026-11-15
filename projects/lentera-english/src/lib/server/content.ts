// Serves the published curriculum. Free accounts get a stripped pack.
import { CONTENT_VERSION, buildPack } from '@content/index';
import { packForFree, rowsToPack, type Rows } from '@/lib/content/rows';
import { packForClient } from '@/lib/engine/levelExam';
import { audioForPack } from '@/lib/content/spoken';
import type { ContentPack } from '@/lib/content/types';
import type { ServerDb } from './db';

/** full: everything, server only (exam bank with keys). premium/free: what devices receive. */
interface Cached { version: string; full: ContentPack; premium: ContentPack; free: ContentPack; checkedAt: number }
const g = globalThis as unknown as { __lenteraPack?: Cached };
const TTL = 30_000;
/** What a Premium device receives: no exam bank, and only recordings of text it can see. */
const forPremium = (full: ContentPack): ContentPack => { const p = packForClient(full); return { ...p, audio: audioForPack(p) }; };

export function invalidateContent() {
  g.__lenteraPack = undefined;
}

/**
 * The version devices would receive, without loading the curriculum: a device
 * that already holds this version only needs "unchanged" (a few bytes), even
 * on a server instance that has not loaded the curriculum yet.
 */
export async function contentVersion(db: ServerDb | null): Promise<string> {
  const cached = g.__lenteraPack;
  if (cached && Date.now() - cached.checkedAt < TTL) return cached.version;
  if (!db) return `bundled-${CONTENT_VERSION}`;
  const current = await db.rpc<{ version: number } | null>('get_content_version');
  return current ? `db-${current.version}` : `bundled-${CONTENT_VERSION}`;
}

export async function loadContent(db: ServerDb | null): Promise<Cached> {
  const now = Date.now();
  const cached = g.__lenteraPack;
  if (cached && now - cached.checkedAt < TTL) return cached;
  if (!db) {
    const full = buildPack();
    return (g.__lenteraPack = { version: `bundled-${full.version}`, full, premium: forPremium(full), free: packForFree(full), checkedAt: now });
  }
  const current = await db.rpc<{ version: number; label: string } | null>('get_content_version');
  if (!current) {
    // Nothing published yet: fall back to the bundled curriculum.
    const full = buildPack();
    return (g.__lenteraPack = { version: `bundled-${full.version}`, full, premium: forPremium(full), free: packForFree(full), checkedAt: now });
  }
  const version = `db-${current.version}`;
  if (cached && cached.version === version) return (g.__lenteraPack = { ...cached, checkedAt: now });
  const published = await db.rpc<{ rows: Rows }>('get_published_content');
  const full = rowsToPack(published.rows, version);
  return (g.__lenteraPack = { version, full, premium: forPremium(full), free: packForFree(full), checkedAt: now });
}
