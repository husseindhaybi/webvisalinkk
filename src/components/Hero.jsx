import { useEffect, useRef } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { useLang } from '../lib/i18n'
import { useFinePointer, useIntroDone, useMediaQuery } from '../lib/hooks'
import { anchorTo } from '../lib/scroll'
import { EASE_IN_OUT, EXPO_OUT } from '../lib/motion'
import { FlightSwoosh } from './FlightSwoosh'
import { DestinationBand } from './DestinationBand'
import { HeroLandBack } from './HeroLand'
import { HeroWindow } from './HeroWindow'
import { Magnetic } from './Magnetic'
import { ArrowSwap } from './Icons'
import './Hero.css'

// The swoosh hugs the arch: tail at the left, a full curve beneath, then up the right edge and away.
const SWOOSH = [
  [[40, 380], [0, 520], [20, 690], [150, 700]],
  [[150, 700], [290, 712], [390, 660], [455, 585]],
  [[455, 585], [520, 510], [520, 330], [600, 270]],
]
const BAND = 64

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

const lineVariants = {
  hidden: { y: '112%', filter: 'blur(10px)' },
  shown: (i) => ({ y: '0%', filter: 'blur(0px)', transition: { duration: 1.25, ease: EXPO_OUT, delay: 0.12 + i * 0.09 } }),
}
const fadeVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(6px)' },
  shown: (delay) => ({ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1, ease: EXPO_OUT, delay } }),
}
const sunVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  shown: { opacity: 1, scale: 1, transition: { duration: 1.4, ease: EXPO_OUT, delay: 0.25 } },
}

export function Hero() {
  const { t } = useLang()
  const ready = useIntroDone()
  const reduce = useReducedMotion()
  const fine = useFinePointer()
  const wide = useMediaQuery('(min-width: 941px)')
  // Desktop pins the poster while its window opens onto the whole screen; phones open it in the flow.
  const pinned = wide && !reduce

  const section = useRef(null)
  const stage = useRef(null)
  const art = useRef(null)
  const anchor = useRef(null)

  const { scrollYProgress: pinP } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const { scrollYProgress: artP } = useScroll({ target: art, offset: ['start end', 'center center'] })

  const still = useMotionValue(0)
  const openPinned = useTransform(pinP, [0.04, 0.62], [0, 1], { ease: easeInOutCubic })
  const openFlow = useTransform(artP, [0.3, 1], [0, 1], { ease: easeInOutCubic })
  const open = reduce ? still : pinned ? openPinned : openFlow
  const drift = useTransform(pinP, [0.7, 1], [0, 1])

  // The headline melts away as the window takes the screen.
  // Ranges always span 0–1: Motion hands opacity and filter to the browser's scroll timeline,
  // which drifts back toward the resting value past the last keyframe unless it is pinned there.
  const copyOpacity = useTransform(pinP, [0, 0.02, 0.26, 1], [1, 1, 0, 0])
  const copyBlur = useTransform(pinP, [0, 0.02, 0.26, 1], ['blur(0px)', 'blur(0px)', 'blur(10px)', 'blur(10px)'])
  const copyY = useTransform(pinP, [0, 0.3, 1], [0, -60, -60])

  const sunY = useTransform(pinned ? pinP : artP, [0, 1], ['0%', reduce ? '0%' : pinned ? '45%' : '20%'])
  const farY = useTransform(pinned ? pinP : artP, [0, 1], ['0%', reduce ? '0%' : '6%'])
  const ridgeY = useTransform(pinned ? pinP : artP, [0, 1], ['0%', reduce ? '0%' : '3%'])
  const forward = useTransform(pinned ? pinP : artP, pinned ? [0, 0.02, 0.6, 1] : [0, 0.3, 1, 1], [0, 0, reduce ? 0 : 1500, reduce ? 0 : 1500])
  const fade = reduce ? 1 : 0
  const captionOpacity = useTransform(pinned ? pinP : artP, pinned ? [0, 0.02, 0.1, 1] : [0, 0.3, 0.45, 1], [1, 1, fade, fade])
  // The swoosh hands the stage to the open window; the plane has already flown on by then.
  const swooshOpacity = useTransform(pinned ? pinP : artP, pinned ? [0, 0.2, 0.45, 1] : [0, 0.4, 0.75, 1], [1, 1, fade, fade])
  const lockY = useTransform(pinned ? pinP : artP, pinned ? [0, 0.5, 0.74, 1] : [0, 0.72, 1, 1], ['110%', '110%', '0%', '0%'])

  // Decorative depth that follows the pointer, eased through springs so it never feels wired to the mouse.
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 55, damping: 18, mass: 0.7 })
  const sy = useSpring(py, { stiffness: 55, damping: 18, mass: 0.7 })
  const sunPX = useTransform(sx, (v) => v * 22)
  const sunPY = useTransform(sy, (v) => v * 14)
  const peaksPX = useTransform(sx, (v) => v * 7)
  const onPointerMove = (e) => {
    if (!fine || reduce) return
    px.set((e.clientX / window.innerWidth - 0.5) * 2)
    py.set((e.clientY / window.innerHeight - 0.5) * 2)
  }

  const draw = useMotionValue(reduce ? 1 : 0)
  const load = useMotionValue(reduce ? 1 : 0)
  useEffect(() => {
    if (!ready || reduce) return
    const a = animate(load, 1, { duration: 1.7, ease: EXPO_OUT, delay: 0.05 })
    const b = animate(draw, 1, { duration: 2.1, ease: EASE_IN_OUT, delay: 0.55 })
    return () => {
      a.stop()
      b.stop()
    }
  }, [ready, reduce, load, draw])

  const state = ready || reduce ? 'shown' : 'hidden'

  const copy = (
    <motion.div className="hero-copy" style={pinned ? { opacity: copyOpacity, filter: copyBlur, y: copyY } : undefined}>
      <h1 id="hero-title" className="hero-title display-1">
        <span className="visually-hidden">{t.hero.title.join(' ')}</span>
        <span aria-hidden="true">
          {t.hero.title.map((line, i) => (
            <span className="mask mask-line" key={line}>
              <motion.span className="mask-inner" variants={lineVariants} custom={i}>
                {line}
              </motion.span>
            </span>
          ))}
        </span>
      </h1>
      <motion.p className="hero-question" variants={fadeVariants} custom={0.55}>
        {t.hero.question}
      </motion.p>
      <motion.p className="hero-body" variants={fadeVariants} custom={0.65}>
        {t.hero.body}
      </motion.p>
      <motion.div className="hero-ctas" variants={fadeVariants} custom={0.78}>
        <Magnetic strength={0.25}>
          <a className="btn btn-gold" href="#services" onClick={anchorTo('services')}>
            {t.hero.primary}
            <ArrowSwap />
          </a>
        </Magnetic>
        <a className="btn btn-line ink" href="#contact" onClick={anchorTo('contact')}>
          {t.hero.secondary}
        </a>
      </motion.div>
    </motion.div>
  )

  const windowProps = {
    anchorRef: anchor,
    open,
    load,
    drift: pinned ? drift : undefined,
    pointerX: fine && !reduce ? sx : undefined,
    pointerY: fine && !reduce ? sy : undefined,
    alt: t.hero.imageAlt,
  }

  // The poster's lettering, risen over the open window once it fills the screen.
  const lockup = reduce ? null : (
    <p className="hero-lockup" aria-hidden="true">
      <span className="mask">
        <motion.span className="mask-inner" style={{ y: lockY }}>
          {t.hero.lockup}
        </motion.span>
      </span>
    </p>
  )

  const artBox = (
    <div className="hero-art" ref={art}>
      <motion.div className="hero-sun-track" style={{ y: sunY }}>
        <motion.div className="hero-sun" variants={sunVariants} style={{ x: sunPX, y: sunPY }} />
      </motion.div>

      <HeroLandBack farY={farY} ridgeY={ridgeY} pointerX={peaksPX} />

      <div className="hero-arch-anchor" ref={anchor}>
        <motion.p className="hero-caption caps" style={{ opacity: captionOpacity }}>
          {t.hero.caption}
        </motion.p>
      </div>

      {!pinned && <HeroWindow stageRef={art} {...windowProps} />}

      <motion.div className="hero-flight-wrap" style={{ opacity: swooshOpacity }}>
        <FlightSwoosh className="hero-flight" segments={SWOOSH} viewBox="0 0 600 740" width={17} draw={draw} forward={forward} planeWidth={96} />
      </motion.div>

      {!pinned && lockup}
    </div>
  )

  const waves = (
    <motion.div
      className="hero-waves"
      aria-hidden="true"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={ready || reduce ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 1.4, ease: EXPO_OUT, delay: 0.6 }}
    />
  )

  if (pinned) {
    return (
      <section id="top" ref={section} className="hero hero-pinned" onPointerMove={onPointerMove} aria-labelledby="hero-title">
        <div className="hero-stage" ref={stage}>
          <motion.div className="hero-grid container" initial="hidden" animate={state}>
            {copy}
            {artBox}
          </motion.div>
          <HeroWindow stageRef={stage} bottom={BAND} {...windowProps} />
          {lockup}
          {waves}
          <DestinationBand />
        </div>
      </section>
    )
  }

  return (
    <section id="top" ref={section} className="hero" onPointerMove={onPointerMove} aria-labelledby="hero-title">
      <motion.div className="hero-grid container" initial={reduce ? false : 'hidden'} animate={state}>
        {copy}
        {artBox}
      </motion.div>
      {waves}
      <DestinationBand />
    </section>
  )
}
