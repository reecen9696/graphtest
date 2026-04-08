export type Game = 'plinko' | 'keno' | 'dice' | 'crash' | 'mines' | 'slots'

export interface Bet {
  time: number
  game: Game
  wager: number
  payout: number
  cumulative: number
}

export const GAMES: Game[] = ['plinko', 'keno', 'dice', 'crash', 'mines', 'slots']

export const GAME_CONFIG: Record<Game, { winChance: number; minMult: number; maxMult: number }> = {
  plinko: { winChance: 0.42, minMult: 1.5, maxMult: 5 },
  keno:   { winChance: 0.38, minMult: 2, maxMult: 4 },
  dice:   { winChance: 0.48, minMult: 1.5, maxMult: 2 },
  crash:  { winChance: 0.35, minMult: 1.2, maxMult: 10 },
  mines:  { winChance: 0.44, minMult: 1.5, maxMult: 3 },
  slots:  { winChance: 0.30, minMult: 2, maxMult: 8 },
}
