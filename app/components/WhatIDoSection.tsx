"use client";

import { useRef, useState } from "react";

/**
 * WhatIDoSection — dark "What I Do" services list.
 *
 * Four service rows (Product Strategy / Brand Identity / App & Web
 * Design / Agentic Development) stacked with hairline dividers; the
 * giant serif service name sits on the left, a short helper line
 * on the right.
 *
 * Hover preview: when the user mouses over a row, a portrait
 * preview (320 × 420) fades in at the section's horizontal center
 * and slides vertically to align with the hovered row. It's at
 * z-index 1 while the h3 and p text in every row sit at z-10, so
 * the image can be its full original size — overflowing the row
 * vertically into adjacent rows' empty space — without ever
 * obscuring any of the typography on top of it.
 *
 * The cream→dark transition driver (<ScrollBgSync>) used to key
 * off this section's `id="ethos"`, but that anchor has moved to
 * HomeWorkSection above (the Work page cards preview that now sits
 * between AboutSentences and WhatIDoSection on the home page).
 * This section just reads --scroll-bg directly so the dark surface
 * continues seamlessly from the HomeWorkSection above.
 */

export interface Service {
  title: string;
  description: string;
  image: string;
}

export const SERVICES: Service[] = [
  {
    title: "Product Strategy",
    description:
      "I joined Wonder as the 2nd designer on the consumer team and helped shape the vision and strategy for the product.",
    image: "/images/ProductStrategy.png",
  },
  {
    title: "Brand Identity",
    description:
      "I've worked closely with founders to craft brand identities and also collaborated with agencies to execute on 3 different rebrands in my career.",
    image: "/images/BrandIdentity.png",
  },
  {
    title: "App & Web Design",
    description:
      "I specialize in the 0 → 1 space, and love to build from a blank slate. I've worked for startups in health & wellness, food-tech, social, and more.",
    image: "/images/AppWebDesign.png",
  },
  {
    title: "Agentic Development",
    description:
      "At Noom, I helped build their art therapy feature through AI, and shipped a few personal projects agentically (including this website!)",
    image: "/images/AgenticDevelopment.png",
  },
];

const PREVIEW_W = 220;
// Matches the 1650×2100 source aspect (0.786) so object-cover has no
// vertical crop — the top of the photo is preserved on every preview.
const PREVIEW_H = 280;

export default function WhatIDoSection() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [previewY, setPreviewY] = useState(0);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleEnter = (i: number) => {
    // Center the preview vertically on the hovered row, measured
    // against the rows-wrapper (the preview's offsetParent).
    // Clamp so the preview never extends above the rows-wrapper top
    // (or below its bottom) — otherwise the top-most row's hover
    // clipped the preview's upper edge, and the bottom-most row
    // would clip its lower edge.
    const row = rowRefs.current[i];
    const wrapper = row?.offsetParent as HTMLElement | null;
    if (row) {
      const rawY = row.offsetTop + row.offsetHeight / 2;
      const wrapperH = wrapper?.offsetHeight ?? Infinity;
      const halfPreview = PREVIEW_H / 2;
      const clampedY = Math.min(
        Math.max(rawY, halfPreview),
        wrapperH - halfPreview,
      );
      setPreviewY(clampedY);
    }
    setHovered(i);
  };

  return (
    <section
      className="relative overflow-hidden text-white"
      style={{
        // Hardcoded near-black — no longer tracks --scroll-bg.
        // The dark→cream gradient that previously transitioned this
        // section into the footer was removed at the user's request,
        // so the boundary between this dark section and the cream
        // SignatureSection below is now an intentional hard cut.
        backgroundColor: "var(--color-near-black)",
        paddingTop: "calc(var(--u) * 80)",
        paddingBottom: "calc(var(--u) * 200)",
      }}
    >
      {/* Ambient blurred background — fades in the hovered service's
          image as a full-section atmospheric layer. Mirrors the
          CyclingHero pattern but pushed further: more zoom, more
          blur, lower opacity — so the image reads as mood rather
          than content. A soft dark overlay sits on top to keep
          white typography legible across any palette.

          A vertical mask gradient feathers the top and bottom edges
          of this whole layer so the image bleeds into the page bg
          smoothly instead of stopping at a hard horizontal line at
          the section boundaries.

          Top + bottom fade extended from 14% → 30% so the blurred
          ambient image fades in/out gradually across nearly a third
          of the section, instead of resolving in the first 14%.
          Makes the cream → dark handoff feel like a continuous
          gradient rather than a banded transition. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{
          zIndex: 0,
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)",
        }}
      >
        {SERVICES.map((service, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`bg-${service.title}`}
            src={service.image}
            alt=""
            className="absolute inset-0 size-full object-cover"
            style={{
              opacity: hovered === i ? 0.6 : 0,
              transform: "scale(1.5)",
              filter: "blur(48px) saturate(1.15)",
              transition: "opacity 0.5s ease",
            }}
          />
        ))}
        {/* Dark wash only when a service is hovered. When idle, this
            stays invisible so the section bg matches the shared
            --scroll-bg with Rubin above — no brightness mismatch at
            the boundary. */}
        <div
          className="absolute inset-0 bg-black/25"
          style={{
            opacity: hovered !== null ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        />
      </div>

      {/* Service rows */}
      <div
        className="relative"
        style={{
          paddingLeft: "calc(var(--u) * 96)",
          paddingRight: "calc(var(--u) * 96)",
          zIndex: 1,
        }}
      >
        {SERVICES.map((service, i) => {
          const isDimmed = hovered !== null && hovered !== i;
          const isLast = i === SERVICES.length - 1;
          return (
            <div
              key={service.title}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
              onMouseEnter={() => handleEnter(i)}
              onMouseLeave={() => setHovered(null)}
              className="relative flex items-center justify-between"
              style={{
                paddingTop: "calc(var(--u) * 48)",
                paddingBottom: "calc(var(--u) * 48)",
                borderTop: "1px solid rgba(255, 255, 255, 0.18)",
                borderBottom: isLast
                  ? "1px solid rgba(255, 255, 255, 0.18)"
                  : undefined,
              }}
            >
              <h3
                className="font-serif relative z-10 whitespace-nowrap"
                style={{
                  // Cap tightened further (60 → 52px) and calc
                  // multiplier lowered (100 → 86) so the widest
                  // title ("Agentic Development") fits in the h3
                  // column reserved by `justify-between` (~258px
                  // at an 825px viewport) without pushing the
                  // body p past the row's right edge. Prevents the
                  // Agentic Development row's body copy from
                  // misaligning with the other three rows.
                  fontSize:
                    "min(52px, max(14px, calc(var(--u) * 86)))",
                  letterSpacing: "calc(var(--u) * -1.72)",
                  lineHeight: 1.02,
                  margin: 0,
                  opacity: isDimmed ? 0.3 : 1,
                  transition: "opacity 0.4s ease",
                }}
              >
                {service.title}
              </h3>
              <p
                className="font-sans relative z-10"
                style={{
                  // Widened + floored to 460px so the longest
                  // ~150-char description wraps into up to 3 lines
                  // on any viewport. On wider screens the calc
                  // term wins so width scales proportionally.
                  width: "max(460px, calc(var(--u) * 380))",
                  // Font capped at 18px so the description doesn't
                  // balloon on wide viewports where the uncapped
                  // 18u would push it to 22px+.
                  fontSize: "min(18px, max(14px, calc(var(--u) * 18)))",
                  letterSpacing: "calc(var(--u) * -0.36)",
                  lineHeight: 1.4,
                  // Individual margins so marginLeft (the 24px+ gap
                  // from the h3 title) isn't clobbered by a
                  // shorthand `margin: 0`. Floor bumped from 16 →
                  // 24px per the design spec.
                  marginTop: 0,
                  marginRight: 0,
                  marginBottom: 0,
                  marginLeft: "max(24px, calc(var(--u) * 32))",
                  opacity: isDimmed ? 0.35 : 0.85,
                  transition: "opacity 0.4s ease",
                  flexShrink: 0,
                }}
              >
                {service.description}
              </p>
            </div>
          );
        })}

        {/* Preview image — absolutely positioned within the rows
            wrapper. Slides vertically to align with the hovered row.
            All four images are mounted so cross-fades feel instant. */}
        <div
          aria-hidden="true"
          className="absolute pointer-events-none overflow-hidden"
          style={{
            top: `${previewY}px`,
            left: "50%",
            transform: `translate(-50%, -50%) scale(${
              hovered !== null ? 1 : 0.94
            })`,
            width: `${PREVIEW_W}px`,
            height: `${PREVIEW_H}px`,
            borderRadius: "4px",
            opacity: hovered !== null ? 1 : 0,
            transition:
              "opacity 0.35s ease, transform 0.5s cubic-bezier(0.2, 0.7, 0.2, 1), top 0.45s cubic-bezier(0.2, 0.7, 0.2, 1)",
            zIndex: 1,
          }}
        >
          {SERVICES.map((service, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`preview-${service.title}`}
              src={service.image}
              alt=""
              className="absolute inset-0 size-full object-cover"
              style={{
                opacity: hovered === i ? 1 : 0,
                transition: "opacity 0.3s ease",
                objectPosition: "top center",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
