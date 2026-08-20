const VERSION = 'v2';
const APP_SHELL_CACHE = `mavunoone-app-shell-${VERSION}`;
const RUNTIME_CACHE = `mavunoone-runtime-${VERSION}`;
const IMAGE_CACHE = `mavunoone-images-${VERSION}`;

const APP_SHELL = [
  '/',
  '/login',
  '/manifest.json',
  '/offline.html',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => ![APP_SHELL_CACHE, RUNTIME_CACHE, IMAGE_CACHE].includes(key))
        .map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

function isCacheable(response) {
  return response && (response.status === 200 || response.type === 'opaque');
}

function cacheFirst(request, cacheName) {
  return caches.open(cacheName).then(async (cache) => {
    const cached = await cache.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (isCacheable(response)) await cache.put(request, response.clone());
    return response;
  });
}

function networkFirst(request, fallbackPath = '/offline.html') {
  return caches.open(RUNTIME_CACHE).then(async (cache) => {
    try {
      const response = await fetch(request);
      if (isCacheable(response)) await cache.put(request, response.clone());
      return response;
    } catch {
      return (await cache.match(request)) ||
        (await caches.match(request)) ||
        (await caches.match(fallbackPath));
    }
  });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, APP_SHELL_CACHE));
    return;
  }

  if (request.destination === 'style' || request.destination === 'script' || request.destination === 'font') {
    event.respondWith(cacheFirst(request, APP_SHELL_CACHE));
    return;
  }

  if (request.destination === 'image' || /\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE).catch(() => caches.match('/favicon.ico')));
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    // Do not cache authenticated or financial API responses.
    return;
  }

  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'CLEAR_CACHE') {
    event.waitUntil(Promise.all([
      caches.delete(APP_SHELL_CACHE),
      caches.delete(RUNTIME_CACHE),
      caches.delete(IMAGE_CACHE),
    ]));
  }
});
