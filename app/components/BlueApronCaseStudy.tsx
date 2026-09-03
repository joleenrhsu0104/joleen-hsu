"use client";

import {
  CSSProperties,
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { HERO_PROJECTS } from "@/app/lib/assets";
import SignatureSection from "./SignatureSection";
import MobileTopNav from "./mobile/MobileTopNav";
import MobileSignature from "./mobile/MobileSignature";
import MobileHorizontalPin from "./mobile/MobileHorizontalPin";
import ArrowUpRight from "./ArrowUpRight";
import Logo from "./Logo";
import ScrollNavLink from "./ScrollNavLink";

/**
 * useFadeInOnScroll — IntersectionObserver-based one-shot fade-in.
 * Same pattern used in NeudayCaseStudy + NoomCaseStudy: returns
 * whether the referenced element has crossed `threshold` of viewport
 * intersection at least once. Once true, stays true.
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
 * BlueApronCaseStudy — Figma node 556:2943.
 *
 * Sections (top to bottom):
 *   1. Hero — full-bleed Blue Apron landing video + giant "BLUE APRON" wordmark
 *   2. Intro — tagline + role/timeline/website meta
 *   3. App screens row — 5 phone screenshots
 *   4. "A full taste of Blue Apron" — restaurant brand cards strip
 *   5. Post Purchase Optimizations — copy + 4 original order-state phones
 *   6. iPhone redesigned order flow — 4 large iPhone mockups
 *   7. Membership program (Blue Apron Premium) — 4-up phone grid + logo + copy
 *   8. Web ordering — copy + browser screenshot
 *   9. Closing — paragraph
 *  10. Cover image
 *  11. Other case studies — Blue Apron / Noom / Neuday
 *  12. Signature footer
 *
 * Image assets live in /public/images/blue-apron/ — fetched via
 * `node scripts/download-blue-apron-assets.mjs`. The landing video lives
 * at /videos/blue-apron-landing.mp4.
 */

// Both page surfaces reference design-token CSS vars instead of
// hardcoded hex so the cream/near-black ladder stays consistent with
// every other section on the site. (Prior literals were #FCF7ED and
// #0a0a0a — within 3–7 RGB units of the canonical tokens.)
const BLUEAPRON_BG = "var(--color-cream)"; // case study page bg (warm cream)
const HERO_BG = "var(--color-near-black)"; // hero panel under the landing video
const TASTE_GREEN = "#00271A";          // "A full taste of Blue Apron" + carousel
// PDP card surface — periwinkle. Used 4× across the file for the
// AlaCarte intro panel, PDP scroll-pin frames, and the closing CTA.
// Single constant means the brand color changes once and everywhere.
const PERIWINKLE = "#D2DDFC";
const INK = "var(--color-ink)";         // dark body text on the cream bg
const IMG = "/images/blue-apron";
const LANDING_VIDEO = "/videos/blue-apron-landing.mp4";

// All 5 phones render at their natural size with no CSS scaling.
// Mocks 4 and 5 will look slightly smaller than 1-3 because their
// source images have more padding around the phone body, but
// nothing is ever cropped. To equalize the visual size, the source
// PNGs for Mocks 4 and 5 would need to be re-exported with tighter
// framing (less padding around the phone).
const APP_SCREENS = [
  `${IMG}/BlueApronPhoneMock1.webp`,
  `${IMG}/BlueApronPhoneMock2.webp`,
  `${IMG}/BlueApronPhoneMock3.webp`,
  `${IMG}/BlueApronPhoneMock4.webp`,
  `${IMG}/BlueApronPhoneMock5.webp`,
];

const MEMBERSHIP_SCREENS = [
  `${IMG}/membership-1.png`,
  `${IMG}/membership-2.png`,
  `${IMG}/membership-3.png`,
  `${IMG}/membership-4.png`,
];

const ORIGINAL_ORDER_STATES = [
  { label: "Order received", src: `${IMG}/old-postpurchase1.webp` },
  { label: "Preparing meal", src: `${IMG}/old-postpurchase2.webp` },
  { label: "On the way", src: `${IMG}/old-postpurchase3.webp` },
  { label: "Delivered", src: `${IMG}/old-postpurchase4.webp` },
];

const IPHONE_MOCKUPS = [
  // Animated WebP files converted from PostPurchase[N].gif via ffmpeg
  // (libwebp_anim, lossless, full-canvas frames). The source GIFs
  // encode mid-animation frames as sub-rectangles inset at the phone
  // bezel; Pillow's WebP encoder preserved those rects, which painted
  // a visible outline when the loop hit those frames. ffmpeg writes
  // every frame as a full canvas, eliminating the seam. Cream bg is
  // recolored to the exact section bg (#fcf7ed) so opaque cream
  // composites seamlessly without needing alpha.
  // All four slots are MP4 videos rendered via <video>. We tried
  // animated WebP and animated APNG first; both produced a subtle
  // rectangular outline at the canvas perimeter when looping. Switching
  // to <video> uses a separate rendering pipeline that doesn't have
  // the issue. The clean-bg pipeline in make_postpurchase_clean.py also
  // flood-fills the outer canvas ring across each frame and recolors
  // it to the exact section bg (#fcf7ed), eliminating a tan ring that
  // the source GIFs had baked into many of their mid-animation frames.
  `${IMG}/post-purchase-1.mp4`,
  `${IMG}/post-purchase-2.mp4`,
  `${IMG}/post-purchase-3.mp4`,
  `${IMG}/post-purchase-4.mp4`,
];

export default function BlueApronCaseStudy() {
  const isMobile = useIsMobile();
  return isMobile ? <BlueApronMobile /> : <BlueApronDesktop />;
}

/* ───────────────────────────────────────────────────────────────
   DESKTOP
   ─────────────────────────────────────────────────────────────── */

function BlueApronDesktop() {
  return (
    <main className="relative" style={{ backgroundColor: BLUEAPRON_BG }}>
      <HeroDesktop />
      <IntroDesktop />
      <AlaCarteScreensRow />
      <AlaCarteIntro />
      <PdpCardsRow />
      <FunnelSection />
      <BlueApronClosingSection />
      <SignatureSection />
    </main>
  );
}

/* ───────────────────────────────────────────────────────────────
   New Blue Apron sections — built to match Figma node 587:1277.
   ─────────────────────────────────────────────────────────────── */

const ALACARTE_SCREENS = [
  `${IMG}/BlueApron1.png`,
  `${IMG}/BlueApron2.png`,
  `${IMG}/BlueApron3.png`,
  `${IMG}/BlueApron4.png`,
];

// URL-encoded paths because the user's uploaded filenames have a
// space and an ampersand. (Meal Kit.png -> Meal%20Kit.png, etc.)
const PDP_MEAL_KIT_SRC = `${IMG}/Meal%20Kit.png`;
const PDP_PNR_SRC = `${IMG}/Prepared%26Ready.png`;
const PDP_ADDON_SRC = `${IMG}/Add-On.png`;

// Funnel marquee — five stages of the a-la-carte -> subscription
// journey. Extend this array and drop matching files in /public/
// images/blue-apron/ if you want more frames in the marquee.
const FUNNEL_PHONES = [
  `${IMG}/SubscriptionMock1.png`,
  `${IMG}/SubscriptionMock2.png`,
  `${IMG}/SubscriptionMock3.png`,
  `${IMG}/SubscriptionMock4.png`,
  `${IMG}/SubscriptionMock5.png`,
];

const SUBSCRIPTION_SCREENS = [
  `${IMG}/subscription-screen-1.webp`,
  `${IMG}/subscription-screen-2.webp`,
  `${IMG}/subscription-screen-3.webp`,
  `${IMG}/subscription-screen-4.webp`,
];

/* Row of 4 large phone screenshots (a la carte browse / discovery). */
function AlaCarteScreensRow() {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useFadeInOnScroll(ref);
  return (
    <section
      className="relative"
      style={{
        backgroundColor: BLUEAPRON_BG,
        paddingTop: "calc(var(--u) * 76)",
        paddingBottom: "calc(var(--u) * 160)",
        paddingLeft: "var(--side-pad)",
        paddingRight: "var(--side-pad)",
      }}
    >
      <div
        ref={ref}
        className="flex justify-center items-end"
        style={{ gap: "calc(var(--u) * 12)", ...fadeInStyle(visible) }}
      >
        {ALACARTE_SCREENS.map((src, i) => (
          <div
            key={src}
            className="shrink-0"
            style={{
              // Cell mirrors the Figma frame: 420 wide × 803 tall.
              width: "calc(var(--u) * 420)",
              aspectRatio: "420 / 803",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Blue Apron a la carte screen ${i + 1}`}
              className="block w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/* Funnel section — heading + body + a strip of phone mocks that fill
   the viewport between the side paddings with equal margin on left
   and right. Each mock takes 1/5 of the available width via flex:1,
   so the row is always equidistant from both viewport edges and the
   phones grow or shrink proportionally with the viewport. Fades in
   on scroll using the same pattern as the other case study images. */
function FunnelSection() {
  const stripWrapperRef = useRef<HTMLDivElement | null>(null);
  const visible = useFadeInOnScroll(stripWrapperRef);

  return (
    <section
      className="relative"
      style={{
        backgroundColor: BLUEAPRON_BG,
        paddingTop: "calc(var(--u) * 160)",
        paddingBottom: "calc(var(--u) * 160)",
      }}
    >
      {/* Heading + body — left-aligned */}
      <div
        style={{
          paddingLeft: "var(--side-pad)",
          paddingRight: "var(--side-pad)",
          marginBottom: "calc(var(--u) * 80)",
          maxWidth: "calc(var(--u) * 1200)",
        }}
      >
        <h2
          className="font-serif"
          style={{
            color: INK,
            fontSize: "max(14px, calc(var(--u) * 60))",
            letterSpacing: "calc(var(--u) * -1.2)",
            lineHeight: 1.15,
            margin: 0,
            marginBottom: "calc(var(--u) * 28)",
          }}
        >
          The funnel from a-la-carte to subscription
        </h2>
        <p
          className="font-sans"
          style={{
            color: INK,
            fontSize: "max(14px, calc(var(--u) * 24))",
            letterSpacing: "calc(var(--u) * -0.72)",
            lineHeight: 1.4,
            margin: 0,
            opacity: 0.85,
            maxWidth: "calc(var(--u) * 900)",
          }}
        >
          Based on user testing data, we knew that highlighting price
          savings would be the most important conversion and retention
          tactic. We focused on the value of the subscription throughout
          the entire user journey.
        </p>
      </div>

      {/* Phone strip — each cell uses flex:1 so the 5 mocks share the
          available horizontal space equally with 24px gaps between
          them. The strip is wrapped in the fade-in container so it
          rises into view as the section enters the viewport. */}
      <div
        ref={stripWrapperRef}
        style={{
          paddingLeft: "var(--side-pad)",
          paddingRight: "var(--side-pad)",
          ...fadeInStyle(visible),
        }}
      >
        <div className="flex items-start" style={{ gap: "24px" }}>
          {FUNNEL_PHONES.map((src, i) => {
            // Mock 3 (index 2) has the border + rounded corners baked
            // into its PNG, so skip the CSS border on that one only —
            // otherwise it ends up with a double outline.
            const hasBakedBorder = i === 2;
            return (
              <div
                key={src}
                style={{
                  flex: "1 1 0",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  aria-hidden="true"
                  style={{
                    width: "100%",
                    height: "auto",
                    // Cap on very tall mocks so the strip never
                    // overflows the viewport vertically.
                    maxHeight: "80vh",
                    display: "block",
                    objectFit: "contain",
                    // Subtle border + radius to match the look of
                    // Mock 3 on every other mock. Mock 3 itself has
                    // this baked into its PNG, so leave it untouched.
                    ...(hasBakedBorder
                      ? {}
                      : {
                          border: "1px solid #E5E7EB",
                          borderRadius: "24px",
                        }),
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* Intro for the a-la-carte PDP redesign — centered heading + lede.
   Shares the #D2DDFC periwinkle background with the pinned PDP card
   row below so the two visually read as one continuous section. */
function AlaCarteIntro() {
  return (
    <section
      className="relative"
      style={{
        backgroundColor: PERIWINKLE,
        paddingTop: "calc(var(--u) * 100)",
        // Tightened: the gap between this subtext and the PDP cards
        // below was previously dominated by 80u of padding here plus
        // the sticky-inner's vertical centering. Drop padding here to
        // 24u and bring the cards up via items-start on the pinned row.
        paddingBottom: "calc(var(--u) * 24)",
        paddingLeft: "var(--side-pad)",
        paddingRight: "var(--side-pad)",
      }}
    >
      <div
        className="mx-auto text-center"
        style={{
          color: INK,
          maxWidth: "calc(var(--u) * 1100)",
          display: "flex",
          flexDirection: "column",
          gap: "calc(var(--u) * 40)",
        }}
      >
        <h2
          className="font-serif"
          style={{
            fontSize: "max(14px, calc(var(--u) * 60))",
            letterSpacing: "calc(var(--u) * -1.2)",
            lineHeight: 1.15,
            margin: 0,
          }}
        >
          During my time at Blue Apron, I helped to launch their
          a-la-carte menu with 100+ different menu items.
        </h2>
        <p
          className="font-sans"
          style={{
            fontSize: "max(14px, calc(var(--u) * 24))",
            letterSpacing: "calc(var(--u) * -0.72)",
            lineHeight: 1.4,
            margin: 0,
            opacity: 0.85,
          }}
        >
          I created 3 different versions of the PDPs to highlight the
          preparation of each menu type.
        </p>
      </div>
    </section>
  );
}

/* Row of 3 tabbed PDP cards (Meal Kits / Prepared & Ready / Add-Ons).
   The section is scroll-pinned: as the user scrolls into it, the
   three cards become sticky at viewport center, and only the Meal Kit
   card's image scrolls upward inside its fixed-size window. The other
   two cards stay static. Once the Meal Kit has fully scrolled up,
   the pin releases and the user can progress to the next section. */
function PdpCardsRow() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const windowRef = useRef<HTMLDivElement | null>(null);
  const mealKitImgRef = useRef<HTMLImageElement | null>(null);
  const [progress, setProgress] = useState(0); // 0..1 through the section
  const [maxScroll, setMaxScroll] = useState(0); // px the meal-kit img needs to travel

  // Measure how much the meal-kit image overflows its window. Re-runs
  // on image load, viewport resize, or font/layout changes.
  useEffect(() => {
    const measure = () => {
      const img = mealKitImgRef.current;
      const win = windowRef.current;
      if (!img || !win) return;
      const imgH = img.getBoundingClientRect().height;
      const winH = win.getBoundingClientRect().height;
      setMaxScroll(Math.max(0, imgH - winH));
    };
    measure();
    window.addEventListener("resize", measure);
    const img = mealKitImgRef.current;
    if (img) img.addEventListener("load", measure);
    return () => {
      window.removeEventListener("resize", measure);
      if (img) img.removeEventListener("load", measure);
    };
  }, []);

  // Track scroll progress through the wrapper section. progress=0
  // when the wrapper's top hits the viewport top; progress=1 when
  // the wrapper has scrolled (wrapper.height - viewport) pixels past.
  useEffect(() => {
    const onScroll = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const wrapperH = wrapper.offsetHeight;
      const vh = window.innerHeight;
      const scrolled = -rect.top;
      const scrollable = Math.max(1, wrapperH - vh);
      const p = Math.max(0, Math.min(1, scrolled / scrollable));
      setProgress(p);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Wrapper height = viewport + extra scroll needed for meal kit
  // reveal. If maxScroll hasn't been measured yet, fall back to a
  // single viewport so the section doesn't pin oddly during first
  // paint.
  const wrapperHeight = maxScroll > 0
    ? `calc(100vh + ${maxScroll}px)`
    : "100vh";

  const labelStyle = {
    color: INK,
    fontSize: "max(14px, calc(var(--u) * 14))",
    letterSpacing: "calc(var(--u) * -0.28)",
    lineHeight: 1.2,
  } as const;

  // Card window sized off viewport height so the full card always fits
  // on screen during the pin, even on widescreen displays with a short
  // viewport (e.g. 1920x800). Width is derived from the design aspect
  // (376:903) so cards keep their original proportions. 75vh leaves
  // room above for the label + tab gap and breathing room above/below.
  const cardWindowSize = {
    height: "75vh",
    width: "calc(75vh * 376 / 903)",
  } as const;

  return (
    <section
      ref={wrapperRef}
      className="relative"
      style={{
        // Periwinkle to match the AlaCarteIntro above; the two sections
        // visually read as a single colored block.
        backgroundColor: PERIWINKLE,
        height: wrapperHeight,
      }}
    >
      <div
        className="flex items-start justify-center"
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          // items-start + paddingTop pulls the cards up toward the
          // subtext above so the section reads as one connected chunk
          // instead of having a big empty middle band.
          paddingTop: "calc(var(--u) * 40)",
          paddingLeft: "var(--side-pad)",
          paddingRight: "var(--side-pad)",
        }}
      >
        <div
          className="flex justify-center items-start"
          style={{ gap: "calc(var(--u) * 60)" }}
        >
          {/* Meal Kits — image scrolls inside fixed-size window */}
          <div
            className="flex flex-col items-center"
            style={{ gap: "calc(var(--u) * 28)" }}
          >
            <span className="font-sans" style={labelStyle}>
              Meal Kits
            </span>
            <div
              ref={windowRef}
              className="shrink-0 relative"
              style={{
                ...cardWindowSize,
                overflow: "hidden",
                // Match the rounded corners on the other two cards.
                // The source PNG has rounded TOP corners baked in
                // (visible at scroll=0), but the BOTTOM shows a
                // middle slice of the long image with straight cuts.
                // Rounding the window itself gives all four corners
                // the same shape regardless of scroll position.
                borderRadius: "24px",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={mealKitImgRef}
                src={PDP_MEAL_KIT_SRC}
                alt="Blue Apron Meal Kits PDP"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  transform: `translateY(${-(progress * maxScroll)}px)`,
                  // No transition on translate — we want it to track
                  // scroll directly without easing-lag.
                  willChange: "transform",
                }}
              />
            </div>
          </div>

          {/* Prepared & Ready Meals — static */}
          <div
            className="flex flex-col items-center"
            style={{ gap: "calc(var(--u) * 28)" }}
          >
            <span className="font-sans" style={labelStyle}>
              Prepared &amp; Ready Meals
            </span>
            <div
              className="shrink-0"
              style={cardWindowSize}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PDP_PNR_SRC}
                alt="Blue Apron Prepared & Ready Meals PDP"
                className="block w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Add-On's — static */}
          <div
            className="flex flex-col items-center"
            style={{ gap: "calc(var(--u) * 28)" }}
          >
            <span className="font-sans" style={labelStyle}>
              Add-On&rsquo;s
            </span>
            <div
              className="shrink-0"
              style={cardWindowSize}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PDP_ADDON_SRC}
                alt="Blue Apron Add-On's PDP"
                className="block w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Row of 4 subscription-flow screenshots, with one offset vertically.
   In Figma, two phones sit on the upper row and two on a slightly
   lower row — we approximate that staggering with items-start and
   per-cell margin offsets. */
function SubscriptionScreensRow() {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useFadeInOnScroll(ref);
  // Staggered top offsets per Figma (rough): screen 1 sits 64px below
  // the canvas top, screen 2 is 343px above (sticks up higher),
  // screen 3 sits at 64px, screen 4 at 64px.
  const OFFSETS = [64, -47, 64, 64];
  return (
    <section
      className="relative"
      style={{
        backgroundColor: BLUEAPRON_BG,
        paddingTop: "calc(var(--u) * 80)",
        paddingBottom: "calc(var(--u) * 80)",
        paddingLeft: "var(--side-pad)",
        paddingRight: "var(--side-pad)",
      }}
    >
      <div
        ref={ref}
        className="flex justify-center items-start"
        style={{ gap: "calc(var(--u) * 32)", ...fadeInStyle(visible) }}
      >
        {SUBSCRIPTION_SCREENS.map((src, i) => (
          <div
            key={src}
            className="shrink-0"
            style={{
              width: "calc(var(--u) * 380)",
              aspectRatio: "380 / 740",
              marginTop: `calc(var(--u) * ${OFFSETS[i]})`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Blue Apron subscription screen ${i + 1}`}
              className="block w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/* "How might we improve the subscription experience?" centered intro. */
function SubscriptionIntro() {
  return (
    <section
      className="relative"
      style={{
        backgroundColor: BLUEAPRON_BG,
        paddingTop: "calc(var(--u) * 80)",
        paddingBottom: "calc(var(--u) * 64)",
        paddingLeft: "var(--side-pad)",
        paddingRight: "var(--side-pad)",
      }}
    >
      <div
        className="mx-auto text-center"
        style={{
          color: INK,
          maxWidth: "calc(var(--u) * 1100)",
          display: "flex",
          flexDirection: "column",
          gap: "calc(var(--u) * 40)",
        }}
      >
        <h2
          className="font-serif"
          style={{
            fontSize: "max(14px, calc(var(--u) * 60))",
            letterSpacing: "calc(var(--u) * -1.2)",
            lineHeight: 1.15,
            margin: 0,
          }}
        >
          How might we improve the subscription experience for Blue
          Apron customers?
        </h2>
        <p
          className="font-sans"
          style={{
            fontSize: "max(14px, calc(var(--u) * 24))",
            letterSpacing: "calc(var(--u) * -0.72)",
            lineHeight: 1.4,
            margin: 0,
            opacity: 0.85,
          }}
        >
          Coming soon: details on the subscription redesign and the
          metrics that moved as a result.
        </p>
      </div>
    </section>
  );
}

/* Large content image — placeholder for the subscription experience
   walkthrough. Matches Figma's 1687x960 image frame at y=6708. */
function SubscriptionContent() {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useFadeInOnScroll(ref);
  return (
    <section
      className="relative"
      style={{
        backgroundColor: BLUEAPRON_BG,
        paddingTop: "calc(var(--u) * 40)",
        paddingBottom: "calc(var(--u) * 160)",
        paddingLeft: "var(--side-pad)",
        paddingRight: "var(--side-pad)",
      }}
    >
      <div
        ref={ref}
        className="mx-auto"
        style={{
          width: "calc(var(--u) * 1687)",
          aspectRatio: "1687 / 960",
          borderRadius: "24px",
          overflow: "hidden",
          ...fadeInStyle(visible),
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${IMG}/subscription-content.webp`}
          alt="Blue Apron subscription experience"
          className="block w-full h-full object-cover"
        />
      </div>
    </section>
  );
}

/* Closing section — food image on left, tagline on right.
   "100+ meals to choose from, no subscription required."
   White bg so it stands out cleanly from the warm beige cream
   used by the SignatureSection footer below. */
function BlueApronClosingSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useFadeInOnScroll(ref);
  return (
    <section
      className="relative"
      style={{
        backgroundColor: "#FFFFFF",
        paddingTop: "calc(var(--u) * 0)",
        paddingBottom: "calc(var(--u) * 0)",
      }}
    >
      <div
        ref={ref}
        className="flex items-center"
        style={{ ...fadeInStyle(visible) }}
      >
        {/* Left: full-bleed food image — exactly 50vw so it matches
            the width of the white tagline box on the right. */}
        <div
          className="shrink-0"
          style={{
            width: "50vw",
            aspectRatio: "966 / 1079",
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${IMG}/BlueApronClosing.webp`}
            alt="Blue Apron meals"
            className="block w-full h-full object-cover"
          />
        </div>

        {/* Right: tagline — left-aligned, with a small body line
            below it. */}
        <div
          className="flex flex-1 items-center justify-center"
          style={{ color: INK, paddingLeft: "calc(var(--u) * 80)", paddingRight: "calc(var(--u) * 80)" }}
        >
          <div style={{ maxWidth: "calc(var(--u) * 1000)" }}>
            <h2
              className="font-serif"
              style={{
                fontSize: "max(14px, calc(var(--u) * 60))",
                letterSpacing: "calc(var(--u) * -1.2)",
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              Blue Apron has delivered over 600 million meals, and helped
              millions of people discover the <em>joy</em> of cooking.
            </h2>
            <p
              className="font-sans"
              style={{
                fontSize: "max(14px, calc(var(--u) * 24))",
                letterSpacing: "calc(var(--u) * -0.72)",
                lineHeight: 1.4,
                margin: 0,
                marginTop: "calc(var(--u) * 40)",
                opacity: 0.85,
              }}
            >
              Additional work available upon request.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroDesktop() {
  return (
    <section
      className="relative text-white overflow-hidden"
      style={{
        backgroundColor: HERO_BG,
        height: "100vh",
      }}
    >
      {/* Full-bleed landing video as the hero background */}
      <video
        src={LANDING_VIDEO}
        autoPlay
        loop
        muted
        playsInline
        // preload="metadata" — only fetch the header (duration,
        // dimensions, first frame) on initial page load instead of
        // aggressively buffering the whole ~10 MB MP4 ahead of
        // playback. Autoplay still kicks in immediately because the
        // browser will load enough bytes to start; this just stops
        // the over-eager background fetch that competed with critical
        // image bytes for bandwidth on slow connections.
        preload="metadata"
        className="absolute inset-0 size-full object-cover"
        style={{ zIndex: 0 }}
      />
      {/* Tint so type stays readable */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 1,
          background:
            "linear-gradient(180deg, rgba(38,3,3,0.35) 0%, rgba(38,3,3,0.0) 30%, rgba(38,3,3,0.55) 100%)",
        }}
        aria-hidden="true"
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

      {/* Blue Apron wordmark — bottom-left aligned, half the previous
          size so it sits as a corner mark over the hero rather than
          a centered banner. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${IMG}/blueapron-logo.png`}
        alt="Blue Apron"
        className="absolute"
        style={{
          left: "calc(var(--u) * 70)",
          bottom: "calc(var(--u) * 60)",
          width: "calc(var(--u) * 360)",
          height: "auto",
          zIndex: 10,
          filter:
            "drop-shadow(0 calc(var(--u) * 4) calc(var(--u) * 30) rgba(0,0,0,0.4))",
        }}
      />
    </section>
  );
}

function IntroDesktop() {
  return (
    <section
      className="relative"
      style={{
        backgroundColor: BLUEAPRON_BG,
        color: INK,
        paddingTop: "calc(var(--u) * 95)",
        paddingBottom: "calc(var(--u) * 92)",
        paddingLeft: "calc(var(--u) * 103)",
        paddingRight: "calc(var(--u) * 103)",
      }}
    >
      <div
        className="flex items-start"
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
            Blue Apron is the country&rsquo;s premiere meal kit service
            with an a-la-carte menu.
          </p>
          <p
            className="font-sans"
            style={{
              fontSize: "max(14px, calc(var(--u) * 24))",
              letterSpacing: "calc(var(--u) * -0.72)",
              lineHeight: 1.4,
              margin: 0,
              maxWidth: "calc(var(--u) * 738)",
              opacity: 0.85,
            }}
          >
            Discover chef-designed meal kits &amp; ready-to-eat meals
            delivered to your doorstep, with no subscription required.
          </p>
        </div>

        {/* Right: meta blocks */}
        <div
          className="flex flex-col"
          style={{
            width: "calc(var(--u) * 600)",
            gap: "calc(var(--u) * 44)",
          }}
        >
          {[
            {
              label: "MY ROLE",
              value:
                "After Wonder acquired Blue Apron in 2024, I was the design lead for bringing Blue Apron onto the Wonder app.",
            },
            { label: "TIMELINE", value: "2024 – 2025" },
            { label: "WEBSITE", value: "blueapron.com" },
          ].map((row) => (
            <MetaRow key={row.label} label={row.label} value={row.value} />
          ))}
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
          opacity: 0.7,
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

/* Generic narrative section: heading + body copy.
   Tone controls text color so the same block can render on either
   the cream main bg ("dark" = ink text) or the dark green carousel
   section ("light" = cream text). */
function NarrativeSection({
  eyebrow,
  heading,
  body,
  align = "center",
  width = 979,
  tone = "dark",
}: {
  eyebrow?: string;
  heading: string;
  body: string;
  align?: "left" | "center";
  width?: number;
  tone?: "dark" | "light";
}) {
  const color = tone === "light" ? "white" : INK;
  return (
    <div
      className="flex flex-col"
      style={{
        marginLeft: "auto",
        marginRight: "auto",
        width: `calc(var(--u) * ${width})`,
        gap: "calc(var(--u) * 32)",
        textAlign: align,
        alignItems: align === "center" ? "center" : "flex-start",
        color,
      }}
    >
      {eyebrow && (
        <span
          className="font-mono uppercase"
          style={{
            fontSize: "max(14px, calc(var(--u) * 18))",
            letterSpacing: "calc(var(--u) * -0.9)",
            opacity: 0.7,
          }}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className="font-serif"
        style={{
          fontSize: "max(14px, calc(var(--u) * 68))",
          letterSpacing: "calc(var(--u) * -1.36)",
          lineHeight: 1.1,
          margin: 0,
        }}
      >
        {heading}
      </h2>
      <p
        className="font-sans"
        style={{
          fontSize: "max(14px, calc(var(--u) * 24))",
          letterSpacing: "calc(var(--u) * -0.72)",
          lineHeight: 1.4,
          margin: 0,
          opacity: 0.85,
        }}
      >
        {body}
      </p>
    </div>
  );
}

/* Row of 5 phone screenshots */
function AppScreensRowDesktop() {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useFadeInOnScroll(ref);
  return (
    <section
      className="relative"
      style={{
        backgroundColor: BLUEAPRON_BG,
        // Phones should sit equidistant between the intro paragraph
        // above and the green "A full taste" section below.
        //   Above the phones = IntroDesktop paddingBottom (92u) + this
        //   paddingTop. Below the phones = this paddingBottom alone.
        // 30 + 92 = 122u above; 122u below. Phones move up ~62u from
        // the previous 92/92 split.
        paddingTop: "calc(var(--u) * 30)",
        paddingBottom: "calc(var(--u) * 122)",
        // Global side padding token so the row breathes off the edges
        // by the same amount as every other section across the site.
        paddingLeft: "var(--side-pad)",
        paddingRight: "var(--side-pad)",
      }}
    >
      <div
        ref={ref}
        className="flex justify-center"
        style={{
          gap: "calc(var(--u) * 8)",
          ...fadeInStyle(visible),
        }}
      >
        {APP_SCREENS.map((src, i) => (
          <div
            key={src}
            className="shrink-0"
            style={{
              // Phone width chosen so 5 phones + 4 gaps fit within
              // the section content width (1920 - 2*96 = 1728u) with
              // a small natural margin distributed by justify-center.
              //   5*340 + 4*8 = 1732u (slightly wider than 1728u, the
              //   leftover is absorbed by the flex sizing — the actual
              //   per-phone width caps at 1728/5 = ~345u in practice).
              width: "calc(var(--u) * 340)",
              aspectRatio: "1152 / 2169",
              borderRadius: "24px",
              overflow: "hidden",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Blue Apron app screen ${i + 1}`}
              className="size-full object-contain"
              style={{
                display: "block",
                objectPosition: "center bottom",
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function FullTasteSection() {
  return (
    <section
      className="relative flex justify-center"
      style={{
        backgroundColor: TASTE_GREEN,
        paddingTop: "calc(var(--u) * 120)",
        paddingBottom: "calc(var(--u) * 80)",
      }}
    >
      <NarrativeSection
        heading="A full taste of Blue Apron"
        body="We chose to lead with each restaurant's unique brand identity, while allowing the customer to get all the relevant context they need to place an order: cuisine, price range, and delivery ETA."
        tone="light"
      />
    </section>
  );
}

/* Full-bleed restaurant brand cards — auto-scrolling horizontal
   marquee. The 9 card images render twice in a single flex row;
   a CSS keyframe translates the row by -50%, which lands the
   start of the second copy exactly where the first started, so
   the loop is seamless. */
const RESTAURANT_CAROUSEL = Array.from(
  { length: 9 },
  (_, i) => `${IMG}/RestaurantCarousel-${i + 1}.webp`,
);

function RestaurantCardsRow() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        backgroundColor: TASTE_GREEN,
        paddingBottom: "calc(var(--u) * 80)",
      }}
      aria-label="Restaurant brand cards"
    >
      <div
        className="flex animate-marquee"
        style={{
          width: "max-content",
          // Override the default 32s to give the carousel a calmer
          // ambient pace — 9 cards is a longer set than the home
          // services marquee, so the same duration would scroll fast.
          animationDuration: "60s",
        }}
      >
        {[0, 1].map((setIdx) =>
          RESTAURANT_CAROUSEL.map((src, i) => (
            <div
              key={`${setIdx}-${i}`}
              className="shrink-0"
              style={{
                width: "calc(var(--u) * 400)",
                paddingRight: "calc(var(--u) * 16)",
              }}
              aria-hidden={setIdx === 1}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={setIdx === 0 ? `Blue Apron restaurant ${i + 1}` : ""}
                className="w-full h-auto"
                style={{
                  display: "block",
                  borderRadius: "24px",
                }}
                draggable={false}
              />
            </div>
          )),
        )}
      </div>
    </section>
  );
}

function PostPurchaseSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useFadeInOnScroll(ref);
  return (
    <section
      className="relative"
      style={{
        backgroundColor: BLUEAPRON_BG,
        paddingTop: "calc(var(--u) * 160)",
        paddingBottom: "calc(var(--u) * 104)",
      }}
    >
      <div
        className="flex items-start"
        style={{
          paddingLeft: "calc(var(--u) * 111)",
          paddingRight: "calc(var(--u) * 111)",
          gap: "calc(var(--u) * 109)",
        }}
      >
        <div
          className="flex flex-col"
          style={{
            color: INK,
            width: "calc(var(--u) * 653)",
            gap: "calc(var(--u) * 32)",
          }}
        >
          <h2
            className="font-serif"
            style={{
              fontSize: "max(14px, calc(var(--u) * 68))",
              letterSpacing: "calc(var(--u) * -1.36)",
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Post Purchase Optimizations
          </h2>
          <p
            className="font-sans"
            style={{
              fontSize: "max(14px, calc(var(--u) * 24))",
              letterSpacing: "calc(var(--u) * -0.72)",
              lineHeight: 1.4,
              margin: 0,
              opacity: 0.85,
            }}
          >
            Customers frequently entered the wrong address or omitted
            components of their address and did not catch the issue in
            their order confirmation, which resulted in a slew of
            operational issues and late orders.
            <br />
            <br />
            I redesigned the post-purchase experience to reduce ambiguity
            at every order stage. Customer support inbounds dropped by
            nearly half, from 13% to 6%.
          </p>
        </div>

        <div
          ref={ref}
          className="flex flex-col"
          style={{
            gap: "calc(var(--u) * 24)",
            ...fadeInStyle(visible),
          }}
        >
          <div className="flex" style={{ gap: "calc(var(--u) * 16)" }}>
            {ORIGINAL_ORDER_STATES.map(({ label, src }) => (
              <div
                key={label}
                className="relative shrink-0"
                style={{
                  // aspect-ratio matches the source PNGs (624x1350 ->
                  // 208x450) so object-contain renders the full screen
                  // edge-to-edge with no letterboxing. Border-radius is
                  // intentionally omitted: the source PNGs have rounded
                  // screen corners baked in (with transparent pixels
                  // around them), so an extra container radius would
                  // visibly clip the rectangular MANAGE ORDER button at
                  // the bottom.
                  width: "calc(var(--u) * 208)",
                  aspectRatio: "208 / 450",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Original ${label} screen`}
                  className="size-full object-contain"
                  style={{ display: "block" }}
                />
              </div>
            ))}
          </div>
          <span
            className="font-sans"
            style={{
              fontSize: "max(14px, calc(var(--u) * 12))",
              letterSpacing: "calc(var(--u) * -0.24)",
              color: INK,
              opacity: 0.7,
              textAlign: "center",
              width: "100%",
            }}
          >
            Original designs
          </span>
        </div>
      </div>
    </section>
  );
}

/* 4 large iPhone mockups for the redesigned post-purchase flow */
function IphoneRedesignRow() {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useFadeInOnScroll(ref);
  return (
    <section
      className="relative"
      style={{
        backgroundColor: BLUEAPRON_BG,
        paddingTop: "calc(var(--u) * 48)",
        // Tightened from 160 -> 60 to shrink the cream gap between the
        // iPhone redesign row and the Membership section below.
        paddingBottom: "calc(var(--u) * 60)",
        paddingLeft: "calc(var(--u) * 88)",
        paddingRight: "calc(var(--u) * 88)",
      }}
    >
      <div
        ref={ref}
        // justify-content:center lets the explicit `gap` actually
        // control spacing. Previously had space-between, which
        // distributed phones across the full row width and ignored
        // the gap value entirely (gap only acts as a minimum there).
        className="flex items-end justify-center"
        style={{ gap: "calc(var(--u) * 16)", ...fadeInStyle(visible) }}
      >
        {IPHONE_MOCKUPS.map((src, i) => {
          const isVideo = src.endsWith(".mp4");
          return (
            <div
              key={src}
              className="shrink-0 relative"
              style={{
                // Unified cell dimensions across all 4 mockups so the
                // phones align top and bottom regardless of small per-
                // source aspect differences (PP1/2 are 756x1432 ~ 1.894;
                // PP3/4 are 772x1410 ~ 1.826). Cell aspect matches the
                // more-portrait pair; PP3/4 fit via object-contain with
                // a few px of vertical letterbox (rendered as section
                // cream bg, so invisible).
                width: "calc(var(--u) * 412)",
                aspectRatio: "756 / 1432",
              }}
            >
              {isVideo ? (
                <video
                  src={src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  // object-cover scales PP3/4 up to the cell's full
                  // height (matching PP1/2), with ~8u of side cream-bg
                  // padding cropped per side. PP1/2 share the cell's
                  // aspect exactly so cover is a no-op for them.
                  className="block w-full h-full object-cover"
                  aria-label={`Redesigned order state ${i + 1}`}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt={`Redesigned order state ${i + 1}`}
                  className="block w-full h-full object-cover"
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MembershipSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useFadeInOnScroll(ref);
  return (
    <section
      className="relative"
      style={{
        backgroundColor: BLUEAPRON_BG,
        // Tightened from 160 -> 60 to shrink the cream gap above
        // (between the iPhone redesign row and this section).
        paddingTop: "calc(var(--u) * 60)",
        // No bottom padding so the yellow Membership image sits flush
        // against the next section (the green Web Ordering bg) without
        // a cream strip between them.
        paddingBottom: 0,
      }}
    >
      {/* Full-bleed composited image with text overlaid on the empty
          yellow area on the right of the image. */}
      <div ref={ref} className="relative" style={fadeInStyle(visible)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${IMG}/Membership.webp`}
          alt="Blue Apron Premium membership phone screens"
          className="w-full h-auto"
          style={{ display: "block" }}
        />

        {/* Right-side overlay: Blue Apron Premium logo + heading + body. Text
            color is ink so it reads on the image's yellow backdrop. */}
        <div
          className="absolute flex flex-col"
          style={{
            top: "50%",
            right: "calc(var(--u) * 120)",
            transform: "translateY(-50%)",
            width: "calc(var(--u) * 500)",
            gap: "calc(var(--u) * 28)",
            color: "var(--color-ink)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${IMG}/blueapron-premium-logo.svg`}
            alt="Blue Apron Premium logo"
            style={{
              width: "calc(var(--u) * 320)",
              height: "auto",
            }}
          />
          <h2
            className="font-serif"
            style={{
              fontSize: "max(14px, calc(var(--u) * 60))",
              letterSpacing: "calc(var(--u) * -1.2)",
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Membership Program
          </h2>
          <p
            className="font-sans"
            style={{
              fontSize: "max(14px, calc(var(--u) * 24))",
              letterSpacing: "calc(var(--u) * -0.72)",
              lineHeight: 1.4,
              margin: 0,
            }}
          >
            Our membership program launched in 2023, aimed at increasing
            customer loyalty and order frequency. I designed the
            end-to-end experience and partnered with our Creative team to
            craft the visual identity. Within the first 6 months of
            launch, Blue Apron Premium generated over ~$250K in weekly ARR.
          </p>
        </div>
      </div>
    </section>
  );
}

function WebOrderingSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useFadeInOnScroll(ref);
  return (
    <section
      className="relative"
      style={{
        // Dark green section (matches the "A full taste of Blue Apron"
        // carousel section). paddingBottom is 0 so the laptop mockup
        // sits flush with the bottom edge of the section.
        backgroundColor: TASTE_GREEN,
        paddingTop: "calc(var(--u) * 120)",
        paddingBottom: 0,
      }}
    >
      <NarrativeSection
        tone="light"
        heading="Web Ordering"
        body="I designed our web ordering site in under 2 months to drive new user acquisition, and allow users to try Blue Apron without the friction of downloading the app. Our web ordering platform now accounts for 70% of new customer orders."
        width={861}
      />

      {/* Laptop mockup — bottom-anchored to the section bottom edge. */}
      <div
        ref={ref}
        className="mx-auto"
        style={{
          marginTop: "calc(var(--u) * 96)",
          width: "calc(var(--u) * 1280)",
          ...fadeInStyle(visible),
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${IMG}/WebOrdering.webp`}
          alt="Blue Apron recipe browser"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
          }}
        />
      </div>
    </section>
  );
}

function ClosingSection() {
  return (
    <section
      className="relative"
      style={{
        backgroundColor: BLUEAPRON_BG,
        // Symmetric vertical cream around the closing paragraph:
        // 160u above (between green Web Ordering and text) and
        // 160u below (this 80u + CoverSection's 80u top = 160u total
        // from text bottom to the closing food image).
        paddingTop: "calc(var(--u) * 160)",
        paddingBottom: "calc(var(--u) * 80)",
      }}
    >
      <p
        className="font-serif text-center"
        style={{
          color: INK,
          // marginTop/Bottom kept at 0 explicitly; left/right are auto
          // so the maxWidth block actually centers within the section.
          // Previous bug: `margin: 0` (shorthand) was last in the style
          // object and clobbered the auto margins above it.
          marginTop: 0,
          marginBottom: 0,
          marginLeft: "auto",
          marginRight: "auto",
          // Widened to ~1700u so the full sentence breaks naturally
          // into 2 lines at 44px instead of wrapping into 3 lines at
          // typical desktop viewports (1440–1920 wide).
          maxWidth: "calc(var(--u) * 1700)",
          fontSize: "max(14px, calc(var(--u) * 44))",
          letterSpacing: "calc(var(--u) * -0.88)",
          lineHeight: 1.25,
        }}
      >
        From 2024&ndash;2025, I was 1 of 2 product designers, and touched
        almost every screen of the entire product suite. To see more of
        my work, check out{" "}
        <a
          href="https://blueapron.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:opacity-70 transition-opacity"
        >
          blueapron.com
        </a>{" "}
        or download the Blue Apron app.
      </p>
    </section>
  );
}

function CoverSection() {
  const ref = useRef<HTMLImageElement | null>(null);
  const visible = useFadeInOnScroll(ref);
  return (
    <section
      className="relative overflow-hidden"
      style={{
        backgroundColor: BLUEAPRON_BG,
        // 80u above the food image, paired with ClosingSection's
        // 80u below the text, totals 160u — matching the 160u cream
        // above the closing paragraph for a visually symmetric gap.
        paddingTop: "calc(var(--u) * 80)",
        paddingBottom: "calc(var(--u) * 80)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={ref}
        src={`${IMG}/blueapron-closingimage.webp`}
        alt=""
        aria-hidden="true"
        className="w-full"
        style={{ height: "auto", display: "block", ...fadeInStyle(visible) }}
      />
    </section>
  );
}

function OtherCaseStudies() {
  const others = HERO_PROJECTS.slice(1);
  return (
    <section
      className="relative"
      style={{
        backgroundColor: BLUEAPRON_BG,
        paddingTop: "calc(var(--u) * 134)",
        paddingBottom: "calc(var(--u) * 144)",
        paddingLeft: "calc(var(--u) * 208)",
        paddingRight: "calc(var(--u) * 208)",
      }}
    >
      <h2
        className="font-serif text-center"
        style={{
          color: INK,
          fontSize: "max(14px, calc(var(--u) * 68))",
          letterSpacing: "calc(var(--u) * -1.36)",
          lineHeight: 1.1,
          margin: 0,
          marginBottom: "calc(var(--u) * 64)",
        }}
      >
        Other case studies
      </h2>

      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "calc(var(--u) * 40)",
        }}
      >
        {others.map((p) => {
          const slug = p.name.toLowerCase().replace(/\s+/g, "-");
          return (
            <Link
              key={p.name}
              href={`/work/${slug}`}
              className="flex flex-col group"
              style={{ color: INK, gap: "calc(var(--u) * 24)" }}
            >
              <div
                className="relative overflow-hidden"
                style={{
                  aspectRatio: "475 / 647",
                  borderRadius: "24px",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={`${p.name} cover`}
                  className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <div
                className="flex items-center"
                style={{ gap: "calc(var(--u) * 24)" }}
              >
                <span
                  className="font-serif whitespace-nowrap"
                  style={{
                    fontSize: "max(14px, calc(var(--u) * 48))",
                    letterSpacing: "calc(var(--u) * -0.96)",
                    lineHeight: 1.1,
                  }}
                >
                  {p.name}
                </span>
                <span
                  className="flex-1 self-center"
                  style={{
                    height: "1px",
                    backgroundColor: "rgba(255,255,255,0.5)",
                  }}
                  aria-hidden="true"
                />
                <span
                  className="font-mono text-right"
                  style={{
                    fontSize: "max(14px, calc(var(--u) * 18))",
                    letterSpacing: "calc(var(--u) * -0.9)",
                    lineHeight: 1.1,
                  }}
                >
                  {p.years}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────────────────────────
   MOBILE
   ─────────────────────────────────────────────────────────────── */

/**
 * MobilePdpScrollPin — vertical scroll-pin for one PDP card. The card
 * pins to the viewport top when scrolled into view; the PDP image
 * translates upward as the user keeps scrolling, revealing the full
 * length of the PDP screen; once the bottom of the image reaches the
 * window's bottom, the pin releases and the page continues into the
 * next section. Mirrors the desktop PdpCardsRow's pinned-Meal-Kit
 * behavior but applied per PDP since mobile shows them one at a time.
 *
 * The wrapper height = 100vh + (imageHeight − windowHeight) so the
 * user has to scroll exactly that distance through the section's pin
 * before it releases — matches the px-for-px translate behavior.
 */
function MobilePdpScrollPin({
  label,
  src,
}: {
  label: string;
  src: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const sticky = stickyRef.current;
    const win = windowRef.current;
    const img = imgRef.current;
    if (!wrapper || !sticky || !win || !img) return;

    let scrollDistance = 0;

    const measure = () => {
      const imgH = img.getBoundingClientRect().height;
      const winH = win.getBoundingClientRect().height;
      const distance = Math.max(0, imgH - winH);
      scrollDistance = distance;
      // Wrapper height = sticky stage's natural height + horizontal
      // overflow. Previously this used a hardcoded `100vh + distance`,
      // which meant the shorter PDPs (Prepared & Ready, Add-On) had
      // a 100vh stage with the mock floating in the upper portion —
      // the empty cream below the mock inside the stage made the gap
      // before the next PDP read as visibly larger than between Meal
      // Kit and Prepared & Ready. Reading the actual stage height
      // means the wrapper is just the natural content + scroll budget
      // (zero for the shorter PDPs), so the cream gap between mocks
      // is the same 40u-m periwinkle spacer in every position.
      const stageH = sticky.offsetHeight;
      wrapper.style.height = `${stageH + distance}px`;
    };

    measure();
    if (!img.complete) img.onload = measure;

    const ro = new ResizeObserver(measure);
    ro.observe(img);
    ro.observe(win);
    ro.observe(sticky);
    window.addEventListener("resize", measure);

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = wrapper.getBoundingClientRect();
        const scrolled = Math.max(
          0,
          Math.min(scrollDistance, -rect.top),
        );
        img.style.transform = `translate3d(0, ${-scrolled}px, 0)`;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <div ref={stickyRef} className="sticky top-0 overflow-hidden">
        <div
          className="flex flex-col items-center"
          style={{
            paddingLeft: "calc(var(--u-m) * 16)",
            paddingRight: "calc(var(--u-m) * 16)",
            paddingTop: "calc(var(--u-m) * 12)",
            paddingBottom: "calc(var(--u-m) * 12)",
            gap: "calc(var(--u-m) * 8)",
          }}
        >
          {/* Label sits ABOVE the mock, centered to it. */}
          <span
            className="font-sans text-center"
            style={{
              fontSize: "max(12px, calc(var(--u-m) * 12))",
              letterSpacing: "calc(var(--u-m) * -0.36)",
              opacity: 0.75,
              flexShrink: 0,
              width: "calc(var(--u-m) * 240)",
            }}
          >
            {label}
          </span>
          {/* Mock window — fixed width (240u), max-height capped at
              (100vh − ~50u of chrome above/below) but auto-sized to
              the image's natural height when shorter. Meal Kit's
              image is taller than the cap → window clips at cap and
              MobilePdpScrollPin scroll-pins through the excess.
              Prepared & Ready / Add-On images are shorter than the
              cap → window shrinks to match, so the sticky stage has
              no empty cream below the image and the 40u-m gap before
              the next PDP reads identically between every pair. */}
          <div
            ref={windowRef}
            className="overflow-hidden"
            style={{
              width: "calc(var(--u-m) * 240)",
              maxHeight: "calc(100vh - var(--u-m) * 50)",
              borderRadius: "24px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={src}
              alt={`${label} PDP`}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                willChange: "transform",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function BlueApronMobile() {
  return (
    <main
      className="relative"
      style={{ backgroundColor: BLUEAPRON_BG, color: INK }}
    >
      <MobileTopNav mode="overlay" navClassName="text-white" />

      {/* Hero with landing video */}
      <section
        className="relative overflow-hidden"
        style={{
          height: "calc(var(--u-m) * 600)",
        }}
      >
        <video
          src={LANDING_VIDEO}
          autoPlay
          loop
          muted
          playsInline
          // preload="metadata" — see the desktop landing video above
          // for the rationale. Same trick on mobile, where Slow 4G
          // makes the over-eager full-video fetch especially painful.
          preload="metadata"
          className="absolute inset-0 size-full object-cover"
          style={{ zIndex: 0 }}
        />
        <div
          className="absolute inset-0"
          style={{
            zIndex: 1,
            background:
              "linear-gradient(180deg, rgba(38,3,3,0.35) 0%, rgba(38,3,3,0) 30%, rgba(38,3,3,0.6) 100%)",
          }}
          aria-hidden="true"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${IMG}/blueapron-logo.png`}
          alt="Blue Apron"
          className="absolute"
          style={{
            left: "calc(var(--u-m) * 16)",
            bottom: "calc(var(--u-m) * 32)",
            width: "calc(var(--u-m) * 140)",
            height: "auto",
            zIndex: 10,
          }}
        />
      </section>

      {/* Intro */}
      <section
        className="flex flex-col"
        style={{
          paddingLeft: "calc(var(--u-m) * 16)",
          paddingRight: "calc(var(--u-m) * 16)",
          paddingTop: "calc(var(--u-m) * 48)",
          paddingBottom: "calc(var(--u-m) * 24)",
          gap: "calc(var(--u-m) * 24)",
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
          Blue Apron is the destination for every craving. Get the best
          restaurants from across the country, all in one order.
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
          Try menus from world-famous chefs like Bobby Flay &amp; Jose
          Andres, and mix &amp; match multiple restaurants in one
          delivery. Blue Apron now has over 100+ locations across 11 states.
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
          paddingLeft: "calc(var(--u-m) * 16)",
          paddingRight: "calc(var(--u-m) * 16)",
          paddingTop: "calc(var(--u-m) * 24)",
          // No bottom padding — AlaCarte row below provides 44u-m of
          // top padding via MobileHorizontalPin, so the gap between
          // "blueapron.com" and the first phone is exactly 44u-m.
          paddingBottom: 0,
          gap: "calc(var(--u-m) * 32)",
        }}
      >
        {[
          {
            label: "MY ROLE",
            value:
              "2nd design hire on the consumer team. Design lead for app onboarding, browse & post purchase experiences, Blue Apron Premium membership program, web ordering, and more.",
          },
          { label: "TIMELINE", value: "2021 – 2024" },
          { label: "WEBSITE", value: "blueapron.com" },
        ].map((row) => (
          <div
            key={row.label}
            className="flex flex-col"
            style={{ gap: "calc(var(--u-m) * 8)" }}
          >
            <span
              className="font-mono uppercase"
              style={{
                fontSize: "max(12px, calc(var(--u-m) * 11))",
                letterSpacing: "calc(var(--u-m) * -0.55)",
                opacity: 0.7,
              }}
            >
              {row.label}
            </span>
            <span
              className="font-sans"
              style={{
                fontSize: "max(12px, calc(var(--u-m) * 14))",
                letterSpacing: "calc(var(--u-m) * -0.42)",
                lineHeight: 1.5,
              }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </section>

      {/* A la carte phone screens — 4 BlueApron1–4 phone mocks. Pinned
          horizontal scroll: as the user scrolls down, the row stays
          centered in the viewport and slides left to reveal each phone
          before the pin releases. */}
      <MobileHorizontalPin>
        {ALACARTE_SCREENS.map((src, i) => (
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
              alt={`Blue Apron a la carte screen ${i + 1}`}
              className="block w-full h-full object-cover"
            />
          </div>
        ))}
      </MobileHorizontalPin>

      {/* A la carte intro — periwinkle band with the "During my time at
          Blue Apron..." headline + body. Mirrors desktop's
          AlaCarteIntro. */}
      <section
        className="flex flex-col text-center"
        style={{
          backgroundColor: PERIWINKLE,
          paddingLeft: "calc(var(--u-m) * 16)",
          paddingRight: "calc(var(--u-m) * 16)",
          paddingTop: "calc(var(--u-m) * 64)",
          paddingBottom: "calc(var(--u-m) * 24)",
          gap: "calc(var(--u-m) * 20)",
        }}
      >
        <h2
          className="font-serif"
          style={{
            fontSize: "max(12px, calc(var(--u-m) * 32))",
            letterSpacing: "calc(var(--u-m) * -0.64)",
            lineHeight: 1.15,
            margin: 0,
          }}
        >
          During my time at Blue Apron, I helped to launch their
          a-la-carte menu with 100+ different menu items.
        </h2>
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
          I created 3 different versions of the PDPs to highlight the
          preparation of each menu type.
        </p>
      </section>

      {/* PDP cards — 3 cards (Meal Kit / Prepared & Ready / Add-On)
          each pinned VERTICALLY so the user scrolls through one full
          PDP image before moving to the next. Mirrors the desktop
          PdpCardsRow's scroll-pinned Meal Kit reveal behavior, but
          applied per PDP since mobile shows one at a time instead of
          three side-by-side.

          paddingBottom: 64u extends the periwinkle band past the
          Add-On mock so the bottom of the section reads symmetric
          with the AlaCarteIntro's 64u paddingTop above the heading —
          equal periwinkle breathing room top and bottom of the
          combined intro+PDP block. */}
      <div
        style={{
          backgroundColor: PERIWINKLE,
          paddingBottom: "calc(var(--u-m) * 64)",
        }}
      >
        {[
          { label: "Meal Kit", src: PDP_MEAL_KIT_SRC },
          { label: "Prepared & Ready", src: PDP_PNR_SRC },
          { label: "Add-On", src: PDP_ADDON_SRC },
        ].map((pdp, i, arr) => (
          <div key={pdp.label}>
            <MobilePdpScrollPin label={pdp.label} src={pdp.src} />
            {/* 40u-m periwinkle gap between PDP cards — enough to
                signal a visual break between scroll-pinned mocks
                without dominating the vertical rhythm. Skipped after
                the last card so the outer wrapper's paddingBottom
                (64u-m) doesn't stack on top. */}
            {i < arr.length - 1 && (
              <div
                aria-hidden="true"
                style={{ height: "calc(var(--u-m) * 40)" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Funnel from a-la-carte to subscription — heading + body +
          horizontal scroller of the 5 SubscriptionMock phones.
          Mirrors desktop's FunnelSection. */}
      <section
        className="flex flex-col"
        style={{
          paddingTop: "calc(var(--u-m) * 64)",
          paddingBottom: "calc(var(--u-m) * 64)",
          gap: "calc(var(--u-m) * 16)",
        }}
      >
        <h2
          className="font-serif"
          style={{
            fontSize: "max(12px, calc(var(--u-m) * 32))",
            letterSpacing: "calc(var(--u-m) * -0.64)",
            lineHeight: 1.15,
            margin: 0,
            paddingLeft: "calc(var(--u-m) * 16)",
            paddingRight: "calc(var(--u-m) * 16)",
          }}
        >
          The funnel from a-la-carte to subscription
        </h2>
        <p
          className="font-sans"
          style={{
            fontSize: "max(12px, calc(var(--u-m) * 14))",
            letterSpacing: "calc(var(--u-m) * -0.42)",
            lineHeight: 1.4,
            margin: 0,
            opacity: 0.85,
            paddingLeft: "calc(var(--u-m) * 16)",
            paddingRight: "calc(var(--u-m) * 16)",
          }}
        >
          Based on user testing data, we knew that highlighting price
          savings would be the most important conversion and retention
          tactic. We focused on the value of the subscription throughout
          the entire user journey.
        </p>
        <div style={{ marginTop: "calc(var(--u-m) * 16)" }}>
          <MobileHorizontalPin>
            {FUNNEL_PHONES.map((src, i) => (
              <div
                key={src}
                className="shrink-0"
                style={{
                  width: "calc(var(--u-m) * 220)",
                  // Mock 3 (index 2) has the border/radius baked into
                  // its PNG; the others get a soft outline + radius
                  // applied here to match desktop's per-mock treatment.
                  ...(i === 2
                    ? {}
                    : {
                        borderRadius: "24px",
                        border: "1px solid rgba(0,0,0,0.08)",
                        overflow: "hidden",
                      }),
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Subscription funnel mock ${i + 1}`}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                  }}
                />
              </div>
            ))}
          </MobileHorizontalPin>
        </div>
      </section>

      {/* Closing — "Blue Apron has delivered over 600 million meals..."
          tagline stacked above the closing food image. Mirrors
          desktop's BlueApronClosingSection but in a vertical layout
          for the narrower mobile viewport. */}
      <section
        className="flex flex-col"
        style={{
          backgroundColor: "#FFFFFF",
          color: INK,
          // No horizontal padding on the section itself — the food
          // image sits flush at the top edge-to-edge. The text block
          // below it has its own 16u-m horizontal padding so the
          // copy stays in the standard content rail.
          paddingTop: 0,
          paddingBottom: "calc(var(--u-m) * 48)",
        }}
      >
        {/* Full-bleed food image — first thing the user sees in the
            closing section. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${IMG}/BlueApronClosing.webp`}
          alt="Blue Apron meals"
          style={{ width: "100%", height: "auto", display: "block" }}
        />

        {/* Closing copy block — heading + tagline sit below the
            image with the standard 16u-m horizontal rail and a
            generous 48u-m top gap before the heading so the image
            handoff breathes. */}
        <div
          className="flex flex-col"
          style={{
            paddingLeft: "calc(var(--u-m) * 16)",
            paddingRight: "calc(var(--u-m) * 16)",
            paddingTop: "calc(var(--u-m) * 48)",
            gap: "calc(var(--u-m) * 24)",
          }}
        >
          <h2
            className="font-serif"
            style={{
              fontSize: "max(12px, calc(var(--u-m) * 32))",
              letterSpacing: "calc(var(--u-m) * -0.64)",
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            Blue Apron has delivered over 600 million meals, and helped
            millions of people discover the <em>joy</em> of cooking.
          </h2>
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
            Additional work available upon request.
          </p>
        </div>
      </section>

      <MobileSignature />
    </main>
  );
}
