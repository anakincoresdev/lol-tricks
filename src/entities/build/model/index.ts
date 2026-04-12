/* entities/build/model — типы билдов */

export interface BuildRunes {
  primary: string[]
  secondary: string[]
}

export interface Build {
  id: string
  championId: string
  playerId: string
  items: string[]
  runes: BuildRunes
  skillOrder: string[]
  winRate: number
  gamesPlayed: number
}
