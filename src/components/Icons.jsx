export const Icon = ({ name, className = 'w-5 h-5' }) => {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }
  const paths = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4.5 21c.7-4.2 3.2-6.4 7.5-6.4S18.8 16.8 19.5 21"/></>,
    bag: <><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/></>,
    truck: <><path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.8"/><circle cx="18" cy="18" r="1.8"/></>,
    heart: <path d="M20.5 8.8c0 5.8-8.5 11-8.5 11s-8.5-5.2-8.5-11A4.5 4.5 0 0 1 12 6.1a4.5 4.5 0 0 1 8.5 2.7Z"/>,
    diamond: <><path d="m4 8 3-4h10l3 4-8 12Z"/><path d="M4 8h16M8 4l4 16 4-16"/></>,
    upload: <><path d="M12 16V4"/><path d="m8 8 4-4 4 4"/><path d="M5 14v5h14v-5"/></>,
    refresh: <><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/></>,
    share: <><circle cx="18" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="19" r="2"/><path d="m8 11 8-5M8 13l8 5"/></>,
    shield: <><path d="M12 3 5 6v5c0 4.7 2.9 8 7 10 4.1-2 7-5.3 7-10V6Z"/><path d="m9 12 2 2 4-4"/></>,
    magic: <><path d="m4 20 10-10"/><path d="m13 4 .8 1.7L16 6.5l-2.2.8L13 9l-.8-1.7-2.2-.8 2.2-.8L13 4Z"/><path d="m19 11 .6 1.3 1.4.6-1.4.6L19 15l-.6-1.5-1.4-.6 1.4-.6L19 11Z"/></>,
    whatsapp: <><path d="M20 11.5A8.5 8.5 0 1 1 7 4.2"/><path d="M4.5 20.5 6 16.2"/><path d="M9.4 8.7c.2-.4.4-.4.7-.4h.6c.2 0 .4 0 .6.5.2.6.7 1.9.8 2 .1.2.1.4 0 .6-.1.2-.2.4-.4.6-.2.2-.3.3-.5.5-.2.2-.4.4-.2.8.2.4.9 1.5 1.9 2.4 1.3 1.1 2.3 1.5 2.7 1.6.4.1.6.1.8-.1.2-.2.8-.9 1-1.3.2-.4.4-.3.7-.2.3.1 1.8.9 2.1 1.1.3.1.5.2.6.4.1.2.1 1.1-.3 2-.4.8-2.2 1.9-3 2-1 .1-2.2.1-5-1.1-3.5-1.5-5.6-5.2-5.8-5.5-.2-.3-1.4-1.9-1.4-3.7 0-1.8.9-2.7 1.2-3 .3-.3.6-.4.8-.4Z"/></>,
    download: <><path d="M12 4v10"/><path d="m8 10 4 4 4-4"/><path d="M5 18v2h14v-2"/></>,
    eye: <><path d="M2.2 12S5.6 6.5 12 6.5 21.8 12 21.8 12 18.4 17.5 12 17.5 2.2 12 2.2 12Z"/><circle cx="12" cy="12" r="3"/></>,
    x: <><path d="M6 6l12 12"/><path d="M18 6 6 18"/></>,
  }
  return <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...common}>{paths[name]}</svg>
}
