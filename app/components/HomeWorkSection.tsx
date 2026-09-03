"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HERO_PROJECTS } from "@/app/lib/assets";

/**
 * HomeWorkSection — desktop project cards stack on the home page,
 * replicated from the Work page's ServicesRowDesktop + ProjectStackDesktop.
 *
 * Layout (top → bottom):
 *   1. Sticky skills marquee — horizontally scrolling row of services
 *      ("App & Web Design + Brand Identity + Agentic Development + ...")
 *      that pins to the viewport top once the user scrolls past it,
 *      then fades + blurs as the project cards take over.
 *   2. Four project cards, alternating left/right side of the canvas.
 *      Each card = 813u wide image with rounded corners + a footer row
 *      (project name on left, year + category on right). Hover reveals
 *      a darkened "View project" overlay on the image.
 *
 * Carries `id="ethos"` so ScrollBgSync's cream→dark transition
 * triggers when THIS section enters the viewport (instead of when
 * the WhatIDoSection below enters). The bg reads --scroll-bg with
 * a near-black fallback so the transition blends seamlessly with
 * the WhatIDoSection that follows.
 *
 * Source-of-truth note: SERVICES + PROJECTS arrays are duplicated
 * from WorkPage.tsx. If either changes there, this file should
 * stay in sync. A future refactor could extract both into a
 * shared `app/lib/workProjects.ts` module.
 */

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
    imageHeight: 730,
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

export default function HomeWorkSection() {
  return (
    <section
      id="work"
      className="relative text-white"
      style={{
        // Hardcoded near-black instead of reading --scroll-bg.
        // The old --scroll-bg dependency existed so the cream→dark
        // transition (Phase 1) could fade the section in from the
        // cream AboutSentences above; with OpeningSequence (dark
        // from the start) replacing AboutSentences, the boundary
        // above is already dark, so no fade is needed — and reading
        // --scroll-bg directly would briefly flash cream as Phase 1
        // engages when this section first enters the viewport.
        // WhatIDoSection below still reads --scroll-bg, so Phase 1
        // continues to keep --scroll-bg in lock-step with the
        // surrounding dark surfaces.
        backgroundColor: "var(--color-near-black)",
        paddingBottom: "calc(var(--u) * 160)",
      }}
    >
      <ServicesRowDesktop />
      <ProjectStackDesktop />
    </section>
  );
}

function ServicesRowDesktop() {
  // Same scroll-fade behavior as WorkPage.tsx — sticky marquee that
  // pins to the viewport top once scrolled past, then opacity+blur
  // fades as the cards begin to scroll over it.
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = sentinelRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrolledPast = Math.max(0, -rect.top);
      const FADE_RANGE = 450;
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

  const eased = progress * progress * (3 - 2 * progress);
  const opacity = 1 - eased * 0.2;
  const blur = eased * 6;

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
      {/* 160u of natural top spacing before the marquee starts —
          slightly less than the Work page's 226u since the home
          page already has the AboutSentences scroll-jack above. */}
      <div
        style={{ height: "calc(var(--u) * 160)" }}
        aria-hidden="true"
      />
      <div ref={sentinelRef} aria-hidden="true" />

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
        gap: "calc(var(--u) * 130)",
        // Sit above the sticky marquee so cards scroll OVER it.
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
          borderRadius: "4px",
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
          className="flex flex-col text-right font-sans"
          style={{
            fontSize: "max(14px, calc(var(--u) * 18))",
            letterSpacing: "calc(var(--u) * -0.36)",
            lineHeight: 1.1,
            gap: "calc(var(--u) * 8)",
          }}
        >
          <span className="whitespace-nowrap">{project.years}</span>
          <span className="whitespace-nowrap" style={{ opacity: 0.7 }}>
            {project.category}
          </span>
        </div>
      </div>
    </Link>
  );
}
