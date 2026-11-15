// Lentera English homework reminders (Web Push, Rilis 4).
// Registered with scope /app/pengingat/ only when a learner turns PR reminders
// on, so it is separate from the offline worker (/sw.js) and the admin worker
// (/admin-sw.js). It has no fetch handler: it never changes how pages load.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let msg = {};
  try {
    msg = event.data ? event.data.json() : {};
  } catch {
    msg = { body: event.data ? event.data.text() : '' };
  }
  event.waitUntil(
    self.registration.showNotification(msg.title || 'Pengingat PR', {
      body: msg.body || 'Ada PR yang tenggatnya sudah dekat.',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: msg.tag || 'lentera-pr',
      renotify: true,
      data: { url: msg.url || '/app/homework' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || '/app/homework', self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      // Open app pages are outside this worker's scope, so they cannot be
      // navigated from here: focus the same page if open, otherwise open it.
      for (const client of list) {
        if (client.url === target && 'focus' in client) return client.focus();
      }
      return self.clients.openWindow(target);
    }),
  );
});
