<template>
  <header class="app-header">
    <div class="app-header__container">
      <NuxtLink to="/" class="app-header__logo">
        {{ APP_NAME }}
      </NuxtLink>
      <nav class="app-header__nav">
        <NuxtLink to="/" class="app-header__link">Главная</NuxtLink>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { APP_NAME } from '~/src/shared/config'
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: rgba(10, 10, 15, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(200, 155, 60, 0.15);
}

.app-header__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-header__logo {
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #c89b3c, #f0e6d2);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-decoration: none;
}

.app-header__nav {
  display: flex;
  gap: 1.5rem;
}

.app-header__link {
  color: #8a8a9a;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.app-header__link:hover,
.app-header__link.router-link-active {
  color: #f0e6d2;
}
</style>
