import { useEffect, useId, useMemo, useState } from 'react'
import {
  ARCHES,
  ARCH_BOTTOM,
  FLOOR_Y,
  GOLD,
  STAGE_H,
  STAGE_W,
  BalloonLayer,
  StandLayer,
  archRadius,
  buildBalloons,
  pctX,
  pctY,
} from './ArchStage'

// Category scenes are 900 × 610 renders. Each box is where the left, centre and
// right arch sit inside that render (x0, y0, x1, y1 in pixels), so the real
// artwork can be dressed onto our true-scale arches standing on gold frames.
const SCENE_W = 900
const SCENE_H = 610
export const THEMES = [
  {
    key: 'baby',
    scene: '/assets/baby_shower_arch_preview_scene.png',
    boxes: [[186, 195, 387, 537], [383, 73, 600, 532], [598, 210, 797, 540]],
    balloons: ['#f5c9c4', '#f4e9cc', '#a9bb9c', '#ffffff'],
  },
  {
    key: 'kids',
    scene: '/assets/kids_superhero_birthday_preview_modal_scene.png',
    boxes: [[212, 200, 405, 565], [388, 58, 640, 560], [625, 213, 818, 565]],
    balloons: ['#2f4a7a', '#c9a046', '#a9cbe8', '#f4e9cc'],
  },
  {
    key: 'events',
    scene: '/assets/elegant_sweet_16_event_preview_modal_scene.png',
    boxes: [[147, 178, 348, 572], [336, 44, 604, 570], [604, 207, 803, 572]],
    balloons: ['#e8a0a6', '#f5c9c4', '#b9776a', '#ffffff'],
  },
  {
    key: 'sports',
    scene: '/assets/sports_theme_arch_preview_scene.png',
    boxes: [[176, 210, 381, 570], [358, 105, 590, 565], [568, 200, 767, 568]],
    balloons: ['#3f6b4e', '#ffffff', '#2b2a2e', '#a9bb9c'],
  },
  {
    key: 'occasion',
    scene: '/assets/any_occasion_arch_preview_scene.png',
    boxes: [[203, 203, 391, 548], [364, 88, 594, 545], [590, 208, 785, 548]],
    balloons: ['#f5c9c4', '#f4e9cc', '#a9bb9c', '#ffffff'],
  },
]

// Cover the arch with its box from the scene: fit the wider dimension, centre
// horizontally, and keep the apex of the painted arch at the top.
function cropStyle(box, meta) {
  const [x0, y0, x1, y1] = box
  const bw = x1 - x0
  const bh = y1 - y0
  const k = Math.max(meta.w / bw, meta.h / bh)
  const left = -x0 * k + (meta.w - bw * k) / 2
  const top = -y0 * k
  return {
    width: `${((SCENE_W * k) / meta.w) * 100}%`,
    height: `${((SCENE_H * k) / meta.h) * 100}%`,
    left: `${(left / meta.w) * 100}%`,
    top: `${(top / meta.h) * 100}%`,
  }
}

function FrameLayer() {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} className="pointer-events-none absolute inset-0 h-full w-full" style={{ zIndex: 1 }} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={GOLD.light} />
          <stop offset=".5" stopColor={GOLD.base} />
          <stop offset="1" stopColor={GOLD.dark} />
        </linearGradient>
      </defs>
      {ARCHES.map((a) => {
        const r = a.w / 2
        return (
          <path
            key={a.key}
            d={`M ${a.x + 1.2} ${ARCH_BOTTOM} L ${a.x + 1.2} ${a.top + r} A ${r - 1.2} ${r - 1.2} 0 0 1 ${a.x + a.w - 1.2} ${a.top + r} L ${a.x + a.w - 1.2} ${ARCH_BOTTOM}`}
            fill="none"
            stroke={`url(#${id}-g)`}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        )
      })}
    </svg>
  )
}

// Order the covers go on: centre first, then left, then right.
const COVER_DELAY = [140, 0, 280]

export default function HomeSet({ theme, layer, labels }) {
  const [visited, setVisited] = useState([theme])
  useEffect(() => {
    setVisited((v) => (v.includes(theme) ? v : [...v, theme]))
  }, [theme])
  const balloons = useMemo(() => buildBalloons('full'), [])
  const active = THEMES.find((t) => t.key === theme) || THEMES[0]

  return (
    <div
      className="relative w-full overflow-hidden rounded-[28px] shadow-[0_24px_60px_rgba(91,56,46,.16)]"
      style={{
        aspectRatio: `${STAGE_W} / ${STAGE_H}`,
        background: `linear-gradient(#faf2ee, #efdfd6) top / 100% ${pctY(FLOOR_Y)} no-repeat, repeating-linear-gradient(90deg, rgba(120,85,65,.07) 0 1px, transparent 1px 7%), linear-gradient(#dcc5b6, #ead9cd)`,
      }}
    >
      <div className="absolute inset-x-0 h-px bg-[#7c5f52]/20" style={{ top: pctY(FLOOR_Y) }} />
      <StandLayer />
      <FrameLayer />

      {ARCHES.map((meta, i) => {
        const on = layer >= 1 || i === 1
        return (
          <div
            key={meta.key}
            className="cover absolute"
            style={{
              left: pctX(meta.x),
              top: pctY(meta.top),
              width: pctX(meta.w),
              height: pctY(meta.h),
              zIndex: meta.z + 1,
              borderRadius: archRadius(meta),
              boxShadow: on ? '0 16px 34px rgba(91,56,46,.2)' : '0 0 0 rgba(0,0,0,0)',
              transitionDelay: on ? `${COVER_DELAY[i]}ms` : '0ms',
            }}
          >
            <div
              className="cover-cloth absolute inset-0 overflow-hidden bg-[#f6e3dc]"
              style={{
                borderRadius: archRadius(meta),
                clipPath: on ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)',
                transitionDelay: on ? `${COVER_DELAY[i]}ms` : '0ms',
              }}
            >
              {visited.map((key) => {
                const t = THEMES.find((x) => x.key === key)
                return (
                  <img
                    key={key}
                    src={t.scene}
                    alt=""
                    draggable={false}
                    className="theme-art pointer-events-none absolute max-w-none select-none"
                    style={{ ...cropStyle(t.boxes[i], meta), opacity: key === active.key ? 1 : 0 }}
                  />
                )
              })}
              <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_2px_rgba(255,255,255,.75)]" style={{ borderRadius: archRadius(meta) }} />
            </div>
          </div>
        )
      })}

      <BalloonLayer balloons={balloons} colors={active.balloons} visible={layer >= 2} />

      {ARCHES.map((a) => (
        <span
          key={`size-${a.key}`}
          aria-hidden={layer !== 0}
          className={`pointer-events-none absolute z-[6] -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full bg-ink/80 px-2 py-0.5 text-[10px] font-medium text-white transition-opacity duration-300 sm:text-[11px] ${layer === 0 ? 'opacity-100' : 'opacity-0'}`}
          style={{ left: pctX(a.x + a.w / 2), top: pctY(a.top - 2) }}
        >
          {a.ft} {labels.ft}
        </span>
      ))}

      <span
        className={`pointer-events-none absolute right-3 top-3 z-[7] rounded-full bg-[#fff4e5] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[.08em] text-[#7a4c14] shadow-sm transition-opacity duration-300 ${layer >= 2 ? 'opacity-100' : 'opacity-0'}`}
      >
        {labels.notIncluded}
      </span>
    </div>
  )
}
