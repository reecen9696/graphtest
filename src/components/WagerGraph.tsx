import { useState, useCallback, useMemo } from 'react'
import { Liveline } from 'liveline'
import type { HoverPoint } from 'liveline'
import type { Bet, Game } from '../types'

const GAME_ICONS: Record<Game, JSX.Element> = {
  plinko: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      {/* Plinko: triangle of dots */}
      <circle cx="7" cy="2" r="1.2" fill="currentColor" />
      <circle cx="4.5" cy="6" r="1.2" fill="currentColor" />
      <circle cx="9.5" cy="6" r="1.2" fill="currentColor" />
      <circle cx="2" cy="10" r="1.2" fill="currentColor" />
      <circle cx="7" cy="10" r="1.2" fill="currentColor" />
      <circle cx="12" cy="10" r="1.2" fill="currentColor" />
    </svg>
  ),
  keno: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      {/* Keno: 3x3 grid */}
      {[0,1,2].flatMap(row =>
        [0,1,2].map(col => (
          <rect
            key={`${row}-${col}`}
            x={1 + col * 4}
            y={1 + row * 4}
            width="3"
            height="3"
            rx="0.5"
            fill="currentColor"
            opacity={row === 1 && col === 1 ? '1' : '0.45'}
          />
        ))
      )}
    </svg>
  ),
  dice: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="12" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="4.5" cy="4.5" r="1.1" fill="currentColor" />
      <circle cx="9.5" cy="4.5" r="1.1" fill="currentColor" />
      <circle cx="7" cy="7" r="1.1" fill="currentColor" />
      <circle cx="4.5" cy="9.5" r="1.1" fill="currentColor" />
      <circle cx="9.5" cy="9.5" r="1.1" fill="currentColor" />
    </svg>
  ),
  crash: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      {/* Crash: upward rocket trajectory */}
      <polyline points="1,12 5,9 8,6 12,1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="9,1 12,1 12,4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  mines: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      {/* Mines: bomb */}
      <circle cx="7" cy="7.5" r="4.5" stroke="currentColor" strokeWidth="1.3" />
      <line x1="7" y1="3" x2="7" y2="1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="9" y1="2" x2="10.5" y2="0.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <circle cx="5.5" cy="6" r="1" fill="currentColor" opacity="0.6" />
    </svg>
  ),
  slots: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      {/* Slots: three reels */}
      <rect x="1" y="2" width="3" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="5.5" y="2" width="3" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="10" y="2" width="3" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  ),
}

interface Props {
  bets: Bet[]
}

interface Tooltip {
  x: number
  y: number
  game: string
  net: number
  wager: number
}

export function WagerGraph({ bets }: Props) {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null)

  const data = useMemo(
    () => bets.map(b => ({ time: b.time, value: b.cumulative })),
    [bets]
  )
  const value = bets.length > 0 ? bets[bets.length - 1].cumulative : 0

  // Map recent bets to orderbook: wins = bids (green), losses = asks (red)
  // price = cumulative P&L at that point, size = wager (larger = brighter label)
  const orderbook = useMemo(() => {
    const recent = bets.slice(-40)
    const bids: [number, number][] = recent
      .filter(b => b.payout > b.wager)
      .map(b => [b.cumulative, b.wager])
    const asks: [number, number][] = recent
      .filter(b => b.payout <= b.wager)
      .map(b => [b.cumulative, b.wager])
    return { bids, asks }
  }, [bets])

  const handleHover = useCallback(
    (point: HoverPoint | null) => {
      if (!point || bets.length === 0) {
        setTooltip(null)
        return
      }

      // Find nearest bet by timestamp
      let closest = bets[0]
      let minDist = Math.abs(bets[0].time - point.time)
      for (let i = 1; i < bets.length; i++) {
        const dist = Math.abs(bets[i].time - point.time)
        if (dist < minDist) {
          minDist = dist
          closest = bets[i]
        }
      }

      const net = closest.payout - closest.wager
      setTooltip({
        x: point.x,
        y: point.y,
        game: closest.game.charAt(0).toUpperCase() + closest.game.slice(1),
        net,
        wager: closest.wager,
      })
    },
    [bets]
  )

  return (
    <div
      style={{
        width: 694,
        position: 'relative',
        background: '#1A1A1A',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {/* explicit height wrapper matches the docs pattern: <div style={{height:200}}><Liveline/></div> */}
      <div style={{ height: 330 }}>
        <Liveline
          data={data}
          value={value}
          color="#03BD6C"
          theme="dark"
          momentum={true}
          scrub={true}
          fill={true}
          grid={false}
          badge={true}
          exaggerate={true}
          degen={{ scale: 2 }}
          orderbook={orderbook}
          tooltipOutline={false}
          loading={bets.length < 2}
          window={120}
          onHover={handleHover}
          formatValue={(v: number) =>
            (v >= 0 ? '+$' : '-$') + Math.abs(v).toFixed(2)
          }
        />
      </div>

      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: Math.min(tooltip.x + 12, 694 - 160),
            top: Math.max(tooltip.y - 70, 4),
            background: 'rgba(0, 0, 0, 0.88)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 6,
            padding: '8px 12px',
            pointerEvents: 'none',
            zIndex: 10,
            whiteSpace: 'nowrap',
            fontSize: 13,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            lineHeight: 1.4,
          }}
        >
          <div style={{ color: '#fff', fontWeight: 600, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#aaa', display: 'flex', alignItems: 'center' }}>
              {GAME_ICONS[tooltip.game.toLowerCase() as Game]}
            </span>
            {tooltip.game}
          </div>
          <div style={{ color: '#999', fontSize: 12 }}>
            Wager: ${tooltip.wager.toFixed(2)}
          </div>
          <div
            style={{
              color: tooltip.net >= 0 ? '#03BD6C' : '#ef4444',
              fontWeight: 600,
            }}
          >
            {tooltip.net >= 0 ? 'Won' : 'Lost'}{' '}
            {tooltip.net >= 0 ? '+' : '\u2212'}${Math.abs(tooltip.net).toFixed(2)}
          </div>
        </div>
      )}
    </div>
  )
}
