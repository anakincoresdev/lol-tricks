<template>
  <div class="home-page">
    <section class="home-page__hero">
      <div class="home-page__hero-bg" />
      <div class="home-page__hero-content">
        <h1 class="home-page__title">{{ APP_NAME }}</h1>
        <p class="home-page__subtitle">{{ APP_DESCRIPTION }}</p>
        <div class="home-page__hero-search">
          <SearchInput
            v-model="heroSearch"
            placeholder="Найти чемпиона или игрока..."
          />
        </div>
        <div class="home-page__stats">
          <div class="home-page__stat">
            <span class="home-page__stat-value">{{ CHAMPIONS.length }}+</span>
            <span class="home-page__stat-label">Чемпионов</span>
          </div>
          <div class="home-page__stat">
            <span class="home-page__stat-value">11</span>
            <span class="home-page__stat-label">Регионов</span>
          </div>
          <div class="home-page__stat">
            <span class="home-page__stat-value">Masters+</span>
            <span class="home-page__stat-label">Только высшие ранги</span>
          </div>
        </div>
      </div>
    </section>

    <div class="home-page__container">
      <ChampionGrid />
      <TopPlayers :players="MOCK_TOP_PLAYERS" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { APP_NAME, APP_DESCRIPTION } from '~/src/shared/config'
import { SearchInput } from '~/src/shared/ui'
import { CHAMPIONS } from '~/src/entities/champion'
import { MOCK_TOP_PLAYERS } from '~/src/entities/player'
import { ChampionGrid } from '~/src/widgets/champion-grid'
import { TopPlayers } from '~/src/widgets/top-players'

useHead({
  title: `${APP_NAME} — Билды OTP игроков League of Legends`,
})

const heroSearch = ref('')
</script>

<style scoped>
.home-page__hero {
  position: relative;
  padding: 5rem 1.5rem 4rem;
  display: flex;
  justify-content: center;
  overflow: hidden;
}

.home-page__hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      ellipse at 50% 0%,
      rgba(200, 155, 60, 0.12) 0%,
      transparent 60%
    ),
    radial-gradient(
      ellipse at 80% 50%,
      rgba(100, 60, 180, 0.06) 0%,
      transparent 50%
    );
}

.home-page__hero-content {
  position: relative;
  text-align: center;
  max-width: 640px;
}

.home-page__title {
  font-size: 4rem;
  font-weight: 900;
  background: linear-gradient(135deg, #c89b3c 0%, #f0e6d2 50%, #c89b3c 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.75rem;
  letter-spacing: -0.02em;
}

.home-page__subtitle {
  font-size: 1.15rem;
  color: #8a8a9a;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.home-page__hero-search {
  display: flex;
  justify-content: center;
  margin-bottom: 2.5rem;
}

.home-page__stats {
  display: flex;
  justify-content: center;
  gap: 2.5rem;
  flex-wrap: wrap;
}

.home-page__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.home-page__stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #c89b3c;
}

.home-page__stat-label {
  font-size: 0.8rem;
  color: #6a6a7a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.home-page__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem 4rem;
}

@media (max-width: 640px) {
  .home-page__title {
    font-size: 2.5rem;
  }

  .home-page__stats {
    gap: 1.5rem;
  }

  .home-page__stat-value {
    font-size: 1.2rem;
  }
}
</style>
