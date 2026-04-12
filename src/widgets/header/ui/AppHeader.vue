<template>
  <header class="app-header">
    <div class="app-header__container">
      <NuxtLink to="/" class="app-header__logo">{{ APP_NAME }}</NuxtLink>
      <nav class="app-header__nav">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="app-header__link"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { APP_NAME } from '~/src/shared/config'

const navLinks = [
  { to: '/', label: 'Главная' },
  { to: '/champions', label: 'Чемпионы' },
  { to: '/leaderboard', label: 'Рейтинг' },
]
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10, 10, 15, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(200, 155, 60, 0.1);
}

.app-header__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-header__logo {
  font-size: 1.35rem;
  font-weight: 800;
  background: linear-gradient(135deg, #c89b3c, #f0e6d2);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-decoration: none;
}

.app-header__nav {
  display: flex;
  gap: 0.25rem;
}

.app-header__link {
  padding: 6px 14px;
  color: #7a7a8a;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s;
}

.app-header__link:hover {
  color: #e0e0e0;
  background: rgba(255, 255, 255, 0.05);
}

.app-header__link.router-link-exact-active {
  color: #c89b3c;
  background: rgba(200, 155, 60, 0.1);
}
</style>
