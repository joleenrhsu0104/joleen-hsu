"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HERO_PROJECTS } from "@/app/lib/assets";
import MobileTopNav from "./MobileTopNav";

/**
 * MobileHero
 *
 * Cycling is scroll-position driven (no scrolljacking, no auto-timer):
 * the section is a tall (400vh) scroll container; a sticky inner stage
 * pins to the viewport while scroll progress maps to project index.
 * Works naturally with mobile touch scroll.
 *
 * Layout mirrors the desktop CyclingHero pattern:
 *   • Year, image, counter all share a vertical column centered at 50vh
 *     so the entire group is balanced no matter the viewport height.
 *   • A giant project name sits at z-index 10 ON TOP of the image —
 *     same composition as desktop, just scaled for the narrower canvas.
 *   • A blurred backdrop of the active project's image fills the
 *     stage so the ambient color reads through, matching desktop.
 *
 * --u-m is overridden to the smaller of width-fit (100vw / 390) and
 * height-fit (100vh / 700) so the hero card + year + counter + project
 * name always fit inside one viewport at any aspect ratio. The 700u
 * budget covers ~263u of content above 50vh (year + 8px gap + half
 * image) plus matching 263u below, with breathing room for the header.
 */
const TRANSITION_MS = 900;
// Image card geometry, in mobile design units (canvas is 390 wide).
// Width 320u centered → 35u of breathing room on each side.
// Height 448u keeps the natural hero PNG portrait aspect (~0.71).
const IMG_W = 320;
const IMG_H = 448;
const IMG_HALF_H = IMG_H / 2;

// Header chrome (joleen wordmark + hamburger) sits at top: 24u-m with
// height 38u-m → bottom edge at 62u-m below the viewport top. The card
// group is anchored to 50vh, but with no equivalent chrome at the
// bottom, that anchoring leaves visibly less padding above the cards
// than below them. Shift the group down by half the header chrome
// (31u-m) so the optical center sits exactly between header-bottom and
// viewport-bottom, giving symmetric top/bottom margins around the
// cards.
const HEADER_OFFSET = 31;

// Project-name font size for the giant overlay, in design units.
// Single value used for every name. At 80u-m every name — including
// the widest "Blue Apron" — fits cleanly within the viewport width
// at any common mobile size, so nothing clips at the edges. Multi-
// word names still wrap to two lines via the pre-line / replace(" "
// → "\n") trick below so the same font reads as a stacked title.
const NAME_FONT_SIZE = 80;
// Letter spacing as a fraction of font size — matches the desktop
// hero's ratio (-7u / 350u ≈ -0.02) so the tracking still reads tight.
const NAME_LETTER_SPACING = NAME_FONT_SIZE * -0.02;
// Very tight line-height so the two lines of a wrapped name ("Blue
// Apron") sit nearly stacked. At 0.7 the cap-height of the lower line
// nearly touches the baseline of the upper line — works for Blue/Apron
// because neither line carries a descender that crosses into the other.
const NAME_LINE_HEIGHT = 0.7;

// Project names whose hero photo is light-on-light (warm food shots,
// pale rebrand mosaic) and therefore needs a brightness pass so the
// cream-white project name reads with stronger contrast on top.
const DARKEN_NAMES = new Set(["Blue Apron", "Noom"]);
const DARKEN_BRIGHTNESS = 0.75;

export default function MobileHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / total));
      const idx = Math.min(
        HERO_PROJECTS.length - 1,
        Math.floor(progress * HERO_PROJECTS.length),
      );
      setActiveIndex(idx);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Enable CSS scroll-snap on the page-level scroller while the user is
  // actively inside the hero, then release it the moment they scroll
  // past so the rest of the page (MobileAboutSentences, etc.) scrolls
  // freely. Without this toggle, mandatory snap would keep pulling the
  // user back to the hero's last snap target even after they've moved
  // into the next section. The cleanup restores whatever scroll-snap-
  // type was set before mount, so navigating off the home page also
  // goes back to normal scrolling.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const html = document.documentElement;
    const originalSnap = html.style.scrollSnapType;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      // Snap engages while ANY part of the hero is still visible from
      // the top — i.e., the section has been scrolled into but its
      // bottom hasn't crossed the viewport top yet. Once rect.bottom
      // goes to 0 or negative, the user has scrolled past the hero and
      // we drop snap so the next sections can scroll freely.
      const isActive = rect.top <= 0 && rect.bottom > 0;
      html.style.scrollSnapType = isActive ? "y mandatory" : originalSnap;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      html.style.scrollSnapType = originalSnap;
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative"
      style={{
        backgroundColor: HERO_PROJECTS[activeIndex].bg,
        transition: "background-color 700ms ease-out",
        height: "400vh",
      }}
      aria-label="Featured work"
    >
      {/* Invisible snap-target markers — one per project, placed at the
          start of each 100vh slice of the section. With the page-level
          scroll-snap-type set to mandatory above, the browser stops on
          each marker as the user swipes, so one swipe = one project
          advance. scroll-snap-stop: always also prevents fast swipes
          from skipping over projects.

          A final EXIT marker is placed at top: 400vh (the section's
          bottom). Without it, the user gets trapped on the last project
          because mandatory snap has no downward target to advance to.
          With the exit marker, one more swipe past the last project
          snaps the viewport to the end of the hero, releasing the snap
          and letting the user continue scrolling into the next section
          freely (no snap targets in the sections below mean the browser
          stops trying to snap once we've passed this marker). */}
      {[...HERO_PROJECTS.map((_, i) => i), HERO_PROJECTS.length].map((i) => (
        <div
          key={`snap-${i}`}
          aria-hidden="true"
          className="absolute left-0 pointer-events-none"
          style={{
            top: `${i * 100}vh`,
            width: 0,
            height: "1px",
            scrollSnapAlign: "start",
            scrollSnapStop: "always",
          }}
        />
      ))}
      {/* Sticky stage — pinned to viewport while the tall container scrolls.
          NOTE: --u-m override moved off this wrapper and onto the inner
          stage below so that MobileTopNav (rendered inside this sticky
          stage) inherits the DEFAULT --u-m (= 100vw / 390). Without
          this split the header on the home page shrinks alongside the
          hero column on wide-but-short viewports, while Work + the case
          studies (which have no --u-m override anywhere) render the
          header at the natural size — making Work feel "bigger". */}
      <div
        className="sticky top-0 overflow-hidden"
        style={{
          height: "100vh",
          width: "100%",
        }}
      >
        {/* Ambient blurred backdrop — same crossfade pattern as desktop
            CyclingHero: each project's hero image rendered full-bleed,
            scaled up, blurred + saturated, with a soft dark wash on top.
            Provides the cohesive "color breathes through the room" feel
            between desktop and mobile. */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          {HERO_PROJECTS.map((project, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`bg-${project.name}`}
              src={project.image}
              alt=""
              className="absolute inset-0 size-full object-cover"
              style={{
                opacity: i === activeIndex ? 1 : 0,
                transform: "scale(1.35)",
                // Match the card's darker treatment for light-on-light
                // hero photos so the cream project name reads with
                // consistent contrast across the entire viewport, not
                // just over the card.
                filter: DARKEN_NAMES.has(project.name)
                  ? `blur(36px) saturate(1.15) brightness(${DARKEN_BRIGHTNESS})`
                  : "blur(36px) saturate(1.15)",
                transition: `opacity ${TRANSITION_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`,
              }}
            />
          ))}
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Universal mobile header — joleen + hamburger drawer.
            Rendered OUTSIDE the --u-m-override stage below so the
            header uses the default 100vw/390 sizing and matches the
            header on every other mobile page. */}
        <MobileTopNav mode="overlay" navClassName="text-white" />

        {/* Inner hero column — owns the --u-m override that keeps the
            year/image/counter/name overlay within one viewport height
            on wide-but-short displays. Scoping the override here (not
            on the sticky stage) prevents it from shrinking the
            MobileTopNav above. */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={
            {
              ["--u-m" as string]:
                "min(calc(100vw / 390), calc(100vh / 700))",
            } as React.CSSProperties
          }
        >
        {/* Year — sits 8px above the image, left-aligned against the
            image's left edge. Anchored to 50vh so it shifts together
            with the image group when viewport height changes. */}
        <div
          className="absolute font-mono text-white"
          style={{
            left: `calc(50% - var(--u-m) * ${IMG_W / 2})`,
            top: `calc(50vh - var(--u-m) * ${IMG_HALF_H} - 8px - var(--u-m) * 31 + var(--u-m) * ${HEADER_OFFSET})`,
            width: `calc(var(--u-m) * ${IMG_W})`,
            height: "calc(var(--u-m) * 31)",
            fontSize: "max(12px, calc(var(--u-m) * 14))",
            letterSpacing: "calc(var(--u-m) * -0.7)",
            lineHeight: "calc(var(--u-m) * 31)",
            textAlign: "left",
            zIndex: 1,
          }}
        >
          {HERO_PROJECTS[activeIndex].years}
        </div>

        {/* Cycling image — vertically centered at 50vh.
            Same shutter-reveal clip-path stack as desktop: each new
            project image opens horizontally from a vertical seam at the
            center, layering on top of all previously-revealed projects.
            The card is wrapped in a Link so tapping it navigates to
            the active project's case study. pointerEvents: "auto"
            restores clickability that the parent wrapper's
            pointer-events:none disables (the wrapper has to stay
            non-interactive so vertical swipes pass through to the
            scroll-snap container that drives the project cycle). */}
        <Link
          href={HERO_PROJECTS[activeIndex].href}
          aria-label={`View ${HERO_PROJECTS[activeIndex].name} case study`}
          className="absolute overflow-hidden"
          style={{
            left: `calc(50% - var(--u-m) * ${IMG_W / 2})`,
            top: `calc(50vh - var(--u-m) * ${IMG_HALF_H} + var(--u-m) * ${HEADER_OFFSET})`,
            width: `calc(var(--u-m) * ${IMG_W})`,
            height: `calc(var(--u-m) * ${IMG_H})`,
            borderRadius: "calc(var(--u-m) * 16)",
            zIndex: 1,
            pointerEvents: "auto",
          }}
        >
          {HERO_PROJECTS.map((project, i) => (
            <div
              key={project.name}
              className="absolute inset-0"
              style={{
                zIndex: i,
                clipPath:
                  i <= activeIndex
                    ? "inset(0 0 0 0)"
                    : "inset(0 50% 0 50%)",
                transition: `clip-path ${TRANSITION_MS}ms cubic-bezier(0.77, 0, 0.175, 1)`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.image}
                alt={`${project.name} project`}
                className="size-full object-cover"
                style={{
                  // Darken light-on-light hero photos (warm food shot,
                  // pale rebrand mosaic) so the cream-white project
                  // name reads with stronger contrast on top. The other
                  // images already have enough dark area to support
                  // white type, so they keep their natural brightness.
                  filter: DARKEN_NAMES.has(project.name)
                    ? `brightness(${DARKEN_BRIGHTNESS})`
                    : undefined,
                }}
              />
            </div>
          ))}
        </Link>

        {/* Counter — 8px below the image, right-aligned against the
            image's right edge. */}
        <div
          className="absolute font-mono text-white"
          style={{
            left: `calc(50% - var(--u-m) * ${IMG_W / 2})`,
            top: `calc(50vh + var(--u-m) * ${IMG_HALF_H} + 8px + var(--u-m) * ${HEADER_OFFSET})`,
            width: `calc(var(--u-m) * ${IMG_W})`,
            height: "calc(var(--u-m) * 31)",
            fontSize: "max(12px, calc(var(--u-m) * 14))",
            letterSpacing: "calc(var(--u-m) * -0.7)",
            lineHeight: "calc(var(--u-m) * 31)",
            textAlign: "right",
            zIndex: 1,
          }}
        >
          {HERO_PROJECTS[activeIndex].counter}
        </div>

        {/* Giant project name overlay — sits ABOVE the image stack
            (z-index 10) so the project title is always visible while
            cycling, exactly like desktop. The overlay spans the full
            viewport width so the centered text has full canvas room.

            Every name renders at the same font (80u-m). At this size
            even the widest name ("Blue Apron") fits cleanly on a
            single line within the viewport — no wrap, no two-line
            stack — so the title reads as a single horizontal label
            across all four projects. */}
        <div
          className="absolute pointer-events-none flex items-center justify-center"
          style={{
            left: 0,
            right: 0,
            top: `calc(50vh - var(--u-m) * 220 + var(--u-m) * ${HEADER_OFFSET})`,
            height: "calc(var(--u-m) * 440)",
            zIndex: 10,
          }}
        >
          {HERO_PROJECTS.map((project, i) => (
            <span
              key={project.name}
              className="absolute font-serif text-center transition-opacity duration-700 ease-out"
              style={{
                color: "var(--color-cream-bright)",
                fontSize: `max(12px, calc(var(--u-m) * ${NAME_FONT_SIZE}))`,
                letterSpacing: `calc(var(--u-m) * ${NAME_LETTER_SPACING})`,
                lineHeight: NAME_LINE_HEIGHT,
                textShadow:
                  "0 calc(var(--u-m) * 4) calc(var(--u-m) * 15) rgba(0,0,0,0.25)",
                opacity: i === activeIndex ? 1 : 0,
                whiteSpace: "nowrap",
              }}
            >
              {project.name}
            </span>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}
