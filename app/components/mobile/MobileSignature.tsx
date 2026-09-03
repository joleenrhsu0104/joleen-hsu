import Link from "next/link";
import { BW_PORTRAIT, HEADLINE_TEXTURE } from "@/app/lib/assets";
import ArrowUpRight from "../ArrowUpRight";
import Logo from "../Logo";
import ScrollNavLink from "../ScrollNavLink";

/**
 * MobileSignature — cream closing band on mobile, mirrors the
 * desktop SignatureSection composition:
 *
 *   • Top-left: small JOLEEN.DESIGN logo, aligned with portrait top
 *   • Top-right: horizontal Work / Contact / LinkedIn nav
 *   • Centered: B&W portrait
 *   • Bottom: giant "hi@joleen.design" mailto link with textured fill
 */
export default function MobileSignature() {
  return (
    <section
      id="contact"
      className="relative bg-[var(--color-cream)]"
      style={{
        // Section sized just tall enough to hold the header row +
        // ~40u-m breathing gap + the 305u-m portrait. No trailing
        // padding below — portrait bottom aligns with section
        // bottom (the "floor" of the screen).
        height: "calc(var(--u-m) * 400)",
      }}
    >
      {/* Top-left: small logo — link back to home. Sits on the same
          horizontal baseline as the portrait's top edge (top: 32u-m)
          so the eye traces a straight line: logo → portrait top → nav. */}
      <Link
        href="/"
        aria-label="Home"
        className="absolute active:opacity-70 transition-opacity"
        style={{
          left: "calc(var(--u-m) * 20)",
          top: "calc(var(--u-m) * 32)",
          color: "var(--color-ink)",
          zIndex: 20,
        }}
      >
        <Logo height="calc(var(--u-m) * 18)" />
      </Link>

      {/* Top-right: horizontal nav — Work · Contact · LinkedIn.
          12u-m font + 14u-m gaps so the three items fit alongside
          the top-left logo inside the 350u-m usable width. */}
      <nav
        className="absolute flex flex-row items-center font-sans text-black whitespace-nowrap"
        style={{
          right: "calc(var(--u-m) * 20)",
          top: "calc(var(--u-m) * 32)",
          height: "calc(var(--u-m) * 18)",
          gap: "calc(var(--u-m) * 14)",
          fontSize: "max(12px, calc(var(--u-m) * 12))",
          fontWeight: 500,
          letterSpacing: "calc(var(--u-m) * -0.24)",
          lineHeight: 1,
          zIndex: 20,
        }}
      >
        <ScrollNavLink hash="work" className="active:opacity-60 transition-opacity">
          Work
        </ScrollNavLink>
        <ScrollNavLink hash="contact" className="active:opacity-60 transition-opacity">
          Contact
        </ScrollNavLink>
        <a
          href="https://www.linkedin.com/in/joleenhsu/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-baseline gap-[3px] active:opacity-60 transition-opacity"
        >
          LinkedIn
          <ArrowUpRight />
        </a>
      </nav>

      {/* B&W portrait — centered horizontally, bottom flush with
          the section's bottom edge so it visually anchors the whole
          footer to the floor of the screen. 4px top corner radius
          matches the sitewide standard. */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: "50%",
          transform: "translateX(-50%)",
          bottom: 0,
          width: "calc(var(--u-m) * 226)",
          height: "calc(var(--u-m) * 305)",
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

      {/* Giant "hi@joleen.design" mailto link — overlaid on top of
          the portrait's lower half. Left/right insets match the
          top-row logo + nav (20u-m each), so the wordmark's edges
          land on the same vertical rules as the header chrome.
          Font sized so the 16-char string reads edge-to-edge across
          that 350u-m span.
          text-fill-image makes the letter interiors show the
          water-drift texture; the surrounding "empty" box lets the
          portrait show through the gaps between letters, so the
          two layers weave together. */}
      <a
        href="mailto:hi@joleen.design"
        aria-label="Email hi@joleen.design"
        className="absolute font-serif text-fill-image animate-water-drift text-center block"
        style={{
          left: "calc(var(--u-m) * 20)",
          right: "calc(var(--u-m) * 20)",
          bottom: "calc(var(--u-m) * 24)",
          fontSize: "max(12px, calc(var(--u-m) * 65))",
          letterSpacing: "calc(var(--u-m) * -1.3)",
          lineHeight: 1.05,
          margin: 0,
          backgroundImage: `url(${HEADLINE_TEXTURE})`,
          backgroundSize: "130% 320%",
          backgroundPosition: "-12% 0",
          backgroundRepeat: "no-repeat",
          whiteSpace: "nowrap",
          zIndex: 10,
        }}
      >
        hi@joleen.design
      </a>
    </section>
  );
}
