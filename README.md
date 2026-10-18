# ayodhya.work

Personal portfolio for **Ayodhya Ram Mohanthy — Product Designer**, Bengaluru.

Built in a single day, designed to be cheap to host, easy to maintain, and
visually distinct from the default "dark portfolio on a serif" template.

## Stack

- Static HTML + CSS + a single ~6 KB inline `<script>` block
- Fraunces (display) + Plus Jakarta Sans (body), self-hosted in `assets/fonts/` (woff2, OFL, latin + latin-ext)
- No build step, no framework, no npm
- One warm light theme + a warm **dusk** dark theme (data-theme toggle, persisted)

## What's in here

```
portfolio-warm/
├── index.html              # Home
├── case-study.html         # Case study (Atlas — Query builder)
├── 404.html                # Friendly 404
├── robots.txt
├── sitemap.xml
├── CNAME                   # → ayodhya.work (for GitHub Pages)
├── .nojekyll               # tells GitHub Pages not to run Jekyll
├── assets/
│   ├── favicon.svg
│   ├── apple-touch-icon.png    180×180
│   ├── icon-512.png            512×512 (PWA)
│   ├── og-image.png           1200×630
│   └── manifest.webmanifest
├── DEPLOY.md               # How to ship this (GitHub Pages + Framer paths)
├── FRAMER-BUILD-GUIDE-WARM.md   # Component-by-component Framer rebuild spec
└── README.md
```

## Local preview

```bash
cd portfolio-warm
python3 -m http.server 8899
# → http://localhost:8899
```

## Design tokens (summary)

Surfaces: cream `#FDF7F1`, cream-2 `#F8EDE2`, blush `#F6E3DA`, surface `#FFFFFF`.
Ink: `#33291F` / soft `#7A6857` / faint `#A89687`.
Accents: peach `#E99568`, apricot `#F7C08A`, rose `#E49DA4`, sage `#A9C4A2`,
lilac `#C0AEDA`, butter `#F2D79B`.
Radii: 14 / 22 / 34 / 46 / pill 100.
Shadows: warm brown `rgba(90,60,35, …)`. Never pure black.

Full token list + Framer setup lives in `FRAMER-BUILD-GUIDE-WARM.md`.

## Deploying

Read `DEPLOY.md`. TL;DR:

```bash
cd portfolio-warm
git init && git add . && git commit -m "Initial"
gh repo create ayodhya.work --public --source=. --remote=origin --push
```

Then point `ayodhya.work` at GitHub Pages via the A records in `DEPLOY.md` and
enable **Enforce HTTPS** in the repo's Pages settings.
