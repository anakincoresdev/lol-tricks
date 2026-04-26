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
// Global (cross-region) OTP leaderboard from the backend DB. No region
// param — the endpoint returns every qualifying Master+ player on a
// champion across all tracked regions (currently euw/na/kr), sorted by
// quality tier then by LP DESC. Region filter is applied client-side.
//
// Selection is a uniform hard filter (all must hold): Master+ rank,
// >10 games on champion in the 60d window, play rate ≥ 15%, WR > 50%.
// The filter alone bounds the result set to at most a few hundred
// rows per champion, so no hard row cap is applied.
//
// Quality is a soft label on top of the hard filter
// (see lol-tricks-api/src/routes/champion-players-global.ts):
//   main    — ≥30 games AND ≥20% play rate (hard OTP)
//   regular — passes the hard filter but below the "main" bar

export type PlayerQuality = 'main' | 'regular'

// Most-played keystone + secondary rune tree for a player × champion
// across the 60d window. Backend returns null for both fields when the
// champion has no valid rune data in the window.
export interface ChampionPlayerRunes {
  keystone: number
  secondaryStyle: number
}

// Average KDA (one decimal) across the player's champion games in the
// 60d window. Null when the player has zero games on the champion
// (should not happen in practice, since the SQL filter already requires
// championGames ≥ 2).
export interface ChampionPlayerKda {
  kills: number
  deaths: number
  assists: number
}

export interface ChampionPlayerGlobal {
  puuid: string
  gameName: string
  region: string
  tier: string
  rank: string
  lp: number
  // Riot profile icon id, null when seed-masters hasn't backfilled the
  // player yet. Frontend falls back to a neutral placeholder in that case.
  profileIconId: number | null
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
  runes: ChampionPlayerRunes | null
  kda: ChampionPlayerKda | null
  // Most-played first legendary item id across the player's champion
  // games in the 60d window. Null when the timeline backfill
  // (ops/backfill-timeline.cjs on the backend) hasn't landed a value
  // for any of the player's games yet — the frontend renders a neutral
  // placeholder in that case.
  firstItem: number | null
}

export interface ChampionPlayersGlobalResponse {
  champion: string
  window: string
  qualityMix: Partial<Record<PlayerQuality, number>>
  players: ChampionPlayerGlobal[]
}

// --- /api/riot/live-otp-feed ------------------------------------------
// Home-page "live feed": the N most recent ranked solo matches played
// by a qualifying Master+ OTP on their OTP-champion. One row per
// (match × player) — so a game with two tracked OTPs can appear twice
// under different championName/player pairs. `gameCreation` is a Unix
// millisecond epoch so the client can feed it straight into
// `Intl.RelativeTimeFormat` for "5 minutes ago" rendering.

export interface LiveOtpFeedPlayer {
  puuid: string
  gameName: string
  tier: string
  rank: string
  lp: number
  profileIconId: number | null
  // Context for hover tooltips: "this player has X games on this champ,
  // Y% WR, Z% play rate" — all ints, percentages 0..100.
  championGames: number
  championWinRate: number
  championShare: number
}

export interface LiveOtpFeedMatch {
  matchId: string
  region: string
  gameCreation: number
  gameDuration: number
  championName: string
  kills: number
  deaths: number
  assists: number
  win: boolean
  player: LiveOtpFeedPlayer
}

export interface LiveOtpFeedResponse {
  window: string
  limit: number
  matches: LiveOtpFeedMatch[]
}

// A single participant in a match — the backend attaches all 10 of
// these to each `PlayerChampionMatch` so the client can render the
// full roster (allies + enemies) without additional requests. The team
// split is derived from the `win` flag compared to the target player.
export interface MatchParticipantSummary {
  puuid: string
  // Display name formatted as `riotIdGameName#tagLine` when both are
  // present, otherwise falls back to the legacy summoner name. May be
  // 'Unknown' for very old matches with missing identity fields.
  gameName: string
  championName: string
  kills: number
  deaths: number
  assists: number
  cs: number
  position: string
  win: boolean
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
  // All 10 players in the match (5 allies + 5 enemies from the target
  // player's perspective). Includes the target player themselves.
  participants: MatchParticipantSummary[]
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

// --- /api/riot/player-matches -----------------------------------------
// All-champion match history for a single puuid. Same per-match shape
// as `PlayerChampionMatch` except `championName` is now a property of
// the match row itself (since the player was presumably on different
// champs across the window). Account-level fields (gameName, profile
// icon, tier/rank/lp) are hoisted to the response so the page header
// can render before the match list is ready.
export interface PlayerMatch {
  matchId: string
  championName: string
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
  participants: MatchParticipantSummary[]
}

export interface PlayerMatchesResponse {
  puuid: string
  region: string
  gameName: string
  profileIconId: number | null
  // Backend returns null for any of tier/rank/lp when the player is
  // not tracked in the DB and the league-v4 fallback failed or turned
  // up no solo-queue entry.
  tier: string | null
  rank: string | null
  lp: number | null
  matches: PlayerMatch[]
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
