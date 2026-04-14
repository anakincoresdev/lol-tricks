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

export function getRankedEmblemUrl(tier: string): string {
  const t = tier.toLowerCase()
  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/${t}.png`
}

// --- Runes ------------------------------------------------------------------

// CommunityDragon serves all rune icons by their numeric perk/style id.
// Keystones (e.g. 8005 Press the Attack) are at `.../perks/{id}.png`.
// Style trees (e.g. 8000 Precision) are at `.../perkstyles/{id}.png`.
const CD_RUNE_BASE =
  'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/perks'
const CD_STYLE_BASE =
  'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/perkstyles'

export function getKeystoneIconUrl(perkId: number): string {
  return `${CD_RUNE_BASE}/${perkId}.png`
}

export function getRuneStyleIconUrl(styleId: number): string {
  return `${CD_STYLE_BASE}/${styleId}.png`
}
