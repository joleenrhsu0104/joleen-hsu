"use client";

import { useEffect, useRef, useState } from "react";
import ArrowUpRight from "./ArrowUpRight";
import Logo from "./Logo";
import ScrollNavLink from "./ScrollNavLink";

/**
 * ScrollUpNav — fixed-position nav bar that reveals when the
 * user scrolls UP the page and hides when they scroll down or
 * are at the top (where the in-page nav in OpeningSequence is
 * already visible).
 *
 * Contents mirror the header used across the site: JOLEEN.DESIGN
 * logo on the left, Work / Contact / LinkedIn on the right.
 *
 * Visibility rules:
 *   • At scrollY < 200 → hidden (the in-page nav is on-screen).
 *   • Scrolling UP (deltaY < 0) → visible.
 *   • Scrolling DOWN (deltaY > 0) → hidden.
 *
 * Position: `fixed top-0 left-0 right-0` so it floats over
 * every section. Uses cream bg + hairline bottom border so it
 * reads over any surface. Transform-based show/hide so the
 * transition is GPU-composited and doesn't reflow the page.
 */
export default function ScrollUpNav() {
  const [visible, setVisible] = useState(false);
  const lastYRef = useRef(0);

  useEffect(() => {
    lastYRef.current = window.scrollY;
    let raf = 0;

    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const dy = y - lastYRef.current;
      // Only toggle on meaningful movement to avoid flicker at
      // rest / from momentum-scroll micro-jitter.
      if (Math.abs(dy) < 4) {
        lastYRef.current = y;
        return;
      }
      if (y < 200) {
        setVisible(false);
      } else if (dy < 0) {
        setVisible(true);
      } else {
        setVisible(false);
      }
      lastYRef.current = y;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <nav
      aria-label="Scroll-reveal navigation"
      className="fixed left-0 right-0 top-0 flex items-center justify-between"
      style={{
        paddingLeft: "calc(var(--u) * 70)",
        paddingRight: "calc(var(--u) * 70)",
        paddingTop: "calc(var(--u) * 24)",
        paddingBottom: "calc(var(--u) * 24)",
        backgroundColor: "var(--color-cream)",
        borderBottom: "1px solid rgba(35, 31, 32, 0.12)",
        color: "var(--color-ink)",
        zIndex: 100,
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 0.3s cubic-bezier(0.2, 0.7, 0.2, 1)",
        willChange: "transform",
      }}
    >
      <a
        href="/"
        aria-label="Home"
        className="flex items-center hover:opacity-70 transition-opacity"
      >
        <Logo height="calc(var(--u) * 28)" />
      </a>
      <div
        className="flex items-center font-sans"
        style={{
          gap: "calc(var(--u) * 48)",
          fontSize: "max(14px, calc(var(--u) * 20))",
          fontWeight: 500,
          letterSpacing: "calc(var(--u) * -0.4)",
          lineHeight: 1,
        }}
      >
        <ScrollNavLink
          hash="work"
          className="hover:opacity-70 transition-opacity"
        >
          Work
        </ScrollNavLink>
        <ScrollNavLink
          hash="contact"
          className="hover:opacity-70 transition-opacity"
        >
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
      </div>
    </nav>
  );
}
