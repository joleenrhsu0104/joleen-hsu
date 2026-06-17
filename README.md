# Joleen Hsu — Portfolio

Editorial portfolio site at [joleenh.com](https://joleenh.com), recreated from Figma file [Joleen's 2026 Portfolio](https://www.figma.com/design/5a9JgTtB73VBU5W1n4bXaH/Joleen-s-2026-Portfolio).

Built with Next.js 16, React 19, Tailwind CSS v4, and TypeScript.

## Run locally

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

## Project layout

```
app/
├── components/
│   ├── CyclingHero.tsx       Burgundy hero — scroll cycles Wonder/Blue Apron/Noom/Neuday
│   ├── AboutSection.tsx      Cream — bio + flower + work history
│   ├── EthosSection.tsx      Black — Rick Rubin quote + 6 floating images
│   └── SignatureSection.tsx  Cream — B&W portrait + giant "joleen hsu" wordmark
├── lib/
│   └── assets.ts             All Figma image URLs in one place (swap later)
├── globals.css               Design tokens, fluid scaling, animation keyframes
├── layout.tsx                Fonts (Instrument Serif/Sans, B612 Mono)
└── page.tsx                  Home composition
```

## Design system

Tokens live in `app/globals.css` under `@theme inline`:

| Token                  | Value     | Use                                                    |
| ---------------------- | --------- | ------------------------------------------------------ |
| `--color-cream`        | `#fff9ec` | Page background, case-study surfaces                   |
| `--color-cream-bright` | `#fffdf7` | Largest white type                                     |
| `--color-burgundy`     | `#260303` | Hero section (Wonder)                                  |
| `--color-near-black`   | `#030303` | Ethos / Work / Contact backgrounds, case-study heroes  |
| `--color-ink`          | `#231f20` | Body copy on cream                                     |
| `--color-forest`       | `#071b02` | Dark forest green (reserved, no current consumer)      |
| `--color-neuday-navy`  | `#1F2B36` | Neuday brand primary navy (brand book)                 |

For the full token table including hero palettes and the `INK_RGB` tuple for scroll-driven char fills, see [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md).

Fonts are loaded via `next/font/google`: Instrument Serif (display), Instrument Sans (body), B612 Mono (labels).

## Fluid scaling

The Figma design is at 1920px. We use a single CSS variable `--u` that equals `100vw / 1920` so every dimension specified as `calc(var(--u) * <figma-px>)` scales proportionally to the viewport width. This means the layout always fits the screen without horizontal scroll on any monitor size.

## Animations (sourced from Dev Mode annotations)

- **Hero scroll cycle** — As the user scrolls through the 400vh hero container, the project name and image crossfade through Wonder → Blue Apron → Noom → Neuday. Logic lives in `CyclingHero.tsx`.
- **Water drift on giant wordmark** — The image fill inside the closing "joleen hsu" letters subtly drifts via the `water-drift` keyframe in `globals.css` (annotation: _"image in letters is slightly moving, to mimic the movement of water"_).
- **Image bounce in ethos grid** — The six images in the dark section float gently via `float-bounce`, staggered per image (annotation: _"images have a subtle bounce"_).

## TODO before launch

1. **Export images from Figma to `/public/images/`** — current URLs from `app/lib/assets.ts` are short-lived Figma MCP asset URLs (~7 days). Replace them with local paths.
2. **Add resume PDF** — `SignatureSection.tsx` links to `/resume.pdf`.
3. **Wire CONTACT** — currently links to `mailto:hi@joleenh.com`; update if you prefer a contact form.
4. **Mobile/responsive design** — current build is desktop-only.
5. **Build out case study pages** for Wonder, Blue Apron, Noom, Neuday.
6. **Deploy to Vercel** and connect joleenh.com (see below).

## Deployment

1. Push to GitHub: `git init && git add . && git commit -m "init" && git remote add origin <url> && git push -u origin main`
2. Import the repo at <https://vercel.com/new>
3. In Vercel project settings → Domains, add `joleenh.com` and `www.joleenh.com`
4. At your domain registrar, set DNS records as Vercel instructs (typically `A 76.76.21.21` for the apex and a `CNAME cname.vercel-dns.com` for `www`)
5. Vercel auto-issues SSL certificates within minutes
