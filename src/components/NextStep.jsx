import { useEffect, useRef } from 'react'
import { animate, useInView, useMotionValue, useReducedMotion } from 'motion/react'
import { useLang } from '../lib/i18n'
import { contact, whatsappLink } from '../config'
import { EASE_IN_OUT, IN_VIEW } from '../lib/motion'
import { RevealWords, FadeUp } from './Reveal'
import { FlightSwoosh } from './FlightSwoosh'
import { Magnetic } from './Magnetic'
import { Stars } from './Stars'
import { PinIcon, WhatsAppIcon } from './Icons'
import './NextStep.css'

// The page closes the way it opened: the logo's swoosh drawn once more, now across the night.
const STAR_CLEARING = { x0: 4, x1: 96, y0: 16, y1: 70 }

const SWOOSH = [
  [[20, 150], [260, 196], [520, 160], [700, 112]],
  [[700, 112], [820, 80], [900, 56], [985, 22]],
]

export function NextStep() {
  const { t } = useLang()
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const inView = useInView(ref, IN_VIEW)
  const draw = useMotionValue(reduce ? 1 : 0)

  useEffect(() => {
    if (!inView || reduce) return
    const controls = animate(draw, 1, { duration: 2, ease: EASE_IN_OUT, delay: 0.5 })
    return () => controls.stop()
  }, [inView, reduce, draw])

  const booking = contact.bookingUrl || whatsappLink(t.messages.consultation)

  return (
    <section id="contact" ref={ref} className="next on-dark" aria-labelledby="next-title">
      <Stars count={80} seed={23} depth={100} clear={STAR_CLEARING} />
      <div className="next-moon" aria-hidden="true" />

      <div className="container next-inner">
        <RevealWords id="next-title" className="display-1 next-title" text={t.next.title} />
        <FadeUp as="p" className="lede next-body" delay={0.25}>
          {t.next.body}
        </FadeUp>
        <FadeUp className="next-ctas" delay={0.4}>
          <Magnetic>
            <a className="btn btn-gold btn-lg" href={whatsappLink(t.messages.general)} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon width="20" height="20" />
              {t.next.primary}
            </a>
          </Magnetic>
          <a className="btn btn-line paper btn-lg" href={booking} target="_blank" rel="noopener noreferrer">
            {t.next.secondary}
          </a>
          <a className="btn btn-line paper btn-lg" href={contact.mapUrl} target="_blank" rel="noopener noreferrer">
            <PinIcon width="20" height="20" />
            {t.next.map}
            <span className="visually-hidden">{t.mapNewTab}</span>
          </a>
        </FadeUp>
        <div className="next-flight">
          <FlightSwoosh segments={SWOOSH} viewBox="0 0 1000 220" width={9} draw={draw} planeWidth={74} color="var(--gold-bright)" plane="/brand/plane-right-gold.png" />
        </div>
      </div>
    </section>
  )
}
