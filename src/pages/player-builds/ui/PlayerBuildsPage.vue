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
  min-height: calc(100vh - 56px);
}

.builds-page__container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

.builds-page__back {
  display: inline-block;
  color: #6a6a7a;
  font-size: 0.9rem;
  text-decoration: none;
  margin-bottom: 1.5rem;
  transition: color 0.2s;
}

.builds-page__back:hover {
  color: #c89b3c;
}

.builds-page__hero {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 2rem;
}

.builds-page__champ-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 2px solid rgba(200, 155, 60, 0.4);
}

.builds-page__hero-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.builds-page__title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #f0e6d2;
  line-height: 1.2;
}

.builds-page__subtitle {
  font-size: 0.95rem;
  color: #6a6a7a;
}

.builds-page__mastery {
  font-size: 0.85rem;
  color: #c89b3c;
  margin-top: 4px;
}

.builds-page__mastery-level {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 600;
  color: #8a8a9a;
  background: rgba(255, 255, 255, 0.06);
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 4px;
}

.builds-page__loading {
  text-align: center;
  padding: 3rem 1rem;
  color: #8a8a9a;
}

.builds-page__spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(200, 155, 60, 0.15);
  border-top-color: #c89b3c;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.builds-page__loading-hint {
  font-size: 0.8rem;
  color: #5a5a6a;
  margin-top: 0.5rem;
}

.builds-page__error {
  padding: 12px 16px;
  background: rgba(224, 80, 80, 0.1);
  border: 1px solid rgba(224, 80, 80, 0.3);
  border-radius: 10px;
  color: #e05050;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.builds-page__results-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #8a8a9a;
  margin-bottom: 1rem;
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
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  transition: background 0.15s;
}

.builds-page__match:hover {
  background: rgba(255, 255, 255, 0.02);
}

.builds-page__match--win {
  background: rgba(78, 201, 122, 0.04);
  border-left: 3px solid #4ec97a;
}

.builds-page__match--loss {
  background: rgba(224, 80, 80, 0.04);
  border-left: 3px solid #e05050;
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
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
}

.builds-page__match-badge--win {
  background: rgba(78, 201, 122, 0.15);
  color: #4ec97a;
}

.builds-page__match-badge--loss {
  background: rgba(224, 80, 80, 0.15);
  color: #e05050;
}

.builds-page__match-duration {
  font-size: 0.7rem;
  color: #5a5a6a;
}

.builds-page__match-kda {
  display: flex;
  flex-direction: column;
  min-width: 80px;
}

.builds-page__kda-numbers {
  font-size: 0.95rem;
  font-weight: 700;
  color: #e0e0e0;
}

.builds-page__kda-ratio {
  font-size: 0.75rem;
  color: #6a6a7a;
}

.builds-page__match-cs {
  font-size: 0.85rem;
  color: #8a8a9a;
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
  border-radius: 4px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
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
  background: rgba(255, 255, 255, 0.03);
}

.builds-page__match-date {
  font-size: 0.8rem;
  color: #5a5a6a;
  margin-left: auto;
  white-space: nowrap;
}

.builds-page__empty {
  text-align: center;
  padding: 3rem 1rem;
  color: #5a5a6a;
}

.builds-page__empty-hint {
  font-size: 0.85rem;
  margin-top: 0.5rem;
  color: #4a4a5a;
}

@media (max-width: 640px) {
  .builds-page__title {
    font-size: 1.3rem;
  }

  .builds-page__champ-icon {
    width: 56px;
    height: 56px;
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
