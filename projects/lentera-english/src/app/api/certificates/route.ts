// Certificates: GET ?code=XXXXXXXXXX verifies one publicly (no account
// needed); GET without a code lists the signed-in learner's own.
import { HttpError, json, requireDb, requireUser, route } from '@/lib/server/api';

export const dynamic = 'force-dynamic';

export const GET = route(async (req) => {
  const code = new URL(req.url).searchParams.get('code');
  if (code !== null) {
    if (!/^[A-Za-z2-9]{10}$/.test(code.trim())) throw new HttpError(404, 'Sertifikat tidak ditemukan.', 'not_found');
    const db = await requireDb();
    const cert = await db.rpc<Record<string, unknown> | null>('get_certificate', { p_code: code }).catch(() => null);
    if (!cert) throw new HttpError(404, 'Sertifikat tidak ditemukan.', 'not_found');
    return json({ certificate: cert });
  }
  const { db, userId } = await requireUser(req);
  const list = await db.rpc<unknown[]>('my_certificates', { p_user: userId }).catch(() => []);
  return json({ certificates: list });
});
