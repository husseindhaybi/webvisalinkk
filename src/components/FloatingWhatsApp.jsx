import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useLang } from '../lib/i18n'
import { whatsappLink } from '../config'
import { EXPO_OUT } from '../lib/motion'
import { WhatsAppIcon } from './Icons'
import './FloatingWhatsApp.css'

// A persistent way to message the office once the hero's own buttons have scrolled away.
// It steps aside while the closing call to action is on screen, so the page never shows two at once.
export function FloatingWhatsApp() {
  const { t } = useLang()
  const { scrollY } = useScroll()
  const [pastHero, setPastHero] = useState(false)
  const [closeVisible, setCloseVisible] = useState(false)

  useMotionValueEvent(scrollY, 'change', (y) => setPastHero(y > window.innerHeight * 0.85))

  useEffect(() => {
    const target = document.getElementById('contact')
    if (!target) return
    const io = new IntersectionObserver(([entry]) => setCloseVisible(entry.isIntersecting), { threshold: 0.05 })
    io.observe(target)
    return () => io.disconnect()
  }, [])

  const show = pastHero && !closeVisible

  return (
    <AnimatePresence>
      {show && (
        <motion.a
          className="float-wa"
          href={whatsappLink(t.messages.general)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.floating}
          initial={{ opacity: 0, scale: 0.9, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 8, transition: { duration: 0.2 } }}
          transition={{ duration: 0.5, ease: EXPO_OUT }}
        >
          <WhatsAppIcon width="26" height="26" />
          <span className="float-wa-label" aria-hidden="true">
            <span>{t.floating}</span>
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  )
}
