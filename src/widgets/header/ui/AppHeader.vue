<template>
  <header class="app-header">
    <div class="app-header__container">
      <NuxtLink to="/" class="app-header__logo">
        <span class="app-header__logo-icon">
          <span class="app-header__logo-triangle" />
        </span>
        <span class="app-header__logo-word">
          <span>lol</span>
          <span class="app-header__logo-dot">·</span>
          <span>tricks</span>
        </span>
      </NuxtLink>
      <span class="app-header__kicker mono">// ONE-TRICK INDEX v2.4</span>
      <nav class="app-header__nav">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="app-header__link mono"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
const navLinks = [{ to: '/', label: 'SEARCH' }]
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: color-mix(in oklab, var(--bg) 92%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
}

.app-header__container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-header__logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.app-header__logo-icon {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--acid);
  border-radius: 4px;
}

.app-header__logo-triangle {
  width: 16px;
  height: 16px;
  background: var(--bg);
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
}

.app-header__logo-word {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 20px;
  letter-spacing: -0.04em;
  color: var(--fg);
}

.app-header__logo-dot {
  color: var(--mag);
}

.app-header__kicker {
  font-size: 11px;
  color: var(--fg-dim);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.app-header__nav {
  display: flex;
  gap: 4px;
  align-items: center;
  margin-left: auto;
}

.app-header__link {
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--fg-dim);
  border-bottom: 2px solid transparent;
  text-decoration: none;
  transition: color 0.15s;
}

.app-header__link:hover {
  color: var(--fg);
}

.app-header__link.router-link-exact-active {
  color: var(--fg);
  border-bottom-color: var(--acid);
}

@media (max-width: 760px) {
  .app-header__kicker {
    display: none;
  }
}
</style>
