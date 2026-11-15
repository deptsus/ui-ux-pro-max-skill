// Netlify scheduled function (Rilis 4, extended in Rilis 8): once an hour, asks
// the app to send the reminders that are due: PR deadlines and the daily study
// reminder at each learner's chosen hour. All the logic, quiet hours and the
// once-only rules live in /api/cron/reminders and the database; this file only
// rings the bell. Scheduled functions run on the published site only.
export default async () => {
  const base = (process.env.URL || 'https://lentera-english-app.netlify.app').replace(/\/$/, '');
  const res = await fetch(`${base}/api/cron/reminders`, { method: 'POST', headers: { 'User-Agent': 'lentera-scheduler' } });
  console.log('[homework-reminders]', res.status, (await res.text()).slice(0, 300));
};

export const config = { schedule: '@hourly' };
