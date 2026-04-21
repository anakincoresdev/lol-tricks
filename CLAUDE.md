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

### External API backend

All Riot Games API calls go through the external **lol-tricks-api** backend — this app never holds `RIOT_API_KEY`. The URL is read from `runtimeConfig.public.apiBase` (env `NUXT_PUBLIC_API_BASE`, prod default `https://lol-tricks-api.vercel.app`; local dev expects `http://localhost:3001` — Nuxt dev runs on `3000`, backend on `3001`).

Prefer the typed `api` facade from `src/shared/api/client.ts` (`api.championPlayers.global`, `api.otp.list`, `api.playerMatches.get`, …) over raw `$fetch`. The facade centralises timeout, a single retry on 5xx/network failures, and normalised `ApiError`. `buildApiUrl()` is still exported for one-off cases and throws if `apiBase` is empty.

The champion page uses `GET /api/riot/champion-players/global?champion=X&limit=100` — backend returns top-100 Master+ players across all tracked regions (currently EUW/NA/KR) with `qualityMix` (main/regular/casual/trial) and per-champion stats (`championGames`, `championWinRate`, `championShare`, `roles`). Region and role tabs filter the response client-side — switching tabs does not refetch.

## Code Style

- **TypeScript strict mode** with `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature` — use bracket notation for index access (`obj['key']`, `query['param']`)
- **No semicolons**, single quotes, trailing commas, 80-char width (Prettier)
- **ESLint enforces**: no `any`, `consistent-type-imports` (use `import type`), `explicit-function-return-type` (warning), Vue `block-order` [template, script, style], Vue `block-lang` requires `lang="ts"`
- **BEM naming** in scoped CSS with component prefix (e.g. `.champ-page__title`)
- **Conventional commits**: `feat:`, `fix:`, `chore:`

## Deployment

Vercel with `nitro: { preset: 'vercel' }`. `NUXT_PUBLIC_API_BASE` defaults to `https://lol-tricks-api.vercel.app` so prod builds work without extra env vars; override it on Vercel only if the backend moves to a different URL.
