import {
  getPlatformHost,
  getRegionalHost,
  riotFetch,
} from '~/server/utils/riot-client'
import type { LeagueList, MatchDto } from '~/server/utils/riot-types'

interface StoredPlayer {
  puuid: string
  gameName: string
  tier: string
  lp: number
  wins: number
  losses: number
  winRate: number
  champions: Record<string, number>
  totalGames: number
  region: string
}

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

function findChampionGames(
  champions: Record<string, number>,
  champion: string,
): number {
  // Try exact match first
  const exact = champions[champion]
  if (exact !== undefined) return exact

  // Case-insensitive match
  const lowerTarget = champion.toLowerCase()
  for (const [champ, count] of Object.entries(champions)) {
    if (champ.toLowerCase() === lowerTarget) {
      return count
    }
  }
  return 0
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const champion = (query['champion'] as string) ?? ''
  const region = (query['region'] as string) ?? 'euw'
  const tier = (query['tier'] as string) ?? 'challenger'

  if (!champion) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Champion parameter is required.',
    })
  }

  const validTiers = ['challenger', 'grandmaster', 'master']
  if (!validTiers.includes(tier)) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Invalid tier. Must be: challenger, grandmaster, or master.',
    })
  }

  // Try reading from pre-collected storage
  const storage = useStorage('data')
  const storageKey = `players:${region}:${tier}`
  const stored = await storage.getItem<StoredPlayer[]>(storageKey)

  if (stored && stored.length > 0) {
    const matching: ChampionPlayer[] = []

    for (const player of stored) {
      const games = findChampionGames(player.champions, champion)
      if (games > 0) {
        matching.push({
          puuid: player.puuid,
          gameName: player.gameName,
          tier: player.tier,
          lp: player.lp,
          wins: player.wins,
          losses: player.losses,
          winRate: player.winRate,
          gamesOnChampion: games,
          totalGames: player.totalGames,
          championPercent: Math.round((games / player.totalGames) * 100),
        })
      }
    }

    matching.sort(
      (a, b) => b.gamesOnChampion - a.gamesOnChampion || b.lp - a.lp,
    )

    const updated = await storage.getItem<number>(`updated:${region}:${tier}`)

    return {
      champion,
      region,
      tier,
      players: matching,
      cached: true,
      updatedAt: updated,
    }
  }

  // Fallback: live scan (limited to 5 players)
  const platformHost = getPlatformHost(region)
  const regionalHost = getRegionalHost(region)

  const league = await riotFetch<LeagueList>(
    platformHost,
    `/lol/league/v4/${tier}leagues/by-queue/RANKED_SOLO_5x5`,
  )

  const topPlayers = league.entries
    .sort((a, b) => b.leaguePoints - a.leaguePoints)
    .slice(0, 5)

  const allPlayers: ChampionPlayer[] = []

  for (const player of topPlayers) {
    try {
      const matchIds = await riotFetch<string[]>(
        regionalHost,
        `/lol/match/v5/matches/by-puuid/${player.puuid}/ids?queue=420&count=5`,
      )

      if (matchIds.length === 0) continue

      await delay(100)

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

      if (gamesOnChampion === 0) {
        await delay(100)
        continue
      }

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

      await delay(150)
    } catch {
      continue
    }
  }

  allPlayers.sort(
    (a, b) => b.gamesOnChampion - a.gamesOnChampion || b.lp - a.lp,
  )

  return {
    champion,
    region,
    tier,
    players: allPlayers,
    cached: false,
    updatedAt: null,
  }
})
