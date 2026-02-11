/**
 * Hydro-Plante — Service Worker
 * Cache-first pour les assets locaux, network-first pour l'API GitHub.
 * Sync différée : rejoue la mise à jour GitHub quand la connexion revient.
 */

var CACHE_NAME = 'hydro-plante-v3';

var ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/script.js',
  '/style.css',
  '/manifest.json',
  // Style "normale" (toujours disponible)
  '/images/normale.png',
  '/images/icon.png',
  // Note : "fannée.png" contient un accent — géré par le fetch handler si absent
  // Styles débloqués à 7 jours
  '/images/normale_1.png',
  '/images/fantastique_1.png',
  '/images/fantastique_2.png',
  '/images/normale_2.png',
  // Images fanée/morte des nouveaux styles — décommentez quand vous les ajoutez
  // '/images/fanee_normale_1.png',
  // '/images/morte_normale_1.png',
  // '/images/fanee_fantastique_1.png',
  // '/images/morte_fantastique_1.png',
];

// Installation : mise en cache de tous les assets
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      // addAll échoue si un fichier est absent — on gère les erreurs individuellement
      return Promise.all(
        ASSETS_TO_CACHE.map(function (url) {
          return cache.add(url).catch(function () {
            // Silencieusement ignorer les assets manquants (ex. images de stade pas encore créées)
          });
        })
      );
    })
  );
  self.skipWaiting();
});

// Activation : supprimer les anciens caches
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (k) { return k !== CACHE_NAME; })
          .map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch : stratégie selon la destination
self.addEventListener('fetch', function (e) {
  var url;
  try { url = new URL(e.request.url); } catch (err) { return; }

  // API GitHub → network-first, pas de cache
  if (url.hostname === 'api.github.com') {
    e.respondWith(
      fetch(e.request).catch(function () {
        return new Response(JSON.stringify({ error: 'offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Assets locaux → cache-first, mise en cache des nouvelles ressources
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      if (cached) return cached;
      return fetch(e.request).then(function (response) {
        if (response && response.ok) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      }).catch(function () {
        // Pas de cache et pas de réseau : retourner une réponse vide
        return new Response('', { status: 503 });
      });
    })
  );
});
