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

// --- /api/riot/champion-players/global ---------------------------------
// Global (cross-region) top-100 from backend DB. No region param — the
// endpoint returns the best Master+ players on a champion across all
// tracked regions (currently euw/na/kr), sorted by quality tier then
// by LP DESC. Region filter is applied client-side if needed.
//
// Quality tiers (see lol-tricks-api/src/routes/champion-players-global.ts):
//   main    — ≥30 games in 60d window, ≥20% share, WR > 50%
//   regular — ≥10 games,               ≥10% share, WR > 50%
//   casual  — ≥5 games,                any share, any WR
//   trial   — 2-4 games (fallback for off-meta champs)

export type PlayerQuality = 'main' | 'regular' | 'casual' | 'trial'

export interface ChampionPlayerGlobal {
  puuid: string
  gameName: string
  region: string
  tier: string
  rank: string
  lp: number
  totalGames: number
  championGames: number
  championWins: number
  championLosses: number
  championWinRate: number
  championShare: number
  quality: PlayerQuality
  roles: {
    top: number
    jungle: number
    mid: number
    adc: number
    support: number
  }
}

export interface ChampionPlayersGlobalResponse {
  champion: string
  window: string
  qualityMix: Partial<Record<PlayerQuality, number>>
  players: ChampionPlayerGlobal[]
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
 *
 * `apiBase` comes from `runtimeConfig.public.apiBase` (env
 * `NUXT_PUBLIC_API_BASE`). `nuxt.config.ts` pins a prod default so that
 * Vercel builds work with no env vars set; override with
 * `NUXT_PUBLIC_API_BASE=http://localhost:3001` for local dev against
 * the backend running on port 3001.
 *
 * Throws if the base is empty — we'd rather fail loudly on boot than
 * quietly issue requests to `/` and watch SSR 404 for every call.
 */
export function buildApiUrl(path: string): string {
  const runtime = useRuntimeConfig()
  const rawBase = runtime.public['apiBase'] as string | undefined
  const base = (rawBase ?? '').trim()
  if (!base) {
    throw new Error(
      'NUXT_PUBLIC_API_BASE is not configured. Set it in your env or ' +
        'in nuxt.config.ts runtimeConfig.public.apiBase.',
    )
  }
  const normalisedBase = base.replace(/\/+$/, '')
  const normalisedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalisedBase}${normalisedPath}`
}
