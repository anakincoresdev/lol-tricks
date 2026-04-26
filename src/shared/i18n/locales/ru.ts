// Russian locale — typed against en.ts. Any key added to en.ts must
// also appear here or TypeScript will complain (`satisfies Messages`).

import type { Messages } from './en'

export const ru: Messages = {
  app: {
    name: 'LoL Tricks',
    description:
      'Билды, руны и предметы от лучших OTP игроков League of Legends',
    htmlTitle: 'LoL Tricks — Билды OTP игроков League of Legends',
  },

  common: {
    loading: 'Загрузка...',
    load: 'Загрузить',
    error: 'Ошибка: {message}',
    unknownError: 'Unknown error',
    search: 'Поиск',
    champion: 'Чемпион',
    region: 'Регион',
    player: 'Игрок',
    rank: 'Ранг',
    games: 'Игр',
    all: 'Все',
    back: '← Назад',
    nothingFound: 'Ничего не найдено',
  },

  errors: {
    rateLimited: 'Превышен лимит запросов. Подожди немного и попробуй снова.',
    invalidApiKey:
      'API ключ недействителен или истёк. Обнови ключ в .env файле.',
    apiKeyExpired: 'API ключ недействителен или истёк.',
    timeout: 'Сервер не успел ответить. Попробуй ещё раз.',
    timeoutRetry: 'Сервер не успел ответить. Попробуй позже.',
  },

  header: {
    kicker: '// ONE-TRICK INDEX v2.4',
    nav: {
      search: 'Поиск',
      tops: 'Топы',
      builds: 'Билды',
      meta: 'Мета',
    },
    signIn: 'ВОЙТИ',
  },

  footer: {
    copy: '© 2026 · НЕ АФФИЛИРОВАН С RIOT',
    build: 'build 2026.04 · задержка данных ~3мин · ★★★☆☆',
    links: {
      privacy: 'Конфиденциальность',
      terms: 'Условия',
    },
  },

  legal: {
    effective: 'Действует с {date}',
    notAffiliated:
      'LOL TRICKS НЕ ОДОБРЕН RIOT GAMES И НЕ ОТРАЖАЕТ ВЗГЛЯДЫ ИЛИ МНЕНИЯ RIOT GAMES И ЛЮБЫХ ОФИЦИАЛЬНЫХ УЧАСТНИКОВ РАЗРАБОТКИ ИЛИ УПРАВЛЕНИЯ LEAGUE OF LEGENDS.',
    privacy: {
      kicker: '// ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ',
      title: 'Политика конфиденциальности',
    },
    terms: {
      kicker: '// УСЛОВИЯ ИСПОЛЬЗОВАНИЯ',
      title: 'Условия использования',
    },
  },

  home: {
    patch: 'ПАТЧ {patch}',
    titleLine1: 'Билды',
    titleLine2: 'OTP-мейнов',
    titleLine3: 'по чемпионам.',
    subcopy:
      'Все OTP-игроки на каждого чемпиона со всех серверов — сортировка по мастерству, играм и винрейту.',
    searchHint: '// ПОИСК НА РУССКОМ ИЛИ АНГЛИЙСКОМ',
    popularLabel: '// ЧАСТО СМОТРЯТ',
    marquee: {
      patch: 'патч 26.08',
      champions: '168 чемпионов',
      servers: '12 серверов',
      serversRow1: 'NA · EUW · EUNE · KR',
      serversRow2: 'BR · JP · LAN · LAS',
      serversRow3: 'OCE · TR · RU · VN',
      updates: 'обновление каждые 3 минуты',
      source: 'данные из riot api',
    },
    stats: {
      players: 'ИГРОКОВ В БАЗЕ',
      playersLabel: 'со всех серверов',
      servers: 'СЕРВЕРОВ',
      serversLabel: 'от NA до KR',
      champions: 'ЧЕМПИОНОВ',
      championsLabel: 'в индексе',
      update: 'АПДЕЙТ',
      updateLabel: 'между обновлениями',
    },
    how: {
      title: 'Как устроен индекс',
      step1Kicker: '01 · ПОИСК',
      step1Title: 'По чемпиону',
      step1Body:
        'В список попадают ранкед-игроки, у которых чемпион — в основном пуле.',
      step2Kicker: '02 · РАНЖИРОВАНИЕ',
      step2Title: 'Глобальный топ',
      step2Body:
        'Рейтинг считается по мастерству, недавним играм и весу LP — без фильтра по региону.',
      step3Kicker: '03 · ДЕТАЛИ',
      step3Title: 'По игроку',
      step3Body:
        'Клик по строке открывает порядок предметов, руны, винрейты в матчапах и стрики.',
    },
  },

  liveOtpFeed: {
    kicker: '// LIVE',
    title: 'Только что сыграли OTP Master+',
    subtitle:
      'Самые свежие ранкед-матчи отслеживаемых ваншотеров на EUW, NA и KR.',
    loading: 'Грузим последние игры…',
    error: 'Не удалось загрузить ленту. Обнови страницу.',
    empty: 'В окне нет свежих игр. Загляни через пару минут.',
    win: 'В',
    loss: 'П',
    kdaLabel: 'KDA',
    wrTooltip: '{games} игр на чемпе · {share}% play rate (60д)',
  },

  searchAutocomplete: {
    championLabel: 'ЧЕМПИОН',
    placeholder: 'Джинкс, Ясуо, Ahri…',
    submit: 'ПОИСК',
    resultsCount: 'РЕЗУЛЬТАТЫ · {count}',
    enterHint: '↵ ENTER для перехода',
  },

  searchInput: {
    placeholder: 'Поиск чемпиона...',
  },

  championGrid: {
    title: 'Чемпионы',
    subtitle: 'Выбери чемпиона, чтобы увидеть билды от лучших OTP',
    empty: 'Чемпионы не найдены',
  },

  otpLeaderboard: {
    title: 'OTP Рейтинг (Live)',
    subtitle: 'Реальные данные из Riot API — топ ваншотеров',
    tiers: {
      challenger: 'Challenger',
      grandmaster: 'Grandmaster',
      master: 'Master',
    },
    th: {
      player: 'Игрок',
      champion: 'Чемпион',
      rank: 'Ранг',
      wr: 'WR',
      otp: 'OTP%',
    },
    analyzing: 'Анализируем матчи игроков... Это может занять до минуты.',
    empty: 'Не найдено OTP-игроков с порогом {threshold}% среди топ игроков.',
  },

  topPlayers: {
    title: 'Топ OTP игроков',
    subtitle: 'Лучшие ваншотеры с высших рангов',
    th: {
      player: 'Игрок',
      champion: 'Чемпион',
      region: 'Регион',
      rank: 'Ранг',
      wr: 'WR',
      games: 'Игр',
      otp: 'OTP%',
    },
  },

  championPage: {
    backToSearch: '← Назад к поиску',
    heroKicker: 'ONE-TRICK INDEX · {role}',
    chips: {
      scope: 'ГЛОБАЛЬНО · 60Д',
      avgWr: 'СРЕД. WR НА ЧЕМПЕ {value}%',
      avgGames: 'СРЕД. ИГР НА ЧЕМПЕ {value}',
    },
    groups: {
      major: 'Major',
      europe: 'Europe',
      asia: 'Asia',
      americas: 'Americas',
    },
    allRegions: 'All',
    loading: 'Ищем OTP игроков на {champion}...',
    loadingHint: 'Сканируем Challenger, Grandmaster и Master',
    table: {
      title: 'Leaderboard',
      count: '/ {filtered} из {total}',
      exportCsv: 'EXPORT CSV',
      live: '⚡ LIVE',
      th: {
        player: 'Игрок',
        region: 'Регион',
        rank: 'Ранг',
        games: 'Игры',
        gamesTitle: 'Игры на чемпе за 60 дней',
        kda: 'KDA',
        kdaTitle: 'Средние убийства / смерти / ассисты за 60 дней',
        runes: 'R',
        runesTitle: 'Самый частый кейстоун за 60 дней',
        firstItem: 'F',
        firstItemTitle: 'Самый частый первый легендарный предмет за 60 дней',
        wr: 'WR',
        wrTitle: 'Винрейт на чемпе за 60 дней',
        pool: 'Play Rate',
        poolTitle: 'Доля чемпа в последних 60 днях ranked solo у игрока',
        kind: 'Тип',
      },
    },
    emptyNoPlayers: 'Не найдено OTP игроков на {champion}.',
    emptyTryRegion: 'Попробуй другой регион.',
    emptyNoRole: 'Нет игроков с этой ролью в выборке.',
    emptyTryRole: 'Попробуй выбрать «Все» или другой лайн.',
    winsLetter: 'В',
    lossesLetter: 'П',
    quality: {
      main: 'Main',
      regular: 'Regular',
      mainTip: '≥30 игр на чемпе за 60 дней, ≥20% play rate',
      regularTip: '>10 игр на чемпе, ≥15% play rate',
    },
  },

  playerBuilds: {
    backToPlayers: '← Назад к игрокам',
    subtitle: 'Билды на {champion}',
    masteryPoints: '{value} очков мастерства',
    loading: 'Загружаем матчи...',
    loadingHint: 'Анализируем последние игры на {champion}',
    foundMatches: 'Найдено {count} матчей',
    kdaLabel: 'KDA',
    perfect: 'Perfect',
    defaultPlayerName: 'Игрок',
    emptyNoMatches: 'Нет недавних матчей на {champion}.',
    emptyHint: 'Игрок давно не играл на этом чемпионе в ранкеде.',
    date: {
      today: 'Сегодня',
      yesterday: 'Вчера',
      daysAgo: '{days} дн. назад',
    },
    teams: {
      allies: 'Ваша команда',
      enemies: 'Противники',
    },
  },

  player: {
    backHome: '← На главную',
    subtitle: 'Последние матчи ranked solo — {region}',
    loading: 'Загружаем матчи...',
    loadingHint: 'Получаем последние 20 ранкед-игр',
    foundMatches: 'Последние {count} матчей',
    kdaLabel: 'KDA',
    perfect: 'Perfect',
    defaultPlayerName: 'Игрок',
    emptyNoMatches: 'Нет недавних ранкед-матчей.',
    emptyHint: 'Игрок давно не играл в ranked solo.',
    date: {
      today: 'Сегодня',
      yesterday: 'Вчера',
      daysAgo: '{days} дн. назад',
    },
    teams: {
      allies: 'Ваша команда',
      enemies: 'Противники',
    },
  },

  roles: {
    all: 'Все',
    top: 'Топ',
    jungle: 'Лес',
    mid: 'Мид',
    adc: 'АДК',
    support: 'Саппорт',
  },

  regions: {
    ru: 'Россия',
    euw: 'Европа Запад',
    eune: 'Европа Север и Восток',
    na: 'Северная Америка',
    kr: 'Корея',
    br: 'Бразилия',
    tr: 'Турция',
    lan: 'Латинская Америка Север',
    las: 'Латинская Америка Юг',
    oce: 'Океания',
    jp: 'Япония',
  },

  langSwitch: {
    label: 'ЯЗЫК',
  },
}

export default defineI18nLocale(() => ru)
