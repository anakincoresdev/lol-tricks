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
          <span class="champ-page__kicker mono">
            ONE-TRICK INDEX · {{ champion.roles[0]?.toUpperCase() }}
          </span>
          <h1 class="champ-page__title display">{{ champion.name }}</h1>
          <div class="champ-page__chips">
            <span class="chip chip--acid">ТОП-100 · ГЛОБАЛЬНО · 60Д</span>
            <span v-if="heroStats" class="chip">
              СРЕД. WR НА ЧЕМПЕ {{ heroStats.avgWr }}%
            </span>
            <span v-if="heroStats" class="chip">
              СРЕД. ИГР НА ЧЕМПЕ {{ heroStats.avgGames }}
            </span>
            <span v-if="qualityMixLabel" class="chip chip--cyan">
              {{ qualityMixLabel }}
            </span>
          </div>
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
          <div class="champ-page__table-head">
            <div class="champ-page__table-title display">
              Leaderboard
              <span class="champ-page__table-count mono">
                / {{ filteredSortedPlayers.length }} из {{ players.length }}
              </span>
            </div>
            <div class="champ-page__table-actions">
              <button class="champ-page__table-btn mono">EXPORT CSV</button>
              <button class="champ-page__table-btn mono">⚡ LIVE</button>
            </div>
          </div>
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
                    'champ-page__th--active': sortKey === 'championGames',
                  }"
                  title="Игры на чемпе за 60 дней"
                  @click="toggleSort('championGames')"
                >
                  Игры{{ sortIndicator('championGames') }}
                </th>
                <th
                  class="champ-page__th champ-page__th--wr champ-page__th--sortable"
                  :class="{
                    'champ-page__th--active': sortKey === 'championWinRate',
                  }"
                  title="Винрейт на чемпе за 60 дней"
                  @click="toggleSort('championWinRate')"
                >
                  WR{{ sortIndicator('championWinRate') }}
                </th>
                <th
                  class="champ-page__th champ-page__th--share champ-page__th--sortable"
                  :class="{
                    'champ-page__th--active': sortKey === 'championShare',
                  }"
                  title="Доля игр на чемпе от общего пула"
                  @click="toggleSort('championShare')"
                >
                  Пул{{ sortIndicator('championShare') }}
                </th>
                <th class="champ-page__th champ-page__th--quality">Тип</th>
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
                      {{ player.championGames }}
                    </span>
                    <span class="champ-page__games-wl">
                      <span class="champ-page__games-w">
                        {{ player.championWins }}В
                      </span>
                      <span class="champ-page__games-sep">·</span>
                      <span class="champ-page__games-l">
                        {{ player.championLosses }}П
                      </span>
                    </span>
                  </div>
                </td>

                <td
                  class="champ-page__td champ-page__td--wr"
                  :class="{
                    'champ-page__td--high-wr': player.championWinRate >= 60,
                    'champ-page__td--low-wr': player.championWinRate < 50,
                  }"
                >
                  {{ player.championWinRate }}%
                </td>

                <td class="champ-page__td champ-page__td--share">
                  {{ player.championShare }}%
                </td>

                <td class="champ-page__td champ-page__td--quality">
                  <span
                    class="champ-page__quality"
                    :class="`champ-page__quality--${player.quality}`"
                    :title="qualityTooltip(player.quality)"
                  >
                    {{ QUALITY_LABEL[player.quality] }}
                  </span>
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
import { ref, computed, onMounted } from 'vue'
import {
  getChampionImageUrl,
  getRankedEmblemUrl,
  ROLES,
} from '~/src/shared/config'
import type { RegionCode, RoleId } from '~/src/shared/config'
import { CHAMPIONS } from '~/src/entities/champion'
import { api, ApiError } from '~/src/shared/api'
import type { ChampionPlayerGlobal, PlayerQuality } from '~/src/shared/api'

// Sort keys map 1:1 onto ChampionPlayerGlobal numeric fields, so we can
// index into the record without a switch statement.
type SortKey = 'lp' | 'championWinRate' | 'championGames' | 'championShare'
type SortDir = 'asc' | 'desc'

interface RegionGroup {
  id: string
  name: string
  regions: RegionCode[]
}

// /global returns data across all tracked regions (currently euw/na/kr
// per HANDOFF). Region groups stay as pure client-side filters, so
// non-tracked regions (eune/tr/ru/jp/br/lan/las/oce) will correctly
// render as empty until backend coverage expands.
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

const QUALITY_LABEL: Record<PlayerQuality, string> = {
  main: 'Main',
  regular: 'Regular',
  casual: 'Casual',
  trial: 'Trial',
}

const QUALITY_TOOLTIP: Record<PlayerQuality, string> = {
  main: '≥30 игр в ranked solo за 60 дней, ≥20% пула, WR > 50%',
  regular: '≥10 игр, ≥10% пула, WR > 50%',
  casual: '≥5 игр на чемпе (любая доля и WR)',
  trial: '2–4 игры на чемпе — фолбэк для редких пиков',
}

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
const players = ref<ChampionPlayerGlobal[] | null>(null)
const qualityMix = ref<Partial<Record<PlayerQuality, number>>>({})

const currentRegions = computed(() => {
  const group = regionGroups.find((g) => g.id === selectedGroup.value)
  return group?.regions ?? []
})

const errorMessage = computed(() => {
  if (!error.value) return ''
  if (error.value.includes('429')) {
    return 'Превышен лимит запросов. Подожди немного и попробуй снова.'
  }
  if (error.value.includes('504') || error.value.includes('timeout')) {
    return 'Сервер не успел ответить. Попробуй ещё раз.'
  }
  return `Ошибка: ${error.value}`
})

const qualityMixLabel = computed<string>(() => {
  const mix = qualityMix.value
  const parts: string[] = []
  const order: PlayerQuality[] = ['main', 'regular', 'casual', 'trial']
  for (const q of order) {
    const n = mix[q] ?? 0
    if (n > 0) parts.push(`${QUALITY_LABEL[q]} ${n}`)
  }
  return parts.join(' · ')
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

// Argmax over the five-role counter from /global. Ties break in template
// order (top → support), which matches how Riot paints primary roles.
type BackendRoleId = Exclude<RoleId, 'all'>

function primaryRole(
  roles: ChampionPlayerGlobal['roles'],
): BackendRoleId | null {
  const entries: [BackendRoleId, number][] = [
    ['top', roles.top],
    ['jungle', roles.jungle],
    ['mid', roles.mid],
    ['adc', roles.adc],
    ['support', roles.support],
  ]
  let best: BackendRoleId | null = null
  let bestCount = 0
  for (const [id, count] of entries) {
    if (count > bestCount) {
      best = id
      bestCount = count
    }
  }
  return best
}

function qualityTooltip(q: PlayerQuality): string {
  return QUALITY_TOOLTIP[q]
}

const heroStats = computed<{ avgWr: number; avgGames: number } | null>(() => {
  if (!players.value || players.value.length === 0) {
    return null
  }
  const total = players.value.length
  const wrSum = players.value.reduce((s, p) => s + p.championWinRate, 0)
  const gamesSum = players.value.reduce((s, p) => s + p.championGames, 0)
  return {
    avgWr: Math.round(wrSum / total),
    avgGames: Math.round(gamesSum / total),
  }
})

// Derived list — pure client-side filter + sort over the single /global
// response. Region tabs and role tabs don't trigger a refetch; switching
// tabs is instant.
const filteredSortedPlayers = computed<ChampionPlayerGlobal[]>(() => {
  if (!players.value) return []

  const regionMatches = (p: ChampionPlayerGlobal): boolean => {
    if (selectedRegion.value === 'all') {
      return currentRegions.value.includes(p.region as RegionCode)
    }
    return p.region === selectedRegion.value
  }

  const roleMatches = (p: ChampionPlayerGlobal): boolean => {
    if (selectedRole.value === 'all') return true
    return primaryRole(p.roles) === selectedRole.value
  }

  const filtered = players.value.filter(
    (p) => regionMatches(p) && roleMatches(p),
  )

  const dir = sortDir.value === 'asc' ? 1 : -1
  const key = sortKey.value
  return [...filtered].sort((a, b) => dir * (a[key] - b[key]))
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
    const response = await api.championPlayers.global(championId, 100)
    players.value = response.players
    qualityMix.value = response.qualityMix
  } catch (e: unknown) {
    error.value =
      e instanceof ApiError
        ? e.message
        : e instanceof Error
          ? e.message
          : 'Unknown error'
  } finally {
    loading.value = false
  }
}

function openPlayerBuilds(player: ChampionPlayerGlobal): void {
  router.push({
    path: `/champion/${championId}/player/${player.puuid}`,
    query: {
      region: player.region,
      name: player.gameName,
    },
  })
}

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

.champ-page__kicker {
  font-size: 11px;
  color: var(--fg-dim);
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.champ-page__title {
  font-size: 72px;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 0.9;
  color: var(--fg);
}

.champ-page__chips {
  display: flex;
  gap: 8px;
  margin-top: 14px;
  flex-wrap: wrap;
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

.champ-page__table-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  gap: 12px;
  flex-wrap: wrap;
}

.champ-page__table-title {
  font-size: 20px;
  color: var(--fg);
  display: inline-flex;
  align-items: baseline;
  gap: 10px;
}

.champ-page__table-count {
  font-size: 12px;
  font-weight: 400;
  color: var(--fg-dim);
}

.champ-page__table-actions {
  display: flex;
  gap: 8px;
}

.champ-page__table-btn {
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--fg-dim);
  background: transparent;
  cursor: pointer;
  transition:
    color 0.15s,
    border-color 0.15s;
}

.champ-page__table-btn:hover {
  color: var(--fg);
  border-color: var(--fg-dim);
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

.champ-page__th--share {
  text-align: right;
  width: 70px;
}

.champ-page__th--quality {
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

.champ-page__td--share {
  text-align: right;
  color: var(--fg-dim);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.champ-page__td--quality {
  text-align: center;
}

.champ-page__quality {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 999px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: help;
}

.champ-page__quality--main {
  background: color-mix(in oklab, var(--acid) 16%, transparent);
  color: var(--acid);
  border: 1px solid color-mix(in oklab, var(--acid) 40%, transparent);
}

.champ-page__quality--regular {
  background: color-mix(in oklab, var(--cyan) 14%, transparent);
  color: var(--cyan);
  border: 1px solid color-mix(in oklab, var(--cyan) 40%, transparent);
}

.champ-page__quality--casual {
  background: transparent;
  color: var(--fg-dim);
  border: 1px solid var(--border);
}

.champ-page__quality--trial {
  background: color-mix(in oklab, var(--mag) 10%, transparent);
  color: var(--mag);
  border: 1px solid color-mix(in oklab, var(--mag) 30%, transparent);
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
  .champ-page__th--share,
  .champ-page__td--share {
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

  .champ-page__th--quality,
  .champ-page__td--quality {
    display: none;
  }

  .champ-page__tier-meta {
    display: none;
  }
}
</style>
