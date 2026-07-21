/* ==========================================================================
   LoanFlow — Minimal Production Service Worker (sw.js)
   Minimal pass-through Service Worker satisfying PWA installability requirements
   with zero offline caching (Always Network).
   ========================================================================== */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => self.clients.claim())
  );
});

// Pass-through fetch event: Always fetch directly from network with no caching
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
