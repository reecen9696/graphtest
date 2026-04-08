export type Game = 'blackjack' | 'roulette'

export interface Bet {
  time: number
  game: Game
  wager: number
  payout: number
  cumulative: number
}

export const GAMES: Game[] = ['blackjack', 'roulette']

export const GAME_CONFIG: Record<Game, { winChance: number; minMult: number; maxMult: number }> = {
  blackjack: { winChance: 0.46, minMult: 1.5, maxMult: 2.5 },
  roulette:  { winChance: 0.48, minMult: 1.5, maxMult: 36 },
}
