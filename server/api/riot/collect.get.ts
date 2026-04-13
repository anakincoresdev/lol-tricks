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

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function batchRequests<T>(
  fns: (() => Promise<T>)[],
  batchSize: number,
  delayMs: number,
): Promise<(T | null)[]> {
  const results: (T | null)[] = []
  for (let i = 0; i < fns.length; i += batchSize) {
    const batch = fns.slice(i, i + batchSize)
    const settled = await Promise.allSettled(batch.map((fn) => fn()))
    for (const r of settled) {
      results.push(r.status === 'fulfilled' ? r.value : null)
    }
    if (i + batchSize < fns.length) {
      await delay(delayMs)
    }
  }
  return results
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const region = (query['region'] as string) ?? 'euw'
  const tier = (query['tier'] as string) ?? 'challenger'
  const secret = query['secret'] as string

  const config = useRuntimeConfig()
  const cronSecret = config.cronSecret as string

  // Allow: query secret, Authorization header, or 'manual' for dev
  const authHeader = getHeader(event, 'authorization')
  const isAuthorized =
    (cronSecret && secret === cronSecret) ||
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    secret === 'manual'

  if (!isAuthorized) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const validTiers = ['challenger', 'grandmaster', 'master']
  if (!validTiers.includes(tier)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid tier' })
  }

  const platformHost = getPlatformHost(region)
  const regionalHost = getRegionalHost(region)

  const league = await riotFetch<LeagueList>(
    platformHost,
    `/lol/league/v4/${tier}leagues/by-queue/RANKED_SOLO_5x5`,
  )

  // Scan top 10 players to fit within Vercel 10s timeout
  const topPlayers = league.entries
    .sort((a, b) => b.leaguePoints - a.leaguePoints)
    .slice(0, 10)

  // Fetch match IDs in parallel batches of 5
  const matchIdResults = await batchRequests(
    topPlayers.map(
      (player) => () =>
        riotFetch<string[]>(
          regionalHost,
          `/lol/match/v5/matches/by-puuid/${player.puuid}/ids?queue=420&count=10`,
        ),
    ),
    5,
    250,
  )

  // Build list of match detail requests (5 matches per player)
  const matchRequests: { playerIndex: number; matchId: string }[] = []

  for (let i = 0; i < topPlayers.length; i++) {
    const matchIds = matchIdResults[i]
    if (!matchIds || matchIds.length === 0) continue
    for (const matchId of matchIds.slice(0, 5)) {
      matchRequests.push({ playerIndex: i, matchId })
    }
  }

  // Fetch match details in parallel batches of 5
  const matchDetailResults = await batchRequests(
    matchRequests.map(
      ({ matchId }) =>
        () =>
          riotFetch<MatchDto>(regionalHost, `/lol/match/v5/matches/${matchId}`),
    ),
    5,
    250,
  )

  // Build player data with all champions played
  const collected: StoredPlayer[] = []

  for (let i = 0; i < topPlayers.length; i++) {
    const player = topPlayers[i]
    if (!player) continue
    const champions: Record<string, number> = {}
    let gameName = 'Unknown'
    let totalGames = 0

    for (let j = 0; j < matchRequests.length; j++) {
      const req = matchRequests[j]
      if (!req || req.playerIndex !== i) continue
      const match = matchDetailResults[j]
      if (!match) continue

      const participant = match.info.participants.find(
        (p) => p.puuid === player.puuid,
      )
      if (participant) {
        const champ = participant.championName
        champions[champ] = (champions[champ] ?? 0) + 1
        gameName =
          participant.riotIdGameName ?? participant.summonerName ?? gameName
        totalGames++
      }
    }

    if (totalGames === 0) continue

    collected.push({
      puuid: player.puuid,
      gameName,
      tier: league.tier,
      lp: player.leaguePoints,
      wins: player.wins,
      losses: player.losses,
      winRate: Math.round((player.wins / (player.wins + player.losses)) * 100),
      champions,
      totalGames,
      region,
    })
  }

  // Merge with existing data in storage
  const storage = useStorage('data')
  const storageKey = `players:${region}:${tier}`

  const existing = (await storage.getItem<StoredPlayer[]>(storageKey)) ?? []

  const existingMap = new Map(existing.map((p) => [p.puuid, p]))
  for (const p of collected) {
    existingMap.set(p.puuid, p)
  }
  const merged = Array.from(existingMap.values())

  await storage.setItem(storageKey, merged)
  await storage.setItem(`updated:${region}:${tier}`, Date.now())

  return {
    region,
    tier,
    collected: collected.length,
    total: merged.length,
  }
})
