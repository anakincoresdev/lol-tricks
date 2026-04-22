<template>
  <footer class="app-footer">
    <div class="app-footer__container">
      <div class="app-footer__left">
        <NuxtLink to="/" class="app-footer__logo">
          <span class="app-footer__logo-icon">
            <span class="app-footer__logo-triangle" />
          </span>
          <span class="app-footer__logo-word">
            <span>lol</span>
            <span class="app-footer__logo-dot">·</span>
            <span>tricks</span>
          </span>
        </NuxtLink>
        <span class="app-footer__copy mono">{{ t('footer.copy') }}</span>
      </div>
      <nav class="app-footer__links mono">
        <NuxtLink to="/privacy" class="app-footer__link">
          {{ t('footer.links.privacy') }}
        </NuxtLink>
        <span class="app-footer__sep" aria-hidden="true">·</span>
        <NuxtLink to="/terms" class="app-footer__link">
          {{ t('footer.links.terms') }}
        </NuxtLink>
      </nav>
      <span class="app-footer__build mono">{{ t('footer.build') }}</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from '#imports'
const { t } = useI18n()
</script>

<style scoped>
.app-footer {
  border-top: 1px solid var(--border);
  margin-top: 64px;
  padding: 32px 24px;
}

.app-footer__container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.app-footer__left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.app-footer__logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.app-footer__logo-icon {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--acid);
  border-radius: 4px;
}

.app-footer__logo-triangle {
  width: 16px;
  height: 16px;
  background: var(--bg);
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
}

.app-footer__logo-word {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 20px;
  letter-spacing: -0.04em;
  color: var(--fg);
}

.app-footer__logo-dot {
  color: var(--mag);
}

.app-footer__copy,
.app-footer__build {
  font-size: 11px;
  color: var(--fg-dim);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.app-footer__links {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.app-footer__link {
  color: var(--fg-dim);
  text-decoration: none;
  transition: color 0.15s;
}

.app-footer__link:hover {
  color: var(--acid);
}

.app-footer__sep {
  color: var(--border);
}
</style>
