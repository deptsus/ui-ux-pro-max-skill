import { deleteAuthUser, userIdFromRequest } from '@/lib/server/auth';
import { HttpError, json, paymentMode, readJson, requireUser, route } from '@/lib/server/api';
import { rateLimit } from '@/lib/server/security';
import { contentVersion } from '@/lib/server/content';
import { backendMode, getDb, type ServerDb } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

// Whether new Supabase accounts get the 3-day Premium trial (migration 0021). Cached per
// function instance; the app only uses it to mention the trial on sign-up screens.
let trialCache: { at: number; on: boolean } | null = null;
async function trialOffered(db: ServerDb | null, backend: string): Promise<boolean> {
  if (!db || backend !== 'supabase') return false;
  if (trialCache && Date.now() - trialCache.at < 10 * 60_000) return trialCache.on;
  const on = await db.rpc<string[]>('content_features', {}).then((f) => Array.isArray(f) && f.includes('trial')).catch(() => false);
  trialCache = { at: Date.now(), on };
  return on;
}

export const GET = route(async (req) => {
  const backend = backendMode();
  const db = await getDb();
  // The curriculum version rides along, so an app that already holds it
  // does not need a separate content request at all.
  const base = { backend, payments: paymentMode(), trial: await trialOffered(db, backend), contentVersion: await contentVersion(db).catch(() => null) };
  const userId = db ? await userIdFromRequest(req) : null;
  if (!db || !userId) return json({ ...base, user: null });
  const account = await db.rpc<{ profile: Record<string, unknown>; entitlement: Record<string, unknown> }>('get_account', { p_user: userId });
  return json({ ...base, user: { id: userId, ...account } });
});

export const PATCH = route(async (req) => {
  const { db, userId } = await requireUser(req);
  await rateLimit(db, 'profile', userId, 60, 3600);
  const patch = await readJson<Record<string, unknown>>(req, 2000);
  // School level (Rilis 16): one of the known values, or '' to clear.
  if ('school_level' in patch && !['', 'sd', 'smp', 'sma', 'umum'].includes(String(patch.school_level))) throw new HttpError(400, 'Jenjang sekolah tidak dikenal.', 'bad_school_level');
  return json({ profile: await db.rpc('update_profile', { p_user: userId, p_patch: patch }) });
});

// Deletes the account and everything learned with it (Rilis 9). Payments stay
// as financial records, without the person. Admin accounts are refused.
export const DELETE = route(async (req) => {
  const { db, userId } = await requireUser(req);
  await rateLimit(db, 'delete-account', userId, 5, 3600);
  const b = await readJson<{ confirm?: string }>(req, 500);
  if (b.confirm !== 'HAPUS') throw new HttpError(400, 'Ketik HAPUS untuk mengonfirmasi.');
  await db.rpc('prepare_account_deletion', { p_user: userId }).catch((e: Error) => {
    if (/admin_account/.test(e.message)) throw new HttpError(403, 'Akun admin tidak bisa dihapus dari aplikasi. Ubah perannya dulu di basis data.', 'admin_account');
    if (/does not exist|could not find/i.test(e.message)) throw new HttpError(409, 'Fitur ini sedang disiapkan di server. Coba lagi nanti.', 'not_ready');
    throw e;
  });
  await deleteAuthUser(userId);
  return json({ deleted: true });
});
