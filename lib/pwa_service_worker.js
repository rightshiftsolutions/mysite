// Migration worker for older LibraryManager AI PWA installs.
//
// Current builds use Flutter's generated flutter_service_worker.js. This file
// remains only so browsers that previously registered pwa_service_worker.js can
// install one final update, clear old custom caches, and reload into the
// Flutter-managed service worker.

const MIGRATION_CACHE_PREFIXES = [
  'librarymanager-static',
  'librarymanager-runtime',
  'librarymanager-pwa',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) =>
              MIGRATION_CACHE_PREFIXES.some((prefix) => key.startsWith(prefix)),
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  event.respondWith(
    fetch(request).catch(() => {
      if (request.mode === 'navigate') {
        return caches.match('./index.html');
      }
      return caches.match(request);
    }),
  );
});
