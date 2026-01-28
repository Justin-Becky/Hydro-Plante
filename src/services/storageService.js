/**
 * Service de stockage local
 * Gère la persistence des données avec localStorage
 */

const STORAGE_KEY = 'hydro-plante-last-drink'
const STORAGE_STATS_KEY = 'hydro-plante-stats'

/**
 * Sauvegarde l'heure du dernier "Drink Water"
 * @param {number} timestamp - Timestamp en milliseconds
 */
export function saveLastDrinkTime(timestamp) {
  try {
    localStorage.setItem(STORAGE_KEY, timestamp.toString())
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du dernier verre:', error)
  }
}

/**
 * Récupère le timestamp du dernier "Drink Water"
 * @returns {number|null} Timestamp ou null si pas de données
 */
export function getLastDrinkTime() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? parseInt(stored, 10) : null
  } catch (error) {
    console.error('Erreur lors de la lecture du dernier verre:', error)
    return null
  }
}

/**
 * Réinitialise le dernier temps de consommation
 */
export function resetLastDrinkTime() {
  saveLastDrinkTime(Date.now())
}

/**
 * Récupère les statistiques de l'utilisateur
 * @returns {Object} Statistiques
 */
export function getStats() {
  try {
    const stats = localStorage.getItem(STORAGE_STATS_KEY)
    return stats ? JSON.parse(stats) : {
      totalDrinks: 0,
      todayDrinks: 0,
      lastReset: new Date().toDateString(),
      plantsDied: 0
    }
  } catch (error) {
    console.error('Erreur lors de la lecture des stats:', error)
    return {
      totalDrinks: 0,
      todayDrinks: 0,
      lastReset: new Date().toDateString(),
      plantsDied: 0
    }
  }
}

/**
 * Sauvegarde les statistiques
 * @param {Object} stats - Objet contenant les statistiques
 */
export function saveStats(stats) {
  try {
    localStorage.setItem(STORAGE_STATS_KEY, JSON.stringify(stats))
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des stats:', error)
  }
}

/**
 * Incrémente le compteur de verres aujourd'hui
 */
export function incrementDrinkCount() {
  const stats = getStats()
  const today = new Date().toDateString()

  // Réinitialiser le compteur quotidien si c'est un nouveau jour
  if (stats.lastReset !== today) {
    stats.todayDrinks = 0
    stats.lastReset = today
  }

  stats.todayDrinks += 1
  stats.totalDrinks += 1

  saveStats(stats)
  return stats
}

/**
 * Incrémente le compteur de plantes mortes
 */
export function incrementPlantDeathCount() {
  const stats = getStats()
  stats.plantsDied += 1
  saveStats(stats)
}

/**
 * Efface toutes les données
 */
export function clearAllData() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(STORAGE_STATS_KEY)
  } catch (error) {
    console.error('Erreur lors du nettoyage des données:', error)
  }
}
