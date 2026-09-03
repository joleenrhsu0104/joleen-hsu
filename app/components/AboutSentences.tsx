"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { INK_RGB } from "@/app/lib/tokens";
import ScrollCharFill from "./ScrollCharFill";

/**
 * AboutSentences — two editorial statements, scroll-jacked through
 * a single pinned viewport. Loads immediately after the landing hero
 * (OpeningSequence), which already covers the "I'm Joleen…" intro
 * as static bio text.
 *
 * The outer wrapper is 370vh tall. A sticky inner stage pins at
 * top:0 with 100vh height while the wrapper scrolls past, so the
 * user's viewport stays fixed. Two statement panels are layered
 * absolutely at the stage's center and cross-fade based on scroll
 * progress (0..1 across the wrapper):
 *
 *   • Panel 1 — "I believe…": active in segment [0, 140/270]
 *   • Panel 2 — Rubin quote + ethos line: active in segment [140/270, 1]
 *
 * Within each panel's segment:
 *   • 0–15% of segment: opacity 0→1 + ScrollCharFill 0→1 (chars fill)
 *   • 15–85%: opacity 1, fill held at 1 (statement reads, no motion)
 *   • 85–100%: opacity 1→0 (fade out to next panel)
 *
 * Background: cream throughout — matches OpeningSequence above and
 * HomeWorkSection's boundary below (which starts a hardcoded dark
 * band, so we don't need a soft crossfade here).
 */

// Ink RGB tuple sourced from the ink token (`colors.ink = #231f20` →
// "35, 31, 32"). Imported as a raw tuple because ScrollCharFill's
// `blend()` helper interpolates numeric channels in JS — a CSS variable
// can't be parsed mid-interpolation, so the tuple is the single source
// of truth.
const FROM = `rgba(${INK_RGB}, 0.3)`;
const TO = `rgb(${INK_RGB})`;

/**
 * Per-panel scroll allocation, in vh of scroll budget. Same pacing
 * per panel as the previous three-panel version — the reader gets
 * ~60vh of ink fill and ~50-60vh of pure-hold before the panel
 * fades to the next.
 *   • Panel 1 (140vh): fade-in 20vh, fill 60vh, hold 60vh, fade-out 20vh
 *   • Panel 2 (130vh): fade-in 20vh, fill 60vh, hold 50vh, fade-out 20vh
 */
const PANEL_SCROLL_VH = [140, 130];
const TOTAL_SCROLL_VH = PANEL_SCROLL_VH.reduce((a, b) => a + b, 0); // 270
const WRAPPER_VH = TOTAL_SCROLL_VH + 100; // sticky stage + scroll budget = 370vh

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
// scroll (not per-segment), so both panels get the same scroll
// distance for fade transitions regardless of their segment length.
// ~20vh each at 270vh total = 20/270 ≈ 0.074.
const FADE_IN_FRACTION = 20 / 270;
const FADE_OUT_FRACTION = 20 / 270;
// Char fill window — ~60vh at 270vh total. Same pacing as before.
const FILL_FRACTION = 60 / 270;

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

  // Two per-panel envelopes derived from the single global progress.
  const p0 = localProgress(progress, 0);
  const p1 = localProgress(progress, 1);

  return (
    <section
      ref={wrapperRef}
      id="about"
      className="relative"
      style={{
        height: `${WRAPPER_VH}vh`,
        backgroundColor: "var(--color-cream)",
      }}
    >
      <div
        className="sticky top-0 overflow-hidden"
        style={{ height: "100vh" }}
      >
        {/* Two statement panels, stacked at sticky center. */}
        <PanelLayer opacity={panelOpacity(p0, 0)}>
          <StatementText fillProgress={panelFillProgress(p0, 0)}>
            I believe the best design is built off of deep curiosity
            and empathy.
          </StatementText>
        </PanelLayer>

        <PanelLayer opacity={panelOpacity(p1, 1)}>
          <RubinStatement fillProgress={panelFillProgress(p1, 1)} />
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
        fontSize: "max(14px, calc(var(--u) * 68))",
        letterSpacing: "calc(var(--u) * -1.36)",
        lineHeight: 1,
        margin: 0,
      }}
    >
      {children}
    </ScrollCharFill>
  );
}

/**
 * Second panel — Rubin quote + ethos byline. The quote fills first;
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
          fontSize: "max(14px, calc(var(--u) * 68))",
          letterSpacing: "calc(var(--u) * -1.36)",
          lineHeight: 1,
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
          fontSize: "max(14px, calc(var(--u) * 18))",
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
