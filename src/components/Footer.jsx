import { Icon } from './Icons'

const WHATSAPP = '14703831727'

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-black/10 bg-[#fffaf7]">
      <div className="mx-auto grid max-w-[1260px] gap-8 px-6 py-10 text-center md:grid-cols-[.9fr_1.3fr_1fr] md:items-center md:text-left">
        <div className="flex justify-center md:justify-start">
          <img src="/assets/logo-custom.png" alt="Halo Arch Co." className="h-24 w-auto" />
        </div>
        <div className="md:text-center">
          <p className="text-[10px] font-medium tracking-[.26em] text-taupe">DECOR FOR BEAUTIFUL MOMENTS</p>
          <p className="mx-auto mt-3 max-w-md text-xs leading-5 text-ink/55">
            Custom fabric arch covers designed around your celebration, your colors and your ideas.
          </p>
        </div>
        <div className="md:border-l md:border-black/10 md:pl-8">
          <p className="text-xs font-semibold tracking-[.14em]">NEED HELP WITH A DESIGN?</p>
          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi! I need help creating a custom design for my arch covers.")}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-sage px-5 py-2.5 text-[10px] tracking-[.12em] text-white transition hover:bg-sageDark"
          >
            <Icon name="whatsapp" className="h-4 w-4" /> CONTACT ON WHATSAPP
          </a>
        </div>
      </div>
      <div className="border-t border-black/5 py-4 text-center text-[10px] text-ink/40">© 2026 Halo Arch Co.</div>
    </footer>
  )
}
