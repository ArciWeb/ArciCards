const CACHE_NAME = 'arcicards-v2'; // Zmena verzie z v1 na v2 prinúti aplikáciu aktualizovať sa
const ASSETS_TO_CACHE = [
  'index.html',
  'manifest.json',
  'ArciCards.png',
  'ArciCards_small.png'
];

// Inštalácia service workera a cachovanie súborov
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cachujem dôležité súbory aplikácie');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Aktivácia service workera a mazanie starých cache
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

// Sieťové požiadavky: Cache First stratégia pre lokálne súbory, Network-Only pre API
self.addEventListener('fetch', event => {
  // Ignorovať volania na externé Groq API, tie musia ísť vždy live cez sieť
  if (event.request.url.includes('api.groq.com')) {
    return;
  }

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
