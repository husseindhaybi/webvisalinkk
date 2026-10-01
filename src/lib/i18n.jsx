import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { content } from '../content'

const LanguageContext = createContext(null)

const initialLang = () => (document.documentElement.lang === 'ar' ? 'ar' : 'en')

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(initialLang)
  const timer = useRef(0)

  useEffect(() => {
    const root = document.documentElement
    root.lang = lang
    root.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.title = content[lang].meta.title
    try {
      localStorage.setItem('vl-lang', lang)
    } catch {
      /* private mode: the choice just isn't remembered */
    }
  }, [lang])

  // The page blurs out for a beat, swaps language and direction while nothing is readable, then settles back.
  const switchTo = useCallback(
    (next) => {
      if (next === lang) return
      const root = document.documentElement
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        root.lang = next
        root.dir = next === 'ar' ? 'rtl' : 'ltr'
        setLang(next)
        return
      }
      clearTimeout(timer.current)
      root.classList.add('is-switching')
      timer.current = window.setTimeout(() => {
        // Flip the document first so components measuring layout on this render already see the new direction.
        root.lang = next
        root.dir = next === 'ar' ? 'rtl' : 'ltr'
        setLang(next)
        requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('is-switching')))
      }, 190)
    },
    [lang],
  )

  const value = useMemo(() => ({ lang, t: content[lang], dir: lang === 'ar' ? 'rtl' : 'ltr', switchTo }), [lang, switchTo])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export const useLang = () => useContext(LanguageContext)
