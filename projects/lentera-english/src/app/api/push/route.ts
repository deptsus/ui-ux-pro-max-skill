// Phone/browser notifications for admins.
//   GET                          → VAPID public key + how many devices this account has
//   POST { action: 'subscribe', subscription }   (admins only, checked in SQL)
//   POST { action: 'unsubscribe', endpoint }
//   POST { action: 'test' }      → sends a test notification to this admin's devices
import { HttpError, json, readJson, requireUser, route } from '@/lib/server/api';
import { notifyAdmins, pushKeys } from '@/lib/server/push';

export const dynamic = 'force-dynamic';

interface Body {
  action?: string;
  endpoint?: string;
  subscription?: { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
}

export const GET = route(async (req) => {
  const { db, userId } = await requireUser(req);
  const keys = await pushKeys(db);
  const devices = await db.rpc<number>('push_device_count', { p_user: userId });
  return json({ publicKey: keys.public_key, devices });
});

export const POST = route(async (req) => {
  const { db, userId } = await requireUser(req);
  const b = await readJson<Body>(req, 8000);
  switch (b.action) {
    case 'subscribe': {
      const s = b.subscription;
      if (!s?.endpoint || !s.keys?.p256dh || !s.keys.auth) throw new HttpError(400, 'Data langganan notifikasi tidak lengkap.');
      return json(await db.rpc('save_push_subscription', {
        p_user: userId,
        p_endpoint: s.endpoint,
        p_p256dh: s.keys.p256dh,
        p_auth: s.keys.auth,
        p_user_agent: (req.headers.get('user-agent') ?? '').slice(0, 300),
      }));
    }
    case 'unsubscribe':
      if (!b.endpoint) throw new HttpError(400, 'Perangkat tidak dikenal.');
      return json(await db.rpc('delete_push_subscription', { p_user: userId, p_endpoint: b.endpoint }));
    case 'test': {
      const report = await notifyAdmins(db, {
        title: 'Notifikasi Lentera aktif',
        body: 'Kamu akan diberi tahu di sini setiap ada pembayaran yang menunggu konfirmasi.',
        url: '/admin',
        tag: 'lentera-test',
      }, { onlyUser: userId, origin: new URL(req.url).origin });
      return json(report);
    }
    default:
      throw new HttpError(400, 'Aksi tidak dikenal.');
  }
});
