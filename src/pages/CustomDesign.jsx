import { useEffect, useMemo, useRef, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Icon } from '../components/Icons'
import { useI18n } from '../i18n'
import {
  ARCH_META,
  FOOT_H,
  FLOOR_PAD,
  TOP_PAD,
  SIDE_PAD,
  OVERLAP,
  MAX_H,
  ARCH_BOTTOM,
  FLOOR_Y,
  STAGE_H,
  ARCHES,
  STAGE_W,
  pctX,
  pctY,
  GOLD,
  POST_W,
  BAR_H,
  FOOT_W,
  FOOT_T,
  BALLOON_PALETTE,
  CHROME,
  MAX_COLORS,
  LAYOUTS,
  clamp,
  imageLayout,
  archRadius,
  loadImage,
  mix,
  rng,
  smoothPath,
  pointAt,
  buildBalloons,
  colorFor,
  balloonStops,
  StandLayer,
  BalloonLayer,
} from '../components/ArchStage'

const WHATSAPP_NUMBER = '14703831727'
const MAX_FILE_MB = 10
const DEFAULT_CONTROLS = () => ({ scale: 1, x: 50, y: 50 })

function StageArch({ meta, image, control, active, onSelect, onMove, onFile }) {
  const { t } = useI18n()
  const label = t.custom.arches[meta.key].label
  const ref = useRef(null)
  const drag = useRef(null)
  const [dropping, setDropping] = useState(false)

  function onPointerDown(e) {
    onSelect()
    if (!image) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, start: { ...control } }
  }

  function onPointerMove(e) {
    if (!drag.current || !image) return
    const rect = ref.current.getBoundingClientRect()
    const l = imageLayout(image, meta.w, meta.h, drag.current.start)
    const overflowX = (l.W / meta.w - 1) * rect.width
    const overflowY = (l.H / meta.h - 1) * rect.height
    const next = {}
    if (overflowX > 0.5) next.x = clamp(drag.current.start.x - ((e.clientX - drag.current.x) / overflowX) * 100)
    if (overflowY > 0.5) next.y = clamp(drag.current.start.y - ((e.clientY - drag.current.y) / overflowY) * 100)
    onMove(next)
  }

  const endDrag = () => { drag.current = null }
  const l = image ? imageLayout(image, meta.w, meta.h, control) : null

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={`${label}${image ? '' : t.custom.noImageAria}`}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDragOver={(e) => { e.preventDefault(); setDropping(true) }}
      onDragLeave={() => setDropping(false)}
      onDrop={(e) => { e.preventDefault(); setDropping(false); onFile(e.dataTransfer.files?.[0]) }}
      className={`absolute overflow-hidden bg-white outline-none transition-shadow duration-200 ${image ? 'cursor-grab touch-none active:cursor-grabbing' : 'cursor-pointer'}`}
      style={{
        left: pctX(meta.x),
        top: pctY(meta.top),
        width: pctX(meta.w),
        height: pctY(meta.h),
        zIndex: active ? 3 : meta.z,
        borderRadius: archRadius(meta),
        boxShadow: active
          ? '0 0 0 2px #fff, 0 0 0 4px #cf9187, 0 18px 40px rgba(91,56,46,.25)'
          : '0 0 0 2px rgba(255,255,255,.95), 0 16px 34px rgba(91,56,46,.18)',
      }}
    >
      {l ? (
        <img
          src={image.src}
          alt=""
          draggable={false}
          className="pointer-events-none absolute max-w-none select-none"
          style={{
            width: `${(l.W / meta.w) * 100}%`,
            height: `${(l.H / meta.h) * 100}%`,
            left: `${(l.left / meta.w) * 100}%`,
            top: `${(l.top / meta.h) * 100}%`,
          }}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-[#f9e2dc] to-[#efc9c1] p-2 text-center">
          <Icon name="upload" className="h-[clamp(14px,2vw,24px)] w-[clamp(14px,2vw,24px)] text-[#8e6256]/60" />
          <span className="font-display text-[clamp(14px,2vw,28px)] leading-none text-[#8e6256]/75">{label}</span>
          <span className="hidden text-[10px] tracking-[.12em] text-[#8e6256]/55 sm:block">{t.custom.clickOrDrop}</span>
        </div>
      )}
      {/* fabric hem */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2.5%] bg-gradient-to-t from-black/15 to-transparent" />
      {dropping && <div className="absolute inset-0 bg-blush/30 ring-4 ring-inset ring-blush" />}
    </div>
  )
}

/* ----------------------------------------------------------- controls UI */

function UploadCard({ meta, image, active, onSelect, onFile, onRemove }) {
  const { t } = useI18n()
  const c = t.custom
  const label = c.arches[meta.key].label
  const inputRef = useRef(null)
  const [dropping, setDropping] = useState(false)

  return (
    <div
      onClick={onSelect}
      onDragOver={(e) => { e.preventDefault(); setDropping(true) }}
      onDragLeave={() => setDropping(false)}
      onDrop={(e) => { e.preventDefault(); setDropping(false); onFile(e.dataTransfer.files?.[0]) }}
      className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-2.5 transition ${
        dropping ? 'border-blush bg-blush/10' : active ? 'border-blush/70 bg-[#fff6f2] shadow-sm' : 'border-black/[.07] bg-white hover:border-blush/40'
      }`}
    >
      <div
        className="relative w-11 shrink-0 overflow-hidden bg-gradient-to-b from-[#f9e2dc] to-[#efc9c1]"
        style={{ aspectRatio: `${meta.w} / ${meta.h}`, borderRadius: archRadius(meta) }}
      >
        {image && <img src={image.src} alt="" className="absolute inset-0 h-full w-full object-cover" />}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold leading-tight">{label}</p>
        <p className="mt-0.5 text-[11px] text-ink/50">{meta.size} · {meta.ft} {c.ft}</p>
        <p className="mt-1 truncate text-[11px] text-ink/40">{image ? image.name : c.noImage}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-medium transition ${
            image ? 'border border-black/10 bg-white text-ink/70 hover:border-blush/50' : 'bg-blush text-white hover:bg-blushDark'
          }`}
        >
          <Icon name="upload" className="h-3.5 w-3.5" /> {image ? c.replace : c.upload}
        </button>
        {image && (
          <button
            type="button"
            aria-label={c.removeAria(label)}
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            className="rounded-full p-2 text-ink/40 transition hover:bg-black/5 hover:text-ink"
          >
            <Icon name="x" className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        id={`upload-${meta.key}`}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = '' }}
      />
    </div>
  )
}

function Slider({ label, value, display, min, max, step = 1, onChange, disabled }) {
  return (
    <label className={`block ${disabled ? 'opacity-40' : ''}`}>
      <span className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[.12em] text-ink/55">
        {label}
        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] tabular-nums tracking-normal text-ink/60 shadow-sm">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="halo-range mt-2.5 w-full"
        style={{ '--fill': `${((value - min) / (max - min)) * 100}%` }}
      />
    </label>
  )
}

function StepTitle({ n, title, hint }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blush font-display text-lg text-white">{n}</span>
      <div>
        <h2 className="font-display text-[26px] leading-none">{title}</h2>
        {hint && <p className="mt-1 text-[11px] text-ink/50">{hint}</p>}
      </div>
    </div>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2.5 text-[12px] font-medium"
    >
      <span className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-blush' : 'bg-black/15'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
      {label}
    </button>
  )
}

function Segmented({ options, labels, value, onChange, size = 'md' }) {
  return (
    <div className="inline-flex rounded-full bg-[#f3e7e1] p-1">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`rounded-full font-medium transition ${size === 'sm' ? 'px-3 py-1.5 text-[11px]' : 'px-3.5 py-1.5 text-[11px]'} ${
            value === o ? 'bg-white text-ink shadow-sm' : 'text-ink/55 hover:text-ink'
          }`}
        >
          {labels[o]}
        </button>
      ))}
    </div>
  )
}

function DecorPanel({ deco, setDeco }) {
  const { t } = useI18n()
  const d = t.custom.decor
  const colorName = (name) => t.custom.colorNames[name] || name
  const [warn, setWarn] = useState('')
  const palette = deco.custom ? [...BALLOON_PALETTE, { name: 'Custom', hex: deco.custom }] : BALLOON_PALETTE

  function toggleColor(hex) {
    setWarn('')
    setDeco((d) => {
      if (d.colors.includes(hex)) {
        if (d.colors.length === 1) return d
        return { ...d, colors: d.colors.filter((c) => c !== hex) }
      }
      if (d.colors.length >= MAX_COLORS) {
        setWarn(d.tooMany(MAX_COLORS))
        return d
      }
      return { ...d, colors: [...d.colors, hex] }
    })
  }

  function setCustom(hex) {
    setDeco((d) => {
      const without = d.colors.filter((c) => c !== d.custom)
      const colors = without.length >= MAX_COLORS ? [...without.slice(0, MAX_COLORS - 1), hex] : [...without, hex]
      return { ...d, custom: hex, colors }
    })
  }

  return (
    <div className="border-t border-black/5 bg-white/75 px-4 py-4 backdrop-blur sm:px-6">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Toggle checked={deco.balloons} onChange={(v) => setDeco((d) => ({ ...d, balloons: v }))} label={d.toggle} />
        {deco.balloons && (
          <Segmented options={LAYOUTS} labels={d.layouts} value={deco.layout} onChange={(v) => setDeco((d) => ({ ...d, layout: v }))} />
        )}
        {!deco.balloons && (
          <span className="text-[11px] text-ink/45">{d.offHint}</span>
        )}
      </div>

      {deco.balloons && (
        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-medium uppercase tracking-[.12em] text-ink/50">
              {d.colors} <span className="normal-case tracking-normal text-ink/40">{d.upTo(MAX_COLORS)}</span>
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {palette.map(({ name, hex }) => {
              const on = deco.colors.includes(hex)
              const stops = balloonStops(hex).map(([o, s]) => `${s} ${Math.round(o * 100)}%`).join(', ')
              return (
                <button
                  key={name + hex}
                  type="button"
                  title={colorName(name)}
                  aria-label={d.balloonAria(colorName(name))}
                  aria-pressed={on}
                  onClick={() => toggleColor(hex)}
                  className={`relative h-8 w-8 rounded-full border border-black/10 shadow-sm transition ${on ? 'ring-2 ring-ink/70 ring-offset-2' : 'hover:scale-110'}`}
                  style={{ background: `radial-gradient(circle at 34% 28%, ${stops})` }}
                >
                  {on && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[9px] font-semibold text-white">
                      {deco.colors.indexOf(hex) + 1}
                    </span>
                  )}
                </button>
              )
            })}
            <label
              title={d.custom}
              className="relative flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-ink/30 text-lg leading-none text-ink/50 transition hover:border-blush hover:text-blush"
            >
              +
              <input
                type="color"
                value={deco.custom || '#f2b8b5'}
                onChange={(e) => setCustom(e.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label={d.customAria}
              />
            </label>
          </div>
          {warn && <p className="mt-2 text-[11px] text-taupe">{warn}</p>}
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-[#fff4e5] px-3 py-2 text-[11px] leading-4 text-[#8a5a1f]">
            <span className="mt-px font-semibold">{d.notePrefix}</span>
            <span>{d.noteBefore} <strong className="font-semibold">{d.noteStrong}</strong> {d.noteAfter}</span>
          </p>
        </div>
      )}
    </div>
  )
}

/* ----------------------------------------------------------- canvas export */

const PX = 5 // px per cm in the exported PNG

function archPath(ctx, x, y, w, h) {
  const r = w / 2
  ctx.beginPath()
  ctx.moveTo(x, y + h)
  ctx.lineTo(x, y + r)
  ctx.arc(x + r, y + r, r, Math.PI, 0, false)
  ctx.lineTo(x + w, y + h)
  ctx.closePath()
}

function setSpacing(ctx, px) {
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${px}px`
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h)
}

async function renderPreview(canvas, images, controls, deco, balloons, t) {
  const c = t.custom
  if (!canvas) return
  try { await document.fonts?.ready } catch { /* fonts optional */ }

  const header = 170
  const footer = 150
  const width = STAGE_W * PX
  const height = header + STAGE_H * PX + footer
  const X = (cm) => cm * PX
  const Y = (cm) => header + cm * PX

  const loaded = await Promise.all(images.map((img) => (img ? loadImage(img.src).catch(() => null) : null)))

  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  // wall
  const wall = ctx.createLinearGradient(0, 0, 0, Y(FLOOR_Y))
  wall.addColorStop(0, '#fbf5f2')
  wall.addColorStop(1, '#eee0d8')
  ctx.fillStyle = wall
  ctx.fillRect(0, 0, width, Y(FLOOR_Y))
  // floor
  const floor = ctx.createLinearGradient(0, Y(FLOOR_Y), 0, height)
  floor.addColorStop(0, '#e2cdbf')
  floor.addColorStop(1, '#ecdcd1')
  ctx.fillStyle = floor
  ctx.fillRect(0, Y(FLOOR_Y), width, height - Y(FLOOR_Y))
  ctx.fillStyle = 'rgba(90,60,45,.16)'
  ctx.fillRect(0, Y(FLOOR_Y) - 2, width, 3)

  // heading
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#b9786f'
  ctx.font = '500 24px Montserrat, Arial, sans-serif'
  setSpacing(ctx, 7)
  ctx.fillText(c.canvas.heading, width / 2, 74)
  setSpacing(ctx, 0)
  ctx.fillStyle = 'rgba(36,31,33,.5)'
  ctx.font = '400 20px Montserrat, Arial, sans-serif'
  ctx.fillText(c.canvas.sub, width / 2, 112)

  // stands + floor shadows
  const f = GOLD
  ARCHES.forEach((a) => {
    ctx.save()
    ctx.filter = 'blur(10px)'
    ctx.fillStyle = 'rgba(70,45,35,.25)'
    ctx.beginPath()
    ctx.ellipse(X(a.x + a.w / 2), Y(FLOOR_Y + 1), X(a.w * 0.55), X(3.2), 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  })
  const metal = (x, w) => {
    const g = ctx.createLinearGradient(x, 0, x + w, 0)
    g.addColorStop(0, f.dark)
    g.addColorStop(0.45, f.light)
    g.addColorStop(1, f.base)
    return g
  }
  ARCHES.forEach((a) => {
    const posts = [a.x + 3, a.x + a.w - 5]
    posts.forEach((px) => {
      ctx.fillStyle = metal(X(px), X(POST_W))
      ctx.fillRect(X(px), Y(ARCH_BOTTOM - 1), X(POST_W), X(FOOT_H))
    })
    ctx.fillStyle = metal(X(a.x + 1.5), X(a.w - 3))
    roundRect(ctx, X(a.x + 1.5), Y(FLOOR_Y - FOOT_T - BAR_H + 0.4), X(a.w - 3), X(BAR_H), 4)
    ctx.fill()
    posts.forEach((px) => {
      const fx = px + POST_W / 2 - FOOT_W / 2
      ctx.fillStyle = metal(X(fx), X(FOOT_W))
      roundRect(ctx, X(fx), Y(FLOOR_Y - FOOT_T), X(FOOT_W), X(FOOT_T), 5)
      ctx.fill()
      ctx.fillStyle = 'rgba(31,27,28,.55)'
      ctx.fillRect(X(fx - 0.4), Y(FLOOR_Y - 1), X(2.2), X(1))
      ctx.fillRect(X(fx + FOOT_W - 1.8), Y(FLOOR_Y - 1), X(2.2), X(1))
    })
  })

  // arches: center first so the side arches overlap it
  ;[1, 0, 2].forEach((i) => {
    const a = ARCHES[i]
    const x = X(a.x)
    const y = Y(a.top)
    const w = X(a.w)
    const h = X(a.h)

    ctx.save()
    ctx.shadowColor = 'rgba(91,56,46,.22)'
    ctx.shadowBlur = 40
    ctx.shadowOffsetY = 16
    archPath(ctx, x, y, w, h)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.restore()

    ctx.save()
    archPath(ctx, x, y, w, h)
    ctx.clip()
    if (loaded[i]) {
      const l = imageLayout(loaded[i], w, h, controls[i])
      ctx.drawImage(loaded[i], x + l.left, y + l.top, l.W, l.H)
    } else {
      const g = ctx.createLinearGradient(x, y, x, y + h)
      g.addColorStop(0, '#f9e2dc')
      g.addColorStop(1, '#efc9c1')
      ctx.fillStyle = g
      ctx.fillRect(x, y, w, h)
      ctx.fillStyle = 'rgba(142,98,86,.7)'
      ctx.font = `500 ${Math.round(w * 0.13)}px "Cormorant Garamond", Georgia, serif`
      ctx.textBaseline = 'middle'
      ctx.fillText(c.arches[a.key].label, x + w / 2, y + h / 2)
      ctx.textBaseline = 'alphabetic'
    }
    const hem = ctx.createLinearGradient(0, y + h - 14, 0, y + h)
    hem.addColorStop(0, 'rgba(0,0,0,0)')
    hem.addColorStop(1, 'rgba(0,0,0,.16)')
    ctx.fillStyle = hem
    ctx.fillRect(x, y + h - 14, w, 14)
    ctx.restore()

    archPath(ctx, x, y, w, h)
    ctx.strokeStyle = 'rgba(255,255,255,.95)'
    ctx.lineWidth = 6
    ctx.stroke()
  })

  // balloons
  if (deco.balloons) {
    balloons.forEach((b) => {
      const c = colorFor(b, deco.colors)
      const chrome = CHROME.has(c)
      const r = X(b.r)
      ctx.save()
      ctx.translate(X(b.x), Y(b.y))
      ctx.rotate((b.rot * Math.PI) / 180)
      ctx.scale(1, 1.06)

      const g = ctx.createRadialGradient(-r * 0.26, -r * 0.34, r * 0.04, -r * 0.1, -r * 0.14, r * 1.12)
      balloonStops(c).forEach(([o, s]) => g.addColorStop(o, s))
      ctx.save()
      ctx.shadowColor = 'rgba(60,35,30,.22)'
      ctx.shadowBlur = 10
      ctx.shadowOffsetY = 4
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // soft specular highlight
      ctx.translate(-r * 0.36, -r * 0.44)
      ctx.rotate((-35 * Math.PI) / 180)
      const rx = r * (chrome ? 0.3 : 0.34)
      const ry = r * (chrome ? 0.15 : 0.2)
      ctx.scale(1, ry / rx)
      const hl = ctx.createRadialGradient(0, 0, 0, 0, 0, rx)
      hl.addColorStop(0, `rgba(255,255,255,${chrome ? 0.95 : 0.57})`)
      hl.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = hl
      ctx.beginPath()
      ctx.arc(0, 0, rx, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    })
  }

  // labels
  ARCHES.forEach((a) => {
    const cx = X(a.x + a.w / 2)
    ctx.fillStyle = '#3c3134'
    ctx.font = '600 22px Montserrat, Arial, sans-serif'
    setSpacing(ctx, 3)
    ctx.fillText(c.arches[a.key].label.toUpperCase(), cx, Y(STAGE_H) + 52)
    setSpacing(ctx, 0)
    ctx.fillStyle = 'rgba(60,49,52,.6)'
    ctx.font = '400 20px Montserrat, Arial, sans-serif'
    ctx.fillText(`${a.size} · ${a.ft} ${c.ft}`, cx, Y(STAGE_H) + 84)
  })

  if (deco.balloons) {
    const text = c.canvas.disclaimer
    ctx.font = '600 18px Montserrat, Arial, sans-serif'
    setSpacing(ctx, 2)
    const tw = ctx.measureText(text).width + 56
    ctx.fillStyle = '#fff4e5'
    roundRect(ctx, (width - tw) / 2, 130, tw, 34, 17)
    ctx.fill()
    ctx.fillStyle = '#8a5a1f'
    ctx.fillText(text, width / 2, 153)
    setSpacing(ctx, 0)
  }
}

/* --------------------------------------------------------------- modals */

function MissingImagesDialog({ open, missing, onUpload, onContinue, onClose }) {
  const { t } = useI18n()
  const m = t.custom.missing
  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  const uploaded = 3 - missing.length

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div role="alertdialog" aria-modal="true" aria-labelledby="missing-title" className="w-full max-w-md rounded-[24px] bg-[#fffdfb] p-5 shadow-2xl sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff4e5] text-[#8a5a1f]">
            <Icon name="upload" className="h-5 w-5" />
          </span>
          <div>
            <h3 id="missing-title" className="font-display text-[28px] leading-tight">
              {uploaded === 0 ? m.titleNone : m.titleSome(uploaded)}
            </h3>
            <p className="mt-2 text-[13px] leading-5 text-ink/60">
              {m.body}
            </p>
          </div>
        </div>

        <ul className="mt-4 flex flex-wrap gap-2 pl-[52px]">
          {missing.map((arch) => (
            <li key={arch.key} className="rounded-full bg-blush/10 px-3 py-1 text-[11px] font-medium text-taupe">
              {t.custom.arches[arch.key].label} · {arch.size}
            </li>
          ))}
        </ul>

        <p className="mt-4 text-[12px] leading-5 text-ink/50">
          {uploaded === 0 ? m.continueNone : m.continueSome}
        </p>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={onUpload}
            autoFocus
            className="inline-flex items-center justify-center gap-2 rounded-full bg-blush px-5 py-3 text-[11px] font-medium tracking-[.12em] text-white transition hover:bg-blushDark"
          >
            <Icon name="upload" className="h-4 w-4" /> {m.upload}
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-[11px] font-medium tracking-[.12em] text-ink/70 transition hover:border-blush/50"
          >
            {m.cont}
          </button>
        </div>
      </div>
    </div>
  )
}

function PreviewModal({ open, onClose, canvasRef, rendering, missing, balloons, onDownload, onWhatsapp }) {
  const { t } = useI18n()
  const pv = t.custom.preview
  useEffect(() => {
    if (!open) return undefined
    const old = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = old
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/70 p-2 backdrop-blur-sm sm:p-5"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-full w-full max-w-6xl flex-col overflow-hidden rounded-[24px] bg-[#fffdfb] shadow-2xl sm:rounded-[28px]">
        <div className="flex items-center justify-between gap-4 border-b border-black/5 px-4 py-3 sm:px-6 sm:py-4">
          <div>
            <p className="text-[10px] font-medium tracking-[.3em] text-blushDark">{pv.kicker}</p>
            <h3 className="font-display text-3xl leading-tight sm:text-4xl">{pv.title}</h3>
          </div>
          <button onClick={onClose} aria-label={pv.close} className="shrink-0 rounded-full border border-black/10 p-2 text-ink/60 transition hover:bg-black/5 hover:text-ink">
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[#f3e6df] p-2 sm:p-4">
          <canvas
            ref={canvasRef}
            className={`block h-auto max-h-[calc(100svh-210px)] w-auto max-w-full rounded-2xl shadow-[0_10px_40px_rgba(91,56,46,.15)] transition-opacity sm:max-h-[calc(100svh-230px)] ${rendering ? 'opacity-0' : 'opacity-100'}`}
          />
          {rendering && <p className="absolute text-xs tracking-[.2em] text-ink/50">{pv.rendering}</p>}
        </div>

        <div className="flex flex-col gap-2 border-t border-black/5 px-4 py-3 sm:flex-row sm:items-center sm:px-6 sm:py-4">
          <p className="flex-1 text-[11px] leading-4 text-ink/50">
            {missing > 0 ? pv.stillEmpty(missing) : pv.ready}
            {balloons && <span className="mt-1 block font-medium text-[#8a5a1f]">{pv.balloonsNote}</span>}
          </p>
          <div className="grid gap-2 sm:flex">
            <button onClick={onDownload} disabled={rendering} className="inline-flex items-center justify-center gap-2 rounded-full bg-blushSoft px-6 py-3 text-[11px] font-medium tracking-[.14em] text-taupe transition hover:bg-[#edc4bc] disabled:opacity-50">
              <Icon name="download" className="h-4 w-4" /> {pv.download}
            </button>
            <button onClick={onWhatsapp} className="inline-flex items-center justify-center gap-2 rounded-full bg-sage px-6 py-3 text-center text-[11px] font-medium tracking-[.12em] text-white transition hover:bg-sageDark">
              <Icon name="whatsapp" className="h-4 w-4" /> {pv.quote}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- page */

export default function CustomDesign() {
  const { t } = useI18n()
  const c = t.custom
  const [images, setImages] = useState([null, null, null])
  const [controls, setControls] = useState([DEFAULT_CONTROLS(), DEFAULT_CONTROLS(), DEFAULT_CONTROLS()])
  const [active, setActive] = useState(1)
  const [notice, setNotice] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [rendering, setRendering] = useState(false)
  const [showSizes, setShowSizes] = useState(false)
  const [deco, setDeco] = useState({
    balloons: false,
    layout: 'full',
    colors: ['#f5c9c4', '#f4e9cc', '#f7cdb4', '#b9776a'],
    custom: null,
  })
  const [confirmOpen, setConfirmOpen] = useState(false)
  const canvasRef = useRef(null)
  const balloons = useMemo(() => buildBalloons(deco.layout), [deco.layout])

  // Free the memory of an uploaded image once it is no longer shown.
  function releaseImage(img) {
    if (img?.src) setTimeout(() => URL.revokeObjectURL(img.src), 0)
  }

  async function setFile(index, file) {
    if (!file) return
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) {
      setNotice('errType')
      return
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setNotice('errSize')
      return
    }
    const src = URL.createObjectURL(file)
    try {
      const img = await loadImage(src)
      releaseImage(images[index])
      setImages((prev) => prev.map((v, i) => (i === index ? { src, width: img.naturalWidth, height: img.naturalHeight, name: file.name } : v)))
      setControls((prev) => prev.map((c, i) => (i === index ? DEFAULT_CONTROLS() : c)))
      setActive(index)
      setNotice('')
    } catch {
      URL.revokeObjectURL(src)
      setNotice('errOpen')
    }
  }

  function removeImage(index) {
    releaseImage(images[index])
    setImages((prev) => prev.map((v, i) => (i === index ? null : v)))
    setControls((prev) => prev.map((c, i) => (i === index ? DEFAULT_CONTROLS() : c)))
  }

  function updateControl(index, patch) {
    setControls((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)))
  }

  function reset() {
    images.forEach(releaseImage)
    setImages([null, null, null])
    setControls([DEFAULT_CONTROLS(), DEFAULT_CONTROLS(), DEFAULT_CONTROLS()])
    setActive(1)
    setNotice('')
  }

  function requestPreview() {
    if (images.every(Boolean)) setPreviewOpen(true)
    else setConfirmOpen(true)
  }

  function uploadMissing() {
    const first = images.findIndex((img) => !img)
    setConfirmOpen(false)
    if (first < 0) return
    setActive(first)
    const input = document.getElementById(`upload-${ARCH_META[first].key}`)
    input?.closest('div')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    input?.click()
  }

  function handleDownload() {
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'halo-arch-custom-preview.png'
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }, 'image/png')
  }

  function contactOnWhatsapp() {
    const text = encodeURIComponent(c.preview.waQuote)
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  useEffect(() => {
    if (!previewOpen) return undefined
    let cancelled = false
    setRendering(true)
    renderPreview(canvasRef.current, images, controls, deco, balloons, t).finally(() => !cancelled && setRendering(false))
    return () => { cancelled = true }
  }, [previewOpen, images, controls, deco, balloons, t])

  const ctl = controls[active]
  const activeMeta = ARCH_META[active]
  const hasActiveImage = Boolean(images[active])
  const filled = images.filter(Boolean).length

  return (
    <div className="min-h-screen bg-cream text-ink">
      <Header />

      <main className="bg-[#fbf1ec]">
        <section className="mx-auto max-w-[1400px] px-4 pb-12 pt-8 sm:px-6 lg:px-10 lg:pt-10">
          <div className="mb-6 flex flex-col gap-3 lg:mb-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-[10px] font-medium tracking-[.28em] text-blushDark">{c.kicker}</p>
              <h1 className="font-display text-[40px] leading-[.95] sm:text-[54px]">{c.title}</h1>
            </div>
            <p className="max-w-[440px] text-[13px] leading-6 text-ink/60 lg:text-right">
              {c.intro}
            </p>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[410px_minmax(0,1fr)]">
            {/* ---------------- Live preview */}
            <div className="order-1 lg:order-2 lg:sticky lg:top-[100px]">
              <div className="overflow-hidden rounded-[28px] bg-[#f1e4dd] shadow-soft">
                <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-5">
                  <div>
                    <p className="text-[10px] font-medium tracking-[.28em] text-blushDark">{c.liveKicker}</p>
                    <p className="mt-0.5 font-display text-2xl leading-tight sm:text-3xl">{c.liveTitle}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSizes((v) => !v)}
                      aria-pressed={showSizes}
                      className={`rounded-full px-3 py-1.5 text-[10px] font-medium transition ${showSizes ? 'bg-ink text-white' : 'bg-white/70 text-ink/60 hover:bg-white'}`}
                    >
                      {c.sizes}
                    </button>
                    <span className="rounded-full bg-white/70 px-3 py-1.5 text-[10px] font-medium text-ink/60">{c.imagesCount(filled)}</span>
                  </div>
                </div>

                <div className="px-3 pb-3 pt-3 sm:px-6 sm:pb-4">
                  <div
                    className="relative mx-auto w-full overflow-hidden rounded-[20px]"
                    style={{
                      maxWidth: `max(300px, calc((100svh - 400px) * ${(STAGE_W / STAGE_H).toFixed(4)}))`,
                      aspectRatio: `${STAGE_W} / ${STAGE_H}`,
                      background: `linear-gradient(#f9f1ed, #ecdcd3) top / 100% ${pctY(FLOOR_Y)} no-repeat, repeating-linear-gradient(90deg, rgba(120,85,65,.06) 0 1px, transparent 1px 9%), linear-gradient(#dcc5b6, #e8d6ca)`,
                    }}
                  >
                    <div className="absolute inset-x-0 h-px bg-[#7c5f52]/20" style={{ top: pctY(FLOOR_Y) }} />
                    <StandLayer />
                    {ARCHES.map((meta, i) => (
                      <StageArch
                        key={meta.key}
                        meta={meta}
                        image={images[i]}
                        control={controls[i]}
                        active={active === i}
                        onSelect={() => setActive(i)}
                        onMove={(patch) => updateControl(i, patch)}
                        onFile={(file) => setFile(i, file)}
                      />
                    ))}
                    <BalloonLayer balloons={balloons} colors={deco.colors} visible={deco.balloons} />

                    {showSizes && ARCHES.map((a) => (
                      <span
                        key={a.key}
                        className="pointer-events-none absolute z-[6] -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full bg-ink/80 px-2 py-0.5 text-[9px] font-medium text-white sm:text-[10px]"
                        style={{ left: pctX(a.x + a.w / 2), top: pctY(a.top - 1.5) }}
                      >
                        {a.ft} {c.ft} · {a.w}×{a.h} cm
                      </span>
                    ))}

                    {deco.balloons && (
                      <span className="pointer-events-none absolute right-2 top-2 z-[7] rounded-full bg-[#fff4e5]/95 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[.08em] text-[#8a5a1f] shadow-sm sm:text-[10px]">
                        {c.notIncludedBadge}
                      </span>
                    )}
                  </div>

                  <div className="relative mx-auto mt-2 h-8 w-full" style={{ maxWidth: `max(300px, calc((100svh - 400px) * ${(STAGE_W / STAGE_H).toFixed(4)}))` }}>
                    {ARCHES.map((a, i) => (
                      <button
                        key={a.key}
                        type="button"
                        onClick={() => setActive(i)}
                        className={`absolute -translate-x-1/2 whitespace-nowrap text-center text-[9px] font-medium uppercase leading-4 tracking-[.08em] transition sm:text-[10px] ${active === i ? 'text-blushDark' : 'text-ink/50 hover:text-ink'}`}
                        style={{ left: pctX(a.x + a.w / 2) }}
                      >
                        {c.arches[a.key].short}<br /><span className="normal-case tracking-normal opacity-80">{a.size}</span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-center text-[11px] text-ink/45">
                    {filled ? c.tipDrag : c.tipStart}
                  </p>
                </div>

                <DecorPanel deco={deco} setDeco={setDeco} />
              </div>
            </div>

            {/* ---------------- Controls */}
            <div className="order-2 space-y-4 lg:order-1">
              <div className="rounded-[24px] bg-white/85 p-4 shadow-soft sm:p-5">
                <StepTitle n="1" title={c.step1} hint={c.step1Hint(MAX_FILE_MB)} />
                <div className="mt-4 space-y-2">
                  {ARCH_META.map((meta, i) => (
                    <UploadCard
                      key={meta.key}
                      meta={meta}
                      image={images[i]}
                      active={active === i}
                      onSelect={() => setActive(i)}
                      onFile={(file) => setFile(i, file)}
                      onRemove={() => removeImage(i)}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] bg-white/85 p-4 shadow-soft sm:p-5">
                <StepTitle n="2" title={c.step2} hint={c.step2Hint} />
                <div className="mt-4 grid grid-cols-3 gap-1 rounded-full bg-[#f6ebe6] p-1">
                  {ARCH_META.map((meta, i) => (
                    <button
                      key={meta.key}
                      onClick={() => setActive(i)}
                      className={`rounded-full px-2 py-2 text-[11px] font-medium transition ${active === i ? 'bg-white text-ink shadow-sm' : 'text-ink/55 hover:text-ink'}`}
                    >
                      {c.arches[meta.key].short}
                    </button>
                  ))}
                </div>

                <div className="mt-4 space-y-4 rounded-2xl bg-[#fffaf7] p-4">
                  {!hasActiveImage && (
                    <p className="text-[11px] text-ink/50">{c.uploadToAdjust(c.arches[activeMeta.key].label)}</p>
                  )}
                  <Slider label={c.zoom} min={1} max={3} step={0.05} value={ctl.scale} display={`${Math.round(ctl.scale * 100)}%`} onChange={(v) => updateControl(active, { scale: v })} disabled={!hasActiveImage} />
                  <Slider label={c.horizontal} min={0} max={100} value={ctl.x} display={`${Math.round(ctl.x)}%`} onChange={(v) => updateControl(active, { x: v })} disabled={!hasActiveImage} />
                  <Slider label={c.vertical} min={0} max={100} value={ctl.y} display={`${Math.round(ctl.y)}%`} onChange={(v) => updateControl(active, { y: v })} disabled={!hasActiveImage} />
                  <button
                    type="button"
                    disabled={!hasActiveImage}
                    onClick={() => updateControl(active, DEFAULT_CONTROLS())}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-blushDark transition hover:text-taupe disabled:opacity-40"
                  >
                    <Icon name="refresh" className="h-3.5 w-3.5" /> {c.resetPosition}
                  </button>
                </div>
              </div>

              <div className="rounded-[24px] bg-white/85 p-4 shadow-soft sm:p-5">
                <StepTitle n="3" title={c.step3} hint={c.step3Hint} />
                <button
                  onClick={requestPreview}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blush px-6 py-3.5 text-[11px] font-medium tracking-[.14em] text-white shadow-[0_10px_24px_rgba(207,145,135,.35)] transition hover:bg-blushDark"
                >
                  <Icon name="eye" className="h-4 w-4" /> {c.generate}
                </button>
                <button
                  onClick={reset}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-2.5 text-[10px] font-medium tracking-[.12em] text-ink/50 transition hover:text-ink"
                >
                  <Icon name="refresh" className="h-3.5 w-3.5" /> {c.startOver}
                </button>
                {notice && <p role="alert" className="mt-2 rounded-xl bg-blush/10 px-3 py-2 text-[11px] text-taupe">{typeof c[notice] === 'function' ? c[notice](MAX_FILE_MB) : c[notice]}</p>}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-black/5 bg-cream">
          <div className="mx-auto grid max-w-[1260px] gap-6 px-5 py-10 sm:px-6 md:grid-cols-3">
            {[
              ['magic', ...c.features[0], 'text-blushDark'],
              ['eye', ...c.features[1], 'text-blushDark'],
              ['whatsapp', ...c.features[2], 'text-sage'],
            ].map(([icon, title, copy, color]) => (
              <div key={title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                  <Icon name={icon} className={`h-5 w-5 ${color}`} />
                </span>
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-[.1em]">{title}</h3>
                  <p className="mt-1 text-[12px] leading-5 text-ink/55">{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <MissingImagesDialog
        open={confirmOpen}
        missing={ARCH_META.filter((_, i) => !images[i])}
        onUpload={uploadMissing}
        onContinue={() => { setConfirmOpen(false); setPreviewOpen(true) }}
        onClose={() => setConfirmOpen(false)}
      />
      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        canvasRef={canvasRef}
        rendering={rendering}
        missing={3 - filled}
        balloons={deco.balloons}
        onDownload={handleDownload}
        onWhatsapp={contactOnWhatsapp}
      />
    </div>
  )
}
