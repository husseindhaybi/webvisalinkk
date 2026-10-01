import { useCallback, useLayoutEffect, useRef } from 'react'
import { useMotionValueEvent } from 'motion/react'
import { useLang } from '../lib/i18n'

// The arch window that opens onto the whole screen.
// One full-frame photograph sits under a clip that starts as the arch (measured from `anchorRef`)
// and grows to fill the stage. The photo is re-fitted every frame to cover whatever the clip
// currently shows, so the view stays composed around the rock as the window opens.
// Everything runs on clip-path and transform: no layout work while scrolling.

const IMG_W = 2400
const IMG_H = 1600
const FRAME = 9 // the paper reveal around the arch, in px

const lerp = (a, b, t) => a + (b - a) * t
const clamp01 = (v) => Math.min(1, Math.max(0, v))

export function HeroWindow({ stageRef, anchorRef, open, load, drift, pointerX, pointerY, bottom = 0, alt }) {
  const { lang } = useLang()
  const mat = useRef(null)
  const clip = useRef(null)
  const img = useRef(null)
  const geo = useRef(null)

  const measure = useCallback(() => {
    const stage = stageRef.current
    const anchor = anchorRef.current
    if (!stage || !anchor) return
    const s = stage.getBoundingClientRect()
    const a = anchor.getBoundingClientRect()
    geo.current = {
      W: s.width,
      H: s.height,
      Hopen: s.height - bottom,
      arch: { x: a.left - s.left, y: a.top - s.top, w: a.width, h: a.height },
    }
  }, [stageRef, anchorRef, bottom])

  const apply = useCallback(() => {
    const g = geo.current
    if (!g || !clip.current || !img.current) return
    const e = clamp01(open.get())
    const l = clamp01(load.get())
    const d = drift ? clamp01(drift.get()) : 0
    const { W, H, Hopen, arch } = g

    // The window's box, from the arch to the open stage.
    const x = lerp(arch.x, 0, e)
    const y = lerp(arch.y, 0, e)
    const w = lerp(arch.w, W, e)
    const h = lerp(arch.h, Hopen, e)
    const r = (arch.w / 2) * Math.pow(1 - e, 1.6)
    // On load the window fills from its sill upwards.
    const top = y + h * (1 - l)
    const right = W - (x + w)
    const below = H - (y + h)
    clip.current.style.clipPath = `inset(${top}px ${right}px ${below}px ${x}px round ${r}px ${r}px 0 0)`

    if (mat.current) {
      const f = FRAME * (1 - e)
      mat.current.style.clipPath = `inset(${Math.max(0, top - f)}px ${right - f}px ${below}px ${x - f}px round ${r + f}px ${r + f}px 0 0)`
      mat.current.style.opacity = String(clamp01(1 - e * 2.5) * (l > 0.02 ? 1 : 0))
    }

    // Cover-fit the photo to the box, framed on the rock while narrow and on the whole bay when open.
    const zoom = (1 + 0.3 * (1 - l)) * (1 + 0.1 * (1 - e)) * (1 + 0.06 * d)
    const scale = Math.max(w / IMG_W, h / IMG_H) * zoom
    const fx = lerp(0.3, 0.42, e)
    const fy = lerp(0.62, 0.56, e)
    const sway = 1 - e
    const px = (pointerX ? pointerX.get() : 0) * 16 * sway
    const py = (pointerY ? pointerY.get() : 0) * 10 * sway
    const left = x + (w - IMG_W * scale) * fx + px
    const tp = y + (h - IMG_H * scale) * fy + py
    img.current.style.transform = `translate3d(${left.toFixed(2)}px, ${tp.toFixed(2)}px, 0) scale(${scale.toFixed(5)})`
  }, [open, load, drift, pointerX, pointerY])

  // The arch moves whenever the layout does: a resize, the page flipping to Arabic, late web fonts.
  // Measure again on each, and once more on the next frame in case anything settles after this render.
  useLayoutEffect(() => {
    const refresh = () => {
      measure()
      apply()
    }
    refresh()
    const raf = requestAnimationFrame(refresh)
    const ro = new ResizeObserver(refresh)
    if (stageRef.current) ro.observe(stageRef.current)
    if (anchorRef.current) ro.observe(anchorRef.current)
    window.addEventListener('resize', refresh)
    document.fonts?.ready.then(refresh)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('resize', refresh)
    }
  }, [measure, apply, stageRef, anchorRef, lang])

  useMotionValueEvent(open, 'change', apply)
  useMotionValueEvent(load, 'change', apply)
  useMotionValueEvent(drift ?? open, 'change', apply)
  useMotionValueEvent(pointerX ?? open, 'change', apply)
  useMotionValueEvent(pointerY ?? open, 'change', apply)

  return (
    <div className="hero-window" aria-hidden={alt ? undefined : 'true'}>
      <div ref={mat} className="hero-window-mat" />
      <div ref={clip} className="hero-window-clip">
        <img
          ref={img}
          className="hero-window-img"
          src="/images/hero-raouche-wide.webp"
          srcSet="/images/hero-raouche-wide-1400.webp 1400w, /images/hero-raouche-wide.webp 2400w"
          sizes="100vw"
          width={IMG_W}
          height={IMG_H}
          alt={alt ?? ''}
          fetchPriority="high"
          decoding="async"
        />
      </div>
    </div>
  )
}
