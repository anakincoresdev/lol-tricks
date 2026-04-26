<template>
  <div class="player-page">
    <div class="player-page__container">
      <NuxtLink to="/" class="player-page__back">
        {{ t('player.backHome') }}
      </NuxtLink>

      <div class="player-page__hero">
        <img
          v-if="profileIconUrl"
          :src="profileIconUrl"
          :alt="displayName"
          class="player-page__avatar"
          loading="lazy"
        />
        <div v-else class="player-page__avatar player-page__avatar--empty" />

        <div class="player-page__hero-info">
          <h1 class="player-page__title">
            {{ displayName }}
          </h1>
          <p class="player-page__subtitle">
            {{ t('player.subtitle', { region: regionLabel }) }}
          </p>
          <div v-if="data && data.tier" class="player-page__rank">
            <span class="player-page__rank-tier">
              {{ formatRankLine(data.tier, data.rank, data.lp) }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="loading" class="player-page__loading">
        <div class="player-page__spinner" />
        <p>{{ t('player.loading') }}</p>
        <p class="player-page__loading-hint">
          {{ t('player.loadingHint') }}
        </p>
      </div>

      <div v-if="error" class="player-page__error">
        {{ errorMessage }}
      </div>

      <div
        v-if="data && data.matches.length > 0 && !loading"
        class="player-page__results"
      >
        <h2 class="player-page__results-title">
          {{ t('player.foundMatches', { count: data.matches.length }) }}
        </h2>

        <div class="player-page__matches">
          <div
            v-for="match in data.matches"
            :key="match.matchId"
            class="player-page__match"
            :class="
              match.win ? 'player-page__match--win' : 'player-page__match--loss'
            "
          >
            <div class="player-page__match-summary">
              <div class="player-page__match-result">
                <span
                  class="player-page__match-badge"
                  :class="
                    match.win
                      ? 'player-page__match-badge--win'
                      : 'player-page__match-badge--loss'
                  "
                >
                  {{
                    match.win
                      ? t('championPage.winsLetter')
                      : t('championPage.lossesLetter')
                  }}
                </span>
                <span class="player-page__match-duration">
                  {{ formatDuration(match.gameDuration) }}
                </span>
              </div>

              <img
                :src="getChampionImageUrl(match.championName)"
                :alt="match.championName"
                class="player-page__match-champion"
                loading="lazy"
              />

              <div class="player-page__match-kda">
                <span class="player-page__kda-numbers">
                  {{ match.kills }}/{{ match.deaths }}/{{ match.assists }}
                </span>
                <span class="player-page__kda-ratio">
                  {{ formatKda(match.kills, match.deaths, match.assists) }}
                  {{ t('player.kdaLabel') }}
                </span>
              </div>

              <div class="player-page__match-cs">{{ match.cs }} CS</div>

              <div class="player-page__match-items">
                <div
                  v-for="(item, idx) in match.items.slice(0, 6)"
                  :key="idx"
                  class="player-page__item-slot"
                >
                  <img
                    v-if="item > 0"
                    :src="getItemImageUrl(item)"
                    :alt="`Item ${item}`"
                    class="player-page__item-icon"
                  />
                  <div v-else class="player-page__item-empty" />
                </div>
                <div
                  class="player-page__item-slot player-page__item-slot--trinket"
                >
                  <img
                    v-if="match.items[6] && match.items[6] > 0"
                    :src="getItemImageUrl(match.items[6])"
                    alt="Trinket"
                    class="player-page__item-icon"
                  />
                  <div v-else class="player-page__item-empty" />
                </div>
              </div>

              <div class="player-page__match-date">
                {{ formatDate(match.gameCreation) }}
              </div>
            </div>

            <div
              v-if="match.participants && match.participants.length > 0"
              class="player-page__teams"
            >
              <div class="player-page__team player-page__team--allies">
                <span class="player-page__team-label mono">
                  {{ t('player.teams.allies') }}
                </span>
                <NuxtLink
                  v-for="p in splitTeams(match).allies"
                  :key="`${match.matchId}:ally:${p.puuid}`"
                  :to="participantLink(p)"
                  class="player-page__participant"
                  :class="{
                    'player-page__participant--target': p.puuid === puuid,
                  }"
                >
                  <img
                    :src="getChampionImageUrl(p.championName)"
                    :alt="p.championName"
                    class="player-page__participant-icon"
                    loading="lazy"
                  />
                  <span class="player-page__participant-name">
                    {{ displayParticipantName(p) }}
                  </span>
                  <span class="player-page__participant-kda mono">
                    {{ p.kills }}/{{ p.deaths }}/{{ p.assists }}
                  </span>
                </NuxtLink>
              </div>

              <div class="player-page__team player-page__team--enemies">
                <span class="player-page__team-label mono">
                  {{ t('player.teams.enemies') }}
                </span>
                <NuxtLink
                  v-for="p in splitTeams(match).enemies"
                  :key="`${match.matchId}:enemy:${p.puuid}`"
                  :to="participantLink(p)"
                  class="player-page__participant"
                >
                  <img
                    :src="getChampionImageUrl(p.championName)"
                    :alt="p.championName"
                    class="player-page__participant-icon"
                    loading="lazy"
                  />
                  <span class="player-page__participant-name">
                    {{ displayParticipantName(p) }}
                  </span>
                  <span class="player-page__participant-kda mono">
                    {{ p.kills }}/{{ p.deaths }}/{{ p.assists }}
                  </span>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="data && data.matches.length === 0 && !loading"
        class="player-page__empty"
      >
        <p>{{ t('player.emptyNoMatches') }}</p>
        <p class="player-page__empty-hint">
          {{ t('player.emptyHint') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  getChampionImageUrl,
  getItemImageUrl,
  getProfileIconUrl,
} from '~/src/shared/config'
import { api, ApiError } from '~/src/shared/api'
import type {
  PlayerMatchesResponse,
  PlayerMatch,
  MatchParticipantSummary,
} from '~/src/shared/api'
import { useI18n } from '#imports'

const { t, locale } = useI18n()

const route = useRoute()
const puuid = route.params['puuid'] as string
const region = (route.query['region'] as string) ?? 'euw'
const nameFromQuery = route.query['name'] as string | undefined

const loading = ref(false)
const error = ref<string | null>(null)
const data = ref<PlayerMatchesResponse | null>(null)

const displayName = computed(() => {
  if (data.value?.gameName && data.value.gameName !== 'Unknown') {
    return data.value.gameName
  }
  return nameFromQuery ?? t('player.defaultPlayerName')
})

const regionLabel = computed(() => t(`regions.${region}`))

// Neutral fallback icon id 29 (basic Poro) when the DB has no record
// and the summoner-v4 fallback on the backend also failed. Using a
// valid DDragon id keeps the <img> tag rather than a blank slot.
const profileIconUrl = computed(() => {
  const id = data.value?.profileIconId
  if (typeof id === 'number') return getProfileIconUrl(id)
  return null
})

useHead({
  title: computed(() => `${displayName.value} | ${t('app.name')}`),
})

const errorMessage = computed(() => {
  if (!error.value) return ''
  if (error.value.includes('403')) {
    return t('errors.apiKeyExpired')
  }
  if (error.value.includes('429')) {
    return t('errors.rateLimited')
  }
  if (error.value.includes('504') || error.value.includes('timeout')) {
    return t('errors.timeoutRetry')
  }
  return t('common.error', { message: error.value })
})

// Format `GOLD IV 42 LP` style line. Rank letter is only meaningful
// below Master — Master/GM/Challenger always carry rank `I` in Riot's
// payload, so strip it there.
function formatRankLine(
  tier: string,
  rank: string | null,
  lp: number | null,
): string {
  const t = tier.toUpperCase()
  const hideRank = t === 'MASTER' || t === 'GRANDMASTER' || t === 'CHALLENGER'
  const parts: string[] = [t]
  if (!hideRank && rank) parts.push(rank)
  if (typeof lp === 'number') parts.push(`${lp} LP`)
  return parts.join(' ')
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatKda(kills: number, deaths: number, assists: number): string {
  if (deaths === 0) return t('player.perfect')
  return ((kills + assists) / deaths).toFixed(1)
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return t('player.date.today')
  if (diffDays === 1) return t('player.date.yesterday')
  if (diffDays < 7) return t('player.date.daysAgo', { days: diffDays })
  return date.toLocaleDateString(locale.value, {
    day: 'numeric',
    month: 'short',
  })
}

function splitTeams(match: PlayerMatch): {
  allies: MatchParticipantSummary[]
  enemies: MatchParticipantSummary[]
} {
  const allies: MatchParticipantSummary[] = []
  const enemies: MatchParticipantSummary[] = []
  for (const p of match.participants) {
    if (p.win === match.win) {
      allies.push(p)
    } else {
      enemies.push(p)
    }
  }
  return { allies, enemies }
}

function participantLink(p: MatchParticipantSummary): {
  path: string
  query: Record<string, string>
} {
  return {
    path: `/player/${p.puuid}`,
    query: {
      region,
      name: p.gameName,
    },
  }
}

function displayParticipantName(p: MatchParticipantSummary): string {
  const hash = p.gameName.indexOf('#')
  return hash >= 0 ? p.gameName.slice(0, hash) : p.gameName
}

async function loadMatches(): Promise<void> {
  loading.value = true
  error.value = null

  try {
    data.value = await api.player.matches(puuid, region)
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

onMounted(() => {
  loadMatches()
})
</script>

<style scoped>
.player-page {
  min-height: calc(100vh - 64px);
}

.player-page__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 64px;
}

.player-page__back {
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

.player-page__back:hover {
  color: var(--acid);
}

.player-page__hero {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
}

.player-page__avatar {
  width: 96px;
  height: 96px;
  border-radius: 4px;
  border: 2px solid var(--acid);
  flex-shrink: 0;
  object-fit: cover;
}

.player-page__avatar--empty {
  background: var(--surface);
}

.player-page__hero-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.player-page__title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 42px;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
  color: var(--fg);
  word-break: break-all;
}

.player-page__subtitle {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--fg-dim);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.player-page__rank {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.player-page__rank-tier {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  color: var(--bg);
  background: var(--acid);
  padding: 3px 8px;
  border-radius: 3px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.player-page__loading {
  text-align: center;
  padding: 48px 16px;
  color: var(--fg-dim);
}

.player-page__spinner {
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

.player-page__loading-hint {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--fg-dim);
  margin-top: 8px;
}

.player-page__error {
  padding: 12px 16px;
  background: color-mix(in oklab, var(--red) 10%, transparent);
  border: 1px solid var(--red);
  border-radius: 4px;
  color: var(--red);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  margin-bottom: 16px;
}

.player-page__results-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  color: var(--fg-dim);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 16px;
}

.player-page__matches {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.player-page__match {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 18px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  transition: border-color 0.15s;
}

.player-page__match:hover {
  border-color: var(--fg-dim);
}

.player-page__match--win {
  border-left: 3px solid var(--acid);
}

.player-page__match--loss {
  border-left: 3px solid var(--red);
}

.player-page__match-summary {
  display: flex;
  align-items: center;
  gap: 16px;
}

.player-page__match-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 44px;
}

.player-page__match-badge {
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

.player-page__match-badge--win {
  background: var(--acid);
  color: var(--bg);
}

.player-page__match-badge--loss {
  background: var(--red);
  color: #fff;
}

.player-page__match-duration {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--fg-dim);
  letter-spacing: 0.05em;
}

.player-page__match-champion {
  width: 40px;
  height: 40px;
  border-radius: 3px;
  flex-shrink: 0;
  display: block;
}

.player-page__match-kda {
  display: flex;
  flex-direction: column;
  min-width: 80px;
}

.player-page__kda-numbers {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 700;
  color: var(--fg);
  font-variant-numeric: tabular-nums;
}

.player-page__kda-ratio {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--fg-dim);
}

.player-page__match-cs {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--fg-dim);
  min-width: 50px;
}

.player-page__match-items {
  display: flex;
  gap: 3px;
  align-items: center;
}

.player-page__item-slot {
  width: 30px;
  height: 30px;
  border-radius: 3px;
  overflow: hidden;
  background: var(--bg);
}

.player-page__item-slot--trinket {
  border-radius: 50%;
  margin-left: 4px;
}

.player-page__item-icon {
  width: 100%;
  height: 100%;
  display: block;
}

.player-page__item-empty {
  width: 100%;
  height: 100%;
  background: var(--bg);
}

.player-page__match-date {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--fg-dim);
  letter-spacing: 0.05em;
  margin-left: auto;
  white-space: nowrap;
}

.player-page__empty {
  text-align: center;
  padding: 48px 16px;
  color: var(--fg-dim);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.player-page__empty-hint {
  font-size: 11px;
  margin-top: 8px;
  color: var(--fg-dim);
  opacity: 0.7;
}

.player-page__teams {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--border);
}

.player-page__team {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.player-page__team-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--fg-dim);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.player-page__team--enemies .player-page__team-label {
  text-align: right;
}

.player-page__participant {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
  border-radius: 3px;
  text-decoration: none;
  color: var(--fg);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  min-width: 0;
  max-width: 100%;
  transition:
    background 0.15s,
    color 0.15s;
}

.player-page__team--enemies .player-page__participant {
  flex-direction: row-reverse;
  text-align: right;
}

.player-page__participant:hover {
  background: var(--bg);
  color: var(--acid);
}

.player-page__participant--target {
  background: color-mix(in oklab, var(--acid) 12%, transparent);
  color: var(--acid);
}

.player-page__participant-icon {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  flex-shrink: 0;
  display: block;
}

.player-page__participant-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0.02em;
}

.player-page__participant-kda {
  font-size: 10px;
  color: var(--fg-dim);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.player-page__participant:hover .player-page__participant-kda,
.player-page__participant--target .player-page__participant-kda {
  color: inherit;
}

@media (max-width: 640px) {
  .player-page__title {
    font-size: 28px;
  }

  .player-page__avatar {
    width: 64px;
    height: 64px;
  }

  .player-page__match-summary {
    flex-wrap: wrap;
    gap: 10px;
  }

  .player-page__match {
    padding: 10px 12px;
  }

  .player-page__match-cs {
    display: none;
  }

  .player-page__match-champion {
    width: 32px;
    height: 32px;
  }

  .player-page__match-date {
    width: 100%;
    text-align: right;
    margin-left: 0;
  }

  .player-page__item-slot {
    width: 26px;
    height: 26px;
  }

  .player-page__teams {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .player-page__team--enemies .player-page__team-label {
    text-align: left;
  }

  .player-page__team--enemies .player-page__participant {
    flex-direction: row;
    text-align: left;
  }

  .player-page__participant-name {
    font-size: 12px;
  }
}
</style>
