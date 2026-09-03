"use client";

import { useEffect, useState } from "react";

/**
 * Returns true if the viewport matches the mobile breakpoint (<800px).
 * Chosen so the desktop's bio + taste captions stay in a 2-column
 * bottom layout as long as they can hold at least ~24px of visual
 * gap between the two blocks. At 14px min font (52-char sans bio +
 * 51-char sans taste ≈ 721px content, plus 140u-scaled padding), the
 * gap closes to 24px right around viewport width = 803. Below 800 we
 * switch to the mobile stacked layout where bio + taste live in a
 * single column at the bottom of the hero.
 * Server-renders as `false` (desktop) and updates on client mount —
 * accept a one-frame flash for the SSR-safe path.
 */
export function useIsMobile(breakpoint = 800) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}
