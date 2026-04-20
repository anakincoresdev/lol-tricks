<template>
  <div class="home-page dotted-bg">
    <section class="home-page__hero">
      <div class="home-page__hero-bg" />
      <div class="home-page__hero-content">
        <span class="home-page__live mono">
          ⚡ LIVE · 18,422 MATCHES INDEXED TODAY
        </span>
        <h1 class="home-page__title display">
          {{ APP_NAME }}
          <span class="home-page__title-dot">.</span>
        </h1>
        <p class="home-page__subtitle">
          Узнай, что собирают лучшие OTP игроки на твоём чемпионе
        </p>
        <div class="home-page__search">
          <SearchAutocomplete />
        </div>
        <p class="home-page__hint mono">
          ↳ Начни вводить имя чемпиона на русском или английском
        </p>
        <div class="home-page__popular">
          <span class="home-page__popular-label mono">Популярные:</span>
          <NuxtLink
            v-for="(champ, i) in popularChampions"
            :key="champ.id"
            :to="`/champion/${champ.id}`"
            class="home-page__popular-tag stick"
            :class="`home-page__popular-tag--tilt-${(i % 3) + 1}`"
          >
            <img
              :src="getChampionImageUrl(champ.id)"
              :alt="champ.name"
              class="home-page__popular-icon"
              loading="lazy"
            />
            <span class="display home-page__popular-name">
              {{ champ.name }}
            </span>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { APP_NAME, getChampionImageUrl } from '~/src/shared/config'
import { CHAMPIONS } from '~/src/entities/champion'
import { SearchAutocomplete } from '~/src/widgets/search-autocomplete'

useHead({
  title: `${APP_NAME} — Билды OTP игроков League of Legends`,
})

const popularIds = [
  'Yasuo',
  'Ahri',
  'Zed',
  'LeeSin',
  'Jinx',
  'Vayne',
  'Katarina',
  'Riven',
]
const popularChampions = CHAMPIONS.filter((c) => popularIds.includes(c.id))
</script>

<style scoped>
.home-page {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.home-page__hero {
  position: relative;
  padding: 72px 24px 56px;
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.home-page__hero-bg {
  position: absolute;
  top: 0;
  right: -10%;
  width: 70%;
  height: 100%;
  pointer-events: none;
  background:
    radial-gradient(
      ellipse at 75% 40%,
      rgba(255, 46, 166, 0.22) 0%,
      transparent 55%
    ),
    radial-gradient(
      ellipse at 95% 80%,
      rgba(34, 231, 255, 0.18) 0%,
      transparent 50%
    );
  mix-blend-mode: screen;
  mask-image: linear-gradient(90deg, transparent 0%, #000 35%, #000 100%);
  -webkit-mask-image: linear-gradient(
    90deg,
    transparent 0%,
    #000 35%,
    #000 100%
  );
}

.home-page__hero-content {
  position: relative;
  text-align: left;
  max-width: 720px;
  width: 100%;
  z-index: 1;
}

.home-page__live {
  display: inline-block;
  padding: 6px 12px;
  background: var(--mag);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 20px;
  transform: rotate(-2deg);
}

.home-page__title {
  font-size: clamp(48px, 6.5vw, 96px);
  line-height: 0.88;
  letter-spacing: -0.05em;
  color: var(--fg);
  margin-bottom: 24px;
}

.home-page__title-dot {
  color: var(--mag);
}

.home-page__subtitle {
  font-size: 18px;
  color: var(--fg-dim);
  max-width: 560px;
  margin-bottom: 36px;
  line-height: 1.45;
}

.home-page__search {
  margin-bottom: 16px;
}

.home-page__hint {
  font-size: 11px;
  color: var(--fg-dim);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 36px;
}

.home-page__popular {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.home-page__popular-label {
  font-size: 11px;
  color: var(--fg-dim);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-right: 4px;
}

.home-page__popular-tag {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px 8px 8px;
  border-radius: 999px;
  color: var(--fg);
  text-decoration: none;
  transition:
    transform 0.15s,
    border-color 0.15s;
}

.home-page__popular-tag:hover {
  transform: scale(1.05);
  border-color: var(--acid);
}

.home-page__popular-tag--tilt-1 {
  transform: rotate(-2deg);
}
.home-page__popular-tag--tilt-2 {
  transform: rotate(1.5deg);
}
.home-page__popular-tag--tilt-3 {
  transform: rotate(-0.8deg);
}
.home-page__popular-tag--tilt-1:hover {
  transform: rotate(-2deg) scale(1.05);
}
.home-page__popular-tag--tilt-2:hover {
  transform: rotate(1.5deg) scale(1.05);
}
.home-page__popular-tag--tilt-3:hover {
  transform: rotate(-0.8deg) scale(1.05);
}

.home-page__popular-icon {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  flex-shrink: 0;
}

.home-page__popular-name {
  font-size: 14px;
  font-weight: 600;
}

@media (max-width: 640px) {
  .home-page__title {
    font-size: clamp(40px, 10vw, 72px);
  }

  .home-page__subtitle {
    font-size: 16px;
  }
}
</style>
