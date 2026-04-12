<template>
  <section class="otp-leaderboard">
    <div class="otp-leaderboard__header">
      <h2 class="otp-leaderboard__title">OTP Рейтинг (Live)</h2>
      <p class="otp-leaderboard__subtitle">
        Реальные данные из Riot API — топ ваншотеров
      </p>
    </div>

    <div class="otp-leaderboard__controls">
      <select v-model="selectedRegion" class="otp-leaderboard__select">
        <option v-for="r in REGIONS" :key="r.code" :value="r.code">
          {{ r.name }}
        </option>
      </select>
      <select v-model="selectedTier" class="otp-leaderboard__select">
        <option value="challenger">Challenger</option>
        <option value="grandmaster">Grandmaster</option>
        <option value="master">Master</option>
      </select>
      <button class="otp-leaderboard__btn" :disabled="loading" @click="load">
        {{ loading ? 'Загрузка...' : 'Загрузить' }}
      </button>
    </div>

    <div v-if="error" class="otp-leaderboard__error">
      {{ errorMessage }}
    </div>

    <div v-if="loading" class="otp-leaderboard__loading">
      <p>Анализируем матчи игроков... Это может занять до минуты.</p>
    </div>

    <div
      v-if="data && data.players.length > 0 && !loading"
      class="otp-leaderboard__table-wrapper"
    >
      <table class="otp-leaderboard__table">
        <thead>
          <tr>
            <th class="otp-leaderboard__th otp-leaderboard__th--rank">#</th>
            <th class="otp-leaderboard__th">Игрок</th>
            <th class="otp-leaderboard__th">Чемпион</th>
            <th class="otp-leaderboard__th">Ранг</th>
            <th class="otp-leaderboard__th">WR</th>
            <th class="otp-leaderboard__th">OTP%</th>
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
        Не найдено OTP-игроков с порогом {{ data.otpThreshold }}% среди топ
        игроков.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { REGIONS, getChampionImageUrl } from '~/src/shared/config'
import type { RegionCode } from '~/src/shared/config'
import type { OtpResponse } from '~/src/shared/api'

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
    return 'API ключ недействителен или истёк. Обнови ключ в .env файле.'
  }
  if (error.value.includes('429')) {
    return 'Превышен лимит запросов. Подожди немного и попробуй снова.'
  }
  return `Ошибка: ${error.value}`
})

async function load(): Promise<void> {
  loading.value = true
  error.value = null

  try {
    const response = await $fetch<OtpResponse>('/api/riot/otp', {
      query: {
        region: selectedRegion.value,
        tier: selectedTier.value,
        limit: 10,
      },
    })
    data.value = response
  } catch (e: unknown) {
    const err = e as { statusMessage?: string; message?: string }
    error.value = err.statusMessage ?? err.message ?? 'Unknown error'
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
  padding: 3rem 0;
  border-top: 1px solid rgba(200, 155, 60, 0.1);
}

.otp-leaderboard__header {
  margin-bottom: 1.5rem;
}

.otp-leaderboard__title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f0e6d2;
  margin-bottom: 0.25rem;
}

.otp-leaderboard__subtitle {
  font-size: 0.95rem;
  color: #6a6a7a;
}

.otp-leaderboard__controls {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.otp-leaderboard__select {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(200, 155, 60, 0.2);
  border-radius: 8px;
  color: #e0e0e0;
  font-size: 0.9rem;
  outline: none;
  cursor: pointer;
}

.otp-leaderboard__select:focus {
  border-color: rgba(200, 155, 60, 0.5);
}

.otp-leaderboard__select option {
  background: #1a1a2e;
  color: #e0e0e0;
}

.otp-leaderboard__btn {
  padding: 8px 20px;
  background: linear-gradient(135deg, #c89b3c, #a07830);
  border: none;
  border-radius: 8px;
  color: #0a0a0f;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.otp-leaderboard__btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #d4a84a, #b08838);
  transform: translateY(-1px);
}

.otp-leaderboard__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.otp-leaderboard__error {
  padding: 12px 16px;
  background: rgba(224, 80, 80, 0.1);
  border: 1px solid rgba(224, 80, 80, 0.3);
  border-radius: 8px;
  color: #e05050;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.otp-leaderboard__loading {
  padding: 2rem;
  text-align: center;
  color: #8a8a9a;
}

.otp-leaderboard__table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid rgba(200, 155, 60, 0.15);
}

.otp-leaderboard__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.otp-leaderboard__th {
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

.otp-leaderboard__th--rank {
  width: 40px;
  text-align: center;
}

.otp-leaderboard__row {
  transition: background 0.15s;
}

.otp-leaderboard__row:hover {
  background: rgba(200, 155, 60, 0.05);
}

.otp-leaderboard__td {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  white-space: nowrap;
}

.otp-leaderboard__td--rank {
  text-align: center;
  color: #6a6a7a;
  font-weight: 700;
}

.otp-leaderboard__td--name {
  font-weight: 600;
  color: #e0e0e0;
}

.otp-leaderboard__td--champion {
  display: flex;
  align-items: center;
  gap: 8px;
}

.otp-leaderboard__champion-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid rgba(200, 155, 60, 0.3);
}

.otp-leaderboard__rank-badge {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
}

.otp-leaderboard__rank-badge--challenger {
  color: #f0c040;
  background: rgba(240, 192, 64, 0.1);
}

.otp-leaderboard__rank-badge--grandmaster {
  color: #e05050;
  background: rgba(224, 80, 80, 0.1);
}

.otp-leaderboard__rank-badge--master {
  color: #b060e0;
  background: rgba(176, 96, 224, 0.1);
}

.otp-leaderboard__td--high-wr {
  color: #4ec97a;
  font-weight: 600;
}

.otp-leaderboard__td--otp {
  color: #c89b3c;
  font-weight: 700;
}

.otp-leaderboard__empty {
  text-align: center;
  padding: 2rem;
  color: #5a5a6a;
}
</style>
