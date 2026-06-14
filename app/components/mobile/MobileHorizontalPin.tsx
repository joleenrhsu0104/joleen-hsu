"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * MobileHorizontalPin — wraps a horizontal row of items so that, as the
 * user scrolls VERTICALLY, the row pins to the top of the viewport and
 * its content slides HORIZONTALLY at a rate proportional to scroll
 * progress. Once the row has scrolled through all its content, the pin
 * releases and the page continues to scroll normally into the next
 * section.
 *
 * Mechanics:
 *   • Outer wrapper has explicit height = 100vh + overflowWidth, where
 *     overflowWidth is how many px the inner content extends past the
 *     viewport. That total height is the scroll distance the user must
 *     traverse before the pin releases.
 *   • Inner sticky container sits at top: 0 with height 100vh — pinning
 *     the row in place while the outer wrapper scrolls past it.
 *   • A scroll listener computes "progress" (0..1) through the outer
 *     wrapper's scroll range and applies `translate3d(-progress * overflowWidth, 0, 0)`
 *     to the row's content, so each px of vertical scroll = 1 px of
 *     horizontal motion.
 *
 * Drop-in replacement for `<div className="flex overflow-x-auto" ...>`
 * patterns — pass children directly as the row items. The component
 * handles the wrapper + sticky stage + transform internally.
 */
export default function MobileHorizontalPin({
  children,
  gap = "calc(var(--u-m) * 12)",
  paddingX = "calc(var(--u-m) * 16)",
}: {
  children: ReactNode;
  /** Gap between row items (CSS length). Defaults to 12u. */
  gap?: string;
  /** Side padding around the row (CSS length). Defaults to 16u. */
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
      // Wrapper's total height = 100vh (one viewport for the pin) plus
      // however many px of horizontal motion are needed. So if the row
      // overflows by 600px, the user must scroll 600px vertically past
      // the wrapper's top before the pin releases.
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
        const scrolled = Math.max(0, Math.min(overflow, -rect.top));
        // 1 px of vertical scroll past the wrapper's top = 1 px of
        // horizontal motion. Clamps at the full overflow so the row
        // can never translate further than its content's right edge.
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
