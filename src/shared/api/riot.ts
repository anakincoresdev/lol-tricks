import type { RegionCode } from '~/src/shared/config'

export interface LeaguePlayer {
  summonerId: string
  puuid: string
  tier: string
  rank: string
  lp: number
  wins: number
  losses: number
  winRate: number
  hotStreak: boolean
}

export interface LeagueResponse {
  tier: string
  region: string
  players: LeaguePlayer[]
}

export interface OtpPlayer {
  puuid: string
  gameName: string
  tier: string
  lp: number
  wins: number
  losses: number
  winRate: number
  mainChampion: string
  mainChampionGames: number
  totalGames: number
  otpPercent: number
}

export interface OtpResponse {
  region: string
  tier: string
  otpThreshold: number
  players: OtpPlayer[]
}

export function useLeagueApi(tier: string, region: RegionCode) {
  const config = useRuntimeConfig()
  const apiBase = config.public['apiBaseUrl'] as string
  return useFetch<LeagueResponse>(`${apiBase}/api/riot/league/${tier}`, {
    query: { region },
  })
}

export interface ChampionPlayer {
  puuid: string
  gameName: string
  tier: string
  lp: number
  wins: number
  losses: number
  winRate: number
  masteryPoints: number
  masteryLevel: number
}

export interface ChampionPlayersResponse {
  champion: string
  region: string
  players: ChampionPlayer[]
}

export interface PlayerChampionMatch {
  matchId: string
  win: boolean
  kills: number
  deaths: number
  assists: number
  items: number[]
  runes: { style: number; runes: number[] }[]
  summoner1Id: number
  summoner2Id: number
  cs: number
  gameDuration: number
  gameCreation: number
  position: string
}

export interface PlayerChampionMatchesResponse {
  puuid: string
  champion: string
  region: string
  gameName: string
  masteryPoints: number
  masteryLevel: number
  matches: PlayerChampionMatch[]
}

export function useOtpApi(region: RegionCode, tier = 'challenger', limit = 10) {
  const config = useRuntimeConfig()
  const apiBase = config.public['apiBaseUrl'] as string
  return useFetch<OtpResponse>(`${apiBase}/api/riot/otp`, {
    query: { region, tier, limit },
  })
}
