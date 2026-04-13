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
  return useFetch<LeagueResponse>(`/api/riot/league/${tier}`, {
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

export function useOtpApi(region: RegionCode, tier = 'challenger', limit = 10) {
  return useFetch<OtpResponse>('/api/riot/otp', {
    query: { region, tier, limit },
  })
}
