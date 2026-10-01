# Visa Linkk Lebanon: landing page

A single-page, bilingual (English / العربية) site built with React + Vite. There is no backend: every contact action opens WhatsApp, the phone or email.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/, deploy anywhere (Vercel, Netlify, any static host)
```

## Before going live

1. **Contact details**: edit `src/config.js`:
   - `whatsappNumber`: international format, digits only (e.g. `9613123456`). Every WhatsApp button uses it.
   - `phone`, `email`, `address`, `hours`: currently the placeholders from the brief.
   - `bookingUrl`: optional booking page for "Book a Consultation"; without one it opens WhatsApp.
2. **Photos**: the photos in `public/images/` are Unsplash stock placeholders (credits are in the `.json` file next to each image). To use your own, replace the files with the same names. Each service has a two-colour print (`svc-*.webp`) and a colour original (`svc-*-color.webp`) that appears on hover.
3. **Copy**: all English and Arabic text lives in `src/content.js`. Keep both languages in sync.

## Where things are

- `src/components/`: one file per section (Hero, Services, Why, HowItWorks, NextStep, Footer) plus the nav, the services panel, and the animation pieces.
- `src/styles/tokens.css`: colours, fonts, spacing and easing curves.
- `public/brand/`: logo and plane artwork extracted from the supplied logo PDF.

Visitors who ask their device for reduced motion get a calm version of the page: no smooth scrolling, parallax or pinned flight, and content is shown immediately.
