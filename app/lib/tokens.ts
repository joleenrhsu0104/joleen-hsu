/**
 * Design tokens — central source of truth for colors, typography,
 * and spacing. Whenever a new screen is built or a Figma spec is
 * pulled in, the new values should map to one of these tokens first.
 * Only introduce a new token if the existing scale can't represent
 * the design intent.
 *
 * Sizing strategy
 * ───────────────
 * • The design canvases are 1920px (desktop) and 390px (mobile).
 * • CSS variables `--u` (= 100vw/1920) and `--u-m` (= 100vw/390)
 *   convert a design-pixel value into a viewport-scaled length, so
 *   the same design-px constant works on any screen size.
 * • Token values below are design-px integers; the helper functions
 *   wrap them as a calc() string for use in inline styles.
 */

// ──────────────────────────────────────────────────────────────
// COLORS
// ──────────────────────────────────────────────────────────────

export const colors = {
  // Surfaces
  cream: "#fff9ec",         // page background / light section bg
  creamBright: "#fffdf7",   // brightest hero text
  ink: "#231f20",           // body / heading text on cream
  nearBlack: "#030303",     // dark section bg (ethos, hero panels) —
                            // consolidates prior #0B0B0B and #0f0f0f
                            // variants into a single near-black token
  forest: "#071b02",        // Work page background — dark forest green
  neudayNavy: "#1F2B36",    // Neuday brand primary navy (brand book)

  // Hero palette — one per featured project
  heroWonder: "#260303",    // dark burgundy
  heroBlueApron: "#0f1b3c", // dark navy
  heroNoom: "#272a15",      // dark olive
  heroNeuday: "#030303",    // near-black (was #0f0f0f, consolidated)
} as const;

export type ColorToken = keyof typeof colors;

// ──────────────────────────────────────────────────────────────
// TYPOGRAPHY
// ──────────────────────────────────────────────────────────────
//
// Each role has a desktop size (design-px on 1920 canvas) and a
// mobile size (design-px on 390 canvas), plus its tracking and the
// recommended font family.
//
// `family` is one of: 'serif' (Instrument Serif), 'sans' (Instrument
// Sans), 'mono' (B612 Mono). The CSS variables `--font-serif`,
// `--font-sans`, `--font-mono` resolve to the loaded Google Fonts.

type FontFamily = "serif" | "sans" | "mono";

interface TypeStyle {
  family: FontFamily;
  desktop: { size: number; tracking: number };
  mobile: { size: number; tracking: number };
}

export const type = {
  /** Giant cycling project name in the hero (Wonder / Blue Apron / …) */
  heroDisplay: {
    family: "serif",
    desktop: { size: 350, tracking: -7 },
    mobile: { size: 72, tracking: -1.44 },
  },

  /** Closing signature wordmark "joleen hsu" — the largest type. */
  signatureWordmark: {
    family: "serif",
    desktop: { size: 500, tracking: -10 },
    mobile: { size: 88, tracking: -1.76 },
  },

  /** Editorial display — long-form intro paragraph + the Rick Rubin
   *  quote. One token covers both so the editorial voice stays
   *  consistent. */
  display: {
    family: "serif",
    desktop: { size: 68, tracking: -1.36 },
    mobile: { size: 30, tracking: -0.6 }, // averages prior 28 (bio) and 32 (quote)
  },

  /** Section heading — job company names ("Noom", "Blue Apron"…). */
  heading: {
    family: "serif",
    desktop: { size: 48, tracking: -0.96 },
    mobile: { size: 26, tracking: -0.52 },
  },

  /** Top-nav wordmark "joleen hsu". */
  logo: {
    family: "serif",
    desktop: { size: 36, tracking: -0.5 },
    mobile: { size: 28, tracking: -0.5 },
  },

  /** Body — job role descriptions and dates. */
  body: {
    family: "sans",
    desktop: { size: 24, tracking: -0.72 },
    mobile: { size: 14, tracking: -0.42 },
  },

  /** Label — small monospaced labels: year, counter, nav links,
   *  section captions, signature links. Consolidated from prior
   *  16 / 18 desktop and 13 / 14 / 16 mobile variants. */
  label: {
    family: "mono",
    desktop: { size: 18, tracking: -0.9 },
    mobile: { size: 14, tracking: -0.7 },
  },
} as const satisfies Record<string, TypeStyle>;

export type TypeToken = keyof typeof type;

// ──────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────

/** Convert a design-pixel value into a calc() string that scales
 *  with the viewport. Pass `mobile: true` to use the 390px canvas. */
export function u(designPx: number, mobile = false) {
  return `calc(var(${mobile ? "--u-m" : "--u"}) * ${designPx})`;
}

// ──────────────────────────────────────────────────────────────
// GRID
// ──────────────────────────────────────────────────────────────
//
// 12-column desktop / 4-column mobile grid. New pages should
// position content with `col()` and `colStart()` so alignment
// stays consistent across the whole site.
//
// Desktop math (1920 canvas):
//   marginX: 96   gutter: 24   columns: 12
//   inner = 1920 - 192 = 1728
//   columnWidth = (1728 - 11·24) / 12 = 122
//
// Mobile math (390 canvas):
//   marginX: 16   gutter: 16   columns: 4
//   inner = 390 - 32 = 358
//   columnWidth = (358 - 3·16) / 4 = 77.5

export const grid = {
  desktop: {
    canvasWidth: 1920,
    columns: 12,
    gutter: 24,
    marginX: 96,
  },
  mobile: {
    canvasWidth: 390,
    columns: 4,
    gutter: 16,
    marginX: 16,
  },
} as const;

function gridSpec(mobile: boolean) {
  return mobile ? grid.mobile : grid.desktop;
}

/** Width of `n` columns plus the (n-1) gutters between them. */
export function colSpan(n: number, mobile = false) {
  const g = gridSpec(mobile);
  const inner = g.canvasWidth - 2 * g.marginX;
  const colW = (inner - (g.columns - 1) * g.gutter) / g.columns;
  const widthPx = n * colW + (n - 1) * g.gutter;
  return u(widthPx, mobile);
}

/** Distance from the canvas's left edge to the start of column `n`
 *  (1-indexed). Useful for `left` on absolute-positioned items. */
export function colStart(n: number, mobile = false) {
  const g = gridSpec(mobile);
  const inner = g.canvasWidth - 2 * g.marginX;
  const colW = (inner - (g.columns - 1) * g.gutter) / g.columns;
  const offsetPx = g.marginX + (n - 1) * (colW + g.gutter);
  return u(offsetPx, mobile);
}

/** The grid's outer side margin (96u desktop / 16u-m mobile). */
export function marginX(mobile = false) {
  return u(gridSpec(mobile).marginX, mobile);
}

/** The grid's inner content width (everything between the margins). */
export function contentWidth(mobile = false) {
  const g = gridSpec(mobile);
  return u(g.canvasWidth - 2 * g.marginX, mobile);
}

/**
 * Returns inline style props for a typography token. Pick the
 * desktop or mobile variant via the second arg.
 *
 *   <p style={t("display")}>…</p>            // desktop
 *   <p style={t("display", "mobile")}>…</p>  // mobile
 */
export function t(token: TypeToken, variant: "desktop" | "mobile" = "desktop") {
  const style = type[token];
  const { size, tracking } = style[variant];
  return {
    fontFamily: `var(--font-${style.family})`,
    fontSize: u(size, variant === "mobile"),
    letterSpacing: u(tracking, variant === "mobile"),
  };
}
