# Design System

Single source of truth for color and type used in the portfolio. Whenever a new Figma frame comes in, **map the spec to one of the tokens below first**. Only introduce a new token if no existing role can represent the design intent — and prefer extending the tracking/size of an existing role over inventing a parallel one.

Live tokens are in `app/lib/tokens.ts`. CSS variables live in `app/globals.css`.

---

## 1. Color

| Token              | Hex       | Role                                                    |
| ------------------ | --------- | ------------------------------------------------------- |
| `cream`            | `#fff9ec` | Page background; primary light section background       |
| `creamBright`      | `#fffdf7` | Largest white type (hero project name, wordmark)        |
| `ink`              | `#231f20` | Body & heading text on cream surfaces                   |
| `nearBlack`        | `#030303` | Ethos section background (Rick Rubin quote)             |
| `heroWonder`       | `#260303` | Hero panel — Wonder (burgundy)                          |
| `heroBlueApron`    | `#0f1b3c` | Hero panel — Blue Apron (navy)                          |
| `heroNoom`         | `#272a15` | Hero panel — Noom (olive)                               |
| `heroNeuday`       | `#0f0f0f` | Hero panel — Neuday (near-black)                        |

The four `hero*` palettes are paired 1:1 with featured projects in `app/lib/assets.ts` (`HERO_PROJECTS[i].bg`). If a new project gets added, its hex goes there, not as a new top-level color token.

---

## 2. Typography

All sizes are **design-px** on the design canvas (1920 desktop / 390 mobile). They scale fluidly via the CSS variables `--u` and `--u-m`.

Helper functions in `tokens.ts`:

- `u(72)` → `calc(var(--u) * 72)` (desktop)
- `u(72, true)` → `calc(var(--u-m) * 72)` (mobile)
- `t("display")` → returns `{ fontFamily, fontSize, letterSpacing }` for inline styles
- `t("display", "mobile")` → mobile variant

### Type scale

| Token              | Family        | Desktop (size / track) | Mobile (size / track) | Used for                                              |
| ------------------ | ------------- | ---------------------- | --------------------- | ----------------------------------------------------- |
| `heroDisplay`      | Instrument Serif | 350 / −7              | 72 / −1.44            | Cycling project name in hero                          |
| `signatureWordmark`| Instrument Serif | 500 / −10             | 88 / −1.76            | Closing "joleen hsu" wordmark (textured fill)         |
| `display`          | Instrument Serif | 68 / −1.36            | 30 / −0.6             | Intro paragraph, Rick Rubin quote                     |
| `heading`          | Instrument Serif | 48 / −0.96            | 26 / −0.52            | Job company names ("Noom", "Blue Apron"…)             |
| `logo`             | Instrument Serif | 36 / −0.5             | 28 / −0.5             | Top-nav wordmark "joleen hsu"                         |
| `body`             | Instrument Sans  | 24 / −0.72            | 14 / −0.42            | Job role descriptions and dates                       |
| `label`            | B612 Mono        | 18 / −0.9             | 14 / −0.7             | Year, counter, nav links, captions, signature links   |

**One-off:** Mobile menu drawer items render at 44/−0.88 — a single-use size that doesn't earn its own token. If menu-like surfaces show up elsewhere on mobile, we promote it to `menuItem`.

### Fonts

- **Instrument Serif** (`--font-serif`) — editorial display + headings + body for emphasis
- **Instrument Sans** (`--font-sans`) — sans-serif body for utility text
- **B612 Mono** (`--font-mono`) — monospaced labels, codes, captions

All three load via `next/font/google` in `app/layout.tsx`.

---

## 3. Audit & consolidations made

These were the consolidations applied during the initial audit. Listing them here so the rationale is preserved.

### Labels collapsed to a single token

Before this audit, three different mono sizes were in use:

- Desktop: `16` (year/counter) and `18` (nav links, ethos caption)
- Mobile: `13` (ethos caption), `14` (year/counter), `16` (signature links)

These all served the same visual role — small monospaced supporting text. **All five now map to `label`** (18 desktop / 14 mobile). The visual size difference between 14/16/18 on a non-precision label is small and the consistency wins are large.

### Editorial display unified

The bio paragraph and the Rick Rubin quote both used 68 desktop, but mobile diverged (28 bio / 32 quote). Both are now `display` (68 / 30). The 1–2 design-px gap on mobile wasn't carrying meaning.

### Mobile menu items left as a one-off

Originally the system included a `menuItem` token (desktop 48 / −0.96, mobile 44 / −0.88). The desktop side was identical to `heading` because the menu drawer doesn't exist on desktop — so it was a fallback that meant nothing. The token also had exactly one consumer (`MobileMenu`). Adding a system-wide token for one component is over-engineering, so the mobile menu now uses a literal one-off size (44 / −0.88) with a comment in `MobileMenu.tsx` pointing back to the Figma spec. Promote it to `menuItem` only if menu-like surfaces appear on more screens.

### Hero project name and signature wordmark stayed separate

Both are huge editorial display, but the *signature* wordmark has its own texture-fill animation and a different role (closing flourish, not active hero). Keeping them as `heroDisplay` and `signatureWordmark` makes the intent explicit even though the family is the same.

---

## 4. Grid

A 12-column grid on desktop and a 4-column grid on mobile. New pages should lay out content with this grid so alignment stays consistent across the site.

### Specs

| Property        | Desktop          | Mobile          |
| --------------- | ---------------- | --------------- |
| Canvas width    | 1920u            | 390u-m          |
| Outer margin (`marginX`) | 96u    | 16u-m           |
| Inner content width | 1728u        | 358u-m          |
| Columns         | 12               | 4               |
| Gutter          | 24u              | 16u-m           |
| Column width    | 122u             | 77.5u-m         |

The grid is defined in `app/lib/tokens.ts` (`grid` object + helpers) and surfaced as React primitives in `app/components/Grid.tsx`.

### React primitives (preferred for new pages)

```tsx
import { Grid, GridItem } from "@/app/components/Grid";

<Grid>
  <GridItem cols={8}>Main content</GridItem>
  <GridItem cols={4}>Sidebar</GridItem>
</Grid>
```

- `<Grid>` lays out a 12-col / 4-col responsive grid with automatic margins and gutters
- `<GridItem cols={N} start={M}>` spans N columns starting at M (1-indexed; `start` is optional)
- Mobile-specific props: `colsMobile` and `startMobile` for overriding the mobile layout

### Helpers (for absolute-positioned editorial layouts)

When pinning elements with `position: absolute` (the way the existing home page works), use the helper functions to get column-aligned values:

```tsx
import { colSpan, colStart, marginX, contentWidth } from "@/app/lib/tokens";

<div style={{
  left: colStart(5),         // start of column 5
  width: colSpan(4),         // span 4 columns
}}>
```

| Helper                   | Returns                                            |
| ------------------------ | -------------------------------------------------- |
| `colStart(n, mobile?)`   | Distance from canvas left to column `n`'s left     |
| `colSpan(n, mobile?)`    | Width of `n` columns + their internal gutters      |
| `marginX(mobile?)`       | The outer side margin (96u desktop / 16u-m mobile) |
| `contentWidth(mobile?)`  | The inner content width between the margins        |

### Existing layouts are editorial placements

The current home-page sections (`CyclingHero`, `AboutSection`, `EthosSection`, `SignatureSection`) place content with hand-tuned design-px positions that match Figma exactly. Those positions don't all snap to this grid — that's intentional for the editorial feel of the home. The grid is the default scaffold for **new** pages (Work, case studies, etc.) so they share a consistent rhythm.

---

## 5. How to use the system going forward

When you point me at a new Figma frame, the lookup is:

1. **Color** → does the hex appear in the `colors` table? If yes, use that token. If no, decide whether it represents a new role (add to tokens) or is a one-off (use literal hex only after we discuss).
2. **Type** → match by visual role first (body? label? heading?), then verify the size/tracking is close. If a new spec is within ~10% of an existing token's size, **prefer the token** over a new one — the difference is rarely meaningful at the design canvas scale.
3. **Layout** → use `u(designPx)` / `u(designPx, true)` for any positioning/sizing that comes off the Figma canvas, so values stay viewport-fluid.

If you see a Figma spec that genuinely doesn't fit any role, tell me and we'll add a token explicitly rather than letting it become an ad-hoc style.
