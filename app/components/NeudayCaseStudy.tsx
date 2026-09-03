"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import Link from "next/link";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import SignatureSection from "./SignatureSection";
import MobileTopNav from "./mobile/MobileTopNav";
import MobileSignature from "./mobile/MobileSignature";
import MobileHorizontalPin from "./mobile/MobileHorizontalPin";
import ArrowUpRight from "./ArrowUpRight";
import Logo from "./Logo";
import ScrollNavLink from "./ScrollNavLink";

/**
 * useFadeInOnScroll — IntersectionObserver-based one-shot fade-in.
 * Returns whether the referenced element has crossed `threshold`
 * of viewport intersection at least once. Once true, stays true.
 */
function useFadeInOnScroll(
  ref: RefObject<Element | null>,
  threshold = 0.18,
) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= threshold) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: [threshold, threshold + 0.1, 0.5] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold]);
  return visible;
}

const FADE_IN_TRANSITION =
  "opacity 0.9s cubic-bezier(0.2, 0.7, 0.2, 1), transform 0.9s cubic-bezier(0.2, 0.7, 0.2, 1)";

function fadeInStyle(visible: boolean): CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(24px)",
    transition: FADE_IN_TRANSITION,
    willChange: "opacity, transform",
  };
}

/**
 * NeudayCaseStudy — Figma node 652:4808.
 *
 * Sections (top to bottom):
 *   1. Hero — full-bleed Neuday landing image (logo baked into image)
 *   2. Intro — tagline + role/timeline/website meta on cream
 *   3. App screens row — 4 phone screenshots on cream
 *   4. Brand book — dark navy panel, 6 pages arranged in a 2-column
 *      × 3-row grid (per Figma node 652:4808)
 *   5. Business card mockup on cream
 *   6. Billboard mockup on cream
 *   7. Signature footer (closing on cream)
 *
 * Image assets live in /public/images/neuday/. The hero image is
 * shared with the home page's cycling hero (HERO_PROJECTS[3]).
 */

const CREAM = "var(--color-cream)";
// Neuday primary brand background — dark navy from the brand book.
const NEUDAY_NAVY = "var(--color-neuday-navy)";
const NEAR_BLACK = "var(--color-near-black)";
const INK = "var(--color-ink)";
const IMG = "/images/neuday";
// Case-study hero — subway-environment billboard featuring the
// runner photo + NEUDAY wordmark. Decoupled from the home page hero
// card image (which uses hero-neuday.webp via HERO_PROJECTS in
// assets.ts) so the card and case-study page can show different
// imagery without colliding on the same file path.
const NEUDAY_HERO = `${IMG}/case-study-hero.webp`;

// Each phone in the Figma row has its own (width, height) — the four
// devices are not identical crops. Source assets were exported at the
// same pixel aspect ratios (e.g. NeudayMock1 is 1353×2463 ≈ 451:821)
// so the row can lay them out at their natural Figma sizes without
// any cropping or distortion.
const APP_SCREENS: Array<{ src: string; w: number; h: number }> = [
  { src: `${IMG}/NeudayMock1.png`, w: 451, h: 821 },
  { src: `${IMG}/NeudayMock2.png`, w: 416, h: 821 },
  { src: `${IMG}/NeudayMock3.png`, w: 419, h: 824 },
  { src: `${IMG}/NeudayMock4.png`, w: 438, h: 821 },
];

const BRAND_BOOK_PAGES = [
  `${IMG}/BrandBook1.png`,
  `${IMG}/BrandBook2.png`,
  `${IMG}/BrandBook3.png`,
  `${IMG}/BrandBook4.png`,
  `${IMG}/BrandBook5.png`,
  `${IMG}/BrandBook6.png`,
];

export default function NeudayCaseStudy() {
  const isMobile = useIsMobile();
  return isMobile ? <NeudayMobile /> : <NeudayDesktop />;
}

/* ───────────────────────────────────────────────────────────────
   DESKTOP
   ─────────────────────────────────────────────────────────────── */

function NeudayDesktop() {
  return (
    <main className="relative" style={{ backgroundColor: CREAM }}>
      <HeroDesktop />
      <IntroDesktop />
      <AppScreensRowDesktop />
      <BrandBookGridDesktop />
      <BrowserMockupSection />
      <BusinessCardSection />
      <AdditionalWorkSection />
      <SignatureSection />
    </main>
  );
}

function HeroDesktop() {
  return (
    <section
      className="relative text-white overflow-hidden"
      style={{
        backgroundColor: NEAR_BLACK,
        height: "calc(var(--u) * 1065)",
      }}
    >
      {/* Hero image — Neuday landing scene */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={NEUDAY_HERO}
        alt="Neuday"
        className="absolute inset-0 size-full object-cover"
        style={{ zIndex: 0 }}
      />

      {/* Subtle top gradient so the nav stays readable */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          zIndex: 1,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 82%, rgba(0,0,0,0.25) 100%)",
        }}
      />

      {/* Top nav */}
      <nav
        className="absolute flex items-center justify-between text-white"
        style={{
          left: "calc(var(--u) * 70)",
          right: "calc(var(--u) * 70)",
          top: "calc(var(--u) * 57)",
          height: "calc(var(--u) * 47)",
          zIndex: 20,
        }}
      >
        <Link
          href="/"
          aria-label="Home"
          className="flex items-center h-full text-white"
        >
          <Logo height="calc(var(--u) * 28)" />
        </Link>
        <div
          className="flex items-center h-full font-sans"
          style={{
            gap: "calc(var(--u) * 48)",
            fontSize: "max(14px, calc(var(--u) * 20))",
            fontWeight: 500,
            letterSpacing: "calc(var(--u) * -0.4)",
            lineHeight: 1,
          }}
        >
          <ScrollNavLink hash="work" className="hover:opacity-70 transition-opacity">
            Work
          </ScrollNavLink>
          <ScrollNavLink hash="contact" className="hover:opacity-70 transition-opacity">
            Contact
          </ScrollNavLink>
          <a
            href="https://www.linkedin.com/in/joleenhsu/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-baseline gap-[4px] hover:opacity-70 transition-opacity"
          >
            LinkedIn
            <ArrowUpRight />
          </a>
        </div>
      </nav>
    </section>
  );
}

function IntroDesktop() {
  return (
    <section
      className="relative"
      style={{
        backgroundColor: CREAM,
        color: INK,
        paddingTop: "calc(var(--u) * 95)",
        paddingBottom: "calc(var(--u) * 80)",
        paddingLeft: "calc(var(--u) * 103)",
        paddingRight: "calc(var(--u) * 103)",
      }}
    >
      <div
        className="flex items-start justify-between"
        style={{ gap: "calc(var(--u) * 282)" }}
      >
        {/* Left: tagline + subhead */}
        <div
          className="flex flex-col"
          style={{
            width: "calc(var(--u) * 807)",
            gap: "calc(var(--u) * 24)",
          }}
        >
          <p
            className="font-serif"
            style={{
              fontSize: "max(14px, calc(var(--u) * 60))",
              letterSpacing: "calc(var(--u) * -1.2)",
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Neuday is a personalized longevity and health tracking platform.
          </p>
          <p
            className="font-sans"
            style={{
              fontSize: "max(14px, calc(var(--u) * 24))",
              letterSpacing: "calc(var(--u) * -0.72)",
              lineHeight: 1.4,
              margin: 0,
              maxWidth: "calc(var(--u) * 676)",
              opacity: 0.85,
            }}
          >
            Launched in March 2026 as the first all-in-one platform that
            unifies your health into a holistic longevity protocol across
            exercise, sleep, nutrition and stress management.
          </p>
        </div>

        {/* Right: meta blocks */}
        <div
          className="flex flex-col shrink-0"
          style={{
            width: "calc(var(--u) * 600)",
            gap: "calc(var(--u) * 44)",
          }}
        >
          <MetaRow
            label="MY ROLE"
            value="I helped Neuday craft a unified brand vision and visual identity system to set themselves apart in the fast-growing longevity industry."
          />
          <MetaRow label="TIMELINE" value="2025" />
          <MetaRow label="WEBSITE" value="neuday.io" />
        </div>
      </div>
    </section>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col" style={{ gap: "calc(var(--u) * 16)" }}>
      <span
        className="font-mono uppercase"
        style={{
          fontSize: "max(14px, calc(var(--u) * 18))",
          letterSpacing: "calc(var(--u) * -0.9)",
          lineHeight: 1.1,
        }}
      >
        {label}
      </span>
      <span
        className="font-sans"
        style={{
          fontSize: "max(14px, calc(var(--u) * 24))",
          letterSpacing: "calc(var(--u) * -0.72)",
          lineHeight: 1.4,
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* Row of 4 phone screenshots — each phone gets its own Figma width
   so the row visually matches node 652:4808 (451 / 416 / 419 / 438).
   When the row scrolls into view all four phones lift up + fade in
   together as a single unit (no per-phone stagger), matching the
   reveal pattern used by the BrandBookGridDesktop + the billboard
   sections elsewhere in this case study. */
function AppScreensRowDesktop() {
  const rowRef = useRef<HTMLDivElement | null>(null);
  // 0.12 threshold = trigger the reveal as soon as ~12% of the row is
  // in view (top of phones just cresting), so the slide-up resolves
  // by the time the row is comfortably centered on screen.
  const visible = useFadeInOnScroll(rowRef, 0.12);
  return (
    <section
      className="relative"
      style={{
        backgroundColor: CREAM,
        paddingTop: "calc(var(--u) * 24)",
        paddingBottom: "calc(var(--u) * 92)",
        paddingLeft: "calc(var(--u) * 63)",
        paddingRight: "calc(var(--u) * 63)",
      }}
    >
      <div
        ref={rowRef}
        className="flex items-end justify-between"
        style={{
          gap: "calc(var(--u) * 16)",
          // Single shared fadeInStyle drives the whole row, so all
          // four phones rise + fade in lockstep instead of one at a
          // time. Matches the rest of the page's animation language.
          ...fadeInStyle(visible),
        }}
      >
        {APP_SCREENS.map(({ src, w, h }, i) => (
          <div
            key={src}
            className="shrink-0"
            style={{
              width: `calc(var(--u) * ${w})`,
              height: `calc(var(--u) * ${h})`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Neuday app screen ${i + 1}`}
              className="size-full object-contain"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────────────────────────
   Brand book — 2-column × 3-row grid of 6 pages.

   Per Figma node 652:4808 the brand book is laid out as a static
   grid: pages 1+2 share row 1, pages 3+4 share row 2, pages 5+6
   share row 3. Frame metrics (1920 canvas): grid container is
   1790u wide centered on the navy section (~65u side padding),
   cells are 883u × 497u, 24u gutter between cells and rows.
   ─────────────────────────────────────────────────────────────── */

function BrandBookGridDesktop() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const visible = useFadeInOnScroll(sectionRef, 0.08);
  return (
    <section
      ref={sectionRef}
      aria-label="Neuday brand book"
      style={{
        backgroundColor: NEUDAY_NAVY,
        // Figma places the grid at y=2747 inside a navy frame that
        // begins at y=2597 (Δ150u top padding). Bottom padding mirrors
        // the top so the grid breathes evenly before the navy section
        // hands off to BrowserMockupSection below.
        paddingTop: "calc(var(--u) * 150)",
        paddingBottom: "calc(var(--u) * 150)",
        paddingLeft: "calc(var(--u) * 65)",
        paddingRight: "calc(var(--u) * 65)",
      }}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: "1fr 1fr",
          // 24u column gap + 24u row gap, both directions.
          columnGap: "calc(var(--u) * 24)",
          rowGap: "calc(var(--u) * 24)",
          ...fadeInStyle(visible),
        }}
      >
        {BRAND_BOOK_PAGES.map((src, i) => (
          <div
            key={src}
            // Each cell is 883u wide × 497u tall in Figma. We let the
            // grid template handle horizontal sizing (1fr each) and
            // pin the cell aspect ratio so heights match the frame
            // intent at any viewport width.
            className="relative overflow-hidden"
            style={{
              aspectRatio: "883 / 497",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Brand book page ${i + 1}`}
              className="absolute inset-0 size-full object-cover"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/* Browser tab mockup — sits inside the Neuday navy frame.
   Fades + lifts in as it enters the viewport. */
function BrowserMockupSection() {
  const ref = useRef<HTMLImageElement | null>(null);
  const visible = useFadeInOnScroll(ref);
  return (
    <section
      className="relative"
      style={{ backgroundColor: NEUDAY_NAVY }}
    >
      <div
        className="w-full overflow-hidden"
        style={{ height: "calc(var(--u) * 1034)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={ref}
          src={`${IMG}/billboard1.png`}
          alt="Neuday browser mockup"
          className="size-full object-cover"
          style={fadeInStyle(visible)}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
    </section>
  );
}

/* Business card mockup — fades in on scroll */
function BusinessCardSection() {
  const ref = useRef<HTMLImageElement | null>(null);
  const visible = useFadeInOnScroll(ref);
  return (
    <section
      className="relative"
      style={{ backgroundColor: NEUDAY_NAVY }}
    >
      <div
        className="w-full overflow-hidden"
        style={{ height: "calc(var(--u) * 1019)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={ref}
          src={`${IMG}/billboard2.webp`}
          alt="Neuday business card mockup"
          className="size-full object-cover"
          style={fadeInStyle(visible)}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
    </section>
  );
}

/* Additional work CTA — centered serif paragraph that closes the
   case study before the signature footer. Replaces the previous
   outdoor-billboard image; sits on cream bg, matches the editorial
   typographic rhythm of the Intro section above. */
function AdditionalWorkSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useFadeInOnScroll(ref);
  return (
    <section
      className="relative flex items-center justify-center"
      style={{
        backgroundColor: CREAM,
        color: INK,
        paddingTop: "calc(var(--u) * 120)",
        paddingBottom: "calc(var(--u) * 120)",
        paddingLeft: "calc(var(--u) * 96)",
        paddingRight: "calc(var(--u) * 96)",
      }}
    >
      <p
        ref={ref}
        className="font-serif text-center"
        style={{
          fontSize: "max(14px, calc(var(--u) * 40))",
          letterSpacing: "calc(var(--u) * -0.8)",
          lineHeight: 1.25,
          margin: 0,
          maxWidth: "calc(var(--u) * 1200)",
          ...fadeInStyle(visible),
        }}
      >
        Additional work available upon request.
      </p>
    </section>
  );
}

/* ───────────────────────────────────────────────────────────────
   MOBILE
   ─────────────────────────────────────────────────────────────── */

function NeudayMobile() {
  return (
    <main className="relative" style={{ backgroundColor: CREAM }}>
      <MobileTopNav />

      {/* Hero — section height tracks the source image's natural
          aspect ratio (1920 × 1065 ≈ 1.8:1) so the full billboard
          composition stays visible at any mobile viewport width with
          no horizontal cropping of the runners or the NEUDAY mark.
          The previous fixed 480u-m height combined with object-cover
          was forcing the image to fill the tall narrow box, which
          clipped roughly half the original frame on either side. */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundColor: NEAR_BLACK,
          aspectRatio: "1920 / 1065",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={NEUDAY_HERO}
          alt="Neuday"
          className="absolute inset-0 size-full object-cover"
        />
      </section>

      {/* Intro */}
      <section
        className="flex flex-col"
        style={{
          color: INK,
          paddingLeft: "calc(var(--u-m) * 16)",
          paddingRight: "calc(var(--u-m) * 16)",
          paddingTop: "calc(var(--u-m) * 48)",
          paddingBottom: "calc(var(--u-m) * 24)",
          gap: "calc(var(--u-m) * 20)",
        }}
      >
        <p
          className="font-serif"
          style={{
            fontSize: "max(12px, calc(var(--u-m) * 32))",
            letterSpacing: "calc(var(--u-m) * -0.64)",
            lineHeight: 1.15,
            margin: 0,
          }}
        >
          Neuday is a personalized longevity and health tracking platform.
        </p>
        <p
          className="font-sans"
          style={{
            fontSize: "max(12px, calc(var(--u-m) * 14))",
            letterSpacing: "calc(var(--u-m) * -0.42)",
            lineHeight: 1.4,
            margin: 0,
            opacity: 0.85,
          }}
        >
          Launched in March 2026 as the first all-in-one platform that
          unifies your health into a holistic longevity protocol across
          exercise, sleep, nutrition and stress management.
        </p>
      </section>

      {/* Hairline divider between the description paragraph and the
          MY ROLE/TIMELINE/WEBSITE meta block — same treatment as the
          other case studies. */}
      <div
        aria-hidden
        style={{
          height: 0,
          borderTop: "1px solid rgba(0, 0, 0, 0.12)",
          marginLeft: "calc(var(--u-m) * 16)",
          marginRight: "calc(var(--u-m) * 16)",
        }}
      />

      {/* Meta */}
      <section
        className="flex flex-col"
        style={{
          color: INK,
          paddingLeft: "calc(var(--u-m) * 16)",
          paddingRight: "calc(var(--u-m) * 16)",
          paddingTop: "calc(var(--u-m) * 24)",
          // No bottom padding — the App Screens row below provides
          // its own 44u-m top padding via MobileHorizontalPin, so the
          // gap between "neuday.io" and the first phone is exactly
          // 44u-m.
          paddingBottom: 0,
          gap: "calc(var(--u-m) * 28)",
        }}
      >
        <MobileMetaRow
          label="MY ROLE"
          value="I helped Neuday craft a unified brand vision and visual identity system to set themselves apart in the fast-growing longevity industry."
        />
        <MobileMetaRow label="TIMELINE" value="2025" />
        <MobileMetaRow label="WEBSITE" value="neuday.io" />
      </section>

      {/* App screens — horizontal scroll-pin matching the Wonder
          (restaurant carousel + Post Purchase) and Blue Apron
          (AlaCarte / Funnel) patterns. All four phones use the same
          box dimensions as BlueApron's mobile AlaCarte row (220u-m
          wide × 420:803 aspect) so the row reads at the same scale
          users have already seen in the other case studies. The
          Neuday mocks have slightly different intrinsic aspect
          ratios (451:821 / 416:821 / 419:824 / 438:821), so each
          image renders with object-contain inside the shared box —
          they all look identically sized, no cropping, and the few
          pixels of padding the narrower mocks gain are invisible
          against the cream background. */}
      <section
        aria-label="Neuday app screens"
        style={{ backgroundColor: CREAM }}
      >
        <MobileHorizontalPin>
          {APP_SCREENS.map(({ src }, i) => (
            <div
              key={src}
              className="shrink-0"
              style={{
                width: "calc(var(--u-m) * 220)",
                aspectRatio: "420 / 803",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Neuday app screen ${i + 1}`}
                className="block w-full h-full object-contain"
                draggable={false}
              />
            </div>
          ))}
        </MobileHorizontalPin>
      </section>

      {/* Brand book — single-column vertical stack on mobile. Each
          page renders at the full content width (viewport minus the
          section's 16u-m horizontal padding) so every slide is fully
          readable without horizontal swiping. Matches the desktop
          BrandBookGridDesktop's "show all 6 pages in one view"
          intent, just stacked vertically for the narrower surface. */}
      <section
        style={{
          backgroundColor: NEUDAY_NAVY,
          paddingTop: "calc(var(--u-m) * 48)",
          paddingBottom: "calc(var(--u-m) * 48)",
          paddingLeft: "calc(var(--u-m) * 16)",
          paddingRight: "calc(var(--u-m) * 16)",
        }}
        aria-label="Neuday brand book"
      >
        <div
          className="flex flex-col"
          style={{ gap: "calc(var(--u-m) * 24)" }}
        >
          {BRAND_BOOK_PAGES.map((src, i) => (
            <div key={src} className="w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Brand book page ${i + 1}`}
                className="block w-full h-auto"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </section>

      <MobileFadeInMockup
        src={`${IMG}/billboard1.png`}
        alt="Neuday browser mockup"
        aspect="1920 / 1034"
        bg={NEUDAY_NAVY}
      />
      {/* Business card was the last image asset; the outdoor
          billboard that previously closed the case study has been
          replaced with the "Additional work available upon request."
          text section below — mirrors the desktop AdditionalWorkSection. */}
      <MobileFadeInMockup
        src={`${IMG}/billboard2.webp`}
        alt="Neuday business card mockup"
        aspect="1920 / 1019"
        bg={NEUDAY_NAVY}
      />

      <section
        className="flex items-center justify-center"
        style={{
          backgroundColor: CREAM,
          color: INK,
          paddingTop: "calc(var(--u-m) * 80)",
          paddingBottom: "calc(var(--u-m) * 80)",
          paddingLeft: "calc(var(--u-m) * 16)",
          paddingRight: "calc(var(--u-m) * 16)",
        }}
      >
        <p
          className="font-serif text-center"
          style={{
            fontSize: "max(12px, calc(var(--u-m) * 24))",
            letterSpacing: "calc(var(--u-m) * -0.48)",
            lineHeight: 1.25,
            margin: 0,
          }}
        >
          Additional work available upon request.
        </p>
      </section>

      <MobileSignature />
    </main>
  );
}

function MobileFadeInMockup({
  src,
  alt,
  aspect,
  bg,
}: {
  src: string;
  alt: string;
  aspect: string;
  bg: string;
}) {
  const ref = useRef<HTMLImageElement | null>(null);
  const visible = useFadeInOnScroll(ref);
  return (
    <section style={{ backgroundColor: bg }}>
      <div
        className="w-full overflow-hidden"
        style={{ aspectRatio: aspect }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={ref}
          src={src}
          alt={alt}
          className="size-full object-cover"
          style={fadeInStyle(visible)}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
    </section>
  );
}

function MobileMetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col" style={{ gap: "calc(var(--u-m) * 8)" }}>
      <span
        className="font-mono uppercase"
        style={{
          fontSize: "max(12px, calc(var(--u-m) * 12))",
          letterSpacing: "calc(var(--u-m) * -0.6)",
          lineHeight: 1.1,
        }}
      >
        {label}
      </span>
      <span
        className="font-sans"
        style={{
          fontSize: "max(12px, calc(var(--u-m) * 14))",
          letterSpacing: "calc(var(--u-m) * -0.42)",
          lineHeight: 1.5,
        }}
      >
        {value}
      </span>
    </div>
  );
}
