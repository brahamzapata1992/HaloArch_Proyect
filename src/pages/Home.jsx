import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import HomeSet, { THEMES } from '../components/HomeSet'
import { Icon } from '../components/Icons'
import { useI18n } from '../i18n'

const WHATSAPP = '14703831727'
const wa = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`
const DESKTOP = '(min-width: 1024px)'
// Where each layer sits along the pinned hero's scroll range.
const LAYER_AT = [0.08, 0.5, 0.92]

function useMedia(query) {
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}

function LayerControl({ h, layer, onPick }) {
  return (
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-[.16em] text-taupe">{h.layersLabel}</p>
      <ol className="mt-3 grid grid-cols-3 gap-2">
        {h.layers.map((l, i) => {
          const on = layer === i
          const done = layer > i
          return (
            <li key={l.label}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => onPick(i)}
                className={`group flex w-full flex-col items-start gap-2 rounded-2xl border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blushDark focus-visible:ring-offset-2 ${
                  on ? 'border-ink bg-ink text-white' : 'border-ink/10 bg-white/70 text-ink hover:border-ink/30'
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                    on ? 'bg-white text-ink' : done ? 'bg-blushDark text-white' : 'bg-ink/[.07] text-ink/70'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="text-[13px] font-semibold leading-tight">{l.label}</span>
              </button>
            </li>
          )
        })}
      </ol>
      <p aria-live="polite" className="mt-3 min-h-[40px] text-[14px] leading-5 text-ink/70">{h.layers[layer].caption}</p>
    </div>
  )
}

function ThemeChips({ h, theme, onPick }) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={h.themesLabel}>
      <span className="mr-1 text-[12px] font-semibold uppercase tracking-[.16em] text-taupe">{h.themesLabel}</span>
      {THEMES.map((t) => {
        const on = t.key === theme
        return (
          <button
            key={t.key}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(t.key)}
            className={`rounded-full border px-3.5 py-2 text-[13px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blushDark focus-visible:ring-offset-2 ${
              on ? 'border-blushDark bg-blushDark text-white' : 'border-ink/10 bg-white text-ink/80 hover:border-blushDark/50 hover:text-ink'
            }`}
          >
            {h.categories[t.key].title}
          </button>
        )
      })}
    </div>
  )
}

export default function Home() {
  const { t } = useI18n()
  const h = t.home
  const desktop = useMedia(DESKTOP)
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  const heroRef = useRef(null)
  const [layer, setLayer] = useState(() => (typeof window !== 'undefined' && window.matchMedia(DESKTOP).matches ? 0 : 1))
  const [theme, setTheme] = useState('baby')
  const themeTitle = h.categories[theme].title

  // Desktop: the hero is pinned and its scroll range adds one layer at a time.
  useEffect(() => {
    if (!desktop) return undefined
    let raf = 0
    const update = () => {
      const el = heroRef.current
      if (!el) return
      const range = el.offsetHeight - window.innerHeight
      const p = range > 0 ? Math.min(1, Math.max(0, -el.getBoundingClientRect().top / range)) : 0
      setLayer(p < 0.3 ? 0 : p < 0.7 ? 1 : 2)
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [desktop])

  function pickLayer(i) {
    const el = heroRef.current
    if (!desktop || !el) {
      setLayer(i)
      return
    }
    const top = el.getBoundingClientRect().top + window.scrollY
    const range = el.offsetHeight - window.innerHeight
    window.scrollTo({ top: top + range * LAYER_AT[i], behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <div className="min-h-screen bg-cream text-ink">
      <Header />

      <main>
        {/* ---------------- The set comes together */}
        <section ref={heroRef} id="categories" className="relative scroll-mt-24 bg-[#fbf1ec] lg:h-[250vh]">
          <div className="mx-auto grid max-w-[1400px] gap-8 px-4 pb-12 pt-8 sm:px-6 lg:sticky lg:top-[91px] lg:h-[calc(100svh-91px)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-12 lg:px-10 lg:py-6">
            <div className="order-2 lg:order-1">
              <h1 className="font-display text-[52px] font-medium leading-[.9] tracking-[-.02em] sm:text-[68px] xl:text-[84px]">
                {h.heroTitle.map((line) => (
                  <span key={line} className="block">{line}</span>
                ))}
              </h1>
              <p className="mt-5 max-w-[30rem] text-[16px] leading-7 text-ink/70">{h.heroCopy}</p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/custom-design"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-blushDark px-7 py-4 text-[12px] font-semibold tracking-[.14em] text-white shadow-[0_10px_24px_rgba(185,120,111,.35)] transition hover:-translate-y-0.5 hover:bg-taupe focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
                >
                  <Icon name="eye" className="h-4 w-4" /> {h.ctaDesign}
                </Link>
                <a
                  href={wa(h.waHelp)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-sageDark px-7 py-4 text-[12px] font-semibold tracking-[.14em] text-white transition hover:-translate-y-0.5 hover:bg-[#5a7055] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
                >
                  <Icon name="whatsapp" className="h-4 w-4" /> {h.ctaWhatsapp}
                </a>
              </div>

              <div className="mt-8">
                <LayerControl h={h} layer={layer} onPick={pickLayer} />
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <figure className="mx-auto w-full lg:max-w-[calc((100svh-91px-200px)*1.336)]">
                <HomeSet theme={theme} layer={layer} labels={{ ft: t.custom.ft, notIncluded: h.notIncluded }} />
                <figcaption className="sr-only">{h.setLabel(themeTitle)}</figcaption>
              </figure>
              <div className="mx-auto mt-4 w-full lg:max-w-[calc((100svh-91px-200px)*1.336)]">
                <ThemeChips h={h} theme={theme} onPick={setTheme} />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                  <p className="text-[14px] text-ink/65">{h.categories[theme].copy}</p>
                  <a
                    href={wa(h.waStyle(themeTitle))}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[13px] font-semibold text-sageDark underline decoration-sageDark/40 underline-offset-4 transition hover:decoration-sageDark"
                  >
                    {h.askStyle} →
                  </a>
                </div>
              </div>
              {desktop && layer === 0 && (
                <p className="mt-2 hidden text-center text-[12px] uppercase tracking-[.16em] text-ink/45 lg:block" aria-hidden="true">
                  {h.scrollHint} ↓
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ---------------- How it works */}
        <section id="how-it-works" className="scroll-mt-24 border-t border-ink/5 bg-cream">
          <div className="mx-auto max-w-[1260px] px-5 pb-16 pt-20 sm:px-6 md:pb-20 md:pt-24">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <h2 className="font-display text-[44px] font-medium leading-none sm:text-[56px]">{h.howTitle}</h2>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/custom-design"
                  className="inline-flex items-center justify-center rounded-full bg-blushDark px-6 py-3.5 text-[12px] font-semibold tracking-[.12em] text-white transition hover:bg-taupe focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
                >
                  {h.startCustom}
                </Link>
                <a
                  href={wa(h.waNoDesign)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-sageDark/40 px-6 py-3.5 text-[12px] font-semibold tracking-[.12em] text-sageDark transition hover:bg-sageDark hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
                >
                  <Icon name="whatsapp" className="h-4 w-4" /> {h.contactDirect}
                </a>
              </div>
            </div>

            <ol className="mt-12 grid gap-y-8 border-t border-ink/10 pt-8 sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-4">
              {h.steps.map(([title, copy], i) => (
                <li key={title} className="flex gap-4 lg:block">
                  <span className="font-display text-[56px] font-medium leading-[.8] text-blushDark lg:text-[72px]">{i + 1}</span>
                  <div className="lg:mt-4">
                    <h3 className="text-[17px] font-semibold leading-snug">{title}</h3>
                    <p className="mt-1.5 max-w-[30ch] text-[15px] leading-6 text-ink/65">{copy}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------------- Close */}
        <section className="bg-[#f3e2da]">
          <div className="mx-auto grid max-w-[1260px] items-center gap-10 px-5 py-16 sm:px-6 md:grid-cols-[1.1fr_1fr] md:py-20">
            <div>
              <h2 className="font-display text-[40px] font-medium leading-[1.02] sm:text-[52px]">{h.bannerTitle}</h2>
              <p className="mt-4 max-w-[34rem] text-[16px] leading-7 text-ink/70">{h.bannerCopy}</p>
              <Link
                to="/custom-design"
                className="mt-7 inline-flex items-center justify-center rounded-full bg-ink px-7 py-4 text-[12px] font-semibold tracking-[.14em] text-white transition hover:-translate-y-0.5 hover:bg-[#3b3235] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blushDark focus-visible:ring-offset-2"
              >
                {h.bannerCta}
              </Link>
            </div>
            <figure>
              <div className="grid grid-cols-3 items-end gap-3">
                {[1, 2, 3].map((i) => (
                  // The source photos carry a thin white border; scaling them
                  // inside the arch frame pushes it outside the clip.
                  <div
                    key={i}
                    className={`relative w-full overflow-hidden rounded-t-[999px] bg-[#efdfd6] shadow-[0_14px_30px_rgba(91,56,46,.18)] ${i === 2 ? 'aspect-[5/8]' : 'aspect-[5/7]'}`}
                  >
                    <img
                      src={`/assets/moment-${i}.png`}
                      alt={h.momentAlt(i)}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full scale-[1.12] object-cover"
                    />
                  </div>
                ))}
              </div>
              <figcaption className="mt-4 text-[13px] font-semibold uppercase tracking-[.14em] text-taupe">{h.inspTitle}</figcaption>
            </figure>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
