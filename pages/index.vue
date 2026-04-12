<template>
  <div class="home">
    <header class="hero">
      <h1>Wallo</h1>
      <p class="subtitle">
        Билды, руны и предметы от лучших OTP игроков League of Legends
      </p>
    </header>
    <main class="content">
      <p>Платформа в разработке</p>
    </main>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Wallo — Главная',
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  background-color: #0a0a0f;
  color: #e0e0e0;
}

.hero {
  text-align: center;
  margin-bottom: 2rem;
}

.hero h1 {
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #c89b3c, #f0e6d2);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.2rem;
  color: #8a8a9a;
}

.content {
  font-size: 1rem;
  color: #5a5a6a;
}
</style>
