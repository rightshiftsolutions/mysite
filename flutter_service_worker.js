'use strict';

const BUILD_VERSION = '20260527132603';
const APP_CACHE = 'gymgurus-flutter-app-' + BUILD_VERSION;
const RUNTIME_CACHE = 'gymgurus-runtime-' + BUILD_VERSION;
const CACHE_PREFIXES = [
  'gymgurus-flutter-app-',
  'gymgurus-runtime-',
  'gymgurus-static',
  'gymgurus-pwa',
];
const ASSETS = [
    "./",
    "./404.html",
    "./assets/AssetManifest.bin",
    "./assets/AssetManifest.bin.json",
    "./assets/assets/images/applogo.png",
    "./assets/assets/images/logo.png",
    "./assets/assets/images/templates_offers/aerobics-1.png",
    "./assets/assets/images/templates_offers/aerobics-2.png",
    "./assets/assets/images/templates_offers/diwali-1.png",
    "./assets/assets/images/templates_offers/gen-1.png",
    "./assets/assets/images/templates_offers/gen-2.png",
    "./assets/assets/images/templates_offers/gen-3.png",
    "./assets/assets/images/templates_offers/yoga.png",
    "./assets/assets/images/templates_offers/zubma.png",
    "./assets/FontManifest.json",
    "./assets/fonts/MaterialIcons-Regular.otf",
    "./assets/NOTICES",
    "./assets/packages/cupertino_icons/assets/CupertinoIcons.ttf",
    "./assets/packages/font_awesome_flutter/lib/fonts/Font-Awesome-7-Brands-Regular-400.otf",
    "./assets/packages/font_awesome_flutter/lib/fonts/Font-Awesome-7-Free-Regular-400.otf",
    "./assets/packages/font_awesome_flutter/lib/fonts/Font-Awesome-7-Free-Solid-900.otf",
    "./assets/shaders/ink_sparkle.frag",
    "./assets/shaders/stretch_effect.frag",
    "./canvaskit/canvaskit.js",
    "./canvaskit/canvaskit.js.symbols",
    "./canvaskit/canvaskit.wasm",
    "./canvaskit/chromium/canvaskit.js",
    "./canvaskit/chromium/canvaskit.js.symbols",
    "./canvaskit/chromium/canvaskit.wasm",
    "./canvaskit/experimental_webparagraph/canvaskit.js",
    "./canvaskit/experimental_webparagraph/canvaskit.js.symbols",
    "./canvaskit/experimental_webparagraph/canvaskit.wasm",
    "./canvaskit/skwasm.js",
    "./canvaskit/skwasm.js.symbols",
    "./canvaskit/skwasm.wasm",
    "./canvaskit/skwasm_heavy.js",
    "./canvaskit/skwasm_heavy.js.symbols",
    "./canvaskit/skwasm_heavy.wasm",
    "./canvaskit/wimp.js",
    "./canvaskit/wimp.js.symbols",
    "./canvaskit/wimp.wasm",
    "./favicon.png",
    "./flutter.js",
    "./flutter_bootstrap.js",
    "./icons/Icon-192.png",
    "./icons/Icon-512.png",
    "./icons/Icon-maskable-192.png",
    "./icons/Icon-maskable-512.png",
    "./index.html",
    "./main.dart.js",
    "./manifest.json",
    "./pwa.js",
    "./pwa_service_worker.js"
];
const NETWORK_FIRST = new Set([
  './',
  './index.html',
  './manifest.json',
  './pwa.js',
  './flutter_bootstrap.js',
]);
const NEVER_CACHE = new Set([
  './version.json',
  './flutter_service_worker.js',
]);

function normalizeRequest(request) {
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return null;

  let path = url.pathname;
  const scopePath = new URL(self.registration.scope).pathname;
  if (path.startsWith(scopePath)) {
    path = path.slice(scopePath.length);
  }
  path = path.replace(/^\/+/, '');
  return path ? './' + path : './';
}

function cacheKeyForRequest(request) {
  const normalized = normalizeRequest(request);
  if (!normalized) return null;
  return normalized === './' ? './index.html' : normalized;
}

async function putFresh(cacheName, request, response) {
  if (!response || response.status !== 200 || response.type === 'opaque') {
    return response;
  }
  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
  return response;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(APP_CACHE)
      .then((cache) =>
        cache.addAll(ASSETS.filter((asset) => !NEVER_CACHE.has(asset))),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                CACHE_PREFIXES.some((prefix) => key.startsWith(prefix)) &&
                key !== APP_CACHE &&
                key !== RUNTIME_CACHE,
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

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('/api/') || url.pathname.includes('/gym/')) return;

  const cacheKey = cacheKeyForRequest(request);
  if (!cacheKey) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response || response.status === 404) {
            return caches.match('./index.html');
          }
          return putFresh(APP_CACHE, './index.html', response);
        })
        .catch(() => caches.match('./index.html')),
    );
    return;
  }

  if (NEVER_CACHE.has(cacheKey)) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }

  if (NETWORK_FIRST.has(cacheKey)) {
    event.respondWith(
      fetch(request)
        .then((response) => putFresh(APP_CACHE, cacheKey, response))
        .catch(() => caches.match(cacheKey)),
    );
    return;
  }

  event.respondWith(
    caches.match(cacheKey).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) =>
        putFresh(RUNTIME_CACHE, cacheKey, response),
      );
    }),
  );
});