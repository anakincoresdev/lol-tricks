// Region codes are language-independent; display names are resolved
// through i18n via `t('regions.' + code)`. The `RegionCode` union is
// derived from this list so TypeScript flags any unknown code.

export const REGIONS = [
  { code: 'ru' },
  { code: 'euw' },
  { code: 'eune' },
  { code: 'na' },
  { code: 'kr' },
  { code: 'br' },
  { code: 'tr' },
  { code: 'lan' },
  { code: 'las' },
  { code: 'oce' },
  { code: 'jp' },
] as const

export type RegionCode = (typeof REGIONS)[number]['code']
