"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * useScrollLockedFill
 *
 * Three-phase controller for a "the page pauses while the text fills,
 * then continues" interaction:
 *
 *   idle      → waiting for the section to enter the viewport
 *   animating → page scroll is locked; a time-based ramp drives
 *               progress 0 → 1 over `durationMs`
 *   done      → progress stays at 1; scroll resumes
 *
 * Trigger is an IntersectionObserver — the animation fires once the
 * section's visible portion meets `triggerRatio`. While animating,
 * wheel/touchmove/scroll-keys are preventDefault'd so the reader has
 * to watch the line fill before they can scroll past.
 *
 * The animation plays at most once per mount. If the user lands
 * already scrolled past the section, the hook short-circuits to
 * `done`/progress=1 so the text appears filled when they scroll back.
 */
export interface UseScrollLockedFillOptions {
  /** Total duration of the fill animation in ms. */
  durationMs?: number;
  /** Intersection ratio that triggers the animation (0..1). */
  triggerRatio?: number;
}

export interface UseScrollLockedFillResult {
  progress: number;
  phase: "idle" | "animating" | "done";
}

export default function useScrollLockedFill(
  sectionRef: RefObject<HTMLElement | null>,
  options: UseScrollLockedFillOptions = {},
): UseScrollLockedFillResult {
  const { durationMs = 1100, triggerRatio = 0.45 } = options;
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"idle" | "animating" | "done">("idle");

  /* ── Trigger ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (phase !== "idle") return;
    const section = sectionRef.current;
    if (!section) return;

    // If the section is already above the viewport on mount, skip
    // animation entirely so the text reads as already-filled if the
    // user scrolls back up to it.
    const initial = section.getBoundingClientRect();
    if (initial.bottom < 0) {
      setProgress(1);
      setPhase("done");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= triggerRatio) {
          setPhase("animating");
        }
      },
      {
        threshold: [triggerRatio, triggerRatio + 0.1, 0.6, 0.75, 0.9],
      },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [phase, sectionRef, triggerRatio]);

  /* ── Drive: time-based smoothstep ramp ───────────────────────── */
  useEffect(() => {
    if (phase !== "animating") return;
    const startTime = performance.now();
    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - startTime;
      const t = Math.min(1, elapsed / durationMs);
      const eased = t * t * (3 - 2 * t);
      setProgress(eased);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setProgress(1);
        setPhase("done");
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, durationMs]);

  /* ── Lock: swallow scroll & scroll-key input while animating ─── */
  useEffect(() => {
    if (phase !== "animating") return;

    const preventScroll = (e: Event) => e.preventDefault();

    const SCROLL_KEYS = new Set([
      "ArrowDown",
      "ArrowUp",
      "PageDown",
      "PageUp",
      "Space",
      "End",
      "Home",
    ]);
    const blockKeys = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inForm =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable === true;
      if (!inForm && SCROLL_KEYS.has(e.code)) {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });
    window.addEventListener("keydown", blockKeys, { passive: false });
    return () => {
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("keydown", blockKeys);
    };
  }, [phase]);

  return { progress, phase };
}
