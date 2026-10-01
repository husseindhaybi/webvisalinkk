// Geometry for the logo's swoosh: a tapered ribbon built around a chain of cubic Bézier segments,
// plus a helper that parks an SVG element on a path, nose pointing along it.

const cubic = (a, b, c, d, t) => {
  const m = 1 - t
  return m * m * m * a + 3 * m * m * t * b + 3 * m * t * t * c + t * t * t * d
}
const dcubic = (a, b, c, d, t) => {
  const m = 1 - t
  return 3 * m * m * (b - a) + 6 * m * t * (c - b) + 3 * t * t * (d - c)
}

export function centreline(segments) {
  const [start] = segments[0]
  return `M${start[0]} ${start[1]}` + segments.map(([, c1, c2, end]) => `C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${end[0]} ${end[1]}`).join('')
}

// Thickest at `peak` along the curve, thinning to `head` and `tail` at the two ends, like a brush stroke.
export function swooshWidth(t, { peak = 0.28, tail = 0.12, head = 0.08 } = {}) {
  if (t <= peak) return tail + (1 - tail) * Math.sin((t / peak) * (Math.PI / 2))
  return head + (1 - head) * Math.cos(((t - peak) / (1 - peak)) * (Math.PI / 2))
}

export function ribbon(segments, maxWidth, options) {
  const samples = 60
  const left = []
  const right = []
  segments.forEach(([p0, p1, p2, p3], si) => {
    for (let i = si === 0 ? 0 : 1; i <= samples; i++) {
      const t = i / samples
      const x = cubic(p0[0], p1[0], p2[0], p3[0], t)
      const y = cubic(p0[1], p1[1], p2[1], p3[1], t)
      const dx = dcubic(p0[0], p1[0], p2[0], p3[0], t)
      const dy = dcubic(p0[1], p1[1], p2[1], p3[1], t)
      const len = Math.hypot(dx, dy) || 1
      const half = (maxWidth * swooshWidth((si + t) / segments.length, options)) / 2
      const nx = (-dy / len) * half
      const ny = (dx / len) * half
      left.push(`${(x + nx).toFixed(1)} ${(y + ny).toFixed(1)}`)
      right.push(`${(x - nx).toFixed(1)} ${(y - ny).toFixed(1)}`)
    }
  })
  return `M${left.join('L')}L${right.reverse().join('L')}Z`
}

const lengths = new WeakMap()

export function placeOnPath(path, el, progress, forward = 0) {
  if (!path || !el) return
  let total = lengths.get(path)
  if (!total) {
    total = path.getTotalLength()
    lengths.set(path, total)
  }
  const at = Math.min(1, Math.max(0, progress)) * total
  const p = path.getPointAtLength(at)
  const a = path.getPointAtLength(Math.max(0, at - 1.5))
  const b = path.getPointAtLength(Math.min(total, at + 1.5))
  const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
  el.setAttribute('transform', `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${angle.toFixed(2)}) translate(${forward.toFixed(1)} 0)`)
}

// Length fraction of the point on `path` nearest to (x, y); used to know when the plane reaches a waypoint.
export function fractionAt(path, x, y) {
  const total = path.getTotalLength()
  let best = 0
  let bestDist = Infinity
  for (let i = 0; i <= 400; i++) {
    const p = path.getPointAtLength((i / 400) * total)
    const d = (p.x - x) ** 2 + (p.y - y) ** 2
    if (d < bestDist) {
      bestDist = d
      best = i / 400
    }
  }
  return best
}

// Deterministic pseudo-random numbers so the star field is identical on every render.
export function seeded(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}
