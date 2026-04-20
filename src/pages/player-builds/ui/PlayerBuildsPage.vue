<template>
  <div class="builds-page">
    <div class="builds-page__container">
      <NuxtLink :to="`/champion/${championId}`" class="builds-page__back">
        &larr; Назад к игрокам
      </NuxtLink>

      <div v-if="champion" class="builds-page__hero">
        <img
          :src="getChampionImageUrl(champion.id)"
          :alt="champion.name"
          class="builds-page__champ-icon"
        />
        <div class="builds-page__hero-info">
          <h1 class="builds-page__title">
            {{ displayName }}
          </h1>
          <p class="builds-page__subtitle">Билды на {{ champion.name }}</p>
          <div
            v-if="data && data.masteryPoints > 0"
            class="builds-page__mastery"
          >
            <span class="builds-page__mastery-level">
              Lvl {{ data.masteryLevel }}
            </span>
            {{ formatMastery(data.masteryPoints) }} очков мастерства
          </div>
        </div>
      </div>

      <div v-if="loading" class="builds-page__loading">
        <div class="builds-page__spinner" />
        <p>Загружаем матчи...</p>
        <p class="builds-page__loading-hint">
          Анализируем последние игры на {{ champion?.name ?? championId }}
        </p>
      </div>

      <div v-if="error" class="builds-page__error">
        {{ errorMessage }}
      </div>

      <div
        v-if="data && data.matches.length > 0 && !loading"
        class="builds-page__results"
      >
        <h2 class="builds-page__results-title">
          Найдено {{ data.matches.length }} матчей
        </h2>

        <div class="builds-page__matches">
          <div
            v-for="match in data.matches"
            :key="match.matchId"
            class="builds-page__match"
            :class="
              match.win ? 'builds-page__match--win' : 'builds-page__match--loss'
            "
          >
            <div class="builds-page__match-result">
              <span
                class="builds-page__match-badge"
                :class="
                  match.win
                    ? 'builds-page__match-badge--win'
                    : 'builds-page__match-badge--loss'
                "
              >
                {{ match.win ? 'W' : 'L' }}
              </span>
              <span class="builds-page__match-duration">
                {{ formatDuration(match.gameDuration) }}
              </span>
            </div>

            <div class="builds-page__match-kda">
              <span class="builds-page__kda-numbers">
                {{ match.kills }}/{{ match.deaths }}/{{ match.assists }}
              </span>
              <span class="builds-page__kda-ratio">
                {{ formatKda(match.kills, match.deaths, match.assists) }}
                KDA
              </span>
            </div>

            <div class="builds-page__match-cs">{{ match.cs }} CS</div>

            <div class="builds-page__match-items">
              <div
                v-for="(item, idx) in match.items.slice(0, 6)"
                :key="idx"
                class="builds-page__item-slot"
              >
                <img
                  v-if="item > 0"
                  :src="getItemImageUrl(item)"
                  :alt="`Item ${item}`"
                  class="builds-page__item-icon"
                />
                <div v-else class="builds-page__item-empty" />
              </div>
              <div
                class="builds-page__item-slot builds-page__item-slot--trinket"
              >
                <img
                  v-if="match.items[6] && match.items[6] > 0"
                  :src="getItemImageUrl(match.items[6])"
                  alt="Trinket"
                  class="builds-page__item-icon"
                />
                <div v-else class="builds-page__item-empty" />
              </div>
            </div>

            <div class="builds-page__match-date">
              {{ formatDate(match.gameCreation) }}
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="data && data.matches.length === 0 && !loading"
        class="builds-page__empty"
      >
        <p>Нет недавних матчей на {{ champion?.name ?? championId }}.</p>
        <p class="builds-page__empty-hint">
          Игрок давно не играл на этом чемпионе в ранкеде.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getChampionImageUrl, getItemImageUrl } from '~/src/shared/config'
import { CHAMPIONS } from '~/src/entities/champion'
import { buildApiUrl } from '~/src/shared/api'
import type { PlayerChampionMatchesResponse } from '~/src/shared/api'

const route = useRoute()
const championId = route.params['id'] as string
const puuid = route.params['puuid'] as string
const region = (route.query['region'] as string) ?? 'euw'
const nameFromQuery = route.query['name'] as string | undefined

const champion = CHAMPIONS.find(
  (c) => c.id.toLowerCase() === championId.toLowerCase(),
)

const loading = ref(false)
const error = ref<string | null>(null)
const data = ref<PlayerChampionMatchesResponse | null>(null)

const displayName = computed(() => {
  if (data.value?.gameName && data.value.gameName !== 'Unknown') {
    return data.value.gameName
  }
  return nameFromQuery ?? 'Игрок'
})

useHead({
  title: computed(
    () => `${displayName.value} — ${champion?.name ?? championId} | LoL Tricks`,
  ),
})

const errorMessage = computed(() => {
  if (!error.value) return ''
  if (error.value.includes('403')) {
    return 'API ключ недействителен или истёк.'
  }
  if (error.value.includes('429')) {
    return 'Превышен лимит запросов. Подожди немного и попробуй снова.'
  }
  if (error.value.includes('504') || error.value.includes('timeout')) {
    return 'Сервер не успел ответить. Попробуй позже.'
  }
  return `Ошибка: ${error.value}`
})

function formatMastery(points: number): string {
  if (points >= 1_000_000) {
    return `${(points / 1_000_000).toFixed(1)}M`
  }
  if (points >= 1_000) {
    return `${Math.round(points / 1_000)}K`
  }
  return String(points)
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatKda(kills: number, deaths: number, assists: number): string {
  if (deaths === 0) return 'Perfect'
  return ((kills + assists) / deaths).toFixed(1)
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Сегодня'
  if (diffDays === 1) return 'Вчера'
  if (diffDays < 7) return `${diffDays} дн. назад`
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
}

async function loadMatches(): Promise<void> {
  loading.value = true
  error.value = null

  try {
    const response = await $fetch<PlayerChampionMatchesResponse>(
      buildApiUrl('/api/riot/player-champion-matches'),
      {
        query: {
          puuid,
          champion: championId,
          region,
        },
        timeout: 30000,
      },
    )
    data.value = response
  } catch (e: unknown) {
    const err = e as {
      data?: { statusMessage?: string; message?: string }
      statusMessage?: string
      message?: string
      status?: number
    }
    error.value =
      err.data?.statusMessage ??
      err.data?.message ??
      err.statusMessage ??
      err.message ??
      'Unknown error'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMatches()
})
</script>

<style scoped>
.builds-page {
  min-height: calc(100vh - 64px);
}

.builds-page__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 64px;
}

.builds-page__back {
  display: inline-block;
  color: var(--fg-dim);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  text-decoration: none;
  margin-bottom: 24px;
  transition: color 0.15s;
}

.builds-page__back:hover {
  color: var(--acid);
}

.builds-page__hero {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
}

.builds-page__champ-icon {
  width: 96px;
  height: 96px;
  border-radius: 4px;
  border: 2px solid var(--acid);
  flex-shrink: 0;
}

.builds-page__hero-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.builds-page__title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 48px;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
  color: var(--fg);
}

.builds-page__subtitle {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--fg-dim);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.builds-page__mastery {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--acid);
  margin-top: 4px;
  letter-spacing: 0.05em;
}

.builds-page__mastery-level {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  color: var(--bg);
  background: var(--acid);
  padding: 2px 6px;
  border-radius: 3px;
  margin-right: 6px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.builds-page__loading {
  text-align: center;
  padding: 48px 16px;
  color: var(--fg-dim);
}

.builds-page__spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--acid);
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.builds-page__loading-hint {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--fg-dim);
  margin-top: 8px;
}

.builds-page__error {
  padding: 12px 16px;
  background: color-mix(in oklab, var(--red) 10%, transparent);
  border: 1px solid var(--red);
  border-radius: 4px;
  color: var(--red);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  margin-bottom: 16px;
}

.builds-page__results-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  color: var(--fg-dim);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 16px;
}

.builds-page__matches {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.builds-page__match {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  transition: border-color 0.15s;
}

.builds-page__match:hover {
  border-color: var(--fg-dim);
}

.builds-page__match--win {
  border-left: 3px solid var(--acid);
}

.builds-page__match--loss {
  border-left: 3px solid var(--red);
}

.builds-page__match-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 44px;
}

.builds-page__match-badge {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 700;
}

.builds-page__match-badge--win {
  background: var(--acid);
  color: var(--bg);
}

.builds-page__match-badge--loss {
  background: var(--red);
  color: #fff;
}

.builds-page__match-duration {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--fg-dim);
  letter-spacing: 0.05em;
}

.builds-page__match-kda {
  display: flex;
  flex-direction: column;
  min-width: 80px;
}

.builds-page__kda-numbers {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 700;
  color: var(--fg);
  font-variant-numeric: tabular-nums;
}

.builds-page__kda-ratio {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--fg-dim);
}

.builds-page__match-cs {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--fg-dim);
  min-width: 50px;
}

.builds-page__match-items {
  display: flex;
  gap: 3px;
  align-items: center;
}

.builds-page__item-slot {
  width: 30px;
  height: 30px;
  border-radius: 3px;
  overflow: hidden;
  background: var(--bg);
}

.builds-page__item-slot--trinket {
  border-radius: 50%;
  margin-left: 4px;
}

.builds-page__item-icon {
  width: 100%;
  height: 100%;
  display: block;
}

.builds-page__item-empty {
  width: 100%;
  height: 100%;
  background: var(--bg);
}

.builds-page__match-date {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--fg-dim);
  letter-spacing: 0.05em;
  margin-left: auto;
  white-space: nowrap;
}

.builds-page__empty {
  text-align: center;
  padding: 48px 16px;
  color: var(--fg-dim);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.builds-page__empty-hint {
  font-size: 11px;
  margin-top: 8px;
  color: var(--fg-dim);
  opacity: 0.7;
}

@media (max-width: 640px) {
  .builds-page__title {
    font-size: 32px;
  }

  .builds-page__champ-icon {
    width: 64px;
    height: 64px;
  }

  .builds-page__match {
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px 12px;
  }

  .builds-page__match-cs {
    display: none;
  }

  .builds-page__match-date {
    width: 100%;
    text-align: right;
    margin-left: 0;
  }

  .builds-page__item-slot {
    width: 26px;
    height: 26px;
  }
}
</style>
