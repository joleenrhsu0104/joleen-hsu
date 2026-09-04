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
  /** If true, ignore top/bottomPx and center the shape at 50vh
   *  (subtracting 140px = half the 280px cap). Used to pin the
   *  center accent shape BEHIND the wordmark on every viewport. */
  vhCenter?: boolean;
  /** Legacy: horizontal position in design units (1920 canvas).
   *  Prefer `leftPx` / `rightPx` / `centerX` for new shapes —
   *  they anchor to the viewport edge in fixed pixels so
   *  positioning stays symmetric at every viewport width instead
   *  of drifting toward whichever side has the bigger design
   *  offset. */
  left?: number;
  /** Fixed px offset from the viewport left edge. Negative
   *  values bleed the shape off the left side. */
  leftPx?: number;
  /** Fixed px offset from the viewport right edge. Negative
   *  values bleed the shape off the right side. */
  rightPx?: number;
  /** If true, center the shape horizontally (viewport-relative). */
  centerX?: boolean;
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
  // Widths bumped 360 → 450u (25% bigger) at the user's request.
  // Horizontal positions shifted slightly toward center so the
  // wider tiles keep the same edge bleed on both sides.
  //
  // `bottomPx` is now interpreted as u-scaled (see render below —
  // was fixed px). Values raised so that even at the widest
  // reasonable viewports, the shape's bottom edge stays above
  // the two-line bio caption (top ~100u from the section bottom)
  // with a max travel buffer of ~48u for drift + push.
  //
  // Top values raised to 160u so the top edge stays below the
  // nav row (bottom ~104u) at all viewports.
  // Vertical positions staggered so no two shapes share the same
  // y baseline — reads as a scattered composition rather than
  // two flat rows. Kept all values ≥160 so shapes stay out of
  // the nav and bio caption keep-out zones at every desktop
  // viewport (nav bottom ~104u, bio top ~100u from bottom).
  // Corner shapes pulled closer to the vertical midline (top
  // values pushed down, bottomPx values pushed up) so the whole
  // cluster reads as tightly framed around the wordmark instead
  // of banding the far top / far bottom of the section.
  //
  // Shape 5 (center accent) is pinned at 50vh via `vhCenter` so
  // it sits directly behind the wordmark on every viewport.
  // Restored spread-out layout matching the earlier reference:
  // top row (2, 3) clearly ABOVE the wordmark, bottom row
  // (1, 5, 4) clearly BELOW. Vertical values staggered so no
  // two shapes share a y baseline. Horizontal `left` uses the
  // 1920 design canvas so shapes spread across the full viewport
  // width instead of clustering near center.
  // Values tightened so max(top) + max(bottomPx) stays under
  // 453u — the point at which top and bottom rows would collide
  // vertically at MacBook Air (1440x900). Now on MBA:
  //   • top row ends at y ≈ 430
  //   • bottom row starts at y ≈ 500+ (min gap 25px)
  // …so the two rows read as clearly separated bands with the
  // wordmark passing through the middle, matching the reference.
  // Top row nudged up ~40u closer to the nav row and bottom row
  // nudged down ~40u closer to the bio caption while keeping
  // enough buffer for cursor-repulsion motion. On MBA (1440x900)
  // each row now sits ~6px above / below the text-safe boundary
  // even at max push, with ~60px of clean separation between
  // the two rows in the middle.
  // Values bumped back up so text-safety holds at every desktop
  // viewport from ~800px through 1920+. Safety-derived minimums:
  //   • top ≥ 130u so shapes clear the nav row (bottom ≈ 104u)
  //     with buffer for max cursor push at all viewports.
  //   • bottomPx ≥ 160u so shapes clear the bio caption (top
  //     ≈ 70–113u from bottom, depending on font/wrap) with buffer.
  // The half-MBA breakpoint (~1000px viewport, u≈0.52) is the
  // binding constraint — bio wraps into a taller caption there.
  // BottomPx bumped up so shapes clear the bio caption (top
  // ~70–113u from bottom) even at max cursor push at the
  // narrowest desktop viewport (~800px, u≈0.42, motion≈10).
  // Safety min = (bio_top + motion) / u = ~200 at u=0.42.
  // Top values pulled DOWN toward the nav row and bottomPx
  // pulled DOWN toward the bio caption so the two rows sit
  // near the top/bottom edges of the viewport — matching the
  // desktop composition where rows visibly hug the edges
  // instead of clustering near the wordmark. Safety margins
  // rechecked with MAX_PUSH:10 → still ≥1px static clearance
  // at every desktop viewport from 720px through 1920+.
  { bottomPx: 190, left: -95, w: 450, h: 450, driftDuration: 18 }, // 1 — LEFT bleed
  { top: 125, left: 395, w: 450, h: 450, driftDuration: 22 }, // 2 — upper mid-left
  { top: 155, left: 1255, w: 450, h: 450, driftDuration: 16 }, // 3 — upper right (30u lower than shape 2)
  { bottomPx: 190, left: 1695, w: 450, h: 450, driftDuration: 24 }, // 4 — RIGHT bleed
  { bottomPx: 210, left: 825, w: 450, h: 450, driftDuration: 20 }, // 5 — BOTTOM center on wide desktop viewports; overridden to vhCenter/centerX on tablet-width viewports (800-1200px) via isTabletDesktop below.
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
// Push + drift amplitudes trimmed so shapes never drift into the
// top-nav row (bottom ~104u) or the bio/taste captions (top ~100u
// from the section bottom). Both scale by viewport / 1920 in the
// tick loop, so at 2560vw the effective push is ~53px.
const MAX_PUSH = 10;
// Spring stiffness — how fast the current push offset lerps toward
// the target each frame.
const LERP = 0.045;
// Mouse-position smoothing.
const MOUSE_LERP = 0.075;
// Per-axis amplitude (px) of each shape's ambient sine drift.
const DRIFT_AMPLITUDE = 8;

export default function OpeningSequence() {
  const sectionRef = useRef<HTMLElement>(null);
  const shapeRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Live LA time — empty string on first paint so the SSR + first
  // client render agree (avoids hydration mismatch). Filled in by
  // the effect below on mount, then refreshed every 20s.
  const [laTime, setLaTime] = useState("");
  // Track tablet-width viewports so shape 5 (the center accent)
  // can pin behind the wordmark there — on wider desktop
  // viewports it renders at bottom-center like the rest of the
  // bottom row so the composition reads as 3 bottom + 2 top.
  const [isTabletDesktop, setIsTabletDesktop] = useState(false);

  useEffect(() => {
    setLaTime(formatLATime());
    const id = setInterval(() => setLaTime(formatLATime()), 20_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      // 800 = the mobile breakpoint (below is MobileOpeningSequence).
      // 1200 = roughly where the layout has enough horizontal room
      // for shape 5 to sit in the bottom-center row without
      // crowding the bio/taste captions.
      setIsTabletDesktop(w >= 800 && w < 1200);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
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
              ...(shape.vhCenter
                ? {
                    // Center on 50vh with an offset that mirrors
                    // the dynamic half-height, so the shape's
                    // vertical center always lands on viewport
                    // midpoint (was hard-coded 140px which
                    // put the shape too high on narrow viewports
                    // where the rendered shape was ~210px tall).
                    top: `calc(50vh - min(calc(var(--u) * ${shape.h * 310 / 450}), 130px))`,
                  }
                : shape.top !== undefined
                  ? { top: `calc(var(--u) * ${shape.top})` }
                  : { bottom: `calc(var(--u) * ${shape.bottomPx})` }),
              ...(shape.centerX
                ? {
                    // Offset by half the shape's rendered width so
                    // the shape's CENTER lands at viewport 50%.
                    // Half-width mirrors the width min() formula
                    // so centering holds at every viewport (shape
                    // = min(u * w * 620/450, 260) → half = min(u
                    // * w * 310/450, 130)).
                    left: `calc(50% - min(calc(var(--u) * ${shape.w * 310 / 450}), 130px))`,
                  }
                : shape.rightPx !== undefined
                  ? { right: `${shape.rightPx}px` }
                  : shape.leftPx !== undefined
                    ? { left: `${shape.leftPx}px` }
                    : { left: `calc(var(--u) * ${shape.left})` }),
              // Width responsive: multiplier bumped 340 → 500 and
              // cap raised 240 → 260 so shapes scale up on
              // iPad-portrait / narrow-desktop breakpoints
              // (previously felt tiny) while still capping cleanly
              // on 1440+. Text-safety math re-verified at 720vw:
              // top shape (top:130) clears nav by 1px at max
              // cursor push; bottom shape (bottomPx:210) clears
              // bio by 22px.
              // Multiplier bumped 500 → 620 so iPad-portrait
              // shapes hit the cap sooner (was 210px, now 260 at
              // 810vw). Cap held at 260 so nothing balloons past
              // where the layout still fits.
              // At viewport 800: 620*0.417 = 258px
              // At viewport 1000: 620*0.52 = 322 → cap 260
              // At viewport 1440: 620*0.75 = 465 → cap 260
              // At viewport 1920: 620 → cap 260
              width: `min(calc(var(--u) * ${shape.w * 620 / 450}), 260px)`,
              height: `min(calc(var(--u) * ${shape.h * 620 / 450}), 260px)`,
              borderRadius: "12px",
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
          (specializing in mission-driven consumer brands)
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
