// Server-side database access. The whole backend talks to Postgres through
// one method: rpc(function, args) -> jsonb. Two adapters implement it:
//   * Supabase (production): service-role client calling the SQL functions.
//   * Embedded (development/tests): PGlite, a real Postgres compiled to WASM,
//     loaded with the very same migration files.
import fs from 'node:fs';
import path from 'node:path';

export interface ServerDb {
  rpc<T = unknown>(fn: string, args?: Record<string, unknown>): Promise<T>;
}

export class DbError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
  }
}

export type BackendMode = 'supabase' | 'embedded' | 'none';

export function backendMode(): BackendMode {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) return 'supabase';
  const wantsEmbedded = process.env.LENTERA_BACKEND === 'embedded';
  // The embedded database is a development tool. It never starts in a
  // production build unless explicitly allowed (used by the e2e suite).
  if (wantsEmbedded && (process.env.NODE_ENV !== 'production' || process.env.LENTERA_ALLOW_EMBEDDED === '1')) return 'embedded';
  return 'none';
}

// ───────────────────────── Supabase ─────────────────────────
function supabaseDb(): ServerDb {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return {
    async rpc<T>(fn: string, args: Record<string, unknown> = {}) {
      // PostgREST RPC endpoint; the service role key never reaches the browser.
      const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
        method: 'POST',
        headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(args),
        cache: 'no-store',
      });
      const text = await res.text();
      const body = text ? JSON.parse(text) : null;
      if (!res.ok) throw new DbError(body?.message ?? `rpc ${fn} failed (${res.status})`, body?.code);
      return body as T;
    },
  };
}

// ───────────────────────── Embedded (PGlite) ─────────────────────────
export interface RawDb extends ServerDb {
  query<R = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<R[]>;
  exec(sql: string): Promise<void>;
  close(): Promise<void>;
}

export function migrationFiles(root = process.cwd()): string[] {
  const dir = path.join(root, 'supabase', 'migrations');
  return [path.join(root, 'supabase', 'test-shim.sql'), ...fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort().map((f) => path.join(dir, f))];
}

/** Opens a PGlite database and applies the shim + all migrations if new. */
export async function openEmbedded(dataDir?: string, root = process.cwd()): Promise<RawDb> {
  const { PGlite } = await import('@electric-sql/pglite');
  const pg = dataDir ? new PGlite(dataDir) : new PGlite();
  await pg.waitReady;
  const fresh = (await pg.query<{ n: number }>("select count(*)::int as n from information_schema.tables where table_schema = 'public' and table_name = 'profiles'")).rows[0].n === 0;
  if (fresh) for (const file of migrationFiles(root)) await pg.exec(fs.readFileSync(file, 'utf8'));
  const db: RawDb = {
    async query<R>(sql: string, params: unknown[] = []) {
      try {
        return (await pg.query<R>(sql, params)).rows;
      } catch (e) {
        const err = e as { message?: string; code?: string };
        throw new DbError(err.message ?? 'query failed', err.code);
      }
    },
    async exec(sql: string) {
      await pg.exec(sql);
    },
    async rpc<T>(fn: string, args: Record<string, unknown> = {}) {
      if (!/^[a-z_]+$/.test(fn)) throw new DbError('invalid function name');
      const keys = Object.keys(args);
      const list = keys.map((k, i) => `${k} => $${i + 1}`).join(', ');
      const params = keys.map((k) => {
        const v = args[k];
        return v !== null && typeof v === 'object' ? JSON.stringify(v) : v;
      });
      const rows = await db.query<{ r: T }>(`select public.${fn}(${list}) as r`, params);
      return rows[0]?.r as T;
    },
    async close() {
      await pg.close();
    },
  };
  return db;
}

const g = globalThis as unknown as { __lenteraDb?: Promise<RawDb> };

/** Embedded singleton for the dev server, seeded with the bundled curriculum. */
export function embeddedDb(): Promise<RawDb> {
  g.__lenteraDb ??= (async () => {
    const dir = process.env.LENTERA_DATA_DIR ?? path.join(process.cwd(), '.data', 'pglite');
    fs.mkdirSync(path.dirname(dir), { recursive: true });
    const db = await openEmbedded(dir);
    const current = await db.rpc<unknown>('get_content_version');
    if (!current) {
      const { buildPack } = await import('@content/index');
      const { packToRows } = await import('@/lib/content/rows');
      await db.rpc('import_content', { p_actor: null, p_rows: packToRows(buildPack()) });
      await db.rpc('publish_curriculum', { p_actor: null, p_label: 'Kurikulum bawaan', p_notes: 'Diimpor otomatis dari paket konten bawaan.' });
    }
    return db;
  })();
  return g.__lenteraDb;
}

export async function getDb(): Promise<ServerDb | null> {
  const mode = backendMode();
  if (mode === 'supabase') return supabaseDb();
  if (mode === 'embedded') return embeddedDb();
  return null;
}
