// Thin typed wrapper around $fetch for the lol-tricks-api backend.
// Centralises URL composition, timeout, single retry on network errors
// (4xx stays terminal), and a normalised ApiError shape so call sites
// don't re-implement error narrowing.

import { buildApiUrl } from './riot'
import type {
  LeagueResponse,
  OtpResponse,
  ChampionPlayersResponse,
  ChampionPlayersGlobalResponse,
  PlayerChampionMatchesResponse,
} from './riot'
import type { RegionCode } from '~/src/shared/config'

export class ApiError extends Error {
  readonly status: number
  readonly path: string

  constructor(message: string, status: number, path: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.path = path
  }
}

type QueryValue = string | number | boolean | undefined

interface RequestOptions {
  query?: Record<string, QueryValue>
  timeout?: number
  retry?: boolean
}

const DEFAULT_TIMEOUT_MS = 45_000
const RETRY_DELAY_MS = 500

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const url = buildApiUrl(path)
  const timeout = opts.timeout ?? DEFAULT_TIMEOUT_MS
  const shouldRetry = opts.retry ?? true

  const doFetch = async (): Promise<T> => {
    return await $fetch<T>(url, {
      query: opts.query,
      timeout,
    })
  }

  try {
    return await doFetch()
  } catch (firstError) {
    const status = extractStatus(firstError)
    // Only retry on network-style failures. 4xx (client errors) stays
    // terminal — retrying a 400/403/404 is pure latency.
    const isNetworkLike = status === 0 || status >= 502
    if (shouldRetry && isNetworkLike) {
      await delay(RETRY_DELAY_MS)
      try {
        return await doFetch()
      } catch (retryError) {
        throw normalise(retryError, path)
      }
    }
    throw normalise(firstError, path)
  }
}

function extractStatus(e: unknown): number {
  const err = e as { status?: number; statusCode?: number }
  return err.status ?? err.statusCode ?? 0
}

function normalise(e: unknown, path: string): ApiError {
  const err = e as {
    status?: number
    statusCode?: number
    message?: string
    statusMessage?: string
    data?: { statusMessage?: string; message?: string; error?: string }
  }
  const status = err.status ?? err.statusCode ?? 0
  const message =
    err.data?.statusMessage ??
    err.data?.message ??
    err.data?.error ??
    err.statusMessage ??
    err.message ??
    'Unknown error'
  return new ApiError(message, status, path)
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * Typed call-site facade for the lol-tricks-api backend. Prefer these
 * over raw $fetch so timeout, retry, and error shape stay consistent.
 */
export const api = {
  league: {
    get(region: RegionCode, tier: string): Promise<LeagueResponse> {
      return request<LeagueResponse>('/api/riot/league', {
        query: { region, tier },
      })
    },
  },

  otp: {
    list(
      region: RegionCode,
      tier: string,
      limit: number,
    ): Promise<OtpResponse> {
      return request<OtpResponse>('/api/riot/otp', {
        query: { region, tier, limit },
      })
    },
  },

  championPlayers: {
    byRegion(
      champion: string,
      region: RegionCode,
    ): Promise<ChampionPlayersResponse> {
      return request<ChampionPlayersResponse>('/api/riot/champion-players', {
        query: { champion, region },
      })
    },

    global(
      champion: string,
      limit = 100,
    ): Promise<ChampionPlayersGlobalResponse> {
      return request<ChampionPlayersGlobalResponse>(
        '/api/riot/champion-players/global',
        {
          query: { champion, limit },
        },
      )
    },
  },

  playerMatches: {
    get(
      puuid: string,
      champion: string,
      region: string,
    ): Promise<PlayerChampionMatchesResponse> {
      return request<PlayerChampionMatchesResponse>(
        '/api/riot/player-champion-matches',
        {
          query: { puuid, champion, region },
          timeout: 30_000,
        },
      )
    },
  },
}
