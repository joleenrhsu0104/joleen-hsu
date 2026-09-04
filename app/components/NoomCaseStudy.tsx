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
 *   4. "More work details coming soon" — placeholder section
 *   5. Signature footer (closing on cream)
 *
 * Image assets live in /public/images/noom/.
 */

const CREAM = "var(--color-cream)";
const INK = "var(--color-ink)";
const MOSAIC_BG = "#D9D6CF"; // warm taupe behind the brand-card mosaic
// Noom's brand light-blue, used as the background for the habit loops
// + challenge pages + challenge stat sections (between the player
// onboarding row and the rebrand mosaic). Eyeballed off the Figma
// design — adjust if Noom has an exact brand swatch.
const NOOM_BLUE = "#D2E0EB";
const IMG = "/images/noom";
const NOOM_HERO = `${IMG}/hero-noom.png`;

/**
 * Phone-screen images for the new product-work sections.
 *
 * The onboarding row PNGs (NoomHero1-4) and the two habit-loops
 * phones (Challenges1/2) have iPhone device bezels baked into the
 * source PNG. The three labeled "Page" exports do NOT — they're the
 * raw screen content with rounded corners.
 *
 * Because of this mix, PhoneMock(Desktop|Mobile) deliberately does
 * NOT impose a fixed aspect ratio — each image renders at its
 * natural aspect inside a width-constrained wrapper, so bezeled and
 * unbezeled exports both look right without letterbox padding. To
 * unify the visual later, re-export the labeled pages with the same
 * device frame and the row will read more consistently.
 *
 * Filename note: "Challenge Category Page.png" has spaces in the
 * filename, URL-encoded as %20.
 */
// Animated dial that plays on top of the first onboarding phone
// (NoomHero1). Source webm is cropped from the raw export to hold
// just the ring animation — no NOOM logo, no back arrow, no
// surrounding blank screen. Cream background is preserved so the
// video blends into the phone's cream screen under it.
const NOOM_ONBOARDING_DIAL_VIDEO = `${IMG}/NoomHero1-dial.webm`;

// Design-sprint mural — full-width artboard summarizing the sprint
// facilitator's Miro/FigJam board (how-might-we, agenda, user
// problems, goals). Sits below the challenges section on both
// desktop and mobile. Filename has a space so URL-encode it.
const NOOM_DESIGN_SPRINT_IMAGE = `${IMG}/${encodeURIComponent("Noom Design Sprint.png")}`;

// Rewards & gamification screens — folder has a space + ampersand
// in its name (`Rewards & Gamfication/`, per the actual on-disk
// path) so it's URL-encoded once as the prefix that every filename
// below hangs off of.
const REWARDS_DIR = `${IMG}/${encodeURIComponent("Rewards & Gamfication")}`;
const STREAK_SCREENS: Array<{ src: string; alt: string }> = [
  { src: `${REWARDS_DIR}/Streak1.png`, alt: "Noom rewards — 3-day streak counter" },
  { src: `${REWARDS_DIR}/Streak2.png`, alt: "Noom rewards — 3-day milestone celebration" },
  { src: `${REWARDS_DIR}/Streak3.png`, alt: "Noom rewards — next milestone preview" },
  { src: `${REWARDS_DIR}/Streak4.png`, alt: "Noom rewards — streak commitment CTA" },
];

// Three-row table paired with the "How might we keep users
// engaged with their program?" intro on the right side of the
// section. Each row maps a layer of gamification to the user
// question it answers.
const REWARDS_LAYERS: Array<{ label: string; question: string }> = [
  { label: "Streaks", question: "Did I show up today?" },
  { label: "Daily completion", question: "Did I do the habits in my program?" },
  { label: "Seeds", question: "What rewards do I get?" },
];

const SCREEN_IMAGES = {
  // Onboarding row (NoomHero1-4) — bezeled exports, cream backdrops
  onboarding: {
    src: `${IMG}/NoomHero1.png`,
    alt: "Noom — player onboarding with avatar ring",
  },
  welcome: {
    src: `${IMG}/NoomHero2.png`,
    alt: "Noom — Welcome to Noom, Laura",
  },
  focusAreas: {
    src: `${IMG}/NoomHero3.png`,
    alt: "Noom — review your focus areas",
  },
  treatmentProgram: {
    src: `${IMG}/NoomHero4.png`,
    alt: "Noom — treatment program with Microdose + Biomarkers",
  },
  // Habit loops right-side pair (Challenges1/2) — bezeled exports
  challenges: {
    src: `${IMG}/Challenges/Challenges1.png`,
    alt: "Noom — challenges list",
  },
  energyCategory: {
    src: `${IMG}/Challenges/Challenges2.png`,
    alt: "Noom — Energy challenge category",
  },
  // Labeled 3-phone row — unbezeled exports (raw screen content)
  challengeCategory: {
    src: `${IMG}/Challenges/Challenge%20Category%20Page.png`,
    alt: "Noom — challenge category page",
  },
  challengeDetail: {
    src: `${IMG}/Challenges/ChallengeDetailPage.png`,
    alt: "Noom — challenge detail page",
  },
  habitStack: {
    src: `${IMG}/Challenges/HabitStackPage.png`,
    alt: "Noom — habit stack page",
  },
} as const;

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
      <OnboardingScreensRowDesktop />
      <HabitLoopsSectionDesktop />
      <ChallengePagesRowDesktop />
      <ChallengeStatSectionDesktop />
      <RewardsGamificationSectionDesktop />
      <DesignSprintsSectionDesktop />
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
          className="flex items-center h-full"
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
              fontSize: "max(14px, calc(var(--u) * 60))",
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
              fontSize: "max(14px, calc(var(--u) * 24))",
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
            value="As a Staff Product Designer / Senior Product Design manager, I'm a player-coach for the Engagement Growth Engine (EGE) team and manage 2 other designers."
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

/* ───────────────────────────────────────────────────────────────
   Player onboarding row — 4 phone mocks on cream showing the
   journey from initial setup → welcome → focus areas → treatment
   program. Sits between Intro and HabitLoopsSection in the desktop
   render. Source files: /public/images/noom/screens/{Onboarding,
   Welcome, FocusAreas, TreatmentProgram}.png
   ─────────────────────────────────────────────────────────────── */

function OnboardingScreensRowDesktop() {
  const phones = [
    SCREEN_IMAGES.onboarding,
    SCREEN_IMAGES.welcome,
    SCREEN_IMAGES.focusAreas,
    SCREEN_IMAGES.treatmentProgram,
  ] as const;
  // Single IntersectionObserver on the ROW (not per-phone) so all
  // four phones fade in together as one motion when the row enters
  // viewport — per user feedback, "animate in together all at once,
  // just like the other case study animations." The per-phone
  // PhoneMockDesktop instances pass fadeIn={false} so they don't
  // self-fade and clobber the row-level reveal.
  const rowRef = useRef<HTMLDivElement | null>(null);
  const visible = useFadeInOnScroll(rowRef);
  return (
    <section
      style={{
        backgroundColor: CREAM,
        paddingTop: "calc(var(--u) * 80)",
        paddingBottom: "calc(var(--u) * 80)",
        paddingLeft: "calc(var(--u) * 96)",
        paddingRight: "calc(var(--u) * 96)",
      }}
    >
      <div
        ref={rowRef}
        className="flex items-start justify-center"
        style={{
          gap: "calc(var(--u) * 24)",
          ...fadeInStyle(visible),
        }}
      >
        {phones.map(({ src, alt }, i) => {
          const phone = (
            <PhoneMockDesktop
              src={src}
              alt={alt}
              width={400}
              fadeIn={false}
            />
          );
          // First phone (NoomHero1) gets an animated dial overlay
          // laid over the static dial in the PNG. Position + size
          // are % of the phone container so the overlay tracks with
          // any width change to PhoneMockDesktop.
          if (i === 0) {
            return (
              <div key={src} className="relative">
                {phone}
                <video
                  src={NOOM_ONBOARDING_DIAL_VIDEO}
                  autoPlay
                  loop
                  muted
                  playsInline
                  aria-hidden
                  className="absolute pointer-events-none"
                  style={{
                    // Overlay is inset to sit inside the phone
                    // bezel — measured from the source PNG, the
                    // cream screen area runs from ~5.2% to ~94.8%
                    // of the phone image width. Height derives
                    // from the video's own aspect ratio (720:820)
                    // so it always scales proportionally with the
                    // phone. Centered vertically via `top` so the
                    // animated dial center lines up with the
                    // static dial center in the PNG (~48% of
                    // phone height).
                    // 5.2% inset on each side lines up with the
                    // phone's own bezel-to-screen transition;
                    // adding an extra 6% margin on each side gives
                    // the dial ~24px of breathing room from the
                    // screen edge on the desktop phone (400u ≈
                    // 400px at viewport = 1920). Scales with the
                    // phone width so the ratio stays consistent
                    // at every breakpoint.
                    top: "26%",
                    left: "11.2%",
                    width: "77.6%",
                    aspectRatio: "720 / 820",
                  }}
                />
              </div>
            );
          }
          return <div key={src}>{phone}</div>;
        })}
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────────────────────────
   Habit loops section — left-column heading + 2-paragraph body,
   right-side two phone mocks (Challenges list + Energy category).
   Light-blue background, marks the transition into the challenges
   product story.
   ─────────────────────────────────────────────────────────────── */

function HabitLoopsSectionDesktop() {
  return (
    <section
      style={{
        position: "relative",
        // Pure white (#FFFFFF) — distinct from the warm cream the rest
        // of the case study sits on so this section reads as its own
        // chapter for the challenges product story. The blue band
        // below picks up at the phone bottoms and hands off to the
        // labeled-pages section.
        backgroundColor: "#FFFFFF",
        color: INK,
        paddingTop: "calc(var(--u) * 120)",
        paddingBottom: "calc(var(--u) * 120)",
        paddingLeft: "calc(var(--u) * 96)",
        paddingRight: "calc(var(--u) * 96)",
        // Clip the absolutely-positioned blue band to the section.
        overflow: "hidden",
      }}
    >
      {/* Blue band — pixel-anchored from the BOTTOM of the section
          (not a % of section height) so the cream/blue boundary
          lands at a deterministic Y position regardless of how the
          text above wraps. Height = paddingBottom (120u) puts the
          boundary exactly at the bottom edge of the 2 phone mocks
          (which sit in the flex row's full height with items-start),
          so each phone is fully visible against cream above the
          line, and the blue band sits cleanly below them. The next
          section (ChallengePagesRow) is also NOOM_BLUE so the
          handoff between sections is seamless. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "calc(var(--u) * 120)",
          backgroundColor: NOOM_BLUE,
          zIndex: 0,
        }}
      />

      <div
        className="flex items-start justify-between"
        style={{
          gap: "calc(var(--u) * 96)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Left: heading + 2-paragraph body. Matches Intro's typographic
            rhythm (60u serif headline, 24u sans body, 0.85 opacity). */}
        <div
          className="flex flex-col shrink-0"
          style={{
            width: "calc(var(--u) * 600)",
            gap: "calc(var(--u) * 24)",
          }}
        >
          <h2
            className="font-serif"
            style={{
              fontSize: "max(14px, calc(var(--u) * 60))",
              letterSpacing: "calc(var(--u) * -1.2)",
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Building habit loops through the launch of challenges
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
            To support Noom&rsquo;s expansion to new health areas, we wanted
            to make it easy to create behavioral interventions for any
            health goal.
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
            Our goal was to increase early and long-term retention by
            adding motivation, variety, and personalization to Noom.
          </p>
        </div>

        {/* Right: 2 phones (Challenges list + Energy category). */}
        <div
          className="flex items-start"
          style={{ gap: "calc(var(--u) * 32)" }}
        >
          <PhoneMockDesktop
            src={SCREEN_IMAGES.challenges.src}
            alt={SCREEN_IMAGES.challenges.alt}
            width={460}
            stagger={0}
          />
          <PhoneMockDesktop
            src={SCREEN_IMAGES.energyCategory.src}
            alt={SCREEN_IMAGES.energyCategory.alt}
            width={460}
            stagger={1}
          />
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────────────────────────
   Challenge pages row — 3 labeled phone mocks (Challenge Category,
   Challenge Detail, Habit Stack). Same blue band as the habit-loops
   section above so the two read as one continuous product story.
   ─────────────────────────────────────────────────────────────── */

function ChallengePagesRowDesktop() {
  const phones = [
    { label: "Challenge Category Page", ...SCREEN_IMAGES.challengeCategory },
    { label: "Challenge Detail Page", ...SCREEN_IMAGES.challengeDetail },
    { label: "Habit Stack Page", ...SCREEN_IMAGES.habitStack },
  ] as const;
  return (
    <section
      style={{
        backgroundColor: NOOM_BLUE,
        // No paddingTop — visually continuous with HabitLoopsSection
        // above (which has paddingBottom: 120u). Flush handoff via the
        // shared background color.
        paddingTop: 0,
        paddingBottom: "calc(var(--u) * 96)",
        paddingLeft: "calc(var(--u) * 96)",
        paddingRight: "calc(var(--u) * 96)",
      }}
    >
      <div
        className="flex items-start justify-center"
        style={{ gap: "calc(var(--u) * 48)" }}
      >
        {phones.map(({ src, alt, label }, i) => (
          <div
            key={src}
            className="flex flex-col items-center"
            style={{ gap: "calc(var(--u) * 16)" }}
          >
            <span
              className="font-sans"
              style={{
                fontSize: "max(14px, calc(var(--u) * 14))",
                letterSpacing: "calc(var(--u) * -0.28)",
                color: INK,
                opacity: 0.7,
                textAlign: "center",
              }}
            >
              {label}
            </span>
            <PhoneMockDesktop
              src={src}
              alt={alt}
              // Smaller than the habit-loops phones (460u) and the
              // onboarding phones (400u) so all three labeled mocks
              // fit comfortably in a single ~1080p viewport without
              // vertical scroll. With unbezeled exports rendering
              // tall, anything wider than ~360u pushes the row
              // taller than the viewport.
              width={350}
              stagger={i}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────────────────────────
   Challenge stat callout — large centered serif paragraph with the
   1M challenges / 78% opt-in / 58% completion numbers from launch.
   Closes the blue challenges band and hands off to the cream
   rebrand mosaic below.
   ─────────────────────────────────────────────────────────────── */

function ChallengeStatSectionDesktop() {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useFadeInOnScroll(ref);
  return (
    <section
      style={{
        backgroundColor: NOOM_BLUE,
        color: INK,
        // Tighter top padding (was 32u) so the stat text sits closer
        // to the labeled 3-phone row above instead of floating
        // mid-blue.
        paddingTop: "calc(var(--u) * 16)",
        // paddingBottom matches MosaicGridDesktop's paddingTop (96u)
        // so the cream/blue handoff at the bottom of this section is
        // equidistant from the stat text above and from the first
        // mosaic card row below.
        paddingBottom: "calc(var(--u) * 96)",
        paddingLeft: "calc(var(--u) * 96)",
        paddingRight: "calc(var(--u) * 96)",
      }}
    >
      <div
        ref={ref}
        className="flex items-center justify-center"
        style={fadeInStyle(visible)}
      >
        <p
          className="font-serif text-center"
          style={{
            fontSize: "max(14px, calc(var(--u) * 40))",
            letterSpacing: "calc(var(--u) * -0.8)",
            lineHeight: 1.25,
            margin: 0,
            maxWidth: "calc(var(--u) * 1200)",
          }}
        >
          Since the launch in May, over 1 million challenges have been
          started with a 78% opt-in rate and 58% completion rate. DAU
          has increased by ~9%.
        </p>
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────────────────────────
   Design sprints section — cream band sitting between the
   challenges block above and the mosaic grid below. Centered
   title + short body over a full-width mural image of the sprint
   facilitator's board (how-might-we, agenda, user problems,
   goals). Mirrors the pattern used by the challenges intro
   (h2 + body) but full-bleed image instead of phone mocks.
   ─────────────────────────────────────────────────────────────── */

function DesignSprintsSectionDesktop() {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useFadeInOnScroll(ref);
  return (
    <section
      style={{
        // Pure white so this section reads as its own chapter,
        // distinct from the cream challenges block above and the
        // taupe rebrand mosaic (MosaicGridDesktop) below.
        backgroundColor: "#FFFFFF",
        color: INK,
        paddingTop: "calc(var(--u) * 96)",
        paddingBottom: "calc(var(--u) * 96)",
        paddingLeft: "calc(var(--u) * 96)",
        paddingRight: "calc(var(--u) * 96)",
      }}
    >
      <div
        ref={ref}
        className="flex flex-col items-center"
        style={{ gap: "calc(var(--u) * 32)", ...fadeInStyle(visible) }}
      >
        <h2
          className="font-serif text-center"
          style={{
            fontSize: "max(14px, calc(var(--u) * 56))",
            letterSpacing: "calc(var(--u) * -1.12)",
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          Design sprints
        </h2>
        <p
          className="font-sans text-center"
          style={{
            fontSize: "max(14px, calc(var(--u) * 24))",
            letterSpacing: "calc(var(--u) * -0.72)",
            lineHeight: 1.4,
            margin: 0,
            maxWidth: "calc(var(--u) * 1000)",
            opacity: 0.85,
          }}
        >
          Early in the year, I worked with leadership to pinpoint the most
          critical open questions, then ran a full design sprint to reimagine
          our Home Tab &mdash; a powerful way to align stakeholders on
          product direction and give the team a clear North Star.
        </p>
        <div
          style={{
            width: "100%",
            maxWidth: "calc(var(--u) * 1440)",
            marginTop: "calc(var(--u) * 16)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={NOOM_DESIGN_SPRINT_IMAGE}
            alt="Noom design sprint board — how might we, agenda, user problems, and goals"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              borderRadius: "24px",
            }}
          />
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────────────────────────
   Rewards & gamification section — cream chapter after Design
   sprints. Left column: "How might we keep users engaged with
   their program?" h2 + supporting copy. Right column: 3-row
   table pairing each gamification layer (Streaks / Daily
   completion / Seeds) with the user question it answers. Below:
   a 4-phone row of the Streak flow. Additional rows (Daily
   completion, Seeds) can be dropped in as their assets land.
   ─────────────────────────────────────────────────────────────── */

function RewardsGamificationSectionDesktop() {
  const introRef = useRef<HTMLDivElement | null>(null);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const introVisible = useFadeInOnScroll(introRef);
  const rowVisible = useFadeInOnScroll(rowRef);
  return (
    <section
      style={{
        backgroundColor: CREAM,
        color: INK,
        paddingTop: "calc(var(--u) * 96)",
        paddingBottom: "calc(var(--u) * 96)",
        paddingLeft: "calc(var(--u) * 96)",
        paddingRight: "calc(var(--u) * 96)",
      }}
    >
      {/* Two-column intro row: title + body on the left, layer
          table on the right. Left column sits flush with the
          section's 96u paddingLeft so the h2 lines up horizontally
          with every other section header on the case study. */}
      <div
        ref={introRef}
        className="flex items-start justify-between"
        style={{ gap: "calc(var(--u) * 96)", ...fadeInStyle(introVisible) }}
      >
        <div
          className="flex flex-col"
          style={{
            width: "calc(var(--u) * 620)",
            gap: "calc(var(--u) * 24)",
          }}
        >
          <h2
            className="font-serif"
            style={{
              fontSize: "max(14px, calc(var(--u) * 56))",
              letterSpacing: "calc(var(--u) * -1.12)",
              lineHeight: 1.1,
              margin: 0,
              // Match the body copy width below so the header
              // wraps at the same left/right rules and the two
              // blocks read as a single column.
              maxWidth: "calc(var(--u) * 620)",
            }}
          >
            How might we keep users engaged with their program?
          </h2>
          <p
            className="font-sans"
            style={{
              fontSize: "max(14px, calc(var(--u) * 24))",
              letterSpacing: "calc(var(--u) * -0.72)",
              lineHeight: 1.4,
              margin: 0,
              maxWidth: "calc(var(--u) * 620)",
              opacity: 0.85,
            }}
          >
            I helped to build our rewards system from the ground up,
            optimizing for 3 layers of gamification.
          </p>
        </div>

        {/* 3-row layer table — hairline divider between rows,
            layer name on the left, user question on the right.
            Width sized to the widest row's content (label 260u +
            24u gap + the longest question "Did I do the habits
            in my program?" at ~310u ≈ 594u total) so each
            divider stops just past the trailing "?" instead of
            extending into empty space on the right. */}
        <div
          className="flex flex-col"
          style={{ width: "calc(var(--u) * 594)" }}
        >
          {REWARDS_LAYERS.map((layer, i) => (
            <div
              key={layer.label}
              className="flex items-baseline"
              style={{
                paddingTop: "calc(var(--u) * 20)",
                paddingBottom: "calc(var(--u) * 20)",
                borderTop:
                  i === 0 ? undefined : "1px solid rgba(0, 0, 0, 0.12)",
                gap: "calc(var(--u) * 24)",
              }}
            >
              <span
                className="font-sans"
                style={{
                  fontSize: "max(14px, calc(var(--u) * 20))",
                  letterSpacing: "calc(var(--u) * -0.4)",
                  lineHeight: 1.3,
                  fontWeight: 500,
                  width: "calc(var(--u) * 260)",
                  flexShrink: 0,
                }}
              >
                {layer.label}
              </span>
              <span
                className="font-sans"
                style={{
                  fontSize: "max(14px, calc(var(--u) * 20))",
                  letterSpacing: "calc(var(--u) * -0.4)",
                  lineHeight: 1.3,
                  opacity: 0.7,
                }}
              >
                {layer.question}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Streak flow — 4 phones side by side. Reveals as a group
          on scroll (per-phone fade suppressed via fadeIn=false).
          Gap adds a flat 16px on top of the scaled 24u to give
          each phone more breathing room per the user's request. */}
      <div
        ref={rowRef}
        className="flex items-start justify-center"
        style={{
          gap: "calc(var(--u) * 24 + 16px)",
          marginTop: "calc(var(--u) * 96)",
          ...fadeInStyle(rowVisible),
        }}
      >
        {STREAK_SCREENS.map(({ src, alt }) => (
          <PhoneMockDesktop
            key={src}
            src={src}
            alt={alt}
            width={340}
            fadeIn={false}
          />
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────────────────────────
   PhoneMockDesktop — shared phone-shaped image card used by all
   three product-screen sections above. Fixed aspect (PHONE_ASPECT)
   per width, fade-in on scroll with a per-row stagger so phones in
   the same row reveal sequentially rather than all-at-once.
   ─────────────────────────────────────────────────────────────── */

function PhoneMockDesktop({
  src,
  alt,
  width,
  stagger = 0,
  fadeIn = true,
}: {
  src: string;
  alt: string;
  /** Design-px width (1920 canvas). */
  width: number;
  /** Index within the row (0-based). Each step adds 80ms to the
   *  fade-in delay so adjacent phones reveal sequentially. */
  stagger?: number;
  /** Set false when the parent row owns the fade-in animation —
   *  e.g. the onboarding row reveals all 4 phones together via a
   *  single IntersectionObserver on the row container, and per-phone
   *  fades would clobber that group reveal. */
  fadeIn?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useFadeInOnScroll(ref);
  const fadeStyles: CSSProperties = fadeIn
    ? {
        ...fadeInStyle(visible),
        transitionDelay: `${stagger * 80}ms`,
      }
    : {};
  return (
    <div
      ref={ref}
      style={{
        // Width only — height is derived from the image's natural
        // aspect ratio. See SCREEN_IMAGES doc for why no aspectRatio
        // wrapper: the source PNGs are a mix of bezeled and unbezeled
        // exports, so a fixed aspect would letterbox some and not
        // others. Letting natural aspect drive height means each
        // export renders correctly regardless of bezel status.
        width: `calc(var(--u) * ${width})`,
        ...fadeStyles,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
        }}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
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
        borderRadius: "24px",
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
        // paddingTop matches ChallengeStatSectionDesktop's
        // paddingBottom (96u) so the cream/blue handoff sits
        // equidistant from the stat text above and the first mosaic
        // card row below.
        paddingTop: "calc(var(--u) * 96)",
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
          fontSize: "max(14px, calc(var(--u) * 60))",
          letterSpacing: "calc(var(--u) * -1.2)",
          lineHeight: 1.2,
          margin: 0,
          maxWidth: "calc(var(--u) * 1400)",
        }}
      >
        We&rsquo;re in the middle of a rebrand, so our app is getting a
        facelift.
        <br />
        More work details coming soon.
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
            fontSize: "max(12px, calc(var(--u-m) * 32))",
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
            fontSize: "max(12px, calc(var(--u-m) * 14))",
            letterSpacing: "calc(var(--u-m) * -0.42)",
            lineHeight: 1.4,
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
          value="As a Staff Product Designer / Senior Product Design manager, I'm a player-coach for the Engagement Growth Engine (EGE) team and manage 2 other designers."
        />
        <MobileMetaRow label="TIMELINE" value="2025-2026" />
        <MobileMetaRow label="WEBSITE" value="noom.com" />
      </section>

      {/* New product-work sections — onboarding row, habit loops,
          challenge pages, stat callout. Same content as desktop
          but laid out for the narrower mobile surface. */}
      <OnboardingScreensRowMobile />
      <HabitLoopsSectionMobile />
      <ChallengePagesRowMobile />
      <ChallengeStatSectionMobile />
      <RewardsGamificationSectionMobile />
      <DesignSprintsSectionMobile />

      {/* Mosaic grid — single column stack on mobile. Each card
          keeps its source-image aspect so nothing is cropped. */}
      <section
        style={{
          backgroundColor: CREAM,
          paddingLeft: "calc(var(--u-m) * 16)",
          paddingRight: "calc(var(--u-m) * 16)",
          // paddingTop matches ChallengeStatSectionMobile's
          // paddingBottom (48u-m) so the cream/blue handoff is
          // equidistant from the stat text above and the first card
          // below.
          paddingTop: "calc(var(--u-m) * 48)",
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
            fontSize: "max(12px, calc(var(--u-m) * 28))",
            letterSpacing: "calc(var(--u-m) * -0.56)",
            lineHeight: 1.25,
            margin: 0,
          }}
        >
          We&rsquo;re in the middle of a rebrand, so our app is getting a
          facelift.
          <br />
          More work details coming soon.
        </p>
      </section>

      <MobileSignature />
    </main>
  );
}

/* ───────────────────────────────────────────────────────────────
   Mobile counterparts to the new desktop product-work sections.
   Same content + copy, mobile type scale (--u-m), MobileHorizontalPin
   for the phone rows so vertical scroll advances them horizontally
   (matching the Wonder / Blue Apron / Neuday pattern).
   ─────────────────────────────────────────────────────────────── */

function OnboardingScreensRowMobile() {
  const phones = [
    SCREEN_IMAGES.onboarding,
    SCREEN_IMAGES.welcome,
    SCREEN_IMAGES.focusAreas,
    SCREEN_IMAGES.treatmentProgram,
  ] as const;
  return (
    <section
      aria-label="Noom player onboarding screens"
      style={{ backgroundColor: CREAM }}
    >
      <MobileHorizontalPin>
        {phones.map(({ src, alt }, i) => {
          if (i === 0) {
            return (
              <div key={src} className="relative" style={{ width: "min(calc(var(--u-m) * 220), 100%)" }}>
                <PhoneMockMobile src={src} alt={alt} />
                <video
                  src={NOOM_ONBOARDING_DIAL_VIDEO}
                  autoPlay
                  loop
                  muted
                  playsInline
                  aria-hidden
                  className="absolute pointer-events-none"
                  style={{
                    // Overlay is inset to sit inside the phone
                    // bezel — measured from the source PNG, the
                    // cream screen area runs from ~5.2% to ~94.8%
                    // of the phone image width. Height derives
                    // from the video's own aspect ratio (720:820)
                    // so it always scales proportionally with the
                    // phone. Centered vertically via `top` so the
                    // animated dial center lines up with the
                    // static dial center in the PNG (~48% of
                    // phone height).
                    // 5.2% inset on each side lines up with the
                    // phone's own bezel-to-screen transition;
                    // adding an extra 6% margin on each side gives
                    // the dial ~24px of breathing room from the
                    // screen edge on the desktop phone (400u ≈
                    // 400px at viewport = 1920). Scales with the
                    // phone width so the ratio stays consistent
                    // at every breakpoint.
                    top: "26%",
                    left: "11.2%",
                    width: "77.6%",
                    aspectRatio: "720 / 820",
                  }}
                />
              </div>
            );
          }
          return <PhoneMockMobile key={src} src={src} alt={alt} />;
        })}
      </MobileHorizontalPin>
    </section>
  );
}

function HabitLoopsSectionMobile() {
  return (
    <section
      style={{
        position: "relative",
        // Pure white (#FFFFFF) — matches the desktop variant; reads
        // as a distinct chapter from the cream surrounding sections.
        backgroundColor: "#FFFFFF",
        color: INK,
        paddingTop: "calc(var(--u-m) * 64)",
        // No paddingBottom — the blue band already covers the bottom
        // of this section and the next section (ChallengePagesRow)
        // continues the blue with paddingTop:0, so any extra padding
        // here just inflates the empty blue area between the two
        // phone rows.
        paddingBottom: 0,
        overflow: "hidden",
      }}
    >
      {/* Blue band — pixel-anchored from section bottom so the
          cream/blue boundary lands at the bottom edge of the
          phones inside the MobileHorizontalPin. With section
          paddingBottom 0, pin paddingY 8u-m (overridden below from
          the default 44u-m), and pin wrapper overflow ~94u-m, the
          band height = 0 + 94 + 8 = 102u-m to land just under phone
          bottom. Phones extend DOWN onto the blue via z-index (the
          MobileHorizontalPin wrapper has position:relative + zIndex 1). */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "calc(var(--u-m) * 102)",
          backgroundColor: NOOM_BLUE,
          zIndex: 0,
        }}
      />

      <div
        className="flex flex-col"
        style={{
          paddingLeft: "calc(var(--u-m) * 16)",
          paddingRight: "calc(var(--u-m) * 16)",
          gap: "calc(var(--u-m) * 16)",
          position: "relative",
          zIndex: 1,
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
          Building habit loops through the launch of challenges
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
          To support Noom&rsquo;s expansion to new health areas, we wanted
          to make it easy to create behavioral interventions for any
          health goal.
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
          Our goal was to increase early and long-term retention by
          adding motivation, variety, and personalization to Noom.
        </p>
      </div>

      {/* 2-phone row immediately below the text — rendered as a
          real 2-column layout (NOT the shared MobileHorizontalPin,
          which vertical-stacks its children now). Phones are sized
          down so both fit on one row on any mobile viewport with
          16u-m side padding and a 12u-m gutter. The row is anchored
          bottom-aligned to the section via `position: relative +
          zIndex 1` so the phones sit ON TOP of the absolutely-
          positioned blue band below, and marginTop: auto pushes
          them down so their bottom edges land exactly at the top
          of the blue band (no dip, no gap). */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "1fr 1fr",
          gap: "calc(var(--u-m) * 12)",
          paddingLeft: "calc(var(--u-m) * 16)",
          paddingRight: "calc(var(--u-m) * 16)",
          marginTop: "calc(var(--u-m) * 32)",
          // Push the phone row up by exactly the blue band height
          // (102u-m) so phone bottoms land at the top of the blue
          // band (no overlap into blue, no gap above it).
          marginBottom: "calc(var(--u-m) * 102)",
          alignItems: "end",
          position: "relative",
          zIndex: 1,
        }}
      >
        <TwoUpPhone
          src={SCREEN_IMAGES.challenges.src}
          alt={SCREEN_IMAGES.challenges.alt}
        />
        <TwoUpPhone
          src={SCREEN_IMAGES.energyCategory.src}
          alt={SCREEN_IMAGES.energyCategory.alt}
        />
      </div>
    </section>
  );
}

/** Phone mock sized to fit two-up inside the mobile content column
 *  with 16u-m side padding and a 12u-m gutter. Width: 100% of grid
 *  cell (~1/2 viewport minus paddings/gap) so both phones scale
 *  together as the viewport widens. */
function TwoUpPhone({ src, alt }: { src: string; alt: string }) {
  return (
    <div style={{ width: "100%" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
        }}
        draggable={false}
      />
    </div>
  );
}

function ChallengePagesRowMobile() {
  const phones = [
    { label: "Challenge Category Page", ...SCREEN_IMAGES.challengeCategory },
    { label: "Challenge Detail Page", ...SCREEN_IMAGES.challengeDetail },
    { label: "Habit Stack Page", ...SCREEN_IMAGES.habitStack },
  ] as const;
  return (
    <section
      aria-label="Noom challenge pages"
      style={{
        backgroundColor: NOOM_BLUE,
        // No paddingTop — continuous with HabitLoopsSectionMobile above.
        paddingTop: 0,
        paddingBottom: 0,
      }}
    >
      {/* paddingY override 44u-m → 16u-m matches the habit-loops pin
          above so the labels sit closer to the top of the labeled
          section and the empty blue space above them shrinks.
          Forced to a 1-column layout so each labeled Challenge page
          reads full-width instead of squeezing three cards into a
          2-column grid where the third would sit alone below. */}
      <MobileHorizontalPin paddingY="calc(var(--u-m) * 8)" columns={1}>
        {phones.map(({ src, alt, label }) => (
          <div
            key={src}
            className="flex flex-col items-center"
            style={{ gap: "calc(var(--u-m) * 12)" }}
          >
            <span
              className="font-sans"
              style={{
                fontSize: "max(12px, calc(var(--u-m) * 12))",
                letterSpacing: "calc(var(--u-m) * -0.24)",
                color: INK,
                opacity: 0.7,
                textAlign: "center",
              }}
            >
              {label}
            </span>
            <PhoneMockMobile src={src} alt={alt} />
          </div>
        ))}
      </MobileHorizontalPin>
    </section>
  );
}

function ChallengeStatSectionMobile() {
  return (
    <section
      style={{
        backgroundColor: NOOM_BLUE,
        color: INK,
        paddingLeft: "calc(var(--u-m) * 16)",
        paddingRight: "calc(var(--u-m) * 16)",
        // Tighter top padding (was 32u-m) to match the desktop change
        // that brought the stat text closer to the phone row above.
        paddingTop: "calc(var(--u-m) * 16)",
        // paddingBottom matches the mobile mosaic section's
        // paddingTop (48u-m) so the cream/blue handoff is
        // equidistant from the stat text above and the first card
        // row below — mirrors the desktop equidistance fix.
        paddingBottom: "calc(var(--u-m) * 48)",
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
        Since the launch in May, over 1 million challenges have been
        started with a 78% opt-in rate and 58% completion rate. DAU
        has increased by ~9%.
      </p>
    </section>
  );
}

/* Mobile counterpart to DesignSprintsSectionDesktop — same
   content stacked in a narrower column with mobile type scale. */
function DesignSprintsSectionMobile() {
  return (
    <section
      style={{
        // Pure white — see DesignSprintsSectionDesktop for why.
        backgroundColor: "#FFFFFF",
        color: INK,
        paddingTop: "calc(var(--u-m) * 64)",
        paddingBottom: "calc(var(--u-m) * 64)",
        paddingLeft: "calc(var(--u-m) * 16)",
        paddingRight: "calc(var(--u-m) * 16)",
      }}
    >
      <div
        className="flex flex-col items-center"
        style={{ gap: "calc(var(--u-m) * 20)" }}
      >
        <h2
          className="font-serif text-center"
          style={{
            fontSize: "max(12px, calc(var(--u-m) * 32))",
            letterSpacing: "calc(var(--u-m) * -0.64)",
            lineHeight: 1.15,
            margin: 0,
          }}
        >
          Design sprints
        </h2>
        <p
          className="font-sans text-center"
          style={{
            fontSize: "max(12px, calc(var(--u-m) * 14))",
            letterSpacing: "calc(var(--u-m) * -0.42)",
            lineHeight: 1.4,
            margin: 0,
            opacity: 0.85,
          }}
        >
          Early in the year, I worked with leadership to pinpoint the most
          critical open questions, then ran a full design sprint to reimagine
          our Home Tab &mdash; a powerful way to align stakeholders on
          product direction and give the team a clear North Star.
        </p>
        <div style={{ width: "100%", marginTop: "calc(var(--u-m) * 8)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={NOOM_DESIGN_SPRINT_IMAGE}
            alt="Noom design sprint board — how might we, agenda, user problems, and goals"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              borderRadius: "12px",
            }}
          />
        </div>
      </div>
    </section>
  );
}

/* Mobile counterpart to RewardsGamificationSectionDesktop. Same
   content stacked in a single column, with the 4 Streak phones
   flowing through the shared 2-column MobileHorizontalPin grid. */
function RewardsGamificationSectionMobile() {
  return (
    <section
      style={{
        backgroundColor: CREAM,
        color: INK,
        paddingTop: "calc(var(--u-m) * 64)",
        paddingBottom: "calc(var(--u-m) * 64)",
        paddingLeft: "calc(var(--u-m) * 16)",
        paddingRight: "calc(var(--u-m) * 16)",
      }}
    >
      <div
        className="flex flex-col"
        style={{ gap: "calc(var(--u-m) * 20)" }}
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
          How might we keep users engaged with their program?
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
          I helped to build our rewards system from the ground up,
          optimizing for 3 layers of gamification.
        </p>

        {/* 3-row layer table — reads as a compact list on mobile
            with the layer name on top and its question below. */}
        <div
          className="flex flex-col"
          style={{ marginTop: "calc(var(--u-m) * 16)" }}
        >
          {REWARDS_LAYERS.map((layer, i) => (
            <div
              key={layer.label}
              className="flex flex-col"
              style={{
                paddingTop: "calc(var(--u-m) * 16)",
                paddingBottom: "calc(var(--u-m) * 16)",
                borderTop:
                  i === 0 ? undefined : "1px solid rgba(0, 0, 0, 0.12)",
                gap: "calc(var(--u-m) * 4)",
              }}
            >
              <span
                className="font-sans"
                style={{
                  fontSize: "max(12px, calc(var(--u-m) * 14))",
                  letterSpacing: "calc(var(--u-m) * -0.28)",
                  lineHeight: 1.3,
                  fontWeight: 500,
                }}
              >
                {layer.label}
              </span>
              <span
                className="font-sans"
                style={{
                  fontSize: "max(12px, calc(var(--u-m) * 14))",
                  letterSpacing: "calc(var(--u-m) * -0.28)",
                  lineHeight: 1.3,
                  opacity: 0.7,
                }}
              >
                {layer.question}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Streak flow — 4 phones in a 2-column grid, matching the
          rest of the mobile case-study phone rows. */}
      <div style={{ marginTop: "calc(var(--u-m) * 32)" }}>
        <MobileHorizontalPin>
          {STREAK_SCREENS.map(({ src, alt }) => (
            <PhoneMockMobile key={src} src={src} alt={alt} />
          ))}
        </MobileHorizontalPin>
      </div>
    </section>
  );
}

/* PhoneMockMobile — phone-shaped image used by all 3 mobile
   product-row sections. Fixed width (220u-m) matches the BlueApron /
   Neuday MobileHorizontalPin convention so all case-study phone
   rows read at the same scale. Height is derived from the image's
   natural aspect — see PhoneMockDesktop / SCREEN_IMAGES for why no
   aspectRatio wrapper. */
function PhoneMockMobile({ src, alt }: { src: string; alt: string }) {
  return (
    <div style={{ width: "min(calc(var(--u-m) * 220), 100%)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
        }}
        draggable={false}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    </div>
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
        borderRadius: "24px",
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
