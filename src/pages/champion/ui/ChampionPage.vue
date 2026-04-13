<template>
  <div class="champ-page">
    <div class="champ-page__container">
      <NuxtLink to="/" class="champ-page__back">&larr; Назад к поиску</NuxtLink>

      <div v-if="champion" class="champ-page__hero">
        <img
          :src="getChampionImageUrl(champion.id)"
          :alt="champion.name"
          class="champ-page__icon"
        />
        <div class="champ-page__info">
          <h1 class="champ-page__name">One Trick Ranking</h1>
          <p class="champ-page__title">{{ champion.name }}</p>
        </div>
      </div>

      <div class="champ-page__filters">
        <div class="champ-page__region-groups">
          <button
            v-for="group in regionGroups"
            :key="group.id"
            class="champ-page__group-tab"
            :class="{
              'champ-page__group-tab--active': selectedGroup === group.id,
            }"
            @click="selectGroup(group.id)"
          >
            {{ group.name }}
          </button>
        </div>

        <div class="champ-page__region-tabs">
          <button
            class="champ-page__region-tab"
            :class="{
              'champ-page__region-tab--active': selectedRegion === 'all',
            }"
            @click="selectRegion('all')"
          >
            All
          </button>
          <button
            v-for="region in currentRegions"
            :key="region"
            class="champ-page__region-tab"
            :class="{
              'champ-page__region-tab--active': selectedRegion === region,
            }"
            @click="selectRegion(region)"
          >
            {{ region.toUpperCase() }}
          </button>
        </div>
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
        <div class="champ-page__table-wrapper">
          <table class="champ-page__table">
            <thead>
              <tr>
                <th class="champ-page__th champ-page__th--rank" />
                <th class="champ-page__th champ-page__th--tier">Tier</th>
                <th class="champ-page__th">Player</th>
                <th class="champ-page__th champ-page__th--lp">LP &#9660;</th>
                <th class="champ-page__th champ-page__th--games">И</th>
                <th class="champ-page__th champ-page__th--wr">WR</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(player, index) in players"
                :key="player.puuid"
                class="champ-page__row"
                @click="openPlayerBuilds(player)"
              >
                <td class="champ-page__td champ-page__td--rank">
                  {{ index + 1 }}
                </td>
                <td class="champ-page__td champ-page__td--tier">
                  <img
                    :src="getRankedEmblemUrl(player.tier)"
                    :alt="player.tier"
                    class="champ-page__tier-icon"
                  />
                </td>
                <td class="champ-page__td champ-page__td--name">
                  <span class="champ-page__player-name">
                    {{ getPlayerName(player.gameName) }}
                  </span>
                  <span class="champ-page__player-tag">
                    #{{ getPlayerTag(player.gameName) }}
                  </span>
                </td>
                <td class="champ-page__td champ-page__td--lp">
                  {{ player.lp }} LP
                </td>
                <td class="champ-page__td champ-page__td--games">
                  {{ player.wins + player.losses }}
                </td>
                <td
                  class="champ-page__td champ-page__td--wr"
                  :class="{
                    'champ-page__td--high-wr': player.winRate >= 60,
                  }"
                >
                  {{ player.winRate }}%
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
          Не найдено OTP игроков на
          {{ champion?.name ?? championId }}.
        </p>
        <p class="champ-page__empty-hint">Попробуй другой регион.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { getChampionImageUrl, getRankedEmblemUrl } from '~/src/shared/config'
import type { RegionCode } from '~/src/shared/config'
import { CHAMPIONS } from '~/src/entities/champion'
import type { ChampionPlayersResponse, ChampionPlayer } from '~/src/shared/api'

interface RegionGroup {
  id: string
  name: string
  regions: RegionCode[]
}

interface PlayerWithRegion extends ChampionPlayer {
  playerRegion: RegionCode
}

const regionGroups: RegionGroup[] = [
  { id: 'major', name: 'Major', regions: ['kr', 'euw', 'na'] },
  {
    id: 'europe',
    name: 'Europe',
    regions: ['euw', 'eune', 'tr', 'ru'],
  },
  { id: 'asia', name: 'Asia', regions: ['kr', 'jp'] },
  {
    id: 'americas',
    name: 'Americas',
    regions: ['na', 'br', 'lan', 'las', 'oce'],
  },
]

const router = useRouter()
const route = useRoute()
const championId = route.params['id'] as string

const champion = CHAMPIONS.find(
  (c) => c.id.toLowerCase() === championId.toLowerCase(),
)

useHead({
  title: champion
    ? `${champion.name} — One Trick Ranking | LoL Tricks`
    : `${championId} — One Trick Ranking | LoL Tricks`,
})

const selectedGroup = ref('major')
const selectedRegion = ref<RegionCode | 'all'>('all')
const loading = ref(false)
const error = ref<string | null>(null)
const players = ref<PlayerWithRegion[] | null>(null)

const currentRegions = computed(() => {
  const group = regionGroups.find((g) => g.id === selectedGroup.value)
  return group?.regions ?? []
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
    return 'Сервер не успел ответить. Попробуй другой регион.'
  }
  return `Ошибка: ${error.value}`
})

function selectGroup(groupId: string): void {
  selectedGroup.value = groupId
  selectedRegion.value = 'all'
}

function selectRegion(region: RegionCode | 'all'): void {
  selectedRegion.value = region
}

function getPlayerName(gameName: string): string {
  return gameName.split('#')[0] ?? gameName
}

function getPlayerTag(gameName: string): string {
  return gameName.split('#')[1] ?? ''
}

async function fetchRegion(region: RegionCode): Promise<PlayerWithRegion[]> {
  const response = await $fetch<ChampionPlayersResponse>(
    '/api/riot/champion-players',
    {
      query: { champion: championId, region },
      timeout: 15000,
    },
  )
  return response.players.map((p) => ({ ...p, playerRegion: region }))
}

async function loadPlayers(): Promise<void> {
  loading.value = true
  error.value = null

  try {
    if (selectedRegion.value === 'all') {
      const regions = currentRegions.value
      const results = await Promise.allSettled(
        regions.map((r) => fetchRegion(r)),
      )

      const merged: PlayerWithRegion[] = []
      for (const result of results) {
        if (result.status === 'fulfilled') {
          merged.push(...result.value)
        }
      }

      const seen = new Set<string>()
      const unique = merged.filter((p) => {
        if (seen.has(p.puuid)) return false
        seen.add(p.puuid)
        return true
      })

      unique.sort((a, b) => b.lp - a.lp)
      players.value = unique.slice(0, 30)

      if (merged.length === 0) {
        const firstFailed = results.find((r) => r.status === 'rejected')
        if (firstFailed && firstFailed.status === 'rejected') {
          throw firstFailed.reason
        }
      }
    } else {
      players.value = await fetchRegion(selectedRegion.value)
    }
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

function openPlayerBuilds(player: PlayerWithRegion): void {
  router.push({
    path: `/champion/${championId}/player/${player.puuid}`,
    query: {
      region: player.playerRegion,
      name: player.gameName,
    },
  })
}

watch([selectedRegion, selectedGroup], () => {
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
  margin-bottom: 1.5rem;
}

.champ-page__icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid rgba(200, 155, 60, 0.4);
}

.champ-page__info {
  display: flex;
  flex-direction: column;
}

.champ-page__name {
  font-size: 1.6rem;
  font-weight: 800;
  color: #f0e6d2;
  line-height: 1.2;
}

.champ-page__title {
  font-size: 0.9rem;
  color: #6a6a7a;
}

/* Filters */
.champ-page__filters {
  margin-bottom: 1.5rem;
}

.champ-page__region-groups {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
}

.champ-page__group-tab {
  padding: 8px 18px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #6a6a7a;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.champ-page__group-tab:hover {
  color: #e0e0e0;
}

.champ-page__group-tab--active {
  background: #2563eb;
  color: #fff;
}

.champ-page__region-tabs {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.champ-page__region-tab {
  padding: 6px 14px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #6a6a7a;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.champ-page__region-tab:hover {
  color: #e0e0e0;
  border-color: rgba(255, 255, 255, 0.2);
}

.champ-page__region-tab--active {
  color: #e0e0e0;
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
}

/* Loading */
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

/* Table */
.champ-page__table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.champ-page__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.champ-page__th {
  text-align: left;
  padding: 10px 14px;
  color: #6a6a7a;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  white-space: nowrap;
}

.champ-page__th--rank {
  width: 36px;
  text-align: center;
}

.champ-page__th--tier {
  width: 50px;
  text-align: center;
}

.champ-page__th--lp {
  text-align: right;
}

.champ-page__th--games {
  text-align: center;
}

.champ-page__th--wr {
  text-align: right;
}

.champ-page__row {
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.champ-page__row:hover {
  background: rgba(255, 255, 255, 0.03);
}

.champ-page__td {
  padding: 10px 14px;
  white-space: nowrap;
}

.champ-page__td--rank {
  text-align: center;
  color: #6a6a7a;
  font-weight: 600;
}

.champ-page__td--tier {
  text-align: center;
}

.champ-page__tier-icon {
  width: 32px;
  height: 32px;
}

.champ-page__td--name {
  font-weight: 600;
}

.champ-page__player-name {
  color: #4a9eff;
}

.champ-page__player-tag {
  color: #6a6a7a;
  font-weight: 400;
  font-size: 0.85rem;
}

.champ-page__td--lp {
  text-align: right;
  font-weight: 600;
  color: #e0e0e0;
}

.champ-page__td--games {
  text-align: center;
  color: #8a8a9a;
}

.champ-page__td--wr {
  text-align: right;
  color: #8a8a9a;
}

.champ-page__td--high-wr {
  color: #4ec97a;
  font-weight: 600;
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
    font-size: 1.3rem;
  }

  .champ-page__icon {
    width: 44px;
    height: 44px;
  }

  .champ-page__group-tab {
    padding: 6px 12px;
    font-size: 0.8rem;
  }

  .champ-page__region-tab {
    padding: 5px 10px;
    font-size: 0.8rem;
  }

  .champ-page__td--games {
    display: none;
  }

  .champ-page__th--games {
    display: none;
  }
}
</style>
