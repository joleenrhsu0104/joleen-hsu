"use client";

import { useEffect, useRef, useState } from "react";
import ArrowUpRight from "../ArrowUpRight";
import ScrollNavLink from "../ScrollNavLink";

/**
 * MobileOpeningSequence — mobile counterpart to the desktop
 * OpeningSequence. Mirrors the desktop composition on a narrower
 * canvas:
 *
 *   • Top-left: live Los Angeles time
 *   • Top-right: horizontal Work / Contact / LinkedIn nav
 *     (matches the mobile signature footer for consistency)
 *   • Centered: JOLEEN.DESIGN logo image
 *   • Around the logo: 5 floating image tiles, drift-animated via
 *     CSS (no cursor-repulsion on touch devices)
 *   • Bottom: bio caption + taste caption stacked, matching the
 *     serif-italic-in-parentheses treatment from desktop
 *
 * Sizes use the mobile design-unit token (--u-m = 100vw / 390) so
 * everything scales fluidly to the actual phone width.
 */

// Live LA time — same helper as desktop.
function formatLATime(): string {
  const raw = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
  return raw.replace(" AM", "am").replace(" PM", "pm");
}

// Pool of image srcs — pairs one-to-one with SHAPES by index.
const LANDING_IMAGES: string[] = [
  "/images/landing/LandingImage1.png",
  "/images/landing/LandingImage2.png",
  "/images/landing/LandingImage3.png",
  "/images/landing/LandingImage4.png",
  "/images/landing/LandingImage5.png",
];

// Five image tiles positioned around the centered logo. Positions
// staggered on both axes so no two tiles share the same X or Y —
// composition reads as scattered rather than gridded.
//
// `left` values are expressed as an offset from viewport-CENTER in
// design units, rather than from viewport-left, so the whole
// cluster stays visually centered on any width. The 390-wide
// mobile canvas has its center at 195u-m; a shape that would sit
// at `left: 20` on that canvas is (20 − 195) = −175u-m from
// center. Anchoring from 50% then applying that offset keeps the
// composition balanced instead of pooling on the left half once
// --u-m hits its 1.3px cap at wider mobile viewports.
//
// Ambient drift + cursor repulsion are both driven by a single
// rAF tick loop in the effect below (see desktop OpeningSequence
// for the same pattern). `driftDuration` gives each tile its own
// sine period so no two tiles ever move in lockstep.
const SHAPES: Array<{
  top?: number;
  bottomPx?: number;
  centerOffset: number; // signed distance from viewport center, in u-m
  w: number;
  h: number;
  driftDuration: number;
}> = [
  // 4-corner layout with a small centered accent above the
  // wordmark. `centerOffset` is the shape's CENTER distance from
  // viewport center in u-m (see the render calc below — it
  // subtracts w/2 to convert center-anchor to left-anchor). Using
  // ±160 gives corner shapes a symmetric spread that pushes them
  // out to both viewport edges instead of pooling right-of-center.
  // Bleed as a fraction of width = (|centerOffset| + w/2 − 195)/w
  // ≤ 0.25 → |centerOffset| ≤ 195 − 0.75w. For w=130 that's 97.5,
  // giving 30/130 ≈ 23% bleed at 160 — under the 25% ceiling with
  // a small safety margin. (The old formula-with-left-anchor gave
  // 55%+ bleed on one side.)
  { top: 30, centerOffset: -160, w: 130, h: 130, driftDuration: 13 }, // 1 — TOP-LEFT
  { top: 30, centerOffset: 160, w: 130, h: 130, driftDuration: 9 }, // 2 — TOP-RIGHT
  { bottomPx: 80, centerOffset: -160, w: 130, h: 130, driftDuration: 11 }, // 3 — BOTTOM-LEFT
  { bottomPx: 80, centerOffset: 160, w: 130, h: 130, driftDuration: 15 }, // 4 — BOTTOM-RIGHT
  { top: 240, centerOffset: 0, w: 100, h: 100, driftDuration: 10 }, // 5 — CENTERED ACCENT above wordmark
];

const SHAPE_COLOR = "#c4bcaf";

// Cursor repulsion parameters (in viewport pixels). Tuned for the
// mobile canvas — smaller radius + smaller max push than desktop
// since the whole composition lives inside a ~700-800px viewport
// rather than 1920. `uScale` in the tick loop still scales these
// proportionally to the actual viewport width.
const INFLUENCE_RADIUS = 260;
const MAX_PUSH = 70;
const LERP = 0.045;
const MOUSE_LERP = 0.075;
const DRIFT_AMPLITUDE = 12;

export default function MobileOpeningSequence() {
  const sectionRef = useRef<HTMLElement>(null);
  const shapeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [laTime, setLaTime] = useState("");

  useEffect(() => {
    setLaTime(formatLATime());
    const id = setInterval(() => setLaTime(formatLATime()), 20_000);
    return () => clearInterval(id);
  }, []);

  // Single rAF loop composing per-shape ambient drift + cursor
  // repulsion. Mirrors the desktop OpeningSequence pattern so the
  // motion signature reads the same on both surfaces.
  useEffect(() => {
    const state = SHAPES.map(() => ({ px: 0, py: 0, tpx: 0, tpy: 0 }));
    let bases: Array<{ x: number; y: number }> = [];
    let raf = 0;
    let rawMouseX = -9999;
    let rawMouseY = -9999;
    let mouseX = -9999;
    let mouseY = -9999;

    const readBases = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      bases = shapeRefs.current.map((el) => {
        if (!el) return { x: 0, y: 0 };
        return {
          x: rect.left + el.offsetLeft + el.offsetWidth / 2,
          y: rect.top + el.offsetTop + el.offsetHeight / 2,
        };
      });
    };

    const tick = () => {
      const t = performance.now() / 1000;
      mouseX += (rawMouseX - mouseX) * MOUSE_LERP;
      mouseY += (rawMouseY - mouseY) * MOUSE_LERP;

      // Scale push + drift by viewport / mobile-canvas ratio so the
      // amplitudes match the visual scale of the shapes.
      const uScale = window.innerWidth / 390;

      for (let i = 0; i < SHAPES.length; i++) {
        const shape = shapeRefs.current[i];
        const cfg = SHAPES[i];
        const s = state[i];
        const base = bases[i];
        if (!shape || !cfg || !s || !base) continue;

        const dx = base.x - mouseX;
        const dy = base.y - mouseY;
        const dist = Math.hypot(dx, dy);
        if (dist > INFLUENCE_RADIUS) {
          s.tpx = 0;
          s.tpy = 0;
        } else {
          const t01 = 1 - dist / INFLUENCE_RADIUS;
          const eased = t01 * t01 * (3 - 2 * t01);
          const invDist = dist > 0.001 ? 1 / dist : 0;
          s.tpx = dx * invDist * eased * MAX_PUSH * uScale;
          s.tpy = dy * invDist * eased * MAX_PUSH * uScale;
        }

        s.px += (s.tpx - s.px) * LERP;
        s.py += (s.tpy - s.py) * LERP;

        const freq = (2 * Math.PI) / cfg.driftDuration;
        const phase = i * 1.3;
        const driftX = Math.sin(t * freq + phase) * DRIFT_AMPLITUDE * uScale;
        const driftY =
          Math.cos(t * freq * 0.7 + phase * 1.4) * DRIFT_AMPLITUDE * uScale;

        shape.style.transform = `translate3d(${s.px + driftX}px, ${
          s.py + driftY
        }px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    const handleMove = (e: MouseEvent) => {
      if (rawMouseX === -9999) {
        mouseX = e.clientX;
        mouseY = e.clientY;
      }
      rawMouseX = e.clientX;
      rawMouseY = e.clientY;
    };
    const handleResize = () => readBases();
    const handleScroll = () => readBases();

    readBases();
    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative overflow-hidden"
      style={{
        height: "100vh",
        backgroundColor: "var(--color-cream)",
      }}
    >
      {/* Floating image tiles — anchored either from top or from
          bottom (fixed px) so bottom-row tiles hold a consistent
          gap above the captions. Per-frame transforms (drift +
          cursor repulsion) are written by the rAF loop above via
          shapeRefs; no CSS keyframe animation. */}
      {SHAPES.map((shape, i) => {
        const src = LANDING_IMAGES[i % LANDING_IMAGES.length];
        return (
          <div
            key={i}
            ref={(el) => {
              shapeRefs.current[i] = el;
            }}
            className="absolute overflow-hidden"
            style={{
              ...(shape.top !== undefined
                ? { top: `calc(var(--u-m) * ${shape.top})` }
                : { bottom: `${shape.bottomPx}px` }),
              // Center-anchored horizontal position — subtract
              // w/2 from the offset so `centerOffset` is the
              // shape's CENTER distance from viewport center (not
              // its left edge). This makes ±X offsets produce a
              // symmetric spread; using the same value on both
              // sides otherwise pushes right-side shapes further
              // from center than left-side ones by w units.
              left: `calc(50% + var(--u-m) * ${shape.centerOffset - shape.w / 2})`,
              width: `calc(var(--u-m) * ${shape.w})`,
              height: `calc(var(--u-m) * ${shape.h})`,
              borderRadius: "4px",
              backgroundColor: SHAPE_COLOR,
              willChange: "transform",
              zIndex: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              aria-hidden="true"
              className="size-full object-cover"
            />
          </div>
        );
      })}

      {/* Top-left: live LA time */}
      <div
        className="absolute font-sans"
        style={{
          left: "calc(var(--u-m) * 20)",
          top: "calc(var(--u-m) * 24)",
          fontSize: "14px",
          fontWeight: 500,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          color: "var(--color-ink)",
          zIndex: 10,
        }}
        aria-live="polite"
      >
        {laTime ? `(Los Angeles ${laTime})` : ""}
      </div>

      {/* Top-right: horizontal nav — Work · Contact · LinkedIn.
          Same styling as the mobile signature footer so the top
          and bottom nav read as a matched pair. 12u-m font + 14u-m
          gaps fit the three items alongside the LA time within the
          350u-m usable width. */}
      <nav
        className="absolute flex flex-row items-baseline font-sans whitespace-nowrap"
        style={{
          right: "calc(var(--u-m) * 20)",
          top: "calc(var(--u-m) * 24)",
          gap: "calc(var(--u-m) * 14)",
          fontSize: "14px",
          fontWeight: 500,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          color: "var(--color-ink)",
          zIndex: 10,
        }}
      >
        <ScrollNavLink hash="work" className="active:opacity-60 transition-opacity">
          Work
        </ScrollNavLink>
        <ScrollNavLink hash="contact" className="active:opacity-60 transition-opacity">
          Contact
        </ScrollNavLink>
        <a
          href="https://www.linkedin.com/in/joleenhsu/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-baseline gap-[3px] active:opacity-60 transition-opacity"
        >
          LinkedIn
          <ArrowUpRight />
        </a>
      </nav>

      {/* Giant JOLEEN.DESIGN wordmark — centered horizontally +
          vertically. Sized to match the top-row insets (left/right
          20u-m each → usable width = 390 − 40 = 350u-m). Height
          auto-scales to preserve the 7.8:1 aspect. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo.svg"
        alt="Joleen.design"
        className="absolute pointer-events-none"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          // 90vw cap ensures the wordmark never exceeds viewport
          // width on any mobile viewport — the u-m-scaled width
          // would push past the edges on very narrow phones (<390)
          // or when the --u-m cap of 1.3 hits at ~455px width on a
          // tablet-width viewport.
          width: "min(calc(var(--u-m) * 350), 90vw)",
          height: "auto",
          // Soft cream glow around the wordmark's letter shapes —
          // mirrors the desktop treatment (scaled down for mobile).
          // Uses filter: drop-shadow instead of text-shadow because
          // the wordmark is an <img>; drop-shadow operates on the
          // image's alpha channel, so the halo hugs each letter's
          // outline rather than a rectangular box.
          filter:
            "drop-shadow(0 0 8px rgba(255, 249, 236, 0.9)) drop-shadow(0 0 4px rgba(255, 249, 236, 0.7))",
          zIndex: 5,
        }}
      />

      {/* Bio + taste captions collapsed into a single Instrument-
          Sans sentence anchored bottom-left. On mobile viewports
          (≤800px) neither bio nor taste has enough horizontal room
          to keep its serif-italic parenthetical on one line while
          also fitting alongside the other block, so we always show
          the shortened single-sentence version here. */}
      <div
        className="absolute"
        style={{
          left: "calc(var(--u-m) * 20)",
          right: "calc(var(--u-m) * 20)",
          bottom: "calc(var(--u-m) * 24)",
          color: "var(--color-ink)",
          zIndex: 10,
        }}
      >
        <p
          className="font-sans"
          style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: 500,
            letterSpacing: "-0.02em",
            lineHeight: 1.35,
            textAlign: "left",
          }}
        >
          I&rsquo;m a Staff Product Designer building 0 &rarr; 1
          products{" "}
          <span className="font-serif italic" style={{ fontWeight: 400, letterSpacing: 0 }}>
            (specializing in consumer at the intersection of AI x human
            flourishing)
          </span>
        </p>
      </div>

    </section>
  );
}
