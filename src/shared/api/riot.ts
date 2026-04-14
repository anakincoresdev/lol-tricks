// Shared Riot API types and helpers.
// All calls go through the external lol-tricks-api backend — the frontend
// never touches RIOT_API_KEY itself.

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

export interface PlayerRuneInfo {
  keystone: number
  primaryStyle: number
  secondaryStyle: number
}

export type PlayerPosition = 'top' | 'jungle' | 'mid' | 'adc' | 'support' | null

export interface ChampionPlayer {
  puuid: string
  gameName: string
  region?: string
  tier: string
  rank?: string
  lp: number
  wins: number
  losses: number
  winRate: number
  masteryPoints: number
  masteryLevel: number
  runes?: PlayerRuneInfo | null
  position?: PlayerPosition
}

export interface ChampionPlayersResponse {
  champion: string
  region: string
  source?: 'cache' | 'riot'
  players: ChampionPlayer[]
}

export interface ChampionPlayersMultiResponse {
  champion: string
  regions: string[]
  byRegion: Record<
    string,
    { source: 'cache' | 'riot'; players: ChampionPlayer[] }
  >
  allPlayers: ChampionPlayer[]
  errors?: Record<string, string>
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

/**
 * Build a full URL to the lol-tricks-api backend.
 * NUXT_PUBLIC_API_BASE is required — nuxt.config.ts defaults it to
 * http://localhost:3000 for local dev.
 */
export function buildApiUrl(path: string): string {
  const runtime = useRuntimeConfig()
  const base = (runtime.public['apiBase'] as string) ?? ''
  const normalisedBase = base.replace(/\/+$/, '')
  const normalisedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalisedBase}${normalisedPath}`
}
