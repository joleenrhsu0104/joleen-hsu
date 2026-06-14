"use client";

import { useEffect, useState } from "react";

/**
 * Returns true if the viewport matches the mobile breakpoint (<768px).
 * Server-renders as `false` (desktop) and updates on client mount —
 * accept a one-frame flash for the SSR-safe path.
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}
