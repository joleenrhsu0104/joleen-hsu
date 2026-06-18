"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HERO_PROJECTS } from "@/app/lib/assets";
import ArrowUpRight from "./ArrowUpRight";

/**
 * CyclingHero
 *
 * Implements the "loading animation as you scroll through, the subsequent
 * 3 screens show" annotation from the Figma home frame, combined with a
 * Façon-Générale-style scrolljacking effect: while the hero fills the
 * viewport, wheel/touch input advances projects one at a time with a
 * locked animation duration. After the last project, the page releases
 * and continues scrolling normally into the About section.
 *
 * Reveal: each new project image clip-path-opens horizontally from a
 * vertical seam at the center, layering on top of all previous projects
 * (z-index ascends by index).
 */
const TRANSITION_MS = 520;
// Animation lock — after each advance, swallow every wheel event for
// this long so the snap animation can play out cleanly.
const LOCK_MS = 520;
// Trackpad momentum events that fall below this absolute deltaY are
// treated as the dying tail of a previous swipe, not as a fresh user
// intent. Filtering them prevents momentum from chaining a second
// project advance once the animation lock expires, while staying low
// enough that legitimate trackpad swipes (deltas ≥ 20) always read
// through.
const MIN_INTENT_DELTA = 15;
// When the user reaches the last project and exits the hero into the
// About section, hold the lock long enough that the smooth-scroll
// transition has time to finish before any further scroll can fire.
const BOUNDARY_EXIT_MS = 1200;

export default function CyclingHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const indexRef = useRef(0);
  const lockedUntilRef = useRef(0);

  // Keep the ref in sync with state so the wheel handler always reads
  // the latest index without re-binding the listener on every change.
  useEffect(() => {
    indexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const section = containerRef.current;
    if (!section) return;

    const handleWheel = (e: WheelEvent) => {
      const rect = section.getBoundingClientRect();
      // Hero is "in control" when it fully covers the viewport.
      const heroIsActive =
        rect.top <= 0 && rect.bottom >= window.innerHeight;
      if (!heroIsActive) return;

      // While the hero is active, the page never scrolls — every
      // wheel event is either consumed by an advance or absorbed.
      e.preventDefault();

      // Filter trackpad momentum tail. After the user has released,
      // wheel events keep firing with decaying deltas; once those
      // deltas drop below MIN_INTENT_DELTA we treat them as inertia,
      // not as "scroll again". Intentional swipes/clicks have larger
      // deltas and always read through.
      if (Math.abs(e.deltaY) < MIN_INTENT_DELTA) return;

      const now = Date.now();

      // Snap animation still playing — absorb without changing state.
      if (now < lockedUntilRef.current) {
        return;
      }

      const direction = e.deltaY > 0 ? 1 : -1;
      const current = indexRef.current;
      const next = current + direction;

      // Past the last project — exit the hero by smooth-scrolling to
      // the About section.
      if (next >= HERO_PROJECTS.length) {
        const about = document.getElementById("about");
        if (about) {
          lockedUntilRef.current = now + BOUNDARY_EXIT_MS;
          about.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return;
      }
      if (next < 0) {
        // Nothing above the hero — absorb and stay put.
        return;
      }

      lockedUntilRef.current = now + LOCK_MS;
      indexRef.current = next;
      setActiveIndex(next);
    };

    // passive:false is required to call preventDefault inside a wheel listener.
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-screen overflow-hidden"
      style={{
        // Active project's bg color — used as a fallback under the
        // blurred ambient image layer (visible briefly during initial
        // image load and as a subtle base tint).
        backgroundColor: HERO_PROJECTS[activeIndex].bg,
        transition: `background-color ${TRANSITION_MS}ms ease-out`,
      }}
      aria-label="Featured work"
    >
      {/* Ambient blurred background — same image as the centered
          rectangle, but full viewport, scaled up, heavily blurred.
          Crossfades on the same timeline as the foreground shutter
          reveal so the bg breathes with the project change. A soft
          dark overlay sits above to keep the cream foreground text
          readable across all four palettes. */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        {HERO_PROJECTS.map((project, i) => (
          <Image
            key={`bg-${project.name}`}
            fill
            src={project.image}
            alt=""
            sizes="100vw"
            // priority on the FIRST project's background image so it
            // preloads — this is the LCP image on the home page.
            // PageSpeed flagged "LCP request discovery" as red before
            // this prop was added.
            priority={i === 0}
            style={{
              objectFit: "cover",
              opacity: i === activeIndex ? 1 : 0,
              transform: "scale(1.35)",
              filter: "blur(36px) saturate(1.15)",
              transition: `opacity ${TRANSITION_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`,
            }}
          />
        ))}
        {/* Subtle dark wash to lift foreground contrast — lighter
            now (10% instead of 20%) so the ambient bg reads with
            more presence. */}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div
        className="relative mx-auto h-full"
        style={{
          width: "calc(var(--u) * 1920)",
          height: "calc(var(--u) * 1170)",
        }}
      >
        {/* Top nav */}
        <nav
          className="absolute flex items-center justify-between text-white"
          style={{
            left: "calc(var(--u) * 70)",
            top: "calc(var(--u) * 57)",
            width: "calc(var(--u) * 1780)",
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
            <Link href="/contact" className="hover:opacity-70 transition-opacity">
              CONTACT
            </Link>
            <a
              href="https://www.linkedin.com/in/joleenhsu/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-baseline gap-[4px] hover:opacity-70 transition-opacity"
            >
              LINKEDIN
              <ArrowUpRight />
            </a>
          </div>
        </nav>

        {/* Year, image, and counter are three INDEPENDENT absolute
            elements that share the exact same left/width, so their
            horizontal alignment cannot drift. Vertical positioning
            anchors the image's center at 50vh; year sits 8px above
            the image, counter sits 8px below. */}

        {/* Year — same left & width as image; text-aligned to the LEFT edge */}
        <div
          className="absolute font-mono text-white"
          style={{
            left: "calc(var(--u) * 692)",
            top: "calc(50vh - var(--u) * 365 - 8px - var(--u) * 31)",
            width: "calc(var(--u) * 535)",
            height: "calc(var(--u) * 31)",
            fontSize: "calc(var(--u) * 16)",
            letterSpacing: "calc(var(--u) * -0.8)",
            lineHeight: "calc(var(--u) * 31)",
            textAlign: "left",
            zIndex: 1,
          }}
        >
          {HERO_PROJECTS[activeIndex].years}
        </div>

        {/* Shutter-reveal image stack — the active project's image
            opens horizontally from a vertical seam at the center,
            layering on top of all previously-revealed projects.
            Inspired by the Façon Générale Webflow scroll slider.
            The whole stack is wrapped in a Link when the active
            project has a case study page, so the visible card is
            tappable. Blue Apron has no case study yet so we fall
            through to a plain div for that index. */}
        {(() => {
          const active = HERO_PROJECTS[activeIndex] as typeof HERO_PROJECTS[number] & { href?: string };
          const stackChildren = HERO_PROJECTS.map((project, i) => (
            <div
              key={project.name}
              className="absolute inset-0"
              style={{
                zIndex: i,
                clipPath:
                  i <= activeIndex
                    ? "inset(0 0 0 0)"
                    : "inset(0 50% 0 50%)",
                transition: `clip-path ${TRANSITION_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`,
              }}
            >
              <Image
                fill
                src={project.image}
                alt={`${project.name} project`}
                sizes="(max-width: 768px) 100vw, 535px"
                // priority on the FIRST project's foreground card
                // image too — same LCP-preload rationale as the
                // background layer above. The crossfade animation
                // still works because the priority prop just
                // controls whether the loader treats this as a
                // critical resource.
                priority={i === 0}
                style={{ objectFit: "cover" }}
              />
            </div>
          ));
          const stackStyle = {
            left: "calc(var(--u) * 692)",
            top: "calc(50vh - var(--u) * 365)",
            width: "calc(var(--u) * 535)",
            height: "calc(var(--u) * 730)",
            borderRadius: "calc(var(--u) * 24)",
            zIndex: 1,
          } as const;
          return active.href ? (
            <Link
              href={active.href}
              aria-label={`Open ${active.name} case study`}
              className="absolute overflow-hidden block cursor-pointer"
              style={stackStyle}
            >
              {stackChildren}
            </Link>
          ) : (
            <div className="absolute overflow-hidden" style={stackStyle}>
              {stackChildren}
            </div>
          );
        })()}

        {/* Counter — same left & width as image; text-aligned to the RIGHT edge */}
        <div
          className="absolute font-mono text-white"
          style={{
            left: "calc(var(--u) * 692)",
            top: "calc(50vh + var(--u) * 365 + 8px)",
            width: "calc(var(--u) * 535)",
            height: "calc(var(--u) * 31)",
            fontSize: "calc(var(--u) * 16)",
            letterSpacing: "calc(var(--u) * -0.8)",
            lineHeight: "calc(var(--u) * 31)",
            textAlign: "right",
            zIndex: 1,
          }}
        >
          {HERO_PROJECTS[activeIndex].counter}
        </div>

        {/* Giant project name overlay — sits ABOVE the image stack
            (zIndex 10) so the project title is always visible while
            cycling. Crossfades between projects.
            Centered both horizontally AND vertically on the image:
            overlay height 384u, image center at 50vh → overlay top =
            50vh - 192u so the overlay's center matches the image's. */}
        <div
          className="absolute pointer-events-none flex items-center justify-center"
          style={{
            left: "calc(var(--u) * 305)",
            top: "calc(50vh - var(--u) * 192)",
            width: "calc(var(--u) * 1310)",
            height: "calc(var(--u) * 384)",
            zIndex: 10,
          }}
        >
          {HERO_PROJECTS.map((project, i) => (
            <span
              key={project.name}
              className="absolute font-serif text-center transition-opacity duration-500 ease-out"
              style={{
                color: "var(--color-cream-bright)",
                fontSize: "calc(var(--u) * 350)",
                letterSpacing: "calc(var(--u) * -7)",
                lineHeight: 1.2,
                textShadow:
                  "0 calc(var(--u) * 4) calc(var(--u) * 15) rgba(0,0,0,0.25)",
                opacity: i === activeIndex ? 0.75 : 0,
              }}
            >
              {project.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
