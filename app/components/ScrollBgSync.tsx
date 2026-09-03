"use client";

import { useEffect } from "react";

/**
 * ScrollBgSync — keeps a single scroll-driven background color in
 * sync across multiple sibling sections.
 *
 * Sets two CSS custom properties on `<html>`:
 *   • `--scroll-bg`   — interpolated cream ↔ near-black
 *   • `--scroll-text` — interpolated ink   ↔ cream
 *
 * Two transition phases drive the variable:
 *
 *   Phase 1 (cream → dark): triggered by `#ethos` (HomeWorkSection)
 *     entering the viewport from below. AboutSentences and
 *     HomeWorkSection both read --scroll-bg, so their boundary blends.
 *
 *   Phase 2 (dark → cream): triggered by `#contact` (SignatureSection)
 *     entering the viewport from below. WhatIDoSection and Signature
 *     both read --scroll-bg, so the dark→cream boundary also blends.
 *
 * Phase 2 takes precedence when it engages — that way the dark
 * section is being "left behind" as the cream signature footer
 * arrives. Both phases mirror the same timing window for symmetry.
 */

const CREAM: [number, number, number] = [0xff, 0xf9, 0xec];
const NEAR_BLACK: [number, number, number] = [0x03, 0x03, 0x03];
const INK: [number, number, number] = [0x23, 0x1f, 0x20];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpColor(
  from: [number, number, number],
  to: [number, number, number],
  t: number,
) {
  return `rgb(${Math.round(lerp(from[0], to[0], t))}, ${Math.round(
    lerp(from[1], to[1], t),
  )}, ${Math.round(lerp(from[2], to[2], t))})`;
}

function smoothstep(t: number) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

// Shared timing window — applied identically to both phases so the
// dark→cream fade out of WhatIDoSection mirrors the cream→dark fade
// into it. Window tightened to 10% of viewport (was 15%) for a
// faster, snappier crossfade between cream and dark sections.
function phaseProgress(rectTop: number, vh: number) {
  const START = 0.18 * vh;
  const END = 0.08 * vh;
  const raw = (START - rectTop) / (START - END);
  return smoothstep(Math.max(0, Math.min(1, raw)));
}

export default function ScrollBgSync() {
  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
      const ethos = document.getElementById("ethos");
      if (!ethos) return;

      const vh = window.innerHeight;

      // Phase 1: cream → dark (Rubin → WhatIDoSection)
      const p1 = phaseProgress(ethos.getBoundingClientRect().top, vh);

      // Phase 2: dark → cream (WhatIDoSection → SignatureSection).
      // Only engages once #contact starts entering the viewport.
      const contact = document.getElementById("contact");
      const p2 = contact
        ? phaseProgress(contact.getBoundingClientRect().top, vh)
        : 0;

      let bg: string;
      let text: string;
      if (p2 > 0) {
        // Phase 2 takes precedence — the dark section is being left
        // behind. Interpolate back toward cream as the signature
        // footer arrives.
        bg = lerpColor(NEAR_BLACK, CREAM, p2);
        text = lerpColor(CREAM, INK, p2);
      } else {
        bg = lerpColor(CREAM, NEAR_BLACK, p1);
        text = lerpColor(INK, CREAM, p1);
      }

      const root = document.documentElement.style;
      root.setProperty("--scroll-bg", bg);
      root.setProperty("--scroll-text", text);
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
      const root = document.documentElement.style;
      root.removeProperty("--scroll-bg");
      root.removeProperty("--scroll-text");
    };
  }, []);

  return null;
}
