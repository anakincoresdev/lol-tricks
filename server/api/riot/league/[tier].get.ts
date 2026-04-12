import { getPlatformHost, riotFetch } from '~/server/utils/riot-client'
import type { LeagueList } from '~/server/utils/riot-types'

export default defineEventHandler(async (event) => {
  const tier = getRouterParam(event, 'tier')
  const query = getQuery(event)
  const region = (query['region'] as string) ?? 'euw'

  const validTiers = ['challenger', 'grandmaster', 'master']
  if (!tier || !validTiers.includes(tier)) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Invalid tier. Must be: challenger, grandmaster, or master.',
    })
  }

  const host = getPlatformHost(region)
  const path = `/lol/league/v4/${tier}leagues/by-queue/RANKED_SOLO_5x5`

  const data = await riotFetch<LeagueList>(host, path)

  const sorted = data.entries
    .sort((a, b) => b.leaguePoints - a.leaguePoints)
    .slice(0, 50)
    .map((entry) => ({
      summonerId: entry.summonerId,
      puuid: entry.puuid,
      tier: data.tier,
      rank: entry.rank,
      lp: entry.leaguePoints,
      wins: entry.wins,
      losses: entry.losses,
      winRate: Math.round((entry.wins / (entry.wins + entry.losses)) * 100),
      hotStreak: entry.hotStreak,
    }))

  return { tier: data.tier, region, players: sorted }
})
