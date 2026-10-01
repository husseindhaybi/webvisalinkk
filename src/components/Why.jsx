import { useRef } from 'react'
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useLang } from '../lib/i18n'
import { EXPO_OUT, IN_VIEW } from '../lib/motion'
import { RevealWords } from './Reveal'
import { WhyIcon } from './Icons'
import './Why.css'

const ICONS = ['person', 'languages', 'fees', 'folder', 'link']

export function Why() {
  const { t } = useLang()
  const reduce = useReducedMotion()
  const art = useRef(null)
  const list = useRef(null)
  const artInView = useInView(art, IN_VIEW)
  const listInView = useInView(list, IN_VIEW)
  const { scrollYProgress } = useScroll({ target: art, offset: ['start end', 'end start'] })
  const viewY = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-9%', '9%'])
  const show = artInView || reduce

  return (
    <section id="about" className="why" aria-labelledby="why-title">
      <div className="container why-grid">
        {/* A Lebanese triple-arched window: one view of the sky, seen through three openings. */}
        <div className="why-art" ref={art}>
          <div className="triple">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="triple-arch"
                style={{ '--i': i }}
                initial={reduce ? false : { clipPath: 'inset(100% 0% 0% 0%)' }}
                animate={show ? { clipPath: 'inset(0% 0% 0% 0%)' } : undefined}
                transition={{ duration: 1.3, ease: EXPO_OUT, delay: i * 0.12 }}
              >
                <motion.img
                  src="/images/why-window.webp"
                  alt={i === 1 ? t.why.imageAlt : ''}
                  loading="lazy"
                  decoding="async"
                  style={{ y: viewY }}
                />
              </motion.div>
            ))}
          </div>
          <div className="triple-sill" />
        </div>

        <div className="why-copy">
          <RevealWords id="why-title" className="display-2" text={t.why.title} />
          <ul className="why-list" ref={list}>
            {t.why.items.map((item, i) => (
              <li key={item} className="why-item">
                <motion.span
                  className="why-rule"
                  aria-hidden="true"
                  initial={reduce ? false : { scaleX: 0 }}
                  animate={listInView || reduce ? { scaleX: 1 } : undefined}
                  transition={{ duration: 1.1, ease: EXPO_OUT, delay: 0.1 + i * 0.08 }}
                />
                <motion.span
                  className="why-row"
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={listInView || reduce ? { opacity: 1, y: 0 } : undefined}
                  transition={{ duration: 0.9, ease: EXPO_OUT, delay: 0.22 + i * 0.08 }}
                >
                  <WhyIcon name={ICONS[i]} />
                  <span>{item}</span>
                </motion.span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
