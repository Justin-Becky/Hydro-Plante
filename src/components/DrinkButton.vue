<template>
  <div class="button-container">
    <button 
      class="drink-button"
      :class="{ 'dying-button': isDying }"
      @click="handleDrinkClick"
      :disabled="isAnimating"
    >
      <span class="button-text">
        <span class="button-emoji">💧</span>
        {{ isDying ? 'Ramène ta plante à la vie!' : 'Drink Water' }}
      </span>
    </button>

    <p v-if="isDying" class="warning-text">
      Dépêche-toi! Ta plante dépend de toi!
    </p>

    <div class="tips">
      <p class="tip-title">💡 Conseil</p>
      <p class="tip-text">
        Clique sur le bouton régulièrement pour garder ta plante en bonne santé et rester hydraté!
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  isDying: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['drink'])

const isAnimating = ref(false)

const handleDrinkClick = async () => {
  isAnimating.value = true
  
  // Animer le clic
  await new Promise(resolve => setTimeout(resolve, 300))
  
  emit('drink')
  
  await new Promise(resolve => setTimeout(resolve, 300))
  isAnimating.value = false
}
</script>

<style scoped>
.button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(0.75rem, 2vw, 1rem);
  padding: clamp(0.75rem, 2vw, 1.5rem);
  max-width: 95vw;
  width: 100%;
  flex: 0 0 auto;
}

.drink-button {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: clamp(0.75rem, 2vw, 1.1rem) clamp(1.5rem, 4vw, 2.5rem);
  font-size: clamp(0.95rem, 2.2vw, 1.2rem);
  font-weight: 600;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: clamp(50px, 8vw, 65px);
  width: 100%;
  max-width: 550px;
}

.drink-button:hover:not(:disabled) {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
}

.drink-button:active:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 2px 10px rgba(59, 130, 246, 0.4);
}

.drink-button:disabled {
  opacity: 0.8;
  cursor: not-allowed;
}

.drink-button.dying-button {
  background: linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%);
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
  animation: pulse-urgent 1s ease-in-out infinite;
}

.drink-button.dying-button:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.6);
}

@keyframes pulse-urgent {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.button-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.button-emoji {
  font-size: clamp(1.2rem, 3vw, 1.5rem);
  animation: bounce 0.6s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.warning-text {
  margin: 0;
  color: #dc2626;
  font-weight: 600;
  font-size: clamp(0.8rem, 1.5vw, 1rem);
  text-align: center;
  animation: shake 0.5s ease-in-out infinite;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

.tips {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1));
  border-left: 3px solid #10b981;
  border-radius: 0.5rem;
  padding: clamp(0.75rem, 2vw, 1rem);
  width: 100%;
  max-width: 550px;
}

.tip-title {
  margin: 0 0 0.35rem 0;
  font-weight: 600;
  font-size: clamp(0.8rem, 1.6vw, 0.95rem);
  color: #10b981;
}

.tip-text {
  margin: 0;
  font-size: clamp(0.7rem, 1.3vw, 0.85rem);
  color: #4b5563;
  line-height: 1.5;
}
</style>
