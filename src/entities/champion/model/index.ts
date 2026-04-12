/* entities/champion/model — типы и стор чемпионов */

export interface Champion {
  id: string
  name: string
  title: string
  imageUrl: string
  roles: string[]
}
