// Local development accounts. Exists only when the embedded database is on.
import { devSignIn, devSignUp } from '@/lib/server/auth';
import { HttpError, json, readJson, route } from '@/lib/server/api';
import { backendMode } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export const POST = route(async (req) => {
  if (backendMode() !== 'embedded') throw new HttpError(404, 'Not found');
  const b = await readJson<{ action?: string; email?: string; password?: string; name?: string }>(req, 2000);
  try {
    if (b.action === 'signup') return json(await devSignUp(String(b.email ?? ''), String(b.password ?? ''), String(b.name ?? 'Pelajar')));
    if (b.action === 'signin') return json(await devSignIn(String(b.email ?? ''), String(b.password ?? '')));
  } catch (e) {
    throw new HttpError(400, (e as Error).message);
  }
  throw new HttpError(400, 'Aksi tidak dikenal.');
});
