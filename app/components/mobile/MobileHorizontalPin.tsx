"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * MobileHorizontalPin — vertical-to-horizontal scroll-pin row.
 *
 * Wraps a horizontal row of items so that, as the user scrolls
 * vertically past this section, a sticky inner stage holds the row
 * pinned to the top of the viewport and translates its content
 * horizontally at a rate of 1px per 1px of vertical scroll. Once
 * the entire horizontal overflow has been traversed, the pin
 * releases and the page resumes normal vertical scrolling into the
 * next section. Gives the cinematic "scroll down to advance
 * sideways" feel used across the Wonder / Blue Apron / Neuday
 * phone-mock rows.
 *
 * Mechanics:
 *   • Outer wrapper height = 100vh + overflowWidth (the extra px
 *     the row extends past the viewport). That extra height is
 *     exactly how much vertical scroll the user spends pinned.
 *   • Sticky inner stage is 100vh tall with overflow:hidden, so
 *     content outside the viewport while translated stays hidden.
 *   • Row content is vertically centered inside the 100vh stage so
 *     short items (e.g., phone mocks) read as anchored mid-viewport.
 *   • Scroll handler maps wrapper.top from 0 → -overflowWidth onto
 *     a transform of translate3d(0, 0, 0) → translate3d(-overflowWidth, 0, 0).
 *
 * Drop-in replacement for `<div className="flex overflow-x-auto">`
 * — pass row items directly as children.
 */
export default function MobileHorizontalPin({
  children,
  gap = "calc(var(--u-m) * 12)",
  paddingX = "calc(var(--u-m) * 16)",
}: {
  children: ReactNode;
  /** Gap between row items (CSS length). Defaults to 12u-m. */
  gap?: string;
  /** Side padding around the row (CSS length). Defaults to 16u-m. */
  paddingX?: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const overflowRef = useRef(0);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const inner = innerRef.current;
    if (!wrapper || !inner) return;

    const measure = () => {
      const total = inner.scrollWidth;
      const viewport = window.innerWidth;
      const overflow = Math.max(0, total - viewport);
      overflowRef.current = overflow;
      // Wrapper total height = 100vh (one viewport for the sticky pin)
      // + however many px of horizontal scroll need to elapse. So if
      // the row overflows by 600px, the user must scroll 600px
      // vertically past the wrapper top before the pin releases.
      wrapper.style.height = `calc(100vh + ${overflow}px)`;
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(inner);
    window.addEventListener("resize", measure);

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const overflow = overflowRef.current;
        if (overflow === 0) {
          inner.style.transform = "translate3d(0, 0, 0)";
          return;
        }
        const rect = wrapper.getBoundingClientRect();
        // 1px of vertical scroll past wrapper top = 1px of horizontal
        // translate. Clamped at overflow so the row never goes past
        // its right edge.
        const scrolled = Math.max(0, Math.min(overflow, -rect.top));
        inner.style.transform = `translate3d(${-scrolled}px, 0, 0)`;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className="sticky top-0 overflow-hidden"
        style={{ height: "100vh" }}
      >
        <div className="flex items-center h-full">
          <div
            ref={innerRef}
            className="flex items-center shrink-0"
            style={{
              gap,
              paddingLeft: paddingX,
              paddingRight: paddingX,
              willChange: "transform",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
