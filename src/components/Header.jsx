import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from './Icons'

const WHATSAPP = '14703831727'
const links = [
  ['Home', '/'],
  ['Design Categories', '/#categories'],
  ['How It Works', '/#how-it-works'],
  ['Custom Design', '/custom-design'],
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-cream/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
          <img src="/assets/logo-custom.png" alt="Halo Arch Co." className="h-[58px] w-auto object-contain sm:h-[70px]" />
          <div className="hidden border-l border-blush/35 pl-3 md:block">
            <p className="max-w-[190px] text-[9px] font-medium tracking-[.27em] text-taupe lg:text-[10px]">
              DECOR FOR BEAUTIFUL MOMENTS
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-[12px] font-medium lg:flex">
          {links.map(([label, href]) => (
            href.startsWith('/#') ? (
              <a key={label} href={href} className="transition hover:text-blush">{label}</a>
            ) : (
              <Link key={label} to={href} className="transition hover:text-blush">{label}</Link>
            )
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi! I'm interested in custom arch covers.")}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Contact Halo Arch Co. on WhatsApp"
            className="hidden items-center gap-2 rounded-full bg-sage px-4 py-2.5 text-[10px] font-medium tracking-[.12em] text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-sageDark sm:inline-flex"
          >
            <Icon name="whatsapp" className="h-4 w-4" /> CONTACT
          </a>

          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-black/10 bg-white lg:hidden"
          >
            <span className={`h-px w-5 bg-ink transition ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`h-px w-5 bg-ink transition ${open ? 'opacity-0' : ''}`} />
            <span className={`h-px w-5 bg-ink transition ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-black/5 bg-cream px-5 py-5 shadow-soft lg:hidden">
          <div className="mx-auto flex max-w-[1360px] flex-col gap-1">
            {links.map(([label, href]) => (
              href.startsWith('/#') ? (
                <a key={label} href={href} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 text-sm transition hover:bg-blush/10 hover:text-blush">{label}</a>
              ) : (
                <Link key={label} to={href} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 text-sm transition hover:bg-blush/10 hover:text-blush">{label}</Link>
              )
            ))}
            <a
              href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi! I'm interested in custom arch covers.")}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-sage px-5 py-3 text-xs tracking-[.12em] text-white sm:hidden"
            >
              <Icon name="whatsapp" className="h-4 w-4" /> CONTACT ON WHATSAPP
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
