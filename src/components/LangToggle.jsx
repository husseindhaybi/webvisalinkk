import { motion } from 'motion/react'
import { useLang } from '../lib/i18n'
import { DRAWER } from '../lib/motion'
import './LangToggle.css'

const options = [
  { id: 'en', label: 'EN', name: 'English' },
  { id: 'ar', label: 'عربي', name: 'العربية' },
]

export function LangToggle({ tone = 'ink', layoutId = 'lang-pill' }) {
  const { lang, switchTo, t } = useLang()
  return (
    <div className={`lang-toggle ${tone}`} role="group" aria-label={t.nav.langLabel}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          lang={o.id}
          className="lang-option"
          aria-pressed={lang === o.id}
          aria-label={o.name}
          onClick={() => switchTo(o.id)}
        >
          {lang === o.id && (
            <motion.span className="lang-pill" layoutId={layoutId} transition={{ duration: 0.4, ease: DRAWER }} />
          )}
          <span className="lang-label">{o.label}</span>
        </button>
      ))}
    </div>
  )
}
