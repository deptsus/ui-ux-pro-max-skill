// Downloads one backup file when there is no storage link to hand out (the
// embedded database keeps backups in a local folder). Admins only.
import { HttpError, requireAdmin, route } from '@/lib/server/api';
import { backupStore, isBackupName } from '@/lib/server/backup';

export const dynamic = 'force-dynamic';

export const GET = route(async (req) => {
  const { db, userId } = await requireAdmin(req);
  await db.rpc('admin_health', { p_actor: userId });
  const name = new URL(req.url).searchParams.get('name') ?? '';
  if (!isBackupName(name)) throw new HttpError(400, 'Nama cadangan tidak valid.');
  const file = await backupStore().read(name);
  if (!file) throw new HttpError(404, 'Cadangan tidak ditemukan.');
  return new Response(new Uint8Array(file), {
    headers: { 'Content-Type': 'application/gzip', 'Content-Disposition': `attachment; filename="lentera-${name.replace('daily/', '')}"`, 'Cache-Control': 'no-store' },
  });
});
