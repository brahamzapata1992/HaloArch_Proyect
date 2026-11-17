import { useId } from 'react'

// Shared 3-arch scene: real frame sizes, the gold stands and the balloon
// garland. Used by the custom design page and the home page.

/* ------------------------------------------------------------------ scene
 * Everything is laid out in real centimetres (SVG-style: y grows downward),
 * then scaled to the live preview (%) and to the exported PNG (px).
 * Display order mirrors the real setup: medium – tallest – smallest.
 */
export const ARCH_META = [
  { key: 'left', w: 100, h: 200, size: '39 × 78 in', ft: 6.6, z: 2 },
  { key: 'center', w: 120, h: 220, size: '47 × 86 in', ft: 7.2, z: 1 },
  { key: 'right', w: 80, h: 180, size: '31 × 70 in', ft: 6, z: 2 },
]
export const FOOT_H = 12 // visible gold stand below the fabric cover
export const FLOOR_PAD = 18
export const TOP_PAD = 50 // room for the balloon garland
export const SIDE_PAD = 58
export const OVERLAP = 6 // side arches sit slightly in front of the center one
export const MAX_H = Math.max(...ARCH_META.map((a) => a.h))
export const ARCH_BOTTOM = TOP_PAD + MAX_H
export const FLOOR_Y = ARCH_BOTTOM + FOOT_H
export const STAGE_H = FLOOR_Y + FLOOR_PAD

export const ARCHES = (() => {
  let x = SIDE_PAD
  return ARCH_META.map((m) => {
    const a = { ...m, x, top: ARCH_BOTTOM - m.h }
    x += m.w - OVERLAP
    return a
  })
})()
export const STAGE_W = ARCHES[2].x + ARCHES[2].w + SIDE_PAD
export const pctX = (v) => `${(v / STAGE_W) * 100}%`
export const pctY = (v) => `${(v / STAGE_H) * 100}%`

// Stands are always gold (that's what ships with the frames).
export const GOLD = { light: '#f7e6ad', base: '#cfa94f', dark: '#86661f' }
// Stand geometry (cm)
export const POST_W = 1.8
export const BAR_H = 1.6
export const FOOT_W = 16
export const FOOT_T = 2.2

export const BALLOON_PALETTE = [
  { name: 'Blush', hex: '#f5c9c4' },
  { name: 'Ivory', hex: '#f4e9cc' },
  { name: 'Peach', hex: '#f7cdb4' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Rose', hex: '#e8a0a6' },
  { name: 'Hot Pink', hex: '#e2508a' },
  { name: 'Sage', hex: '#a9bb9c' },
  { name: 'Baby Blue', hex: '#a9cbe8' },
  { name: 'Lavender', hex: '#c7b6e3' },
  { name: 'Yellow', hex: '#f3d36b' },
  { name: 'Red', hex: '#d8434a' },
  { name: 'Navy', hex: '#2f4a7a' },
  { name: 'Black', hex: '#2b2a2e' },
  { name: 'Rose Gold Chrome', hex: '#b9776a', chrome: true },
  { name: 'Gold Chrome', hex: '#c9a046', chrome: true },
  { name: 'Silver Chrome', hex: '#aab1b9', chrome: true },
]
export const CHROME = new Set(BALLOON_PALETTE.filter((p) => p.chrome).map((p) => p.hex))
export const MAX_COLORS = 5

export const LAYOUTS = ['full', 'half', 'base']

export const clamp = (v, min = 0, max = 100) => Math.min(max, Math.max(min, v))

/* ------------------------------------------------------------ helpers */

// Shared image placement model (live preview AND canvas export).
export function imageLayout(img, boxW, boxH, ctl) {
  const cover = Math.max(boxW / img.width, boxH / img.height)
  const W = img.width * cover * ctl.scale
  const H = img.height * cover * ctl.scale
  return { W, H, left: -(W - boxW) * (ctl.x / 100), top: -(H - boxH) * (ctl.y / 100) }
}

export function archRadius(meta) {
  const v = ((meta.w / 2) / meta.h) * 100
  return `50% 50% 0 0 / ${v}% ${v}% 0 0`
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export function mix(hex, target, amount) {
  const a = parseInt(hex.slice(1), 16)
  const b = parseInt(target.slice(1), 16)
  const ch = (n, s) => (n >> s) & 255
  const m = (s) => Math.round(ch(a, s) + (ch(b, s) - ch(a, s)) * amount)
  return `#${((1 << 24) | (m(16) << 16) | (m(8) << 8) | m(0)).toString(16).slice(1)}`
}

export function rng(seed) {
  let t = seed >>> 0
  return () => {
    t = (t + 0x6d2b79f5) >>> 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

// Smooth Catmull-Rom path through `points`, sampled densely with arc length.
export function smoothPath(points, steps = 24) {
  const pts = []
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] || p2
    for (let s = 0; s < steps; s++) {
      const t = s / steps
      const t2 = t * t
      const t3 = t2 * t
      pts.push([0, 1].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)))
    }
  }
  pts.push(points[points.length - 1])
  const len = [0]
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
  return { pts, len, total: len[len.length - 1] }
}

export function pointAt(path, s) {
  let i = 1
  while (i < path.len.length - 1 && path.len[i] < s) i++
  const [a, b] = [path.pts[i - 1], path.pts[i]]
  const seg = path.len[i] - path.len[i - 1] || 1
  const t = (s - path.len[i - 1]) / seg
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const d = Math.hypot(dx, dy) || 1
  return { x: a[0] + dx * t, y: a[1] + dy * t, nx: -dy / d, ny: dx / d }
}

// Organic balloon garland, like a real one: big balloons first, medium ones
// packed around them, and small ones tucked into the gaps. Generated once per
// layout (seeded) — each balloon keeps a stable random `c` used to pick its
// colour, so changing colours never reshuffles the garland.
export function buildBalloons(layout) {
  const rand = rng(layout === 'full' ? 7 : layout === 'half' ? 19 : 31)
  const out = []
  const fits = (x, y, r, k) => out.every((b) => Math.hypot(b.x - x, b.y - y) > (b.r + r) * k)
  const tryAdd = (x, y, r, k) => {
    const cx = clamp(x, r + 1, STAGE_W - r - 1)
    const cy = clamp(y, r + 1, FLOOR_Y - r * 0.96)
    if (!fits(cx, cy, r, k)) return false
    out.push({ x: cx, y: cy, r, c: rand(), rot: (rand() - 0.5) * 50 })
    return true
  }

  const garland = (points, thick, { taper = [1, 1], scale = 1, density = 1 } = {}) => {
    const path = smoothPath(points)
    const tiers = [
      { per: 24, r: [15, 21], k: 0.84, spread: 0.55 },
      { per: 12, r: [9.5, 13], k: 0.8, spread: 0.9 },
      { per: 13, r: [4.5, 7], k: 0.68, spread: 1.05 },
    ]
    tiers.forEach((tier) => {
      const target = Math.max(1, Math.round((path.total / tier.per) * density))
      let placed = 0
      for (let tries = 0; placed < target && tries < target * 60; tries++) {
        const s = rand() * path.total
        const p = pointAt(path, s)
        const u = s / path.total
        const f = taper[0] + (taper[1] - taper[0]) * u
        const r = (tier.r[0] + rand() * (tier.r[1] - tier.r[0])) * scale * (0.7 + 0.3 * f)
        const d = (rand() * 2 - 1) * (thick * f / 2) * tier.spread
        if (tryAdd(p.x + p.nx * d, p.y + p.ny * d, r, tier.k)) placed++
      }
    })
  }
  const cluster = (x, h, w, scale) => garland([[x, FLOOR_Y - 4], [x + 1, FLOOR_Y - h / 2], [x, FLOOR_Y - h]], w, { scale, density: 1.6 })

  const [L, C, R] = ARCHES
  const leftSide = [[L.x - 14, FLOOR_Y - 12], [L.x - 22, FLOOR_Y - 80], [L.x - 14, L.top + 70], [L.x + 10, L.top + 12], [L.x + 50, L.top - 8]]
  const top = [[C.x + 16, C.top + 8], [C.x + 60, C.top - 6], [C.x + C.w - 16, C.top + 8]]
  const rightSide = [[R.x + R.w / 2, R.top - 8], [R.x + R.w + 10, R.top + 30], [R.x + R.w + 20, FLOOR_Y - 90], [R.x + R.w + 14, FLOOR_Y - 12]]

  if (layout === 'full') {
    garland([...leftSide, ...top, ...rightSide], 46)
    cluster(C.x + 2, 34, 16, 0.55)
    cluster(R.x + 2, 34, 16, 0.55)
  } else if (layout === 'half') {
    garland([...leftSide, ...top], 46, { taper: [1, 0.55] })
    cluster(R.x + R.w + 10, 60, 30, 0.8)
    cluster(C.x + 2, 34, 16, 0.55)
  } else {
    cluster(L.x - 10, 80, 40, 0.95)
    cluster(C.x + 2, 40, 18, 0.6)
    cluster(R.x + 2, 40, 18, 0.6)
    cluster(R.x + R.w + 10, 80, 40, 0.95)
  }
  return out
}

// Chrome balloons are used as accents, so they appear about half as often.
export function colorFor(b, colors) {
  const weights = colors.map((c) => (CHROME.has(c) ? 0.45 : 1))
  let t = b.c * weights.reduce((a, w) => a + w, 0)
  for (let i = 0; i < colors.length; i++) {
    t -= weights[i]
    if (t <= 0) return colors[i]
  }
  return colors[colors.length - 1]
}

export function balloonStops(c) {
  return CHROME.has(c)
    ? [[0, mix(c, '#ffffff', 0.75)], [0.22, mix(c, '#ffffff', 0.3)], [0.5, c], [0.78, mix(c, '#000000', 0.45)], [0.93, mix(c, '#000000', 0.2)], [1, mix(c, '#ffffff', 0.15)]]
    : [[0, mix(c, '#ffffff', 0.5)], [0.55, c], [1, mix(c, '#000000', 0.16)]]
}

/* ---------------------------------------------------------- scene layers */

export function StandLayer() {
  const f = GOLD
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} className="pointer-events-none absolute inset-0 h-full w-full" style={{ zIndex: 0 }} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-m`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={f.dark} />
          <stop offset=".45" stopColor={f.light} />
          <stop offset="1" stopColor={f.base} />
        </linearGradient>
        <filter id={`${id}-b`} x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="2.2" /></filter>
      </defs>
      {ARCHES.map((a) => (
        <ellipse key={`s-${a.key}`} cx={a.x + a.w / 2} cy={FLOOR_Y + 1} rx={a.w * 0.55} ry={3.2} fill="rgba(70,45,35,.22)" filter={`url(#${id}-b)`} />
      ))}
      {ARCHES.map((a) => {
        const posts = [a.x + 3, a.x + a.w - 5]
        return (
          <g key={a.key}>
            {posts.map((px) => (
              <rect key={`p${px}`} x={px} y={ARCH_BOTTOM - 1} width={POST_W} height={FOOT_H} fill={`url(#${id}-m)`} />
            ))}
            <rect x={a.x + 1.5} y={FLOOR_Y - FOOT_T - BAR_H + 0.4} width={a.w - 3} height={BAR_H} rx={0.8} fill={`url(#${id}-m)`} />
            {posts.map((px) => (
              <g key={px}>
                <rect x={px + POST_W / 2 - FOOT_W / 2} y={FLOOR_Y - FOOT_T} width={FOOT_W} height={FOOT_T} rx={1} fill={`url(#${id}-m)`} />
                <rect x={px + POST_W / 2 - FOOT_W / 2 - 0.4} y={FLOOR_Y - 1} width={2.2} height={1} fill="#1f1b1c" opacity=".55" />
                <rect x={px + POST_W / 2 + FOOT_W / 2 - 1.8} y={FLOOR_Y - 1} width={2.2} height={1} fill="#1f1b1c" opacity=".55" />
              </g>
            ))}
          </g>
        )
      })}
    </svg>
  )
}

export function BalloonLayer({ balloons, colors, visible }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg
      viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
      className={`pointer-events-none absolute inset-0 h-full w-full transition-all duration-500 ${visible ? 'opacity-100' : 'translate-y-3 opacity-0'}`}
      style={{ zIndex: 5, filter: 'drop-shadow(0 1px 1.5px rgba(60,35,30,.28))' }}
      aria-hidden="true"
    >
      <defs>
        {colors.map((c, i) => (
          <radialGradient key={c + i} id={`${id}-${i}`} cx="40%" cy="36%" r="68%" fx="34%" fy="28%">
            {balloonStops(c).map(([o, s]) => <stop key={o} offset={o} stopColor={s} />)}
          </radialGradient>
        ))}
        <radialGradient id={`${id}-hl`}>
          <stop offset="0" stopColor="#fff" stopOpacity=".95" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {balloons.map((b, i) => {
        const c = colorFor(b, colors)
        const chrome = CHROME.has(c)
        const hx = -b.r * 0.36
        const hy = -b.r * 0.44
        return (
          <g key={i} transform={`translate(${b.x} ${b.y}) rotate(${b.rot})`}>
            <ellipse rx={b.r} ry={b.r * 1.06} fill={`url(#${id}-${colors.indexOf(c)})`} />
            <ellipse
              cx={hx}
              cy={hy}
              rx={b.r * (chrome ? 0.3 : 0.34)}
              ry={b.r * (chrome ? 0.15 : 0.2)}
              transform={`rotate(-35 ${hx} ${hy})`}
              fill={`url(#${id}-hl)`}
              opacity={chrome ? 1 : 0.6}
            />
          </g>
        )
      })}
    </svg>
  )
}
