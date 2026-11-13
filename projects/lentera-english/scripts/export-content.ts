// Backs up the curriculum from the database to a JSON file, so edits made in
// the admin CMS exist somewhere other than the database.
//
//   npm run content:export                    working copy (drafts included)
//   npm run content:export -- --published     the version learners receive
//   npm run content:export -- --out file.json
//
// Uses the same connection as the server: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY,
// or LENTERA_BACKEND=embedded for the local database (stop the dev server
// first: the embedded database allows one process at a time).
// The "rows" object has the shape import_content() accepts.
import fs from 'node:fs';
import path from 'node:path';
import { rowsToPack, type Rows } from '../src/lib/content/rows';
import { validatePack } from '../src/lib/content/validate';
import { backendMode, getDb } from '../src/lib/server/db';

const args = process.argv.slice(2);
const published = args.includes('--published');
const outArg = args.includes('--out') ? args[args.indexOf('--out') + 1] : undefined;

async function main(): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.error('Tidak ada basis data yang dikonfigurasi. Set SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY, atau LENTERA_BACKEND=embedded.');
    return 1;
  }
  let rows: Rows;
  let version: { id: number; label: string; published_at: string } | null = null;
  if (published) {
    const current = await db.rpc<{ version: number; label: string; published_at: string; rows: Rows } | null>('get_published_content');
    if (!current) {
      console.error('Belum ada versi kurikulum yang terbit. Jalankan tanpa --published untuk mengekspor konten kerja.');
      return 1;
    }
    rows = current.rows;
    version = { id: current.version, label: current.label, published_at: current.published_at };
  } else {
    rows = await db.rpc<Rows>('content_rows', { p_all: true });
  }

  const now = new Date();
  const stampName = now.toISOString().slice(0, 16).replace(/[-:]/g, '').replace('T', '-');
  const out = path.resolve(outArg ?? path.join('backups', `content-${published ? 'published' : 'working'}-${stampName}.json`));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ exported_at: now.toISOString(), backend: backendMode(), source: published ? 'published' : 'working', version, rows }, null, 2) + '\n');

  console.log(`Sumber: ${published ? `versi terbit ${version!.id} (${version!.label})` : 'konten kerja, termasuk draf'} · backend ${backendMode()}`);
  for (const [table, list] of Object.entries(rows)) console.log(`  ${table.padEnd(24)} ${String(list.length).padStart(5)} baris`);
  // The same check that guards the bundled curriculum, so a backup of broken content is flagged.
  const problems = validatePack(rowsToPack({ ...rows, lessons: rows.lessons.filter((l) => l.status !== 'draft'), questions: rows.questions.filter((q) => q.status !== 'draft') }, 'export'));
  console.log(problems.length ? `Perhatian: ${problems.length} masalah kualitas pada konten berstatus terbit:\n  ${problems.slice(0, 20).join('\n  ')}` : 'Konten berstatus terbit lolos pemeriksaan kualitas.');
  console.log(`Tersimpan: ${out} (${Math.round(fs.statSync(out).size / 1024)} KB)`);
  return 0;
}

main().then((code) => process.exit(code), (e) => {
  console.error('Ekspor gagal:', (e as Error).message);
  process.exit(1);
});
