<template>
  <div class="champ-page">
    <div class="champ-page__container">
      <NuxtLink to="/" class="champ-page__back">
        {{ t('championPage.backToSearch') }}
      </NuxtLink>

      <div v-if="champion" class="champ-page__hero">
        <img
          :src="getChampionImageUrl(champion.id)"
          :alt="championDisplayName(champion, locale)"
          class="champ-page__icon"
        />
        <div class="champ-page__info">
          <span class="champ-page__kicker mono">
            {{
              t('championPage.heroKicker', {
                role: champion.roles[0]?.toUpperCase() ?? '',
              })
            }}
          </span>
          <h1 class="champ-page__title display">
            {{ championDisplayName(champion, locale) }}
          </h1>
          <div class="champ-page__chips">
            <span class="chip chip--acid">
              {{ t('championPage.chips.scope') }}
            </span>
            <span v-if="heroStats" class="chip">
              {{ t('championPage.chips.avgWr', { value: heroStats.avgWr }) }}
            </span>
            <span v-if="heroStats" class="chip">
              {{
                t('championPage.chips.avgGames', { value: heroStats.avgGames })
              }}
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
            {{ t(`championPage.groups.${group.id}`) }}
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
            {{ t('championPage.allRegions') }}
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
            {{ t(`roles.${role.id}`) }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="champ-page__loading">
        <div class="champ-page__spinner" />
        <p>
          {{
            t('championPage.loading', {
              champion: champion
                ? championDisplayName(champion, locale)
                : championId,
            })
          }}
        </p>
        <p class="champ-page__loading-hint">
          {{ t('championPage.loadingHint') }}
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
              {{ t('championPage.table.title') }}
              <span class="champ-page__table-count mono">
                {{
                  t('championPage.table.count', {
                    filtered: filteredSortedPlayers.length,
                    total: players.length,
                  })
                }}
              </span>
            </div>
            <div class="champ-page__table-actions">
              <button class="champ-page__table-btn mono">
                {{ t('championPage.table.exportCsv') }}
              </button>
              <button class="champ-page__table-btn mono">
                {{ t('championPage.table.live') }}
              </button>
            </div>
          </div>
          <table class="champ-page__table">
            <thead>
              <tr>
                <th class="champ-page__th champ-page__th--rank">#</th>
                <th
                  class="champ-page__th champ-page__th--avatar"
                  aria-label="avatar"
                />
                <th class="champ-page__th">
                  {{ t('championPage.table.th.player') }}
                </th>
                <th class="champ-page__th champ-page__th--center">
                  {{ t('championPage.table.th.region') }}
                </th>
                <th
                  class="champ-page__th champ-page__th--rank-col champ-page__th--sortable"
                  :class="{
                    'champ-page__th--active': sortKey === 'lp',
                  }"
                  @click="toggleSort('lp')"
                >
                  {{ t('championPage.table.th.rank') }}{{ sortIndicator('lp') }}
                </th>
                <th
                  class="champ-page__th champ-page__th--games champ-page__th--sortable"
                  :class="{
                    'champ-page__th--active': sortKey === 'championGames',
                  }"
                  :title="t('championPage.table.th.gamesTitle')"
                  @click="toggleSort('championGames')"
                >
                  {{ t('championPage.table.th.games')
                  }}{{ sortIndicator('championGames') }}
                </th>
                <th
                  class="champ-page__th champ-page__th--kda"
                  :title="t('championPage.table.th.kdaTitle')"
                >
                  {{ t('championPage.table.th.kda') }}
                </th>
                <th
                  class="champ-page__th champ-page__th--runes"
                  :title="t('championPage.table.th.runesTitle')"
                >
                  {{ t('championPage.table.th.runes') }}
                </th>
                <th
                  class="champ-page__th champ-page__th--first-item"
                  :title="t('championPage.table.th.firstItemTitle')"
                >
                  {{ t('championPage.table.th.firstItem') }}
                </th>
                <th
                  class="champ-page__th champ-page__th--wr champ-page__th--sortable"
                  :class="{
                    'champ-page__th--active': sortKey === 'championWinRate',
                  }"
                  :title="t('championPage.table.th.wrTitle')"
                  @click="toggleSort('championWinRate')"
                >
                  {{ t('championPage.table.th.wr')
                  }}{{ sortIndicator('championWinRate') }}
                </th>
                <th
                  class="champ-page__th champ-page__th--share champ-page__th--sortable"
                  :class="{
                    'champ-page__th--active': sortKey === 'championShare',
                  }"
                  :title="t('championPage.table.th.poolTitle')"
                  @click="toggleSort('championShare')"
                >
                  {{ t('championPage.table.th.pool')
                  }}{{ sortIndicator('championShare') }}
                </th>
                <th class="champ-page__th champ-page__th--quality">
                  {{ t('championPage.table.th.kind') }}
                </th>
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

                <td class="champ-page__td champ-page__td--avatar">
                  <img
                    v-if="player.profileIconId != null"
                    :src="getProfileIconUrl(player.profileIconId)"
                    :alt="`${getPlayerName(player.gameName)} avatar`"
                    class="champ-page__avatar"
                    loading="lazy"
                    @error="onAvatarError"
                  />
                  <span v-else class="champ-page__avatar-placeholder" />
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
                        {{ player.lp.toLocaleString(locale) }} LP
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
                        {{ player.championWins
                        }}{{ t('championPage.winsLetter') }}
                      </span>
                      <span class="champ-page__games-sep">·</span>
                      <span class="champ-page__games-l">
                        {{ player.championLosses
                        }}{{ t('championPage.lossesLetter') }}
                      </span>
                    </span>
                  </div>
                </td>

                <td class="champ-page__td champ-page__td--kda">
                  <div v-if="player.kda" class="champ-page__kda">
                    <span class="champ-page__kda-ratio">
                      {{ formatKdaRatio(player.kda) }}
                    </span>
                    <span class="champ-page__kda-breakdown">
                      <span class="champ-page__kda-k">
                        {{ formatKdaValue(player.kda.kills) }}
                      </span>
                      <span class="champ-page__kda-sep">/</span>
                      <span class="champ-page__kda-d">
                        {{ formatKdaValue(player.kda.deaths) }}
                      </span>
                      <span class="champ-page__kda-sep">/</span>
                      <span class="champ-page__kda-a">
                        {{ formatKdaValue(player.kda.assists) }}
                      </span>
                    </span>
                  </div>
                  <span v-else class="champ-page__kda-empty">—</span>
                </td>

                <td class="champ-page__td champ-page__td--runes">
                  <div v-if="player.runes" class="champ-page__runes">
                    <img
                      v-if="keystoneIcon(player.runes.keystone)"
                      :src="keystoneIcon(player.runes.keystone) ?? ''"
                      :alt="`keystone ${player.runes.keystone}`"
                      class="champ-page__runes-keystone"
                      loading="lazy"
                    />
                    <img
                      v-if="styleIcon(player.runes.secondaryStyle)"
                      :src="styleIcon(player.runes.secondaryStyle) ?? ''"
                      :alt="`style ${player.runes.secondaryStyle}`"
                      class="champ-page__runes-secondary"
                      loading="lazy"
                    />
                  </div>
                  <span v-else class="champ-page__runes-empty">—</span>
                </td>

                <td class="champ-page__td champ-page__td--first-item">
                  <ItemTooltip
                    v-if="player.firstItem"
                    :item-id="player.firstItem"
                  />
                  <span v-else class="champ-page__first-item-empty">—</span>
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
                    {{ qualityLabel(player.quality) }}
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
          {{
            t('championPage.emptyNoPlayers', {
              champion: champion
                ? championDisplayName(champion, locale)
                : championId,
            })
          }}
        </p>
        <p class="champ-page__empty-hint">
          {{ t('championPage.emptyTryRegion') }}
        </p>
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
        <p>{{ t('championPage.emptyNoRole') }}</p>
        <p class="champ-page__empty-hint">
          {{ t('championPage.emptyTryRole') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  getChampionImageUrl,
  getProfileIconUrl,
  getRankedEmblemUrl,
  loadRunesMap,
  resolveRuneIconUrl,
  ROLES,
} from '~/src/shared/config'
import type { RegionCode, RoleId } from '~/src/shared/config'
import { ItemTooltip } from '~/src/shared/ui'
import { CHAMPIONS, championDisplayName } from '~/src/entities/champion'
import { api, ApiError } from '~/src/shared/api'
import type { ChampionPlayerGlobal, PlayerQuality } from '~/src/shared/api'
import { useI18n } from '#imports'

const { t, locale } = useI18n()

// Sort keys map 1:1 onto ChampionPlayerGlobal numeric fields, so we can
// index into the record without a switch statement.
type SortKey = 'lp' | 'championWinRate' | 'championGames' | 'championShare'
type SortDir = 'asc' | 'desc'

interface RegionGroup {
  id: 'major' | 'europe' | 'asia' | 'americas'
  regions: RegionCode[]
}

// /global returns data across all tracked regions (currently euw/na/kr
// per HANDOFF). Region groups stay as pure client-side filters, so
// non-tracked regions (eune/tr/ru/jp/br/lan/las/oce) will correctly
// render as empty until backend coverage expands.
const regionGroups: RegionGroup[] = [
  { id: 'major', regions: ['kr', 'euw', 'na'] },
  { id: 'europe', regions: ['euw', 'eune', 'tr', 'ru'] },
  { id: 'asia', regions: ['kr', 'jp'] },
  { id: 'americas', regions: ['na', 'br', 'lan', 'las', 'oce'] },
]

function qualityLabel(q: PlayerQuality): string {
  return t(`championPage.quality.${q}`)
}

const router = useRouter()
const route = useRoute()
const championId = route.params['id'] as string

const champion = CHAMPIONS.find(
  (c) => c.id.toLowerCase() === championId.toLowerCase(),
)

useHead({
  title: computed(() => {
    const name = champion
      ? championDisplayName(champion, locale.value)
      : championId
    return `${name} — One Trick Ranking | ${t('app.name')}`
  }),
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
// DDragon runesReforged.json loaded once on mount; icons render as soon
// as it resolves. If the fetch fails the R column stays empty — not
// worth blocking the whole page on it.
const runesMap = ref<Map<number, string> | null>(null)

function keystoneIcon(id: number): string | null {
  return resolveRuneIconUrl(runesMap.value, id)
}

function styleIcon(id: number): string | null {
  return resolveRuneIconUrl(runesMap.value, id)
}

const currentRegions = computed(() => {
  const group = regionGroups.find((g) => g.id === selectedGroup.value)
  return group?.regions ?? []
})

const errorMessage = computed(() => {
  if (!error.value) return ''
  if (error.value.includes('429')) {
    return t('errors.rateLimited')
  }
  if (error.value.includes('504') || error.value.includes('timeout')) {
    return t('errors.timeout')
  }
  return t('common.error', { message: error.value })
})

const qualityMixLabel = computed<string>(() => {
  const mix = qualityMix.value
  const parts: string[] = []
  const order: PlayerQuality[] = ['main', 'regular']
  for (const q of order) {
    const n = mix[q] ?? 0
    if (n > 0) parts.push(`${qualityLabel(q)} ${n}`)
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

// DDragon returns 404 for profileIconIds that were introduced after the
// pinned patch (or removed). Swap to the default icon (29) on failure
// so the layout doesn't get a broken-image glyph.
const FALLBACK_PROFILE_ICON_URL = getProfileIconUrl(29)

function onAvatarError(e: Event): void {
  const img = e.target as HTMLImageElement | null
  if (img && img.src !== FALLBACK_PROFILE_ICON_URL) {
    img.src = FALLBACK_PROFILE_ICON_URL
  }
}

function getPlayerTag(gameName: string): string {
  return gameName.split('#')[1] ?? ''
}

// KDA values arrive pre-rounded to 1 decimal. Drop the ".0" for whole
// numbers so the column stays compact: "5 / 2.1 / 7" instead of
// "5.0 / 2.1 / 7.0".
function formatKdaValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

// Classic (K+A)/D ratio formatted as "2.64:1". When average deaths
// round to 0 the ratio is undefined — show "Perfect" as the widely
// used convention.
function formatKdaRatio(kda: {
  kills: number
  deaths: number
  assists: number
}): string {
  if (kda.deaths <= 0) return t('playerBuilds.perfect')
  const ratio = (kda.kills + kda.assists) / kda.deaths
  return `${ratio.toFixed(2)}:1`
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
  return t(`championPage.quality.${q}Tip`)
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
    const response = await api.championPlayers.global(championId)
    players.value = response.players
    qualityMix.value = response.qualityMix
  } catch (e: unknown) {
    error.value =
      e instanceof ApiError
        ? e.message
        : e instanceof Error
          ? e.message
          : t('common.unknownError')
  } finally {
    loading.value = false
  }
}

// Leaderboard click -> champion-scoped player page. The route
// `/champion/[id]/player/[puuid]` shows this player's history on
// *this* champion (PlayerBuildsPage). The champion-agnostic variant
// at `/player/[puuid]` is reached from the home feed instead.
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
  loadRunesMap()
    .then((map) => {
      runesMap.value = map
    })
    .catch((e: unknown) => {
      // Non-fatal — R column just stays empty.
      console.warn('[runes] failed to load runesReforged.json', e)
    })
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

.champ-page__th--avatar {
  width: 44px;
  min-width: 44px;
  padding-left: 0;
  padding-right: 0;
}

.champ-page__td--avatar {
  width: 44px;
  min-width: 44px;
  padding-left: 0;
  padding-right: 0;
  text-align: center;
}

/* width/height explicitly set here; max-width: none overrides the
 * global `img { max-width: 100% }` rule — without it, table auto-layout
 * can shrink the cell below 32px and clamp the img horizontally while
 * height stays 32px, producing a squashed oval instead of a circle. */
.champ-page__avatar {
  width: 32px;
  min-width: 32px;
  height: 32px;
  max-width: none;
  border-radius: 50%;
  border: 1px solid var(--border);
  object-fit: cover;
  display: inline-block;
  background: var(--bg-2);
}

.champ-page__avatar-placeholder {
  display: inline-block;
  width: 32px;
  min-width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-2);
  border: 1px solid var(--border);
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

/* KDA column */
.champ-page__th--kda {
  text-align: center;
  width: 120px;
}

.champ-page__td--kda {
  text-align: center;
}

.champ-page__kda {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
}

.champ-page__kda-ratio {
  color: var(--fg);
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0;
}

.champ-page__kda-breakdown {
  display: inline-flex;
  align-items: baseline;
  gap: 3px;
  margin-top: 2px;
  font-size: 10px;
  font-weight: 600;
  color: var(--fg-dim);
}

.champ-page__kda-k {
  color: var(--acid);
}

.champ-page__kda-d {
  color: var(--red);
}

.champ-page__kda-a {
  color: var(--cyan);
}

.champ-page__kda-sep {
  color: var(--border);
  font-weight: 400;
}

.champ-page__kda-empty {
  color: var(--border);
}

/* Runes column */
.champ-page__th--runes {
  text-align: center;
  width: 72px;
}

.champ-page__td--runes {
  text-align: center;
}

.champ-page__runes {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.champ-page__runes-keystone {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.champ-page__runes-secondary {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  opacity: 0.85;
}

.champ-page__runes-empty {
  color: var(--border);
}

/* First item column */
.champ-page__th--first-item {
  text-align: center;
  width: 56px;
}

.champ-page__td--first-item {
  /* Must not clip the absolute-positioned tooltip inside ItemTooltip. */
  text-align: center;
  overflow: visible;
}

.champ-page__first-item-empty {
  color: var(--border);
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

  .champ-page__th--runes,
  .champ-page__td--runes {
    display: none;
  }

  .champ-page__th--first-item,
  .champ-page__td--first-item {
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

  .champ-page__th--kda,
  .champ-page__td--kda {
    display: none;
  }

  .champ-page__tier-meta {
    display: none;
  }
}
</style>
