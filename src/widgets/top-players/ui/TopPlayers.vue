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
  padding: 3rem 0;
}

.top-players__header {
  margin-bottom: 1.5rem;
}

.top-players__title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f0e6d2;
  margin-bottom: 0.25rem;
}

.top-players__subtitle {
  font-size: 0.95rem;
  color: #6a6a7a;
}

.top-players__table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.top-players__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.top-players__th {
  text-align: left;
  padding: 12px 16px;
  color: #6a6a7a;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  white-space: nowrap;
}

.top-players__th--rank {
  width: 40px;
  text-align: center;
}

.top-players__row {
  transition: background 0.15s;
}

.top-players__row:hover {
  background: rgba(200, 155, 60, 0.05);
}

.top-players__td {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  white-space: nowrap;
}

.top-players__td--rank {
  text-align: center;
  color: #6a6a7a;
  font-weight: 700;
  font-size: 0.85rem;
}

.top-players__td--name {
  font-weight: 600;
  color: #e0e0e0;
}

.top-players__td--champion {
  display: flex;
  align-items: center;
  gap: 8px;
}

.top-players__champion-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid rgba(200, 155, 60, 0.3);
}

.top-players__champion-name {
  color: #c8c8d0;
}

.top-players__region {
  color: #8a8a9a;
  font-size: 0.85rem;
}

.top-players__rank-badge {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
}

.top-players__rank-badge--challenger {
  color: #f0c040;
  background: rgba(240, 192, 64, 0.1);
}

.top-players__rank-badge--grandmaster {
  color: #e05050;
  background: rgba(224, 80, 80, 0.1);
}

.top-players__rank-badge--master {
  color: #b060e0;
  background: rgba(176, 96, 224, 0.1);
}

.top-players__td--high-wr {
  color: #4ec97a;
  font-weight: 600;
}

.top-players__td--otp {
  color: #c89b3c;
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
