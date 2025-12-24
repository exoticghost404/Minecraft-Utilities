const CACHE_NAME = 'mc-utility-v15';

// Explicitly use relative paths for the cache list
const urlsToCache = [
  './',
  'index.html',
  'manifest.json',
  'index.tsx',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/1f7e9.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Add items individually so one failure doesn't break the whole cache
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
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch handler is required for the browser to show the "Install App" prompt
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request).then(fetchResponse => {
          // If the network request fails or returns an error, just return it
          if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
            return fetchResponse;
          }
          const responseToCache = fetchResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return fetchResponse;
        });
      }).catch(() => {
        // Fallback for navigation requests when offline
        if (event.request.mode === 'navigate') {
          return caches.match('index.html');
        }
      })
  );
});
