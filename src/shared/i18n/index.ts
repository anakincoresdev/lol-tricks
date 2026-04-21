// Barrel for the i18n module. The locale files themselves are loaded
// by @nuxtjs/i18n via `langDir` in nuxt.config.ts, but we also re-export
// the typed `Messages` shape so composables can narrow against it.

export { en } from './locales/en'
export { ru } from './locales/ru'
export type { Messages } from './locales/en'
export type LocaleCode = 'en' | 'ru'
