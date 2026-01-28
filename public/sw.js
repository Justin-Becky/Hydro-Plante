/**
 * Service Worker pour Hydro-plante
 * Gère:
 * - Les notifications push
 * - La mise en cache
 * - Les rappels périodiques
 */

const CACHE_NAME = 'hydro-plante-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico'
]

// Installation du Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker installation...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache ouvert')
        // Mettre en cache uniquement les fichiers statiques
        return cache.addAll(urlsToCache).catch(err => {
          console.warn('Certains fichiers ne peuvent pas être mis en cache:', err)
        })
      })
      .catch(error => {
        console.error('Erreur lors du cache:', error)
      })
  )
  self.skipWaiting()
})

// Activation du Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker activé')
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression du cache ancien:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Récupération (fetch events)
self.addEventListener('fetch', event => {
  // Ignorer les requêtes non-GET
  if (event.request.method !== 'GET') {
    return
  }

  // Stratégie: Network first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Ne mettre en cache que les réponses valides
        if (!response || response.status !== 200 || response.type === 'error') {
          return response
        }

        // Cloner la réponse
        const responseToCache = response.clone()
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache)
          })
          .catch(() => {
            // Silence is golden
          })

        return response
      })
      .catch(() => {
        // Si le fetch échoue, utiliser le cache
        return caches.match(event.request)
          .then(response => {
            return response || new Response('Hors ligne', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            })
          })
      })
  )
})

// Gestion des notifications push
self.addEventListener('push', event => {
  console.log('Notification push reçue:', event)
  
  let data = {
    title: '💧 Hydro-plante',
    body: 'N\'oublie pas de boire de l\'eau!',
    icon: '/favicon.ico',
    badge: '/favicon.ico'
  }

  if (event.data) {
    try {
      data = event.data.json()
    } catch (e) {
      data.body = event.data.text()
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: 'hydro-plante-notification',
      requireInteraction: true
    })
  )
})

// Gestion du clic sur une notification
self.addEventListener('notificationclick', event => {
  console.log('Notification cliquée:', event)
  event.notification.close()
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Chercher si une fenêtre est déjà ouverte
      for (let client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus()
        }
      }
      // Sinon, ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})

// Gestion des messages depuis le client
self.addEventListener('message', event => {
  console.log('Message reçu du client:', event.data)

  if (event.data.type === 'SETUP_PERIODIC_REMINDER') {
    // Configuration des rappels périodiques
    setupPeriodicReminders(event.data.interval)
  }

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

/**
 * Configure les rappels périodiques (utilise l'API de tâches en arrière-plan si disponible)
 */
function setupPeriodicReminders(interval) {
  // Note: Cette fonction utiliserait normalement l'API Periodic Background Sync
  // qui nécessite un serveur backend. Pour maintenant, nous utilisons des intervalles
  // simples dans le client.

  console.log('Rappels périodiques configurés avec un intervalle de:', interval)

  // Envoyer une première notification de test
  self.registration.showNotification('🌱 Hydro-plante Active', {
    body: 'Tu recevras des rappels pour boire de l\'eau!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'hydro-plante-active'
  })
}

// Répondre aux requêtes de l'application
self.addEventListener('sync', event => {
  if (event.tag === 'sync-hydration-reminder') {
    event.waitUntil(
      self.registration.showNotification('💧 Rappel d\'hydratation', {
        body: 'N\'oublie pas de boire de l\'eau et de vérifier ta plante!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'hydro-reminder',
        requireInteraction: true
      })
    )
  }
})
