import {
  getPlatformHost,
  getRegionalHost,
  riotFetch,
} from '~/server/utils/riot-client'
import type { MatchDto, AccountDto } from '~/server/utils/riot-types'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const puuid = (query['puuid'] as string) ?? ''
  const champion = (query['champion'] as string) ?? ''
  const region = (query['region'] as string) ?? 'euw'

  if (!puuid) {
    throw createError({
      statusCode: 400,
      statusMessage: 'puuid is required.',
    })
  }
  if (!champion) {
    throw createError({
      statusCode: 400,
      statusMessage: 'champion is required.',
    })
  }

  const regionalHost = getRegionalHost(region)
  const platformHost = getPlatformHost(region)

  // Fetch account info for display name
  const account = await riotFetch<AccountDto>(
    regionalHost,
    `/riot/account/v1/accounts/by-puuid/${puuid}`,
  ).catch(() => null)

  const gameName = account
    ? `${account.gameName}#${account.tagLine}`
    : 'Unknown'

  await delay(200)

  // Fetch match IDs (ranked solo queue only)
  const matchIds = await riotFetch<string[]>(
    regionalHost,
    `/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&count=50`,
  )

  // Fetch match details in batches, filter by champion, stop early
  const championMatches: {
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
  }[] = []

  const batchSize = 5
  const targetCount = 10

  for (let i = 0; i < matchIds.length; i += batchSize) {
    if (championMatches.length >= targetCount) break

    const batch = matchIds.slice(i, i + batchSize)
    const results = await Promise.allSettled(
      batch.map((matchId) =>
        riotFetch<MatchDto>(regionalHost, `/lol/match/v5/matches/${matchId}`),
      ),
    )

    for (const result of results) {
      if (result.status !== 'fulfilled') continue
      const match = result.value
      const player = match.info.participants.find((p) => p.puuid === puuid)
      if (!player) continue
      if (player.championName.toLowerCase() !== champion.toLowerCase()) {
        continue
      }

      championMatches.push({
        matchId: match.metadata.matchId,
        win: player.win,
        kills: player.kills,
        deaths: player.deaths,
        assists: player.assists,
        items: [
          player.item0,
          player.item1,
          player.item2,
          player.item3,
          player.item4,
          player.item5,
          player.item6,
        ],
        runes: player.perks.styles.map((style) => ({
          style: style.style,
          runes: style.selections.map((s) => s.perk),
        })),
        summoner1Id: player.summoner1Id,
        summoner2Id: player.summoner2Id,
        cs: player.totalMinionsKilled,
        gameDuration: match.info.gameDuration,
        gameCreation: match.info.gameCreation,
        position: player.teamPosition,
      })
    }

    if (
      championMatches.length < targetCount &&
      i + batchSize < matchIds.length
    ) {
      await delay(200)
    }
  }

  // Fetch champion mastery
  let masteryPoints = 0
  let masteryLevel = 0

  try {
    // Get numeric champion ID from DDragon
    const ddRes = await fetch(
      'https://ddragon.leagueoflegends.com/cdn/15.7.1/data/en_US/champion.json',
    )
    const ddData = (await ddRes.json()) as {
      data: Record<string, { key: string; id: string }>
    }
    let numericId: number | null = null
    for (const champ of Object.values(ddData.data)) {
      if (champ.id.toLowerCase() === champion.toLowerCase()) {
        numericId = parseInt(champ.key, 10)
        break
      }
    }

    if (numericId) {
      await delay(200)
      const mastery = await riotFetch<{
        championPoints: number
        championLevel: number
      }>(
        platformHost,
        `/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/by-champion/${numericId}`,
      )
      masteryPoints = mastery.championPoints
      masteryLevel = mastery.championLevel
    }
  } catch {
    // Mastery fetch is optional, continue without it
  }

  return {
    puuid,
    champion,
    region,
    gameName,
    masteryPoints,
    masteryLevel,
    matches: championMatches,
  }
})
