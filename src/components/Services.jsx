import { useRef, useState } from 'react'
import { motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { useLang } from '../lib/i18n'
import { useFinePointer } from '../lib/hooks'
import { whatsappLink } from '../config'
import { EXPO_OUT, IN_VIEW } from '../lib/motion'
import { RevealWords, FadeUp } from './Reveal'
import { ArrowSwap } from './Icons'
import { ServicesSheet } from './ServicesSheet'
import './Services.css'

export function Services() {
  const { t } = useLang()
  const [sheetOpen, setSheetOpen] = useState(false)
  const opener = useRef(null)

  return (
    <section id="services" className="services" aria-labelledby="services-title">
      <div className="container">
        <header className="services-head">
          <RevealWords id="services-title" className="display-2" text={t.services.title} />
          <FadeUp as="p" className="lede services-intro" delay={0.2}>
            {t.services.intro}
          </FadeUp>
        </header>

        <div className="posters">
          {t.services.items.map((item, i) => (
            <ServicePoster key={item.id} item={item} index={i} askLabel={t.services.ask} note={t.newTab} />
          ))}
        </div>

        <FadeUp className="services-foot">
          <button ref={opener} type="button" className="btn btn-line ink" onClick={() => setSheetOpen(true)} aria-haspopup="dialog">
            {t.services.viewAll}
            <ArrowSwap />
          </button>
        </FadeUp>
      </div>

      <ServicesSheet open={sheetOpen} onClose={() => setSheetOpen(false)} returnFocus={opener} />
    </section>
  )
}

function ServicePoster({ item, index, askLabel, note }) {
  const reduce = useReducedMotion()
  const fine = useFinePointer()
  const ref = useRef(null)
  const colorRef = useRef(null)
  const inView = useInView(ref, IN_VIEW)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-7%', '7%'])

  // The sheet leans a few degrees toward the pointer, on springs, like a print lifted off the wall.
  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)
  const rotateX = useSpring(tiltX, { stiffness: 140, damping: 18, mass: 0.6 })
  const rotateY = useSpring(tiltY, { stiffness: 140, damping: 18, mass: 0.6 })

  // Hovering develops the two-ink print into the full-colour photograph, spreading from the pointer.
  const setOrigin = (e) => {
    const el = colorRef.current
    if (!el || !fine) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
    if (reduce) return
    tiltX.set(((e.clientY - r.top) / r.height - 0.5) * -5)
    tiltY.set(((e.clientX - r.left) / r.width - 0.5) * 7)
  }
  const settle = (e) => {
    setOrigin(e)
    tiltX.set(0)
    tiltY.set(0)
  }

  return (
    <article className={`poster poster-${index + 1}`} ref={ref}>
      <a
        className="poster-link"
        href={whatsappLink(item.message)}
        target="_blank"
        rel="noopener noreferrer"
        onPointerEnter={setOrigin}
        onPointerMove={setOrigin}
        onPointerLeave={settle}
      >
        {/* A whole poster sheet: its own ground ink, the two-ink print, and the destination lettered beneath. */}
        <motion.div
          className="poster-sheet"
          style={{ rotateX, rotateY, transformPerspective: 1100 }}
          initial={reduce ? false : { clipPath: 'inset(100% 0% 0% 0%)' }}
          animate={inView || reduce ? { clipPath: 'inset(0% 0% 0% 0%)' } : undefined}
          transition={{ duration: 1.3, ease: EXPO_OUT }}
        >
          <div className="poster-print">
            <motion.div
              className="poster-zoom"
              initial={reduce ? false : { scale: 1.25 }}
              animate={inView || reduce ? { scale: 1 } : undefined}
              transition={{ duration: 1.8, ease: EXPO_OUT }}
            >
              <motion.div className="poster-parallax" style={{ y }}>
                <img className="poster-img" src={`${item.image}.webp`} alt={item.alt} loading="lazy" decoding="async" />
                {fine && (
                  <img ref={colorRef} className="poster-img poster-color" src={`${item.image}-color.webp`} alt="" loading="lazy" decoding="async" />
                )}
              </motion.div>
            </motion.div>
          </div>
          <p className="poster-lockup" aria-hidden="true">
            <span className="mask">
              <motion.span
                className="mask-inner poster-label"
                initial={reduce ? false : { y: '110%' }}
                animate={inView || reduce ? { y: '0%' } : undefined}
                transition={{ duration: 1.1, ease: EXPO_OUT, delay: 0.4 }}
              >
                {item.label}
              </motion.span>
            </span>
          </p>
        </motion.div>

        <motion.div
          className="poster-caption"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={inView || reduce ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.9, ease: EXPO_OUT, delay: 0.3 }}
        >
          <h3 className="poster-title">{item.title}</h3>
          <p className="poster-body">{item.body}</p>
          <span className="poster-cta">
            {askLabel}
            <ArrowSwap />
            <span className="visually-hidden"> {note}</span>
          </span>
        </motion.div>
      </a>
    </article>
  )
}
