<template>
  <section class="top-players">
    <div class="top-players__header">
      <h2 class="top-players__title">Топ OTP игроков</h2>
      <p class="top-players__subtitle">Лучшие ваншотеры с высших рангов</p>
    </div>

    <div class="top-players__table-wrapper">
      <table class="top-players__table">
        <thead>
          <tr>
            <th class="top-players__th top-players__th--rank">#</th>
            <th class="top-players__th">Игрок</th>
            <th class="top-players__th">Чемпион</th>
            <th class="top-players__th top-players__th--hide-mobile">Регион</th>
            <th class="top-players__th">Ранг</th>
            <th class="top-players__th">WR</th>
            <th class="top-players__th top-players__th--hide-mobile">Игр</th>
            <th class="top-players__th">OTP%</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(player, index) in players"
            :key="player.id"
            class="top-players__row"
          >
            <td class="top-players__td top-players__td--rank">
              {{ index + 1 }}
            </td>
            <td class="top-players__td top-players__td--name">
              {{ player.summonerName }}
            </td>
            <td class="top-players__td top-players__td--champion">
              <img
                :src="getChampionImageUrl(player.mainChampionId)"
                :alt="player.mainChampionId"
                class="top-players__champion-icon"
                loading="lazy"
              />
              <span class="top-players__champion-name">
                {{ getChampionName(player.mainChampionId) }}
              </span>
            </td>
            <td class="top-players__td top-players__td--hide-mobile">
              <span class="top-players__region">
                {{ getRegionName(player.region) }}
              </span>
            </td>
            <td class="top-players__td">
              <span
                class="top-players__rank-badge"
                :class="getRankClass(player.rank)"
              >
                {{ player.rank }} {{ player.lp }} LP
              </span>
            </td>
            <td
              class="top-players__td"
              :class="player.winRate >= 60 ? 'top-players__td--high-wr' : ''"
            >
              {{ player.winRate }}%
            </td>
            <td class="top-players__td top-players__td--hide-mobile">
              {{ player.gamesPlayed }}
            </td>
            <td class="top-players__td top-players__td--otp">
              {{ player.mainChampionGamesPercent }}%
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Player } from '~/src/entities/player'
import { getChampionImageUrl, REGIONS } from '~/src/shared/config'
import { CHAMPIONS } from '~/src/entities/champion'
import type { RegionCode } from '~/src/shared/config'

defineProps<{
  players: Player[]
}>()

function getChampionName(championId: string): string {
  const champion = CHAMPIONS.find((c) => c.id === championId)
  return champion ? champion.name : championId
}

function getRegionName(regionCode: RegionCode): string {
  const region = REGIONS.find((r) => r.code === regionCode)
  return region ? region.name : regionCode.toUpperCase()
}

function getRankClass(rank: string): string {
  const lower = rank.toLowerCase()
  if (lower === 'challenger') {
    return 'top-players__rank-badge--challenger'
  }
  if (lower === 'grandmaster') {
    return 'top-players__rank-badge--grandmaster'
  }
  return 'top-players__rank-badge--master'
}
</script>

<style scoped>
.top-players {
  padding: 48px 0;
}

.top-players__header {
  margin-bottom: 24px;
}

.top-players__title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--fg);
  margin-bottom: 6px;
}

.top-players__subtitle {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--fg-dim);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.top-players__table-wrapper {
  overflow-x: auto;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: var(--surface);
}

.top-players__table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
}

.top-players__th {
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

.top-players__th--rank {
  width: 40px;
  text-align: center;
}

.top-players__row {
  transition: background 0.15s;
  border-bottom: 1px solid var(--border);
}

.top-players__row:hover {
  background: var(--bg-2);
}

.top-players__td {
  padding: 14px 14px;
  white-space: nowrap;
  vertical-align: middle;
}

.top-players__td--rank {
  text-align: center;
  color: var(--fg-dim);
  font-weight: 700;
}

.top-players__td--name {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: var(--fg);
}

.top-players__td--champion {
  display: flex;
  align-items: center;
  gap: 8px;
}

.top-players__champion-icon {
  width: 28px;
  height: 28px;
  border-radius: 3px;
  border: 1px solid var(--border);
}

.top-players__champion-name {
  color: var(--fg);
}

.top-players__region {
  color: var(--fg-dim);
}

.top-players__rank-badge {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 3px;
  letter-spacing: 0.05em;
}

.top-players__rank-badge--challenger {
  color: var(--bg);
  background: var(--mag);
}

.top-players__rank-badge--grandmaster {
  color: var(--bg);
  background: var(--cyan);
}

.top-players__rank-badge--master {
  color: var(--bg);
  background: var(--acid);
}

.top-players__td--high-wr {
  color: var(--acid);
  font-weight: 600;
}

.top-players__td--otp {
  color: var(--acid);
  font-weight: 700;
}

.top-players__td--hide-mobile,
.top-players__th--hide-mobile {
  display: none;
}

@media (min-width: 768px) {
  .top-players__td--hide-mobile,
  .top-players__th--hide-mobile {
    display: table-cell;
  }
}
</style>
