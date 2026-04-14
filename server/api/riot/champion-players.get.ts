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
  MatchDto,
} from '~/server/utils/riot-types'

interface DDragonChampionEntry {
  key: string
  id: string
  name: string
}

interface DDragonResponse {
  data: Record<string, DDragonChampionEntry>
}

interface PlayerRuneInfo {
  keystone: number
  primaryStyle: number
  secondaryStyle: number
}

interface ChampionPlayerResult {
  puuid: string
  gameName: string
  region: string
  tier: string
  rank: string
  lp: number
  wins: number
  losses: number
  winRate: number
  masteryPoints: number
  masteryLevel: number
  runes: PlayerRuneInfo | null
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
  const withRunes = query['runes'] !== 'false'

  if (!champion) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Champion parameter is required.',
    })
  }

  const championNumericId = await getChampionNumericId(champion)
  if (!championNumericId) {
    throw createError({
      statusCode: 400,
      statusMessage: `Unknown champion: ${champion}`,
    })
  }

  const platformHost = getPlatformHost(region)
  const regionalHost = getRegionalHost(region)

  // 1. Pull all three apex tiers in parallel
  const tiers = ['challenger', 'grandmaster', 'master'] as const
  const leagueResults = await Promise.all(
    tiers.map((tier) =>
      riotFetch<LeagueList>(
        platformHost,
        `/lol/league/v4/${tier}leagues/by-queue/RANKED_SOLO_5x5`,
      ),
    ),
  )

  const allEntries: (LeagueEntry & { tierName: string })[] = []
  for (const league of leagueResults) {
    for (const entry of league.entries) {
      allEntries.push({ ...entry, tierName: league.tier })
    }
  }
  allEntries.sort((a, b) => b.leaguePoints - a.leaguePoints)
  // Scan top 60 players: tight enough for Vercel 10s budget
  const topPlayers = allEntries.slice(0, 60)

  await delay(150)

  // 2. Champion mastery lookup
  const masteryResults = await batchRequests(
    topPlayers.map(
      (player) => () =>
        riotFetch<ChampionMasteryDto>(
          platformHost,
          `/lol/champion-mastery/v4/champion-masteries/by-puuid/${player.puuid}/by-champion/${championNumericId}`,
        ),
    ),
    10,
    220,
  )

  const MIN_MASTERY_POINTS = 50_000

  const matchedPlayers: {
    entry: (typeof topPlayers)[number]
    mastery: ChampionMasteryDto
  }[] = []

  for (let i = 0; i < topPlayers.length; i++) {
    const mastery = masteryResults[i]
    const entry = topPlayers[i]
    if (entry && mastery && mastery.championPoints >= MIN_MASTERY_POINTS) {
      matchedPlayers.push({ entry, mastery })
    }
  }

  matchedPlayers.sort((a, b) => b.entry.leaguePoints - a.entry.leaguePoints)
  const toResolve = matchedPlayers.slice(0, 20)

  await delay(150)

  // 3. Account names — batched
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
    200,
  )

  // 4. Fetch recent match runes for the top slice (best-effort, must fit timeout)
  const runeMap = new Map<string, PlayerRuneInfo>()
  if (withRunes) {
    const runeSlice = toResolve.slice(0, 15)

    await delay(150)

    const recentIds = await batchRequests(
      runeSlice.map(
        ({ entry }) =>
          () =>
            riotFetch<string[]>(
              regionalHost,
              `/lol/match/v5/matches/by-puuid/${entry.puuid}/ids?queue=420&count=3`,
            ),
      ),
      10,
      200,
    )

    // For each player pick the most recent ranked match id (if any)
    const matchFetches: { puuid: string; matchId: string }[] = []
    runeSlice.forEach(({ entry }, idx) => {
      const ids = recentIds[idx]
      if (ids && ids.length > 0 && ids[0]) {
        matchFetches.push({ puuid: entry.puuid, matchId: ids[0] })
      }
    })

    if (matchFetches.length > 0) {
      await delay(150)
      const matches = await batchRequests(
        matchFetches.map(
          ({ matchId }) =>
            () =>
              riotFetch<MatchDto>(
                regionalHost,
                `/lol/match/v5/matches/${matchId}`,
              ),
        ),
        10,
        200,
      )

      matches.forEach((match, idx) => {
        if (!match) return
        const spec = matchFetches[idx]
        if (!spec) return
        const me = match.info.participants.find((p) => p.puuid === spec.puuid)
        if (!me || !me.perks || me.perks.styles.length === 0) return

        const primary = me.perks.styles.find((s) => s.description === 'primaryStyle')
          ?? me.perks.styles[0]
        const secondary = me.perks.styles.find((s) => s.description === 'subStyle')
          ?? me.perks.styles[1]
        if (!primary) return

        const keystonePerk = primary.selections[0]?.perk
        if (!keystonePerk) return

        runeMap.set(spec.puuid, {
          keystone: keystonePerk,
          primaryStyle: primary.style,
          secondaryStyle: secondary?.style ?? 0,
        })
      })
    }
  }

  // 5. Assemble the response
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
      region,
      tier: entry.tierName,
      rank: entry.rank ?? 'I',
      lp: entry.leaguePoints,
      wins: entry.wins,
      losses: entry.losses,
      winRate: Math.round((entry.wins / (entry.wins + entry.losses)) * 100),
      masteryPoints: mastery.championPoints,
      masteryLevel: mastery.championLevel,
      runes: runeMap.get(entry.puuid) ?? null,
    })
  }

  return {
    champion,
    region,
    players,
  }
})
