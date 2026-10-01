import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useLang } from '../lib/i18n'
import { lockScroll } from '../lib/scroll'
import { whatsappLink } from '../config'
import { DRAWER, EXPO_OUT } from '../lib/motion'
import { ArrowSwap, CloseIcon } from './Icons'
import './ServicesSheet.css'

// The full list of services, drawn from the reading edge. Esc, the backdrop and the close button all dismiss it.
export function ServicesSheet({ open, onClose, returnFocus }) {
  const { t, dir, lang } = useLang()
  const panel = useRef(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  const offstage = dir === 'rtl' ? '-100%' : '100%'

  useEffect(() => {
    if (!open) return
    lockScroll(true)
    const focus = window.setTimeout(() => panel.current?.querySelector('button')?.focus(), 80)
    const onKey = (e) => {
      if (e.key === 'Escape') closeRef.current()
      if (e.key === 'Tab' && panel.current) {
        const items = [...panel.current.querySelectorAll('a, button')]
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
    const opener = returnFocus.current
    return () => {
      window.clearTimeout(focus)
      document.removeEventListener('keydown', onKey)
      lockScroll(false)
      opener?.focus({ preventScroll: true })
    }
  }, [open, returnFocus])

  const messageFor = (id) => t.services.items.find((s) => s.id === id)?.message ?? t.messages.general

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="sheet-root" key={lang}>
          <motion.div
            className="sheet-backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
            transition={{ duration: 0.4 }}
          />
          <motion.div
            ref={panel}
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheet-title"
            data-lenis-prevent
            initial={{ x: offstage }}
            animate={{ x: '0%' }}
            exit={{ x: offstage, transition: { duration: 0.32, ease: DRAWER } }}
            transition={{ duration: 0.6, ease: DRAWER }}
          >
            <div className="sheet-head">
              <h2 id="sheet-title" className="sheet-title">
                {t.sheet.title}
              </h2>
              <button type="button" className="sheet-close" onClick={onClose} aria-label={t.sheet.close}>
                <CloseIcon width="22" height="22" />
              </button>
            </div>

            <div className="sheet-groups">
              {t.sheet.groups.map((g, i) => (
                <motion.section
                  key={g.id}
                  className="sheet-group"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: EXPO_OUT, delay: 0.18 + i * 0.06 }}
                >
                  <h3>{g.title}</h3>
                  <ul>
                    {g.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <a className="sheet-ask" href={whatsappLink(messageFor(g.id))} target="_blank" rel="noopener noreferrer">
                    {t.sheet.ask}
                    <ArrowSwap />
                  </a>
                </motion.section>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
