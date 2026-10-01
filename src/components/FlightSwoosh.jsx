import { useId, useLayoutEffect, useMemo, useRef } from 'react'
import { motion, useMotionValueEvent, useTransform } from 'motion/react'
import { centreline, placeOnPath, ribbon } from '../lib/geometry'

// The logo's gesture, redrawn live: a tapered gold swoosh that draws itself while the plane rides its tip.
// `draw` (0 → 1) reveals the ribbon; `forward` (viewBox units) flies the plane on past the end.
export function FlightSwoosh({
  segments,
  viewBox,
  width = 16,
  draw,
  forward,
  plane = '/brand/plane-right-gold.png',
  planeWidth = 92,
  color = 'var(--gold)',
  taper,
  className = '',
}) {
  const id = useId().replace(/:/g, '')
  const line = useRef(null)
  const planeRef = useRef(null)
  const d = useMemo(() => centreline(segments), [segments])
  const shape = useMemo(() => ribbon(segments, width, taper), [segments, width, taper])
  const planeHeight = planeWidth * (345 / 360)
  const planeOpacity = useTransform(draw, [0, 0.04], [0, 1])

  const place = () => placeOnPath(line.current, planeRef.current, draw.get(), forward ? forward.get() : 0)
  useLayoutEffect(place)
  useMotionValueEvent(draw, 'change', place)
  useMotionValueEvent(forward ?? draw, 'change', place)

  return (
    <svg className={`flight ${className}`} viewBox={viewBox} aria-hidden="true" focusable="false">
      <defs>
        <mask id={`reveal-${id}`} maskUnits="userSpaceOnUse">
          <motion.path
            d={d}
            fill="none"
            stroke="#fff"
            strokeWidth={width * 2.2}
            strokeLinecap="butt"
            style={{ pathLength: draw }}
          />
        </mask>
      </defs>
      <path d={shape} fill={color} mask={`url(#reveal-${id})`} />
      <path ref={line} d={d} fill="none" stroke="none" />
      <motion.g style={{ opacity: planeOpacity }}>
        <g ref={planeRef}>
          <g className="plane-bob">
            <image href={plane} width={planeWidth} height={planeHeight} x={-planeWidth / 2} y={-planeHeight / 2} />
          </g>
        </g>
      </motion.g>
    </svg>
  )
}
