// Lentera English admin notifications (Web Push).
// Registered with scope /admin/ only when an admin turns phone notifications
// on, so it is separate from the learner app's offline worker (/sw.js).
// It has no fetch handler: it never changes how pages load.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let msg = {};
  try {
    msg = event.data ? event.data.json() : {};
  } catch {
    msg = { body: event.data ? event.data.text() : '' };
  }
  const title = msg.title || 'Lentera English';
  event.waitUntil(
    self.registration.showNotification(title, {
      body: msg.body || 'Ada pembaruan di dashboard admin.',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: msg.tag || 'lentera-admin',
      renotify: true,
      data: { url: msg.url || '/admin' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || '/admin', self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      // Pages outside /admin/ are not controlled by this worker, so they cannot
      // be navigated from here: focus an open dashboard, otherwise open one.
      for (const client of list) {
        if (client.url.startsWith(target) && 'focus' in client) return client.focus();
      }
      return self.clients.openWindow(target);
    }),
  );
});
