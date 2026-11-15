// Netlify scheduled function (Rilis 4): once an hour, asks the app to send the
// homework reminders that are due. All the logic, quiet hours (07.00–20.00 WIB)
// and the once-per-PR rule live in /api/cron/reminders and the database; this
// file only rings the bell. Scheduled functions run on the published site only.
export default async () => {
  const base = (process.env.URL || 'https://lentera-english-app.netlify.app').replace(/\/$/, '');
  const res = await fetch(`${base}/api/cron/reminders`, { method: 'POST', headers: { 'User-Agent': 'lentera-scheduler' } });
  console.log('[homework-reminders]', res.status, (await res.text()).slice(0, 300));
};

export const config = { schedule: '@hourly' };
