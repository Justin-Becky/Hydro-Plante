<template>
  <header class="header">
    <div class="header-content">
      <h1 class="header-title">🌱 Hydro-plante</h1>
      <p class="header-subtitle">Prends soin de ta plante, prends soin de toi!</p>
    </div>
  </header>
</template>

<script setup>
// Composant d'en-tête simple
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 1rem 0.75rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.header-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.header-subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 0.8rem;
  opacity: 0.95;
  font-weight: 300;
}

@media (min-width: 641px) {
  .header {
    padding: 2rem 1rem;
  }

  .header-title {
    font-size: 2.5rem;
  }

  .header-subtitle {
    font-size: 1.1rem;
    margin: 0.5rem 0 0 0;
  }
}
</style>
