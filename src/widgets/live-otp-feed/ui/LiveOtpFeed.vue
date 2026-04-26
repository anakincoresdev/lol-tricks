<template>
  <section class="live-feed">
    <header class="live-feed__head">
      <div class="live-feed__head-left">
        <span class="live-feed__pulse" aria-hidden="true" />
        <span class="mono live-feed__kicker">
          {{ t('liveOtpFeed.kicker') }}
        </span>
        <h2 class="display live-feed__title">
          {{ t('liveOtpFeed.title') }}
        </h2>
      </div>
      <p class="live-feed__subtitle">
        {{ t('liveOtpFeed.subtitle') }}
      </p>
    </header>

    <div v-if="pending" class="live-feed__state">
      <div class="live-feed__spinner" aria-hidden="true" />
      <p class="mono live-feed__state-text">
        {{ t('liveOtpFeed.loading') }}
      </p>
    </div>

    <div v-else-if="error" class="live-feed__state live-feed__state--error">
      <p class="mono live-feed__state-text">
        {{ t('liveOtpFeed.error') }}
      </p>
    </div>

    <div v-else-if="matches.length === 0" class="live-feed__state">
      <p class="mono live-feed__state-text">
        {{ t('liveOtpFeed.empty') }}
      </p>
    </div>

    <ul v-else class="live-feed__list">
      <li
        v-for="(m, i) in matches"
        :key="`${m.matchId}:${m.player.puuid}`"
        class="live-feed__item"
      >
        <NuxtLink
          :to="{
            path: `/player/${m.player.puuid}`,
            query: { region: m.region, name: m.player.gameName },
          }"
          class="live-feed__card stick"
          :class="[
            `live-feed__card--tilt-${(i % 3) + 1}`,
            m.win ? 'live-feed__card--win' : 'live-feed__card--loss',
          ]"
        >
          <div class="live-feed__card-head">
            <span
              class="live-feed__result mono"
              :class="
                m.win ? 'live-feed__result--win' : 'live-feed__result--loss'
              "
            >
              {{ m.win ? t('liveOtpFeed.win') : t('liveOtpFeed.loss') }}
            </span>
            <span class="mono live-feed__region">
              {{ m.region.toUpperCase() }}
            </span>
            <span class="mono live-feed__time">
              {{ relativeTime(m.gameCreation, locale) }}
            </span>
          </div>

          <div class="live-feed__card-body">
            <img
              :src="getChampionImageUrl(m.championName)"
              :alt="championLabel(m.championName, locale)"
              class="live-feed__champ-icon"
              loading="lazy"
            />
            <div class="live-feed__card-text">
              <span class="display live-feed__player">
                {{ m.player.gameName }}
              </span>
              <span class="mono live-feed__champ-name">
                {{ championLabel(m.championName, locale) }}
              </span>
              <span class="mono live-feed__kda">
                {{ m.kills }} / {{ m.deaths }} / {{ m.assists }}
                <span class="live-feed__kda-label">
                  {{ t('liveOtpFeed.kdaLabel') }}
                </span>
              </span>
            </div>
          </div>

          <footer class="live-feed__card-foot">
            <span class="mono live-feed__tier">
              {{ tierShort(m.player.tier) }}
              <span v-if="m.player.lp != null" class="live-feed__lp">
                · {{ m.player.lp }} LP
              </span>
            </span>
            <span
              class="mono live-feed__wr"
              :title="
                t('liveOtpFeed.wrTooltip', {
                  games: m.player.championGames,
                  share: m.player.championShare,
                })
              "
            >
              {{ m.player.championWinRate }}% WR
            </span>
          </footer>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { api, ApiError } from '~/src/shared/api/client'
import type { LiveOtpFeedMatch } from '~/src/shared/api/riot'
import { getChampionImageUrl } from '~/src/shared/config'
import { CHAMPIONS, championDisplayName } from '~/src/entities/champion'
import { useI18n } from '#imports'

const { t, locale } = useI18n()

// SSR-friendly one-shot fetch. No polling — the page is meant to be a
// snapshot of "what did OTPs just play". A visitor that reloads the
// page gets a fresh list.
const { data, pending, error } = await useAsyncData('live-otp-feed', () =>
  api.liveOtpFeed.list(20).catch((e) => {
    // Swallow the error into the reactive state so the template can
    // render a friendly message instead of bubbling to Nuxt's default
    // error boundary. We still log it for devtools visibility.
    if (e instanceof ApiError) {
      console.warn('[live-otp-feed] request failed:', e.status, e.message)
    }
    throw e
  }),
)

const matches = computed<LiveOtpFeedMatch[]>(() => data.value?.matches ?? [])

// Champion-id lookup for the localised display name. Falls back to the
// raw Riot id (e.g. "KogMaw") when the champion isn't in the static
// list — this should only ever happen for champions released after the
// frontend's champions-data.ts was last regenerated.
const championById = new Map(CHAMPIONS.map((c) => [c.id, c]))

function championLabel(id: string, currentLocale: string): string {
  const champ = championById.get(id)
  if (champ) return championDisplayName(champ, currentLocale)
  return id
}

// Normalise Riot's all-caps tier strings to a short display label. We
// keep this inline (instead of routing through i18n) because the
// canonical codes are already cross-language shorthand that ladder
// climbers read natively — "M", "GM", "C".
const TIER_SHORT: Record<string, string> = {
  MASTER: 'M',
  GRANDMASTER: 'GM',
  CHALLENGER: 'C',
}
function tierShort(tier: string): string {
  return TIER_SHORT[tier] ?? tier
}

// Lazily construct one RelativeTimeFormat per locale. The ref lets us
// rebuild it if `locale` changes after mount (i18n switcher) without
// touching every computed binding.
const rtfCache = ref<Record<string, Intl.RelativeTimeFormat>>({})

function getRtf(currentLocale: string): Intl.RelativeTimeFormat {
  const cached = rtfCache.value[currentLocale]
  if (cached) return cached
  const rtf = new Intl.RelativeTimeFormat(currentLocale, { numeric: 'auto' })
  rtfCache.value = { ...rtfCache.value, [currentLocale]: rtf }
  return rtf
}

// Render a Unix-ms timestamp as "2 minutes ago" / "3 часа назад" in the
// active locale. Steps through minutes → hours → days so "5 min ago"
// stays "5 min ago" instead of becoming "0 hours ago".
function relativeTime(gameCreationMs: number, currentLocale: string): string {
  const diffMs = gameCreationMs - Date.now()
  const diffMin = Math.round(diffMs / 60_000)
  const rtf = getRtf(currentLocale)

  if (Math.abs(diffMin) < 60) {
    return rtf.format(diffMin, 'minute')
  }
  const diffHr = Math.round(diffMin / 60)
  if (Math.abs(diffHr) < 24) {
    return rtf.format(diffHr, 'hour')
  }
  const diffDay = Math.round(diffHr / 24)
  return rtf.format(diffDay, 'day')
}
</script>

<style scoped>
.live-feed {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 48px auto 24px;
  padding: 0 24px;
}

.live-feed__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.live-feed__head-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}

.live-feed__pulse {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--acid);
  box-shadow: 0 0 12px var(--acid);
  animation: live-feed-pulse 1.6s ease-in-out infinite;
  align-self: center;
}

@keyframes live-feed-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.45;
    transform: scale(0.7);
  }
}

.live-feed__kicker {
  font-size: 11px;
  color: var(--fg-dim);
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.live-feed__title {
  font-size: 32px;
  letter-spacing: -0.02em;
  color: var(--fg);
}

.live-feed__subtitle {
  color: var(--fg-dim);
  font-size: 14px;
  max-width: 420px;
}

.live-feed__state {
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  border: 1px dashed var(--border);
  border-radius: 6px;
}

.live-feed__state--error {
  border-color: var(--mag);
  color: var(--mag);
}

.live-feed__state-text {
  font-size: 12px;
  color: var(--fg-dim);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.live-feed__spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border);
  border-top-color: var(--acid);
  border-radius: 50%;
  animation: live-feed-spin 0.8s linear infinite;
}

@keyframes live-feed-spin {
  to {
    transform: rotate(360deg);
  }
}

.live-feed__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.live-feed__item {
  display: block;
}

.live-feed__card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 6px;
  color: var(--fg);
  text-decoration: none;
  transition:
    transform 0.15s,
    border-color 0.15s,
    box-shadow 0.15s;
}

.live-feed__card--tilt-1 {
  transform: rotate(-0.8deg);
}
.live-feed__card--tilt-2 {
  transform: rotate(0.6deg);
}
.live-feed__card--tilt-3 {
  transform: rotate(-0.3deg);
}

.live-feed__card:hover {
  transform: rotate(0) translateY(-2px);
  border-color: var(--acid);
  box-shadow: 0 8px 32px rgba(198, 255, 61, 0.12);
}

.live-feed__card--win {
  border-left: 3px solid var(--acid);
}
.live-feed__card--loss {
  border-left: 3px solid var(--mag);
}

.live-feed__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 10px;
  letter-spacing: 0.15em;
}

.live-feed__result {
  padding: 2px 8px;
  text-transform: uppercase;
  font-weight: 700;
}

.live-feed__result--win {
  background: var(--acid);
  color: #0a0b0f;
}

.live-feed__result--loss {
  background: var(--mag);
  color: #fff;
}

.live-feed__region {
  color: var(--cyan);
  font-size: 10px;
}

.live-feed__time {
  color: var(--fg-dim);
  font-size: 10px;
  margin-left: auto;
  white-space: nowrap;
}

.live-feed__card-body {
  display: flex;
  align-items: center;
  gap: 12px;
}

.live-feed__champ-icon {
  width: 52px;
  height: 52px;
  border-radius: 6px;
  flex-shrink: 0;
  object-fit: cover;
}

.live-feed__card-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.live-feed__player {
  font-size: 16px;
  font-weight: 600;
  color: var(--fg);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.live-feed__champ-name {
  font-size: 11px;
  color: var(--fg-dim);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.live-feed__kda {
  font-size: 13px;
  color: var(--fg);
  letter-spacing: 0.05em;
  margin-top: 2px;
}

.live-feed__kda-label {
  color: var(--fg-dim);
  font-size: 10px;
  margin-left: 4px;
  letter-spacing: 0.15em;
}

.live-feed__card-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: var(--fg-dim);
  letter-spacing: 0.1em;
  padding-top: 8px;
  border-top: 1px solid var(--border);
}

.live-feed__tier {
  color: var(--cyan);
}

.live-feed__lp {
  color: var(--fg-dim);
}

.live-feed__wr {
  color: var(--acid);
}

@media (max-width: 640px) {
  .live-feed__title {
    font-size: 24px;
  }

  .live-feed__list {
    grid-template-columns: 1fr;
  }
}
</style>
