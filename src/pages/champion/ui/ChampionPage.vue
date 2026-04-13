<template>
  <div class="champ-page">
    <div class="champ-page__container">
      <div class="champ-page__header">
        <NuxtLink to="/" class="champ-page__back">
          &larr; Назад к поиску
        </NuxtLink>
        <div v-if="champion" class="champ-page__hero">
          <img
            :src="getChampionImageUrl(champion.id)"
            :alt="champion.name"
            class="champ-page__icon"
          />
          <div class="champ-page__info">
            <h1 class="champ-page__name">{{ champion.name }}</h1>
            <p class="champ-page__title">{{ champion.title }}</p>
          </div>
        </div>
      </div>

      <div class="champ-page__controls">
        <select v-model="selectedRegion" class="champ-page__select">
          <option v-for="r in REGIONS" :key="r.code" :value="r.code">
            {{ r.name }}
          </option>
        </select>
        <button
          class="champ-page__btn"
          :disabled="loading"
          @click="loadPlayers"
        >
          {{ loading ? 'Загрузка...' : 'Обновить' }}
        </button>
      </div>

      <div v-if="loading" class="champ-page__loading">
        <div class="champ-page__spinner" />
        <p>Ищем OTP игроков на {{ champion?.name ?? championId }}...</p>
        <p class="champ-page__loading-hint">
          Сканируем Challenger, Grandmaster и Master
        </p>
      </div>

      <div v-if="error" class="champ-page__error">
        {{ errorMessage }}
      </div>

      <div
        v-if="players && players.length > 0 && !loading"
        class="champ-page__results"
      >
        <h2 class="champ-page__results-title">
          Найдено {{ players.length }} игроков
        </h2>
        <div class="champ-page__table-wrapper">
          <table class="champ-page__table">
            <thead>
              <tr>
                <th class="champ-page__th champ-page__th--rank">#</th>
                <th class="champ-page__th">Игрок</th>
                <th class="champ-page__th">Ранг</th>
                <th class="champ-page__th">WR</th>
                <th class="champ-page__th">Мастерство</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(player, index) in players"
                :key="player.puuid"
                class="champ-page__row champ-page__row--clickable"
                @click="openPlayerBuilds(player)"
              >
                <td class="champ-page__td champ-page__td--rank">
                  {{ index + 1 }}
                </td>
                <td class="champ-page__td champ-page__td--name">
                  {{ player.gameName }}
                </td>
                <td class="champ-page__td">
                  <span
                    class="champ-page__rank-badge"
                    :class="getRankClass(player.tier)"
                  >
                    {{ player.tier }} {{ player.lp }} LP
                  </span>
                </td>
                <td
                  class="champ-page__td"
                  :class="player.winRate >= 60 ? 'champ-page__td--high-wr' : ''"
                >
                  {{ player.winRate }}%
                </td>
                <td class="champ-page__td champ-page__td--mastery">
                  <span class="champ-page__mastery-level">
                    Lvl {{ player.masteryLevel }}
                  </span>
                  {{ formatMastery(player.masteryPoints) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div
        v-if="players && players.length === 0 && !loading"
        class="champ-page__empty"
      >
        <p>
          Не найдено OTP игроков на {{ champion?.name ?? championId }} в регионе
          {{ selectedRegion.toUpperCase() }}.
        </p>
        <p class="champ-page__empty-hint">
          Попробуй другой регион — чемпион может быть популярнее в другом
          регионе.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { REGIONS, getChampionImageUrl } from '~/src/shared/config'
import type { RegionCode } from '~/src/shared/config'
import { CHAMPIONS } from '~/src/entities/champion'
import type { ChampionPlayersResponse, ChampionPlayer } from '~/src/shared/api'

const router = useRouter()

const route = useRoute()
const championId = route.params['id'] as string

const champion = CHAMPIONS.find(
  (c) => c.id.toLowerCase() === championId.toLowerCase(),
)

useHead({
  title: champion
    ? `${champion.name} — OTP игроки | LoL Tricks`
    : `${championId} — OTP игроки | LoL Tricks`,
})

const selectedRegion = ref<RegionCode>('euw')
const loading = ref(false)
const error = ref<string | null>(null)
const players = ref<ChampionPlayer[] | null>(null)

const errorMessage = computed(() => {
  if (!error.value) return ''
  if (error.value.includes('403')) {
    return 'API ключ недействителен или истёк.'
  }
  if (error.value.includes('429')) {
    return 'Превышен лимит запросов. Подожди немного и попробуй снова.'
  }
  if (error.value.includes('504') || error.value.includes('timeout')) {
    return 'Сервер не успел ответить. Попробуй другой регион.'
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

async function loadPlayers(): Promise<void> {
  loading.value = true
  error.value = null

  try {
    const response = await $fetch<ChampionPlayersResponse>(
      '/api/riot/champion-players',
      {
        query: {
          champion: championId,
          region: selectedRegion.value,
        },
        timeout: 15000,
      },
    )
    players.value = response.players
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

function getRankClass(tier: string): string {
  const lower = tier.toLowerCase()
  if (lower === 'challenger') return 'champ-page__rank-badge--challenger'
  if (lower === 'grandmaster') return 'champ-page__rank-badge--grandmaster'
  return 'champ-page__rank-badge--master'
}

function openPlayerBuilds(player: ChampionPlayer): void {
  router.push({
    path: `/champion/${championId}/player/${player.puuid}`,
    query: {
      region: selectedRegion.value,
      name: player.gameName,
    },
  })
}

watch(selectedRegion, () => {
  loadPlayers()
})

onMounted(() => {
  loadPlayers()
})
</script>

<style scoped>
.champ-page {
  min-height: calc(100vh - 56px);
}

.champ-page__container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

.champ-page__back {
  display: inline-block;
  color: #6a6a7a;
  font-size: 0.9rem;
  text-decoration: none;
  margin-bottom: 1.5rem;
  transition: color 0.2s;
}

.champ-page__back:hover {
  color: #c89b3c;
}

.champ-page__hero {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 2rem;
}

.champ-page__icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 2px solid rgba(200, 155, 60, 0.4);
}

.champ-page__info {
  display: flex;
  flex-direction: column;
}

.champ-page__name {
  font-size: 2rem;
  font-weight: 800;
  color: #f0e6d2;
  line-height: 1.2;
}

.champ-page__title {
  font-size: 0.95rem;
  color: #6a6a7a;
}

.champ-page__controls {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.champ-page__select {
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(200, 155, 60, 0.2);
  border-radius: 10px;
  color: #e0e0e0;
  font-size: 0.9rem;
  outline: none;
  cursor: pointer;
}

.champ-page__select:focus {
  border-color: rgba(200, 155, 60, 0.5);
}

.champ-page__select option {
  background: #1a1a2e;
  color: #e0e0e0;
}

.champ-page__btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #c89b3c, #a07830);
  border: none;
  border-radius: 10px;
  color: #0a0a0f;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.champ-page__btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #d4a84a, #b08838);
  transform: translateY(-1px);
}

.champ-page__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.champ-page__loading {
  text-align: center;
  padding: 3rem 1rem;
  color: #8a8a9a;
}

.champ-page__spinner {
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

.champ-page__loading-hint {
  font-size: 0.8rem;
  color: #5a5a6a;
  margin-top: 0.5rem;
}

.champ-page__error {
  padding: 12px 16px;
  background: rgba(224, 80, 80, 0.1);
  border: 1px solid rgba(224, 80, 80, 0.3);
  border-radius: 10px;
  color: #e05050;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.champ-page__results-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #8a8a9a;
  margin-bottom: 1rem;
}

.champ-page__table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid rgba(200, 155, 60, 0.15);
}

.champ-page__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.champ-page__th {
  text-align: left;
  padding: 12px 16px;
  color: #6a6a7a;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(200, 155, 60, 0.05);
  border-bottom: 1px solid rgba(200, 155, 60, 0.1);
  white-space: nowrap;
}

.champ-page__th--rank {
  width: 40px;
  text-align: center;
}

.champ-page__row {
  transition: background 0.15s;
}

.champ-page__row--clickable {
  cursor: pointer;
}

.champ-page__row:hover {
  background: rgba(200, 155, 60, 0.05);
}

.champ-page__td {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  white-space: nowrap;
}

.champ-page__td--rank {
  text-align: center;
  color: #6a6a7a;
  font-weight: 700;
}

.champ-page__td--name {
  font-weight: 600;
  color: #e0e0e0;
}

.champ-page__td--high-wr {
  color: #4ec97a;
  font-weight: 600;
}

.champ-page__td--mastery {
  color: #c89b3c;
  font-weight: 700;
}

.champ-page__mastery-level {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 600;
  color: #8a8a9a;
  background: rgba(255, 255, 255, 0.06);
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 6px;
}

.champ-page__rank-badge {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
}

.champ-page__rank-badge--challenger {
  color: #f0c040;
  background: rgba(240, 192, 64, 0.1);
}

.champ-page__rank-badge--grandmaster {
  color: #e05050;
  background: rgba(224, 80, 80, 0.1);
}

.champ-page__rank-badge--master {
  color: #b060e0;
  background: rgba(176, 96, 224, 0.1);
}

.champ-page__empty {
  text-align: center;
  padding: 3rem 1rem;
  color: #5a5a6a;
}

.champ-page__empty-hint {
  font-size: 0.85rem;
  margin-top: 0.5rem;
  color: #4a4a5a;
}

@media (max-width: 640px) {
  .champ-page__name {
    font-size: 1.5rem;
  }

  .champ-page__icon {
    width: 56px;
    height: 56px;
  }
}
</style>
