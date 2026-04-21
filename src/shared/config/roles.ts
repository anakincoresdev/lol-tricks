// Role ids are language-independent; display names come from i18n via
// `t('roles.' + id)`. Icons stay inline because they're just glyphs and
// locale-independent.

export const ROLES = [
  { id: 'all', icon: '⊕' },
  { id: 'top', icon: '⬆' },
  { id: 'jungle', icon: '🌲' },
  { id: 'mid', icon: '⬛' },
  { id: 'adc', icon: '🏹' },
  { id: 'support', icon: '🛡' },
] as const

export type RoleId = (typeof ROLES)[number]['id']
