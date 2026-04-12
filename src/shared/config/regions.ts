export const REGIONS = [
  { code: 'ru', name: 'Россия' },
  { code: 'euw', name: 'Европа Запад' },
  { code: 'eune', name: 'Европа Север и Восток' },
  { code: 'na', name: 'Северная Америка' },
  { code: 'kr', name: 'Корея' },
  { code: 'br', name: 'Бразилия' },
  { code: 'tr', name: 'Турция' },
  { code: 'lan', name: 'Латинская Америка Север' },
  { code: 'las', name: 'Латинская Америка Юг' },
  { code: 'oce', name: 'Океания' },
  { code: 'jp', name: 'Япония' },
] as const

export type RegionCode = (typeof REGIONS)[number]['code']
