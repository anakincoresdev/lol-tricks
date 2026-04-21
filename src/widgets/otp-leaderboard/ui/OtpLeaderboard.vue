<template>
  <section class="otp-leaderboard">
    <div class="otp-leaderboard__header">
      <h2 class="otp-leaderboard__title">{{ t('otpLeaderboard.title') }}</h2>
      <p class="otp-leaderboard__subtitle">
        {{ t('otpLeaderboard.subtitle') }}
      </p>
    </div>

    <div class="otp-leaderboard__controls">
      <select v-model="selectedRegion" class="otp-leaderboard__select">
        <option v-for="r in REGIONS" :key="r.code" :value="r.code">
          {{ t(`regions.${r.code}`) }}
        </option>
      </select>
      <select v-model="selectedTier" class="otp-leaderboard__select">
        <option value="challenger">
          {{ t('otpLeaderboard.tiers.challenger') }}
        </option>
        <option value="grandmaster">
          {{ t('otpLeaderboard.tiers.grandmaster') }}
        </option>
        <option value="master">
          {{ t('otpLeaderboard.tiers.master') }}
        </option>
      </select>
      <button class="otp-leaderboard__btn" :disabled="loading" @click="load">
        {{ loading ? t('common.loading') : t('common.load') }}
      </button>
    </div>

    <div v-if="error" class="otp-leaderboard__error">
      {{ errorMessage }}
    </div>

    <div v-if="loading" class="otp-leaderboard__loading">
      <p>{{ t('otpLeaderboard.analyzing') }}</p>
    </div>

    <div
      v-if="data && data.players.length > 0 && !loading"
      class="otp-leaderboard__table-wrapper"
    >
      <table class="otp-leaderboard__table">
        <thead>
          <tr>
            <th class="otp-leaderboard__th otp-leaderboard__th--rank">#</th>
            <th class="otp-leaderboard__th">
              {{ t('otpLeaderboard.th.player') }}
            </th>
            <th class="otp-leaderboard__th">
              {{ t('otpLeaderboard.th.champion') }}
            </th>
            <th class="otp-leaderboard__th">
              {{ t('otpLeaderboard.th.rank') }}
            </th>
            <th class="otp-leaderboard__th">
              {{ t('otpLeaderboard.th.wr') }}
            </th>
            <th class="otp-leaderboard__th">
              {{ t('otpLeaderboard.th.otp') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(player, index) in data.players"
            :key="player.puuid"
            class="otp-leaderboard__row"
          >
            <td class="otp-leaderboard__td otp-leaderboard__td--rank">
              {{ index + 1 }}
            </td>
            <td class="otp-leaderboard__td otp-leaderboard__td--name">
              {{ player.gameName }}
            </td>
            <td class="otp-leaderboard__td otp-leaderboard__td--champion">
              <img
                :src="getChampionImageUrl(player.mainChampion)"
                :alt="player.mainChampion"
                class="otp-leaderboard__champion-icon"
                loading="lazy"
              />
              <span>{{ player.mainChampion }}</span>
            </td>
            <td class="otp-leaderboard__td">
              <span
                class="otp-leaderboard__rank-badge"
                :class="getRankClass(player.tier)"
              >
                {{ player.tier }} {{ player.lp }} LP
              </span>
            </td>
            <td
              class="otp-leaderboard__td"
              :class="
                player.winRate >= 60 ? 'otp-leaderboard__td--high-wr' : ''
              "
            >
              {{ player.winRate }}%
            </td>
            <td class="otp-leaderboard__td otp-leaderboard__td--otp">
              {{ player.otpPercent }}%
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="data && data.players.length === 0 && !loading"
      class="otp-leaderboard__empty"
    >
      <p>
        {{ t('otpLeaderboard.empty', { threshold: data.otpThreshold }) }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { REGIONS, getChampionImageUrl } from '~/src/shared/config'
import type { RegionCode } from '~/src/shared/config'
import { api, ApiError } from '~/src/shared/api'
import type { OtpResponse } from '~/src/shared/api'
import { useI18n } from '#imports'

const { t } = useI18n()

const selectedRegion = ref<RegionCode>('euw')
const selectedTier = ref('challenger')
const loading = ref(false)
const error = ref<string | null>(null)
const data = ref<OtpResponse | null>(null)

const errorMessage = computed(() => {
  if (!error.value) {
    return ''
  }
  if (error.value.includes('403')) {
    return t('errors.invalidApiKey')
  }
  if (error.value.includes('429')) {
    return t('errors.rateLimited')
  }
  return t('common.error', { message: error.value })
})

async function load(): Promise<void> {
  loading.value = true
  error.value = null

  try {
    data.value = await api.otp.list(selectedRegion.value, selectedTier.value, 5)
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

function getRankClass(tier: string): string {
  const lower = tier.toLowerCase()
  if (lower === 'challenger') {
    return 'otp-leaderboard__rank-badge--challenger'
  }
  if (lower === 'grandmaster') {
    return 'otp-leaderboard__rank-badge--grandmaster'
  }
  return 'otp-leaderboard__rank-badge--master'
}
</script>

<style scoped>
.otp-leaderboard {
  padding: 48px 0;
  border-top: 1px solid var(--border);
}

.otp-leaderboard__header {
  margin-bottom: 24px;
}

.otp-leaderboard__title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--fg);
  margin-bottom: 6px;
}

.otp-leaderboard__subtitle {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--fg-dim);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.otp-leaderboard__controls {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.otp-leaderboard__select {
  padding: 8px 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--fg);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.05em;
  outline: none;
  cursor: pointer;
}

.otp-leaderboard__select:focus {
  border-color: var(--acid);
}

.otp-leaderboard__select option {
  background: var(--bg);
  color: var(--fg);
}

.otp-leaderboard__btn {
  padding: 8px 20px;
  background: var(--acid);
  border: none;
  border-radius: 4px;
  color: var(--bg);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity 0.15s;
}

.otp-leaderboard__btn:hover:not(:disabled) {
  opacity: 0.85;
}

.otp-leaderboard__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.otp-leaderboard__error {
  padding: 12px 16px;
  background: color-mix(in oklab, var(--red) 10%, transparent);
  border: 1px solid var(--red);
  border-radius: 4px;
  color: var(--red);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  margin-bottom: 16px;
}

.otp-leaderboard__loading {
  padding: 32px;
  text-align: center;
  color: var(--fg-dim);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.otp-leaderboard__table-wrapper {
  overflow-x: auto;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: var(--surface);
}

.otp-leaderboard__table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
}

.otp-leaderboard__th {
  text-align: left;
  padding: 10px 14px;
  color: var(--fg-dim);
  font-weight: 600;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

.otp-leaderboard__th--rank {
  width: 40px;
  text-align: center;
}

.otp-leaderboard__row {
  transition: background 0.15s;
  border-bottom: 1px solid var(--border);
}

.otp-leaderboard__row:hover {
  background: var(--bg-2);
}

.otp-leaderboard__td {
  padding: 14px 14px;
  white-space: nowrap;
  vertical-align: middle;
}

.otp-leaderboard__td--rank {
  text-align: center;
  color: var(--fg-dim);
  font-weight: 700;
}

.otp-leaderboard__td--name {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: var(--fg);
}

.otp-leaderboard__td--champion {
  display: flex;
  align-items: center;
  gap: 8px;
}

.otp-leaderboard__champion-icon {
  width: 28px;
  height: 28px;
  border-radius: 3px;
  border: 1px solid var(--border);
}

.otp-leaderboard__rank-badge {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 3px;
  letter-spacing: 0.05em;
}

.otp-leaderboard__rank-badge--challenger {
  color: var(--bg);
  background: var(--mag);
}

.otp-leaderboard__rank-badge--grandmaster {
  color: var(--bg);
  background: var(--cyan);
}

.otp-leaderboard__rank-badge--master {
  color: var(--bg);
  background: var(--acid);
}

.otp-leaderboard__td--high-wr {
  color: var(--acid);
  font-weight: 600;
}

.otp-leaderboard__td--otp {
  color: var(--acid);
  font-weight: 700;
}

.otp-leaderboard__empty {
  text-align: center;
  padding: 32px;
  color: var(--fg-dim);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
</style>
