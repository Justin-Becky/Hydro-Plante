<template>
  <div class="plant-display">
    <div class="plant-container">
      <div class="plant-visual" :style="{ color: plantInfo.state.color }">
        <span class="plant-emoji" :class="'level-' + plantInfo.state.level">
          {{ plantInfo.state.emoji }}
        </span>
      </div>

      <div class="plant-info">
        <h2 class="plant-status">{{ plantInfo.state.name }}</h2>
        <p class="plant-time">
          <span v-if="!plantInfo.isDying">
            ⏱️ {{ plantInfo.minutesElapsed }} minute{{ plantInfo.minutesElapsed > 1 ? 's' : '' }} écoulée{{ plantInfo.minutesElapsed > 1 ? 's' : '' }}
          </span>
          <span v-else class="dying-text">
            💔 Ta plante est décédée
          </span>
        </p>

        <div class="progress-container">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: progressPercentage + '%' }"
              :class="'progress-level-' + plantInfo.state.level"
            ></div>
          </div>
          <p class="progress-text">
            <span v-if="!plantInfo.isDying">
              Prochain changement: {{ plantInfo.minutesUntilNextState }} min
            </span>
            <span v-else class="dying-text">
              Recommence une nouvelle vie!
            </span>
          </p>
        </div>

        <div class="stats">
          <div class="stat-item">
            <span class="stat-label">Verres aujourd'hui:</span>
            <span class="stat-value">{{ stats.todayDrinks }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total:</span>
            <span class="stat-value">{{ stats.totalDrinks }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  plantInfo: {
    type: Object,
    required: true
  },
  stats: {
    type: Object,
    required: true
  }
})

const progressPercentage = computed(() => {
  if (props.plantInfo.isDying) {
    return 100
  }
  const totalMinutes = props.plantInfo.minutesElapsed + props.plantInfo.minutesUntilNextState
  return Math.round((props.plantInfo.minutesElapsed / totalMinutes) * 100) || 0
})
</script>

<style scoped>
.plant-display {
  background: white;
  border-radius: clamp(0.75rem, 2vw, 1.5rem);
  padding: clamp(1rem, 3vw, 2rem);
  margin: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  max-width: 95vw;
  width: 100%;
  max-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1 1 auto;
  min-height: 0;
}

.plant-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(0.75rem, 3vw, 1.5rem);
}

.plant-visual {
  position: relative;
  width: clamp(120px, 35vw, 240px);
  height: clamp(120px, 35vw, 240px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1));
  border-radius: 50%;
  animation: gentle-sway 3s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes gentle-sway {
  0%, 100% {
    transform: rotate(-2deg);
  }
  50% {
    transform: rotate(2deg);
  }
}

.plant-emoji {
  font-size: clamp(4rem, 25vw, 7rem);
  line-height: 1;
  animation: pulse-breathing 4s ease-in-out infinite;
}

.plant-emoji.level-0 {
  filter: brightness(1.2);
}

.plant-emoji.level-1,
.plant-emoji.level-2,
.plant-emoji.level-3 {
  filter: brightness(1) saturate(0.8);
}

.plant-emoji.level-4 {
  filter: grayscale(1) brightness(0.7);
}

@keyframes pulse-breathing {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.plant-info {
  text-align: center;
  width: 100%;
}

.plant-status {
  margin: 0 0 clamp(0.25rem, 1vw, 0.5rem) 0;
  font-size: clamp(1.2rem, 4vw, 1.8rem);
  font-weight: 600;
  color: #1f2937;
}

.plant-time {
  margin: 0 0 clamp(0.75rem, 2vw, 1.5rem) 0;
  font-size: clamp(0.8rem, 2vw, 1rem);
  color: #6b7280;
}

.dying-text {
  color: #dc2626;
  font-weight: 600;
}

.progress-container {
  margin: clamp(0.75rem, 2vw, 1.5rem) 0;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  transition: width 0.5s ease, background-color 0.3s ease;
  border-radius: 999px;
}

.progress-level-0 {
  background: #10b981;
}

.progress-level-1 {
  background: #f59e0b;
}

.progress-level-2 {
  background: #f97316;
}

.progress-level-3 {
  background: #ef4444;
}

.progress-level-4 {
  background: #7c2d12;
}

.progress-text {
  margin: 0;
  font-size: 0.85rem;
  color: #9ca3af;
}

.stats {
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.85rem;
  color: #9ca3af;
  text-transform: uppercase;
  font-weight: 600;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #10b981;
}

@media (max-width: 640px) {
  .plant-display {
    background: white;
    border-radius: 1rem;
    padding: 1.25rem;
    margin: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    max-width: 95vw;
    flex-shrink: 1;
  }

  .plant-container {
    gap: 1rem;
  }

  .plant-visual {
    width: 130px;
    height: 130px;
  }

  .plant-emoji {
    font-size: 3.5rem;
  }

  .plant-status {
    font-size: 1.3rem;
    margin: 0 0 0.5rem 0;
  }

  .plant-time {
    font-size: 0.9rem;
    margin: 0 0 1.25rem 0;
  }

  .progress-container {
    margin: 1.25rem 0;
  }

  .stats {
    gap: 1.5rem;
    margin-top: 1.25rem;
    padding-top: 1.25rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }
}

@media (min-width: 641px) {
  .plant-display {
    background: white;
    border-radius: 1.5rem;
    padding: 2rem;
    margin: 0;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    max-width: 700px;
    width: 90%;
  }

  .plant-container {
    gap: 2rem;
  }

  .plant-visual {
    width: 220px;
    height: 220px;
  }

  .plant-emoji {
    font-size: 6.5rem;
  }

  .plant-status {
    font-size: 2rem;
    margin: 0 0 0.75rem 0;
  }

  .plant-time {
    font-size: 1.1rem;
    margin: 0 0 1.5rem 0;
  }

  .progress-container {
    margin: 1.5rem 0;
  }

  .stats {
    gap: 3rem;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
  }

  .stat-value {
    font-size: 2rem;
  }
}
</style>
