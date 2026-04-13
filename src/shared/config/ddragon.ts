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
