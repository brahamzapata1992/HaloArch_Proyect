import { useEffect, useRef, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Icon } from '../components/Icons'

const WHATSAPP_NUMBER = '14703831727'
const MAX_FILE_MB = 10
const DEFAULT_CONTROLS = () => ({ scale: 1, x: 50, y: 50 })

// Real frame sizes in cm: 120 x 220, 100 x 200, 80 x 180.
// Everything (live preview + exported PNG) is drawn from these numbers so the
// three arches always keep their true relative proportions.
const ARCH_META = [
  { key: 'left', label: 'Left Arch', short: 'Left', w: 120, h: 220, size: '47 × 86 in' },
  { key: 'center', label: 'Center Arch', short: 'Center', w: 100, h: 200, size: '39 × 78 in' },
  { key: 'right', label: 'Right Arch', short: 'Right', w: 80, h: 180, size: '31 × 70 in' },
]
const GAP_CM = 14
const TOTAL_W = ARCH_META.reduce((sum, a) => sum + a.w, 0) + GAP_CM * 2
const MAX_H = Math.max(...ARCH_META.map((a) => a.h))

const clamp = (v, min = 0, max = 100) => Math.min(max, Math.max(min, v))

// Shared image placement model (used by the live preview AND the canvas export):
// the image first covers the arch, then is zoomed by `scale`; x/y (0–100) choose
// which part of the overflow is visible.
function imageLayout(img, boxW, boxH, ctl) {
  const cover = Math.max(boxW / img.width, boxH / img.height)
  const W = img.width * cover * ctl.scale
  const H = img.height * cover * ctl.scale
  return { W, H, left: -(W - boxW) * (ctl.x / 100), top: -(H - boxH) * (ctl.y / 100) }
}

// CSS radius that gives a perfect half-circle top for an element of w x h.
function archRadius(meta) {
  const v = ((meta.w / 2) / meta.h) * 100
  return `50% 50% 0 0 / ${v}% ${v}% 0 0`
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/* ---------------------------------------------------------------- UI bits */

function ArchImage({ image, control, meta }) {
  if (!image) return null
  const l = imageLayout(image, meta.w, meta.h, control)
  return (
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
  )
}

function StageArch({ meta, image, control, active, onSelect, onMove, onFile }) {
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

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={`${meta.label}${image ? '' : ' – no image yet'}`}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDragOver={(e) => { e.preventDefault(); setDropping(true) }}
      onDragLeave={() => setDropping(false)}
      onDrop={(e) => { e.preventDefault(); setDropping(false); onFile(e.dataTransfer.files?.[0]) }}
      className={`group relative overflow-hidden bg-white outline-none transition-shadow duration-200 ${image ? 'cursor-grab touch-none active:cursor-grabbing' : 'cursor-pointer'}`}
      style={{
        width: `${(meta.w / TOTAL_W) * 100}%`,
        aspectRatio: `${meta.w} / ${meta.h}`,
        borderRadius: archRadius(meta),
        boxShadow: active
          ? '0 0 0 3px #fff, 0 0 0 5px #cf9187, 0 26px 50px rgba(91,56,46,.22)'
          : '0 0 0 3px rgba(255,255,255,.95), 0 22px 44px rgba(91,56,46,.16)',
      }}
    >
      {image ? (
        <ArchImage image={image} control={control} meta={meta} />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-[#f9e2dc] to-[#efc9c1] p-2 text-center">
          <Icon name="upload" className="h-[clamp(16px,2.2vw,26px)] w-[clamp(16px,2.2vw,26px)] text-[#8e6256]/60" />
          <span className="font-display text-[clamp(15px,2.1vw,30px)] leading-none text-[#8e6256]/75">{meta.label}</span>
          <span className="hidden text-[10px] tracking-[.12em] text-[#8e6256]/55 sm:block">CLICK OR DROP IMAGE</span>
        </div>
      )}
      {dropping && <div className="absolute inset-0 bg-blush/30 ring-4 ring-inset ring-blush" />}
    </div>
  )
}

function UploadCard({ meta, image, active, onSelect, onFile, onRemove }) {
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
        <p className="text-[13px] font-semibold leading-tight">{meta.label}</p>
        <p className="mt-0.5 text-[11px] text-ink/50">{meta.size}</p>
        <p className="mt-1 truncate text-[11px] text-ink/40">{image ? image.name : 'No image yet'}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-medium transition ${
            image ? 'border border-black/10 bg-white text-ink/70 hover:border-blush/50' : 'bg-blush text-white hover:bg-blushDark'
          }`}
        >
          <Icon name="upload" className="h-3.5 w-3.5" /> {image ? 'Replace' : 'Upload'}
        </button>
        {image && (
          <button
            type="button"
            aria-label={`Remove ${meta.label} image`}
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            className="rounded-full p-2 text-ink/40 transition hover:bg-black/5 hover:text-ink"
          >
            <Icon name="x" className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
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

/* ----------------------------------------------------------- canvas export */

const PX_PER_CM = 5

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

async function renderPreview(canvas, images, controls) {
  if (!canvas) return
  try { await document.fonts?.ready } catch { /* fonts optional */ }

  const padX = 120
  const top = 170
  const bottom = 150
  const gap = GAP_CM * PX_PER_CM
  const archesW = ARCH_META.reduce((s, a) => s + a.w * PX_PER_CM, 0) + gap * 2
  const width = archesW + padX * 2
  const height = top + MAX_H * PX_PER_CM + bottom
  const baseline = top + MAX_H * PX_PER_CM

  const loaded = await Promise.all(images.map((img) => (img ? loadImage(img.src).catch(() => null) : null)))

  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  const bg = ctx.createLinearGradient(0, 0, 0, height)
  bg.addColorStop(0, '#fffaf7')
  bg.addColorStop(1, '#f6e6df')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, height)

  // floor
  ctx.fillStyle = '#efdfd7'
  ctx.fillRect(0, baseline, width, height - baseline)
  ctx.fillStyle = 'rgba(124,95,82,.14)'
  ctx.fillRect(0, baseline, width, 2)

  // heading
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#b9786f'
  ctx.font = '500 22px Montserrat, Arial, sans-serif'
  setSpacing(ctx, 7)
  ctx.fillText('HALO ARCH CO.  •  CUSTOM 3-ARCH PREVIEW', width / 2, 78)
  setSpacing(ctx, 0)
  ctx.fillStyle = 'rgba(36,31,33,.45)'
  ctx.font = '400 18px Montserrat, Arial, sans-serif'
  ctx.fillText('Fabric covers shown at true relative scale', width / 2, 116)

  let cursorX = padX
  ARCH_META.forEach((meta, i) => {
    const w = meta.w * PX_PER_CM
    const h = meta.h * PX_PER_CM
    const x = cursorX
    const y = baseline - h

    // soft contact shadow
    ctx.save()
    ctx.fillStyle = 'rgba(91,56,46,.18)'
    ctx.filter = 'blur(14px)'
    ctx.beginPath()
    ctx.ellipse(x + w / 2, baseline + 6, w * 0.52, 16, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    // body shadow + base
    ctx.save()
    ctx.shadowColor = 'rgba(91,56,46,.20)'
    ctx.shadowBlur = 40
    ctx.shadowOffsetY = 18
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
      ctx.fillText(meta.label, x + w / 2, y + h / 2)
      ctx.textBaseline = 'alphabetic'
    }
    ctx.restore()

    archPath(ctx, x, y, w, h)
    ctx.strokeStyle = 'rgba(255,255,255,.95)'
    ctx.lineWidth = 6
    ctx.stroke()

    ctx.fillStyle = '#3c3134'
    ctx.font = '600 22px Montserrat, Arial, sans-serif'
    setSpacing(ctx, 3)
    ctx.fillText(meta.label.toUpperCase(), x + w / 2, baseline + 62)
    setSpacing(ctx, 0)
    ctx.fillStyle = 'rgba(60,49,52,.55)'
    ctx.font = '400 20px Montserrat, Arial, sans-serif'
    ctx.fillText(meta.size, x + w / 2, baseline + 94)

    cursorX += w + gap
  })
}

/* --------------------------------------------------------------- modal */

function PreviewModal({ open, onClose, canvasRef, rendering, missing, onDownload, onWhatsapp }) {
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
            <p className="text-[10px] font-medium tracking-[.3em] text-blushDark">YOUR CUSTOM PREVIEW</p>
            <h3 className="font-display text-3xl leading-tight sm:text-4xl">Your 3 Arch Covers</h3>
          </div>
          <button onClick={onClose} aria-label="Close preview" className="shrink-0 rounded-full border border-black/10 p-2 text-ink/60 transition hover:bg-black/5 hover:text-ink">
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[#f3e6df] p-2 sm:p-4">
          <canvas
            ref={canvasRef}
            className={`block h-auto max-h-[calc(100svh-210px)] w-auto max-w-full rounded-2xl shadow-[0_10px_40px_rgba(91,56,46,.15)] transition-opacity sm:max-h-[calc(100svh-230px)] ${rendering ? 'opacity-0' : 'opacity-100'}`}
          />
          {rendering && <p className="absolute text-xs tracking-[.2em] text-ink/50">RENDERING…</p>}
        </div>

        <div className="flex flex-col gap-2 border-t border-black/5 px-4 py-3 sm:flex-row sm:items-center sm:px-6 sm:py-4">
          <p className="flex-1 text-[11px] leading-4 text-ink/50">
            {missing > 0
              ? `${missing} arch${missing > 1 ? 'es are' : ' is'} still empty — you can close this and add ${missing > 1 ? 'them' : 'it'}.`
              : 'Download the image, then attach it in WhatsApp: +1 470 383 1727'}
          </p>
          <div className="grid gap-2 sm:flex">
            <button onClick={onDownload} disabled={rendering} className="inline-flex items-center justify-center gap-2 rounded-full bg-blushSoft px-6 py-3 text-[11px] font-medium tracking-[.14em] text-taupe transition hover:bg-[#edc4bc] disabled:opacity-50">
              <Icon name="download" className="h-4 w-4" /> DOWNLOAD IMAGE
            </button>
            <button onClick={onWhatsapp} className="inline-flex items-center justify-center gap-2 rounded-full bg-sage px-6 py-3 text-center text-[11px] font-medium tracking-[.12em] text-white transition hover:bg-sageDark">
              <Icon name="whatsapp" className="h-4 w-4" /> GET A QUOTE ON WHATSAPP
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- page */

export default function CustomDesign() {
  const [images, setImages] = useState([null, null, null])
  const [controls, setControls] = useState([DEFAULT_CONTROLS(), DEFAULT_CONTROLS(), DEFAULT_CONTROLS()])
  const [active, setActive] = useState(0)
  const [notice, setNotice] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [rendering, setRendering] = useState(false)
  const canvasRef = useRef(null)

  // Free the memory of an uploaded image once it is no longer shown.
  function releaseImage(img) {
    if (img?.src) setTimeout(() => URL.revokeObjectURL(img.src), 0)
  }

  async function setFile(index, file) {
    if (!file) return
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) {
      setNotice('Please use a JPG, PNG or WEBP image.')
      return
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setNotice(`Please choose an image under ${MAX_FILE_MB}MB.`)
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
      setNotice('That image could not be opened. Please try another file.')
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
    setActive(0)
    setNotice('')
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
    const text = encodeURIComponent("Hi! I created a custom 3-arch preview on Halo Arch Co. and I'd like a quote. I downloaded the preview and will attach it here.")
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  useEffect(() => {
    if (!previewOpen) return undefined
    let cancelled = false
    setRendering(true)
    renderPreview(canvasRef.current, images, controls).finally(() => !cancelled && setRendering(false))
    return () => { cancelled = true }
  }, [previewOpen, images, controls])

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
              <p className="mb-2 text-[10px] font-medium tracking-[.28em] text-blushDark">CUSTOMIZE YOUR ARCH BACKDROPS</p>
              <h1 className="font-display text-[40px] leading-[.95] sm:text-[54px]">Visualize Your 3 Custom Arch Covers</h1>
            </div>
            <p className="max-w-[440px] text-[13px] leading-6 text-ink/60 lg:text-right">
              Upload one image per frame, drag it into place inside each arch, then generate a clean preview to download and send us.
            </p>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[400px_minmax(0,1fr)] xl:grid-cols-[430px_minmax(0,1fr)]">
            {/* ---------------- Live preview */}
            <div className="order-1 lg:order-2 lg:sticky lg:top-[104px]">
              <div className="relative overflow-hidden rounded-[28px] bg-[#ecdad1] shadow-soft">
                <div className="fine-grid absolute inset-0 opacity-70" />
                <div className="relative flex items-center justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-5">
                  <div>
                    <p className="text-[10px] font-medium tracking-[.28em] text-blushDark">LIVE PREVIEW</p>
                    <p className="mt-0.5 font-display text-2xl leading-tight sm:text-3xl">Your 3 Arch Setup</p>
                  </div>
                  <span className="rounded-full bg-white/70 px-3 py-1.5 text-[10px] font-medium text-ink/60">
                    {filled}/3 images
                  </span>
                </div>

                <div className="relative px-4 pb-4 pt-6 sm:px-8 sm:pb-6 sm:pt-8">
                  <div
                    className="mx-auto w-full"
                    style={{ maxWidth: `max(300px, calc((100svh - 390px) * ${(TOTAL_W / MAX_H).toFixed(4)}))` }}
                  >
                    <div className="flex items-end justify-between" style={{ aspectRatio: `${TOTAL_W} / ${MAX_H}` }}>
                      {ARCH_META.map((meta, i) => (
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
                    </div>
                    <div className="mt-1 h-px w-full bg-[#7c5f52]/15" />
                    <div className="mt-2 flex justify-between">
                      {ARCH_META.map((meta, i) => (
                        <button
                          key={meta.key}
                          type="button"
                          onClick={() => setActive(i)}
                          className={`text-center text-[9px] font-medium uppercase tracking-[.08em] transition sm:text-[10px] ${active === i ? 'text-blushDark' : 'text-ink/50'}`}
                          style={{ width: `${(meta.w / TOTAL_W) * 100}%` }}
                        >
                          {meta.short} · {meta.size}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="mt-4 text-center text-[11px] text-ink/45">
                    {filled ? 'Tip: drag an image inside its arch to reposition it.' : 'Click an arch or drop an image on it to get started.'}
                  </p>
                </div>
              </div>
            </div>

            {/* ---------------- Controls */}
            <div className="order-2 space-y-4 lg:order-1">
              <div className="rounded-[24px] bg-white/85 p-4 shadow-soft sm:p-5">
                <StepTitle n="1" title="Upload Your Photos" hint={`JPG, PNG or WEBP · max ${MAX_FILE_MB}MB each`} />
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
                <StepTitle n="2" title="Adjust & Position" hint="Pick an arch, then zoom or drag the image." />
                <div className="mt-4 grid grid-cols-3 gap-1 rounded-full bg-[#f6ebe6] p-1">
                  {ARCH_META.map((meta, i) => (
                    <button
                      key={meta.key}
                      onClick={() => setActive(i)}
                      className={`rounded-full px-2 py-2 text-[11px] font-medium transition ${active === i ? 'bg-white text-ink shadow-sm' : 'text-ink/55 hover:text-ink'}`}
                    >
                      {meta.short}
                    </button>
                  ))}
                </div>

                <div className="mt-4 space-y-4 rounded-2xl bg-[#fffaf7] p-4">
                  {!hasActiveImage && (
                    <p className="text-[11px] text-ink/50">Upload an image for the {activeMeta.label.toLowerCase()} to adjust it.</p>
                  )}
                  <Slider label="Zoom" min={1} max={3} step={0.05} value={ctl.scale} display={`${Math.round(ctl.scale * 100)}%`} onChange={(v) => updateControl(active, { scale: v })} disabled={!hasActiveImage} />
                  <Slider label="Horizontal" min={0} max={100} value={ctl.x} display={`${Math.round(ctl.x)}%`} onChange={(v) => updateControl(active, { x: v })} disabled={!hasActiveImage} />
                  <Slider label="Vertical" min={0} max={100} value={ctl.y} display={`${Math.round(ctl.y)}%`} onChange={(v) => updateControl(active, { y: v })} disabled={!hasActiveImage} />
                  <button
                    type="button"
                    disabled={!hasActiveImage}
                    onClick={() => updateControl(active, DEFAULT_CONTROLS())}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-blushDark transition hover:text-taupe disabled:opacity-40"
                  >
                    <Icon name="refresh" className="h-3.5 w-3.5" /> Reset position
                  </button>
                </div>
              </div>

              <div className="rounded-[24px] bg-white/85 p-4 shadow-soft sm:p-5">
                <StepTitle n="3" title="Preview & Send" hint="A clean image of your three covers — no decorations." />
                <button
                  onClick={() => setPreviewOpen(true)}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blush px-6 py-3.5 text-[11px] font-medium tracking-[.14em] text-white shadow-[0_10px_24px_rgba(207,145,135,.35)] transition hover:bg-blushDark"
                >
                  <Icon name="eye" className="h-4 w-4" /> GENERATE PREVIEW
                </button>
                <button
                  onClick={reset}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-2.5 text-[10px] font-medium tracking-[.12em] text-ink/50 transition hover:text-ink"
                >
                  <Icon name="refresh" className="h-3.5 w-3.5" /> START OVER
                </button>
                {notice && <p className="mt-2 rounded-xl bg-blush/10 px-3 py-2 text-[11px] text-taupe">{notice}</p>}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-black/5 bg-cream">
          <div className="mx-auto grid max-w-[1260px] gap-6 px-5 py-10 sm:px-6 md:grid-cols-3">
            {[
              ['magic', 'Upload Your Ideas', 'Characters, patterns, names, logos or your own artwork.', 'text-blushDark'],
              ['eye', 'Preview Before Contacting Us', 'See the three fabric covers at the correct relative scale.', 'text-blushDark'],
              ['whatsapp', 'Download & Send', 'Download your preview and send it to us on WhatsApp for your quote.', 'text-sage'],
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
      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        canvasRef={canvasRef}
        rendering={rendering}
        missing={3 - filled}
        onDownload={handleDownload}
        onWhatsapp={contactOnWhatsapp}
      />
    </div>
  )
}
