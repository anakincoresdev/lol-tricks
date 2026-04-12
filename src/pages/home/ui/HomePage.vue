<template>
  <div class="home-page">
    <section class="home-page__hero">
      <h1 class="home-page__title">{{ APP_NAME }}</h1>
      <p class="home-page__subtitle">{{ APP_DESCRIPTION }}</p>
    </section>
    <section class="home-page__status">
      <p>Платформа в разработке</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { APP_NAME, APP_DESCRIPTION } from '~/src/shared/config'

useHead({
  title: `${APP_NAME} — Главная`,
})
</script>

<style scoped>
.home-page {
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.home-page__hero {
  text-align: center;
  margin-bottom: 2rem;
}

.home-page__title {
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #c89b3c, #f0e6d2);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.home-page__subtitle {
  font-size: 1.2rem;
  color: #8a8a9a;
}

.home-page__status {
  font-size: 1rem;
  color: #5a5a6a;
}
</style>
