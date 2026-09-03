"use client";

import { useRouter, usePathname } from "next/navigation";
import type React from "react";

/**
 * ScrollNavLink — a nav link that jumps to a section anchor on the
 * home page instead of routing to a separate page.
 *
 * Behavior:
 *   • On "/" — preventDefault + smooth-scroll to the element with
 *     the given id via scrollIntoView(behavior: "smooth"). The URL
 *     hash is updated via history.replaceState so it's linkable but
 *     doesn't add a history entry the back button would land on.
 *   • On any other route — pushes "/#hash" via Next's router. The
 *     browser's default hash-scroll then lands the visitor at the
 *     section once the home page hydrates.
 *
 * We render as a plain <a href="/#hash"> so the underlying markup is
 * still a real link — screen readers and middle-click / cmd-click
 * "open in new tab" behavior all work, and the JS handler layers
 * the smooth-scroll on top.
 *
 * The `onClick` prop lets callers add cleanup (mobile drawer close,
 * etc.); it runs before the scroll/navigate action.
 */
export default function ScrollNavLink({
  hash,
  className,
  style,
  onClick,
  children,
}: {
  hash: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let cmd/ctrl/middle clicks fall through to the browser so the
    // "open in new tab" affordance keeps working.
    if (
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      e.button !== 0
    ) {
      return;
    }
    e.preventDefault();
    onClick?.();
    if (pathname === "/") {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", `/#${hash}`);
      }
    } else {
      router.push(`/#${hash}`);
    }
  };

  return (
    <a
      href={`/#${hash}`}
      onClick={handleClick}
      className={className}
      style={style}
    >
      {children}
    </a>
  );
}
