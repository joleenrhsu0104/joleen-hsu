"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { ETHOS_IMAGES } from "@/app/lib/assets";
import MobileTopNav from "./mobile/MobileTopNav";
import ArrowUpRight from "./ArrowUpRight";

/**
 * ContactPage
 *
 * Single-screen page styled like the Rick Rubin ethos section:
 *   • Near-black background
 *   • Six 300×300 floating images scattered around the center, each
 *     with the same gentle bounce animation as the ethos grid
 *   • Centered email (large serif) + tagline
 *
 * Card interaction:
 *   • Desktop — each card flips on hover to reveal a personal caption
 *     (3D rotateY) so the captions feel like a Polaroid being turned over.
 *   • Mobile — there's no hover, so each card is tappable: tap once to
 *     flip and reveal the caption, tap again to flip back.
 *
 * The email hover still dims the whole card grid via a global state,
 * so the email reading experience stays clean.
 */

// Near-black surface — same token used by Ethos + WorkPage so all
// dark-surface pages stay in lock-step.
const BG = "var(--color-near-black)";
const EMAIL = "hi@joleen.design";
// Caption back-face overlay — 70% black sits on top of the same image so
// the photo still reads through behind the Instrument Sans caption.
const CARD_BACK_OVERLAY = "rgba(0, 0, 0, 0.7)";

export default function ContactPage() {
  const isMobile = useIsMobile();
  return isMobile ? <ContactMobile /> : <ContactDesktop />;
}

function ContactTopNav({ variant }: { variant: "desktop" | "mobile" }) {
  const isMobile = variant === "mobile";
  const u = isMobile ? "var(--u-m)" : "var(--u)";

  return (
    <nav
      className="absolute flex items-center justify-between text-white"
      style={{
        left: `calc(${u} * ${isMobile ? 16 : 70})`,
        right: `calc(${u} * ${isMobile ? 16 : 70})`,
        top: `calc(${u} * ${isMobile ? 68 : 57})`,
        height: `calc(${u} * ${isMobile ? 38 : 47})`,
        zIndex: 20,
      }}
    >
      <Link
        href="/"
        aria-label="Home"
        className="flex items-center h-full font-serif text-white whitespace-nowrap"
        style={{
          fontSize: `calc(${u} * ${isMobile ? 28 : 40})`,
          lineHeight: 1,
          letterSpacing: `calc(${u} * -0.5)`,
        }}
      >
        joleen
      </Link>
      <div
        className="flex items-center h-full font-mono"
        style={{
          gap: `calc(${u} * ${isMobile ? 24 : 39})`,
          fontSize: `calc(${u} * ${isMobile ? 14 : 20})`,
          letterSpacing: `calc(${u} * -1)`,
          lineHeight: 1,
        }}
      >
        <Link href="/work" className="hover:opacity-70 transition-opacity">
          WORK
        </Link>
        <span className="flex items-center gap-[0.4em]">
          <span
            className="rounded-full bg-current shrink-0"
            style={{
              width: `calc(${u} * 4)`,
              height: `calc(${u} * 4)`,
            }}
          />
          <span aria-current="page">CONTACT</span>
        </span>
        <a
          href="https://www.linkedin.com/in/joleenhsu/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-baseline gap-[4px] hover:opacity-70 transition-opacity"
        >
          LINKEDIN
          <ArrowUpRight />
        </a>
      </div>
    </nav>
  );
}

/* ───────────────────────────────────────────────────────────────
   FLIP CARD — shared between desktop & mobile
   ─────────────────────────────────────────────────────────────── */

type FlipCardProps = {
  src: string;
  caption: string;
  /**
   * Render unit token (var(--u) on desktop, var(--u-m) on mobile)
   * so caption type scales identically to the surrounding canvas.
   */
  u: string;
  /** Tile size in render units (e.g. 300 desktop, 100 mobile). */
  size: number;
  /** Corner radius in render units (e.g. 16 desktop, 12 mobile). */
  radius: number;
  /** Caption font size in render units. */
  captionSize: number;
  /** Inner caption padding in render units. */
  captionPadding: number;
  /** Whether this card should reveal its caption. */
  flipped: boolean;
  /**
   * Reveal style:
   *   • `flip` — 3D rotateY (used on mobile so the tap feels like
   *     a Polaroid being turned over).
   *   • `fade` — straight opacity cross-fade between image and
   *     caption overlay (used on desktop hover — instant and quiet).
   */
  mode: "flip" | "fade";
  /** Mouse handlers (desktop hover). */
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  /** Click/tap handler (mobile toggle). */
  onClick?: () => void;
  /**
   * Whether the card should respond to taps (button vs decorative).
   * Mobile gets `true`, desktop gets `false` (hover-driven).
   */
  interactive: boolean;
  /** Optional inline style applied to the OUTER positioned container. */
  style?: React.CSSProperties;
};

function FlipCard({
  src,
  caption,
  u,
  size,
  radius,
  captionSize,
  captionPadding,
  flipped,
  mode,
  onMouseEnter,
  onMouseLeave,
  onClick,
  interactive,
  style,
}: FlipCardProps) {
  const sizeCss = `calc(${u} * ${size})`;
  const radiusCss = `calc(${u} * ${radius})`;

  // `flip` mode needs a perspective on the OUTER box so the 3D rotation
  // has depth; `fade` mode is purely 2D opacity so no perspective is
  // required (and using one would needlessly promote a 3D layer).
  return (
    <div
      style={{
        width: sizeCss,
        height: sizeCss,
        ...(mode === "flip"
          ? { perspective: `calc(${u} * 1200)` }
          : null),
        ...style,
      }}
    >
      {interactive ? (
        <button
          type="button"
          onClick={onClick}
          aria-pressed={flipped}
          aria-label={flipped ? "Hide caption" : "Show caption"}
          className="block size-full p-0 bg-transparent border-0 cursor-pointer"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <CardFaces
            src={src}
            caption={caption}
            flipped={flipped}
            mode={mode}
            radiusCss={radiusCss}
            captionSize={captionSize}
            captionPadding={captionPadding}
            u={u}
          />
        </button>
      ) : (
        <div
          className="size-full"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <CardFaces
            src={src}
            caption={caption}
            flipped={flipped}
            mode={mode}
            radiusCss={radiusCss}
            captionSize={captionSize}
            captionPadding={captionPadding}
            u={u}
          />
        </div>
      )}
    </div>
  );
}

function CardFaces({
  src,
  caption,
  flipped,
  mode,
  radiusCss,
  captionSize,
  captionPadding,
  u,
}: {
  src: string;
  caption: string;
  flipped: boolean;
  mode: "flip" | "fade";
  radiusCss: string;
  captionSize: number;
  captionPadding: number;
  u: string;
}) {
  // Image face — always rendered. In flip mode it sits behind a
  // backface-hidden second layer; in fade mode the caption layer just
  // fades over it.
  const frontFace = (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        borderRadius: radiusCss,
        ...(mode === "flip"
          ? { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }
          : null),
      }}
    >
      <Image
        fill
        src={src}
        alt=""
        aria-hidden="true"
        sizes="(max-width: 768px) 40vw, 18vw"
        style={{ objectFit: "cover" }}
      />
    </div>
  );

  // Caption face — same image with a 70% black wash + caption text on top.
  const backFace = (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        borderRadius: radiusCss,
        ...(mode === "flip"
          ? {
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }
          : {
              // Fade mode — caption layer cross-fades over the image.
              opacity: flipped ? 1 : 0,
              transition: "opacity 250ms ease-out",
              pointerEvents: flipped ? "auto" : "none",
            }),
      }}
    >
      <Image
        fill
        src={src}
        alt=""
        aria-hidden="true"
        sizes="(max-width: 768px) 40vw, 18vw"
        style={{ objectFit: "cover" }}
      />
      <div
        className="absolute inset-0"
        style={{ backgroundColor: CARD_BACK_OVERLAY }}
      />
      <div
        className="relative flex items-center justify-center text-center text-white size-full"
        style={{ padding: `calc(${u} * ${captionPadding})` }}
      >
        <p
          className="font-sans"
          style={{
            fontSize: `calc(${u} * ${captionSize})`,
            lineHeight: 1.35,
            letterSpacing: `calc(${u} * -0.3)`,
            margin: 0,
          }}
        >
          {caption}
        </p>
      </div>
    </div>
  );

  if (mode === "fade") {
    // No 3D, no transform — just two stacked layers with opacity cross-fade.
    return (
      <div className="relative size-full">
        {frontFace}
        {backFace}
      </div>
    );
  }

  // FLIP — 3D rotateY on the inner container.
  return (
    <div
      className="relative size-full"
      style={{
        transformStyle: "preserve-3d",
        transition: "transform 600ms cubic-bezier(0.4, 0, 0.2, 1)",
        transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        willChange: "transform",
      }}
    >
      {frontFace}
      {backFace}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
   DESKTOP
   ─────────────────────────────────────────────────────────────── */

function ContactDesktop() {
  // Email hover dims the whole grid; card hover flips that specific card.
  const [emailHovered, setEmailHovered] = useState(false);
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);

  return (
    <main
      className="relative overflow-hidden text-white"
      style={{
        backgroundColor: BG,
        minHeight: "100vh",
        height: "100vh",
      }}
    >
      <ContactTopNav variant="desktop" />

      {/* Stage — 1920×1096 design canvas, centered in viewport. The
          --u override is scoped HERE (not on main) so the header above
          continues to use the default --u and matches the header size
          on every other page. Without this scope, the contact-page
          header would shrink along with the canvas on wide-but-short
          viewports. */}
      <div className="relative flex items-center justify-center h-full">
        <div
          className="relative"
          style={
            {
              // Scope --u to the smaller of width-based and height-based
              // scaling so the 1920×1096 design canvas always fits
              // inside the available viewport area, regardless of
              // aspect ratio. 1096 buffer reserves space below the
              // header for the canvas to live in.
              ["--u" as string]:
                "min(calc(100vw / 1920), calc(100vh / 1096))",
              width: "calc(var(--u) * 1920)",
              height: "calc(var(--u) * 1096)",
            } as React.CSSProperties
          }
        >
          {/* Scattered cards — each flips on hover to reveal its caption. */}
          {ETHOS_IMAGES.map((img, i) => {
            const isFlipped = flippedIndex === i;
            return (
              <div
                key={i}
                className="absolute animate-bounce-soft"
                style={{
                  left: `calc(var(--u) * ${img.x})`,
                  top: `calc(var(--u) * ${img.y})`,
                  // Dim other cards while the email is hovered, but
                  // skip the dimming on the actively-flipped card so
                  // its caption stays legible.
                  filter:
                    emailHovered && !isFlipped ? "blur(14px)" : "blur(0px)",
                  opacity: emailHovered && !isFlipped ? 0.45 : 1,
                  transition:
                    "filter 450ms ease-out, opacity 450ms ease-out",
                  animationDelay: `${i * 0.6}s`,
                  animationDuration: `${5 + (i % 3)}s`,
                  willChange: "filter, opacity",
                }}
              >
                <FlipCard
                  src={img.src}
                  caption={img.caption}
                  u="var(--u)"
                  size={340}
                  radius={18}
                  captionSize={20}
                  captionPadding={30}
                  flipped={isFlipped}
                  mode="fade"
                  interactive={false}
                  onMouseEnter={() => setFlippedIndex(i)}
                  onMouseLeave={() => setFlippedIndex(null)}
                />
              </div>
            );
          })}

          {/* Centered email + tagline, sitting above the images */}
          <div
            className="absolute flex flex-col items-center text-center"
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              gap: "calc(var(--u) * 24)",
              zIndex: 10,
            }}
          >
            <a
              href={`mailto:${EMAIL}`}
              onMouseEnter={() => setEmailHovered(true)}
              onMouseLeave={() => setEmailHovered(false)}
              className="font-serif text-white whitespace-nowrap"
              style={{
                fontSize: "calc(var(--u) * 140)",
                letterSpacing: "calc(var(--u) * -3)",
                lineHeight: 1.1,
                textDecorationLine: emailHovered ? "underline" : "none",
                textDecorationColor: "currentColor",
                textUnderlineOffset: "calc(var(--u) * 16)",
                textDecorationThickness: "calc(var(--u) * 3)",
                transition: "text-decoration-color 300ms ease-out",
              }}
            >
              {EMAIL}
            </a>
            <p
              className="font-sans text-white"
              style={{
                fontSize: "calc(var(--u) * 24)",
                letterSpacing: "calc(var(--u) * -0.72)",
                lineHeight: 1.4,
                margin: 0,
                opacity: 0.85,
              }}
            >
              Available for select fractional work.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ───────────────────────────────────────────────────────────────
   MOBILE
   ─────────────────────────────────────────────────────────────── */

function ContactMobile() {
  // Tap toggles per-card flip state. Multiple cards can be flipped at
  // once so the user can leave a caption up while exploring another.
  const [flippedIds, setFlippedIds] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setFlippedIds((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  // Card size in design units.
  const CARD_SIZE = 150;

  // Scattered positions — NOT in rows. Each card has a unique (anchor,
  // y) pair so no two cards share a column OR a row. The anchor is
  // either { leftPct } (left edge at this % of viewport) or { rightPct }
  // (right edge at this % from the viewport's right). Mixing anchors
  // lets the right-side cards stay flush with the viewport's right
  // edge even when --u-m gets height-constrained on wide viewports
  // and the cards shrink (the issue with pure leftPct positioning was
  // that smaller cards stayed clustered on the left). y is in design
  // units and scales with --u-m alongside the card size.
  //
  // ETHOS_IMAGES indexes:
  //   0 dinnerparties · 1 doublerainbow · 2 dolomites
  //   3 casagilardi   · 4 reading       · 5 tennis
  const cards: Array<{
    srcIndex: number;
    leftPct?: number;
    rightPct?: number;
    y: number;
  }> = [
    // Cards ring around the email + tagline at the center, like a
    // clock face: 12 / 10 / 2 / 4 / 8 / 6 o'clock positions. Each
    // clock-face y is offset by a different amount so adjacent cards
    // never share a height — the "ring" reads as a soft ellipse with
    // varied heights rather than a perfect symmetric circle. The
    // wide 2→4 / 10→8 gaps form the horizontal center band where
    // the email + tagline live.
    // Top trio shifted down 45u and bottom trio shifted up 25u so
    // the inner ring of cards sits closer to the email + tagline at
    // center, while leaving ~20u-m of clearance around the email
    // zone (no overlap with the text). Tennis (6 o'clock) stays at
    // its anchor position so the bottom of the layout doesn't pull
    // up alongside the others.
    { srcIndex: 0, leftPct: 45, y: 65 },   // dinnerparties — 1 o'clock (top, mid-right)
    { srcIndex: 1, leftPct: 0, y: 175 },   // doublerainbow — 10 o'clock (top, far-left)
    { srcIndex: 3, rightPct: 0, y: 235 },  // casagilardi — 2 o'clock (top, flush-right) — bottom edge 385 ≈ 20u above email top
    { srcIndex: 2, rightPct: 0, y: 505 },  // dolomites — 4 o'clock (bottom, flush-right) — top edge 505 ≈ 20u below email bottom
    { srcIndex: 4, leftPct: 0, y: 545 },   // reading — 8 o'clock (bottom, far-left)
    { srcIndex: 5, leftPct: 32, y: 720 },  // tennis — 6 o'clock (bottom, mid) — unchanged anchor
  ];

  return (
    <main
      className="relative overflow-hidden text-white"
      style={{
        backgroundColor: BG,
        minHeight: "100vh",
      }}
    >
      <MobileTopNav mode="overlay" navClassName="text-white" />

      {/* The --u-m override scopes to THIS wrapper (not main) so the
          MobileTopNav above uses the default --u-m and matches the
          header size on every other mobile page. Without this scope,
          a height-constrained --u-m on the parent shrinks the header
          along with the card stage on wide-but-short viewports. */}
      <div
        className="relative flex items-center justify-center"
        style={
          {
            minHeight: "100vh",
            // 890u-m vertical budget covers tennis (6 o'clock at
            // y=720) + 150u-m card height + 20u-m bottom buffer. The
            // ring layout stretches farther vertically than the
            // earlier scatter because the 12/6 o'clock cards sit at
            // the extremes.
            ["--u-m" as string]:
              "min(calc(100vw / 390), calc(100vh / 890))",
          } as React.CSSProperties
        }
      >
        {/* Scattered cards — each absolutely positioned at its own
            (anchor, y) so no two share a row OR a column. Right-side
            cards use right:Xpct so they stay flush with the viewport
            right edge even when --u-m shrinks the card size. */}
        <div className="absolute inset-0">
          {cards.map(({ srcIndex, leftPct, rightPct, y }, cardIndex) => {
            const img = ETHOS_IMAGES[srcIndex];
            const isFlipped = flippedIds.has(cardIndex);
            return (
              <div
                key={cardIndex}
                className="absolute animate-bounce-soft"
                style={{
                  ...(leftPct !== undefined
                    ? { left: `${leftPct}%` }
                    : { right: `${rightPct}%` }),
                  top: `calc(var(--u-m) * ${y})`,
                  animationDelay: `${cardIndex * 0.6}s`,
                  animationDuration: `${5 + (cardIndex % 3)}s`,
                }}
              >
                <FlipCard
                  src={img.src}
                  caption={img.caption}
                  u="var(--u-m)"
                  size={CARD_SIZE}
                  radius={14}
                  captionSize={11}
                  captionPadding={12}
                  flipped={isFlipped}
                  mode="flip"
                  interactive
                  onClick={() => toggle(cardIndex)}
                />
              </div>
            );
          })}
        </div>

        {/* Centered email + tagline */}
        <div
          className="relative flex flex-col items-center text-center"
          style={{
            gap: "calc(var(--u-m) * 16)",
            paddingLeft: "calc(var(--u-m) * 16)",
            paddingRight: "calc(var(--u-m) * 16)",
            zIndex: 10,
          }}
        >
          <a
            href={`mailto:${EMAIL}`}
            className="font-serif text-white underline-offset-4"
            style={{
              fontSize: "calc(var(--u-m) * 60)",
              letterSpacing: "calc(var(--u-m) * -1.2)",
              lineHeight: 1.1,
            }}
          >
            {EMAIL}
          </a>
          <p
            className="font-sans text-white"
            style={{
              fontSize: "calc(var(--u-m) * 18)",
              letterSpacing: "calc(var(--u-m) * -0.54)",
              lineHeight: 1.4,
              margin: 0,
              opacity: 0.85,
            }}
          >
            Available for select fractional work.
          </p>
        </div>
      </div>
    </main>
  );
}
