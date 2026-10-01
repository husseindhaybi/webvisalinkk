import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from 'motion/react'
import { useLang } from '../lib/i18n'
import './DestinationBand.css'

const wrap = (min, max, v) => {
  const range = max - min
  return ((((v - min) % range) + range) % range) + min
}

// The printed title band along the foot of the poster: destinations drifting past, planes between them.
// It drifts forward in the reading direction and picks up speed while the page is being scrolled.
export function DestinationBand() {
  const { t, dir } = useLang()
  const reduce = useReducedMotion()
  const sign = dir === 'rtl' ? -1 : 1
  const base = useMotionValue(0)
  const { scrollY } = useScroll()
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
  const boost = useTransform(velocity, (v) => Math.min(6, Math.abs(v) / 260))

  useAnimationFrame((_, delta) => {
    if (reduce) return
    const step = 1.1 * (delta / 1000) * (1 + boost.get())
    base.set(base.get() + step)
  })

  // One run is half the track: wrapping the offset across one run makes the loop seamless.
  const x = useTransform(base, (v) => `${sign * wrap(-50, 0, v - 50)}%`)

  const run = (copy) => (
    <div className="band-run" aria-hidden={copy ? 'true' : undefined}>
      {t.destinations.map((d) => (
        <span className="band-item" key={d}>
          <span className="band-word">{d}</span>
          <img className="band-plane" src="/brand/plane-right-paper.png" alt="" width="360" height="345" />
        </span>
      ))}
    </div>
  )
  return (
    <div className="band on-dark">
      <motion.div className="band-track" style={{ x: reduce ? '0%' : x }}>
        {run(false)}
        {run(true)}
      </motion.div>
    </div>
  )
}
