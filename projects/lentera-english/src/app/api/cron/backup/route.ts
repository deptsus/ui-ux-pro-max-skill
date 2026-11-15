// Daily backup, called by the scheduled Netlify function
// netlify/functions/daily-backup.mjs. Not public: the caller must sign the
// request with an HMAC of today's date keyed with the server's secret key.
import { timingSafeEqual } from 'node:crypto';
import { HttpError, json, requireDb, route } from '@/lib/server/api';
import { cronSignature, runBackup } from '@/lib/server/backup';

export const dynamic = 'force-dynamic';

function signed(given: string): boolean {
  const day = 86_400_000;
  return [new Date(), new Date(Date.now() - day)].some((d) => {
    const want = cronSignature('backup', d);
    return !!want && want.length === given.length && timingSafeEqual(Buffer.from(want), Buffer.from(given));
  });
}

export const POST = route(async (req) => {
  if (!signed(req.headers.get('x-lentera-cron') ?? '')) throw new HttpError(403, 'Akses ditolak.', 'forbidden');
  const db = await requireDb();
  return json(await runBackup(db, { trigger: 'schedule' }));
});
