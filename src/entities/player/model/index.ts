import type { RegionCode } from '~/src/shared/config'

export interface Player {
  id: string
  summonerName: string
  region: RegionCode
  rank: string
  lp: number
  winRate: number
  gamesPlayed: number
  mainChampionId: string
  mainChampionGamesPercent: number
}

export { MOCK_TOP_PLAYERS } from './mock-players'
