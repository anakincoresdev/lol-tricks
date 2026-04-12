export default defineNuxtConfig({
  compatibilityDate: '2025-04-12',
  devtools: { enabled: true },

  modules: ['@nuxt/eslint'],

  typescript: {
    strict: true,
    typeCheck: true,
  },

  app: {
    head: {
      title: 'Wallo — Билды OTP игроков League of Legends',
      htmlAttrs: {
        lang: 'ru',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Билды, руны и предметы от лучших OTP игроков League of Legends',
        },
      ],
    },
  },

  css: ['~/src/app/styles/global.css'],

  dir: {
    layouts: 'src/app/layouts',
  },

  runtimeConfig: {
    riotApiKey: process.env['RIOT_API_KEY'] ?? '',
  },

  nitro: {
    preset: 'vercel',
  },
})
