"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { HERO_PROJECTS } from "@/app/lib/assets";
import SignatureSection from "./SignatureSection";
import MobileTopNav from "./mobile/MobileTopNav";
import MobileSignature from "./mobile/MobileSignature";
import ArrowUpRight from "./ArrowUpRight";
import Logo from "./Logo";
import ScrollNavLink from "./ScrollNavLink";

/**
 * WorkPage — Figma node 579:1046.
 *
 * Layout (desktop, 1920u canvas):
 *   1. Top nav (logo · WORK · CONTACT · LINKEDIN)
 *   2. Services row — three large serif headers separated by "+"
 *      glyphs (App & Web Design + Brand Identity + Agentic Development)
 *   3. Four project cards stacked vertically, alternating left/right
 *      side. Each card is 813u wide with an image + a footer row
 *      containing the project name, year, and category tag.
 *   4. Signature footer (reused from home page)
 *
 * Mobile collapses to a single column with full-width cards.
 */

// Work page background. Despite the file's "FOREST" naming history,
// the page actually renders the near-black surface (the `--color-forest`
// token is dark green and is only used for cases that need a greener
// tint). Aliasing to the near-black token keeps the value in lock-step
// with the rest of the dark surfaces (Ethos, ContactPage, hero panels).
const BG = "var(--color-near-black)";

const SERVICES = [
  "Product Strategy",
  "App & Web Design",
  "Brand Identity",
  "Agentic Development",
];

interface Project {
  name: string;
  years: string;
  category: string;
  slug: string;
  image: string;
  side: "left" | "right";
  /** Image height in design-units. Wonder is shorter than the rest. */
  imageHeight: number;
}

const PROJECTS: Project[] = [
  {
    name: "Wonder",
    years: "2021-2025",
    category: "App + Web",
    slug: "wonder",
    image: HERO_PROJECTS[0].image,
    side: "left",
    imageHeight: 647,
  },
  {
    name: "Blue Apron",
    years: "2024-2025",
    category: "App",
    slug: "blue-apron",
    image: HERO_PROJECTS[1].image,
    side: "right",
    imageHeight: 730,
  },
  {
    name: "Noom",
    years: "2025-2026",
    category: "App",
    slug: "noom",
    image: HERO_PROJECTS[2].image,
    side: "left",
    imageHeight: 730,
  },
  {
    name: "Neuday",
    years: "2026",
    category: "App",
    slug: "neuday",
    image: HERO_PROJECTS[3].image,
    side: "right",
    imageHeight: 730,
  },
];

export default function WorkPage() {
  const isMobile = useIsMobile();
  return isMobile ? <WorkMobile /> : <WorkDesktop />;
}

/* ───────────────────────────────────────────────────────────────
   DESKTOP
   ─────────────────────────────────────────────────────────────── */

function WorkDesktop() {
  return (
    <main className="relative" style={{ backgroundColor: BG }}>
      <section
        className="relative text-white"
        style={{ backgroundColor: BG }}
      >
        <WorkTopNav variant="desktop" />
        <ServicesRowDesktop />
        <ProjectStackDesktop />
      </section>
      <SignatureSection />
    </main>
  );
}

function WorkTopNav({ variant }: { variant: "desktop" | "mobile" }) {
  const isMobile = variant === "mobile";
  const u = isMobile ? "var(--u-m)" : "var(--u)";

  return (
    <nav
      className="absolute flex items-center justify-between text-white"
      style={{
        left: `calc(${u} * ${isMobile ? 16 : 70})`,
        right: `calc(${u} * ${isMobile ? 16 : 70})`,
        top: `calc(${u} * ${isMobile ? 68 : 57})`,
        height: `calc(${u} * ${isMobile ? 38 : 47})`,
        zIndex: 20,
      }}
    >
      <Link
        href="/"
        aria-label="Home"
        className="flex items-center h-full text-white"
      >
        <Logo height={`calc(${u} * ${isMobile ? 20 : 28})`} />
      </Link>
      <div
        className="flex items-center h-full font-sans"
        style={{
          gap: `calc(${u} * ${isMobile ? 24 : 48})`,
          fontSize: `max(${isMobile ? "12px" : "14px"}, calc(${u} * ${isMobile ? 14 : 20}))`,
          fontWeight: 500,
          letterSpacing: `calc(${u} * ${isMobile ? -0.28 : -0.4})`,
          lineHeight: 1,
        }}
      >
        <span className="flex items-center gap-[0.4em]">
          <span
            className="rounded-full bg-current shrink-0"
            style={{
              width: `calc(${u} * 4)`,
              height: `calc(${u} * 4)`,
            }}
          />
          <span aria-current="page">Work</span>
        </span>
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
  );
}

function ServicesRowDesktop() {
  // The marquee is `position: sticky` so it remains visible while the
  // user scrolls through the project stack. A sentinel placed at the
  // marquee's natural top is used to track how far past that natural
  // position the user has scrolled — that distance drives an opacity
  // + blur fade so the row recedes into the background as cards take
  // over, while the horizontal marquee animation keeps running.
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = sentinelRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Once sentinel scrolls above the viewport top, `-rect.top` is
      // the px we've scrolled past the marquee's natural position.
      const scrolledPast = Math.max(0, -rect.top);
      const FADE_RANGE = 450; // px of scroll over which the fade happens
      setProgress(Math.min(1, scrolledPast / FADE_RANGE));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Easing curves the fade so the start is gentle.
  const eased = progress * progress * (3 - 2 * progress); // smoothstep
  const opacity = 1 - eased * 0.2; // 1 → 0.8 (subtle fade)
  const blur = eased * 6; // 0 → 6px

  // One "set" of the marquee — every service followed by a "+", plus
  // a trailing 44u of padding-right so the gap to the NEXT set is
  // included inside the set itself. This way the marquee track is
  // exactly 2 × setWidth, and the keyframe's `-50%` translation lands
  // set B at the exact pixel position set A originally occupied —
  // making the loop reset mathematically invisible (no jump).
  const renderSet = (keyPrefix: string) => (
    <div
      key={keyPrefix}
      className="flex items-center shrink-0"
      style={{
        gap: "calc(var(--u) * 44)",
        paddingRight: "calc(var(--u) * 44)",
      }}
      aria-hidden={keyPrefix === "b"}
    >
      {SERVICES.map((service, i) => (
        <span
          key={`${keyPrefix}-${i}`}
          className="flex items-center shrink-0"
          style={{ gap: "calc(var(--u) * 44)" }}
        >
          <span className="font-serif whitespace-nowrap">{service}</span>
          <span
            className="font-serif"
            style={{
              lineHeight: 1,
              opacity: 0.7,
            }}
          >
            +
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <>
      {/* 226u of natural top spacing before the sticky marquee starts */}
      <div
        style={{ height: "calc(var(--u) * 226)" }}
        aria-hidden="true"
      />
      {/* Sentinel at the marquee's natural document position — drives
          the scroll-progress calculation above. */}
      <div ref={sentinelRef} aria-hidden="true" />

      {/* Sticky marquee — pins at the top of the viewport once the
          user scrolls past its natural position, then stays there as
          cards scroll up over it. */}
      <div
        className="sticky overflow-hidden text-white"
        style={{
          top: 0,
          fontSize: "max(14px, calc(var(--u) * 90))",
          letterSpacing: "calc(var(--u) * -1.8)",
          lineHeight: 1.1,
          paddingTop: "calc(var(--u) * 24)",
          paddingBottom: "calc(var(--u) * 24)",
          opacity,
          filter: `blur(${blur}px)`,
          transition: "opacity 90ms linear, filter 90ms linear",
          zIndex: 1,
        }}
      >
        <div
          className="flex items-center"
          style={{
            width: "max-content",
            // No outer gap — each set carries its own trailing gap so
            // the duplicated content lines up exactly on loop reset.
            animation: "marquee-left 32s linear infinite",
            willChange: "transform",
          }}
        >
          {renderSet("a")}
          {renderSet("b")}
        </div>
      </div>
    </>
  );
}

function ProjectStackDesktop() {
  return (
    <div
      className="relative flex flex-col"
      style={{
        paddingTop: "calc(var(--u) * 123)",
        paddingBottom: "calc(var(--u) * 187)",
        gap: "calc(var(--u) * 130)",
        // Sit above the sticky marquee so cards scroll OVER it, not under.
        zIndex: 5,
      }}
    >
      {PROJECTS.map((project) => (
        <ProjectCardDesktop key={project.name} project={project} />
      ))}
    </div>
  );
}

function ProjectCardDesktop({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false);
  const isLeft = project.side === "left";

  return (
    <Link
      href={`/work/${project.slug}`}
      className="relative block group"
      style={{
        width: "calc(var(--u) * 813)",
        marginLeft: isLeft ? "calc(var(--u) * 176)" : "auto",
        marginRight: isLeft ? "auto" : "calc(var(--u) * 115)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden"
        style={{
          width: "100%",
          height: `calc(var(--u) * ${project.imageHeight})`,
          // Bumped from 24u to 40u so the rounded corners are clearly
          // visible. The source images have rounded corners baked into
          // their PNGs, but object-cover crops them off on the Work
          // page since the container's aspect doesn't match the image
          // aspect, so the only rounding comes from this CSS.
          borderRadius: "calc(var(--u) * 40)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.image}
          alt={`${project.name} cover`}
          className="size-full object-cover transition-transform duration-700 ease-out"
          style={{ transform: hovered ? "scale(1.03)" : "scale(1)" }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none"
          style={{
            backgroundColor: "rgba(0,0,0,0.55)",
            opacity: hovered ? 1 : 0,
          }}
        >
          <span
            className="font-sans text-white"
            style={{
              fontSize: "max(14px, calc(var(--u) * 18))",
              letterSpacing: "calc(var(--u) * -0.36)",
              lineHeight: 1.1,
            }}
          >
            View project
          </span>
        </div>
      </div>

      {/* Footer row — project name on left, year + category on right */}
      <div
        className="flex items-start text-white"
        style={{
          marginTop: "calc(var(--u) * 24)",
          gap: "calc(var(--u) * 24)",
        }}
      >
        <span
          className="font-serif flex-1 whitespace-nowrap"
          style={{
            fontSize: "max(14px, calc(var(--u) * 48))",
            letterSpacing: "calc(var(--u) * -0.96)",
            lineHeight: 1.1,
          }}
        >
          {project.name}
        </span>
        <div
          className="flex flex-col text-right font-mono"
          style={{
            width: "calc(var(--u) * 153)",
            fontSize: "max(14px, calc(var(--u) * 18))",
            letterSpacing: "calc(var(--u) * -0.9)",
            lineHeight: 1.1,
            gap: "calc(var(--u) * 8)",
          }}
        >
          <span>{project.years}</span>
          <span style={{ opacity: 0.7 }}>{project.category}</span>
        </div>
      </div>
    </Link>
  );
}

/* ───────────────────────────────────────────────────────────────
   MOBILE
   ─────────────────────────────────────────────────────────────── */

function WorkMobile() {
  return (
    <main className="relative" style={{ backgroundColor: BG }}>
      <section
        className="relative text-white"
        style={{
          backgroundColor: BG,
          paddingBottom: "calc(var(--u-m) * 64)",
        }}
      >
        <MobileTopNav mode="overlay" navClassName="text-white" />

        {/* Services row — rotating marquee carousel matching desktop's
            ServicesRowDesktop. Each "set" carries its own trailing gap
            so the duplicated content lines up exactly on loop reset
            (marquee track is 2 × setWidth, keyframe translates -50%). */}
        <ServicesRowMobile />

        {/* Project cards stacked single-column */}
        <div
          className="relative flex flex-col"
          style={{
            paddingTop: "calc(var(--u-m) * 48)",
            paddingLeft: "calc(var(--u-m) * 16)",
            paddingRight: "calc(var(--u-m) * 16)",
            gap: "calc(var(--u-m) * 48)",
          }}
        >
          {PROJECTS.map((project) => (
            <ProjectCardMobile key={project.name} project={project} />
          ))}
        </div>
      </section>

      <MobileSignature />
    </main>
  );
}

function ServicesRowMobile() {
  // One "set" of the marquee — every service followed by a "+", plus a
  // trailing 32u of padding-right so the gap to the NEXT set is included
  // inside the set itself. The marquee track is then exactly 2 ×
  // setWidth, so when the keyframe translates by -50% the duplicated
  // content lands at the same pixel position the original occupied —
  // making the loop reset visually invisible.
  const renderSet = (keyPrefix: string) => (
    <div
      key={keyPrefix}
      className="flex items-center shrink-0"
      style={{
        gap: "calc(var(--u-m) * 32)",
        paddingRight: "calc(var(--u-m) * 32)",
      }}
      aria-hidden={keyPrefix === "b"}
    >
      {SERVICES.map((service, i) => (
        <span
          key={`${keyPrefix}-${i}`}
          className="flex items-center shrink-0"
          style={{ gap: "calc(var(--u-m) * 32)" }}
        >
          <span className="font-serif whitespace-nowrap">{service}</span>
          <span
            className="font-serif"
            style={{
              lineHeight: 1,
              opacity: 0.7,
            }}
          >
            +
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      className="relative overflow-hidden text-white"
      style={{
        paddingTop: "calc(var(--u-m) * 140)",
        paddingBottom: "calc(var(--u-m) * 16)",
        // 36u-m matches MobileTopNav's wordmark size — a known
        // "display" token in the mobile scale. At this size the
        // longest service ("Agentic Development", 19 chars) renders
        // around 342u-m which fits comfortably inside the 390u-m
        // mobile viewport with ~24u-m of breathing room on each side.
        // letterSpacing stays at -2% of the font (= -0.72u-m).
        fontSize: "max(12px, calc(var(--u-m) * 36))",
        letterSpacing: "calc(var(--u-m) * -0.72)",
        lineHeight: 1.1,
      }}
    >
      <div
        className="flex items-center"
        style={{
          width: "max-content",
          // No outer gap — each set carries its own trailing gap so the
          // duplicated content lines up exactly on loop reset.
          animation: "marquee-left 24s linear infinite",
          willChange: "transform",
        }}
      >
        {renderSet("a")}
        {renderSet("b")}
      </div>
    </div>
  );
}

function ProjectCardMobile({ project }: { project: Project }) {
  return (
    <Link href={`/work/${project.slug}`} className="flex flex-col">
      <div
        className="relative overflow-hidden"
        style={{
          width: "100%",
          // Unified aspect across all four cards so the mobile stack
          // reads as a consistent grid instead of Wonder being
          // noticeably shorter than the others. 813:730 is the same
          // ratio 3 of 4 cards already use on desktop (Blue Apron /
          // Noom / Neuday), so this also keeps the mobile row visually
          // in sync with the desktop proportions. object-cover handles
          // any minor crop on the Wonder source (which has imageHeight
          // 647 on desktop) without distorting the image.
          aspectRatio: "813 / 730",
          // Matches desktop's radius-to-card-width ratio (40 / 813 ≈
          // 4.92% on desktop; 18 / 358 ≈ 5.0% on mobile after the 16u
          // side padding). Keeps the corner softness visually
          // consistent with desktop rather than reading heavier.
          borderRadius: "calc(var(--u-m) * 18)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.image}
          alt={`${project.name} cover`}
          className="size-full object-cover"
        />
      </div>
      <div
        className="flex items-start text-white"
        style={{
          marginTop: "calc(var(--u-m) * 16)",
          gap: "calc(var(--u-m) * 16)",
        }}
      >
        <span
          className="font-serif flex-1 whitespace-nowrap"
          style={{
            fontSize: "max(12px, calc(var(--u-m) * 28))",
            letterSpacing: "calc(var(--u-m) * -0.56)",
            lineHeight: 1.1,
          }}
        >
          {project.name}
        </span>
        <div
          className="flex flex-col text-right font-mono"
          style={{
            fontSize: "max(12px, calc(var(--u-m) * 12))",
            letterSpacing: "calc(var(--u-m) * -0.6)",
            lineHeight: 1.1,
            gap: "calc(var(--u-m) * 4)",
          }}
        >
          <span>{project.years}</span>
          <span style={{ opacity: 0.7 }}>{project.category}</span>
        </div>
      </div>
    </Link>
  );
}
