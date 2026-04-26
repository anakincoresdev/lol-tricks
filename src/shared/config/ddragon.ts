export const DDRAGON_VERSION = '15.7.1'

export const DDRAGON_BASE = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}`

export function getChampionImageUrl(championId: string): string {
  return `${DDRAGON_BASE}/img/champion/${championId}.png`
}

export function getChampionSplashUrl(championId: string): string {
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_0.jpg`
}

export function getChampionLoadingUrl(championId: string): string {
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${championId}_0.jpg`
}

export function getItemImageUrl(itemId: number): string {
  return `${DDRAGON_BASE}/img/item/${itemId}.png`
}

// Riot summoner profile icon. Matches the numeric id returned by
// `/lol/summoner/v4/summoners/by-puuid` and stored on Player.profileIconId
// by seed-masters. DDragon serves every valid id, including the default
// icons (0, 29).
export function getProfileIconUrl(iconId: number): string {
  return `${DDRAGON_BASE}/img/profileicon/${iconId}.png`
}

export function getRankedEmblemUrl(tier: string): string {
  const t = tier.toLowerCase()
  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/${t}.png`
}

// --- Runes ------------------------------------------------------------------

// Runes are NOT addressable by numeric id on any public CDN — the DDragon
// `runesReforged.json` manifest is the only authoritative id → asset path
// mapping. We fetch it once per app lifetime, flatten it into a Map<id,
// iconPath>, and resolve the full URL via `getRuneAssetUrl(path)`.

export const DDRAGON_IMG_BASE = 'https://ddragon.leagueoflegends.com/cdn/img'

interface RunesReforgedRune {
  id: number
  key: string
  icon: string
  name: string
}

interface RunesReforgedSlot {
  runes: RunesReforgedRune[]
}

interface RunesReforgedStyle {
  id: number
  key: string
  icon: string
  name: string
  slots: RunesReforgedSlot[]
}

// Module-scope cache so every consumer shares the same (eventual) map
// and the fetch only fires once per page load.
let runesMapPromise: Promise<Map<number, string>> | null = null

export function loadRunesMap(): Promise<Map<number, string>> {
  if (runesMapPromise) return runesMapPromise
  runesMapPromise = $fetch<RunesReforgedStyle[]>(
    `${DDRAGON_BASE}/data/en_US/runesReforged.json`,
  ).then((trees) => {
    const map = new Map<number, string>()
    for (const tree of trees) {
      map.set(tree.id, tree.icon)
      for (const slot of tree.slots) {
        for (const perk of slot.runes) {
          map.set(perk.id, perk.icon)
        }
      }
    }
    return map
  })
  return runesMapPromise
}

// Build the full CDN URL from a `runesReforged.icon` path. DDragon serves
// rune assets under `cdn/img/…` WITHOUT a version prefix, unlike
// champions/items which live under `cdn/<VERSION>/img/…`.
export function getRuneAssetUrl(iconPath: string): string {
  return `${DDRAGON_IMG_BASE}/${iconPath}`
}

// Convenience: null-safe lookup that returns the full URL or null when
// the id isn't in the map (e.g. removed perk on an old match).
export function resolveRuneIconUrl(
  map: Map<number, string> | null,
  id: number | null | undefined,
): string | null {
  if (!map || id === null || id === undefined) return null
  const path = map.get(id)
  return path ? getRuneAssetUrl(path) : null
}

// --- Items ------------------------------------------------------------------

// Same lazy-fetch pattern as runes: pull `item.json` from DDragon once
// per app lifetime, expose a Map<id, ItemInfo>. No numeric item-id →
// description lookup exists on any other public endpoint, and the
// payload is small (~300KB gzipped), so client-side caching is fine.

// Subset of the DDragon item record we surface to UI code. Keep this
// narrow so we don't accidentally depend on fields that Riot can
// rename/remove between patches. `description` is Riot's rich HTML —
// it contains custom tags (<mainText>, <attention>, <stats>,
// <active>, etc.) that the consuming component is expected to style
// via CSS.
export interface ItemInfo {
  id: number
  name: string
  description: string
  plaintext: string
  gold: { total: number; base: number; sell: number }
  tags: string[]
}

// Shape of the raw item record in `item.json`. Only the fields we read.
interface DDragonItemRecord {
  name: string
  description: string
  plaintext?: string
  gold?: { total?: number; base?: number; sell?: number }
  tags?: string[]
}

interface DDragonItemPayload {
  data: Record<string, DDragonItemRecord>
}

let itemsMapPromise: Promise<Map<number, ItemInfo>> | null = null

export function loadItemsMap(): Promise<Map<number, ItemInfo>> {
  if (itemsMapPromise) return itemsMapPromise
  itemsMapPromise = $fetch<DDragonItemPayload>(
    `${DDRAGON_BASE}/data/en_US/item.json`,
  ).then((payload) => {
    const map = new Map<number, ItemInfo>()
    for (const [rawId, raw] of Object.entries(payload.data)) {
      const id = Number(rawId)
      if (!Number.isFinite(id)) continue
      map.set(id, {
        id,
        name: raw.name,
        description: raw.description,
        plaintext: raw.plaintext ?? '',
        gold: {
          total: raw.gold?.total ?? 0,
          base: raw.gold?.base ?? 0,
          sell: raw.gold?.sell ?? 0,
        },
        tags: raw.tags ?? [],
      })
    }
    return map
  })
  return itemsMapPromise
}

// Null-safe lookup — returns null when the id is missing, so templates
// can v-if on the result.
export function resolveItemInfo(
  map: Map<number, ItemInfo> | null,
  id: number | null | undefined,
): ItemInfo | null {
  if (!map || id === null || id === undefined) return null
  return map.get(id) ?? null
}
