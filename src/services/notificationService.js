/**
 * Service de notifications locales
 * Envoie des notifications navigateur quand l'utilisateur est sur le site
 */

/**
 * Demande la permission pour les notifications
 * @returns {Promise<boolean>} True si permission accordée
 */
export async function requestNotificationPermission() {
  // Vérifier si le navigateur supporte les notifications
  if (!('Notification' in window)) {
    console.warn('Les notifications ne sont pas supportées par ce navigateur')
    return false
  }

  // Si la permission est déjà accordée
  if (Notification.permission === 'granted') {
    return true
  }

  // Si la permission a déjà été refusée
  if (Notification.permission === 'denied') {
    return false
  }

  // Demander la permission
  try {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  } catch (error) {
    console.error('Erreur lors de la demande de permission:', error)
    return false
  }
}

/**
 * Envoie une notification locale
 * @param {string} title - Titre de la notification
 * @param {Object} options - Options de la notification
 */
export function sendLocalNotification(title, options = {}) {
  if (Notification.permission !== 'granted') {
    return
  }

  try {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    })

    // Fermer la notification après 5 secondes
    setTimeout(() => {
      notification.close()
    }, 5000)

    return notification
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error)
  }
}

/**
 * Envoie une notification basée sur l'état de la plante
 * @param {Object} plantState - État de la plante
 * @param {number} minutesElapsed - Minutes écoulées
 */
export function sendPlantStateNotification(plantState, minutesElapsed) {
  if (Notification.permission !== 'granted') {
    return
  }

  const notificationTexts = {
    0: {
      title: '🌱 Votre plante va bien!',
      body: 'Continuez à en prendre soin!'
    },
    1: {
      title: '💧 Votre plante commence à avoir soif',
      body: 'Pensez à cliquer sur "Drink Water" pour l\'hydrater!'
    },
    2: {
      title: '🥀 Votre plante se dessèche',
      body: 'Elle a besoin d\'eau rapidement! Buvez quelque chose!'
    },
    3: {
      title: '🌾 Urgence! Votre plante est en danger',
      body: 'Rendez-vous sur Hydro-plante et buvez maintenant!'
    },
    4: {
      title: '☠️ Votre plante est morte',
      body: 'Revenez à la vie. Restez hydraté et recommencez!'
    }
  }

  const text = notificationTexts[plantState.level] || notificationTexts[0]

  sendLocalNotification(text.title, {
    body: text.body,
    tag: 'plant-state',
    requireInteraction: plantState.level >= 3
  })
}

/**
 * Demande la permission de notification au chargement
 */
export async function initializeNotifications() {
  try {
    const hasPermission = await requestNotificationPermission()
    return hasPermission
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des notifications:', error)
    return false
  }
}
