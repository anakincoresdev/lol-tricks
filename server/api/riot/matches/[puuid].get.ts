import { getRegionalHost, riotFetch } from '~/server/utils/riot-client'
import type { MatchDto } from '~/server/utils/riot-types'

export default defineEventHandler(async (event) => {
  const puuid = getRouterParam(event, 'puuid')
  const query = getQuery(event)
  const region = (query['region'] as string) ?? 'euw'
  const count = Math.min(Number(query['count']) || 20, 100)

  if (!puuid) {
    throw createError({
      statusCode: 400,
      statusMessage: 'puuid is required.',
    })
  }

  const host = getRegionalHost(region)

  // Get match IDs
  const matchIds = await riotFetch<string[]>(
    host,
    `/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&count=${count}`,
  )

  // Fetch first 5 match details (to avoid rate limit)
  const matchDetails = await Promise.all(
    matchIds
      .slice(0, 5)
      .map((matchId) =>
        riotFetch<MatchDto>(host, `/lol/match/v5/matches/${matchId}`),
      ),
  )

  // Extract participant data for this player
  const matches = matchDetails
    .map((match) => {
      const player = match.info.participants.find((p) => p.puuid === puuid)
      if (!player) {
        return null
      }

      return {
        matchId: match.metadata.matchId,
        champion: player.championName,
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
        ].filter((item) => item > 0),
        runes: player.perks.styles.map((style) => ({
          style: style.style,
          runes: style.selections.map((s) => s.perk),
        })),
        position: player.teamPosition,
        cs: player.totalMinionsKilled,
        gameDuration: match.info.gameDuration,
      }
    })
    .filter(Boolean)

  return { puuid, region, matchIds, matches }
})
