<template>
  <div class="app-wrapper">
    <div class="app-container">
      <Header />

      <main class="main-content">
        <PlantDisplay :plant-info="plantInfo" :stats="stats" />
        <DrinkButton :is-dying="plantInfo.isDying" @drink="handleDrinkWater" />
      </main>
    </div>

    <footer class="footer">
      <p>Fait avec 💚 pour votre hydratation</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Header from './components/Header.vue'
import PlantDisplay from './components/PlantDisplay.vue'
import DrinkButton from './components/DrinkButton.vue'
import { getPlantInfo } from './services/plantService'
import { getLastDrinkTime, resetLastDrinkTime, getStats, incrementDrinkCount, incrementPlantDeathCount } from './services/storageService'
import { sendLocalNotification, initializeNotifications, sendPlantStateNotification } from './services/notificationService'
import { initializePushNotifications } from './services/pushService'

const plantInfo = ref({
  state: { level: 0, name: 'Sain', emoji: '🌱', color: '#10b981' },
  minutesElapsed: 0,
  minutesUntilNextState: 30,
  isDying: false,
  isHealthy: true
})
const stats = ref({
  todayDrinks: 0,
  totalDrinks: 0,
  plantsDied: 0
})

let updateInterval = null
let quickInterval = null
let lastNotificationState = null

// Initialiser les données
function initializeApp() {
  const lastDrinkTime = getLastDrinkTime()
  
  if (lastDrinkTime === null) {
    // Première visite, initialiser
    resetLastDrinkTime()
    updatePlantInfo()
  } else {
    updatePlantInfo()
  }

  stats.value = getStats()
  
  // NE PAS envoyer de notification au démarrage
  // Juste initialiser l'état pour la prochaine comparaison
  lastNotificationState = plantInfo.value.state.level
}

// Mettre à jour les infos de la plante
function updatePlantInfo() {
  const lastDrinkTime = getLastDrinkTime()
  plantInfo.value = getPlantInfo(lastDrinkTime)
  // checkForStateChange() sera appelée uniquement dans les intervals
}

// Vérifier si l'état a changé et envoyer une notification
function checkForStateChange() {
  const currentLevel = plantInfo.value.state.level

  // Si la plante est morte pour la première fois, enregistrer
  if (currentLevel === 4 && lastNotificationState !== 4) {
    incrementPlantDeathCount()
  }

  // Envoyer une notification si l'état a changé
  if (lastNotificationState !== currentLevel) {
    sendPlantStateNotification(plantInfo.value.state, plantInfo.value.minutesElapsed)
    lastNotificationState = currentLevel
  }
}

// Gérer le clic sur le bouton "Drink Water"
function handleDrinkWater() {
  resetLastDrinkTime()
  updatePlantInfo()
  incrementDrinkCount()
  stats.value = getStats()

  // Envoyer une notification positive
  sendLocalNotification('🎉 Bien joué!', {
    body: 'Tu as bu un verre d\'eau. Ta plante te remercie!'
  })

  // Animation du bouton
  const button = document.querySelector('.drink-button')
  if (button) {
    button.style.animation = 'none'
    setTimeout(() => {
      button.style.animation = ''
    }, 10)
  }
}

// Lifecycle hooks
onMounted(async () => {
  initializeApp()

  // Initialiser les notifications
  await initializeNotifications()
  await initializePushNotifications()

  // Mettre à jour chaque minute
  updateInterval = setInterval(() => {
    updatePlantInfo()
    checkForStateChange()
  }, 60000)

  // Aussi mettre à jour toutes les 5 secondes pour une meilleure réactivité en dev
  quickInterval = setInterval(() => {
    // Vérifier sans recalculer les notifications
    const lastDrinkTime = getLastDrinkTime()
    plantInfo.value = getPlantInfo(lastDrinkTime)
    checkForStateChange()
  }, 5000)
})

// Nettoyer les intervals au démontage
onUnmounted(() => {
  if (updateInterval) clearInterval(updateInterval)
  if (quickInterval) clearInterval(quickInterval)
})
</script>

<style scoped>
.app-wrapper {
  width: 100%;
  height: 100%;
  height: 100dvh;
  display: flex;
  flex-direction: column;
}

.app-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, #f0fdf4, #ffffff);
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: clamp(0.5rem, 2vw, 1.5rem);
  gap: clamp(0.75rem, 2vw, 1.5rem);
}

.footer {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  text-align: center;
  padding: clamp(0.75rem, 2vw, 1.25rem);
  flex-shrink: 0;
  width: 100%;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.footer p {
  margin: 0;
  font-size: clamp(0.85rem, 2vw, 1.1rem);
  opacity: 0.9;
}

@media (max-width: 640px) {
  .main-content {
    padding: 0.75rem;
    gap: 0.75rem;
  }

  .footer {
    padding: 0.75rem;
  }

  .footer p {
    font-size: 0.8rem;
  }
}

@media (min-width: 641px) {
  .main-content {
    padding: 2rem 1.5rem;
    gap: 2.5rem;
    justify-content: center;
  }

  .footer {
    padding: 1.25rem;
  }

  .footer p {
    font-size: 1rem;
  }
}
</style>
