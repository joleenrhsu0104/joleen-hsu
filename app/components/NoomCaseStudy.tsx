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

/**
 * useFadeInOnScroll — IntersectionObserver-based one-shot fade-in.
 * Mirrors the helper used in NeudayCaseStudy so the two case studies
 * share the same reveal-on-scroll motion.
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
 * NoomCaseStudy — Figma node 717:1276.
 *
 * Sections (top to bottom):
 *   1. Hero — Whole Person Health billboard
 *   2. Intro — tagline + role/timeline/website meta on cream
 *   3. Mosaic grid — assorted brand / product / campaign cards
 *      (placeholders for now, swap in real assets when ready)
 *   4. "Work details coming soon" — placeholder section
 *   5. Signature footer (closing on cream)
 *
 * Image assets live in /public/images/noom/.
 */

const CREAM = "var(--color-cream)";
const INK = "var(--color-ink)";
const MOSAIC_BG = "#D9D6CF"; // warm taupe behind the brand-card mosaic
const IMG = "/images/noom";
const NOOM_HERO = `${IMG}/hero-noom.png`;

export default function NoomCaseStudy() {
  const isMobile = useIsMobile();
  return isMobile ? <NoomMobile /> : <NoomDesktop />;
}

/* ───────────────────────────────────────────────────────────────
   DESKTOP
   ─────────────────────────────────────────────────────────────── */

function NoomDesktop() {
  return (
    <main className="relative" style={{ backgroundColor: CREAM }}>
      <HeroDesktop />
      <IntroDesktop />
      <MosaicGridDesktop />
      <ComingSoonSection />
      <SignatureSection />
    </main>
  );
}

function HeroDesktop() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        // Sky-blue fallback that matches the upper portion of the
        // hero image, so the section reads cleanly during load.
        backgroundColor: "#B8D5E7",
        height: "calc(var(--u) * 1065)",
      }}
    >
      {/* Top nav */}
      <nav
        className="absolute flex items-center justify-between"
        style={{
          left: "calc(var(--u) * 70)",
          right: "calc(var(--u) * 70)",
          top: "calc(var(--u) * 57)",
          height: "calc(var(--u) * 47)",
          zIndex: 20,
          color: INK,
        }}
      >
        <Link
          href="/"
          aria-label="Home"
          className="flex items-center h-full font-serif whitespace-nowrap"
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

      {/* Hero image — Whole Person Health billboard.
          Full-bleed cover so the baked-in sky fills the entire
          section width regardless of viewport size. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={NOOM_HERO}
        alt="Noom — Whole Person Health"
        className="absolute inset-0 size-full object-cover"
        style={{ zIndex: 0 }}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
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
              fontSize: "calc(var(--u) * 60)",
              letterSpacing: "calc(var(--u) * -1.2)",
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Noom is the leading behavior change company, empowering everyone,
            everywhere to live better longer.
          </p>
          <p
            className="font-sans"
            style={{
              fontSize: "calc(var(--u) * 24)",
              letterSpacing: "calc(var(--u) * -0.72)",
              lineHeight: 1.4,
              margin: 0,
              maxWidth: "calc(var(--u) * 676)",
              opacity: 0.85,
            }}
          >
            More than 50 million people have benefited from Noom&rsquo;s
            behavior change courses, and it was named as one of
            TIME&rsquo;s most influential health &amp; wellness companies
            in 2026.
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
            value="As a Staff Product Designer, I was a player-coach for the Engagement Growth Engine (EGE) team and managed 2 other designers."
          />
          <MetaRow label="TIMELINE" value="2025-2026" />
          <MetaRow label="WEBSITE" value="noom.com" />
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

/* ───────────────────────────────────────────────────────────────
   Mosaic grid — assorted brand / campaign / product cards laid
   out as a 3-column staggered grid. Each card is a self-contained
   block; image files drop in under /public/images/noom/.
   ─────────────────────────────────────────────────────────────── */

const COLLAGE = `${IMG}/rebrand-collage`;

// Each card's CSS aspect-ratio matches its source-image aspect, so
// when paired with object-cover at the matching aspect the image
// fills its container edge-to-edge with no crop AND no whitespace.
const CARDS = {
  noomTalks: {
    src: `${COLLAGE}/YouTube-CoverImage-Option1.png`,
    alt: "NOOM Talks: The Science of Behavior Change with Charles Duhigg",
    aspect: "1764 / 993", // 16:9
  },
  track: {
    src: `${COLLAGE}/Trackyourprogress.png`,
    alt: "Track your progress with our GLP-1S",
    aspect: "952 / 1190",
  },
  microdose: {
    src: `${COLLAGE}/Microdose.png`,
    alt: "Noom Microdose GLP-1",
    // 400 x 500 = 4:5, matches Track so the sub-row bottoms align.
    aspect: "4 / 5",
  },
  metabolic: {
    src: `${COLLAGE}/MetabolicHealth.png`,
    alt: "Noom Metabolic vitamin",
    aspect: "1818 / 2073",
  },
  progressBeyond: {
    src: `${COLLAGE}/Progressbeyondprescription.png`,
    alt: "Progress beyond prescription",
    aspect: "1773 / 313",
  },
  foodNoise: {
    src: `${COLLAGE}/FoodNoise.png`,
    alt: "Food noise now comes with a mute button",
    aspect: "1031 / 1290",
  },
  accessMedication: {
    src: `${COLLAGE}/Accesstomedication.png`,
    alt: "Access to high-quality, powerful weight-loss medications — 48%",
    aspect: "2220 / 786",
  },
  buildBehaviors: {
    src: `${COLLAGE}/Buildbetterbehaviors.png`,
    alt: "Build better behaviors",
    aspect: "2025 / 1080",
  },
  lake: {
    src: `${COLLAGE}/Progressmakesperfection.png`,
    alt: "Progress makes perfection — live better longer",
    aspect: "2220 / 1080",
  },
} as const;

type CardKey = keyof typeof CARDS;

function MosaicCard({ which }: { which: CardKey }) {
  const card = CARDS[which];
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useFadeInOnScroll(ref);
  return (
    <div
      ref={ref}
      className="overflow-hidden"
      style={{
        aspectRatio: card.aspect,
        borderRadius: "calc(var(--u) * 16)",
        ...fadeInStyle(visible),
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={card.src}
        alt={card.alt}
        // object-cover with cell aspect-ratio matched to the image
        // aspect-ratio = perfect fill, no cropping, no whitespace.
        className="size-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    </div>
  );
}

function MosaicGridDesktop() {
  const GAP = "calc(var(--u) * 16)";
  return (
    <section
      className="relative"
      style={{
        backgroundColor: CREAM,
        paddingTop: "calc(var(--u) * 56)",
        // Bottom padding is absorbed by ComingSoonSection's top padding
        // (80u) below — keeping it at 0 here means the total vertical
        // gap between the mosaic's last card and the rebrand text is
        // exactly 80u, per user request.
        paddingBottom: 0,
        paddingLeft: "calc(var(--u) * 96)",
        paddingRight: "calc(var(--u) * 96)",
      }}
    >
      {/* Three flex columns. Each card preserves its source-image
          aspect ratio so nothing is cropped or letterboxed.

          Column flex-grow ratios are derived so all three columns
          end at the same vertical position. Solving for equal
          column heights with the inner gaps included gives precise
          ratios: 0.727 : 1.000 : 0.881. */}
      <div className="flex items-start" style={{ gap: GAP }}>
        {/* Left column — NOOM Talks → Progress beyond → Food noise */}
        <div
          className="flex flex-col"
          style={{ gap: GAP, flexBasis: 0, flexGrow: 0.727 }}
        >
          <MosaicCard which="noomTalks" />
          <MosaicCard which="progressBeyond" />
          <MosaicCard which="foodNoise" />
        </div>

        {/* Middle column — Track + Microdose sub-row, then
            Access medication, then Lake */}
        <div
          className="flex flex-col"
          style={{ gap: GAP, flexBasis: 0, flexGrow: 1 }}
        >
          <div className="flex items-start" style={{ gap: GAP }}>
            <div className="flex-1">
              <MosaicCard which="track" />
            </div>
            <div className="flex-1">
              <MosaicCard which="microdose" />
            </div>
          </div>
          <MosaicCard which="accessMedication" />
          <MosaicCard which="lake" />
        </div>

        {/* Right column — Metabolic (tall), Build behaviors */}
        <div
          className="flex flex-col"
          style={{ gap: GAP, flexBasis: 0, flexGrow: 0.88 }}
        >
          <MosaicCard which="metabolic" />
          <MosaicCard which="buildBehaviors" />
        </div>
      </div>
    </section>
  );
}

function ComingSoonSection() {
  return (
    <section
      className="relative flex items-center justify-center"
      style={{
        backgroundColor: CREAM,
        color: INK,
        // Tightened: 80u from end of mosaic to start of text.
        // MosaicGrid above has paddingBottom: 0 so this 80u is the
        // total vertical gap.
        paddingTop: "calc(var(--u) * 80)",
        paddingBottom: "calc(var(--u) * 140)",
        paddingLeft: "calc(var(--u) * 96)",
        paddingRight: "calc(var(--u) * 96)",
      }}
    >
      <p
        className="font-serif text-center"
        style={{
          fontSize: "calc(var(--u) * 60)",
          letterSpacing: "calc(var(--u) * -1.2)",
          lineHeight: 1.2,
          margin: 0,
          maxWidth: "calc(var(--u) * 1400)",
        }}
      >
        We&rsquo;re in the middle of a rebrand, so our app is getting a
        facelift.
        <br />
        Work details coming soon.
      </p>
    </section>
  );
}

/* ───────────────────────────────────────────────────────────────
   MOBILE
   ─────────────────────────────────────────────────────────────── */

function NoomMobile() {
  return (
    <main
      className="relative"
      style={{ backgroundColor: CREAM, color: INK }}
    >
      <MobileTopNav mode="overlay" navClassName="text-white" />

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundColor: "#B8D5E7",
          aspectRatio: "16 / 9",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={NOOM_HERO}
          alt="Noom — Whole Person Health"
          className="absolute inset-0 size-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
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
          gap: "calc(var(--u-m) * 20)",
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
          Noom is the leading behavior change company, empowering everyone,
          everywhere to live better longer.
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
          More than 50 million people have benefited from Noom&rsquo;s
          behavior change courses, and it was named as one of TIME&rsquo;s
          most influential health &amp; wellness companies in 2026.
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
          paddingBottom: "calc(var(--u-m) * 48)",
          gap: "calc(var(--u-m) * 28)",
        }}
      >
        <MobileMetaRow
          label="MY ROLE"
          value="As a Staff Product Designer, I was a player-coach for the Engagement Growth Engine (EGE) team and managed 2 other designers."
        />
        <MobileMetaRow label="TIMELINE" value="2025-2026" />
        <MobileMetaRow label="WEBSITE" value="noom.com" />
      </section>

      {/* Mosaic grid — single column stack on mobile. Each card
          keeps its source-image aspect so nothing is cropped. */}
      <section
        style={{
          backgroundColor: CREAM,
          paddingLeft: "calc(var(--u-m) * 16)",
          paddingRight: "calc(var(--u-m) * 16)",
          paddingTop: "calc(var(--u-m) * 32)",
          paddingBottom: "calc(var(--u-m) * 32)",
        }}
      >
        <div
          className="flex flex-col"
          style={{ gap: "calc(var(--u-m) * 12)" }}
        >
          {(
            [
              "noomTalks",
              "progressBeyond",
              "foodNoise",
              "track",
              "microdose",
              "accessMedication",
              "lake",
              "metabolic",
              "buildBehaviors",
            ] as CardKey[]
          ).map((which) => (
            <MobileMosaicCard key={CARDS[which].src} which={which} />
          ))}
        </div>
      </section>

      {/* Coming soon placeholder */}
      <section
        className="flex items-center justify-center"
        style={{
          paddingLeft: "calc(var(--u-m) * 16)",
          paddingRight: "calc(var(--u-m) * 16)",
          paddingTop: "calc(var(--u-m) * 80)",
          paddingBottom: "calc(var(--u-m) * 80)",
        }}
      >
        <p
          className="font-serif text-center"
          style={{
            fontSize: "calc(var(--u-m) * 28)",
            letterSpacing: "calc(var(--u-m) * -0.56)",
            lineHeight: 1.25,
            margin: 0,
          }}
        >
          We&rsquo;re in the middle of a rebrand, so our app is getting a
          facelift.
          <br />
          Work details coming soon.
        </p>
      </section>

      <MobileSignature />
    </main>
  );
}

function MobileMosaicCard({ which }: { which: CardKey }) {
  const card = CARDS[which];
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useFadeInOnScroll(ref);
  return (
    <div
      ref={ref}
      className="overflow-hidden"
      style={{
        aspectRatio: card.aspect,
        borderRadius: "calc(var(--u-m) * 12)",
        ...fadeInStyle(visible),
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={card.src}
        alt={card.alt}
        className="size-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    </div>
  );
}

function MobileMetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col" style={{ gap: "calc(var(--u-m) * 8)" }}>
      <span
        className="font-mono uppercase"
        style={{
          fontSize: "calc(var(--u-m) * 12)",
          letterSpacing: "calc(var(--u-m) * -0.6)",
          lineHeight: 1.1,
        }}
      >
        {label}
      </span>
      <span
        className="font-sans"
        style={{
          fontSize: "calc(var(--u-m) * 14)",
          letterSpacing: "calc(var(--u-m) * -0.42)",
          lineHeight: 1.5,
        }}
      >
        {value}
      </span>
    </div>
  );
}
