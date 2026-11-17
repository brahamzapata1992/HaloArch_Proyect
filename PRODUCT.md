# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Families across the United States who are organizing a celebration (baby showers, kids' birthdays, sweet 16s, sports-themed parties and other special events) and want a personalized backdrop. They buy online, receive the set by shipping, and assemble it themselves at the venue. Many are Latino families, so Spanish speakers are a core audience alongside English speakers.

## Product Purpose

Halo Arch Co. sells custom fabric arch covers together with the gold metal frames they fit on, as a 3-arch backdrop set. The site lets a customer upload their own artwork for each arch, see it on the real set at true proportions, and send that preview to the business on WhatsApp to get a quote. Success means a customer arrives with an idea (or none), leaves with a preview they are confident in, and starts a quote conversation.

## Positioning

The customer sees their own design on the actual 3-arch set, at the frames' real relative scale, before contacting the business, and can then download that preview and send it straight to a human on WhatsApp. Customers without a design yet are invited to talk to the business, which helps create one.

## Operating Context

- Flow: browse inspiration by category → open the custom design page → upload one image per arch, zoom and drag it into place → optionally try a balloon decoration idea → generate and download a PNG preview → open WhatsApp and attach it to request a quote.
- Quoting and ordering happen in a WhatsApp conversation (+1 470 383 1727), not in an on-site checkout.
- Customers assemble the frames and covers themselves after delivery.

## Capabilities and Constraints

- The set is three arches, arranged tallest in the middle:
  - Left: 100 × 200 cm / 39 × 78 in (6.6 ft)
  - Center: 120 × 220 cm / 47 × 86 in (7.2 ft)
  - Right: 80 × 180 cm / 31 × 70 in (6 ft)
- Frames and their stands are gold; the stand color is not a customer choice.
- Balloons are never included. Any balloon decoration on the site is a visual idea only and must always be labelled as not included.
- Front-end only (React + Vite + Tailwind); no backend, accounts or online payment. A browser cannot attach the preview to WhatsApp automatically, so the customer downloads it and attaches it manually.
- Uploaded images stay in the customer's browser; nothing is sent to a server.
- The site is bilingual (English / Spanish): a toggle in the header switches language, the choice is remembered, the browser language sets the default, and `?lang=es` / `?lang=en` links force one. WhatsApp messages and the downloadable preview follow the chosen language. Copy lives in `src/locales/en.js` and `src/locales/es.js`.
- Undecided / not stated anywhere yet: prices, shipping regions and times, production lead time, fabric material details, return policy. Do not invent these.

## Brand Commitments

- Name: Halo Arch Co.
- Tagline: "Decor for Beautiful Moments".
- Existing logo files: `public/assets/logo-custom.png`, `public/assets/logo-home.png`.

## Evidence on Hand

- Inspiration scenes per category and arch preview images in `public/assets/` (baby shower, kids' superhero birthday, sweet 16, sports theme, any occasion).
- Photos used in the "Real Moments" section: `public/assets/moment-1.png` to `moment-3.png`.
- No customer testimonials, reviews, order counts or press exist in the project; do not fabricate them.

## Product Principles

1. Seeing is deciding: the customer should be able to judge the real result, at true scale, before they talk to anyone.
2. Honest about what's in the box: frames and covers are the product; anything shown beyond that (balloons, decor) is clearly marked as not included.
3. A person closes the sale: every path ends in an easy WhatsApp conversation, including for customers who don't have a design yet.
4. Built for both English- and Spanish-speaking families.
