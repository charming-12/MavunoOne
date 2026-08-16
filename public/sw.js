// Service Worker for offline support and image caching
const CACHE_NAME = 'mavunoone-v1';
const IMAGE_CACHE_NAME = 'mavunoone-images-v1';
const RUNTIME_CACHE_NAME = 'mavunoone-runtime-v1';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Ignore failures for optional assets
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== IMAGE_CACHE_NAME &&
            cacheName !== RUNTIME_CACHE_NAME
          ) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - cache strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle image requests
  if (
    request.destination === 'image' ||
    url.pathname.includes('/images/') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.gif') ||
    url.pathname.endsWith('.webp')
  ) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            return response;
          }

          return fetch(request).then((response) => {
            if (!response || response.status !== 200) {
              return response;
            }

            const responseToCache = response.clone();
            cache.put(request, responseToCache);
            return response;
          });
        });
      }).catch(() => {
        // Return a placeholder or offline image
        return new Response(
          '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="#f0f0f0" width="400" height="300"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="#999">Offline - Image Not Available</text></svg>',
          { headers: { 'Content-Type': 'image/svg+xml' } }
        );
      })
    );
    return;
  }

  // Handle API and document requests with network-first strategy
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(RUNTIME_CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        return caches.match(request).then((response) => {
          return response || new Response('Offline - Resource not available', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
      })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(IMAGE_CACHE_NAME).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});
