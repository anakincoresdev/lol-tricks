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
        <span class="app-header__kicker mono">{{ t('header.kicker') }}</span>
      </NuxtLink>

      <nav class="app-header__nav">
        <NuxtLink to="/" class="app-header__link mono">
          {{ t('header.nav.search') }}
        </NuxtLink>
        <a href="#" class="app-header__link mono app-header__link--ghost">
          {{ t('header.nav.tops') }}
        </a>
        <a
          href="#"
          class="app-header__link mono app-header__link--ghost app-header__link--hide-mobile"
        >
          {{ t('header.nav.builds') }}
        </a>
        <a
          href="#"
          class="app-header__link mono app-header__link--ghost app-header__link--hide-mobile"
        >
          {{ t('header.nav.meta') }}
        </a>

        <div
          class="app-header__lang"
          role="group"
          :aria-label="t('langSwitch.label')"
        >
          <button
            v-for="loc in availableLocales"
            :key="loc.code"
            class="app-header__lang-btn mono"
            :class="{
              'app-header__lang-btn--active': locale === loc.code,
            }"
            :aria-pressed="locale === loc.code"
            @click="switchLocale(loc.code)"
          >
            {{ loc.code.toUpperCase() }}
          </button>
        </div>

        <button class="app-header__signin mono">
          {{ t('header.signIn') }}
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n, useSwitchLocalePath } from '#imports'

const { t, locale, locales, setLocale } = useI18n()
const switchLocalePath = useSwitchLocalePath()

interface NamedLocale {
  code: string
  name?: string
}

const availableLocales = computed<NamedLocale[]>(() => {
  const list = locales.value as unknown as NamedLocale[]
  return list.map((l) => ({ code: l.code, name: l.name }))
})

async function switchLocale(code: string): Promise<void> {
  // `setLocale` persists the choice via the i18n cookie and keeps
  // SSR + client in sync without a full page reload. `switchLocalePath`
  // is only needed for prefixed strategies; we use `no_prefix`, so a
  // direct `setLocale` is enough.
  void switchLocalePath
  await setLocale(code as 'en' | 'ru')
}
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
  justify-content: space-between;
  gap: 16px;
}

.app-header__logo {
  display: inline-flex;
  align-items: center;
  gap: 12px;
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
}

.app-header__link {
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--fg);
  border-bottom: 2px solid transparent;
  text-decoration: none;
  transition: color 0.15s;
}

.app-header__link--ghost {
  color: var(--fg-dim);
}

.app-header__link--ghost:hover {
  color: var(--fg);
}

.app-header__link:hover {
  color: var(--fg);
}

.app-header__link.router-link-exact-active {
  color: var(--fg);
  border-bottom-color: var(--acid);
}

.app-header__lang {
  display: inline-flex;
  margin-left: 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow: hidden;
}

.app-header__lang-btn {
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--fg-dim);
  background: transparent;
  border: none;
  cursor: pointer;
  transition:
    color 0.15s,
    background 0.15s;
}

.app-header__lang-btn + .app-header__lang-btn {
  border-left: 1px solid var(--border);
}

.app-header__lang-btn:hover {
  color: var(--fg);
}

.app-header__lang-btn--active {
  background: var(--acid);
  color: var(--bg);
}

.app-header__signin {
  margin-left: 8px;
  padding: 8px 14px;
  background: var(--acid);
  color: var(--bg);
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-radius: 4px;
  transition: opacity 0.15s;
}

.app-header__signin:hover {
  opacity: 0.85;
}

@media (max-width: 900px) {
  .app-header__kicker {
    display: none;
  }
}

@media (max-width: 640px) {
  .app-header__link--hide-mobile {
    display: none;
  }

  .app-header__container {
    padding: 12px 16px;
  }
}
</style>
