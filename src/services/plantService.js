/**
 * Service de gestion de l'état de la plante
 * Calcule l'état actuel basé sur le temps écoulé depuis le dernier "Drink Water"
 */

export const PLANT_STATES = {
  HEALTHY: {
    level: 0,
    name: 'Sain',
    emoji: '🌱',
    color: '#10b981',
    maxMinutes: 30
  },
  DRY_1: {
    level: 1,
    name: 'Légèrement desséché',
    emoji: '🥀',
    color: '#f59e0b',
    maxMinutes: 60
  },
  DRY_2: {
    level: 2,
    name: 'Modérément desséché',
    emoji: '🥀',
    color: '#f97316',
    maxMinutes: 90
  },
  DRY_3: {
    level: 3,
    name: 'Très desséché',
    emoji: '🌾',
    color: '#ef4444',
    maxMinutes: 120
  },
  DYING: {
    level: 4,
    name: 'Mouant',
    emoji: '☠️',
    color: '#7c2d12',
    maxMinutes: Infinity
  }
}

/**
 * Obtient l'état actuel de la plante basé sur le temps écoulé
 * @param {number} minutesElapsed - Nombre de minutes écoulées
 * @returns {Object} État de la plante
 */
export function getPlantState(minutesElapsed) {
  if (minutesElapsed < 30) {
    return PLANT_STATES.HEALTHY
  } else if (minutesElapsed < 60) {
    return PLANT_STATES.DRY_1
  } else if (minutesElapsed < 90) {
    return PLANT_STATES.DRY_2
  } else if (minutesElapsed < 120) {
    return PLANT_STATES.DRY_3
  } else {
    return PLANT_STATES.DYING
  }
}

/**
 * Calcule les minutes écoulées depuis un timestamp
 * @param {number} lastDrinkTimestamp - Timestamp du dernier "Drink Water" en ms
 * @returns {number} Minutes écoulées
 */
export function calculateMinutesElapsed(lastDrinkTimestamp) {
  if (!lastDrinkTimestamp) return 0
  const now = Date.now()
  const elapsedMs = now - lastDrinkTimestamp
  return Math.floor(elapsedMs / 60000) // Convertir ms en minutes
}

/**
 * Obtient l'état actuel et les infos complètes
 * @param {number} lastDrinkTimestamp - Timestamp du dernier "Drink Water"
 * @returns {Object} Infos complètes de la plante
 */
export function getPlantInfo(lastDrinkTimestamp) {
  const minutesElapsed = calculateMinutesElapsed(lastDrinkTimestamp)
  const state = getPlantState(minutesElapsed)
  const nextStateMinutes = getMinutesUntilNextState(minutesElapsed)

  return {
    state,
    minutesElapsed,
    minutesUntilNextState: nextStateMinutes,
    isDying: state.level === 4,
    isHealthy: state.level === 0
  }
}

/**
 * Calcule combien de minutes avant le prochain changement d'état
 * @param {number} minutesElapsed - Minutes écoulées
 * @returns {number} Minutes jusqu'au prochain état
 */
export function getMinutesUntilNextState(minutesElapsed) {
  const thresholds = [30, 60, 90, 120]
  for (const threshold of thresholds) {
    if (minutesElapsed < threshold) {
      return threshold - minutesElapsed
    }
  }
  return 0
}

/**
 * Obtient le prochain état après le courant
 * @param {Object} currentState - État actuel de la plante
 * @returns {Object|null} Prochain état ou null si c'est le dernier
 */
export function getNextState(currentState) {
  const states = [
    PLANT_STATES.HEALTHY,
    PLANT_STATES.DRY_1,
    PLANT_STATES.DRY_2,
    PLANT_STATES.DRY_3,
    PLANT_STATES.DYING
  ]
  const currentIndex = states.findIndex(s => s.level === currentState.level)
  if (currentIndex < states.length - 1) {
    return states[currentIndex + 1]
  }
  return null
}
