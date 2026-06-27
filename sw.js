const VERSION = '12';
const CACHE_NAME = `mc-util-v${VERSION}`;
const ASSET_CACHE_NAME = `mc-util-assets-v${VERSION}`;

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/e.png'
];

const isCacheable = (req, res) => {
  if (req.method !== 'GET') return false;
  
  const validStatus = res.status === 200 || res.status === 0;
  const validTypes = ['basic', 'cors', 'opaque'];
  
  return validStatus && validTypes.includes(res.type);
};

self.addEventListener('install', event => {
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log(`[SW] Precaching app shell (v${VERSION})`);
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', event => {
  const allowedCaches = [CACHE_NAME, ASSET_CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!allowedCaches.includes(cacheName)) {
            console.log('[SW] Purging old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (event.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('index.html')) {
    event.respondWith(
      fetch(event.request)
        .then(networkRes => {
          if (networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
          }
          return networkRes;
        })
        .catch(() => {
          console.warn('[SW] Offline: Serving fallback index.html');
          return caches.match('/') || caches.match('/index.html');
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedRes => {
      if (cachedRes) {
        const isAsset = url.pathname.match(/\.(js|css|png|jpg|svg)$/) || url.hostname.includes('cdn');
        
        if (isAsset) {
          fetch(event.request)
            .then(networkRes => {
              if (isCacheable(event.request, networkRes)) {
                caches.open(ASSET_CACHE_NAME).then(cache => cache.put(event.request, networkRes));
              }
            })
            .catch(() => {});
        }
        return cachedRes;
      }

      return fetch(event.request).then(networkRes => {
        if (isCacheable(event.request, networkRes)) {
          const resClone = networkRes.clone();
          caches.open(ASSET_CACHE_NAME).then(cache => cache.put(event.request, resClone));
        }
        return networkRes;
      });
    })
  );
}); /* yall like looking at the code huh. too bad i scrambled it a bit until we meet again (get the refrence?) also since i have the funfact in my other project why not here :
this project was made after the mc utils project . and it has been in development since 10/1/2026 . The main thing i used the mc utils code as a template for this and it turned out great! */
