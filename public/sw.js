// Service Worker pour EPS Égalité - Version corrigée
const CACHE_NAME = 'eps-egal-v1';
const urlsToCache = [
  '/',
];

// Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - Ne cache que les GET requests
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-GET (POST, PUT, etc.)
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes vers manifest.json pour éviter les erreurs CORS
  if (event.request.url.includes('manifest.json')) {
    return;
  }

  // Ignorer les requêtes vers Supabase
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Ne cacher que les réponses valides
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
