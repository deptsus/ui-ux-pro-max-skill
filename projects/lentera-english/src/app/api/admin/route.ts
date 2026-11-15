// Single CMS/admin endpoint. Every action re-checks the admin role inside the
// database function (assert_admin), not just here.
import { buildPack } from '@content/index';
import { packToRows } from '@/lib/content/rows';
import { HttpError, json, readJson, requireAdmin, route } from '@/lib/server/api';
import { backupStore, isBackupName, runBackup } from '@/lib/server/backup';
import { invalidateContent } from '@/lib/server/content';
import { mapManualError } from '@/lib/server/manual-payments';

export const dynamic = 'force-dynamic';

interface Body { action?: string; table?: string; row?: Record<string, unknown>; id?: string; label?: string; notes?: string; version?: number; note?: string; reason?: string; target?: string; all?: boolean; noteId?: number; resolution?: string; weeks?: number; errorId?: number; messageId?: number; name?: string; license?: Record<string, unknown>; patch?: Record<string, unknown> }
const NEEDS_0008 = 'Basis data belum diperbarui untuk Rilis 1. Jalankan supabase/manual/apply-0008.sql di Supabase SQL Editor, lalu ulangi.';
const NEEDS_0009 = 'Basis data belum diperbarui untuk Rilis 3 (ujian level dan sertifikat). Jalankan supabase/manual/apply-0009.sql di Supabase SQL Editor, lalu ulangi.';
type Rpc = { rpc<T>(fn: string, args?: Record<string, unknown>): Promise<T> };
/** Stories and review notes need migration 0008; say so instead of failing halfway. */
async function require0008(db: Rpc) {
  const features = await db.rpc<string[]>('content_features').catch(() => null);
  if (!Array.isArray(features) || !features.includes('stories')) throw new HttpError(409, NEEDS_0008);
}
const NEEDS_0011 = 'Basis data belum diperbarui untuk Rilis 5 (cerita bercabang). Jalankan supabase/manual/apply-0011.sql di Supabase SQL Editor, lalu ulangi.';
/** Branching stories are stored in a column 0011 adds; importing without it would silently drop them. */
async function require0011(db: Rpc) {
  await require0009(db);
  const features = await db.rpc<string[]>('content_features').catch(() => null);
  if (!Array.isArray(features) || !features.includes('branching_stories')) throw new HttpError(409, NEEDS_0011);
}
const NEEDS_0010 = 'Basis data belum diperbarui untuk Rilis 4 (ringkasan dan pengingat PR). Jalankan supabase/manual/apply-0010.sql di Supabase SQL Editor, lalu muat ulang.';
async function require0010(db: Rpc) {
  const features = await db.rpc<string[]>('content_features').catch(() => null);
  if (!Array.isArray(features) || !features.includes('homework_reminders')) throw new HttpError(409, NEEDS_0010);
}
/** The bundled curriculum carries level-exam sections, stored in a column 0009 adds. */
async function require0009(db: Rpc) {
  await require0008(db);
  const features = await db.rpc<string[]>('content_features').catch(() => null);
  if (!Array.isArray(features) || !features.includes('level_exams')) throw new HttpError(409, NEEDS_0009);
}
const NEEDS_0014 = 'Basis data belum diperbarui untuk Rilis 9 (kesehatan, cadangan, analitik). Jalankan supabase/manual/apply-0014.sql di Supabase SQL Editor, lalu muat ulang.';
async function require0014(db: Rpc) {
  const features = await db.rpc<string[]>('content_features').catch(() => null);
  if (!Array.isArray(features) || !features.includes('ops')) throw new HttpError(409, NEEDS_0014, 'not_ready');
}
const NEEDS_0015 = 'Basis data belum diperbarui untuk Rilis 10 (kelas dan lisensi sekolah). Jalankan supabase/manual/apply-0015.sql di Supabase SQL Editor, lalu muat ulang.';
async function require0015(db: Rpc) {
  const features = await db.rpc<string[]>('content_features').catch(() => null);
  if (!Array.isArray(features) || !features.includes('classes')) throw new HttpError(409, NEEDS_0015, 'not_ready');
}
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const int = (v: unknown, min: number, max: number, what: string) => {
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) throw new HttpError(400, `${what} harus angka ${min}–${max}.`);
  return n;
};
const date = (v: unknown, what: string) => {
  if (typeof v !== 'string' || !DATE.test(v) || Number.isNaN(Date.parse(v))) throw new HttpError(400, `Tanggal ${what} tidak valid.`);
  return v;
};
const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const isUuid = (s: unknown) => typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export const POST = route(async (req) => {
  const { db, userId } = await requireAdmin(req);
  const b = await readJson<Body>(req);
  switch (b.action) {
    case 'content':
      return json(await db.rpc('admin_content', { p_actor: userId }));
    case 'upsert':
      return json(await db.rpc('admin_upsert', { p_actor: userId, p_table: String(b.table), p_row: b.row ?? {} }));
    case 'delete':
      return json(await db.rpc('admin_delete', { p_actor: userId, p_table: String(b.table), p_id: String(b.id) }));
    case 'publish': {
      const result = await db.rpc('publish_curriculum', { p_actor: userId, p_label: b.label ?? '', p_notes: b.notes ?? '' });
      invalidateContent();
      return json(result);
    }
    case 'versions':
      return json(await db.rpc('list_curriculum_versions', { p_actor: userId }));
    case 'restore': {
      const result = await db.rpc('restore_curriculum_version', { p_actor: userId, p_id: Number(b.version) });
      invalidateContent();
      return json(result);
    }
    case 'import-bundled':
      await require0011(db);
      return json(await db.rpc('import_content', { p_actor: userId, p_rows: packToRows(buildPack()) }));
    // Review notes: the owner flags content in the CMS; the next release works through them.
    case 'notes':
      await require0008(db);
      return json(await db.rpc('admin_list_notes', { p_actor: userId, p_all: !!b.all }));
    case 'add-note': {
      const note = String(b.note ?? '').trim();
      if (!note || note.length > 2000) throw new HttpError(400, 'Tulis catatan 1–2000 karakter.');
      if (!String(b.target ?? '').trim()) throw new HttpError(400, 'Catatan harus menunjuk satu baris konten.');
      await require0008(db);
      return json(await db.rpc('admin_add_note', { p_actor: userId, p_table: String(b.table), p_target: String(b.target), p_note: note }));
    }
    case 'resolve-note':
      await require0008(db);
      return json(await db.rpc('admin_resolve_note', { p_actor: userId, p_id: Number(b.noteId), p_resolution: String(b.resolution ?? '').slice(0, 1000) }));
    case 'payments':
      return json(await db.rpc('admin_payment_overview', { p_actor: userId }));
    // Homework across all learners (Rilis 4, migration 0010).
    case 'homework':
      await require0010(db);
      return json(await db.rpc('admin_homework_overview', { p_actor: userId }));
    // Cheap number for the admin badge inside the learner app.
    case 'pending-count':
      return json({ pending: await db.rpc<number>('admin_pending_count', { p_actor: userId }) });
    // Manual QRIS: confirming is what grants Premium; the SQL re-checks the admin role.
    case 'confirm-payment':
      if (!isUuid(b.id)) throw new HttpError(400, 'Transaksi tidak valid.');
      return json(await db.rpc('admin_confirm_payment', { p_actor: userId, p_tx: b.id, p_note: String(b.note ?? '').slice(0, 1000) }).catch(mapManualError));
    case 'reject-payment':
      if (!isUuid(b.id)) throw new HttpError(400, 'Transaksi tidak valid.');
      return json(await db.rpc('admin_reject_payment', { p_actor: userId, p_tx: b.id, p_reason: String(b.reason ?? '').slice(0, 1000) }).catch(mapManualError));
    // ── Rilis 9: health, errors, messages, backups, analytics (migration 0014) ──
    case 'health': {
      await require0014(db);
      const [health, errors, messages] = await Promise.all([
        db.rpc('admin_health', { p_actor: userId }),
        db.rpc('admin_errors', { p_actor: userId, p_all: !!b.all }),
        db.rpc('admin_contact_messages', { p_actor: userId, p_all: !!b.all }),
      ]);
      const files = await backupStore().list().catch(() => [] as string[]);
      return json({ health, errors, messages, files: files.slice(-14).reverse() });
    }
    case 'resolve-error':
      await require0014(db);
      return json(await db.rpc('admin_resolve_error', { p_actor: userId, p_id: Number(b.errorId) }));
    case 'close-message':
      await require0014(db);
      return json(await db.rpc('admin_close_contact', { p_actor: userId, p_id: Number(b.messageId) }));
    case 'backup-now': {
      await require0014(db);
      // Only admins reach this line: the health check above ran assert_admin.
      await db.rpc('admin_health', { p_actor: userId });
      return json(await runBackup(db, { trigger: 'admin' }));
    }
    case 'backup-link': {
      await require0014(db);
      await db.rpc('admin_health', { p_actor: userId });
      const name = String(b.name ?? '');
      if (!isBackupName(name)) throw new HttpError(400, 'Nama cadangan tidak valid.');
      const url = await backupStore().link(name);
      return json(url ? { url } : { download: `/api/admin/backup?name=${encodeURIComponent(name)}` });
    }
    case 'analytics':
      await require0014(db);
      return json(await db.rpc('admin_analytics', { p_actor: userId, p_weeks: Number(b.weeks) || 12 }));
    // ── Rilis 10: school licenses (migration 0015) ──
    case 'licenses':
      await require0015(db);
      return json(await db.rpc('admin_licenses', { p_actor: userId }));
    case 'create-license': {
      await require0015(db);
      const l = b.license ?? {};
      const school = text(l.school, 120);
      if (school.length < 2) throw new HttpError(400, 'Nama sekolah minimal 2 huruf.');
      const starts = date(l.starts, 'mulai');
      const ends = date(l.ends, 'berakhir');
      if (ends < starts) throw new HttpError(400, 'Tanggal berakhir harus sesudah tanggal mulai.');
      return json(await db.rpc('admin_create_license', {
        p_actor: userId, p_school: school, p_contact: text(l.contact, 120), p_max_teachers: int(l.max_teachers, 1, 200, 'Jumlah guru'),
        p_max_classes: int(l.max_classes, 1, 500, 'Jumlah kelas'), p_seats: int(l.seats, 1, 500, 'Siswa per kelas'), p_starts: starts, p_ends: ends, p_note: text(l.note, 500),
      }));
    }
    case 'update-license': {
      await require0015(db);
      const p = b.patch ?? {};
      const patch: Record<string, unknown> = {};
      if (p.ends_on !== undefined) patch.ends_on = date(p.ends_on, 'berakhir');
      if (p.max_teachers !== undefined) patch.max_teachers = int(p.max_teachers, 1, 200, 'Jumlah guru');
      if (p.max_classes !== undefined) patch.max_classes = int(p.max_classes, 1, 500, 'Jumlah kelas');
      if (p.seats_per_class !== undefined) patch.seats_per_class = int(p.seats_per_class, 1, 500, 'Siswa per kelas');
      if (p.revoked !== undefined) patch.revoked = p.revoked === true;
      if (p.note !== undefined) patch.note = text(p.note, 500);
      const id = Number(b.id);
      if (!Number.isSafeInteger(id) || id < 1) throw new HttpError(400, 'Lisensi tidak dikenal.');
      return json(await db.rpc('admin_update_license', { p_actor: userId, p_id: id, p_patch: patch }).catch((e: Error) => {
        if (/not_found/.test(e.message)) throw new HttpError(404, 'Lisensi tidak ditemukan.');
        if (/check constraint|violates/.test(e.message)) throw new HttpError(400, 'Tanggal berakhir tidak boleh sebelum tanggal mulai.');
        throw e;
      }));
    }
    default:
      throw new HttpError(400, 'Aksi tidak dikenal.');
  }
});
