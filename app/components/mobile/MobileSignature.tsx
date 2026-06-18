import Image from "next/image";
import Link from "next/link";
import { BW_PORTRAIT, HEADLINE_TEXTURE } from "@/app/lib/assets";
import ArrowUpRight from "../ArrowUpRight";

/**
 * MobileSignature — cream closing band on mobile
 * (Figma 547:1033, y=2499..3005, height 506).
 *
 * Layout:
 *   • Right-side links stack (WORK / CONTACT / LINKEDIN) at (146, 37)
 *   • B&W portrait centered at (82, 201), 226×305
 *   • Giant wordmark at (28, 382), 334×96 — textured fill
 */
export default function MobileSignature() {
  return (
    <section
      id="contact-mobile"
      className="relative bg-[var(--color-cream)]"
      style={{
        height: "calc(var(--u-m) * 506)",
      }}
    >
      {/* Right-side links */}
      <nav
        className="absolute flex flex-col font-mono text-center text-black"
        style={{
          left: "calc(var(--u-m) * 146)",
          top: "calc(var(--u-m) * 37)",
          width: "calc(var(--u-m) * 99)",
          gap: "calc(var(--u-m) * 16)",
          fontSize: "calc(var(--u-m) * 16)",
          letterSpacing: "calc(var(--u-m) * -0.8)",
        }}
      >
        <Link href="/work" className="hover:opacity-60 transition-opacity">
          WORK
        </Link>
        <Link
          href="/contact"
          className="hover:opacity-60 transition-opacity"
        >
          CONTACT
        </Link>
        <a
          href="https://www.linkedin.com/in/joleenhsu/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-baseline justify-center gap-[4px] hover:opacity-60 transition-opacity"
        >
          LINKEDIN
          {/* Default ArrowUpRight (0.85em SVG, viewBox "3 3 10 10"
              → ~0.68em of visible arrow content) which lands at
              roughly cap-height of the LINKEDIN text. */}
          <ArrowUpRight />
        </a>
      </nav>

      {/* B&W portrait — rounded top */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: "calc(var(--u-m) * 82)",
          top: "calc(var(--u-m) * 201)",
          width: "calc(var(--u-m) * 226)",
          height: "calc(var(--u-m) * 305)",
          borderTopLeftRadius: "calc(var(--u-m) * 16)",
          borderTopRightRadius: "calc(var(--u-m) * 16)",
        }}
      >
        <Image
          fill
          src={BW_PORTRAIT}
          alt="Joleen Hsu"
          sizes="60vw"
          style={{ objectFit: "cover" }}
        />
      </div>

      {/* Giant "joleen hsu" wordmark — image-fill text with a subtle
          drifting background to mimic the movement of water.

          • Width spans the full footer (left/right anchored to 0).
          • Font bumped to 100u with very tight letter-spacing (-5% of
            font) so the text reads edge-to-edge while compressing the
            character spacing enough to fit "joleen hsu" inside any
            mobile viewport.
          • The "j" has a leftward descender curl that extends past its
            glyph box. backgroundPosition is shifted to "-6% 0" so the
            textured fill starts a bit to the left of the element edge,
            giving the j's curl full coverage and a tiny side padding
            against being clipped by the section's overflow-hidden. */}
      {/* Wordmark anchored to the section bottom. The `paddingBottom`
          is what's actually doing the work fixing the j: text-fill-image
          uses `background-clip: text` with transparent text color, and
          the background image only paints within the h2's padding-box.
          Without padding-bottom, the j's descender hook extends past
          the line-box (= the box edge) and renders as transparent —
          invisible against the cream background, which reads as a
          clip. Padding-bottom 30u extends the h2's painting area past
          the descender so the background image actually fills it. */}
      <h2
        className="absolute font-serif text-fill-image animate-water-drift text-center"
        style={{
          left: 0,
          right: 0,
          bottom: 0,
          paddingBottom: "calc(var(--u-m) * 30)",
          fontSize: "calc(var(--u-m) * 115)",
          letterSpacing: "calc(var(--u-m) * -3.45)",
          lineHeight: 1.05,
          margin: 0,
          backgroundImage: `url(${HEADLINE_TEXTURE})`,
          backgroundSize: "130% 320%",
          backgroundPosition: "-12% 0",
          backgroundRepeat: "no-repeat",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        joleen <span className="italic">hsu</span>
      </h2>
    </section>
  );
}
