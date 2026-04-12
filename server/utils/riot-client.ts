const PLATFORM_HOSTS: Record<string, string> = {
  br: 'br1.api.riotgames.com',
  eune: 'eun1.api.riotgames.com',
  euw: 'euw1.api.riotgames.com',
  jp: 'jp1.api.riotgames.com',
  kr: 'kr.api.riotgames.com',
  lan: 'la1.api.riotgames.com',
  las: 'la2.api.riotgames.com',
  na: 'na1.api.riotgames.com',
  oce: 'oc1.api.riotgames.com',
  tr: 'tr1.api.riotgames.com',
  ru: 'ru.api.riotgames.com',
}

const REGIONAL_HOSTS: Record<string, string> = {
  br: 'americas.api.riotgames.com',
  na: 'americas.api.riotgames.com',
  lan: 'americas.api.riotgames.com',
  las: 'americas.api.riotgames.com',
  oce: 'americas.api.riotgames.com',
  kr: 'asia.api.riotgames.com',
  jp: 'asia.api.riotgames.com',
  euw: 'europe.api.riotgames.com',
  eune: 'europe.api.riotgames.com',
  tr: 'europe.api.riotgames.com',
  ru: 'europe.api.riotgames.com',
}

export function getPlatformHost(region: string): string {
  return PLATFORM_HOSTS[region] ?? 'euw1.api.riotgames.com'
}

export function getRegionalHost(region: string): string {
  return REGIONAL_HOSTS[region] ?? 'europe.api.riotgames.com'
}

export async function riotFetch<T>(host: string, path: string): Promise<T> {
  const config = useRuntimeConfig()
  const apiKey = config.riotApiKey as string
  const url = `https://${host}${path}`

  const response = await fetch(url, {
    headers: {
      'X-Riot-Token': apiKey,
    },
  })

  if (!response.ok) {
    const status = response.status
    if (status === 429) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Rate limit exceeded. Try again later.',
      })
    }
    if (status === 403) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Invalid or expired API key.',
      })
    }
    throw createError({
      statusCode: status,
      statusMessage: `Riot API error: ${response.statusText}`,
    })
  }

  return response.json() as Promise<T>
}
