Apex — CTA / Footer section

Implementation of the Figma "Footer – DESKTOP" frame (node `283-919`) from the Lumis file.

## Tech stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4 (`@tailwindcss/postcss`, `@theme` tokens)
- GSAP 3.15 + `@gsap/react` — headline / hand / divider / footer entrance (on scroll-into-view)
- Matter.js — the colour blobs are physics bodies: they drop in, tumble into a pile, and are draggable / throwable (collisions + gravity)
- Fonts via `next/font/local` (`app/fonts/`): **Phudu** (headings, 50px) and **Inter** (body, 16px), exposed as CSS variables `--font-phudu` / `--font-inter`. Local files avoid a Turbopack + Google-fonts loader bug and keep the build offline-safe.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
```

## What's built (static, no animation yet)

The section is a pixel-faithful 1440×961 frame, scaled responsively by `Stage.tsx`:

- **Headline** — "THANK YOU FOR YOUR CURIOSITY. / LET'S BUILD SOMETHING COOL." in Phudu, with the outline peace-hand graphic (`hand.svg`).
- **Footer** — Apex™ logo (`icon.svg` + wordmark) + tagline, and three link columns: Quick Links, Products, Company.
- **Cloud row** — the 13 colour blobs (`blob-1…13.svg`), positioned with the exact `translate(x y) rotate()` transforms extracted from the Figma frame.

### Assets (`public/assets/`)

`blob-1…13.svg` (labels baked in), `hand.svg` (was `Vectorized SVG`), `icon.svg`, `apex-wordmark.svg`.

### Palette (from Figma)

bg `#161614` · green `#37B669` / mint `#6AEA9C` · yellow `#F4FF77` · orange `#ED5D3A` · blue `#659DF5` · pink `#FCCEF0` / `#FE99B6` · cream `#FBF8E9`

## Build steps (the plan)

1. Inspect Figma frame + audit the attached SVG/font assets. ✅
2. Scaffold Next.js 16 + TS + Tailwind 4; wire Phudu + Inter via `next/font/google`. ✅
3. Add assets to `public/assets`. ✅
4. Build the static section: headline + hand, footer columns, 13-blob cloud row (exact transforms). ✅
5. Verify layout against the Figma reference. ✅
6. GSAP entrance animations (`useGSAP` + ScrollTrigger): headline word reveal, hand pop+wave, dividers draw-in, footer fade-up. ✅
7. Matter.js physics for the blob cloud — drop-in pile + drag/throw (`components/PhysicsBlobs.tsx`). ✅

> After pulling new deps (`matter-js`, `@types/matter-js`), run `npm install` again.

> Note: `node_modules` is not committed. Run `npm install` locally — the deps resolve normally (the build environment used here had a per-command time limit that blocked installing Next 16's native SWC binary).
