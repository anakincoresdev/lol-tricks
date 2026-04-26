export const APP_NAME = 'LoL Tricks'

// App description is resolved via i18n (`t('app.description')`). This
// constant is kept only as a fallback for places that can't use a
// composable (e.g. static metadata at module scope).
export const APP_DESCRIPTION =
  'Builds, runes and items from the best OTP players in League of Legends'

export { REGIONS } from './regions'
export type { RegionCode } from './regions'
export { ROLES } from './roles'
export type { RoleId } from './roles'
export {
  DDRAGON_VERSION,
  DDRAGON_BASE,
  DDRAGON_IMG_BASE,
  getChampionImageUrl,
  getChampionSplashUrl,
  getChampionLoadingUrl,
  getItemImageUrl,
  getProfileIconUrl,
  getRankedEmblemUrl,
  getRuneAssetUrl,
  loadItemsMap,
  loadRunesMap,
  resolveItemInfo,
  resolveRuneIconUrl,
} from './ddragon'
export type { ItemInfo } from './ddragon'
