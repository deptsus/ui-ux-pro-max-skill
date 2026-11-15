// Serves the curriculum to devices. A device sends the version and tier it
// already holds (?v=…&tier=…); when both still match, the answer is a few
// bytes ("unchanged") and the curriculum is not even loaded on the server.
import { userIdFromRequest } from '@/lib/server/auth';
import { json, route } from '@/lib/server/api';
import { contentVersion, loadContent } from '@/lib/server/content';
import { getDb } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export const GET = route(async (req) => {
  const db = await getDb();
  let premium = false;
  if (db) {
    const userId = await userIdFromRequest(req);
    if (userId) {
      const account = await db.rpc<{ entitlement: { premium: boolean } }>('get_account', { p_user: userId });
      premium = !!account.entitlement.premium;
    }
  }
  const tier = premium ? 'premium' : 'free';
  const url = new URL(req.url);
  const held = url.searchParams.get('v');
  if (held && url.searchParams.get('tier') === tier) {
    const version = await contentVersion(db);
    if (held === version) return json({ unchanged: true, version, tier });
  }
  const content = await loadContent(db);
  return json({ version: content.version, tier, pack: premium ? content.premium : content.free });
});
