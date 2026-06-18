import Image from "next/image";
import { ETHOS_IMAGES } from "@/app/lib/assets";

/**
 * MobileEthos — near-black band on mobile (Figma 547:1033, y=1793..2499).
 * Six 100×100 images scattered, centered Rick Rubin quote.
 */
const MOBILE_ETHOS_IMAGES = [
  { src: ETHOS_IMAGES[0].src, x: 16, y: 98 },    // image 847 (1891 - 1793)
  { src: ETHOS_IMAGES[1].src, x: 140, y: 35 },   // Stocksy (1828 - 1793)
  { src: ETHOS_IMAGES[4].src, x: 276, y: 107 },  // DTS_ISOLA (1900 - 1793)
  { src: ETHOS_IMAGES[2].src, x: 16, y: 485 },   // orange (2278 - 1793)
  { src: ETHOS_IMAGES[3].src, x: 155, y: 531 },  // window (2324 - 1793)
  { src: ETHOS_IMAGES[5].src, x: 294, y: 467 },  // abstract (2260 - 1793)
];

export default function MobileEthos() {
  return (
    <section
      className="relative bg-[var(--color-near-black)] overflow-hidden"
      style={{
        height: "calc(var(--u-m) * 706)",
      }}
    >
      {/* Scattered images */}
      {MOBILE_ETHOS_IMAGES.map((img, i) => (
        <div
          key={i}
          className="absolute animate-bounce-soft"
          style={{
            left: `calc(var(--u-m) * ${img.x})`,
            top: `calc(var(--u-m) * ${img.y})`,
            width: "calc(var(--u-m) * 100)",
            height: "calc(var(--u-m) * 100)",
            borderRadius: "calc(var(--u-m) * 12)",
            overflow: "hidden",
            animationDelay: `${i * 0.6}s`,
            animationDuration: `${5 + (i % 3)}s`,
          }}
        >
          <Image
            fill
            src={img.src}
            alt=""
            aria-hidden="true"
            sizes="26vw"
            style={{ objectFit: "cover" }}
          />
        </div>
      ))}

      {/* Caption + quote (centered) */}
      <div
        className="absolute flex flex-col items-center"
        style={{
          left: "calc(var(--u-m) * 16)",
          top: "calc(var(--u-m) * 246)",
          width: "calc(var(--u-m) * 358)",
          gap: "calc(var(--u-m) * 24)",
        }}
      >
        <p
          className="font-mono text-white text-center"
          style={{
            fontSize: "calc(var(--u-m) * 13)",
            letterSpacing: "calc(var(--u-m) * -0.65)",
            lineHeight: 1.1,
            margin: 0,
            width: "100%",
          }}
        >
          MY LIFE ETHOS, BY WAY OF RICK RUBIN
        </p>
        <blockquote
          className="font-serif text-white text-center"
          style={{
            fontSize: "calc(var(--u-m) * 32)",
            letterSpacing: "calc(var(--u-m) * -0.64)",
            lineHeight: 1.2,
            margin: 0,
            width: "100%",
          }}
        >
          &ldquo;We tend to think of the artist&rsquo;s work as the output, but
          the real work of the artist is a{" "}
          <span className="italic">way of being </span>
          in the world.&rdquo;
        </blockquote>
      </div>
    </section>
  );
}
