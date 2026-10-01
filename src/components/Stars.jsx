import { useMemo } from 'react'
import { seeded } from '../lib/geometry'
import './Stars.css'

// A fixed, seeded star field; about one star in four twinkles on its own slow clock.
// `clear` (percent box) keeps a zone free of stars, so none land between the glyphs of text set over the sky.
export function Stars({ count = 60, seed = 1, depth = 70, clear }) {
  const stars = useMemo(() => {
    const rand = seeded(seed)
    const out = []
    while (out.length < count) {
      const s = {
        x: rand() * 100,
        y: rand() * depth,
        r: 0.6 + rand() * 1.3,
        twinkle: rand() < 0.28,
        delay: rand() * 6,
        duration: 3 + rand() * 4,
      }
      const hidden = clear && s.x > clear.x0 && s.x < clear.x1 && s.y > clear.y0 && s.y < clear.y1
      if (!hidden) out.push(s)
    }
    return out
  }, [count, seed, depth, clear])

  return (
    <svg className="stars" width="100%" height="100%" aria-hidden="true" focusable="false">
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={`${s.x}%`}
          cy={`${s.y}%`}
          r={s.r}
          className={s.twinkle ? 'twinkle' : undefined}
          style={s.twinkle ? { animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s` } : undefined}
        />
      ))}
    </svg>
  )
}
