import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useLang } from '../lib/i18n'
import { anchorTo, lockScroll } from '../lib/scroll'
import { whatsappLink } from '../config'
import { EXPO_OUT, EASE_IN_OUT } from '../lib/motion'
import { LangToggle } from './LangToggle'
import { WhatsAppIcon } from './Icons'
import './Nav.css'

export function useNavLinks() {
  const { t } = useLang()
  return [
    { id: 'top', label: t.nav.home },
    { id: 'services', label: t.nav.services },
    { id: 'about', label: t.nav.about },
    { id: 'contact', label: t.nav.contact },
  ]
}

export function Nav() {
  const { t } = useLang()
  const links = useNavLinks()
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const menuButton = useRef(null)

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setScrolled(y > 24)
    if (!open) setHidden(y > prev && y > 320)
  })

  return (
    <>
      <header className="nav" data-scrolled={scrolled} data-hidden={hidden && !open}>
        <div className="nav-inner container">
          <a className="nav-logo" href="#top" onClick={anchorTo('top')} aria-label={t.hero.brand}>
            <img src="/brand/logo.png" alt="" width="1400" height="648" />
          </a>

          <nav className="nav-links" aria-label={t.nav.menu}>
            {links.map((l) => (
              <a key={l.id} href={l.id === 'top' ? '#' : `#${l.id}`} onClick={anchorTo(l.id)}>
                {l.label}
              </a>
            ))}
          </nav>

          <div className="nav-actions">
            <LangToggle />
            <a className="btn btn-gold btn-sm nav-wa" href={whatsappLink(t.messages.general)} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon width="18" height="18" />
              {t.nav.whatsapp}
            </a>
            <button
              ref={menuButton}
              type="button"
              className="nav-burger"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? t.nav.close : t.nav.menu}
              onClick={() => setOpen((o) => !o)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={open} onClose={() => setOpen(false)} returnFocus={menuButton} links={links} />
    </>
  )
}

function MobileMenu({ open, onClose, returnFocus, links }) {
  const { t } = useLang()
  const panel = useRef(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  const [origin, setOrigin] = useState('calc(100% - 40px) 32px')

  useEffect(() => {
    if (!open) return
    // Grow the panel out of the button that opened it.
    const r = returnFocus.current?.getBoundingClientRect()
    if (r) setOrigin(`${r.left + r.width / 2}px ${r.top + r.height / 2}px`)
    lockScroll(true)
    const focusFirst = window.setTimeout(() => panel.current?.querySelector('a, button')?.focus(), 60)
    const onKey = (e) => {
      if (e.key === 'Escape') closeRef.current()
      if (e.key === 'Tab' && panel.current) {
        // The close button lives in the header bar, so it joins the trap explicitly.
        const items = [returnFocus.current, ...panel.current.querySelectorAll('a, button')].filter(Boolean)
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    const button = returnFocus.current
    return () => {
      window.clearTimeout(focusFirst)
      document.removeEventListener('keydown', onKey)
      lockScroll(false)
      button?.focus({ preventScroll: true })
    }
  }, [open, returnFocus])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          ref={panel}
          className="menu on-dark"
          role="dialog"
          aria-modal="true"
          aria-label={t.nav.menu}
          initial={{ clipPath: `circle(0px at ${origin})` }}
          animate={{ clipPath: `circle(150% at ${origin})` }}
          exit={{ clipPath: `circle(0px at ${origin})`, transition: { duration: 0.45, ease: EASE_IN_OUT } }}
          transition={{ duration: 0.75, ease: EASE_IN_OUT }}
        >
          <nav className="menu-links" aria-label={t.nav.menu}>
            {links.map((l, i) => (
              <span className="mask mask-line" key={l.id}>
                <motion.a
                  className="mask-inner"
                  href={l.id === 'top' ? '#' : `#${l.id}`}
                  onClick={anchorTo(l.id, onClose)}
                  initial={{ y: '110%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 0.9, ease: EXPO_OUT, delay: 0.18 + i * 0.06 }}
                >
                  {l.label}
                </motion.a>
              </span>
            ))}
          </nav>
          <motion.div
            className="menu-foot"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EXPO_OUT, delay: 0.42 }}
          >
            <a className="btn btn-gold" href={whatsappLink(t.messages.general)} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon width="20" height="20" />
              {t.next.primary}
            </a>
            <LangToggle tone="paper" layoutId="lang-pill-menu" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
