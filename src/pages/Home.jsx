import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Icon } from '../components/Icons'

const WHATSAPP = '14703831727'

const categories = [
  {
    key: 'baby',
    title: 'Baby Showers',
    copy: 'Sweet moments, custom designs.',
    thumb: '/assets/category-1.png',
    modalTitle: 'Baby Shower Inspiration',
    modalImage: '/assets/baby_shower_arch_preview_scene.png',
  },
  {
    key: 'kids',
    title: "Kids' Birthdays",
    copy: 'Original hero-inspired themes and more.',
    thumb: '/assets/category-2.png',
    modalTitle: "Kids' Birthday Inspiration",
    modalImage: '/assets/kids_superhero_birthday_preview_modal_scene.png',
  },
  {
    key: 'events',
    title: 'Special Events',
    copy: 'Your idea, turned into a full setup.',
    thumb: '/assets/category-3.png',
    modalTitle: 'Special Event Inspiration',
    modalImage: '/assets/elegant_sweet_16_event_preview_modal_scene.png',
  },
  {
    key: 'sports',
    title: 'Sports Themes',
    copy: 'Personalized for every fan.',
    thumb: '/assets/category-4.png',
    modalTitle: 'Sports Theme Inspiration',
    modalImage: '/assets/sports_theme_arch_preview_scene.png',
  },
  {
    key: 'occasion',
    title: 'Any Occasion',
    copy: 'Tell us your vision.',
    thumb: '/assets/category-5.png',
    modalTitle: 'Any Occasion Inspiration',
    modalImage: '/assets/any_occasion_arch_preview_scene.png',
  },
]

const steps = [
  ['1', 'Upload Your Photos', 'Add one image for each arch or use images that inspire your idea.'],
  ['2', 'Preview Your Design', 'Adjust each image and visualize the three arch covers together.'],
  ['3', 'Download & Send It To Us', 'Download your preview, then send it to us on WhatsApp so we can quote it.'],
  ['4', "Don't Have a Design Yet?", "Just talk to us. Tell us your theme and we'll help you create something beautiful."],
]

function CategoryModal({ item, onClose }) {
  useEffect(() => {
    if (!item) return undefined
    const old = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = old
      window.removeEventListener('keydown', onKey)
    }
  }, [item, onClose])

  if (!item) return null

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/60 p-3 sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mx-auto my-3 w-full max-w-5xl rounded-[26px] bg-[#fffdfb] p-4 shadow-2xl sm:my-8 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[9px] font-medium tracking-[.3em] text-blush">COMPLETE 3-ARCH SETUP</p>
            <h3 className="mt-1 font-display text-4xl leading-none sm:text-5xl">{item.modalTitle}</h3>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-ink/55 sm:text-sm">
              Inspiration only — this view includes balloons and event decor so you can imagine the complete setup.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close preview" className="shrink-0 rounded-full border border-black/10 p-2 text-ink/60 transition hover:bg-black/5 hover:text-ink">
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 overflow-hidden rounded-[22px] bg-warm shadow-inner">
          <img src={item.modalImage} alt={item.modalTitle} className="aspect-[900/610] h-auto w-full object-cover" />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/custom-design"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-blush px-6 py-3.5 text-[10px] font-medium tracking-[.14em] text-white transition hover:bg-blushDark"
          >
            <Icon name="eye" className="h-4 w-4" /> VISUALIZE YOUR OWN DESIGN
          </Link>
          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hi! I like the ${item.title} inspiration and I'd like a quote for a custom 3-arch setup.`)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-sage px-6 py-3.5 text-center text-[10px] font-medium tracking-[.14em] text-white transition hover:bg-sageDark"
          >
            <Icon name="whatsapp" className="h-4 w-4" /> ASK ABOUT THIS STYLE
          </a>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [activeModal, setActiveModal] = useState(null)

  return (
    <div className="min-h-screen bg-cream text-ink">
      <Header />

      <main>
        <section className="mx-auto grid max-w-[1400px] overflow-hidden bg-[#fff3ed] lg:min-h-[560px] lg:grid-cols-[42%_58%]">
          <div className="relative z-10 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
            <p className="mb-4 text-[10px] font-medium tracking-[.32em] text-blushDark">CUSTOM ARCH BACKDROPS</p>
            <h1 className="max-w-[620px] font-display text-[50px] leading-[.92] tracking-[-.035em] sm:text-[64px] lg:text-[76px]">
              Make Every<br />Moment Beautiful
            </h1>
            <p className="mt-6 max-w-[470px] text-sm leading-7 text-ink/65 sm:text-[15px]">
              Personalized fabric covers for three-piece arch setups. Upload your ideas, visualize the result, then contact us for the final design and quote.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to="/custom-design"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-blush px-7 py-3.5 text-[10px] font-medium tracking-[.14em] text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-blushDark"
              >
                <Icon name="eye" className="h-4 w-4" /> VISUALIZE YOUR DESIGN →
              </Link>
              <a
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi! I'd like help creating a custom design for my arch covers.")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-sage px-7 py-3.5 text-[10px] font-medium tracking-[.14em] text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-sageDark"
              >
                <Icon name="whatsapp" className="h-4 w-4" /> CONTACT DIRECTLY →
              </a>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-blush/20 pt-6 text-[8px] font-medium uppercase tracking-[.08em] sm:text-[9px]">
              <div className="flex items-center gap-2"><Icon name="heart" className="h-6 w-6 text-blushDark"/><span>Custom<br/>designs</span></div>
              <div className="flex items-center gap-2"><Icon name="truck" className="h-6 w-6 text-blushDark"/><span>Flexible<br/>shipping</span></div>
              <div className="flex items-center gap-2"><Icon name="diamond" className="h-6 w-6 text-blushDark"/><span>Premium<br/>fabric</span></div>
            </div>
          </div>

          <div className="relative min-h-[390px] overflow-hidden lg:min-h-full">
            <img src="/assets/hero-scene-clean.png" alt="Three custom arch covers" className="absolute inset-0 h-full w-full object-cover object-center" />
            <div className="absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-[#fff3ed] to-transparent lg:block" />
          </div>
        </section>

        <section id="categories" className="mx-auto max-w-[1260px] scroll-mt-28 px-5 py-14 text-center sm:px-6 md:py-16">
          <p className="text-[9px] font-medium tracking-[.38em] text-blushDark">ENDLESS POSSIBILITIES</p>
          <h2 className="mt-2 font-display text-4xl sm:text-5xl">Design Categories</h2>
          <p className="mx-auto mt-3 max-w-2xl text-xs leading-5 text-ink/55 sm:text-sm">
            Tap a theme to see a complete 3-arch inspiration setup already styled with balloons and decor.
          </p>

          <div className="mt-9 grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-5 md:grid-cols-5">
            {categories.map((item) => (
              <article key={item.key} className="group min-w-0">
                <button type="button" onClick={() => setActiveModal(item)} className="block w-full text-center">
                  <div className="mx-auto aspect-[.72] overflow-hidden rounded-t-[999px] border border-blush/10 bg-warm shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:shadow-soft">
                    <img src={item.thumb} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                  <h3 className="mt-3 text-[9px] font-semibold uppercase tracking-[.08em] sm:text-[10px]">{item.title}</h3>
                  <p className="mx-auto mt-1 hidden min-h-[32px] max-w-[170px] text-[9px] leading-4 text-ink/50 sm:block">{item.copy}</p>
                  <span className="mt-3 inline-flex rounded-full bg-blush px-3 py-2 text-[8px] font-medium tracking-[.12em] text-white transition group-hover:bg-blushDark sm:px-4 sm:text-[9px]">
                    PREVIEW SETUP →
                  </span>
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-28 bg-[#fff5f0]">
          <div className="mx-auto grid max-w-[1260px] gap-10 px-5 py-14 sm:px-6 md:py-16 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-[9px] font-medium tracking-[.34em] text-blushDark">SIMPLE FROM IDEA TO QUOTE</p>
              <h2 className="mt-2 font-display text-5xl sm:text-6xl">How It Works</h2>
              <div className="mt-7 space-y-5">
                {steps.map(([n, title, copy]) => (
                  <div key={n} className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blush text-sm text-white shadow-sm">{n}</span>
                    <div>
                      <h3 className="font-display text-[28px] leading-none sm:text-[31px]">{title}</h3>
                      <p className="mt-1 max-w-[480px] text-[11px] leading-5 text-ink/55 sm:text-xs">{copy}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/custom-design"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-blush px-6 py-3.5 text-[10px] font-medium tracking-[.12em] text-white transition hover:bg-blushDark"
                >
                  <Icon name="eye" className="h-4 w-4" /> START YOUR CUSTOM DESIGN →
                </Link>
                <a
                  href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi! I don't have a design yet. Can you help me create my arch covers?")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-sage px-6 py-3.5 text-[10px] font-medium tracking-[.12em] text-white transition hover:bg-sageDark"
                >
                  <Icon name="whatsapp" className="h-4 w-4" /> CONTACT DIRECTLY
                </a>
              </div>
            </div>

            <div id="gallery">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[9px] font-medium tracking-[.32em] text-blushDark">INSPIRATION</p>
                  <h2 className="mt-1 font-display text-4xl sm:text-5xl">Real Moments, Real Designs <span className="text-blush">♡</span></h2>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                {[1,2,3].map((i) => (
                  <img key={i} src={`/assets/moment-${i}.png`} alt={`Event inspiration ${i}`} className="aspect-[.9] h-full w-full rounded-[16px] object-cover sm:rounded-[22px]" />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden border-y border-blush/10">
          <img src="/assets/blush-texture.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-95" />
          <div className="relative mx-auto flex max-w-[1260px] flex-col gap-5 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-3xl sm:text-4xl">Your Vision. Our Fabric. Beautiful Results.</p>
              <p className="mt-1 text-xs text-ink/55">Preview it first. We’ll help turn it into the final design.</p>
            </div>
            <Link to="/custom-design" className="inline-flex shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/35 px-7 py-3 text-[10px] font-medium tracking-[.14em] text-ink backdrop-blur-sm transition hover:bg-white/60">
              VISUALIZE YOUR DESIGN →
            </Link>
          </div>
        </section>
      </main>

      <Footer />
      <CategoryModal item={activeModal} onClose={() => setActiveModal(null)} />
    </div>
  )
}
