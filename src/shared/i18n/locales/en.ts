// English locale — this file is the source of truth for the Messages
// shape. ru.ts is type-checked against `typeof en`, so adding a key
// here and forgetting to add it to ru will produce a TS error.
//
// Keep this a plain `const` object — no computed keys, no spreads —
// so `typeof en` stays a structurally-typed record that downstream
// code can narrow against.
//
// Do NOT use `as const` here — we want string values inferred as
// `string`, not as their literal types, so translations in ru.ts
// don't have to equal the English ones to satisfy `Messages`.

export const en = {
  app: {
    name: 'LoL Tricks',
    description:
      'Builds, runes and items from the best OTP players in League of Legends',
    htmlTitle: 'LoL Tricks — Builds from League of Legends OTP players',
  },

  common: {
    loading: 'Loading...',
    load: 'Load',
    error: 'Error: {message}',
    unknownError: 'Unknown error',
    search: 'Search',
    champion: 'Champion',
    region: 'Region',
    player: 'Player',
    rank: 'Rank',
    games: 'Games',
    all: 'All',
    back: '← Back',
    nothingFound: 'Nothing found',
  },

  errors: {
    rateLimited: 'Rate limit exceeded. Wait a moment and try again.',
    invalidApiKey: 'API key is invalid or expired. Update it in the .env file.',
    apiKeyExpired: 'API key is invalid or expired.',
    timeout: 'The server took too long to respond. Try again.',
    timeoutRetry: 'The server took too long to respond. Try again later.',
  },

  header: {
    kicker: '// ONE-TRICK INDEX v2.4',
    nav: {
      search: 'Search',
      tops: 'Tops',
      builds: 'Builds',
      meta: 'Meta',
    },
    signIn: 'SIGN IN',
  },

  footer: {
    copy: '© 2026 · NOT AFFILIATED WITH RIOT',
    build: 'build 2026.04 · data lag ~3min · ★★★☆☆',
    links: {
      privacy: 'Privacy',
      terms: 'Terms',
    },
  },

  legal: {
    effective: 'Effective {date}',
    notAffiliated:
      'LOL TRICKS IS NOT ENDORSED BY RIOT GAMES AND DOES NOT REFLECT THE VIEWS OR OPINIONS OF RIOT GAMES OR ANYONE OFFICIALLY INVOLVED IN PRODUCING OR MANAGING LEAGUE OF LEGENDS.',
    privacy: {
      kicker: '// PRIVACY POLICY',
      title: 'Privacy Policy',
    },
    terms: {
      kicker: '// TERMS OF SERVICE',
      title: 'Terms of Service',
    },
  },

  home: {
    patch: 'PATCH {patch}',
    titleLine1: 'Builds',
    titleLine2: 'from OTP mains',
    titleLine3: 'by champion.',
    subcopy:
      'Top-100 players for every champion across all servers — sort by mastery, games, and win rate.',
    searchHint: '// SEARCH IN ENGLISH OR RUSSIAN',
    popularLabel: '// OFTEN VIEWED',
    marquee: {
      patch: 'patch 26.08',
      champions: '168 champions',
      servers: '12 servers',
      serversRow1: 'NA · EUW · EUNE · KR',
      serversRow2: 'BR · JP · LAN · LAS',
      serversRow3: 'OCE · TR · RU · VN',
      updates: 'refresh every 3 minutes',
      source: 'data from riot api',
    },
    stats: {
      players: 'PLAYERS IN DB',
      playersLabel: 'across all servers',
      servers: 'SERVERS',
      serversLabel: 'from NA to KR',
      champions: 'CHAMPIONS',
      championsLabel: 'in the index',
      update: 'REFRESH',
      updateLabel: 'between updates',
    },
    how: {
      title: 'How the index works',
      step1Kicker: '01 · SEARCH',
      step1Title: 'By champion',
      step1Body:
        'The list includes ranked players who have the champion as part of their main pool.',
      step2Kicker: '02 · RANKING',
      step2Title: 'Global top',
      step2Body:
        'Top-100 is computed from mastery, recent games, and LP weight — no region filter.',
      step3Kicker: '03 · DETAILS',
      step3Title: 'By player',
      step3Body:
        'Click a row to open item order, runes, matchup win rates and streaks.',
    },
  },

  searchAutocomplete: {
    championLabel: 'CHAMPION',
    placeholder: 'Jinx, Yasuo, Ahri…',
    submit: 'SEARCH',
    resultsCount: 'RESULTS · {count}',
    enterHint: '↵ ENTER to open',
  },

  searchInput: {
    placeholder: 'Search for a champion...',
  },

  championGrid: {
    title: 'Champions',
    subtitle: 'Pick a champion to see builds from the best OTPs',
    empty: 'No champions found',
  },

  otpLeaderboard: {
    title: 'OTP Leaderboard (Live)',
    subtitle: 'Live data from Riot API — top one-trick players',
    tiers: {
      challenger: 'Challenger',
      grandmaster: 'Grandmaster',
      master: 'Master',
    },
    th: {
      player: 'Player',
      champion: 'Champion',
      rank: 'Rank',
      wr: 'WR',
      otp: 'OTP%',
    },
    analyzing: "Analyzing players' matches... This may take up to a minute.",
    empty:
      'No OTP players found with a threshold of {threshold}% among top players.',
  },

  topPlayers: {
    title: 'Top OTP players',
    subtitle: 'Best one-tricks from the highest tiers',
    th: {
      player: 'Player',
      champion: 'Champion',
      region: 'Region',
      rank: 'Rank',
      wr: 'WR',
      games: 'Games',
      otp: 'OTP%',
    },
  },

  championPage: {
    backToSearch: '← Back to search',
    heroKicker: 'ONE-TRICK INDEX · {role}',
    chips: {
      scope: 'TOP-100 · GLOBAL · 60D',
      avgWr: 'AVG CHAMP WR {value}%',
      avgGames: 'AVG CHAMP GAMES {value}',
    },
    groups: {
      major: 'Major',
      europe: 'Europe',
      asia: 'Asia',
      americas: 'Americas',
    },
    allRegions: 'All',
    loading: 'Searching for OTP players on {champion}...',
    loadingHint: 'Scanning Challenger, Grandmaster and Master',
    table: {
      title: 'Leaderboard',
      count: '/ {filtered} of {total}',
      exportCsv: 'EXPORT CSV',
      live: '⚡ LIVE',
      th: {
        player: 'Player',
        region: 'Region',
        rank: 'Rank',
        games: 'Games',
        gamesTitle: 'Games on champion over 60 days',
        wr: 'WR',
        wrTitle: 'Win rate on champion over 60 days',
        pool: 'Pool',
        poolTitle: 'Share of champion games out of total pool',
        kind: 'Kind',
      },
    },
    emptyNoPlayers: 'No OTP players found on {champion}.',
    emptyTryRegion: 'Try another region.',
    emptyNoRole: 'No players with this role in the sample.',
    emptyTryRole: 'Try selecting "All" or a different lane.',
    winsLetter: 'W',
    lossesLetter: 'L',
    quality: {
      main: 'Main',
      regular: 'Regular',
      casual: 'Casual',
      trial: 'Trial',
      mainTip: '≥30 ranked solo games in 60 days, ≥20% of pool, WR > 50%',
      regularTip: '≥10 games, ≥10% of pool, WR > 50%',
      casualTip: '≥5 games on champion (any share and WR)',
      trialTip: '2–4 games on champion — fallback for rare picks',
    },
  },

  playerBuilds: {
    backToPlayers: '← Back to players',
    subtitle: 'Builds on {champion}',
    masteryPoints: '{value} mastery points',
    loading: 'Loading matches...',
    loadingHint: 'Analyzing recent games on {champion}',
    foundMatches: 'Found {count} matches',
    kdaLabel: 'KDA',
    perfect: 'Perfect',
    defaultPlayerName: 'Player',
    emptyNoMatches: 'No recent matches on {champion}.',
    emptyHint: "The player hasn't played this champion in ranked for a while.",
    date: {
      today: 'Today',
      yesterday: 'Yesterday',
      daysAgo: '{days}d ago',
    },
  },

  roles: {
    all: 'All',
    top: 'Top',
    jungle: 'Jungle',
    mid: 'Mid',
    adc: 'ADC',
    support: 'Support',
  },

  regions: {
    ru: 'Russia',
    euw: 'Europe West',
    eune: 'Europe Nordic & East',
    na: 'North America',
    kr: 'Korea',
    br: 'Brazil',
    tr: 'Turkey',
    lan: 'Latin America North',
    las: 'Latin America South',
    oce: 'Oceania',
    jp: 'Japan',
  },

  langSwitch: {
    label: 'LANG',
  },
}

// `@nuxtjs/i18n` v9 loads locales lazily — the default export must be a
// function (or `defineI18nLocale(...)`) that returns the messages, not
// the object itself. We still keep `en` as a named const so `Messages`
// can be derived from it via `typeof en` below.
export default defineI18nLocale(() => en)
export type Messages = typeof en
