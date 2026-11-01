# Warren Panergayo — Portfolio

A one-page React + Vite portfolio in paper, ink, and safety orange. Includes About, Projects, Stack, Log, and Contact after the animated hero.

## Run locally

```sh
npm install
npm run dev
```

Open the Local URL printed by Vite. Node.js 22.12+ is recommended.

```sh
npm run check
npm run build
npm run preview
```

## Edit the content

All portfolio content is in `src/data/portfolio.js`. StreetSmart, BOOKET, and Tandaverse deliberately retain stack TODOs. Unspecified certificate issuers are displayed as a dash. The Computer Systems Servicing date comes from the supplied résumé.

- Portrait: `public/warren-hero.png`, a transparent cutout sourced from `Profile pictures/Profile-cutout.png`. The original `Profile.jpg` is preserved.
- Static halftone fallback: `public/warren-halftone.svg`.
- Résumé: `public/resume.pdf`, rebuilt as a clean one-page PDF from the supplied résumé content. The original Word file is unchanged.
- Screenshots: replace `public/projects/<slug>.jpg` with actual project screenshots. Current images are clearly labeled illustrated placeholders.
- Project demo links: replace each project's `href: '#'` with a real URL. The UI shows a coming-soon label until then.
- Rebuild the photo and placeholder assets with `npm run assets`. The transparent `Profile-cutout.png` must be present; alpha is preserved in both the photo and halftone fallback.

## Contact delivery

Copy `.env.example` to `.env.local` and set `VITE_FORMSPREE_ENDPOINT` to your Formspree endpoint, for example `https://formspree.io/f/abcdefgh`. Rebuild after changing environment variables. Configure the same variable in Vercel for production.

Without an endpoint, the validated form creates a reviewable `mailto:` draft. It never reports a message as delivered unless the configured service returns success. Direct email and phone links always work. No backend or secret client-side API key is required.

## Deploy to Vercel

Import this folder as a Git repository in Vercel. Framework: **Vite**, build: **npm run build**, output: **dist**. `vercel.json` includes those settings. Add the Formspree environment variable before building. Only `dist` is deployed; source documents and credentials folders are not copied into it.

## Motion and accessibility

The header's LIGHT / DARK switch follows system appearance on the first visit and remembers an explicit choice in local storage. Light mode uses warm paper (`#F2EFE8`), ink (`#111111`), and safety orange (`#FF4F00`). Dark mode uses charcoal (`#151614`), warm ivory (`#F2EFE8`), and ember orange (`#FF6B2B`), with raised surfaces in `#22231F`. Portrait particles, static fallback, 3D letters, forms, and tables follow the selected palette. The switch works by keyboard and remains available beside the mobile menu.

The intro plays once per tab session and ends in 4.3 seconds: 2.1 seconds for the letters, then 2.2 seconds for the portrait's outward burst and inward assembly. The longer portrait sequence follows the supplied `intro.mp4`. Click or press a key to skip either stage. Deep links, reduced-motion preferences, and unavailable session storage bypass the intro. Three.js is dynamically loaded only when the intro runs. A flat text fallback handles WebGL failure. The transparent portrait has a matching static halftone fallback, uses canvas rather than WebGL, and stops drawing when idle. Motion respects `prefers-reduced-motion`.

Navigation, accordions, and forms are keyboard operable. The mobile menu traps focus and closes on Escape. Form status is announced to assistive technology. Fonts are served locally, and certificate tables scroll within their container on narrow screens.

## Reference

The intro adapts the [reference reel](https://www.instagram.com/p/Deg70vPP7q9/) and the supplied `intro.mp4`: individual extruded letters curl upward from a shared dot and move into the hero. Fine portrait particles burst across the hero, pause briefly, then converge into the background-free silhouette. It keeps the requested paper, ink, and orange palette. The 3D letters use the same Archivo Black outlines as the final heading. Particle motion and alpha-aware sampling live in `src/lib/portraitParticles.js`.

To watch the intro again without clearing the session, open `/?intro=replay`. Normal visits still play it only once per tab session, and reduced motion always skips it.
