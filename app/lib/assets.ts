/**
 * Asset paths. After running `node scripts/download-assets.mjs`, these
 * point to local files in /public/images/ which Next.js serves directly.
 */

// Cycling hero — one image per project.
// `href` (optional) lets the hero image link to the project's case
// study page when present. Blue Apron's case study page hasn't been
// built yet, so its href is omitted and the card stays non-clickable.
export const HERO_PROJECTS = [
  {
    name: "Wonder",
    role: "Product Designer",
    years: "2021-2025",
    counter: "[1 OF 4]",
    image: "/images/hero-wonder.webp",
    bg: "#260303", // dark burgundy
    href: "/work/wonder",
  },
  {
    name: "Blue Apron",
    role: "Product Design Lead",
    years: "2024-2025",
    counter: "[2 OF 4]",
    image: "/images/hero-blue-apron.webp",
    bg: "#0f1b3c", // dark navy
    href: "/work/blue-apron",
  },
  {
    name: "Noom",
    role: "Staff Product Designer",
    years: "2025-2026",
    counter: "[3 OF 4]",
    image: "/images/hero-noom.webp",
    bg: "#272a15", // dark olive
    href: "/work/noom",
  },
  {
    name: "Neuday",
    role: "Founding Designer",
    years: "2025-2026",
    counter: "[4 OF 4]",
    image: "/images/neuday/hero-neuday.webp",
    bg: "#030303", // near-black (matches --color-near-black token)
    href: "/work/neuday",
  },
] as const;

// About section
export const FLOWER_IMAGE = "/images/flower.png";

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
export const HEADLINE_TEXTURE = "/images/headline-texture.jpg";
export const LOGO_HEADLINE = "/images/logo-headline.png";

// Job history (right column on cream section)
export const JOB_HISTORY = [
  { company: "Noom", role: "Staff Product Designer", years: "2025 - 2026" },
  { company: "Blue Apron", role: "Product Design Lead", years: "2024 - 2025" },
  { company: "Wonder", role: "Product Designer", years: "2021 - 2025" },
  { company: "Deloitte", role: "Consultant, Customer Strategy & Design", years: "2018 - 2021" },
] as const;
