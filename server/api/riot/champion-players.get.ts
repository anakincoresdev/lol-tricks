import {
  getPlatformHost,
  getRegionalHost,
  riotFetch,
} from '~/server/utils/riot-client'
import type { LeagueList, MatchDto } from '~/server/utils/riot-types'

interface ChampionPlayer {
  puuid: string
  gameName: string
  tier: string
  lp: number
  wins: number
  losses: number
  winRate: number
  gamesOnChampion: number
  totalGames: number
  championPercent: number
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const champion = (query['champion'] as string) ?? ''
  const region = (query['region'] as string) ?? 'euw'

  if (!champion) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Champion parameter is required.',
    })
  }

  const platformHost = getPlatformHost(region)
  const regionalHost = getRegionalHost(region)

  const tiers = ['challenger', 'grandmaster', 'master'] as const
  const allPlayers: ChampionPlayer[] = []

  for (const tier of tiers) {
    const league = await riotFetch<LeagueList>(
      platformHost,
      `/lol/league/v4/${tier}leagues/by-queue/RANKED_SOLO_5x5`,
    )

    // Take top 10 players per tier sorted by LP
    const topPlayers = league.entries
      .sort((a, b) => b.leaguePoints - a.leaguePoints)
      .slice(0, 10)

    for (const player of topPlayers) {
      try {
        const matchIds = await riotFetch<string[]>(
          regionalHost,
          `/lol/match/v5/matches/by-puuid/${player.puuid}/ids?queue=420&count=10`,
        )

        if (matchIds.length === 0) continue

        await delay(100)

        // Fetch up to 5 match details
        const matchDetails = await Promise.all(
          matchIds
            .slice(0, 5)
            .map((matchId) =>
              riotFetch<MatchDto>(
                regionalHost,
                `/lol/match/v5/matches/${matchId}`,
              ),
            ),
        )

        // Count games on the target champion
        let gamesOnChampion = 0
        for (const match of matchDetails) {
          const participant = match.info.participants.find(
            (p) => p.puuid === player.puuid,
          )
          if (
            participant &&
            participant.championName.toLowerCase() === champion.toLowerCase()
          ) {
            gamesOnChampion++
          }
        }

        // Only include if they played this champion at least once
        if (gamesOnChampion === 0) {
          await delay(150)
          continue
        }

        // Get player display name from first match
        const firstMatch = matchDetails[0]
        const participantData = firstMatch?.info.participants.find(
          (p) => p.puuid === player.puuid,
        )
        const gameName =
          participantData?.riotIdGameName ??
          participantData?.summonerName ??
          'Unknown'

        const totalGames = matchDetails.length

        allPlayers.push({
          puuid: player.puuid,
          gameName,
          tier: league.tier,
          lp: player.leaguePoints,
          wins: player.wins,
          losses: player.losses,
          winRate: Math.round(
            (player.wins / (player.wins + player.losses)) * 100,
          ),
          gamesOnChampion,
          totalGames,
          championPercent: Math.round((gamesOnChampion / totalGames) * 100),
        })

        await delay(200)
      } catch {
        continue
      }
    }

    // Small delay between tiers
    await delay(200)
  }

  // Sort: most games on champion first, then by LP
  allPlayers.sort(
    (a, b) => b.gamesOnChampion - a.gamesOnChampion || b.lp - a.lp,
  )

  return {
    champion,
    region,
    players: allPlayers,
  }
})
