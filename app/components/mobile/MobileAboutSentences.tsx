"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { INK_RGB } from "@/app/lib/tokens";
import ScrollCharFill from "../ScrollCharFill";

/**
 * MobileAboutSentences — mobile counterpart to AboutSentences. Two
 * remaining statement panels (the "I'm Joleen…" intro is now on the
 * landing hero as static bio text) scroll-jacked through a single
 * pinned viewport.
 *
 * Wrapper 370vh tall, sticky stage 100vh, two panels cross-fade in
 * turn. Same reading cadence as desktop — only the type scale
 * (--u-m) and container width differ.
 *
 *   • Panel 1 (140vh): fade-in 20vh, fill 60vh, hold 60vh, fade-out 20vh
 *   • Panel 2 (130vh): fade-in 20vh, fill 60vh, hold 50vh, fade-out 20vh
 *
 * Background is cream throughout — matches MobileOpeningSequence
 * above and MobileHomeWorkSection's hard dark boundary below.
 */

// Single-source ink tuple (see token comment in app/lib/tokens.ts for
// why this is a raw RGB tuple instead of a CSS var).
const FROM = `rgba(${INK_RGB}, 0.3)`;
const TO = `rgb(${INK_RGB})`;

// Per-panel scroll allocation, in vh. Same values as the desktop
// scroll-jack so the reading cadence reads identically on both
// surfaces.
const PANEL_SCROLL_VH = [140, 130];
const TOTAL_SCROLL_VH = PANEL_SCROLL_VH.reduce((a, b) => a + b, 0); // 270
const WRAPPER_VH = TOTAL_SCROLL_VH + 100; // sticky stage + scroll budget = 370vh

// Each panel's normalized progress segment [start, end].
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

// Fade + fill windows as a fraction of TOTAL scroll (not per-segment)
// so both panels get the same scroll distance for these transitions
// regardless of their segment length. ~20vh + ~60vh at 270vh total.
const FADE_IN_FRACTION = 20 / 270;
const FADE_OUT_FRACTION = 20 / 270;
const FILL_FRACTION = 60 / 270;

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function localProgress(globalP: number, panelIndex: number): number {
  const { start, end } = SEGMENTS[panelIndex];
  return clamp01((globalP - start) / (end - start));
}

function panelOpacity(local: number, panelIndex: number): number {
  const { start, end } = SEGMENTS[panelIndex];
  const length = end - start;
  const fadeIn = FADE_IN_FRACTION / length;
  const fadeOut = FADE_OUT_FRACTION / length;
  if (local <= 0) return 0;
  if (local < fadeIn) return local / fadeIn;
  if (local < 1 - fadeOut) return 1;
  if (local < 1) return (1 - local) / fadeOut;
  return 0;
}

function panelFillProgress(local: number, panelIndex: number): number {
  const { start, end } = SEGMENTS[panelIndex];
  const length = end - start;
  const fillEnd = Math.min(1, FILL_FRACTION / length);
  if (local <= 0) return 0;
  if (local >= fillEnd) return 1;
  return local / fillEnd;
}

export default function MobileAboutSentences() {
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
      id="m-about"
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
 * Full-stage absolutely-positioned panel that centers its single
 * statement child and applies a scroll-driven opacity. Width is set
 * to the mobile design canvas (358u-m) with comfortable side gutters.
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
      <div style={{ width: "calc(var(--u-m) * 358)" }}>{children}</div>
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
        fontSize: "max(12px, calc(var(--u-m) * 24))",
        letterSpacing: "calc(var(--u-m) * -0.48)",
        lineHeight: 1.25,
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
 * lengths, mirroring the desktop variant.
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
      style={{ gap: "calc(var(--u-m) * 24)" }}
    >
      <ScrollCharFill
        as="blockquote"
        fromColor={FROM}
        toColor={TO}
        progress={quoteProgress}
        className="font-serif text-center"
        style={{
          fontSize: "max(12px, calc(var(--u-m) * 24))",
          letterSpacing: "calc(var(--u-m) * -0.48)",
          lineHeight: 1.25,
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
          fontSize: "max(12px, calc(var(--u-m) * 13))",
          letterSpacing: "calc(var(--u-m) * -0.26)",
          lineHeight: 1.4,
          margin: 0,
        }}
      >
        My life ethos, by way of Rick Rubin
      </ScrollCharFill>
    </div>
  );
}
