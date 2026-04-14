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
                <th class="champ-page__th champ-page__th--rank">#</th>
                <th class="champ-page__th">Игрок</th>
                <th class="champ-page__th champ-page__th--center">Регион</th>
                <th class="champ-page__th champ-page__th--rank-col">Ранг</th>
                <th class="champ-page__th champ-page__th--games">Игры</th>
                <th class="champ-page__th champ-page__th--wr">WR</th>
                <th class="champ-page__th champ-page__th--runes">Руны</th>
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

                <td class="champ-page__td champ-page__td--name">
                  <div class="champ-page__player">
                    <span class="champ-page__player-name">
                      {{ getPlayerName(player.gameName) }}
                    </span>
                    <span class="champ-page__player-tag">
                      #{{ getPlayerTag(player.gameName) }}
                    </span>
                  </div>
                </td>

                <td class="champ-page__td champ-page__td--center">
                  <span class="champ-page__region-badge">
                    {{ player.playerRegion.toUpperCase() }}
                  </span>
                </td>

                <td class="champ-page__td champ-page__td--tier-cell">
                  <div class="champ-page__tier-cell">
                    <img
                      :src="getRankedEmblemUrl(player.tier)"
                      :alt="player.tier"
                      class="champ-page__tier-icon"
                    />
                    <div class="champ-page__tier-meta">
                      <span class="champ-page__tier-name">
                        {{ formatTier(player.tier) }}
                      </span>
                      <span class="champ-page__tier-lp">
                        {{ player.lp.toLocaleString('ru-RU') }} LP
                      </span>
                    </div>
                  </div>
                </td>

                <td class="champ-page__td champ-page__td--games">
                  <div class="champ-page__games">
                    <span class="champ-page__games-total">
                      {{ player.wins + player.losses }}
                    </span>
                    <span class="champ-page__games-wl">
                      <span class="champ-page__games-w">{{ player.wins }}В</span>
                      <span class="champ-page__games-sep">·</span>
                      <span class="champ-page__games-l">{{ player.losses }}П</span>
                    </span>
                  </div>
                </td>

                <td
                  class="champ-page__td champ-page__td--wr"
                  :class="{
                    'champ-page__td--high-wr': player.winRate >= 60,
                    'champ-page__td--low-wr': player.winRate < 50,
                  }"
                >
                  {{ player.winRate }}%
                </td>

                <td class="champ-page__td champ-page__td--runes">
                  <div v-if="player.runes" class="champ-page__runes">
                    <div
                      class="champ-page__rune champ-page__rune--primary"
                      :title="`Keystone ${player.runes.keystone}`"
                    >
                      <img
                        :src="getKeystoneIconUrl(player.runes.keystone)"
                        alt="Keystone"
                        class="champ-page__rune-icon"
                      />
                    </div>
                    <div
                      v-if="player.runes.secondaryStyle"
                      class="champ-page__rune champ-page__rune--secondary"
                      :title="`Secondary ${player.runes.secondaryStyle}`"
                    >
                      <img
                        :src="getRuneStyleIconUrl(player.runes.secondaryStyle)"
                        alt="Secondary tree"
                        class="champ-page__rune-icon champ-page__rune-icon--small"
                      />
                    </div>
                  </div>
                  <span v-else class="champ-page__runes-empty">—</span>
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
import {
  getChampionImageUrl,
  getRankedEmblemUrl,
  getKeystoneIconUrl,
  getRuneStyleIconUrl,
} from '~/src/shared/config'
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

function formatTier(tier: string): string {
  if (!tier) return ''
  const t = tier.toLowerCase()
  const labels: Record<string, string> = {
    challenger: 'Challenger',
    grandmaster: 'Grandmaster',
    master: 'Master',
    diamond: 'Diamond',
    emerald: 'Emerald',
    platinum: 'Platinum',
    gold: 'Gold',
    silver: 'Silver',
    bronze: 'Bronze',
    iron: 'Iron',
  }
  return labels[t] ?? tier
}

const runtime = useRuntimeConfig()
const apiBase = (runtime.public['apiBase'] as string) || ''

async function fetchRegion(region: RegionCode): Promise<PlayerWithRegion[]> {
  const url = apiBase
    ? `${apiBase}/api/riot/champion-players`
    : '/api/riot/champion-players'
  const response = await $fetch<ChampionPlayersResponse>(url, {
    query: { champion: championId, region },
    timeout: 15000,
  })
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
  max-width: 1080px;
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
  background: rgba(255, 255, 255, 0.015);
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
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.02);
}

.champ-page__th--rank {
  width: 44px;
  text-align: center;
}

.champ-page__th--center {
  text-align: center;
  width: 80px;
}

.champ-page__th--rank-col {
  width: 180px;
}

.champ-page__th--games {
  text-align: center;
  width: 110px;
}

.champ-page__th--wr {
  text-align: right;
  width: 70px;
}

.champ-page__th--runes {
  text-align: center;
  width: 88px;
}

.champ-page__row {
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.champ-page__row:last-child {
  border-bottom: none;
}

.champ-page__row:hover {
  background: rgba(200, 155, 60, 0.04);
}

.champ-page__td {
  padding: 12px 16px;
  vertical-align: middle;
  white-space: nowrap;
}

.champ-page__td--rank {
  text-align: center;
  color: #6a6a7a;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.champ-page__td--center {
  text-align: center;
}

.champ-page__player {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.champ-page__player-name {
  color: #4a9eff;
  font-weight: 600;
}

.champ-page__player-tag {
  color: #5a5a6a;
  font-weight: 400;
  font-size: 0.78rem;
  margin-top: 2px;
}

.champ-page__region-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  background: rgba(200, 155, 60, 0.1);
  color: #c89b3c;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.champ-page__tier-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.champ-page__tier-icon {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
}

.champ-page__tier-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.champ-page__tier-name {
  color: #e0e0e0;
  font-weight: 600;
  font-size: 0.85rem;
}

.champ-page__tier-lp {
  color: #8a8a9a;
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
}

.champ-page__td--games {
  text-align: center;
}

.champ-page__games {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.15;
}

.champ-page__games-total {
  color: #e0e0e0;
  font-weight: 600;
  font-size: 0.9rem;
  font-variant-numeric: tabular-nums;
}

.champ-page__games-wl {
  font-size: 0.72rem;
  color: #6a6a7a;
  margin-top: 2px;
  font-variant-numeric: tabular-nums;
}

.champ-page__games-w {
  color: #4ec97a;
}

.champ-page__games-l {
  color: #e06868;
}

.champ-page__games-sep {
  margin: 0 3px;
  color: #3a3a4a;
}

.champ-page__td--wr {
  text-align: right;
  color: #8a8a9a;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.champ-page__td--high-wr {
  color: #4ec97a;
}

.champ-page__td--low-wr {
  color: #e06868;
}

.champ-page__td--runes {
  text-align: center;
}

.champ-page__runes {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.champ-page__rune {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
}

.champ-page__rune--primary {
  width: 32px;
  height: 32px;
  border: 1px solid rgba(200, 155, 60, 0.3);
}

.champ-page__rune--secondary {
  width: 20px;
  height: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.champ-page__rune-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.champ-page__rune-icon--small {
  width: 70%;
  height: 70%;
}

.champ-page__runes-empty {
  color: #3a3a4a;
  font-size: 0.9rem;
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

@media (max-width: 820px) {
  .champ-page__th--runes,
  .champ-page__td--runes {
    display: none;
  }

  .champ-page__th--games,
  .champ-page__td--games {
    width: auto;
  }

  .champ-page__games-wl {
    display: none;
  }
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

  .champ-page__th,
  .champ-page__td {
    padding: 10px 10px;
  }

  .champ-page__th--center,
  .champ-page__td--center {
    display: none;
  }

  .champ-page__tier-meta {
    display: none;
  }
}
</style>
