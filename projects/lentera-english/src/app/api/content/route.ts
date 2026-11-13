import { userIdFromRequest } from '@/lib/server/auth';
import { json, route } from '@/lib/server/api';
import { loadContent } from '@/lib/server/content';
import { getDb } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export const GET = route(async (req) => {
  const db = await getDb();
  const content = await loadContent(db);
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
  if (url.searchParams.get('v') === content.version && url.searchParams.get('tier') === tier) return json({ unchanged: true, version: content.version, tier });
  return json({ version: content.version, tier, pack: premium ? content.full : content.free });
});
