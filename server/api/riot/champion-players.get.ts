import {
  getPlatformHost,
  getRegionalHost,
  riotFetch,
} from '~/server/utils/riot-client'
import type {
  LeagueList,
  LeagueEntry,
  ChampionMasteryDto,
  AccountDto,
} from '~/server/utils/riot-types'

interface DDragonChampionEntry {
  key: string
  id: string
  name: string
}

interface DDragonResponse {
  data: Record<string, DDragonChampionEntry>
}

interface ChampionPlayerResult {
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

// Cache DDragon champion ID mapping in memory
let championIdCache: Record<string, number> | null = null

async function getChampionNumericId(
  championName: string,
): Promise<number | null> {
  if (!championIdCache) {
    const res = await fetch(
      'https://ddragon.leagueoflegends.com/cdn/15.7.1/data/en_US/champion.json',
    )
    const data = (await res.json()) as DDragonResponse
    championIdCache = {}
    for (const champ of Object.values(data.data)) {
      championIdCache[champ.id.toLowerCase()] = parseInt(champ.key, 10)
    }
  }
  return championIdCache[championName.toLowerCase()] ?? null
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

  // Get numeric champion ID from DDragon
  const championNumericId = await getChampionNumericId(champion)
  if (!championNumericId) {
    throw createError({
      statusCode: 400,
      statusMessage: `Unknown champion: ${champion}`,
    })
  }

  const platformHost = getPlatformHost(region)
  const regionalHost = getRegionalHost(region)

  // Fetch all 3 tiers in parallel
  const tiers = ['challenger', 'grandmaster', 'master'] as const
  const leagueResults = await Promise.all(
    tiers.map((tier) =>
      riotFetch<LeagueList>(
        platformHost,
        `/lol/league/v4/${tier}leagues/by-queue/RANKED_SOLO_5x5`,
      ),
    ),
  )

  // Merge all players with tier info, sort by LP, take top 50
  const allEntries: (LeagueEntry & { tierName: string })[] = []
  for (const league of leagueResults) {
    for (const entry of league.entries) {
      allEntries.push({ ...entry, tierName: league.tier })
    }
  }
  allEntries.sort((a, b) => b.leaguePoints - a.leaguePoints)
  const topPlayers = allEntries.slice(0, 50)

  await delay(200)

  // Batch check champion mastery for all 50 players
  const masteryResults = await batchRequests(
    topPlayers.map(
      (player) => () =>
        riotFetch<ChampionMasteryDto>(
          platformHost,
          `/lol/champion-mastery/v4/champion-masteries/by-puuid/${player.puuid}/by-champion/${championNumericId}`,
        ),
    ),
    10,
    250,
  )

  // Filter players who have mastery on this champion
  const matchedPlayers: {
    entry: (typeof topPlayers)[number]
    mastery: ChampionMasteryDto
  }[] = []

  for (let i = 0; i < topPlayers.length; i++) {
    const mastery = masteryResults[i]
    const entry = topPlayers[i]
    if (entry && mastery && mastery.championPoints > 0) {
      matchedPlayers.push({ entry, mastery })
    }
  }

  // Sort by mastery points descending
  matchedPlayers.sort(
    (a, b) => b.mastery.championPoints - a.mastery.championPoints,
  )

  // Get display names for matched players (top 20 max)
  const toResolve = matchedPlayers.slice(0, 20)

  await delay(200)

  const accountResults = await batchRequests(
    toResolve.map(
      ({ entry }) =>
        () =>
          riotFetch<AccountDto>(
            regionalHost,
            `/riot/account/v1/accounts/by-puuid/${entry.puuid}`,
          ),
    ),
    10,
    250,
  )

  // Build final response
  const players: ChampionPlayerResult[] = []

  for (let i = 0; i < toResolve.length; i++) {
    const item = toResolve[i]
    if (!item) continue
    const { entry, mastery } = item
    const account = accountResults[i]
    const gameName = account
      ? `${account.gameName}#${account.tagLine}`
      : 'Unknown'

    players.push({
      puuid: entry.puuid,
      gameName,
      tier: entry.tierName,
      lp: entry.leaguePoints,
      wins: entry.wins,
      losses: entry.losses,
      winRate: Math.round((entry.wins / (entry.wins + entry.losses)) * 100),
      masteryPoints: mastery.championPoints,
      masteryLevel: mastery.championLevel,
    })
  }

  return {
    champion,
    region,
    players,
  }
})
