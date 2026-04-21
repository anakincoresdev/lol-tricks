// Hooks our typed `Messages` into vue-i18n so `$t('home.titleLine1')`
// and `useI18n().t('home.titleLine1')` get autocomplete + key validation.

import type { Messages } from './locales/en'

declare module 'vue-i18n' {
  // `DefineLocaleMessage` is the structural marker vue-i18n uses to
  // constrain the `t` key argument. Aliasing it to our Messages shape
  // flows the typing into every call site with no per-file opt-in.
  // (We use a `type` alias rather than an empty `interface extends` to
  // satisfy @typescript-eslint/no-empty-object-type.)
  export type DefineLocaleMessage = Messages
}

export {}
