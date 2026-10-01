import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

let lenis = null

// Smooth, inertial scrolling. Skipped entirely for visitors who ask for reduced motion.
export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    lenis = new Lenis({ autoRaf: true, lerp: 0.11, wheelMultiplier: 0.95 })
    return () => {
      lenis?.destroy()
      lenis = null
    }
  }, [])
}

export function scrollToId(id) {
  const target = id === 'top' ? 0 : document.getElementById(id)
  if (target === null) return
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.5, easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) })
  } else {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const top = target === 0 ? 0 : target.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' })
  }
}

// Anchor click handler that keeps the real href for no-JS, middle-click and copy-link.
export function anchorTo(id, after) {
  return (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) return
    event.preventDefault()
    if (after) {
      // Links inside an overlay close it first; release the scroll lock now rather than on unmount,
      // or the smooth scroller would ignore the jump.
      after()
      lockScroll(false)
    }
    scrollToId(id)
    if (id !== 'top') history.replaceState(null, '', `#${id}`)
    else history.replaceState(null, '', location.pathname + location.search)
  }
}

export function lockScroll(locked) {
  if (locked) lenis?.stop()
  else lenis?.start()
  document.documentElement.classList.toggle('scroll-locked', locked)
}
