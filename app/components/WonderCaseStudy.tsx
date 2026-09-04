"use client";

import {
  CSSProperties,
  type ReactNode,
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
 * WonderCaseStudy — Figma node 556:2943.
 *
 * Sections (top to bottom):
 *   1. Hero — full-bleed Wonder landing video + giant "WONDER" wordmark
 *   2. Intro — tagline + role/timeline/website meta
 *   3. App screens row — 5 phone screenshots
 *   4. "A full taste of Wonder" — restaurant brand cards strip
 *   5. Post Purchase Optimizations — copy + 4 original order-state phones
 *   6. iPhone redesigned order flow — 4 large iPhone mockups
 *   7. Membership program (Wonder+) — 4-up phone grid + logo + copy
 *   8. Web ordering — copy + browser screenshot
 *   9. Closing — paragraph
 *  10. Cover image
 *  11. Other case studies — Blue Apron / Noom / Neuday
 *  12. Signature footer
 *
 * Image assets live in /public/images/wonder/ — fetched via
 * `node scripts/download-wonder-assets.mjs`. The landing video lives
 * at /videos/wonder-landing.mp4.
 */

// Both page surfaces reference design-token CSS vars instead of
// hardcoded hex so the cream/near-black ladder stays consistent with
// every other section on the site. (Prior literals were #FCF7ED and
// #0a0a0a — within 3–7 RGB units of the canonical tokens.)
const WONDER_BG = "var(--color-cream)";  // case study page bg (warm cream)
const HERO_BG = "var(--color-near-black)"; // hero panel under the landing video
const TASTE_GREEN = "#00271A";          // "A full taste of Wonder" + carousel
const WONDER_YELLOW = "#FBE59F";        // Membership section ground (matches Membership-Mobile.png's baked-in yellow)
const INK = "var(--color-ink)";         // dark body text on the cream bg
const IMG = "/images/wonder";
const LANDING_VIDEO = "/videos/wonder-landing.mp4";

// All 5 phones render at their natural size with no CSS scaling.
// Mocks 4 and 5 will look slightly smaller than 1-3 because their
// source images have more padding around the phone body, but
// nothing is ever cropped. To equalize the visual size, the source
// PNGs for Mocks 4 and 5 would need to be re-exported with tighter
// framing (less padding around the phone).
const APP_SCREENS = [
  `${IMG}/WonderPhoneMock1.webp`,
  `${IMG}/WonderPhoneMock2.webp`,
  `${IMG}/WonderPhoneMock3.webp`,
  `${IMG}/WonderPhoneMock4.webp`,
  `${IMG}/WonderPhoneMock5.webp`,
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

export default function WonderCaseStudy() {
  const isMobile = useIsMobile();
  return isMobile ? <WonderMobile /> : <WonderDesktop />;
}

/* ───────────────────────────────────────────────────────────────
   DESKTOP
   ─────────────────────────────────────────────────────────────── */

function WonderDesktop() {
  return (
    <main className="relative" style={{ backgroundColor: WONDER_BG }}>
      <HeroDesktop />
      <IntroDesktop />
      <AppScreensRowDesktop />
      <FullTasteSection />
      <RestaurantCardsRow />
      <PostPurchaseSection />
      <IphoneRedesignRow />
      <MembershipSection />
      <WebOrderingSection />
      <MobileWebSection />
      <ClosingSection />
      <SignatureSection />
    </main>
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
        // aggressively buffering the whole ~12 MB MP4 ahead of
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

      {/* Wonder wordmark — bottom-left aligned, half the previous
          size so it sits as a corner mark over the hero rather than
          a centered banner. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${IMG}/wonder-logo.png`}
        alt="Wonder"
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
        backgroundColor: WONDER_BG,
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
            Wonder is the destination for every craving. Get the best
            restaurants from across the country, all in one order.
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
            Try menus from world-famous chefs like Bobby Flay &amp; Jose
            Andres, and mix &amp; match multiple restaurants in one delivery.
            Wonder now has over 100+ locations across 11 states.
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
                "2nd design hire on the consumer team. Design lead for app onboarding, browse & post purchase experiences, Wonder+ membership program, web ordering, and more.",
            },
            { label: "TIMELINE", value: "2021 – 2024" },
            { label: "WEBSITE", value: "wonder.com" },
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
  // ReactNode (not string) so callers can pass JSX with <br /> for
  // multi-paragraph copy, e.g. the Web Ordering body splits a stat
  // callout onto its own line.
  body: ReactNode;
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
        backgroundColor: WONDER_BG,
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
              alt={`Wonder app screen ${i + 1}`}
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
        heading="A full taste of Wonder"
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
                alt={setIdx === 0 ? `Wonder restaurant ${i + 1}` : ""}
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
        backgroundColor: WONDER_BG,
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
              fontSize: "max(14px, calc(var(--u) * 14))",
              letterSpacing: "calc(var(--u) * -0.28)",
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
        backgroundColor: WONDER_BG,
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
        backgroundColor: WONDER_BG,
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
          alt="Wonder+ membership phone screens"
          className="w-full h-auto"
          style={{ display: "block" }}
        />

        {/* Right-side overlay: Wonder+ logo + heading + body. Text
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
            src={`${IMG}/wonder-plus-logo.svg`}
            alt="Wonder+ logo"
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
            craft the visual identity.
            <br />
            <br />
            Within the first 6 months of launch, Wonder+ generated
            over ~$250K in weekly ARR.
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
        // Warm cream section (matches the case study page bg). The
        // laptop mockup floats centered between the body copy above
        // and the section bottom, with matching 48u gaps on either
        // side so the cream frame reads as a single balanced panel.
        backgroundColor: WONDER_BG,
        paddingTop: "calc(var(--u) * 120)",
        paddingBottom: "calc(var(--u) * 48)",
      }}
    >
      <NarrativeSection
        tone="dark"
        heading="Web Ordering"
        body={
          <>
            I designed our web ordering site in under 2 months to
            drive new user acquisition, and allow users to try
            Wonder without the friction of downloading the app.
            <br />
            <br />
            Our web ordering platform now accounts for 70% of new
            customer orders.
          </>
        }
        width={861}
      />

      {/* Laptop mockup — floats centered with equal 48u gaps above
          (text → image) and below (image → section bottom). */}
      <div
        ref={ref}
        className="mx-auto"
        style={{
          marginTop: "calc(var(--u) * 48)",
          width: "calc(var(--u) * 1280)",
          ...fadeInStyle(visible),
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${IMG}/WebOrdering.png`}
          alt="Wonder web ordering"
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

/* ───────────────────────────────────────────────────────────────
   Mobile Web — companion section to Web Ordering. Cream WONDER_BG
   ground (deliberately distinct from the green Web Ordering panel
   above so the reader feels a chapter break). Left column carries
   the "Mobile Web" heading and the two stat paragraphs; right side
   scatters 6 phone mockups across 3 loose columns × 2 rows with the
   center column phone sitting between the top and bottom rows for
   a triangle/zigzag feel that matches the reference screenshot.
   All assets live in /public/images/wonder/Web Ordering/.
   ─────────────────────────────────────────────────────────────── */

// Phone positions (x, y) inside the 1700u-wide stage. Three strict
// columns at x=665 / 1005 / 1345 (60u horizontal gaps between
// columns, 280u phone width). The cluster is centered in the space
// between the text column's right edge (inner-div x=480) and the
// viewport's right edge (inner-div x=1810 after accounting for the
// section's 110u side padding) — gives ~185u of cream breathing
// room on both sides of the cluster.
//
//   col 1 (x=665):  phone 1 (top) + 2 (bottom)
//   col 2 (x=1005): phone 3 (peeks above) + 4 (mid) + 5 (peeks below)
//   col 3 (x=1345): phone 6 (top) + 7 (bottom)
//
// Vertical gaps within each column:
//   col 1 / col 3: 75u between the two phones (matching reference)
//   col 2: 30u between phones — tighter so all three fit without
//          overlap, while 3.png still peeks above (~50u) and 5.png
//          still peeks below (~170u visible after stage clip).
// Mobile Web phone columns — each column is a vertical strip that
// runs an infinite upward marquee on hover. When paused (default),
// the visible phones in each column align with their static y
// positions. When hovered, phones scroll upward continuously; ones
// that exit the top wrap around from the bottom because each strip
// contains two duplicated sets of phones and animates by exactly
// -50% (= one set's height).
//
// startY is where the column's first phone sits when the marquee is
// at 0%. Matches the prior static layout so the paused state looks
// identical to before.
//
// gap is the vertical gap between phones inside the strip. Same as
// the prior layout's y deltas (phone height 565 + gap = y delta).
//
// duration tunes per-column animation length so phones in all
// columns appear to move at roughly the same speed regardless of
// how many phones the column has.
const MOBILE_WEB_COLUMNS: Array<{
  x: number;
  startY: number;
  phones: string[];
  gap: number;
  duration: number;
  /** Distance the strip translates per loop, in design units.
   *  Computed as `phones.length × (phoneHeight + gap)`, where
   *  phoneHeight = 565u for these mockups. The strip contains
   *  TWO duplicate sets, so the cycle distance equals one set's
   *  height — translating by this much brings set B exactly into
   *  set A's slot. */
  cycle: number;
}> = [
  // Column 1 — 2 phones, sit aligned with column 3
  // cycle = 2 × (565 + 75) = 1280
  { x: 665, startY: -150, phones: ["1.png", "2.png"], gap: 75, duration: 60, cycle: 1280 },
  // Column 2 — 3 phones, peeks above + below; longer strip → longer
  // duration so per-phone perceived speed matches columns 1 and 3
  // (cycle 1785u vs 1280u → 1.39× longer → 84s vs 60s).
  // cycle = 3 × (565 + 30) = 1785
  { x: 1005, startY: -375, phones: ["3.png", "4.png", "5.png"], gap: 30, duration: 84, cycle: 1785 },
  // Column 3 — 2 phones, mirrors column 1
  { x: 1345, startY: -150, phones: ["6.png", "7.png"], gap: 75, duration: 60, cycle: 1280 },
];

const MOBILE_WEB_PHONE_W = 280;

function MobileWebSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useFadeInOnScroll(ref);
  return (
    <section
      className="relative overflow-hidden"
      style={{
        backgroundColor: TASTE_GREEN,
        // No paddingTop so the top-row phones with negative y values
        // get clipped by the section's overflow:hidden — that's what
        // produces the partial-cut effect visible in the reference.
        // No paddingBottom either, so column 2's clipped phone 5
        // touches the next section (ClosingSection's food image)
        // with no green gap between.
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: "calc(var(--u) * 110)",
        paddingRight: "calc(var(--u) * 110)",
      }}
    >
      <div
        ref={ref}
        className="relative mx-auto overflow-hidden"
        style={{
          width: "calc(var(--u) * 1700)",
          // Cap stage at the smaller of the design-unit target
          // (1310u — tall enough to fit column 3's bottom phone) and
          // 100vh (so the entire section always fits in one viewport
          // scroll). At 1920×1080 the 100vh limit kicks in and the
          // bottom-peek-through phones get clipped a bit tighter; at
          // taller aspect ratios the full 1310u stage is used.
          height: "min(calc(var(--u) * 1310), 100vh)",
          ...fadeInStyle(visible),
        }}
      >
        {/* Left column — heading + 2 paragraphs in white on green.
            Anchored ~200u from the top of the stage so the title sits
            comfortably below the top-row phone tops. */}
        <div
          className="absolute text-white"
          style={{
            left: 0,
            top: "calc(var(--u) * 200)",
            width: "calc(var(--u) * 480)",
          }}
        >
          <h2
            className="font-serif"
            style={{
              fontSize: "max(14px, calc(var(--u) * 68))",
              letterSpacing: "calc(var(--u) * -1.36)",
              lineHeight: 1.1,
              margin: 0,
              marginBottom: "calc(var(--u) * 32)",
            }}
          >
            Mobile Web
          </h2>
          <p
            className="font-sans"
            style={{
              fontSize: "max(14px, calc(var(--u) * 24))",
              letterSpacing: "calc(var(--u) * -0.72)",
              lineHeight: 1.4,
              margin: 0,
              marginBottom: "calc(var(--u) * 24)",
              opacity: 0.85,
            }}
          >
            After launch, we found that customers ordered 26% more
            from our app compared to web.
          </p>
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
            We conducted a series of A/B tests to drive users to
            download the app, emphasizing the benefit of receiving
            live updates (i.e. push notifications) for their orders.
          </p>
        </div>

        {/* Right area — 3 phone columns, each rendering as a
            vertical marquee strip. Paused by default so the layout
            is identical to the prior static design; runs on stage
            hover so phones scroll up continuously and wrap from
            bottom-to-top via the duplicated set / -50% trick. */}
        {MOBILE_WEB_COLUMNS.map(({ x, startY, phones, gap, duration, cycle }) => (
          <div
            key={x}
            className="absolute"
            style={{
              left: `calc(var(--u) * ${x})`,
              top: `calc(var(--u) * ${startY})`,
              width: `calc(var(--u) * ${MOBILE_WEB_PHONE_W})`,
            }}
          >
            {/* Marquee strip — duplicated set of phones, each with
                marginBottom = gap. The strip's animation translates
                by `--marquee-cycle` (= one set's height in u units),
                which slides the duplicate set exactly into the
                original's slot for a seamless loop. */}
            <div
              style={
                {
                  animation: `marquee-up ${duration}s linear infinite`,
                  willChange: "transform",
                  ["--marquee-cycle" as string]: `calc(var(--u) * ${cycle})`,
                } as React.CSSProperties
              }
            >
              {[0, 1].map((setIdx) =>
                phones.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={`${setIdx}-${i}`}
                    src={`${IMG}/Web Ordering/${src}`}
                    alt={
                      setIdx === 0
                        ? `Wonder mobile web screen ${i + 1}`
                        : ""
                    }
                    aria-hidden={setIdx === 1 ? "true" : undefined}
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                      marginBottom: `calc(var(--u) * ${gap})`,
                    }}
                    draggable={false}
                  />
                )),
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────────────────────────
   Closing — full-bleed food image with the closing paragraph
   centered in a cream container card overlaid on top of it. Per
   Figma node 806:7953: image is the background, a 1438u-wide
   rounded card holds the text, and the text inside has ~80u of
   inner padding all around. Replaces the previous two-section
   pattern (ClosingSection text panel + CoverSection image panel)
   with a single combined closing.
   ─────────────────────────────────────────────────────────────── */
function ClosingSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useFadeInOnScroll(ref);
  return (
    <section
      className="relative overflow-hidden"
      style={{
        backgroundColor: WONDER_BG,
        // No paddingTop so the food image sits flush against the
        // Mobile Web section above — the user wanted no cream gap
        // between the clipped phone column and the closing image.
        paddingTop: 0,
        paddingBottom: "calc(var(--u) * 80)",
      }}
    >
      <div
        ref={ref}
        className="relative"
        style={fadeInStyle(visible)}
      >
        {/* Background image — full-bleed inside the section. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${IMG}/WonderClosingImage.webp`}
          alt=""
          aria-hidden="true"
          className="w-full"
          style={{
            height: "auto",
            display: "block",
          }}
        />

        {/* Overlaid cream container card holding the closing
            paragraph. Centered in the image both ways. */}
        <div
          className="absolute"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: WONDER_BG,
            // Card shrunk to 1500u so the centered text fills more
            // of the inner area — the previous 1800u width left
            // visible cream on either side of the text even with
            // 80u padding (text-align: center + a too-wide card
            // means leftover space pools on both sides of the
            // text). At 1500u the 80u side padding is the only
            // cream visible between the text and the card edges.
            width: "calc(var(--u) * 1500)",
            // Uniform 80u padding on all four sides — text sits with
            // exactly 80u from the card's inner edge in every
            // direction.
            paddingTop: "calc(var(--u) * 80)",
            paddingBottom: "calc(var(--u) * 80)",
            paddingLeft: "calc(var(--u) * 80)",
            paddingRight: "calc(var(--u) * 80)",
            borderRadius: "24px",
          }}
        >
          <p
            className="font-serif text-center"
            style={{
              color: INK,
              margin: 0,
              fontSize: "max(14px, calc(var(--u) * 36))",
              letterSpacing: "calc(var(--u) * -0.72)",
              lineHeight: 1.25,
            }}
          >
            From 2021&ndash;2024, I was 1 of 2 product designers, and
            touched almost every screen of the entire product suite.
            <br />
            To see more of my work, check out{" "}
            <a
              href="https://wonder.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-70 transition-opacity"
              style={{
                textDecorationThickness: "1px",
                textUnderlineOffset: "6px",
              }}
            >
              wonder.com
            </a>{" "}
            or download the Wonder app.
          </p>
        </div>
      </div>
    </section>
  );
}

function OtherCaseStudies() {
  const others = HERO_PROJECTS.slice(1);
  return (
    <section
      className="relative"
      style={{
        backgroundColor: WONDER_BG,
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

function WonderMobile() {
  return (
    <main
      className="relative"
      style={{ backgroundColor: WONDER_BG, color: INK }}
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
          src={`${IMG}/wonder-logo.png`}
          alt="Wonder"
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
          Wonder is the destination for every craving. Get the best
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
          delivery. Wonder now has over 100+ locations across 11 states.
        </p>
      </section>

      {/* Hairline divider between the description paragraph and the
          MY ROLE/TIMELINE/WEBSITE meta block. Inset 16u-m on both
          sides so it aligns with the text margin, not the full
          viewport edge. Replaces what used to be ~64u-m of empty
          cream space with a clear visual transition. */}
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
          // No bottom padding — the App Screens row below provides
          // its own 44u-m top padding via MobileHorizontalPin, so the
          // gap between "wonder.com" and the first phone is exactly
          // 44u-m. Stacking another 64u-m on top doubled the cream.
          paddingBottom: 0,
          gap: "calc(var(--u-m) * 32)",
        }}
      >
        {[
          {
            label: "MY ROLE",
            value:
              "2nd design hire on the consumer team. Design lead for app onboarding, browse & post purchase experiences, Wonder+ membership program, web ordering, and more.",
          },
          { label: "TIMELINE", value: "2021 – 2024" },
          { label: "WEBSITE", value: "wonder.com" },
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

      {/* App screens — horizontal scroll-pin matching the restaurant
          carousel + Post Purchase + Membership patterns. The pin
          holds the row in the viewport while vertical scroll
          translates it horizontally, so the user reads through each
          phone before the page continues down. Box dimensions match
          the BlueApron / Neuday phone rows (220u-m × ~0.53 aspect)
          for consistent scale across all four case studies. */}
      <section aria-label="Wonder app screens">
        <MobileHorizontalPin>
          {APP_SCREENS.map((src, i) => (
            <div
              key={src}
              className="shrink-0"
              style={{
                width: "min(calc(var(--u-m) * 220), 100%)",
                aspectRatio: "1152 / 2169",
                borderRadius: "24px",
                overflow: "hidden",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Wonder app screen ${i + 1}`}
                className="size-full object-contain"
                style={{
                  display: "block",
                  objectPosition: "center bottom",
                }}
              />
            </div>
          ))}
        </MobileHorizontalPin>
      </section>

      {/* "A full taste of Wonder" gets its own block so the 9-card
          marquee can run instead of a single static strip. Painted
          in the dark green carousel theme with cream text. */}
      <section
        className="flex flex-col"
        style={{
          backgroundColor: TASTE_GREEN,
          color: "white",
          paddingLeft: "calc(var(--u-m) * 16)",
          paddingRight: "calc(var(--u-m) * 16)",
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
          }}
        >
          A full taste of Wonder
        </h2>
        <p
          className="font-sans"
          style={{
            fontSize: "max(12px, calc(var(--u-m) * 14))",
            letterSpacing: "calc(var(--u-m) * -0.42)",
            lineHeight: 1.4,
            margin: 0,
            opacity: 0.85,
            marginBottom: "calc(var(--u-m) * 8)",
          }}
        >
          We chose to lead with each restaurant&rsquo;s unique brand identity,
          while allowing the customer to get all the relevant context they
          need to place an order: cuisine, price range, and delivery ETA.
        </p>
        {/* Auto-scrolling marquee — same animation pattern as the
            desktop RestaurantCardsRow. The cards loop continuously
            at an ambient pace so the section reads as a calmly
            cycling "lineup" of partner brands rather than something
            the user has to actively scrub through. The card list is
            duplicated so the marquee can keyframe to -50% translate
            without a visible seam at loop reset. */}
        <div
          className="overflow-hidden"
          style={{
            marginLeft: "calc(var(--u-m) * -16)",
            marginRight: "calc(var(--u-m) * -16)",
          }}
        >
          <div
            className="flex animate-marquee"
            style={{
              width: "max-content",
              // 60s for 9 cards mirrors the desktop carousel pace so
              // the two surfaces feel like the same loop.
              animationDuration: "60s",
            }}
          >
            {[0, 1].map((setIdx) =>
              RESTAURANT_CAROUSEL.map((src, i) => (
                <div
                  key={`${setIdx}-${i}`}
                  className="shrink-0"
                  style={{
                    width: "calc(var(--u-m) * 280)",
                    paddingRight: "calc(var(--u-m) * 12)",
                  }}
                  aria-hidden={setIdx === 1}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={setIdx === 0 ? `Wonder restaurant ${i + 1}` : ""}
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
        </div>
      </section>

      {/* Post Purchase Optimizations — extracted from the generic
          mapped sections because it needs four animated phone mockups
          (the same IPHONE_MOCKUPS desktop shows in its IphoneRedesignRow)
          rather than a single still image. The four MP4s sit in a
          swipe-snap horizontal scroller so the user can swipe through
          the redesigned order states at their own pace. */}
      <section
        className="flex flex-col"
        style={{
          paddingTop: "calc(var(--u-m) * 64)",
          paddingLeft: "calc(var(--u-m) * 16)",
          paddingRight: "calc(var(--u-m) * 16)",
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
          }}
        >
          Post Purchase Optimizations
        </h2>
        <p
          className="font-sans"
          style={{
            fontSize: "max(12px, calc(var(--u-m) * 14))",
            letterSpacing: "calc(var(--u-m) * -0.42)",
            lineHeight: 1.4,
            margin: 0,
            opacity: 0.85,
            whiteSpace: "pre-line",
          }}
        >
          {"Customers frequently entered the wrong address or omitted components of their address and did not catch the issue in their order confirmation, which resulted in a slew of operational issues and late orders.\n\nI redesigned the post-purchase experience to reduce ambiguity at every order stage. Customer support inbounds dropped by nearly half, from 13% to 6%."}
        </p>

        {/* ORIGINAL designs — 2×2 grid (first two on top, second two on
            bottom) with an "Original designs" caption underneath,
            mirroring the desktop's before/after composition but reflowed
            for the narrower mobile viewport. */}
        <div
          className="flex flex-col"
          style={{
            marginTop: "calc(var(--u-m) * 16)",
            gap: "calc(var(--u-m) * 8)",
          }}
        >
          <div
            className="grid"
            style={{
              gridTemplateColumns: "1fr 1fr",
              gap: "calc(var(--u-m) * 12)",
            }}
          >
            {ORIGINAL_ORDER_STATES.map(({ label, src }) => (
              <div
                key={label}
                style={{
                  // aspect matches the desktop's 208/450 — source PNGs
                  // are 624x1350; object-contain renders the full screen
                  // edge-to-edge. No border-radius — the source PNGs
                  // have rounded screen corners baked in with
                  // transparent pixels around them.
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
              fontSize: "max(12px, calc(var(--u-m) * 12))",
              letterSpacing: "calc(var(--u-m) * -0.36)",
              opacity: 0.7,
              textAlign: "center",
              width: "100%",
            }}
          >
            Original designs
          </span>
        </div>

        {/* REDESIGNED — 4 animated mockups in a pinned horizontal
            row. Drops the section's content padding (the wrapper div
            below has -16u margins) so the pin can run edge-to-edge of
            the viewport. */}
        <div
          style={{
            marginTop: "calc(var(--u-m) * 16)",
            marginLeft: "calc(var(--u-m) * -16)",
            marginRight: "calc(var(--u-m) * -16)",
          }}
        >
          <MobileHorizontalPin>
            {IPHONE_MOCKUPS.map((src, i) => (
              <div
                key={src}
                className="shrink-0"
                style={{
                  width: "min(calc(var(--u-m) * 240), 100%)",
                  aspectRatio: "756 / 1432",
                }}
              >
                <video
                  src={src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="block w-full h-full object-cover"
                  aria-label={`Redesigned order state ${i + 1}`}
                />
              </div>
            ))}
          </MobileHorizontalPin>
        </div>
      </section>

      {/* Membership Program — dedicated section. Whole section uses
          the same butter-yellow ground that's baked into the
          Membership image, so the image's yellow blends seamlessly
          with the surrounding section instead of sitting on cream.
          The image runs edge-to-edge (no horizontal padding, no
          border-radius) so the phones read as large as possible — the
          image's intrinsic dimensions then drive the apparent phone
          size at full viewport width. The image is also scaled up
          ~120% so the phones occupy more of the viewport (the empty
          right-half yellow area gets pushed off-screen, which is fine
          since that area is just plain yellow that matches the
          section bg). */}
      <section
        className="flex flex-col overflow-hidden"
        style={{
          backgroundColor: WONDER_YELLOW,
          color: INK,
          paddingTop: "calc(var(--u-m) * 64)",
          // No bottom padding so the image sits flush against the
          // green Web Ordering section below — same flush handoff
          // desktop uses between Membership and Web Ordering.
          paddingBottom: 0,
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
          Membership Program
        </h2>
        <p
          className="font-sans"
          style={{
            fontSize: "max(12px, calc(var(--u-m) * 14))",
            letterSpacing: "calc(var(--u-m) * -0.42)",
            lineHeight: 1.4,
            margin: 0,
            opacity: 0.85,
            whiteSpace: "pre-line",
            paddingLeft: "calc(var(--u-m) * 16)",
            paddingRight: "calc(var(--u-m) * 16)",
          }}
        >
          Our membership program launched in 2023, aimed at increasing
          customer loyalty and order frequency. I designed the end-to-end
          experience and partnered with our Creative team to craft the
          visual identity.
          <br />
          <br />
          Within the first 6 months of launch, Wonder+ generated over
          ~$250K in weekly ARR.
        </p>
        <div style={{ marginTop: "calc(var(--u-m) * 16)" }}>
          {/* Mobile-specific composite image (no empty right-half yellow
              area like the desktop crop has) so the phones occupy more
              of the viewport at full width.

              maskImage softens the image's TOP edge with a linear-
              gradient fade so the boundary between the section bg
              yellow and the image's yellow doesn't read as a sharp
              horizontal line — over the first 48u the image's alpha
              ramps from 0 to 1, blending into the surrounding section. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${IMG}/Membership-Mobile.png`}
            alt=""
            aria-hidden="true"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              maskImage:
                "linear-gradient(to bottom, transparent 0, black calc(var(--u-m) * 48), black 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0, black calc(var(--u-m) * 48), black 100%)",
            }}
          />
        </div>
      </section>

      {/* Web Ordering — dedicated cream section, mirroring the
          desktop WebOrderingSection. Text reads INK on cream, and
          the laptop mockup floats centered between the text above
          and the section's bottom edge with matching 32u-m gaps on
          either side (marginTop on the image div above + paddingBottom
          on the section below). */}
      <section
        className="flex flex-col"
        style={{
          backgroundColor: WONDER_BG,
          color: INK,
          paddingTop: "calc(var(--u-m) * 64)",
          paddingLeft: "calc(var(--u-m) * 16)",
          paddingRight: "calc(var(--u-m) * 16)",
          paddingBottom: "calc(var(--u-m) * 32)",
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
          }}
        >
          Web Ordering
        </h2>
        <p
          className="font-sans"
          style={{
            fontSize: "max(12px, calc(var(--u-m) * 14))",
            letterSpacing: "calc(var(--u-m) * -0.42)",
            lineHeight: 1.4,
            margin: 0,
            opacity: 0.85,
            whiteSpace: "pre-line",
          }}
        >
          I designed our web ordering site in under 2 months to drive new
          user acquisition, and allow users to try Wonder without the
          friction of downloading the app.
          <br />
          <br />
          Our web ordering platform now accounts for 70% of new
          customer orders.
        </p>
        <div style={{ marginTop: "calc(var(--u-m) * 32)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${IMG}/WebOrdering.png`}
            alt=""
            aria-hidden="true"
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>
      </section>

      {/* Mobile Web — dark green section matching desktop's
          TASTE_GREEN ground so it reads as a chapter break from the
          Web Ordering cream above. Heading + two stat paragraphs on
          top, then a horizontal swipe row of the 6 mobile web
          mockups so the user can flip through each screen. */}
      <section
        className="flex flex-col text-white"
        style={{
          backgroundColor: TASTE_GREEN,
          paddingTop: "calc(var(--u-m) * 64)",
          paddingLeft: "calc(var(--u-m) * 16)",
          paddingRight: "calc(var(--u-m) * 16)",
          paddingBottom: "calc(var(--u-m) * 32)",
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
          }}
        >
          Mobile Web
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
          After launch, we found that customers ordered 26% more from
          our app compared to web.
          <br />
          <br />
          We conducted a series of A/B tests to drive users to download
          the app, emphasizing the benefit of receiving live updates
          (i.e. push notifications) for their orders.
        </p>
      </section>
      <div
        style={{
          backgroundColor: TASTE_GREEN,
          paddingBottom: "calc(var(--u-m) * 32)",
        }}
      >
        <MobileHorizontalPin>
          {/* Flatten the 3 desktop columns back into a single ordered
              list (1, 2, 3, 4, 5, 6, 7) for the horizontal swipe.
              Desktop uses hover-driven vertical marquees per column,
              which doesn't translate to touch; mobile lets the user
              swipe through all 7 phones one at a time, achieving the
              same "cycle through every screen" goal in a touch-native
              way. */}
          {MOBILE_WEB_COLUMNS.flatMap((col) => col.phones).map(
            (src, i) => (
              <div
                key={src}
                className="shrink-0"
                style={{
                  width: "min(calc(var(--u-m) * 220), 100%)",
                  aspectRatio: "1929 / 3896",
                  borderRadius: "24px",
                  overflow: "hidden",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${IMG}/Web Ordering/${src}`}
                  alt={`Wonder mobile web screen ${i + 1}`}
                  className="block w-full h-full object-cover"
                  draggable={false}
                />
              </div>
            ),
          )}
        </MobileHorizontalPin>
      </div>

      {/* Closing */}
      <section
        className="flex flex-col"
        style={{
          paddingTop: "calc(var(--u-m) * 64)",
          paddingLeft: "calc(var(--u-m) * 16)",
          paddingRight: "calc(var(--u-m) * 16)",
          paddingBottom: "calc(var(--u-m) * 48)",
        }}
      >
        <p
          className="font-serif text-center"
          style={{
            fontSize: "max(12px, calc(var(--u-m) * 20))",
            letterSpacing: "calc(var(--u-m) * -0.4)",
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          From 2021&ndash;2024, I was 1 of 2 product designers, and
          touched almost every screen of the entire product suite.
          <br />
          To see more of my work, check out{" "}
          <a
            href="https://wonder.com"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            wonder.com
          </a>{" "}
          or download the Wonder app.
        </p>
      </section>

      {/* Cover image */}
      <section
        className="overflow-hidden"
        style={{ paddingBottom: "calc(var(--u-m) * 48)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${IMG}/WonderClosingImage.webp`}
          alt=""
          aria-hidden="true"
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </section>

      <MobileSignature />
    </main>
  );
}
