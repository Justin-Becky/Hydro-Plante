/**
 * Service pour les notifications push (Service Worker)
 * Gère l'enregistrement du Service Worker et les notifications push
 */

/**
 * Enregistre le Service Worker
 * @returns {Promise<ServiceWorkerRegistration|null>}
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Les Service Workers ne sont pas supportés par ce navigateur')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js')
    console.log('Service Worker enregistré avec succès:', registration)
    return registration
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du Service Worker:', error)
    return null
  }
}

/**
 * Envoie un message au Service Worker
 * @param {Object} message - Message à envoyer
 */
export async function sendMessageToServiceWorker(message) {
  if (!('serviceWorker' in navigator)) {
    return
  }

  try {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message)
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message au Service Worker:', error)
  }
}

/**
 * Configure les rappels périodiques via Service Worker
 * @param {number} intervalMinutes - Intervalle en minutes
 */
export async function setupPeriodicReminders(intervalMinutes = 30) {
  const registration = await registerServiceWorker()
  if (!registration) return

  try {
    // Envoyer un message au Service Worker pour configurer les rappels
    sendMessageToServiceWorker({
      type: 'SETUP_PERIODIC_REMINDER',
      interval: intervalMinutes * 60 * 1000 // Convertir en ms
    })
  } catch (error) {
    console.error('Erreur lors de la configuration des rappels périodiques:', error)
  }
}

/**
 * Demande la permission pour les notifications push
 * @returns {Promise<boolean>}
 */
export async function requestPushNotificationPermission() {
  if (!('Notification' in window)) {
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission === 'denied') {
    return false
  }

  try {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  } catch (error) {
    console.error('Erreur lors de la demande de permission push:', error)
    return false
  }
}

/**
 * Initialise les notifications push
 * @returns {Promise<void>}
 */
export async function initializePushNotifications() {
  const hasPermission = await requestPushNotificationPermission()
  if (!hasPermission) return

  await setupPeriodicReminders(30)
}
