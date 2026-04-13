# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Nuxt dev server
npm run build        # Production build (Nuxt + Nitro for Vercel)
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier write
npm run format:check # Prettier check
```

CI runs `lint` → `format:check` → `build` sequentially on push/PR to `master`.

## Architecture

Nuxt 3 app using **Feature-Sliced Design (FSD)** with all application code in `src/`. The language is Russian throughout the UI.

### FSD Layers (in `src/`)

- **app/** — Nuxt layout (`layouts/default.vue`), global CSS (`styles/global.css`)
- **pages/** — Page-level Vue components (HomePage, ChampionPage). Each has `index.ts` + `ui/PageName.vue`
- **widgets/** — Self-contained UI blocks (header, search-autocomplete, champion-grid, otp-leaderboard, top-players). Each has `index.ts` + `ui/ComponentName.vue`
- **features/** — Feature modules (currently empty, ready for use)
- **entities/** — Domain models: champion (data + card), player (model + mocks), build (interfaces)
- **shared/** — Reusable code: `api/` (Riot API composables/types), `config/` (regions, roles, DDragon URLs), `ui/` (SearchInput, RoleFilter)

### Two-Tier Routing

Nuxt auto-routing lives in `pages/` at project root. Each route file is a thin wrapper that imports the actual component from `src/pages/`:

```
pages/index.vue         → imports src/pages/home/ui/HomePage.vue
pages/champion/[id].vue → imports src/pages/champion/ui/ChampionPage.vue
```

### Server API (`server/`)

Nitro server routes under `server/api/riot/` proxy Riot Games API calls. `server/utils/riot-client.ts` provides `riotFetch<T>(host, path)` with rate-limit handling. API key comes from `runtimeConfig.riotApiKey` (env var `RIOT_API_KEY`).

Endpoints add delays (100-200ms) between Riot API calls to respect rate limits and stay within Vercel's 10-second function timeout.

## Code Style

- **TypeScript strict mode** with `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature` — use bracket notation for index access (`obj['key']`, `query['param']`)
- **No semicolons**, single quotes, trailing commas, 80-char width (Prettier)
- **ESLint enforces**: no `any`, `consistent-type-imports` (use `import type`), `explicit-function-return-type` (warning), Vue `block-order` [template, script, style], Vue `block-lang` requires `lang="ts"`
- **BEM naming** in scoped CSS with component prefix (e.g. `.champ-page__title`)
- **Conventional commits**: `feat:`, `fix:`, `chore:`

## Deployment

Vercel with `nitro: { preset: 'vercel' }`. Requires `RIOT_API_KEY` environment variable.
