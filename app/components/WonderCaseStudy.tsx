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

const WONDER_BG = "#FCF7ED";           // case study page bg (warm cream)
const HERO_BG = "#0a0a0a";              // hero panel under the landing video
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
      <ClosingSection />
      <CoverSection />
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
          className="flex items-center h-full font-serif text-white whitespace-nowrap"
          style={{
            fontSize: "calc(var(--u) * 40)",
            lineHeight: 1,
            letterSpacing: "calc(var(--u) * -0.5)",
          }}
        >
          joleen
        </Link>
        <div
          className="flex items-center h-full font-mono"
          style={{
            gap: "calc(var(--u) * 39)",
            fontSize: "calc(var(--u) * 20)",
            letterSpacing: "calc(var(--u) * -1)",
            lineHeight: 1,
          }}
        >
          <Link href="/work" className="hover:opacity-70 transition-opacity">
            WORK
          </Link>
          <Link
            href="/contact"
            className="hover:opacity-70 transition-opacity"
          >
            CONTACT
          </Link>
          <a
            href="https://www.linkedin.com/in/joleenhsu/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-70 transition-opacity"
          >
            LINKEDIN
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
              fontSize: "calc(var(--u) * 60)",
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
              fontSize: "calc(var(--u) * 24)",
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
          fontSize: "calc(var(--u) * 18)",
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
          fontSize: "calc(var(--u) * 24)",
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
            fontSize: "calc(var(--u) * 18)",
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
          fontSize: "calc(var(--u) * 68)",
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
          fontSize: "calc(var(--u) * 24)",
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
              borderRadius: "calc(var(--u) * 32)",
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
                  borderRadius: "calc(var(--u) * 24)",
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
              fontSize: "calc(var(--u) * 68)",
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
              fontSize: "calc(var(--u) * 24)",
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
              fontSize: "calc(var(--u) * 12)",
              letterSpacing: "calc(var(--u) * -0.24)",
              color: INK,
              opacity: 0.6,
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
              fontSize: "calc(var(--u) * 60)",
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
              fontSize: "calc(var(--u) * 24)",
              letterSpacing: "calc(var(--u) * -0.72)",
              lineHeight: 1.4,
              margin: 0,
            }}
          >
            Our membership program launched in 2023, aimed at increasing
            customer loyalty and order frequency. I designed the
            end-to-end experience and partnered with our Creative team to
            craft the visual identity. Within the first 6 months of
            launch, Wonder+ generated over ~$250K in weekly ARR.
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
        // Dark green section (matches the "A full taste of Wonder"
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
        body="I designed our web ordering site in under 2 months to drive new user acquisition, and allow users to try Wonder without the friction of downloading the app. Our web ordering platform now accounts for 70% of new customer orders."
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

function ClosingSection() {
  return (
    <section
      className="relative"
      style={{
        backgroundColor: WONDER_BG,
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
          fontSize: "calc(var(--u) * 44)",
          letterSpacing: "calc(var(--u) * -0.88)",
          lineHeight: 1.25,
        }}
      >
        From 2021&ndash;2024, I was 1 of 2 product designers, and touched
        almost every screen of the entire product suite. To see more of
        my work, check out{" "}
        <a
          href="https://wonder.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-70 transition-opacity"
          style={{
            // Default underline at 44u text is ~3-4px which reads as a
            // slab. Slim to 1px with a 6px offset for a more
            // typographic feel.
            textDecorationThickness: "1px",
            textUnderlineOffset: "6px",
          }}
        >
          wonder.com
        </a>{" "}
        or download the Wonder app.
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
        backgroundColor: WONDER_BG,
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
        src={`${IMG}/wonderclosingimage.webp`}
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
          fontSize: "calc(var(--u) * 68)",
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
                  borderRadius: "calc(var(--u) * 16)",
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
                    fontSize: "calc(var(--u) * 48)",
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
                    fontSize: "calc(var(--u) * 18)",
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
            fontSize: "calc(var(--u-m) * 32)",
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
            fontSize: "calc(var(--u-m) * 14)",
            letterSpacing: "calc(var(--u-m) * -0.42)",
            lineHeight: 1.55,
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
          paddingBottom: "calc(var(--u-m) * 64)",
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
                fontSize: "calc(var(--u-m) * 11)",
                letterSpacing: "calc(var(--u-m) * -0.55)",
                opacity: 0.7,
              }}
            >
              {row.label}
            </span>
            <span
              className="font-sans"
              style={{
                fontSize: "calc(var(--u-m) * 14)",
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
                width: "calc(var(--u-m) * 220)",
                aspectRatio: "1152 / 2169",
                borderRadius: "calc(var(--u-m) * 20)",
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
            fontSize: "calc(var(--u-m) * 32)",
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
            fontSize: "calc(var(--u-m) * 14)",
            letterSpacing: "calc(var(--u-m) * -0.42)",
            lineHeight: 1.55,
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
                      borderRadius: "calc(var(--u-m) * 16)",
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
            fontSize: "calc(var(--u-m) * 32)",
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
            fontSize: "calc(var(--u-m) * 14)",
            letterSpacing: "calc(var(--u-m) * -0.42)",
            lineHeight: 1.55,
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
              fontSize: "calc(var(--u-m) * 11)",
              letterSpacing: "calc(var(--u-m) * -0.22)",
              opacity: 0.6,
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
                  width: "calc(var(--u-m) * 240)",
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
            fontSize: "calc(var(--u-m) * 32)",
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
            fontSize: "calc(var(--u-m) * 14)",
            letterSpacing: "calc(var(--u-m) * -0.42)",
            lineHeight: 1.55,
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
          visual identity. Within the first 6 months of launch, Wonder+
          generated over ~$250K in weekly ARR.
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

      {/* Web Ordering — dedicated dark green section, mirroring the
          desktop WebOrderingSection. Text reads light on the deep
          green ground, and the laptop mockup sits flush with the
          section's bottom edge (paddingBottom: 0). */}
      <section
        className="flex flex-col text-white"
        style={{
          backgroundColor: TASTE_GREEN,
          paddingTop: "calc(var(--u-m) * 64)",
          paddingLeft: "calc(var(--u-m) * 16)",
          paddingRight: "calc(var(--u-m) * 16)",
          paddingBottom: 0,
          gap: "calc(var(--u-m) * 16)",
        }}
      >
        <h2
          className="font-serif"
          style={{
            fontSize: "calc(var(--u-m) * 32)",
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
            fontSize: "calc(var(--u-m) * 14)",
            letterSpacing: "calc(var(--u-m) * -0.42)",
            lineHeight: 1.55,
            margin: 0,
            opacity: 0.85,
            whiteSpace: "pre-line",
          }}
        >
          I designed our web ordering site in under 2 months to drive new
          user acquisition, and allow users to try Wonder without the
          friction of downloading the app. Our web ordering platform now
          accounts for 70% of new customer orders.
        </p>
        <div style={{ marginTop: "calc(var(--u-m) * 32)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${IMG}/WebOrdering.webp`}
            alt=""
            aria-hidden="true"
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>
      </section>

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
            fontSize: "calc(var(--u-m) * 20)",
            letterSpacing: "calc(var(--u-m) * -0.4)",
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          From 2021&ndash;2024, I was 1 of 2 product designers, and
          touched almost every screen of the entire product suite. To see
          more of my work, check out{" "}
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
          src={`${IMG}/wonderclosingimage.webp`}
          alt=""
          aria-hidden="true"
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </section>

      <MobileSignature />
    </main>
  );
}
