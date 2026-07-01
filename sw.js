const VERSION = '14';
const CACHE_NAME = `mc-util-v${VERSION}`;

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/e.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log(`[SW] Precaching app shell (v${VERSION})`);
      return cache.addAll(CORE_ASSETS);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('mc-util-') && name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Purging old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (event.request.mode === 'navigate' || url.pathname === '/') {
    event.respondWith(
      fetch(event.request)
        .then(networkRes => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkRes.clone());
            return networkRes;
          });
        })
        .catch(() => {
          console.warn('[SW] Offline: Serving fallback UI');
          return caches.match('/index.html');
        })
    );
    return;
  }

  const isAsset = 
    event.request.destination === 'style' || 
    event.request.destination === 'script' || 
    event.request.destination === 'image' ||
    url.hostname.includes('cdn.tailwindcss.com') ||
    url.hostname.includes('fonts.');

  if (isAsset) {
    event.respondWith(
      caches.match(event.request).then(cachedRes => {
        const fetchPromise = fetch(event.request).then(networkRes => {
          if (networkRes && networkRes.status === 200 && networkRes.type === 'basic') {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkRes.clone());
            });
          }
          return networkRes;
        }).catch(err => console.warn('[SW] Asset background fetch failed:', err.message));

        return cachedRes || fetchPromise;
      })
    );
  }
});
