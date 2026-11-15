// Netlify scheduled function (Rilis 9): every night at 02.00 WIB, asks the app
// to back up the database (/api/cron/backup). The request is signed with an
// HMAC of the date keyed with the Supabase secret key the site already has,
// so the backup endpoint stays closed to everyone else. Scheduled functions
// run on the published site only.
import { createHmac } from 'node:crypto';

export default async () => {
  const base = (process.env.URL || 'https://lentera-english-app.netlify.app').replace(/\/$/, '');
  const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    console.log('[daily-backup] no Supabase secret key on this site; nothing to back up');
    return;
  }
  const sig = createHmac('sha256', secret).update(`backup:${new Date().toISOString().slice(0, 10)}`).digest('hex');
  const res = await fetch(`${base}/api/cron/backup`, { method: 'POST', headers: { 'x-lentera-cron': sig, 'User-Agent': 'lentera-scheduler' } });
  console.log('[daily-backup]', res.status, (await res.text()).slice(0, 300));
};

// 19.00 UTC = 02.00 WIB, when hardly anyone studies.
export const config = { schedule: '0 19 * * *' };
