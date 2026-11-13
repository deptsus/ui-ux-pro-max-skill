// The admin CMS builds its forms from src/components/admin/schema.ts. These
// tests run that schema against the real curriculum in a real Postgres
// (PGlite): opening a row and saving it must never change or lose data.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import path from 'node:path';
import { buildPack } from '@content/index';
import { TABLE, TABLES, toPayload, validateRow, type Data } from '@/components/admin/schema';
import { packToRows } from '@/lib/content/rows';
import { openEmbedded, type RawDb } from '@/lib/server/db';
import { newUser } from './helpers';

const ROOT = path.resolve(__dirname, '..');
let db: RawDb;
let admin: string;
const content = () => db.rpc<Data>('admin_content', { p_actor: admin });
/** lessons.updated_at is stamped by every save; everything else must match. */
const comparable = (d: Data) => ({ ...d, lessons: d.lessons.map(({ updated_at: _ignored, ...l }) => l) });

beforeAll(async () => {
  db = await openEmbedded(undefined, ROOT);
  admin = await newUser(db, 'cms-admin', 'admin');
  await db.rpc('import_content', { p_actor: admin, p_rows: packToRows(buildPack()) });
});
afterAll(async () => {
  await db.close();
});

describe('admin CMS schema', () => {
  it('covers every editable table the CMS function accepts, with real columns only', async () => {
    for (const def of TABLES) {
      const columns = (await db.query<{ column_name: string }>('select column_name from information_schema.columns where table_schema = $1 and table_name = $2', ['public', def.id])).map((c) => c.column_name);
      expect(columns.length, def.id).toBeGreaterThan(0);
      expect(columns, `${def.id} primary key`).toContain(def.pk);
      // Linked rows (options, objectives, question lists) are stored by the save_* functions, not as columns.
      const virtual = ['options', 'objectives', 'question_ids'];
      for (const f of def.fields) if (!f.payload && !virtual.includes(f.key)) expect(columns, `${def.id}.${f.key}`).toContain(f.key);
    }
  });

  it('accepts every row of the shipped curriculum without a validation problem', async () => {
    const data = await content();
    for (const def of TABLES) {
      for (const row of data[def.id]) expect(validateRow(def, row, data, false), `${def.id} ${row[def.pk]}`).toEqual([]);
    }
  });

  it('saving any row unchanged leaves the whole curriculum identical', async () => {
    const before = await content();
    for (const def of TABLES) {
      for (const row of before[def.id]) await db.rpc('admin_upsert', { p_actor: admin, p_table: def.id, p_row: toPayload(def, structuredClone(row)) });
    }
    expect(comparable(await content())).toEqual(comparable(before));
  });

  it('clears optional fields, keeps payload keys it does not know, and rejects invalid rows', async () => {
    const data = await content();
    const def = TABLE.questions;
    const typed = data.questions.find((q) => q.type === 'fill' && q.hint)!;
    const edited = structuredClone(typed);
    edited.hint = '';
    edited.payload.futureKey = 'kept';
    await db.rpc('admin_upsert', { p_actor: admin, p_table: 'questions', p_row: toPayload(def, edited) });
    const saved = (await content()).questions.find((q) => q.id === typed.id)!;
    expect(saved.hint).toBeUndefined();
    expect(saved.payload.futureKey).toBe('kept');
    expect(saved.payload.answers).toEqual(typed.payload.answers);

    const mc = structuredClone(data.questions.find((q) => q.type === 'mc')!);
    mc.options = mc.options.map((o: { correct?: boolean }) => ({ ...o, correct: true }));
    expect(validateRow(def, mc, data, false)).toContain('Tandai tepat satu pilihan sebagai jawaban benar.');
    const noWhy = structuredClone(data.questions.find((q) => q.type === 'mc')!);
    noWhy.options.find((o: { correct?: boolean }) => !o.correct).why = ' ';
    expect(validateRow(def, noWhy, data, false)).toContain('Setiap pilihan yang salah wajib punya alasan kenapa salah.');
    expect(validateRow(def, { ...structuredClone(typed), payload: { ...typed.payload, answers: [] } }, data, false)).toContain('Kunci jawaban wajib diisi (minimal satu jawaban).');
    expect(validateRow(def, { ...structuredClone(typed) }, data, true)).toContain(`ID "${typed.id}" sudah dipakai.`);
    expect(validateRow(TABLE.homework, { ...data.homework[0], question_ids: ['tidak-ada'] }, data, false).join(' ')).toContain('ID tidak ditemukan: tidak-ada');
  });
});
