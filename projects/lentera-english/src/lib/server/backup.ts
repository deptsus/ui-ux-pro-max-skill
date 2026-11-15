// Daily backups (Rilis 9). Every learner, payment and curriculum table (see
// backup_tables() in migration 0014) is exported page by page into one gzip
// JSON file per day, stored in the private "backups" bucket (Supabase) or a
// local folder (embedded database). The last BACKUP.keep days are kept.
// Accounts are exported without anything secret (no password hashes).
import { createHmac } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { backendMode, supabaseKeyHeaders, supabaseSecretKey, type ServerDb } from './db';

export const BACKUP = { keep: 14, pageSize: 2000, bucket: 'backups', prefix: 'daily/' } as const;

export interface BackupStore {
  put(name: string, bytes: Buffer): Promise<void>;
  list(): Promise<string[]>;
  remove(names: string[]): Promise<void>;
  /** A short-lived download link, or null when the server must stream the file itself. */
  link(name: string): Promise<string | null>;
  read(name: string): Promise<Buffer | null>;
}

export interface BackupResult { name: string; bytes: number; rows: number; tables: number; ms: number; removed: string[] }

const SAFE = /^daily\/\d{4}-\d{2}-\d{2}\.json\.gz$/;
export const isBackupName = (name: string) => SAFE.test(name);

function supabaseStore(): BackupStore {
  const url = process.env.SUPABASE_URL!;
  const headers = supabaseKeyHeaders(supabaseSecretKey());
  const obj = (name: string) => `${url}/storage/v1/object/${BACKUP.bucket}/${name}`;
  const check = async (res: Response, what: string) => {
    if (!res.ok) throw new Error(`storage ${what} failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
    return res;
  };
  return {
    async put(name, bytes) {
      await check(await fetch(obj(name), { method: 'POST', headers: { ...headers, 'Content-Type': 'application/gzip', 'x-upsert': 'true' }, body: new Uint8Array(bytes) }), 'upload');
    },
    async list() {
      const res = await check(await fetch(`${url}/storage/v1/object/list/${BACKUP.bucket}`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix: BACKUP.prefix, limit: 1000, sortBy: { column: 'name', order: 'asc' } }),
      }), 'list');
      return ((await res.json()) as { name: string }[]).map((o) => BACKUP.prefix + o.name).filter(isBackupName);
    },
    async remove(names) {
      if (!names.length) return;
      await check(await fetch(`${url}/storage/v1/object/${BACKUP.bucket}`, {
        method: 'DELETE', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ prefixes: names }),
      }), 'delete');
    },
    async link(name) {
      const res = await check(await fetch(`${url}/storage/v1/object/sign/${BACKUP.bucket}/${name}`, {
        method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ expiresIn: 300 }),
      }), 'sign');
      const { signedURL } = (await res.json()) as { signedURL: string };
      return `${url}/storage/v1${signedURL}`;
    },
    async read() {
      return null;
    },
  };
}

export function localBackupDir(): string {
  const data = process.env.LENTERA_DATA_DIR ?? path.join(process.cwd(), '.data', 'pglite');
  return path.join(path.dirname(data), 'backups');
}

function localStore(dir = localBackupDir()): BackupStore {
  const file = (name: string) => path.join(dir, name.replace(BACKUP.prefix, ''));
  return {
    async put(name, bytes) {
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(file(name), bytes);
    },
    async list() {
      // Local folder of the embedded database only; never traced into the server bundle.
      if (!fs.existsSync(/*turbopackIgnore: true*/ dir)) return [];
      return fs.readdirSync(/*turbopackIgnore: true*/ dir).map((f) => BACKUP.prefix + f).filter(isBackupName).sort();
    },
    async remove(names) {
      for (const n of names) fs.rmSync(file(n), { force: true });
    },
    async link() {
      return null;
    },
    async read(name) {
      return fs.existsSync(/*turbopackIgnore: true*/ file(name)) ? fs.readFileSync(/*turbopackIgnore: true*/ file(name)) : null;
    },
  };
}

export function backupStore(): BackupStore {
  return backendMode() === 'supabase' ? supabaseStore() : localStore();
}

/** Exports everything, writes today's file (WIB date), and drops files beyond the last `keep`. */
export async function runBackup(db: ServerDb, opts: { trigger: 'schedule' | 'admin'; store?: BackupStore; now?: Date; keep?: number; pageSize?: number } = { trigger: 'admin' }): Promise<BackupResult> {
  const started = Date.now();
  const store = opts.store ?? backupStore();
  const now = opts.now ?? new Date();
  const pageSize = opts.pageSize ?? BACKUP.pageSize;
  const tables = await db.rpc<string[]>('backup_tables');
  const out: { format: string; version: number; created_at: string; release: string; tables: Record<string, unknown[]>; auth_users: unknown[] } = {
    format: 'lentera-backup', version: 1, created_at: now.toISOString(), release: (process.env.NEXT_PUBLIC_RELEASE ?? 'local').slice(0, 40), tables: {}, auth_users: [],
  };
  let rows = 0;
  for (const t of tables) {
    const all: unknown[] = [];
    for (let offset = 0; ; offset += pageSize) {
      const page = await db.rpc<unknown[]>('backup_rows', { p_table: t, p_offset: offset, p_limit: pageSize });
      all.push(...page);
      if (page.length < pageSize) break;
    }
    out.tables[t] = all;
    rows += all.length;
  }
  for (let offset = 0; ; offset += pageSize) {
    const page = await db.rpc<unknown[]>('backup_auth_users', { p_offset: offset, p_limit: pageSize });
    out.auth_users.push(...page);
    if (page.length < pageSize) break;
  }
  const bytes = gzipSync(Buffer.from(JSON.stringify(out)));
  const day = new Date(now.getTime() + 7 * 3600_000).toISOString().slice(0, 10);
  const name = `${BACKUP.prefix}${day}.json.gz`;
  await store.put(name, bytes);
  const files = (await store.list()).sort();
  const removed = files.slice(0, Math.max(0, files.length - (opts.keep ?? BACKUP.keep)));
  await store.remove(removed);
  const ms = Date.now() - started;
  await db.rpc('record_backup', { p_name: name, p_bytes: bytes.length, p_rows: rows, p_tables: tables.length, p_ms: ms, p_trigger: opts.trigger });
  return { name, bytes: bytes.length, rows, tables: tables.length, ms, removed };
}

/**
 * The scheduled function proves it is the scheduler with an HMAC of the date,
 * keyed with the server's secret key, so the backup endpoint is not public
 * and no extra secret has to be configured.
 */
export function cronSignature(job: string, date = new Date()): string | null {
  const secret = supabaseSecretKey() || (backendMode() === 'embedded' ? 'lentera-dev-cron' : '');
  if (!secret) return null;
  return createHmac('sha256', secret).update(`${job}:${date.toISOString().slice(0, 10)}`).digest('hex');
}
