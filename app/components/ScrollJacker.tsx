"use client";

import { useEffect, useRef } from "react";

/**
 * ScrollJacker — full-page scrolljacking for desktop panels.
 *
 * Listens for wheel events page-wide and animates the document
 * scroll between panels with custom easing, locking the viewport
 * for the duration of each transition so the user feels truly
 * locked into one section before moving to the next.
 *
 * The Hero panel manages its OWN scrolljacking internally (cycling
 * between the 4 project reveals), so ScrollJacker yields control
 * to the hero whenever the hero is fully covering the viewport.
 * When the hero is done with its internal cycle, it triggers a
 * `scrollIntoView` to the About panel, at which point this
 * scrolljacker takes over for About → Ethos → Footer transitions.
 *
 * Mobile (<768px) does NOT mount this — touch scroll is left alone.
 */

interface PanelDef {
  id: string;
  selector: string;
}

const PANELS: PanelDef[] = [
  { id: "hero", selector: 'section[aria-label="Featured work"]' },
  { id: "about", selector: "#about" },
  { id: "ethos", selector: "#ethos" },
  { id: "contact", selector: "#contact" },
];

interface ResolvedPanel {
  id: string;
  el: HTMLElement;
}

const TRANSITION_MS = 1100;
const COOLDOWN_MS = 250;
// How much of the panel must fill the viewport to be considered "current"
const ACTIVE_FILL_THRESHOLD = 0.5;

/** Cubic ease-in-out — slow start, slow end, fast middle. */
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function ScrollJacker() {
  const lockedUntilRef = useRef(0);
  const animatingRef = useRef(false);

  useEffect(() => {
    // Resolve panel elements. They're stable across the page lifetime
    // but we re-resolve on each wheel for safety against late mounts.
    const resolvePanels = (): ResolvedPanel[] => {
      const out: ResolvedPanel[] = [];
      for (const p of PANELS) {
        const el = document.querySelector(p.selector);
        if (el instanceof HTMLElement) {
          out.push({ id: p.id, el });
        }
      }
      return out;
    };

    /**
     * Animate window.scrollY from current position to a target with
     * a cubic ease-in-out curve. Sets `animatingRef` while in flight
     * so the wheel handler can short-circuit during the animation.
     */
    const animateScrollTo = (targetY: number) => {
      const startY = window.scrollY;
      const distance = targetY - startY;
      if (Math.abs(distance) < 1) return;

      const startTime = performance.now();
      animatingRef.current = true;

      const step = (now: number) => {
        const t = Math.min(1, (now - startTime) / TRANSITION_MS);
        const eased = easeInOutCubic(t);
        window.scrollTo(0, startY + distance * eased);
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          animatingRef.current = false;
        }
      };

      requestAnimationFrame(step);
    };

    const handleWheel = (e: WheelEvent) => {
      const panels = resolvePanels();
      if (panels.length === 0) return;

      const now = Date.now();

      // ── 1. While our animation is running, absorb everything ──
      if (animatingRef.current || now < lockedUntilRef.current) {
        e.preventDefault();
        return;
      }

      // ── 2. If the hero is fully in view, defer to its internal
      //       cycling. Hero only releases when it has scrolled to
      //       About on its own (its handler calls scrollIntoView). ──
      const hero = panels.find((p) => p.id === "hero");
      if (hero) {
        const rect = hero.el.getBoundingClientRect();
        if (rect.top <= 0 && rect.bottom > window.innerHeight) {
          return;
        }
      }

      // ── 3. Identify which non-hero panel currently fills the
      //       viewport (top at/above 0, enough of its body visible). ──
      let currentIdx = -1;
      for (let i = 0; i < panels.length; i++) {
        const rect = panels[i].el.getBoundingClientRect();
        const visibleHeight =
          Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
        if (
          rect.top <= window.innerHeight * 0.2 &&
          visibleHeight >= window.innerHeight * ACTIVE_FILL_THRESHOLD
        ) {
          currentIdx = i;
        }
      }
      if (currentIdx === -1) return;

      // Don't scrolljack out of the hero from this handler — let the
      // hero do that itself. We only take over once the hero is done.
      if (panels[currentIdx].id === "hero") return;

      const direction = e.deltaY > 0 ? 1 : -1;
      const targetIdx = currentIdx + direction;

      // At the page edges (above first or below last), let the page
      // scroll naturally so the user can leave the site.
      if (targetIdx < 0 || targetIdx >= panels.length) return;

      e.preventDefault();
      lockedUntilRef.current = now + TRANSITION_MS + COOLDOWN_MS;

      // Compute target scroll position from the panel's offsetTop —
      // more reliable than scrollIntoView when other things are
      // listening for scroll events.
      const targetEl = panels[targetIdx].el;
      const targetY = targetEl.getBoundingClientRect().top + window.scrollY;
      animateScrollTo(targetY);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  return null;
}
