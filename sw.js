const CACHE_NAME = 'arcicards-v3';
const ASSETS_TO_CACHE = [
  'index.html',
  'manifest.json',
  'ArciCards.png',
  'ArciCards_small.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cachujem dôležité súbory aplikácie (v3)');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Mažem starú cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Sieťové požiadavky: Network-First stratégia pre index.html
self.addEventListener('fetch', event => {
  if (event.request.url.includes('api.groq.com')) {
    return;
  }

  // Ak ide o navigáciu na stránku (HTML), preferuj sieť, aby sa aktualizácia prejavila ihneď
  if (event.request.mode === 'navigate' || event.request.url.includes('index.html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Pre ostatné statické súbory použi Cache-First
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request);
      })
  );
});
