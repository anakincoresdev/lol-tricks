<template>
  <div class="home-page">
    <section class="home-page__hero">
      <div class="home-page__hero-bg" />
      <div class="home-page__hero-content">
        <h1 class="home-page__title">{{ APP_NAME }}</h1>
        <p class="home-page__subtitle">
          Узнай, что собирают лучшие OTP игроки на твоём чемпионе
        </p>
        <div class="home-page__search">
          <SearchAutocomplete />
        </div>
        <p class="home-page__hint">
          Начни вводить имя чемпиона на русском или английском
        </p>
        <div class="home-page__popular">
          <span class="home-page__popular-label">Популярные:</span>
          <NuxtLink
            v-for="champ in popularChampions"
            :key="champ.id"
            :to="`/champion/${champ.id}`"
            class="home-page__popular-tag"
          >
            <img
              :src="getChampionImageUrl(champ.id)"
              :alt="champ.name"
              class="home-page__popular-icon"
              loading="lazy"
            />
            {{ champ.name }}
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
  min-height: calc(100vh - 56px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-page__hero {
  position: relative;
  padding: 2rem 1.5rem;
  display: flex;
  justify-content: center;
  width: 100%;
}

.home-page__hero-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(
      ellipse at 50% 30%,
      rgba(200, 155, 60, 0.08) 0%,
      transparent 60%
    ),
    radial-gradient(
      ellipse at 80% 60%,
      rgba(100, 60, 180, 0.04) 0%,
      transparent 50%
    );
  pointer-events: none;
}

.home-page__hero-content {
  position: relative;
  text-align: center;
  max-width: 640px;
  width: 100%;
}

.home-page__title {
  font-size: 4.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #c89b3c 0%, #f0e6d2 50%, #c89b3c 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.75rem;
  letter-spacing: -0.02em;
}

.home-page__subtitle {
  font-size: 1.2rem;
  color: #8a8a9a;
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

.home-page__search {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.home-page__hint {
  font-size: 0.8rem;
  color: #4a4a5a;
  margin-bottom: 3rem;
}

.home-page__popular {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.home-page__popular-label {
  font-size: 0.8rem;
  color: #5a5a6a;
  margin-right: 4px;
}

.home-page__popular-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px 5px 5px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(200, 155, 60, 0.12);
  border-radius: 20px;
  color: #b0b0c0;
  font-size: 0.82rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}

.home-page__popular-tag:hover {
  background: rgba(200, 155, 60, 0.1);
  border-color: rgba(200, 155, 60, 0.3);
  color: #f0e6d2;
}

.home-page__popular-icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
}

@media (max-width: 640px) {
  .home-page__title {
    font-size: 2.8rem;
  }

  .home-page__subtitle {
    font-size: 1rem;
  }
}
</style>
