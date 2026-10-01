import { useEffect, useState, useSyncExternalStore } from 'react'

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const update = () => setMatches(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [query])
  return matches
}

// Hover-driven effects only make sense with a precise pointer; touch screens fire hover on tap.
export const useFinePointer = () => useMediaQuery('(hover: hover) and (pointer: fine)')

// The intro curtain announces when it starts lifting so the hero can play its entrance underneath it.
let introDone = false
const introListeners = new Set()

export function markIntroDone() {
  if (introDone) return
  introDone = true
  introListeners.forEach((fn) => fn())
}

export function useIntroDone() {
  return useSyncExternalStore(
    (cb) => {
      introListeners.add(cb)
      return () => introListeners.delete(cb)
    },
    () => introDone,
  )
}
