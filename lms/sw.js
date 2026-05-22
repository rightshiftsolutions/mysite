/**
 * LMS Arena – Service Worker
 * Strategy:
 *   • Static assets (CSS/JS/icons/fonts) → Cache-First
 *   • HTML pages                          → Stale-While-Revalidate
 *   • API calls (/api/*)                  → Network-First (offline fallback)
 *   • Google Fonts / CDN                  → Cache-First (long-lived)
 */

const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE  = `lms-static-${CACHE_VERSION}`;
const PAGES_CACHE   = `lms-pages-${CACHE_VERSION}`;
const FONT_CACHE    = `lms-fonts-${CACHE_VERSION}`;
const API_CACHE     = `lms-api-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/assets/css/styles.css',
  '/assets/css/styles-additions.css',
  '/assets/css/millionaire.css',
  '/assets/js/config.js',
  '/assets/js/api.js',
  '/assets/js/auth.js',
  '/assets/js/student.js',
  '/assets/js/teacher.js',
  '/assets/js/game.js',
  '/assets/js/leaderboard.js',
  '/assets/js/student-js-changes.js',
  '/assets/js/teacher-js-changes.js',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/apple-touch-icon.png',
  '/manifest.json',
  '/pwa.css',
];

const HTML_PAGES = [
  '/index.html',
  '/login.html',
  '/signup.html',
  '/student-dashboard.html',
  '/teacher-dashboard.html',
  '/leaderboard.html',
  '/game.html',
  '/kbc.html',
  '/create-game.html',
  '/manage-courses.html',
];

const OFFLINE_PAGE = '/offline.html';

/* ── Install ─────────────────────────────────────────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS).catch(() => {})),
      caches.open(PAGES_CACHE).then(cache  => cache.addAll([...HTML_PAGES, OFFLINE_PAGE]).catch(() => {})),
    ]).then(() => self.skipWaiting())
  );
});

/* ── Activate ────────────────────────────────────────────── */
self.addEventListener('activate', event => {
  const allowed = [STATIC_CACHE, PAGES_CACHE, FONT_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => !allowed.includes(k)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* ── Fetch ───────────────────────────────────────────────── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome-extension
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // API calls → Network-First
  if (url.pathname.startsWith('/api/') || url.hostname.includes('gymgurus.in')) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Google Fonts / CDN → Cache-First (long-lived)
  if (
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('cdn.jsdelivr.net')
  ) {
    event.respondWith(cacheFirst(request, FONT_CACHE));
    return;
  }

  // Static assets → Cache-First
  if (
    url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf)$/)
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // HTML pages → Stale-While-Revalidate
  if (request.headers.get('accept')?.includes('text/html') || url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(staleWhileRevalidate(request, PAGES_CACHE));
    return;
  }

  // Default → Network with cache fallback
  event.respondWith(networkFirst(request, STATIC_CACHE));
});

/* ── Strategies ──────────────────────────────────────────── */

async function cacheFirst(request, cacheName) {
  const cache    = await caches.open(cacheName);
  const cached   = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return caches.match(OFFLINE_PAGE) || new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || caches.match(OFFLINE_PAGE) || new Response(
      JSON.stringify({ error: 'You are offline' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache    = await caches.open(cacheName);
  const cached   = await cache.match(request);
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached || fetchPromise || caches.match(OFFLINE_PAGE) || new Response('Offline', { status: 503 });
}

/* ── Background Sync (future) ────────────────────────────── */
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: CACHE_VERSION });
  }
});
