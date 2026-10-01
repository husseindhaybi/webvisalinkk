import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { markIntroDone } from '../lib/hooks'
import { EASE_IN_OUT, EXPO_OUT } from '../lib/motion'
import './Intro.css'

const firstVisit = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try {
    return !sessionStorage.getItem('vl-intro')
  } catch {
    return false
  }
}

// A short night curtain with the logo, shown once per visit, lifting to reveal the morning over Beirut.
export function Intro() {
  const [show, setShow] = useState(firstVisit)

  useEffect(() => {
    if (!show) {
      markIntroDone()
      return
    }
    try {
      sessionStorage.setItem('vl-intro', '1')
    } catch {
      /* ignore */
    }
    const id = window.setTimeout(() => setShow(false), 1450)
    return () => window.clearTimeout(id)
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="intro"
          aria-hidden="true"
          onClick={() => setShow(false)}
          initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: 0.95, ease: EASE_IN_OUT }}
        >
          <motion.img
            className="intro-logo"
            src="/brand/logo-light.png"
            alt=""
            width="1400"
            height="648"
            initial={{ opacity: 0, scale: 0.96, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -24, transition: { duration: 0.45, ease: EXPO_OUT } }}
            transition={{ duration: 0.8, ease: EXPO_OUT }}
          />
          <span className="intro-line">
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.25, ease: [0.65, 0, 0.35, 1] }}
            />
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
