"use client";

import { useState } from "react";
import Link from "next/link";
import MobileMenu from "./MobileMenu";

/**
 * MobileTopNav — the universal mobile header used across every page:
 *
 *   [ joleen ]                                    [ ☰ ]
 *
 * Tapping the hamburger opens the full-screen MobileMenu drawer
 * (WORK · CONTACT · LINKEDIN) — same drawer used on the home page,
 * so the navigation pattern is identical no matter where the user
 * lands.
 *
 * Two layouts are supported via `mode`:
 *
 *   • `overlay` — absolutely positioned, pinned at top:68u, transparent
 *      bg. Used by MobileHero so the nav floats above the cycling
 *      hero artwork.
 *
 *   • `flow`    — normal block-flow with padding around it. Used by
 *      all case studies and full pages so the nav lives in-document
 *      and pushes the rest of the page below it.
 *
 * The nav inherits text color from its parent by default, so a cream
 * page automatically gets ink-colored chrome and a near-black page
 * automatically gets white chrome. Pages that need to FORCE a color
 * (e.g. Neuday's NEAR_BLACK header band sitting on top of a cream
 * main) can override via `navClassName` / `navStyle`.
 */

type Props = {
  mode?: "overlay" | "flow";
  /** Optional override for inline style on the outer <nav>. */
  navStyle?: React.CSSProperties;
  /** Optional override for className on the outer <nav>. */
  navClassName?: string;
};

export default function MobileTopNav({
  mode = "flow",
  navStyle,
  navClassName,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const baseStyle: React.CSSProperties =
    mode === "overlay"
      ? {
          left: "calc(var(--u-m) * 16)",
          right: "calc(var(--u-m) * 16)",
          top: "calc(var(--u-m) * 24)",
          height: "calc(var(--u-m) * 38)",
          zIndex: 20,
        }
      : {
          paddingLeft: "calc(var(--u-m) * 16)",
          paddingRight: "calc(var(--u-m) * 16)",
          paddingTop: "calc(var(--u-m) * 24)",
          paddingBottom: "calc(var(--u-m) * 24)",
        };

  return (
    <>
      <nav
        className={[
          "flex items-center justify-between",
          mode === "overlay" ? "absolute" : "",
          navClassName ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ ...baseStyle, ...navStyle }}
      >
        <Link
          href="/"
          aria-label="Home"
          className="flex items-center h-full font-serif whitespace-nowrap"
          style={{
            fontSize: "calc(var(--u-m) * 36)",
            lineHeight: 1,
            letterSpacing: "calc(var(--u-m) * -0.72)",
          }}
        >
          joleen <span className="italic">hsu</span>
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="hover:opacity-70 transition-opacity"
          style={{
            width: "calc(var(--u-m) * 32)",
            height: "calc(var(--u-m) * 28)",
          }}
        >
          {/* Hamburger icon (3 horizontal lines) — stroke uses
              currentColor so it picks up the parent's text color. */}
          <svg
            viewBox="0 0 24 21"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="size-full"
          >
            <line x1="2" y1="4" x2="22" y2="4" />
            <line x1="2" y1="10.5" x2="22" y2="10.5" />
            <line x1="2" y1="17" x2="22" y2="17" />
          </svg>
        </button>
      </nav>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
