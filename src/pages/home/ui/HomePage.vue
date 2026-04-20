<template>
  <div class="home-page dotted-bg">
    <div class="home-page__bg" aria-hidden="true">
      <img
        src="https://static0.gamerantimages.com/wordpress/wp-content/uploads/2024/11/league-of-legends-arcane-mini-game-future-shows.jpg?q=70&fit=crop&w=1600&h=1100&dpr=1"
        alt=""
        class="home-page__bg-img"
        referrerpolicy="no-referrer"
      />
      <div class="home-page__bg-tint" />
      <div class="home-page__bg-dots" />
      <div class="home-page__bg-fade" />
    </div>

    <section class="home-page__hero">
      <div class="home-page__hero-content">
        <span class="home-page__live mono">
          ⚡ LIVE · 18,422 МАТЧЕЙ СЕГОДНЯ
        </span>

        <h1 class="home-page__title display">
          <span class="home-page__title-line">Узнай, что</span>
          <span class="home-page__title-line">
            собирают
            <span class="glitch" data-text="лучшие">лучшие</span>
          </span>
          <span class="home-page__title-line home-page__title-line--accent">
            OTP игроки.
          </span>
        </h1>

        <p class="home-page__subcopy">
          Ищи чемпиона — получи топ-100 преданных мейнов со всех серверов,
          отсортированных по мастерству, играм и винрейту.
        </p>

        <div class="home-page__search">
          <SearchAutocomplete />
        </div>

        <p class="home-page__hint mono">
          ↳ ВВОДИ ИМЯ НА РУССКОМ ИЛИ АНГЛИЙСКОМ
        </p>

        <div class="home-page__popular">
          <span class="home-page__popular-label mono">↳ ПОПУЛЯРНЫЕ СЕЙЧАС</span>
          <div class="home-page__popular-list">
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
              <span class="mono home-page__popular-pct">
                +{{ trendPct(i) }}%
              </span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <div class="home-page__marquee mono">
      <span class="home-page__marquee-track">{{ marqueeText }}</span>
    </div>

    <section class="home-page__stats">
      <div class="home-page__stat stick home-page__stat--tilt-1">
        <span class="mono home-page__stat-kicker">ПРОИНДЕКСИРОВАНО</span>
        <span class="big-num home-page__stat-num home-page__stat-num--acid">
          1.2M
        </span>
        <span class="home-page__stat-label">отслеживаемых игроков</span>
      </div>
      <div class="home-page__stat stick home-page__stat--tilt-2">
        <span class="mono home-page__stat-kicker">РЕГИОНОВ</span>
        <span class="big-num home-page__stat-num home-page__stat-num--cyan">
          12
        </span>
        <span class="home-page__stat-label">кластеров серверов</span>
      </div>
      <div class="home-page__stat stick home-page__stat--tilt-3">
        <span class="mono home-page__stat-kicker">ЧЕМПИОНОВ</span>
        <span class="big-num home-page__stat-num home-page__stat-num--mag">
          168
        </span>
        <span class="home-page__stat-label">полностью проанализированы</span>
      </div>
      <div class="home-page__stat stick home-page__stat--tilt-1">
        <span class="mono home-page__stat-kicker">АПДЕЙТ</span>
        <span class="big-num home-page__stat-num home-page__stat-num--acid">
          3м
        </span>
        <span class="home-page__stat-label">интервал обновления</span>
      </div>
    </section>

    <section class="home-page__how">
      <h2 class="home-page__how-title display">
        Как работает индекс
        <span class="home-page__how-dot">.</span>
      </h2>
      <div class="home-page__how-cards">
        <div class="home-page__how-card stick">
          <span class="mono home-page__how-step">ШАГ 01</span>
          <span class="display home-page__how-card-title">Выбери чемпиона</span>
          <p class="home-page__how-card-body">
            Введи имя или кликни. Мы покажем каждого ранкед-игрока, который
            играет на нём как на основном.
          </p>
        </div>
        <div class="home-page__how-card stick">
          <span class="mono home-page__how-step">ШАГ 02</span>
          <span class="display home-page__how-card-title">
            Ранжируем по регионам
          </span>
          <p class="home-page__how-card-body">
            Топ-100 считается глобально — мастерство, недавние игры и вес LP.
          </p>
        </div>
        <div class="home-page__how-card stick">
          <span class="mono home-page__how-step">ШАГ 03</span>
          <span class="display home-page__how-card-title">Изучи билды</span>
          <p class="home-page__how-card-body">
            Погружайся в любого: порядок предметов, руны, матчапы, стрики и
            винрейты.
          </p>
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

const trendPcts = [12.4, 8.3, 6.1, 4.7, 3.9, 2.8, 1.6, 0.9]
function trendPct(i: number): string {
  return (trendPcts[i] ?? 0.5).toFixed(1)
}

const marqueeItems = [
  'Jinx +12.4%',
  'Yasuo META',
  'Ahri нерф близко',
  'Vayne изумрудный пик',
  'Thresh суп 1-трик',
  'KR челленджер +34%',
  'Патч 26.08 данные live',
  'Lee Sin джангл клир',
  'Lulu суп +8%',
]
const marqueeText = [...marqueeItems, ...marqueeItems].join('  ✦  ')
</script>

<style scoped>
.home-page {
  position: relative;
  overflow: hidden;
}

.home-page__bg {
  position: absolute;
  top: 0;
  right: 0;
  width: 62%;
  height: 860px;
  max-height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.home-page__bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center right;
  filter: saturate(1.15) contrast(1.05);
  mask-image: linear-gradient(
    90deg,
    transparent 0%,
    rgba(0, 0, 0, 0.6) 25%,
    #000 55%,
    #000 100%
  );
  -webkit-mask-image: linear-gradient(
    90deg,
    transparent 0%,
    rgba(0, 0, 0, 0.6) 25%,
    #000 55%,
    #000 100%
  );
}

.home-page__bg-tint {
  position: absolute;
  inset: 0;
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
}

.home-page__bg-dots {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(
    circle,
    rgba(198, 255, 61, 0.14) 1px,
    transparent 1px
  );
  background-size: 14px 14px;
  mix-blend-mode: overlay;
}

.home-page__bg-fade {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(10, 11, 15, 0.4) 0%,
    transparent 15%,
    transparent 70%,
    rgba(10, 11, 15, 1) 100%
  );
}

.home-page__hero {
  position: relative;
  padding: 72px 24px 56px;
  max-width: 1400px;
  margin: 0 auto;
  z-index: 1;
}

.home-page__hero-content {
  max-width: 720px;
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
  display: flex;
  flex-direction: column;
  gap: 0;
  font-family: 'Oswald', 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: clamp(60px, 8vw, 128px);
  line-height: 0.95;
  letter-spacing: -0.005em;
  text-transform: uppercase;
  color: var(--fg);
  margin-bottom: 28px;
  text-shadow: 0 2px 24px rgba(10, 11, 15, 0.8);
}

.home-page__title-line {
  display: inline-block;
}

.home-page__title-line--accent {
  color: var(--acid);
  text-shadow:
    0 2px 24px rgba(10, 11, 15, 0.8),
    0 0 40px rgba(198, 255, 61, 0.35);
}

.home-page__subcopy {
  font-size: 18px;
  color: var(--fg-dim);
  max-width: 560px;
  margin-bottom: 36px;
  line-height: 1.45;
}

.home-page__search {
  margin-bottom: 14px;
}

.home-page__hint {
  font-size: 11px;
  color: var(--fg-dim);
  letter-spacing: 0.15em;
  margin-bottom: 28px;
}

.home-page__popular {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.home-page__popular-label {
  font-size: 11px;
  color: var(--fg-dim);
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.home-page__popular-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

.home-page__popular-pct {
  font-size: 10px;
  color: var(--fg-dim);
}

.home-page__marquee {
  position: relative;
  z-index: 1;
  overflow: hidden;
  white-space: nowrap;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 10px 0;
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--fg);
  background: var(--bg);
}

.home-page__marquee-track {
  display: inline-block;
  animation: marquee 40s linear infinite;
  padding-left: 100%;
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

.home-page__stats {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 40px auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.home-page__stat {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-radius: 6px;
}

.home-page__stat--tilt-1 {
  transform: rotate(-2deg);
}
.home-page__stat--tilt-2 {
  transform: rotate(1.5deg);
}
.home-page__stat--tilt-3 {
  transform: rotate(-0.8deg);
}

.home-page__stat-kicker {
  font-size: 10px;
  color: var(--fg-dim);
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.home-page__stat-num {
  font-size: 56px;
}

.home-page__stat-num--acid {
  color: var(--acid);
}
.home-page__stat-num--cyan {
  color: var(--cyan);
}
.home-page__stat-num--mag {
  color: var(--mag);
}

.home-page__stat-label {
  font-size: 13px;
  color: var(--fg-dim);
}

.home-page__how {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 80px auto;
  padding: 0 24px;
}

.home-page__how-title {
  font-size: 48px;
  letter-spacing: -0.04em;
  margin-bottom: 40px;
  color: var(--fg);
}

.home-page__how-dot {
  color: var(--mag);
}

.home-page__how-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.home-page__how-card {
  padding: 24px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.home-page__how-step {
  font-size: 11px;
  color: var(--fg-dim);
  letter-spacing: 0.2em;
  margin-bottom: 8px;
}

.home-page__how-card-title {
  font-size: 24px;
  color: var(--fg);
}

.home-page__how-card-body {
  color: var(--fg-dim);
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .home-page__title {
    font-size: clamp(40px, 10vw, 72px);
  }

  .home-page__subcopy {
    font-size: 16px;
  }

  .home-page__stat-num {
    font-size: 44px;
  }

  .home-page__how-title {
    font-size: 32px;
  }
}
</style>
