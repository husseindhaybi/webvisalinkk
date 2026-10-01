import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useLang } from '../lib/i18n'
import { useMediaQuery } from '../lib/hooks'
import { fractionAt, placeOnPath } from '../lib/geometry'
import { RevealWords } from './Reveal'
import { Stars } from './Stars'
import './HowItWorks.css'

// The route flown between the three steps; waypoints sit over the centres of three equal columns.
const ROUTE = 'M-40 250 C 60 250, 110 150, 200 150 C 330 150, 440 265, 600 265 C 760 265, 850 140, 1000 140 C 1090 140, 1150 90, 1260 40'
const WAYPOINTS = [
  [200, 150],
  [600, 265],
  [1000, 140],
]
// Colour as time: the flight leaves at dusk and lands at night.
const SKY = ['#1f6e7a', '#1a4a6c', '#150f40']
const SEA = ['#175a64', '#143a58', '#0e0a2e']

export function HowItWorks() {
  const wide = useMediaQuery('(min-width: 961px)')
  const reduce = useReducedMotion()
  // Reduced motion keeps the composition and drops the motion: the route is shown already flown.
  return wide ? <PinnedFlight still={reduce} /> : <StackedFlight reduce={reduce} />
}

function useActiveStep(progress, stops) {
  const [active, setActive] = useState(0)
  useMotionValueEvent(progress, 'change', (p) => {
    let next = 0
    stops.forEach((stop, i) => {
      if (p >= stop - 0.015) next = i
    })
    setActive(next)
  })
  return active
}

function PinnedFlight({ still }) {
  const { t } = useLang()
  const section = useRef(null)
  const route = useRef(null)
  const plane = useRef(null)
  const [stops, setStops] = useState([0.12, 0.47, 0.8])

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  // The plane idles at the start for the first beat, then flies the route with the scroll.
  // Ranges span 0–1 throughout so browser-run scroll timelines hold their end values.
  const flight = useTransform(scrollYProgress, [0, 0.06, 0.92, 1], still ? [1, 1, 1, 1] : [stops[0], stops[0], 1, 1])
  const sky = useTransform(scrollYProgress, [0, 0.55, 1], still ? [SKY[0], SKY[0], SKY[0]] : SKY)
  const starsOpacity = useTransform(scrollYProgress, [0, 0.35, 0.95, 1], still ? [0, 0, 0, 0] : [0, 0, 1, 1])
  const sea = useTransform(scrollYProgress, [0, 0.55, 1], still ? [SEA[0], SEA[0], SEA[0]] : SEA)
  // The sun rests on the horizon and sinks behind the sea as the flight goes on.
  const sunY = useTransform(scrollYProgress, [0, 0.75, 1], still ? ['30%', '30%', '30%'] : ['30%', '112%', '112%'])

  useLayoutEffect(() => {
    if (!route.current) return
    setStops(WAYPOINTS.map(([x, y]) => fractionAt(route.current, x, y)))
  }, [])

  const place = () => placeOnPath(route.current, plane.current, flight.get())
  useLayoutEffect(place)
  useMotionValueEvent(flight, 'change', place)
  const active = useActiveStep(flight, stops)
  const stateOf = (i) => (still ? 'done' : i === active ? 'current' : i < active ? 'done' : 'ahead')

  return (
    <section id="how" ref={section} className={`how how-pinned on-dark${still ? ' how-still' : ''}`} aria-labelledby="how-title">
      <motion.div className="how-stage" style={{ backgroundColor: sky }}>
        <motion.div className="how-stars" style={{ opacity: starsOpacity }}>
          <Stars count={70} seed={7} />
        </motion.div>

        <div className="container how-inner">
          <RevealWords id="how-title" className="display-2 how-title" text={t.how.title} />

          <div className="how-route-wrap">
            <svg className="how-route" viewBox="0 0 1200 330" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
              <path d={ROUTE} className="route-base" />
              <motion.path d={ROUTE} className="route-flown" style={{ pathLength: flight }} />
              <path ref={route} d={ROUTE} fill="none" stroke="none" />
              {WAYPOINTS.map(([x, y], i) => (
                <g key={i} className="waypoint" data-reached={still || active >= i}>
                  <circle cx={x} cy={y} r="17" className="waypoint-ring" />
                  <circle cx={x} cy={y} r="7" className="waypoint-dot" />
                </g>
              ))}
              <g ref={plane}>
                <image href="/brand/plane-right-gold.png" width="64" height="61" x="-32" y="-30.5" />
              </g>
            </svg>
          </div>

          {/* The horizon: sky and route above, the steps set on the sea below. */}
          <div className="how-horizon">
            <motion.div className="how-sun" style={{ y: sunY }} aria-hidden="true" />
            <motion.div className="how-sea" style={{ backgroundColor: sea }} aria-hidden="true" />
            <ol className="how-steps">
              {t.how.steps.map((step, i) => (
                <li key={step.title} className="how-step" data-state={stateOf(i)} aria-current={!still && i === active ? 'step' : undefined}>
                  <span className="how-num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3 className="how-step-title">
                    <span className="visually-hidden">{`${t.how.stepLabel} ${i + 1}: `}</span>
                    {step.title}
                  </h3>
                  <p className="how-step-body">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

// Phones, tablets and reduced motion: the same journey read top to bottom, the plane riding a vertical route.
function StackedFlight({ reduce }) {
  const { t } = useLang()
  const section = useRef(null)
  const list = useRef(null)
  const { scrollYProgress: sectionProgress } = useScroll({ target: section, offset: ['start end', 'end start'] })
  const { scrollYProgress } = useScroll({ target: list, offset: ['start 72%', 'end 55%'] })
  const sky = useTransform(sectionProgress, [0, 0.15, 0.85, 1], reduce ? [SKY[0], SKY[0], SKY[0], SKY[0]] : [SKY[0], SKY[0], SKY[2], SKY[2]])
  const fill = useTransform(scrollYProgress, (p) => (reduce ? 1 : p))
  const planeY = useTransform(fill, (p) => `${p * 100}%`)
  const steps = t.how.steps
  const stops = useMemo(() => steps.map((_, i) => (i === 0 ? 0 : (i / (steps.length - 1)) * 0.92)), [steps])
  const active = useActiveStep(fill, stops)

  return (
    <motion.section id="how" ref={section} className="how how-stacked on-dark" style={{ backgroundColor: sky }} aria-labelledby="how-title">
      <div className="how-stars how-stars-stacked" aria-hidden="true">
        <Stars count={40} seed={11} />
      </div>
      <div className="container">
        <RevealWords id="how-title" className="display-2 how-title" text={t.how.title} />
        <div className="how-rail-wrap">
          <div className="how-rail" aria-hidden="true">
            <motion.span className="how-rail-fill" style={{ scaleY: fill }} />
            {/* A rail-high carrier: translating it by n% of its own height moves the plane n% down the rail. */}
            <motion.span className="how-rail-carrier" style={{ y: planeY }}>
              <img className="how-rail-plane" src="/brand/plane-right-gold.png" alt="" width="360" height="345" />
            </motion.span>
          </div>
          <ol className="how-steps" ref={list}>
            {steps.map((step, i) => (
              <li key={step.title} className="how-step" data-state={reduce || i <= active ? (i === active ? 'current' : 'done') : 'ahead'}>
                <span className="how-num" aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className="how-step-title">
                  <span className="visually-hidden">{`${t.how.stepLabel} ${i + 1}: `}</span>
                  {step.title}
                </h3>
                <p className="how-step-body">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </motion.section>
  )
}
