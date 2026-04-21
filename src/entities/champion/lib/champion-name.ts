import type { ChampionData } from '../model/champions-data'

// DDragon ids are PascalCase with a handful of special cases
// ("Kaisa", "Khazix", "Leblanc", "Chogath" — stripped apostrophes,
// "JarvanIV" — trailing Roman numerals). The simple CamelCase split
// covers the common shape; the overrides map fixes the rest.
const ENGLISH_NAME_OVERRIDES: Record<string, string> = {
  Aatrox: 'Aatrox',
  AurelionSol: 'Aurelion Sol',
  Belveth: "Bel'Veth",
  Chogath: "Cho'Gath",
  DrMundo: 'Dr. Mundo',
  JarvanIV: 'Jarvan IV',
  Kaisa: "Kai'Sa",
  Kled: 'Kled',
  Khazix: "Kha'Zix",
  KogMaw: "Kog'Maw",
  Leblanc: 'LeBlanc',
  LeeSin: 'Lee Sin',
  MasterYi: 'Master Yi',
  MissFortune: 'Miss Fortune',
  MonkeyKing: 'Wukong',
  Nunu: 'Nunu & Willump',
  RekSai: "Rek'Sai",
  Renata: 'Renata Glasc',
  TahmKench: 'Tahm Kench',
  TwistedFate: 'Twisted Fate',
  Velkoz: "Vel'Koz",
  XinZhao: 'Xin Zhao',
}

/**
 * Insert a space before each internal uppercase letter so PascalCase
 * ids render as human-readable names. The overrides map takes priority
 * for ids that don't fit the plain pattern.
 */
function formatChampionId(id: string): string {
  if (ENGLISH_NAME_OVERRIDES[id]) {
    return ENGLISH_NAME_OVERRIDES[id]
  }
  return id.replace(/([a-z])([A-Z])/g, '$1 $2')
}

/**
 * Locale-aware display name for a champion. Pass the current i18n
 * locale code; `ru` returns the translated name shipped with the data
 * file, anything else falls back to the formatted English id.
 */
export function championDisplayName(
  champion: Pick<ChampionData, 'id' | 'name'>,
  locale: string,
): string {
  if (locale === 'ru') {
    return champion.name
  }
  return formatChampionId(champion.id)
}
