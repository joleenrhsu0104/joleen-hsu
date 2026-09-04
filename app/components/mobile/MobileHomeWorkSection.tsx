"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HERO_PROJECTS } from "@/app/lib/assets";

// Viewport width above which we alternate cards left / right (like
// desktop). Below this, the alternation looks cramped — both sides
// end up too close to center, so we fall back to a centered stack.
const ALTERNATE_MIN_VW = 600;

/**
 * MobileHomeWorkSection — mobile counterpart to HomeWorkSection.
 *
 * Top: horizontally scrolling marquee of services
 * ("App & Web Design + Brand Identity + Agentic Development + ...")
 * — same component as WorkPage mobile's ServicesRowMobile.
 *
 * Below: single-column stack of 4 project cards on a dark near-black
 * bg. Each card has a full-width image (813:730 unified aspect)
 * and a footer row with project name + year + category. Tapping
 * the card navigates to that project's case study.
 *
 * Mobile doesn't use ScrollBgSync so the bg is a static
 * --color-near-black token. Static dark surface matches
 * MobileWhatIDoSection below it for a seamless dark band.
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
}

const PROJECTS: Project[] = [
  {
    name: "Wonder",
    years: "2021-2025",
    category: "App + Web",
    slug: "wonder",
    image: HERO_PROJECTS[0].image,
  },
  {
    name: "Blue Apron",
    years: "2024-2025",
    category: "App",
    slug: "blue-apron",
    image: HERO_PROJECTS[1].image,
  },
  {
    name: "Noom",
    years: "2025-2026",
    category: "App",
    slug: "noom",
    image: HERO_PROJECTS[2].image,
  },
  {
    name: "Neuday",
    years: "2026",
    category: "App",
    slug: "neuday",
    image: HERO_PROJECTS[3].image,
  },
];

export default function MobileHomeWorkSection() {
  // Track whether the viewport is wide enough that alternating
  // left/right card alignment reads distinctly (like desktop).
  // SSR-renders as `false` so narrow phones get the centered stack
  // on first paint without a layout jump.
  const [alternate, setAlternate] = useState(false);
  useEffect(() => {
    const check = () => setAlternate(window.innerWidth >= ALTERNATE_MIN_VW);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <section
      id="work"
      className="relative bg-[var(--color-near-black)] text-white"
    >
      <ServicesRowMobile />
      <div
        className="flex flex-col"
        style={{
          paddingTop: "calc(var(--u-m) * 64)",
          paddingBottom: "calc(var(--u-m) * 64)",
          paddingLeft: "calc(var(--u-m) * 16)",
          paddingRight: "calc(var(--u-m) * 16)",
          gap: "calc(var(--u-m) * 48)",
        }}
      >
        {PROJECTS.map((project, i) => (
          <ProjectCardMobile
            key={project.name}
            project={project}
            side={
              alternate ? (i % 2 === 0 ? "left" : "right") : "center"
            }
          />
        ))}
      </div>
    </section>
  );
}

function ServicesRowMobile() {
  const renderSet = (keyPrefix: string) => (
    <div
      key={keyPrefix}
      className="flex items-center shrink-0"
      style={{
        gap: "calc(var(--u-m) * 20)",
        paddingRight: "calc(var(--u-m) * 20)",
      }}
      aria-hidden={keyPrefix === "b"}
    >
      {SERVICES.map((service, i) => (
        <span
          key={`${keyPrefix}-${i}`}
          className="flex items-center shrink-0"
          style={{ gap: "calc(var(--u-m) * 20)" }}
        >
          <span className="font-serif whitespace-nowrap">{service}</span>
          <span
            className="font-serif"
            style={{ lineHeight: 1, opacity: 0.7 }}
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
        paddingTop: "calc(var(--u-m) * 64)",
        paddingBottom: "calc(var(--u-m) * 16)",
        fontSize: "max(12px, calc(var(--u-m) * 36))",
        letterSpacing: "calc(var(--u-m) * -0.72)",
        lineHeight: 1.1,
      }}
    >
      <div
        className="flex items-center"
        style={{
          width: "max-content",
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

function ProjectCardMobile({
  project,
  side,
}: {
  project: Project;
  side: "left" | "right" | "center";
}) {
  // Center variant matches the narrow-phone stack: full width up
  // to a 400px ceiling, mx-auto. Alternating variants shrink cards
  // and hug the outer edge on their side (mirroring the desktop
  // ProjectCardDesktop pattern), while the empty half gives the
  // opposite side of the column visible breathing room so the
  // alternation actually reads at a glance.
  const isCentered = side === "center";
  return (
    <Link
      href={`/work/${project.slug}`}
      className="flex flex-col"
      style={{
        width: isCentered ? "min(100%, 400px)" : "min(100%, 380px)",
        marginLeft: side === "right" ? "auto" : side === "left" ? 0 : "auto",
        marginRight: side === "left" ? "auto" : side === "right" ? 0 : "auto",
      }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          width: "100%",
          // Unified 813:730 aspect across all four cards — same as
          // WorkPage mobile so cards read at consistent sizes.
          aspectRatio: "813 / 730",
          borderRadius: "12px",
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
            // Font capped so it doesn't balloon on tablet-width
            // mobile viewports where --u-m sits at its 1.3 ceiling.
            fontSize: "min(28px, max(12px, calc(var(--u-m) * 28)))",
            letterSpacing: "calc(var(--u-m) * -0.56)",
            lineHeight: 1.1,
          }}
        >
          {project.name}
        </span>
        <div
          className="flex flex-col text-right font-sans"
          style={{
            fontSize: "min(14px, max(12px, calc(var(--u-m) * 12)))",
            letterSpacing: "calc(var(--u-m) * -0.24)",
            lineHeight: 1.1,
            gap: "calc(var(--u-m) * 4)",
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
