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
 * The section keeps `id="ethos"` so `<ScrollBgSync>`'s cream→dark
 * transition driver — which interpolates against that element's
 * top edge — continues to work without changes.
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

const PREVIEW_W = 320;
// Matches the 1650×2100 source aspect (0.786) so object-cover has no
// vertical crop — the top of the photo is preserved on every preview.
const PREVIEW_H = 407;

export default function WhatIDoSection() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [previewY, setPreviewY] = useState(0);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleEnter = (i: number) => {
    // Center the preview vertically on the hovered row, measured
    // against the rows-wrapper (the preview's offsetParent).
    const row = rowRefs.current[i];
    if (row) {
      setPreviewY(row.offsetTop + row.offsetHeight / 2);
    }
    setHovered(i);
  };

  return (
    <section
      id="ethos"
      className="relative overflow-hidden text-white"
      style={{
        backgroundColor: "var(--scroll-bg, #030303)",
        paddingTop: "calc(var(--u) * 80)",
        // Extra padding-bottom gives the dark→cream transition room
        // to play out between the last service row and the signature
        // footer below, without crowding either side.
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

      {/* WHAT I DO eyebrow */}
      <div
        className="relative font-mono uppercase"
        style={{
          paddingLeft: "calc(var(--u) * 96)",
          fontSize: "calc(var(--u) * 18)",
          letterSpacing: "calc(var(--u) * 1.8)",
          opacity: 0.75,
          zIndex: 1,
        }}
      >
        What I Do
      </div>

      {/* Service rows */}
      <div
        className="relative"
        style={{
          paddingLeft: "calc(var(--u) * 96)",
          paddingRight: "calc(var(--u) * 96)",
          marginTop: "calc(var(--u) * 32)",
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
                className="font-serif relative z-10"
                style={{
                  fontSize: "calc(var(--u) * 100)",
                  letterSpacing: "calc(var(--u) * -2)",
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
                  width: "calc(var(--u) * 320)",
                  fontSize: "calc(var(--u) * 18)",
                  letterSpacing: "calc(var(--u) * -0.36)",
                  lineHeight: 1.4,
                  margin: 0,
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
            borderRadius: "24px",
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
