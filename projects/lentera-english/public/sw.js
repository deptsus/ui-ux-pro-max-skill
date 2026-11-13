// Lentera English service worker: makes saved pages and app files available
// offline. Registered only when a Premium learner turns on offline learning.
const CACHE = 'lentera-pages';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  // Immutable build assets: cache first.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      })),
    );
    return;
  }
  // Pages: network first, fall back to the saved copy (query string ignored,
  // so /app/lesson?id=... resolves to the saved /app/lesson shell).
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.open(CACHE).then((c) => c.match(url.pathname).then((hit) => hit || c.match('/app')))),
    );
    return;
  }
  // Router data requests fail offline; the app then does a full navigation,
  // which is served from the saved pages above.
});
