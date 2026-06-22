# Design System

Single source of truth for color and type used in the portfolio. Whenever a new Figma frame comes in, **map the spec to one of the tokens below first**. Only introduce a new token if no existing role can represent the design intent — and prefer extending the tracking/size of an existing role over inventing a parallel one.

Live tokens are in `app/lib/tokens.ts`. CSS variables live in `app/globals.css`.

---

## 1. Color

| Token              | Hex       | Role                                                    |
| ------------------ | --------- | ------------------------------------------------------- |
| `cream`            | `#fff9ec` | Page background; primary light section background       |
| `creamBright`      | `#fffdf7` | Largest white type (hero project name, wordmark)        |
| `white`            | `#ffffff` | Pure white — Noom HabitLoops + BlueApron periwinkle-wrapper sections (distinct from `cream`) |
| `ink`              | `#231f20` | Body & heading text on cream surfaces                   |
| `nearBlack`        | `#030303` | Ethos / Work / Contact backgrounds, case-study hero panels, cycling-hero fallback |
| `forest`           | `#071b02` | Dark forest green (reserved — currently no consumer)    |
| `neudayNavy`       | `#1F2B36` | Neuday brand primary navy (brand book)                  |
| `periwinkle`       | `#D2DDFC` | Blue Apron PDP card surface                             |

**On hero project colors.** Previously this table had a `hero*` palette (one color per featured project) paired with `HERO_PROJECTS[i].bg` in `assets.ts`. Both have been removed — the cycling hero's image+blur+gradient treatment now fully covers the section background, so the per-project tints were redundant. CyclingHero + MobileHero now use the shared `nearBlack` token as their dark fallback during image load. Case-study-internal brand colors (e.g., `TASTE_GREEN`, `WONDER_YELLOW`, `NOOM_BLUE`) remain scoped at each case-study component file because they're tied to that case study's specific in-page section backgrounds, not the home-page hero.

### Ink RGB tuple

`INK_RGB = "35, 31, 32"` is exported from `tokens.ts` alongside the color tokens. The four scroll-driven fill components (`AboutSentences`, `MobileAboutSentences`, `ScrollCharFill`, `ScrollFillText`) interpolate between a semi-transparent and fully-opaque ink in JS via a `blend()` helper that parses numeric channels — CSS variables can't satisfy that math. The tuple keeps the value in lock-step with the `ink` token while staying composable inside `rgba(${INK_RGB}, 0.3)` / `rgb(${INK_RGB})` expressions.

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

### Second-pass cleanup (cream / near-black / ink consolidation)

Three near-duplicate hex literals had drifted into the case-study and contact files and were collapsed back onto canonical tokens:

- `#FCF7ED` (Wonder + Blue Apron `*_BG` page background) → `var(--color-cream)` (`#fff9ec`).
- `#0a0a0a` (Wonder + Blue Apron `HERO_BG` landing-video panel) → `var(--color-near-black)` (`#030303`).
- `#030303` literal in `ContactPage` `BG` → `var(--color-near-black)` (no value change, just abstraction).
- `FOREST = "#000000"` constant in `WorkPage` → renamed `BG = "var(--color-near-black)"`. The constant's old name implied a green tint that the value didn't carry; the page is just a dark surface like Ethos/Contact and now uses the same token.
- `rgb(35, 31, 32)` ink literals in `AboutSentences`, `MobileAboutSentences`, `ScrollCharFill`, `ScrollFillText` → imported `INK_RGB` from `tokens.ts` (see the "Ink RGB tuple" subsection above for why a CSS var isn't usable here).
- `#D2DDFC` periwinkle literal (used 4× in `BlueApronCaseStudy`) → promoted to a single `PERIWINKLE` constant in the same file and the `periwinkle` color token.

### Body line-height standardized to 1.4

Twelve `lineHeight: 1.55` and one `lineHeight: 1.45` in body paragraphs across the four case studies and `WhatIDoSection` were drifted from the dominant `1.4` body rhythm. All collapsed back to `1.4` so the reading cadence is uniform across every page.

### Caption opacity normalized to 0.7

Three "Original designs" captions sat at `opacity: 0.6` while every other dimmed caption (MetaRow eyebrows, etc.) uses `0.7`. Bumped to `0.7` to match the dimmed-text ladder of `0.7 / 0.75 / 0.85`.

### Third-pass cleanup (case-study unification + role-distinct sizes)

A later sweep across the four case studies tightened typography and surfaced a clean role-based ramp:

- **Case-study `<h2>` section heading → unified at 60u desktop.** Previously split 60u (Noom, Neuday, parts of BlueApron) vs 68u (Wonder NarrativeSection, "Other case studies", parts of BlueApron). All in-section h2s, intro taglines, and "Other case studies" headings now use 60u serif with −2% tracking and 1.1 line-height. Display moments outside the case-study chrome (AboutSentences scroll-jacked statements) stay at 68u — they're hero-tier editorial.
- **Closing-placeholder paragraphs → unified at 40u / 24u-m.** "From 2021…", "We're in the middle of a rebrand…", "Additional work available upon request" all share the same scale across Wonder / Noom / Neuday closing surfaces. Reads as a confident body-copy paragraph rather than a display headline. Blue Apron's `<h2>` closing headline ("Blue Apron has delivered…") stays at 60u because it IS a headline, not a placeholder.
- **Mobile heading → 32u-m everywhere.** Project-card label on WorkPage mobile bumped from 28u-m → 32u-m. 32u-m is now the unambiguous mobile section-heading size (intro taglines, in-section h2s, scroll-jacked statements, service titles).
- **Mobile orphan sizes consolidated.** 11u-m MetaRow labels → 12u-m, 13u-m Rick Rubin byline → 12u-m, 26u-m job-history → 24u-m. Two latent letter-spacing holdouts at −5% were also bumped to −2% as part of these edits.
- **Line-height ramp tightened to a 4-tier system.** All `lineHeight: 1.15` (18 sites) and `1.5` orphans (5 sites — but those 5 are defensibly correct for 14u-m small captions, so they stayed) audited. Final ramp: `1.0` small chrome, `1.1` headlines + display, `1.25` mid-display + closing placeholders (incl. BlueApron's two closing-card headlines as a surgical exception), `1.4` body, `1.5` 14u-m captions only.
- **Opacity 0.75 orphan → 0.7.** Three eyebrow captions ("WHAT I DO" etc.) folded into the standard caption opacity. Remaining `0.85` opacity is a *distinct role* (intro-paragraph readability) — leave it.
- **`--color-white` token added.** Four hardcoded `"#FFFFFF"` backgroundColor uses (Noom HabitLoops, BlueApron periwinkle-wrapper white sections) now go through the token system so the "all colors via tokens" invariant is intact.
- **`HERO_PROJECTS[i].bg` removed.** See the "On hero project colors" note above. Per-project burgundy/navy/olive/near-black tints are gone; cycling hero uses shared `nearBlack` fallback.
- **`FLOWER_IMAGE` + flower references removed.** The asset file no longer exists on disk; the export and its two `<img>` consumers in `AboutSection` + `MobileAbout` are now deleted.
- **Border-radius forced into the fluid scale.** Three sites used raw `"16px"` / `"24px"` / `"2vh"` instead of `calc(var(--u) * N)` and rendered the same physical size regardless of viewport. All converted to the `var(--u)` scaling so they breathe with the viewport like the rest of the design.

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
