export const ROLES = [
  { id: 'all', name: 'Все', icon: '⊕' },
  { id: 'top', name: 'Топ', icon: '⬆' },
  { id: 'jungle', name: 'Лес', icon: '🌲' },
  { id: 'mid', name: 'Мид', icon: '⬛' },
  { id: 'adc', name: 'АДК', icon: '🏹' },
  { id: 'support', name: 'Саппорт', icon: '🛡' },
] as const

export type RoleId = (typeof ROLES)[number]['id']
