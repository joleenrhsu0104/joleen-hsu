"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * MobileHorizontalPin — vertical-to-horizontal scroll-pin row with a
 * compact stage.
 *
 * Used across the case studies (Wonder Mobile Web, Blue Apron
 * AlaCarte/PDPs/Funnel, Neuday phone row) to give the cinematic
 * "scroll down to advance sideways through phone mocks" feel.
 *
 * History:
 *   v1 — sticky-pinned scroll-jack with a 100vh stage. Cinematic feel
 *        was right, but the 100vh stage centered the (much shorter)
 *        phone-mock row inside it, leaving ~½ viewport of empty cream
 *        above and below.
 *   v2 — replaced the pin with native horizontal swipe + scroll-snap.
 *        Killed the empty space but also killed the vertical-scroll-
 *        drives-the-row behavior.
 *   v3 (current) — restore the sticky-pin behavior, but size the
 *        sticky stage to the row's natural height + a configurable
 *        vertical padding (default 44u-m), so:
 *          • Vertical scroll still advances the row horizontally
 *            (cinematic feel preserved).
 *          • The stage is only as tall as the row needs — no more
 *            ½-viewport of dead air on either side.
 *          • Wrapper height is stageHeight + horizontalOverflow, so
 *            the user spends `overflow` pixels of vertical scroll
 *            inside the pin before it releases.
 *
 * Drop-in replacement for v1 — same children, same `gap` and
 * `paddingX` API; `paddingY` is new (default 44u-m) for the
 * top/bottom breathing room.
 */
export default function MobileHorizontalPin({
  children,
  gap = "calc(var(--u-m) * 12)",
  paddingX = "calc(var(--u-m) * 16)",
  paddingY = "calc(var(--u-m) * 44)",
}: {
  children: ReactNode;
  /** Gap between row items (CSS length). Defaults to 12u-m. */
  gap?: string;
  /** Side padding around the row (CSS length). Defaults to 16u-m. */
  paddingX?: string;
  /** Top/bottom padding around the row (CSS length). Defaults to
   *  44u-m — comfortable breathing room without a 100vh stage. */
  paddingY?: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const overflowRef = useRef(0);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const sticky = stickyRef.current;
    const inner = innerRef.current;
    if (!wrapper || !sticky || !inner) return;

    const measure = () => {
      // Horizontal overflow — how far past the viewport the inner row
      // extends. This is the pixel budget the user has to scroll
      // vertically while pinned to traverse the row.
      const total = inner.scrollWidth;
      const viewport = window.innerWidth;
      const overflow = Math.max(0, total - viewport);
      overflowRef.current = overflow;

      // Stage height = inner row's natural height (with padding baked
      // in via inner's paddingY). The sticky element inherits this
      // because it has no explicit height of its own.
      const stageHeight = inner.offsetHeight;

      // Wrapper total height = stageHeight + overflow. While the
      // wrapper scrolls past, the sticky stage stays pinned at top:0
      // for exactly `overflow` pixels — the user's vertical scroll
      // during that window drives the horizontal translate 1:1.
      wrapper.style.height = `${stageHeight + overflow}px`;
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
        // translate. Clamped to [0, overflow] so the row never goes
        // past its edges.
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
      <div ref={stickyRef} className="sticky top-0 overflow-hidden">
        <div
          ref={innerRef}
          className="flex items-center"
          style={{
            gap,
            paddingLeft: paddingX,
            paddingRight: paddingX,
            paddingTop: paddingY,
            paddingBottom: paddingY,
            width: "max-content",
            willChange: "transform",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
