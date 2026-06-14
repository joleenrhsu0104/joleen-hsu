"use client";

import Link from "next/link";

/**
 * MobileMenu — full-screen drawer overlay triggered by the hamburger.
 *
 * Layout per Figma (mobile, 390 wide, frame 547:2604):
 *   • Header at top with logo on left, close (X) icon on right
 *   • Three menu items (WORK, CONTACT, LINKEDIN) at y=188+
 *   • Hairlines between items at y=77 and y=178 within the menu frame
 */
export default function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      className="fixed inset-0 z-[100] bg-[var(--color-cream)] text-black transition-opacity duration-300"
      style={{
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
      }}
    >
      {/* Top nav with logo + close */}
      <div
        className="absolute flex items-center justify-between"
        style={{
          left: "calc(var(--u-m) * 16)",
          right: "calc(var(--u-m) * 16)",
          top: "calc(var(--u-m) * 24)",
          height: "calc(var(--u-m) * 38)",
        }}
      >
        <Link
          href="/"
          aria-label="Home"
          onClick={onClose}
          className="flex items-center h-full font-serif text-black whitespace-nowrap"
          style={{
            fontSize: "calc(var(--u-m) * 36)",
            lineHeight: 1,
            letterSpacing: "calc(var(--u-m) * -0.72)",
          }}
        >
          joleen
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="hover:opacity-70 transition-opacity"
          style={{
            width: "calc(var(--u-m) * 32)",
            height: "calc(var(--u-m) * 32)",
          }}
        >
          {/* Close (X) icon */}
          <svg
            viewBox="0 0 32 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="size-full"
          >
            <line x1="7" y1="7" x2="25" y2="25" />
            <line x1="25" y1="7" x2="7" y2="25" />
          </svg>
        </button>
      </div>

      {/* Menu items list */}
      <nav
        className="absolute flex flex-col font-serif"
        style={{
          left: "calc(var(--u-m) * 16)",
          right: "calc(var(--u-m) * 16)",
          top: "calc(var(--u-m) * 144)",
        }}
      >
        {[
          { label: "Work", href: "/work" },
          { label: "Contact", href: "/contact" },
          {
            label: "LinkedIn",
            href: "https://www.linkedin.com/in/joleenhsu/",
            external: true,
          },
        ].map((item, i, arr) => (
          <div key={item.label}>
            {item.external ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="block hover:opacity-60 transition-opacity"
                style={{
                  fontSize: "calc(var(--u-m) * 44)",
                  letterSpacing: "calc(var(--u-m) * -0.88)",
                  lineHeight: 1.2,
                  paddingTop: "calc(var(--u-m) * 12)",
                  paddingBottom: "calc(var(--u-m) * 12)",
                }}
              >
                {item.label}
              </a>
            ) : (
              <Link
                href={item.href}
                onClick={onClose}
                className="block hover:opacity-60 transition-opacity"
                style={{
                  fontSize: "calc(var(--u-m) * 44)",
                  letterSpacing: "calc(var(--u-m) * -0.88)",
                  lineHeight: 1.2,
                  paddingTop: "calc(var(--u-m) * 12)",
                  paddingBottom: "calc(var(--u-m) * 12)",
                }}
              >
                {item.label}
              </Link>
            )}
            {i < arr.length - 1 && (
              <div
                className="border-t border-black/30"
                style={{
                  marginLeft: "calc(var(--u-m) * 10)",
                  marginRight: "calc(var(--u-m) * 10)",
                }}
              />
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
