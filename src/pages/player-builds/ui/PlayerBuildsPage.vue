<template>
  <div class="builds-page">
    <div class="builds-page__container">
      <NuxtLink :to="`/champion/${championId}`" class="builds-page__back">
        {{ t('playerBuilds.backToPlayers') }}
      </NuxtLink>

      <div v-if="champion" class="builds-page__hero">
        <img
          :src="getChampionImageUrl(champion.id)"
          :alt="championDisplayName(champion, locale)"
          class="builds-page__champ-icon"
        />
        <div class="builds-page__hero-info">
          <h1 class="builds-page__title">
            {{ displayName }}
          </h1>
          <p class="builds-page__subtitle">
            {{
              t('playerBuilds.subtitle', {
                champion: championDisplayName(champion, locale),
              })
            }}
          </p>
          <div
            v-if="data && data.masteryPoints > 0"
            class="builds-page__mastery"
          >
            <span class="builds-page__mastery-level">
              Lvl {{ data.masteryLevel }}
            </span>
            {{
              t('playerBuilds.masteryPoints', {
                value: formatMastery(data.masteryPoints),
              })
            }}
          </div>
        </div>
      </div>

      <div v-if="loading" class="builds-page__loading">
        <div class="builds-page__spinner" />
        <p>{{ t('playerBuilds.loading') }}</p>
        <p class="builds-page__loading-hint">
          {{
            t('playerBuilds.loadingHint', {
              champion: champion
                ? championDisplayName(champion, locale)
                : championId,
            })
          }}
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
          {{ t('playerBuilds.foundMatches', { count: data.matches.length }) }}
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
                {{
                  match.win
                    ? t('championPage.winsLetter')
                    : t('championPage.lossesLetter')
                }}
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
                {{ t('playerBuilds.kdaLabel') }}
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
        <p>
          {{
            t('playerBuilds.emptyNoMatches', {
              champion: champion
                ? championDisplayName(champion, locale)
                : championId,
            })
          }}
        </p>
        <p class="builds-page__empty-hint">
          {{ t('playerBuilds.emptyHint') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getChampionImageUrl, getItemImageUrl } from '~/src/shared/config'
import { CHAMPIONS, championDisplayName } from '~/src/entities/champion'
import { api, ApiError } from '~/src/shared/api'
import type { PlayerChampionMatchesResponse } from '~/src/shared/api'
import { useI18n } from '#imports'

const { t, locale } = useI18n()

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
  return nameFromQuery ?? t('playerBuilds.defaultPlayerName')
})

useHead({
  title: computed(() => {
    const champName = champion
      ? championDisplayName(champion, locale.value)
      : championId
    return `${displayName.value} — ${champName} | ${t('app.name')}`
  }),
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
  if (deaths === 0) return t('playerBuilds.perfect')
  return ((kills + assists) / deaths).toFixed(1)
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return t('playerBuilds.date.today')
  if (diffDays === 1) return t('playerBuilds.date.yesterday')
  if (diffDays < 7) return t('playerBuilds.date.daysAgo', { days: diffDays })
  return date.toLocaleDateString(locale.value, {
    day: 'numeric',
    month: 'short',
  })
}

async function loadMatches(): Promise<void> {
  loading.value = true
  error.value = null

  try {
    data.value = await api.playerMatches.get(puuid, championId, region)
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
