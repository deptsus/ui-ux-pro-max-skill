// Single CMS/admin endpoint. Every action re-checks the admin role inside the
// database function (assert_admin), not just here.
import { buildPack } from '@content/index';
import { packToRows } from '@/lib/content/rows';
import { HttpError, json, readJson, requireUser, route } from '@/lib/server/api';
import { invalidateContent } from '@/lib/server/content';
import { mapManualError } from '@/lib/server/manual-payments';

export const dynamic = 'force-dynamic';

interface Body { action?: string; table?: string; row?: Record<string, unknown>; id?: string; label?: string; notes?: string; version?: number; note?: string; reason?: string }
const isUuid = (s: unknown) => typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export const POST = route(async (req) => {
  const { db, userId } = await requireUser(req);
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
      return json(await db.rpc('import_content', { p_actor: userId, p_rows: packToRows(buildPack()) }));
    case 'payments':
      return json(await db.rpc('admin_payment_overview', { p_actor: userId }));
    // Manual QRIS: confirming is what grants Premium; the SQL re-checks the admin role.
    case 'confirm-payment':
      if (!isUuid(b.id)) throw new HttpError(400, 'Transaksi tidak valid.');
      return json(await db.rpc('admin_confirm_payment', { p_actor: userId, p_tx: b.id, p_note: String(b.note ?? '').slice(0, 1000) }).catch(mapManualError));
    case 'reject-payment':
      if (!isUuid(b.id)) throw new HttpError(400, 'Transaksi tidak valid.');
      return json(await db.rpc('admin_reject_payment', { p_actor: userId, p_tx: b.id, p_reason: String(b.reason ?? '').slice(0, 1000) }).catch(mapManualError));
    default:
      throw new HttpError(400, 'Aksi tidak dikenal.');
  }
});
