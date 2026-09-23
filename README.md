# Halo Arch Co. — React + Vite + Tailwind

Responsive storefront/prototype for Halo Arch Co.

## Included

- React + Vite + Tailwind CSS
- Responsive desktop + mobile navigation/layout
- Halo Arch Co. 3-arch logo and `Decor for Beautiful Moments` tagline
- Five design-category inspiration cards
- Inspiration modal for each category showing a decorated 3-arch setup with balloons/event styling
- `How It Works` section with the four-step customer flow
- Direct WhatsApp contact links for **+1 470 383 1727**
- Custom-design page where a customer can upload 3 images
- Per-arch zoom + horizontal/vertical positioning
- Arch proportions based on the supplied frame sizes:
  - Left: 120 × 220 cm / 47 × 86 in
  - Center: 100 × 200 cm / 39 × 78 in
  - Right: 80 × 180 cm / 31 × 70 in
- Custom preview modal shows only the three arches, without balloons/decor
- Client-side PNG download for the custom preview
- WhatsApp quote button with a prefilled message
- No backend required for the current flow

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The project intentionally does not auto-attach the generated image to WhatsApp because a normal browser page cannot inject a file into a specific WhatsApp chat. The flow downloads the PNG, then opens the business WhatsApp chat so the customer can attach it.
