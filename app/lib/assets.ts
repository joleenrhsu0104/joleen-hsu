/**
 * Asset paths. After running `node scripts/download-assets.mjs`, these
 * point to local files in /public/images/ which Next.js serves directly.
 */

// Cycling hero — one image per project.
// `href` (optional) lets the hero image link to the project's case
// study page when present. Blue Apron's case study page hasn't been
// built yet, so its href is omitted and the card stays non-clickable.
//
// `imageWidth` / `imageHeight` are the natural pixel dimensions of
// the full-res file (the .webp at `image`). Used by heroSrcSet to
// emit the correct `w` descriptor in srcset strings so browsers can
// pick the smallest variant that satisfies their viewport × DPR.
//
// Note: per-project `bg` color fields were removed when the cycling
// hero adopted the image-blur + dark gradient overlay. The blurred
// hero image now fully covers the section background, so the
// section just uses a single shared `--color-near-black` fallback
// for the brief moment before the image renders.
export const HERO_PROJECTS = [
  {
    name: "Wonder",
    role: "Product Designer",
    years: "2021-2025",
    counter: "[1 OF 4]",
    image: "/images/hero-wonder.webp",
    imageWidth: 1459,
    imageHeight: 2044,
    href: "/work/wonder",
  },
  {
    name: "Blue Apron",
    role: "Product Design Lead",
    years: "2024-2025",
    counter: "[2 OF 4]",
    image: "/images/hero-blue-apron.webp",
    imageWidth: 1459,
    imageHeight: 2044,
    href: "/work/blue-apron",
  },
  {
    name: "Noom",
    role: "Staff Product Designer",
    years: "2025-2026",
    counter: "[3 OF 4]",
    image: "/images/hero-noom.webp",
    imageWidth: 1459,
    imageHeight: 2044,
    href: "/work/noom",
  },
  {
    name: "Neuday",
    role: "Founding Designer",
    years: "2025-2026",
    counter: "[4 OF 4]",
    image: "/images/neuday/hero-neuday.webp",
    imageWidth: 1605,
    imageHeight: 2190,
    href: "/work/neuday",
  },
] as const;

/**
 * Build a responsive srcset for a hero image. We ship three sizes
 * of every hero: -800.webp (200–250 KB, perfect for 2x DPR phones),
 * -1400.webp (350–450 KB, for 3x DPR phones + small desktops), and
 * the full-res original (1459w or 1605w, for large desktops at high
 * DPR). The browser uses the `w` descriptors + the `sizes` attr
 * (HERO_SIZES) to pick the smallest variant that satisfies the
 * required pixel count for the user's viewport × DPR.
 */
export function heroSrcSet(project: {
  image: string;
  imageWidth: number;
}): string {
  const dot = project.image.lastIndexOf(".");
  const stem = project.image.slice(0, dot);
  const ext = project.image.slice(dot);
  return [
    `${stem}-800${ext} 800w`,
    `${stem}-1400${ext} 1400w`,
    `${project.image} ${project.imageWidth}w`,
  ].join(", ");
}

/**
 * `sizes` attribute companion to heroSrcSet. Tells the browser how
 * wide the image displays at each viewport breakpoint so it can
 * pick the right srcset variant.
 *
 * - Mobile (<=768px): the hero card fills basically the entire
 *   viewport width with minimal padding, so 100vw is accurate.
 * - Desktop (>768px): the cycling-hero card is centered at ~600 CSS
 *   pixels wide, so 600px is a safe upper bound. Smaller than the
 *   true viewport width means the browser picks a smaller variant
 *   (e.g., 800w instead of 1400w on 1x monitors) without quality loss.
 */
export const HERO_SIZES = "(max-width: 768px) 100vw, 600px";

// Contact page — six scattered images, positioned per Figma (1920×1096 frame).
// Each card flips to reveal its caption on hover (desktop) or tap (mobile).
export const ETHOS_IMAGES = [
  {
    src: "/images/contact/dinnerparties.webp",
    x: -9,
    y: 391,
    caption: "My favorite culinary exploration was a deep dive into Uyghur cuisine",
  },
  {
    src: "/images/contact/doublerainbow.webp",
    x: 421,
    y: 44,
    caption: "Welcomed 2026 with a double rainbow in Kauai",
  },
  {
    src: "/images/contact/dolomites.webp",
    x: 1034,
    y: 700,
    caption: "One of the most beautiful places I've visited in the last year: Dolomites",
  },
  {
    src: "/images/contact/casagilardi.webp",
    x: 1264,
    y: 150,
    caption: "A masterpiece in Casa Gilardi, Mexico City",
  },
  {
    src: "/images/contact/reading.webp",
    x: 488,
    y: 747,
    caption: "Current read: “Start with Why” by Simon Sinek",
  },
  {
    src: "/images/contact/tennis.webp",
    x: 1580,
    y: 546,
    caption: "My latest obsession: tennis",
  },
] as const;

// Signature / closing
export const BW_PORTRAIT = "/images/portrait-bw.webp";
export const HEADLINE_TEXTURE = "/images/headline-texture.webp";

// Job history (right column on cream section)
export const JOB_HISTORY = [
  { company: "Noom", role: "Staff Product Designer", years: "2025 - 2026" },
  { company: "Blue Apron", role: "Product Design Lead", years: "2024 - 2025" },
  { company: "Wonder", role: "Product Designer", years: "2021 - 2025" },
  { company: "Deloitte", role: "Consultant, Customer Strategy & Design", years: "2018 - 2021" },
] as const;
