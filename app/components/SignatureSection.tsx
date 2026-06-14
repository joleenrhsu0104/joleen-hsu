import Link from "next/link";
import { BW_PORTRAIT, HEADLINE_TEXTURE } from "@/app/lib/assets";

/**
 * SignatureSection — closing on cream.
 *
 * Layout:
 *   • Horizontal row of WORK / CONTACT / LINKEDIN links centered
 *     above the portrait at the top of the section
 *   • Centered B&W portrait of Joleen, rounded top corners
 *   • Giant "joleen hsu" wordmark (500px) overlaid behind/around the
 *     portrait, with an image fill that subtly drifts ("water" annotation)
 */
export default function SignatureSection() {
  return (
    <section
      id="contact"
      className="relative flex items-center justify-center overflow-hidden"
      style={{
        // Read the same scroll-driven bg as WhatIDoSection so the
        // dark→cream transition between them blends with no hard
        // line. Falls back to cream if ScrollBgSync isn't mounted.
        backgroundColor: "var(--scroll-bg, var(--color-cream))",
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
          borderTopLeftRadius: "calc(var(--u) * 24)",
          borderTopRightRadius: "calc(var(--u) * 24)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={BW_PORTRAIT}
          alt="Joleen Hsu"
          className="size-full object-cover"
        />
      </div>

      {/* Top-centered links — horizontal row sitting above the portrait */}
      <nav
        className="absolute flex flex-row items-center justify-center font-mono text-black whitespace-nowrap"
        style={{
          left: "50%",
          top: "calc(var(--u) * 80)",
          transform: "translateX(-50%)",
          gap: "calc(var(--u) * 80)",
          fontSize: "calc(var(--u) * 18)",
          letterSpacing: "calc(var(--u) * -0.9)",
          lineHeight: 1.1,
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
          className="hover:opacity-60 transition-opacity"
        >
          LINKEDIN
        </a>
      </nav>

      {/* Giant "joleen hsu" wordmark — image-fill text with a subtle
          drifting background to mimic the movement of water */}
      <h2
        className="absolute font-serif text-fill-image animate-water-drift text-center"
        style={{
          left: "50%",
          top: "calc(var(--u) * 390)",
          transform: "translateX(-50%)",
          width: "calc(var(--u) * 2175)",
          fontSize: "calc(var(--u) * 500)",
          letterSpacing: "calc(var(--u) * -10)",
          lineHeight: 1.1,
          margin: 0,
          backgroundImage: `url(${HEADLINE_TEXTURE})`,
          backgroundSize: "117% 291%",
          backgroundRepeat: "no-repeat",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        joleen <span className="italic">hsu</span>
      </h2>
      </div>
    </section>
  );
}
