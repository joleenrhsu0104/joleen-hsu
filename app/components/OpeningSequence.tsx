"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ArrowUpRight from "./ArrowUpRight";
import ScrollNavLink from "./ScrollNavLink";

/**
 * Format the current LA time as "9:08am" / "12:34pm". Intl handles
 * DST + timezone offsets so we always get wall-clock time in LA, no
 * matter where the visitor is. The trailing " AM"/" PM" from
 * en-US is collapsed to lowercase "am"/"pm" without the space to
 * match the design.
 */
function formatLATime(): string {
  const raw = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
  return raw.replace(" AM", "am").replace(" PM", "pm");
}

/**
 * OpeningSequence — desktop landing hero.
 *
 * A single 100vh page with:
 *   • Bio text top-left with inline underlined links
 *   • Work / Contact / LinkedIn nav top-right
 *   • 9 image tiles floating in the middle band between the bio and
 *     the wordmark. They drift slowly on their own (per-shape sine
 *     waves) and spring away from the cursor as it approaches — the
 *     same interaction pattern we used in an earlier iteration.
 *   • Giant JOLEEN.DESIGN wordmark pinned along the bottom of the
 *     viewport, Zalando Sans SemiExpanded Medium, spanning the full
 *     width.
 *
 * Motion model:
 *   Each shape has a base layout position (from SHAPES config × --u).
 *   Every rAF tick we compute two offsets and combine them into one
 *   transform per shape:
 *
 *     • Drift — sine-wave motion with per-shape frequency + phase so
 *       no two shapes are ever in sync. Amplitude ~14px.
 *
 *     • Repulsion — when the cursor is within INFLUENCE_RADIUS of a
 *       shape's base position, the shape's target push vector points
 *       AWAY from the cursor with magnitude smoothstep(1 − dist/R) ×
 *       MAX_PUSH. Current push lerps toward target at LERP each
 *       frame for a springy feel. Outside the radius the target
 *       snaps to 0 and the shape drifts back to base.
 *
 *   Both offsets are applied as a single `transform: translate3d`
 *   via direct DOM writes (refs, no React state) so mousemove
 *   doesn't trigger any re-renders.
 */

// Shape positions in design units (1920 canvas). driftDuration
// controls the sine-wave period for that shape's drift motion —
// varying it across shapes keeps them out of sync.
//
// A shape may specify EITHER `top` (design units, scales with --u)
// OR `bottomPx` (fixed pixels above viewport bottom). The two
// bottom-row bleed tiles + center tile use `bottomPx` because the
// bio and taste captions have a FIXED 18px font — using scaled
// `top` positioning made shapes drop into the captions on wider-
// aspect viewports (e.g. 2600×1264) where the section is only
// ~934 design units tall. Fixed-px bottom offset keeps a consistent
// visual gap from the captions on every viewport aspect.
const SHAPES: Array<{
  top?: number;
  bottomPx?: number;
  left: number;
  w: number;
  h: number;
  driftDuration: number;
}> = [
  // Five 300×300 square tiles arranged clockwise around the
  // centered wordmark, starting at 9 o'clock. Slot N of this array
  // pairs with slot N of LANDING_IMAGES, so LandingImage1 lands at
  // "1 (LEFT)", LandingImage2 at "2 (TOP-LEFT)", etc.
  //
  // Reading order:
  //   1 — LEFT      (9 o'clock, mid-left)
  //   2 — TOP-LEFT  (10–11 o'clock)
  //   3 — TOP-RIGHT (1–2 o'clock)
  //   4 — RIGHT     (3 o'clock, mid-right)
  //   5 — BOTTOM    (6 o'clock, center — offset slightly left of
  //                  viewport center so max cursor push stays clear
  //                  of the taste caption on the right)
  //
  // Text keep-out zones (worst case on 1920×1080):
  //   • LA time top-left:      x≈70–260,  y≈60–80
  //   • Nav top-right:         x≈1570–1850, y≈60–80
  //   • Bio caption:           x≈70–640,  y≈968–1020
  //   • Taste caption:         x≈1250–1850, y≈968–1020
  //   • Wordmark (centered):   y≈430–650  (behind image via z-index)
  //
  // Max drift + cursor push ≈ 134u in any direction. Slot 5 sits
  // safely between the two bottom captions such that even a full
  // horizontal push can't drive the shape into either text block.
  // Slots 1 and 4 pushed past the canvas edges so they visually
  // bleed off-screen — left tile hangs 80u off the left, right
  // tile hangs 80u off the right. Section overflow: hidden clips
  // the excess. Cursor drift/repulsion can shift them further off
  // temporarily, which reads as playful rather than broken.
  // Slots 1, 4, and 5 form the bottom row — anchored 320px above
  // the viewport bottom (fixed pixels, NOT scaled). Even at the
  // full 134px cursor push, the shape's bottom edge stays 186px
  // above the viewport bottom, comfortably clearing the bio +
  // taste captions (whose top edges land ~115–175px above the
  // viewport bottom depending on --u).
  //
  // Slots 2 and 3 stay in the top row above the wordmark, still
  // anchored via design-unit `top` — the top nav is design-unit-
  // positioned too so both scale together.
  // Shapes bumped from 300u to 380u so they fill more of the
  // vertical breathing room on taller-aspect viewports where the
  // section stretches to 100vh but shapes size by --u (a width-
  // based unit). Slot 5 stays at 300u to keep clearance from the
  // bio + taste captions during a max cursor push. Slot 1 aligned
  // to slot 4's bottomPx: 150 so the two bleeding tiles share a
  // baseline. Top-row slots 2 and 3 shifted left slightly to hold
  // their horizontal clearance from the LA time and nav at their
  // new larger size.
  // Layout enforces a 25% max overlap rule against BOTH other
  // shapes AND the centered wordmark. The wordmark sits at viewport
  // vertical center with ~228u design-height (y ≈ 426–654 on a
  // 1920×1080 viewport), so shapes are kept either above y≈400 or
  // below y≈600 to keep any per-shape logo overlap under 25% of
  // that shape's area.
  //
  // Three tiles sit in the upper band (slots 1, 2, 3) at top ≤ 80u,
  // two sit in the lower band (slots 4, 5) using bottomPx so they
  // hold their offset from the viewport bottom regardless of aspect.
  // All pairwise center-to-center distances are > 380u — well above
  // the 340u shape width — so image-to-image overlap stays under
  // 25% even under a full cursor push.
  // Slot 1 moved to the LEFT-BLEED bottom row so it sits below the
  // centered wordmark. Shrunk to 300×300 (from 340) so it can fit
  // in the ~320u vertical corridor between the wordmark bottom
  // (y≈654) and the bio caption top (y≈974) on 1920×1080 without
  // overlapping either. Slot 4 pulled up to bottomPx=120 so its
  // bottom edge stays above the taste caption top edge at base.
  //
  // Text keep-out zones on 1920×1080:
  //   • LA time:   x≈70–260,  y≈60–80    (top-left)
  //   • Nav:       x≈1590–1850, y≈60–80  (top-right)
  //   • Wordmark:  y≈426–654               (centered vertically)
  //   • Bio:       x≈70–670,  y≈974–1020 (bottom-left)
  //   • Taste:     x≈1250–1850, y≈974–1020 (bottom-right)
  // Uniform 360×360 shapes (doubled from 180u). Distances kept the
  // same so Y-overlapping pairs (2↔3 both top; 1↔4 both bottom;
  // 5↔1/4 with partial Y) still hold >200u edge-to-edge gap under
  // max cursor push. Slot 5 bottomPx tightened from 150 to 100 so
  // the taller shape doesn't dip deeper into the wordmark band.
  { bottomPx: 80, left: -50, w: 360, h: 360, driftDuration: 18 }, // 1 — LEFT bleed
  { top: 100, left: 440, w: 360, h: 360, driftDuration: 22 }, // 2 — upper mid-left
  { top: 140, left: 1300, w: 360, h: 360, driftDuration: 16 }, // 3 — upper right
  { bottomPx: 80, left: 1740, w: 360, h: 360, driftDuration: 24 }, // 4 — RIGHT bleed
  { bottomPx: 100, left: 870, w: 360, h: 360, driftDuration: 20 }, // 5 — BOTTOM center (bottomPx dropped from 150 → 100 so the 360u-tall shape's top edge stays out of the deeper wordmark band)
];

// Pool of image srcs the shapes draw from, in order. Index N of
// this array corresponds to index N of the SHAPES array above.
// Uploaded via /public/images/landing/ — swap or reorder these
// filenames to change which image appears in which slot.
const LANDING_IMAGES: string[] = [
  "/images/landing/LandingImage1.png",
  "/images/landing/LandingImage2.png",
  "/images/landing/LandingImage3.png",
  "/images/landing/LandingImage4.png",
  "/images/landing/LandingImage5.png",
];

// Placeholder tint used behind each image while it loads.
const SHAPE_COLOR = "#c4bcaf";

// Cursor repulsion parameters (in viewport pixels).
const INFLUENCE_RADIUS = 380;
const MAX_PUSH = 120;
// Spring stiffness — how fast the current push offset lerps toward
// the target each frame. Halved from 0.09 so the shape's response
// to cursor movement feels heavier / half-speed.
const LERP = 0.045;
// Mouse-position smoothing — halved from 0.15 for the same slower,
// smoother tracking feel.
const MOUSE_LERP = 0.075;
// Per-axis amplitude (px) of each shape's ambient sine drift.
const DRIFT_AMPLITUDE = 14;

export default function OpeningSequence() {
  const sectionRef = useRef<HTMLElement>(null);
  const shapeRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Live LA time — empty string on first paint so the SSR + first
  // client render agree (avoids hydration mismatch). Filled in by
  // the effect below on mount, then refreshed every 20s.
  const [laTime, setLaTime] = useState("");

  useEffect(() => {
    setLaTime(formatLATime());
    const id = setInterval(() => setLaTime(formatLATime()), 20_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // Per-shape motion state: current push (px, py), target push (tpx, tpy).
    const state = SHAPES.map(() => ({ px: 0, py: 0, tpx: 0, tpy: 0 }));
    let bases: Array<{ x: number; y: number }> = [];
    let raf = 0;
    let rawMouseX = -9999;
    let rawMouseY = -9999;
    let mouseX = -9999;
    let mouseY = -9999;

    // Read each shape's base viewport position from its actual
    // layout box via offsetLeft/offsetTop (which are unaffected by
    // the CSS transforms the tick loop writes on every frame).
    // Using the element's own layout position lets shapes anchor
    // from EITHER top or bottom without needing to derive one from
    // the other in JS — the browser has already done that work.
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

      // Smooth the mouse position toward the raw input.
      mouseX += (rawMouseX - mouseX) * MOUSE_LERP;
      mouseY += (rawMouseY - mouseY) * MOUSE_LERP;

      // Scale push + drift by --u so the movement amplitude is
      // proportional to the viewport / design canvas ratio. Without
      // this, a fixed 120px push shoves the shapes 40%+ of their
      // width on narrow desktop viewports (where each shape is
      // only 150-200px wide), producing overlaps that don't happen
      // at wider viewports where shapes are 300-400px.
      const uScale = window.innerWidth / 1920;

      for (let i = 0; i < SHAPES.length; i++) {
        const shape = shapeRefs.current[i];
        const cfg = SHAPES[i];
        const s = state[i];
        const base = bases[i];
        if (!shape || !cfg || !s || !base) continue;

        // Repulsion target from cursor.
        const dx = base.x - mouseX;
        const dy = base.y - mouseY;
        const dist = Math.hypot(dx, dy);
        if (dist > INFLUENCE_RADIUS) {
          s.tpx = 0;
          s.tpy = 0;
        } else {
          // Smoothstep easing (3t² − 2t³) softens BOTH the outer
          // edge of the influence radius AND the peak near the
          // cursor.
          const t01 = 1 - dist / INFLUENCE_RADIUS;
          const eased = t01 * t01 * (3 - 2 * t01);
          const invDist = dist > 0.001 ? 1 / dist : 0;
          s.tpx = dx * invDist * eased * MAX_PUSH * uScale;
          s.tpy = dy * invDist * eased * MAX_PUSH * uScale;
        }

        // Spring the current push toward the target.
        s.px += (s.tpx - s.px) * LERP;
        s.py += (s.tpy - s.py) * LERP;

        // Sine-wave ambient drift — independent freq + phase per shape.
        // Drift amplitude also scaled by --u for the same reason.
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
      // First move: snap smoothed position to raw so we don't animate
      // in from off-screen (-9999) with a big swoosh.
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
      {/* Floating image tiles — background layer. Base positions
          come from SHAPES; per-frame transforms (drift + cursor
          repulsion) are written by the rAF loop above. Image
          assignments come from LANDING_IMAGES. Empty alt because
          they're decorative composition, not content. */}
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
              // Anchor either from top (design units, scales with
              // --u) or from bottom (fixed px, so the shape holds a
              // constant offset above the fixed-px bio + taste
              // captions regardless of viewport aspect).
              ...(shape.top !== undefined
                ? { top: `calc(var(--u) * ${shape.top})` }
                : { bottom: `${shape.bottomPx}px` }),
              left: `calc(var(--u) * ${shape.left})`,
              width: `calc(var(--u) * ${shape.w})`,
              height: `calc(var(--u) * ${shape.h})`,
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

      {/* Live Los Angeles time — top-left corner. Empty on the
          first (SSR) render; the mount effect fills it in and
          refreshes every 20s so the displayed minute is never more
          than that stale. */}
      <div
        className="absolute font-sans"
        style={{
          left: "calc(var(--u) * 70)",
          top: "calc(var(--u) * 60)",
          fontSize: "max(14px, calc(var(--u) * 20))",
          fontWeight: 500,
          letterSpacing: "calc(var(--u) * -0.4)",
          lineHeight: 1,
          color: "var(--color-ink)",
          zIndex: 10,
        }}
        aria-live="polite"
      >
        {laTime ? `(Los Angeles ${laTime})` : ""}
      </div>

      {/* Nav top-right — same font-sans Medium / title-case / -2%
          letter-spacing as the universal header nav. */}
      <nav
        className="absolute flex items-center font-sans"
        style={{
          right: "calc(var(--u) * 70)",
          top: "calc(var(--u) * 60)",
          gap: "calc(var(--u) * 48)",
          fontSize: "max(14px, calc(var(--u) * 20))",
          fontWeight: 500,
          letterSpacing: "calc(var(--u) * -0.4)",
          lineHeight: 1,
          color: "var(--color-ink)",
          zIndex: 10,
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
      </nav>

      {/* Bio caption — bottom-left. Two-line block: sans headline +
          italicized serif parenthetical. Font-size uses design
          units so it scales in step with the rest of the header
          chrome (LA time, nav). maxWidth caps at 45vw so the block
          can never extend into the middle and collide with the
          taste caption on the right. Because BOTH the font and the
          maxWidth are viewport-relative, each line stays on one
          line at any viewport width. */}
      <div
        className="absolute"
        style={{
          left: "calc(var(--u) * 70)",
          bottom: "calc(var(--u) * 60)",
          maxWidth: "45vw",
          color: "var(--color-ink)",
          zIndex: 10,
        }}
      >
        <p
          className="font-sans"
          style={{
            margin: 0,
            fontSize: "max(14px, calc(var(--u) * 18))",
            fontWeight: 500,
            letterSpacing: "-0.02em",
            lineHeight: 1.3,
          }}
        >
          I&rsquo;m a Staff Product Designer building 0 &rarr; 1 products
        </p>
        <p
          className="font-serif italic"
          style={{
            margin: "calc(var(--u) * 6) 0 0 0",
            fontSize: "max(14px, calc(var(--u) * 18))",
            lineHeight: 1.3,
          }}
        >
          (specializing in consumer at the intersection of AI x human
          flourishing)
        </p>
      </div>

      {/* Taste caption — bottom-right. Same font scaling + 45vw cap
          as bio so the two blocks are guaranteed a middle gap on
          every viewport. Right-anchored + right-aligned. */}
      <div
        className="absolute text-right"
        style={{
          right: "calc(var(--u) * 70)",
          bottom: "calc(var(--u) * 60)",
          maxWidth: "45vw",
          color: "var(--color-ink)",
          zIndex: 10,
        }}
      >
        <p
          className="font-sans"
          style={{
            margin: 0,
            fontSize: "max(14px, calc(var(--u) * 18))",
            fontWeight: 500,
            letterSpacing: "-0.02em",
            lineHeight: 1.3,
          }}
        >
          My taste is shaped by exploring the world around me
        </p>
        <p
          className="font-serif italic"
          style={{
            margin: "calc(var(--u) * 6) 0 0 0",
            fontSize: "max(14px, calc(var(--u) * 18))",
            lineHeight: 1.3,
          }}
        >
          (pics from Berlin, Mexico City, Oaxaca, Prague, and more)
        </p>
      </div>

      {/* Giant JOLEEN.DESIGN wordmark — centered vertically, and
          sized so its left/right edges line up with the top-row
          chrome. The LA time (left: 70u) and nav (right: 70u)
          define a 70u inset on each side of the canvas, so the
          logo's usable width is 1920 − 70 − 70 = 1780u. Height
          scales automatically to preserve the 7.8:1 aspect
          (~228u tall). Non-interactive; sits above the floating
          images (zIndex 5) but below the header chrome (zIndex 10). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo.svg"
        alt="Joleen.design"
        className="absolute pointer-events-none"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          // Width capped at 92vw so on very narrow desktop viewports
          // (800-1000px range where the design-unit-scaled width
          // would push past the viewport edges) the wordmark stays
          // safely inside with 4vw margin on each side. Above that
          // threshold the calc term wins and it scales normally.
          width: "min(calc(var(--u) * 1780), 92vw)",
          height: "auto",
          zIndex: 5,
          // Soft cream glow around each letter via filter:
          // drop-shadow. Unlike text-shadow (which doesn't work on
          // <img>), drop-shadow operates on the alpha channel — so
          // it hugs the actual letter shapes, not the bounding box.
          //
          // On the cream section background the glow blends in and
          // is invisible; where a darker image sits behind the
          // letters, the cream halo creates a subtle separation
          // that lifts the wordmark off the busy background without
          // any color inversion or graphic effect.
          filter:
            "drop-shadow(0 0 14px rgba(255, 249, 236, 0.9)) drop-shadow(0 0 6px rgba(255, 249, 236, 0.7))",
        }}
      />
    </section>
  );
}
