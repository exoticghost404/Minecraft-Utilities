
const CACHE_NAME = 'mc-util-v9';
// We use absolute paths from the root of the domain to be safe on GitHub Pages
const BASE = '/Minecraft-Utilities/';
const urlsToCache = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'e.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Pre-caching core assets');
        return Promise.allSettled(
          urlsToCache.map(url => cache.add(url))
        );
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(networkResponse => {
          // Don't cache external API calls or non-basic responses
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        }).catch(() => {
          // If both fail and it's a navigation request, we could return a fallback but for now just fail
        });
      })
  );
});
