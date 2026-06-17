"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { INK_RGB } from "@/app/lib/tokens";
import ScrollCharFill from "./ScrollCharFill";

/**
 * AboutSentences — three editorial statements, scroll-jacked through
 * a single pinned viewport.
 *
 * The outer wrapper is 300vh tall (one viewport of scroll budget per
 * statement). A sticky inner stage pins at top:0 with 100vh height
 * while the wrapper scrolls past, so the user's viewport stays fixed.
 * Three statement panels are layered absolutely at the stage's center
 * and cross-fade based on scroll progress (0..1 across the wrapper):
 *
 *   • Panel 1 — "I'm Joleen…": active in segment [0, 1/3]
 *   • Panel 2 — "I believe…": active in segment [1/3, 2/3]
 *   • Panel 3 — Rubin quote + ethos line: active in segment [2/3, 1]
 *
 * Within each panel's segment:
 *   • 0–15% of segment: opacity 0→1 + ScrollCharFill 0→1 (chars fill)
 *   • 15–85%: opacity 1, fill held at 1 (statement reads, no motion)
 *   • 85–100%: opacity 1→0 (fade out to next panel)
 *
 * Background: cream throughout. The dark WhatIDoSection that follows
 * still uses var(--scroll-bg) for its entry fade, but the
 * scroll-jacked section itself stays cream for visual stability while
 * the user is pinned.
 */

// Ink RGB tuple sourced from the ink token (`colors.ink = #231f20` →
// "35, 31, 32"). Imported as a raw tuple because ScrollCharFill's
// `blend()` helper interpolates numeric channels in JS — a CSS variable
// can't be parsed mid-interpolation, so the tuple is the single source
// of truth.
const FROM = `rgba(${INK_RGB}, 0.3)`;
const TO = `rgb(${INK_RGB})`;

/**
 * Per-panel scroll allocation, in vh of scroll budget. Bumped up
 * across the board (panels 1 + 2: 100 → 140vh, panel 3: 60 → 130vh)
 * so the char fill inside each panel runs at a slower pace AND the
 * pure-hold window — where the sentence is fully inked at full
 * opacity before the next sentence fades in — is meaningfully
 * longer than it was. Net per-panel breakdown at the new sizes:
 *   • Panel 1, 2 (140vh): fade-in 20vh, fill 60vh, hold 60vh, fade-out 20vh
 *   • Panel 3 (130vh):    fade-in 20vh, fill 60vh, hold 50vh, fade-out 20vh
 * Compared to the previous timings (fill 45vh, hold ~25vh), the
 * reader now has noticeably more room to absorb each filled
 * statement before it transitions.
 */
const PANEL_SCROLL_VH = [140, 140, 130];
const TOTAL_SCROLL_VH = PANEL_SCROLL_VH.reduce((a, b) => a + b, 0); // 410
const WRAPPER_VH = TOTAL_SCROLL_VH + 100; // sticky stage + scroll budget = 510vh

// Each panel's normalized progress segment [start, end] computed
// from its share of the total scroll budget.
const SEGMENTS = (() => {
  const out: Array<{ start: number; end: number }> = [];
  let cumulative = 0;
  for (const vh of PANEL_SCROLL_VH) {
    const start = cumulative / TOTAL_SCROLL_VH;
    cumulative += vh;
    const end = cumulative / TOTAL_SCROLL_VH;
    out.push({ start, end });
  }
  return out;
})();

// Fade-in / fade-out windows, expressed as a fraction of TOTAL
// scroll (not per-segment), so all three panels get the same scroll
// distance for fade transitions regardless of their segment length.
// ~20vh each at the new 410vh total — slightly longer than the
// previous 15vh so the cross-fade between panels reads as
// deliberate rather than abrupt.
const FADE_IN_FRACTION = 0.049; // ≈ 20vh of scroll
const FADE_OUT_FRACTION = 0.049; // ≈ 20vh of scroll
// Char fill window (also a fraction of total scroll) — ~60vh at
// the new 410vh total. 33% slower than the previous 45vh, so the
// ink runs across each line at a more readable pace.
const FILL_FRACTION = 0.146;

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

/**
 * Given overall progress (0..1), return a panel's local progress
 * (0..1) across its segment. Outside the segment returns 0 (before)
 * or 1 (after).
 */
function localProgress(globalP: number, panelIndex: number): number {
  const { start, end } = SEGMENTS[panelIndex];
  return clamp01((globalP - start) / (end - start));
}

/**
 * Opacity envelope for a panel. Inputs are the panel's local
 * progress AND its segment length, so the fade-in / fade-out
 * windows correspond to a consistent scroll distance (FADE_*_FRACTION
 * of total scroll) regardless of how long the segment is.
 */
function panelOpacity(local: number, panelIndex: number): number {
  const { start, end } = SEGMENTS[panelIndex];
  const length = end - start;
  // Convert fade fractions (of total scroll) to fractions of this
  // panel's segment.
  const fadeIn = FADE_IN_FRACTION / length;
  const fadeOut = FADE_OUT_FRACTION / length;
  if (local <= 0) return 0;
  if (local < fadeIn) return local / fadeIn;
  if (local < 1 - fadeOut) return 1;
  if (local < 1) return (1 - local) / fadeOut;
  return 0;
}

/**
 * ScrollCharFill progress. Scaled so the fill always spans ~45vh of
 * scroll (FILL_FRACTION of total) even when a panel's segment is
 * shorter than that of its neighbors.
 */
function panelFillProgress(local: number, panelIndex: number): number {
  const { start, end } = SEGMENTS[panelIndex];
  const length = end - start;
  const fillEnd = Math.min(1, FILL_FRACTION / length);
  if (local <= 0) return 0;
  if (local >= fillEnd) return 1;
  return local / fillEnd;
}

export default function AboutSentences() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = wrapper.getBoundingClientRect();
      const totalScroll = wrapper.offsetHeight - window.innerHeight;
      if (totalScroll <= 0) {
        setProgress(0);
        return;
      }
      const scrolled = Math.max(0, Math.min(totalScroll, -rect.top));
      setProgress(scrolled / totalScroll);
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

  // Three per-panel envelopes derived from the single global progress.
  const p0 = localProgress(progress, 0);
  const p1 = localProgress(progress, 1);
  const p2 = localProgress(progress, 2);

  return (
    <section
      ref={wrapperRef}
      id="about"
      className="relative"
      style={{
        height: `${WRAPPER_VH}vh`,
        // Track ScrollBgSync's cream → dark CSS variable so the
        // bottom of the About column blends into WhatIDoSection's
        // top instead of meeting it at a hard horizontal line. Same
        // trick the original RubinPanel used before this section was
        // rewritten as a scroll-jack.
        backgroundColor: "var(--scroll-bg, var(--color-cream))",
      }}
    >
      <div
        className="sticky top-0 overflow-hidden"
        style={{ height: "100vh" }}
      >
        {/* Three statement panels, stacked at sticky center. */}
        <PanelLayer opacity={panelOpacity(p0, 0)}>
          <StatementText fillProgress={panelFillProgress(p0, 0)}>
            I&rsquo;m Joleen, a Staff Product Designer building
            mission-driven consumer experiences.
          </StatementText>
        </PanelLayer>

        <PanelLayer opacity={panelOpacity(p1, 1)}>
          <StatementText fillProgress={panelFillProgress(p1, 1)}>
            I believe the best design is built off of deep curiosity
            and empathy.
          </StatementText>
        </PanelLayer>

        <PanelLayer opacity={panelOpacity(p2, 2)}>
          <RubinStatement fillProgress={panelFillProgress(p2, 2)} />
        </PanelLayer>
      </div>
    </section>
  );
}

/**
 * PanelLayer — full-stage absolutely-positioned panel that centers
 * its single statement child and applies a scroll-driven opacity.
 */
function PanelLayer({
  opacity,
  children,
}: {
  opacity: number;
  children: ReactNode;
}) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        opacity,
        willChange: "opacity",
      }}
      aria-hidden={opacity < 0.05}
    >
      <div
        style={{
          width: "calc(var(--u) * 1100)",
          paddingLeft: "calc(var(--u) * 32)",
          paddingRight: "calc(var(--u) * 32)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Single ScrollCharFill statement, driven by the panel's local progress. */
function StatementText({
  fillProgress,
  children,
}: {
  fillProgress: number;
  children: ReactNode;
}) {
  return (
    <ScrollCharFill
      as="p"
      fromColor={FROM}
      toColor={TO}
      progress={fillProgress}
      className="font-serif text-center"
      style={{
        fontSize: "calc(var(--u) * 68)",
        letterSpacing: "calc(var(--u) * -1.36)",
        lineHeight: 1.15,
        margin: 0,
      }}
    >
      {children}
    </ScrollCharFill>
  );
}

/**
 * Third panel — Rubin quote + ethos byline. The quote fills first;
 * only once it's fully inked does the byline begin filling. Split
 * point at 0.8 of total fillProgress matches the relative character
 * lengths (quote ~115 chars vs byline ~30 chars), so each gets
 * roughly the same scroll-rate per character.
 */
function RubinStatement({ fillProgress }: { fillProgress: number }) {
  const quoteSplit = 0.8;
  const quoteProgress = clamp01(fillProgress / quoteSplit);
  const bylineProgress = clamp01(
    (fillProgress - quoteSplit) / (1 - quoteSplit),
  );
  return (
    <div
      className="flex flex-col items-center"
      style={{ gap: "calc(var(--u) * 36)" }}
    >
      <ScrollCharFill
        as="blockquote"
        fromColor={FROM}
        toColor={TO}
        progress={quoteProgress}
        className="font-serif text-center"
        style={{
          fontSize: "calc(var(--u) * 68)",
          letterSpacing: "calc(var(--u) * -1.36)",
          lineHeight: 1.15,
          margin: 0,
        }}
      >
        {"“We tend to think of the artist’s work as the output, but the real work of the artist is a "}
        <span className="italic">way of being</span>
        {" in the world.”"}
      </ScrollCharFill>
      <ScrollCharFill
        as="p"
        fromColor={FROM}
        toColor={TO}
        progress={bylineProgress}
        className="font-sans text-center"
        style={{
          fontSize: "calc(var(--u) * 18)",
          letterSpacing: "calc(var(--u) * -0.36)",
          lineHeight: 1.4,
          margin: 0,
        }}
      >
        My life ethos, by way of Rick Rubin
      </ScrollCharFill>
    </div>
  );
}
