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

        <div class="champ-page__role-tabs">
          <button
            v-for="role in ROLES"
            :key="role.id"
            class="champ-page__role-tab"
            :class="{
              'champ-page__role-tab--active': selectedRole === role.id,
            }"
            @click="selectedRole = role.id"
          >
            {{ role.name }}
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
        v-if="
          players &&
          players.length > 0 &&
          filteredSortedPlayers.length > 0 &&
          !loading
        "
        class="champ-page__results"
      >
        <div class="champ-page__table-wrapper">
          <table class="champ-page__table">
            <thead>
              <tr>
                <th class="champ-page__th champ-page__th--rank">#</th>
                <th class="champ-page__th">Игрок</th>
                <th class="champ-page__th champ-page__th--center">Регион</th>
                <th
                  class="champ-page__th champ-page__th--rank-col champ-page__th--sortable"
                  :class="{
                    'champ-page__th--active': sortKey === 'lp',
                  }"
                  @click="toggleSort('lp')"
                >
                  Ранг{{ sortIndicator('lp') }}
                </th>
                <th
                  class="champ-page__th champ-page__th--games champ-page__th--sortable"
                  :class="{
                    'champ-page__th--active': sortKey === 'games',
                  }"
                  @click="toggleSort('games')"
                >
                  Игры{{ sortIndicator('games') }}
                </th>
                <th
                  class="champ-page__th champ-page__th--wr champ-page__th--sortable"
                  :class="{
                    'champ-page__th--active': sortKey === 'winRate',
                  }"
                  @click="toggleSort('winRate')"
                >
                  WR{{ sortIndicator('winRate') }}
                </th>
                <th class="champ-page__th champ-page__th--runes">Руны</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(player, index) in filteredSortedPlayers"
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
                    {{ (player.region ?? '').toUpperCase() }}
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
                      <span class="champ-page__games-w">
                        {{ player.wins }}В
                      </span>
                      <span class="champ-page__games-sep">·</span>
                      <span class="champ-page__games-l">
                        {{ player.losses }}П
                      </span>
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

      <div
        v-if="
          players &&
          players.length > 0 &&
          filteredSortedPlayers.length === 0 &&
          !loading
        "
        class="champ-page__empty"
      >
        <p>Нет игроков с этой ролью в выборке.</p>
        <p class="champ-page__empty-hint">
          Попробуй выбрать «Все» или другой лайн.
        </p>
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
  ROLES,
} from '~/src/shared/config'
import type { RegionCode, RoleId } from '~/src/shared/config'
import { CHAMPIONS } from '~/src/entities/champion'
import { buildApiUrl } from '~/src/shared/api'
import type {
  ChampionPlayersResponse,
  ChampionPlayersMultiResponse,
  ChampionPlayer,
} from '~/src/shared/api'

type SortKey = 'lp' | 'winRate' | 'games'
type SortDir = 'asc' | 'desc'

interface RegionGroup {
  id: string
  name: string
  regions: RegionCode[]
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
const selectedRole = ref<RoleId>('all')
const sortKey = ref<SortKey>('lp')
const sortDir = ref<SortDir>('desc')
const loading = ref(false)
const error = ref<string | null>(null)
const players = ref<ChampionPlayer[] | null>(null)

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

async function fetchRegion(region: RegionCode): Promise<ChampionPlayer[]> {
  const response = await $fetch<ChampionPlayersResponse>(
    buildApiUrl('/api/riot/champion-players'),
    {
      query: { champion: championId, region },
      timeout: 45000,
    },
  )
  return response.players.map((p) => ({ ...p, region: p.region ?? region }))
}

async function fetchMulti(regions: RegionCode[]): Promise<ChampionPlayer[]> {
  const response = await $fetch<ChampionPlayersMultiResponse>(
    buildApiUrl('/api/riot/champion-players/multi'),
    {
      query: { champion: championId, regions: regions.join(',') },
      timeout: 60000,
    },
  )
  return response.allPlayers
}

const filteredSortedPlayers = computed<ChampionPlayer[]>(() => {
  if (!players.value) return []
  const filtered =
    selectedRole.value === 'all'
      ? players.value
      : players.value.filter((p) => p.position === selectedRole.value)
  const dir = sortDir.value === 'asc' ? 1 : -1
  const key = sortKey.value
  return [...filtered].sort((a, b) => {
    if (key === 'games') {
      return dir * (a.wins + a.losses - (b.wins + b.losses))
    }
    return dir * (a[key] - b[key])
  })
})

function toggleSort(key: SortKey): void {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'desc'
  }
}

function sortIndicator(key: SortKey): string {
  if (sortKey.value !== key) return ''
  return sortDir.value === 'asc' ? ' ↑' : ' ↓'
}

async function loadPlayers(): Promise<void> {
  loading.value = true
  error.value = null

  try {
    if (selectedRegion.value === 'all') {
      const all = await fetchMulti(currentRegions.value)

      const seen = new Set<string>()
      const unique = all.filter((p) => {
        if (seen.has(p.puuid)) return false
        seen.add(p.puuid)
        return true
      })

      unique.sort((a, b) => b.lp - a.lp)
      players.value = unique.slice(0, 30)
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

function openPlayerBuilds(player: ChampionPlayer): void {
  router.push({
    path: `/champion/${championId}/player/${player.puuid}`,
    query: {
      region: player.region ?? '',
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
  min-height: calc(100vh - 64px);
}

.champ-page__container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px 64px;
}

.champ-page__back {
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

.champ-page__back:hover {
  color: var(--acid);
}

.champ-page__hero {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
}

.champ-page__icon {
  width: 112px;
  height: 112px;
  border-radius: 4px;
  border: 2px solid var(--acid);
  flex-shrink: 0;
  transform: rotate(-2deg);
}

.champ-page__info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.champ-page__name {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--fg-dim);
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.champ-page__title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 72px;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 0.9;
  color: var(--fg);
}

/* Filters */
.champ-page__filters {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.champ-page__region-groups {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.champ-page__group-tab {
  padding: 6px 14px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--fg);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.1s;
}

.champ-page__group-tab:hover {
  border-color: var(--cyan);
  color: var(--cyan);
}

.champ-page__group-tab--active {
  background: var(--cyan);
  border-color: var(--cyan);
  color: var(--bg);
}

.champ-page__region-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.champ-page__region-tab {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--fg);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.1s;
}

.champ-page__region-tab:hover {
  border-color: var(--acid);
  color: var(--acid);
}

.champ-page__region-tab--active {
  background: var(--acid);
  border-color: var(--acid);
  color: var(--bg);
}

.champ-page__role-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.champ-page__role-tab {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--fg);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.1s;
}

.champ-page__role-tab:hover {
  border-color: var(--mag);
  color: var(--mag);
}

.champ-page__role-tab--active {
  background: var(--mag);
  border-color: var(--mag);
  color: #fff;
}

/* Loading */
.champ-page__loading {
  text-align: center;
  padding: 48px 16px;
  color: var(--fg-dim);
}

.champ-page__spinner {
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

.champ-page__loading-hint {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--fg-dim);
  margin-top: 8px;
}

.champ-page__error {
  padding: 12px 16px;
  background: color-mix(in oklab, var(--red) 10%, transparent);
  border: 1px solid var(--red);
  border-radius: 4px;
  color: var(--red);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  margin-bottom: 16px;
}

/* Table */
.champ-page__table-wrapper {
  overflow-x: auto;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: var(--surface);
}

.champ-page__table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
}

.champ-page__th {
  text-align: left;
  padding: 10px 14px;
  color: var(--fg-dim);
  font-weight: 600;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
  background: var(--bg);
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

.champ-page__th--sortable {
  cursor: pointer;
  user-select: none;
  transition: color 0.15s;
}

.champ-page__th--sortable:hover {
  color: var(--acid);
}

.champ-page__th--active {
  color: var(--acid);
}

.champ-page__th--runes {
  text-align: center;
  width: 88px;
}

.champ-page__row {
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid var(--border);
}

.champ-page__row:last-child {
  border-bottom: none;
}

.champ-page__row:hover {
  background: var(--bg-2);
}

.champ-page__td {
  padding: 14px 14px;
  vertical-align: middle;
  white-space: nowrap;
}

.champ-page__td--rank {
  text-align: center;
  color: var(--fg-dim);
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
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: var(--fg);
}

.champ-page__player-tag {
  color: var(--fg-dim);
  font-weight: 400;
  font-size: 11px;
  margin-top: 2px;
}

.champ-page__region-badge {
  display: inline-block;
  padding: 2px 8px;
  border: 1px solid var(--border);
  border-radius: 3px;
  color: var(--fg);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
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
  color: var(--fg);
  font-weight: 600;
  font-size: 12px;
}

.champ-page__tier-lp {
  color: var(--fg-dim);
  font-size: 11px;
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
  color: var(--fg);
  font-weight: 600;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.champ-page__games-wl {
  font-size: 10px;
  color: var(--fg-dim);
  margin-top: 2px;
  font-variant-numeric: tabular-nums;
}

.champ-page__games-w {
  color: var(--acid);
}

.champ-page__games-l {
  color: var(--red);
}

.champ-page__games-sep {
  margin: 0 3px;
  color: var(--border);
}

.champ-page__td--wr {
  text-align: right;
  color: var(--fg);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.champ-page__td--high-wr {
  color: var(--acid);
}

.champ-page__td--low-wr {
  color: var(--red);
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
  background: var(--bg);
  border-radius: 50%;
}

.champ-page__rune--primary {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border);
}

.champ-page__rune--secondary {
  width: 20px;
  height: 20px;
  border: 1px solid var(--border);
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
  color: var(--border);
  font-size: 14px;
}

.champ-page__empty {
  text-align: center;
  padding: 48px 16px;
  color: var(--fg-dim);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.champ-page__empty-hint {
  font-size: 11px;
  margin-top: 8px;
  color: var(--fg-dim);
  opacity: 0.7;
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
  .champ-page__title {
    font-size: 40px;
  }

  .champ-page__icon {
    width: 72px;
    height: 72px;
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
