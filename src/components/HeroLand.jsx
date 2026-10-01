import { motion } from 'motion/react'
import { EXPO_OUT } from '../lib/motion'

// Flat ink planes for the hero poster, drawn in the art box's own coordinates (600 × 740).
// Back to front: snow-white Mount Lebanon, then a teal ridge with cedars. The sea in front belongs to the hero.

// A cedar of Lebanon: broad, flat plates of foliage stacked in tiers on a bare trunk, wider than it is tall.
function cedar(x, y, h) {
  const s = h / 100
  const p = (dx, dy) => `${(x + dx * s).toFixed(1)} ${(y + dy * s).toFixed(1)}`
  // [centre y, width, thickness, sideways drift]
  const plates = [
    [-24, 116, 11, 0],
    [-45, 100, 10, -7],
    [-64, 80, 9, 6],
    [-81, 56, 8, -3],
    [-95, 30, 7, 1],
  ]
  let d = `M${p(-5, 0)}L${p(-2.5, -88)}L${p(2.5, -88)}L${p(5, 0)}Z`
  for (const [cy, w, t, dx] of plates) {
    const l = dx - w / 2
    const r = dx + w / 2
    // Flat top that rises gently to the middle, tips drooping below the underside.
    d += `M${p(l, cy + t * 0.55)}C${p(l + w * 0.18, cy - t * 0.9)} ${p(r - w * 0.18, cy - t * 0.9)} ${p(r, cy + t * 0.55)}C${p(r - w * 0.22, cy + t * 0.2)} ${p(l + w * 0.22, cy + t * 0.2)} ${p(l, cy + t * 0.55)}Z`
  }
  return d
}

// Both ranges taper to the baseline at their ends so the landscape never stops in a hard edge.
const PEAKS =
  'M-110 740L-56 640L-14 590L20 602L56 546L96 566L150 520L230 490L300 520L380 470L450 500L505 458L552 488L604 434L648 474L690 508L770 740Z'

const RIDGE =
  'M-100 740C-70 702-36 674 18 666C72 658 150 690 240 690C330 690 420 690 470 668C505 652 528 634 566 628C616 620 664 642 700 666C728 686 748 712 760 740Z'

const CEDARS = [cedar(10, 668, 66), cedar(60, 660, 50), cedar(548, 636, 64), cedar(604, 628, 88), cedar(662, 648, 56)].join('')

const rise = (delay, distance) => ({
  hidden: { opacity: 0, y: distance },
  shown: { opacity: 1, y: 0, transition: { duration: 1.5, ease: EXPO_OUT, delay } },
})

export function HeroLandBack({ farY, ridgeY, pointerX }) {
  return (
    <>
      <motion.div className="hero-land" style={{ y: farY, x: pointerX }} aria-hidden="true">
        <motion.svg viewBox="0 0 600 740" variants={rise(0.35, 40)}>
          <path d={PEAKS} fill="var(--paper)" />
        </motion.svg>
      </motion.div>
      <motion.div className="hero-land" style={{ y: ridgeY }} aria-hidden="true">
        <motion.svg viewBox="0 0 600 740" variants={rise(0.5, 50)}>
          <path d={RIDGE + CEDARS} fill="var(--teal)" />
        </motion.svg>
      </motion.div>
    </>
  )
}
