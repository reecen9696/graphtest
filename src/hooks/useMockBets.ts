import { useEffect, useRef, useState, useCallback } from 'react'
import type { Bet, Game } from '../types'
import { GAMES, GAME_CONFIG } from '../types'

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1))
}

function makeBet(cumulative: number): Bet {
  const game: Game = GAMES[randInt(0, GAMES.length - 1)]
  const config = GAME_CONFIG[game]
  const wager = Math.round(rand(5, 100) * 100) / 100
  const won = Math.random() < config.winChance
  const mult = won ? rand(config.minMult, config.maxMult) : 0
  const payout = won ? Math.round(wager * mult * 100) / 100 : 0
  const net = payout - wager

  return {
    time: Date.now() / 1000,
    game,
    wager,
    payout,
    cumulative: Math.round((cumulative + net) * 100) / 100,
  }
}

// Each tick picks randomly from a weighted set of behaviours so the
// pattern never feels like a loop.
type BetEvent = { kind: 'single'; delay: number } | { kind: 'burst'; count: number; gap: number } | { kind: 'pause'; delay: number }

function nextEvent(): BetEvent {
  const roll = Math.random()
  if (roll < 0.40) {
    // 40% — single bet, wide delay range
    return { kind: 'single', delay: rand(1500, 9000) }
  } else if (roll < 0.65) {
    // 25% — small burst 2-4 bets
    return { kind: 'burst', count: randInt(2, 4), gap: rand(600, 1800) }
  } else if (roll < 0.78) {
    // 13% — hot streak 5-8 bets fast
    return { kind: 'burst', count: randInt(5, 8), gap: rand(300, 800) }
  } else if (roll < 0.90) {
    // 12% — dead zone, nothing for a while
    return { kind: 'pause', delay: rand(9000, 22000) }
  } else {
    // 10% — rapid double/triple back to back
    return { kind: 'burst', count: randInt(2, 3), gap: rand(150, 450) }
  }
}

function* scheduleGen(): Generator<number> {
  while (true) {
    const event = nextEvent()
    if (event.kind === 'single') {
      yield event.delay
    } else if (event.kind === 'burst') {
      for (let i = 0; i < event.count; i++) {
        yield event.gap
      }
    } else {
      yield event.delay
    }
  }
}

export function useMockBets() {
  const [bets, setBets] = useState<Bet[]>([])
  const cumulativeRef = useRef(0)
  const scheduleRef = useRef(scheduleGen())

  const addBet = useCallback(() => {
    const bet = makeBet(cumulativeRef.current)
    cumulativeRef.current = bet.cumulative
    setBets(prev => [...prev, bet])
  }, [])

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    let cancelled = false

    function tick() {
      if (cancelled) return
      addBet()
      const { value: delay } = scheduleRef.current.next()
      timeout = setTimeout(tick, delay)
    }

    // Start after a brief initial delay
    timeout = setTimeout(tick, 500)

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [addBet])

  return bets
}
