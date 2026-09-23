import { useEffect, useRef, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Icon } from '../components/Icons'

const WHATSAPP_NUMBER = '14703831727'
const DEFAULT_CONTROLS = () => ({ scale: 1, x: 50, y: 50 })

// Proportions supplied for the actual frames:
// 120 x 220 cm (47 x 86 in), 100 x 200 cm (39 x 78 in), 80 x 180 cm (31 x 70 in).
const ARCH_META = [
  { key: 'left', label: 'Left Arch', w: 120, h: 220, size: '47 × 86 in', displayWidth: '30%' },
  { key: 'center', label: 'Center Arch', w: 100, h: 200, size: '39 × 78 in', displayWidth: '25%' },
  { key: 'right', label: 'Right Arch', w: 80, h: 180, size: '31 × 70 in', displayWidth: '20%' },
]

function UploadBox({ label, image, onChange }) {
  const inputRef = useRef(null)
  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="flex min-h-[112px] flex-col items-center justify-center rounded-2xl border border-dashed border-blush/40 bg-white/80 px-3 py-4 text-center transition hover:border-blush hover:bg-blush/5"
    >
      {image ? (
        <img src={image} alt={`${label} uploaded preview`} className="mb-2 h-14 w-14 rounded-xl object-cover shadow-sm" />
      ) : (
        <Icon name="upload" className="mb-2 h-6 w-6 text-blushDark" />
      )}
      <span className="text-[10px] font-medium leading-4">{image ? 'Change image' : 'Upload image'}<br/><span className="text-ink/45">{label}</span></span>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onChange} />
    </button>
  )
}

function ArchPreview({ image, controls, meta }) {
  const bg = image ? `url(${image})` : 'linear-gradient(155deg,#f7d9d3,#efc9c1)'
  return (
    <div className="flex shrink-0 flex-col items-center" style={{ width: meta.displayWidth }}>
      <div
        className="arch-mask relative w-full overflow-hidden border border-white/90 bg-white shadow-[0_18px_35px_rgba(91,56,46,.16)]"
        style={{ aspectRatio: `${meta.w} / ${meta.h}` }}
      >
        <div
          className="absolute inset-0 bg-cover"
          style={{
            backgroundImage: bg,
            backgroundPosition: `${controls.x}% ${controls.y}%`,
            transform: `scale(${controls.scale})`,
            transformOrigin: 'center',
          }}
        />
        {!image && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/10 p-2 text-center font-display text-[clamp(16px,3vw,30px)] leading-none text-[#8e6256]/70">
            {meta.label}
          </div>
        )}
      </div>
      <p className="mt-2 text-center text-[8px] font-medium uppercase tracking-[.08em] text-ink/55 sm:text-[9px]">{meta.size}</p>
    </div>
  )
}

function PreviewModal({ open, onClose, canvasRef, onDownload, onWhatsapp }) {
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
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/60 p-3 sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mx-auto my-3 w-full max-w-5xl rounded-[26px] bg-[#fffdfb] p-4 shadow-2xl sm:my-8 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[9px] font-medium tracking-[.3em] text-blushDark">YOUR CUSTOM PREVIEW</p>
            <h3 className="mt-1 font-display text-4xl leading-none sm:text-5xl">Your 3 Arch Covers</h3>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-ink/55 sm:text-sm">
              This preview shows only your three fabric designs — no balloons or event decor — so you can review the artwork clearly.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close preview" className="shrink-0 rounded-full border border-black/10 p-2 text-ink/60 transition hover:bg-black/5 hover:text-ink">
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 overflow-hidden rounded-[22px] border border-blush/10 bg-[#f8eee9] p-2 sm:p-4">
          <canvas ref={canvasRef} className="h-auto w-full rounded-[18px] bg-[#f8eee9]" />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button onClick={onDownload} className="inline-flex items-center justify-center gap-2 rounded-full bg-blushSoft px-6 py-3.5 text-[10px] font-medium tracking-[.14em] text-taupe transition hover:bg-[#edc4bc]">
            <Icon name="download" className="h-4 w-4" /> DOWNLOAD IMAGE
          </button>
          <button onClick={onWhatsapp} className="inline-flex items-center justify-center gap-2 rounded-full bg-sage px-6 py-3.5 text-center text-[10px] font-medium tracking-[.12em] text-white transition hover:bg-sageDark">
            <Icon name="whatsapp" className="h-4 w-4" /> CONTACT ME TO QUOTE YOUR DESIGN
          </button>
        </div>
        <p className="mt-3 text-center text-[10px] leading-4 text-ink/45">
          Download the preview first, then attach that image in WhatsApp. WhatsApp: +1 470 383 1727
        </p>
      </div>
    </div>
  )
}

function createArchPath(ctx, x, y, w, h) {
  const radius = w / 2
  const verticalHeight = h - radius
  ctx.beginPath()
  ctx.moveTo(x, y + h)
  ctx.lineTo(x, y + verticalHeight)
  ctx.arc(x + radius, y + verticalHeight, radius, Math.PI, 0, false)
  ctx.lineTo(x + w, y + h)
  ctx.closePath()
}

function drawPlaceholder(ctx, x, y, w, h, label) {
  const gradient = ctx.createLinearGradient(x, y, x + w, y + h)
  gradient.addColorStop(0, '#f8ddd7')
  gradient.addColorStop(1, '#efc9c1')
  createArchPath(ctx, x, y, w, h)
  ctx.fillStyle = gradient
  ctx.fill()
  ctx.fillStyle = 'rgba(121,84,72,.66)'
  ctx.font = `${Math.max(22, w * 0.12)}px Georgia`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const words = label.split(' ')
  ctx.fillText(words[0], x + w / 2, y + h / 2 - 10)
  if (words[1]) ctx.fillText(words.slice(1).join(' '), x + w / 2, y + h / 2 + 22)
}

function drawImageInArch(ctx, img, x, y, w, h, controls) {
  createArchPath(ctx, x, y, w, h)
  ctx.save()
  ctx.clip()

  const baseScale = Math.max(w / img.width, h / img.height)
  const scale = baseScale * controls.scale
  const drawW = img.width * scale
  const drawH = img.height * scale
  const extraX = Math.max(0, drawW - w)
  const extraY = Math.max(0, drawH - h)
  const dx = x + (w - drawW) / 2 - ((controls.x - 50) / 50) * extraX * 0.5
  const dy = y + (h - drawH) / 2 - ((controls.y - 50) / 50) * extraY * 0.5

  ctx.drawImage(img, dx, dy, drawW, drawH)
  ctx.restore()
  createArchPath(ctx, x, y, w, h)
  ctx.strokeStyle = 'rgba(255,255,255,.95)'
  ctx.lineWidth = 4
  ctx.stroke()
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function renderPreview(canvas, images, controls) {
  if (!canvas) return
  const width = 1400
  const height = 940
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, width, height)

  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, '#fffaf7')
  gradient.addColorStop(1, '#f7eae4')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#efe0d8'
  ctx.fillRect(0, height - 120, width, 120)
  ctx.strokeStyle = 'rgba(124,95,82,.10)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, height - 120)
  ctx.lineTo(width, height - 120)
  ctx.stroke()

  // 3 px per cm preserves exactly 120:100:80 widths and 220:200:180 heights.
  const sizes = [
    { w: 360, h: 660, label: 'Left Arch', size: '47 × 86 in' },
    { w: 300, h: 600, label: 'Center Arch', size: '39 × 78 in' },
    { w: 240, h: 540, label: 'Right Arch', size: '31 × 70 in' },
  ]
  const gap = 28
  const bottom = height - 120
  const totalW = sizes.reduce((sum, s) => sum + s.w, 0) + gap * 2
  let cursorX = (width - totalW) / 2
  const loaded = await Promise.all(images.map((src) => src ? loadImage(src).catch(() => null) : Promise.resolve(null)))

  sizes.forEach((size, index) => {
    const x = cursorX
    const y = bottom - size.h
    if (loaded[index]) drawImageInArch(ctx, loaded[index], x, y, size.w, size.h, controls[index])
    else drawPlaceholder(ctx, x, y, size.w, size.h, size.label)

    ctx.fillStyle = '#6e5a52'
    ctx.font = '600 16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(size.size, x + size.w / 2, bottom + 42)
    cursorX += size.w + gap
  })

  ctx.fillStyle = '#664f47'
  ctx.font = '600 18px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('HALO ARCH CO. • CUSTOM 3-ARCH PREVIEW', width / 2, 54)
}

export default function CustomDesign() {
  const [images, setImages] = useState([null, null, null])
  const [controls, setControls] = useState([DEFAULT_CONTROLS(), DEFAULT_CONTROLS(), DEFAULT_CONTROLS()])
  const [active, setActive] = useState(0)
  const [notice, setNotice] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const canvasRef = useRef(null)

  function handleUpload(index, event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setNotice('Please choose an image under 10MB.')
      return
    }
    const url = URL.createObjectURL(file)
    setImages((prev) => prev.map((value, i) => i === index ? url : value))
    setActive(index)
    setNotice('')
  }

  function updateControl(key, value) {
    setControls((prev) => prev.map((control, i) => i === active ? { ...control, [key]: Number(value) } : control))
  }

  function reset() {
    setImages([null, null, null])
    setControls([DEFAULT_CONTROLS(), DEFAULT_CONTROLS(), DEFAULT_CONTROLS()])
    setNotice('Design reset.')
  }

  function openPreview() {
    setPreviewOpen(true)
    setNotice('')
  }

  function handleDownload() {
    if (!canvasRef.current) return
    const url = canvasRef.current.toDataURL('image/png')
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'halo-arch-custom-preview.png'
    anchor.click()
  }

  function contactOnWhatsapp() {
    const text = encodeURIComponent("Hi! I created a custom 3-arch preview on Halo Arch Co. and I'd like a quote. I downloaded the preview and will attach it here.")
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  useEffect(() => {
    if (!previewOpen) return
    renderPreview(canvasRef.current, images, controls)
  }, [previewOpen, images, controls])

  return (
    <div className="min-h-screen bg-cream text-ink">
      <Header />

      <main>
        <section className="mx-auto grid max-w-[1400px] overflow-hidden bg-[#fff3ed] lg:grid-cols-[42%_58%]">
          <div className="px-5 py-10 sm:px-8 lg:px-12 lg:py-12">
            <p className="mb-3 text-[9px] font-medium tracking-[.28em] text-blushDark">CUSTOMIZE YOUR ARCH BACKDROPS</p>
            <h1 className="font-display text-[46px] leading-[.94] sm:text-[58px]">Visualize Your 3 Custom Arch Covers</h1>
            <p className="mt-4 max-w-[480px] text-xs leading-6 text-ink/60 sm:text-sm">
              Upload one image for each frame, adjust how it sits inside the arch, then generate a clean preview you can download and send to us.
            </p>

            <div className="mt-7 rounded-[26px] bg-white/80 p-4 shadow-soft sm:p-6">
              <div className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush text-sm text-white">1</span>
                <div><h2 className="font-display text-[27px] leading-none">Upload Your Photos</h2><p className="mt-1 text-[10px] text-ink/50">One image for each arch cover.</p></div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {ARCH_META.map((meta, i) => (
                  <UploadBox key={meta.key} label={`${meta.label} • ${meta.size}`} image={images[i]} onChange={(e) => handleUpload(i, e)} />
                ))}
              </div>
              <p className="mt-2 text-[9px] text-ink/40">JPG, PNG or WEBP • max 10MB per image</p>

              <div className="mt-7 flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush text-sm text-white">2</span>
                <div><h2 className="font-display text-[27px] leading-none">Adjust & Position</h2><p className="mt-1 text-[10px] text-ink/50">Choose an arch, then zoom or move the image.</p></div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {ARCH_META.map((meta, i) => (
                  <button
                    key={meta.key}
                    onClick={() => setActive(i)}
                    className={`rounded-full border px-2 py-2 text-[9px] font-medium transition sm:text-[10px] ${active === i ? 'border-blush bg-blush text-white' : 'border-black/10 bg-white hover:border-blush/50'}`}
                  >
                    {meta.label.replace(' Arch', '')}
                  </button>
                ))}
              </div>

              <div className="mt-4 space-y-4 rounded-2xl bg-[#fffaf7] p-4">
                <label className="block text-[9px] font-medium uppercase tracking-[.12em] text-ink/50">Zoom
                  <input type="range" min="1" max="2.3" step="0.05" value={controls[active].scale} onChange={(e) => updateControl('scale', e.target.value)} className="mt-2 w-full accent-[#cf9187]" />
                </label>
                <label className="block text-[9px] font-medium uppercase tracking-[.12em] text-ink/50">Horizontal Position
                  <input type="range" min="0" max="100" value={controls[active].x} onChange={(e) => updateControl('x', e.target.value)} className="mt-2 w-full accent-[#cf9187]" />
                </label>
                <label className="block text-[9px] font-medium uppercase tracking-[.12em] text-ink/50">Vertical Position
                  <input type="range" min="0" max="100" value={controls[active].y} onChange={(e) => updateControl('y', e.target.value)} className="mt-2 w-full accent-[#cf9187]" />
                </label>
              </div>

              <div className="mt-7 flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush text-sm text-white">3</span>
                <div><h2 className="font-display text-[27px] leading-none">Preview Your Design</h2><p className="mt-1 text-[10px] text-ink/50">Open your clean 3-arch preview with no event decorations.</p></div>
              </div>

              <button onClick={openPreview} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blush px-6 py-3.5 text-[10px] font-medium tracking-[.14em] text-white transition hover:bg-blushDark">
                <Icon name="eye" className="h-4 w-4" /> GENERATE PREVIEW →
              </button>
              <button onClick={reset} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3 text-[9px] font-medium tracking-[.12em] text-ink/60 transition hover:border-blush/40">
                <Icon name="refresh" className="h-4 w-4" /> RESET
              </button>
              {notice && <p className="mt-3 rounded-xl bg-blush/10 px-3 py-2 text-[10px] text-taupe">{notice}</p>}
            </div>
          </div>

          <div className="relative min-h-[520px] overflow-hidden bg-[#eddcd3] p-4 sm:p-6 lg:min-h-[760px] lg:p-9">
            <div className="absolute inset-0 fine-grid opacity-70" />
            <div className="relative z-10 flex h-full flex-col rounded-[28px] bg-white/40 p-4 backdrop-blur-[2px] sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[9px] font-medium tracking-[.28em] text-blushDark">LIVE PREVIEW</p>
                  <h2 className="mt-1 font-display text-4xl sm:text-5xl">Your 3 Arch Setup</h2>
                </div>
                <p className="max-w-[290px] text-[10px] leading-4 text-ink/50 sm:text-right">
                  Real proportional scale: 47×86 in, 39×78 in and 31×70 in.
                </p>
              </div>

              <div className="mt-6 flex min-h-[390px] flex-1 items-end justify-center gap-[4%] overflow-hidden rounded-[24px] bg-[#ead7ce] px-3 pb-6 pt-10 sm:min-h-[500px] sm:px-6 lg:min-h-[590px]">
                {ARCH_META.map((meta, i) => (
                  <ArchPreview key={meta.key} image={images[i]} controls={controls[i]} meta={meta} />
                ))}
              </div>

              <div className="mt-4 rounded-2xl bg-white/65 px-4 py-3 text-[10px] leading-4 text-ink/50">
                This live editor intentionally shows only the three arches. Balloons and decorations appear only in the inspiration examples on the home page.
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1260px] gap-5 px-5 py-10 sm:px-6 md:grid-cols-3">
          <div className="flex gap-4 md:border-r md:border-black/10 md:pr-5"><Icon name="magic" className="h-7 w-7 shrink-0 text-blushDark"/><div><h3 className="text-[10px] font-semibold uppercase tracking-[.1em]">Upload Your Ideas</h3><p className="mt-1 text-[10px] leading-5 text-ink/50">Characters, patterns, names, logos or your own artwork.</p></div></div>
          <div className="flex gap-4 md:border-r md:border-black/10 md:pr-5"><Icon name="eye" className="h-7 w-7 shrink-0 text-blushDark"/><div><h3 className="text-[10px] font-semibold uppercase tracking-[.1em]">Preview Before Contacting Us</h3><p className="mt-1 text-[10px] leading-5 text-ink/50">See the three fabric covers at the correct relative scale.</p></div></div>
          <div className="flex gap-4"><Icon name="whatsapp" className="h-7 w-7 shrink-0 text-sage"/><div><h3 className="text-[10px] font-semibold uppercase tracking-[.1em]">Download & Send</h3><p className="mt-1 text-[10px] leading-5 text-ink/50">Download your preview and send it to us on WhatsApp for your quote.</p></div></div>
        </section>
      </main>

      <Footer />
      <PreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} canvasRef={canvasRef} onDownload={handleDownload} onWhatsapp={contactOnWhatsapp} />
    </div>
  )
}
