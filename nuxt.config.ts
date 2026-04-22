export default defineNuxtConfig({
  compatibilityDate: '2025-11-01',
  devtools: { enabled: true },

  modules: ['@nuxt/eslint', '@nuxtjs/i18n'],

  typescript: {
    strict: true,
  },

  // `@nuxtjs/i18n` reads locale files via `langDir`. We keep locales as
  // typed TS modules (not JSON) because they double as the source of
  // truth for vue-i18n's key typing via `src/shared/i18n/vue-i18n.d.ts`.
  i18n: {
    // v9 defaults all i18n paths to an `i18n/` root directory; we keep
    // our locale files under `src/shared/i18n/locales/` for FSD, so we
    // opt out and resolve paths from the project root instead.
    restructureDir: false,
    strategy: 'no_prefix',
    defaultLocale: 'en',
    langDir: 'src/shared/i18n/locales/',
    locales: [
      { code: 'en', language: 'en-US', file: 'en.ts', name: 'English' },
      { code: 'ru', language: 'ru-RU', file: 'ru.ts', name: 'Русский' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      alwaysRedirect: false,
      fallbackLocale: 'en',
    },
    bundle: {
      optimizeTranslationDirective: false,
    },
  },

  app: {
    head: {
      title: 'LoL Tricks — Builds from League of Legends OTP players',
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Builds, runes and items from the best OTP players in League of Legends',
        },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Oswald:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap',
        },
      ],
    },
  },

  css: ['~/src/app/styles/global.css'],

  dir: {
    layouts: 'src/app/layouts',
  },

  runtimeConfig: {
    public: {
      // All Riot API calls go through the external lol-tricks-api backend.
      // Default points at the deployed backend so Vercel builds work out
      // of the box. Override via NUXT_PUBLIC_API_BASE for local dev
      // (e.g. http://localhost:3001).
      apiBase:
        process.env['NUXT_PUBLIC_API_BASE'] ??
        'https://lol-tricks-api.vercel.app',
    },
  },

  nitro: {
    preset: 'vercel',
  },
})
