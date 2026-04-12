import {
  getPlatformHost,
  getRegionalHost,
  riotFetch,
} from '~/server/utils/riot-client'
import type { LeagueList, MatchDto } from '~/server/utils/riot-types'

interface OtpPlayer {
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

const OTP_THRESHOLD = 35 // Minimum % of games on one champion

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const region = (query['region'] as string) ?? 'euw'
  const tier = (query['tier'] as string) ?? 'challenger'
  const limit = Math.min(Number(query['limit']) || 5, 10)

  const validTiers = ['challenger', 'grandmaster', 'master']
  if (!validTiers.includes(tier)) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Invalid tier. Must be: challenger, grandmaster, or master.',
    })
  }

  const platformHost = getPlatformHost(region)
  const regionalHost = getRegionalHost(region)

  // 1. Get league entries (single API call)
  const league = await riotFetch<LeagueList>(
    platformHost,
    `/lol/league/v4/${tier}leagues/by-queue/RANKED_SOLO_5x5`,
  )

  // Sort by LP and take top players
  const topPlayers = league.entries
    .sort((a, b) => b.leaguePoints - a.leaguePoints)
    .slice(0, limit)

  // 2. Analyze players sequentially with rate-limit delays
  const otpPlayers: OtpPlayer[] = []

  for (const player of topPlayers) {
    try {
      // Get recent 5 match IDs (smaller batch to stay within limits)
      const matchIds = await riotFetch<string[]>(
        regionalHost,
        `/lol/match/v5/matches/by-puuid/${player.puuid}/ids?queue=420&count=5`,
      )

      if (matchIds.length === 0) {
        continue
      }

      // Small delay to respect rate limit
      await delay(100)

      // Fetch only 3 match details to stay fast
      const matchDetails = await Promise.all(
        matchIds
          .slice(0, 3)
          .map((matchId) =>
            riotFetch<MatchDto>(
              regionalHost,
              `/lol/match/v5/matches/${matchId}`,
            ),
          ),
      )

      // Count champions played
      const championCount: Record<string, number> = {}
      for (const match of matchDetails) {
        const participant = match.info.participants.find(
          (p) => p.puuid === player.puuid,
        )
        if (participant) {
          const champ = participant.championName
          championCount[champ] = (championCount[champ] ?? 0) + 1
        }
      }

      // Find most played champion
      let mainChampion = ''
      let maxGames = 0
      for (const [champ, count] of Object.entries(championCount)) {
        if (count > maxGames) {
          mainChampion = champ
          maxGames = count
        }
      }

      const totalGames = matchDetails.length
      const otpPercent = Math.round((maxGames / totalGames) * 100)

      // Get player display name
      const firstMatch = matchDetails[0]
      const participantData = firstMatch?.info.participants.find(
        (p) => p.puuid === player.puuid,
      )
      const gameName =
        participantData?.riotIdGameName ??
        participantData?.summonerName ??
        'Unknown'

      otpPlayers.push({
        puuid: player.puuid,
        gameName,
        tier: league.tier,
        lp: player.leaguePoints,
        wins: player.wins,
        losses: player.losses,
        winRate: Math.round(
          (player.wins / (player.wins + player.losses)) * 100,
        ),
        mainChampion,
        mainChampionGames: maxGames,
        totalGames,
        otpPercent,
      })

      // Delay between players to avoid rate limit
      await delay(200)
    } catch {
      continue
    }
  }

  // Sort: OTP first, then by LP
  otpPlayers.sort((a, b) => b.otpPercent - a.otpPercent || b.lp - a.lp)

  return {
    region,
    tier,
    otpThreshold: OTP_THRESHOLD,
    players: otpPlayers,
  }
})
