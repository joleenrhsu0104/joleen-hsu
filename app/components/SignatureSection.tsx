import Link from "next/link";
import { BW_PORTRAIT, HEADLINE_TEXTURE } from "@/app/lib/assets";
import ArrowUpRight from "./ArrowUpRight";
import Logo from "./Logo";
import ScrollNavLink from "./ScrollNavLink";

/**
 * SignatureSection — closing on cream.
 *
 * Layout:
 *   • Horizontal row of WORK / CONTACT / LINKEDIN links centered
 *     above the portrait at the top of the section
 *   • Centered B&W portrait of Joleen, rounded top corners
 *   • Giant "joleen.design" wordmark (500px) overlaid behind/around
 *     the portrait, with an image fill that subtly drifts ("water"
 *     annotation)
 */
export default function SignatureSection() {
  return (
    <section
      id="contact"
      className="relative flex items-center justify-center overflow-hidden"
      style={{
        // Always cream — the footer is the closing beat of the page
        // and reads as a calm warm surface regardless of what came
        // above. (Previously this tracked --scroll-bg to fade from
        // dark to cream alongside WhatIDoSection, but that gradient
        // animation was removed at the user's request.)
        backgroundColor: "var(--color-cream)",
      }}
    >
      <div
        className="relative"
        style={{
          width: "calc(var(--u) * 1920)",
          height: "calc(var(--u) * 940)",
        }}
      >
      {/* Portrait of Joleen — rounded top */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: "calc(var(--u) * 677)",
          top: "calc(var(--u) * 175)",
          width: "calc(var(--u) * 565.58)",
          height: "calc(var(--u) * 765)",
          borderTopLeftRadius: "4px",
          borderTopRightRadius: "4px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={BW_PORTRAIT}
          alt="Joleen Hsu"
          className="size-full object-cover"
        />
      </div>

      {/* Top-left wordmark — Zalando Sans SemiExpanded Medium,
          matches the universal header logo across the rest of the
          site. Aligned with the top edge of the portrait (top: 175u)
          so the eye traces a straight line across the three
          elements: wordmark → portrait top → nav. */}
      <Link
        href="/"
        aria-label="Home"
        className="absolute hover:opacity-70 transition-opacity"
        style={{
          left: "calc(var(--u) * 70)",
          top: "calc(var(--u) * 175)",
          color: "var(--color-ink)",
          zIndex: 20,
        }}
      >
        <Logo height="calc(var(--u) * 28)" />
      </Link>

      {/* Top-right nav — matches the universal header nav on all
          other pages: Instrument Sans Medium (500), title case,
          -2% letter-spacing. Aligned with the top edge of the
          portrait (top: 175u). */}
      <nav
        className="absolute flex flex-row items-center font-sans text-black whitespace-nowrap"
        style={{
          right: "calc(var(--u) * 70)",
          top: "calc(var(--u) * 175)",
          gap: "calc(var(--u) * 48)",
          fontSize: "max(14px, calc(var(--u) * 20))",
          fontWeight: 500,
          letterSpacing: "calc(var(--u) * -0.4)",
          lineHeight: 1,
          zIndex: 20,
        }}
      >
        <ScrollNavLink hash="work" className="hover:opacity-60 transition-opacity">
          Work
        </ScrollNavLink>
        <ScrollNavLink hash="contact" className="hover:opacity-60 transition-opacity">
          Contact
        </ScrollNavLink>
        <a
          href="https://www.linkedin.com/in/joleenhsu/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-baseline gap-[4px] hover:opacity-60 transition-opacity"
        >
          LinkedIn
          <ArrowUpRight />
        </a>
      </nav>

      {/* Giant "hi@joleen.design" wordmark — image-fill text with a
          subtle drifting background to mimic the movement of water.
          Font size 340u fits the 16-char string inside the 1920u
          canvas with comfortable margin on each side.

          mailto: link so a click opens the visitor's mail client
          and a native text-selection drag / right-click still lets
          them copy the address. No hover state — the drifting
          water-fill IS the affordance. */}
      <a
        href="mailto:hi@joleen.design"
        aria-label="Email hi@joleen.design"
        className="absolute font-serif text-fill-image animate-water-drift text-center block"
        style={{
          left: "50%",
          top: "calc(var(--u) * 500)",
          transform: "translateX(-50%)",
          width: "calc(var(--u) * 1920)",
          fontSize: "max(14px, calc(var(--u) * 340))",
          letterSpacing: "calc(var(--u) * -6.8)",
          lineHeight: 1.1,
          margin: 0,
          backgroundImage: `url(${HEADLINE_TEXTURE})`,
          backgroundSize: "117% 291%",
          backgroundRepeat: "no-repeat",
          whiteSpace: "nowrap",
        }}
      >
        hi@joleen.design
      </a>
      </div>
    </section>
  );
}
