import { ETHOS_IMAGES } from "@/app/lib/assets";

/**
 * EthosSection — 1920×1096 with a centered Rick Rubin quote and
 * six 300×300 floating images.
 *
 * Background reads from the shared `--scroll-bg` CSS variable
 * (set by `<ScrollBgSync>`). Fallback is the section's resting
 * color (`#030303`). Because AboutSection reads the SAME variable,
 * the boundary between the two sections always has matching color
 * — no horizontal cutoff.
 *
 * A `60vh` padding buffer at the top pushes the Rick Rubin content
 * down so it only enters the viewport AFTER the bg has fully
 * transitioned to near-black. The light caption + quote always
 * land on solid dark bg.
 */
export default function EthosSection() {
  return (
    <section
      id="ethos"
      className="relative overflow-hidden"
      style={{
        backgroundColor: "var(--scroll-bg, #030303)",
        // Just enough buffer above the content for the (short) fade
        // to land on near-black before the Rick Rubin caption appears.
        paddingTop: "45vh",
      }}
    >
      {/* Inner stage with the original 1920×1096 design canvas,
          centered horizontally and laid out below the buffer. */}
      <div className="relative flex items-center justify-center w-full">
        <div
          className="relative"
          style={{
            width: "calc(var(--u) * 1920)",
            height: "calc(var(--u) * 1096)",
          }}
        >
          {/* Scattered images */}
          {ETHOS_IMAGES.map((img, i) => (
            <div
              key={i}
              className="absolute animate-bounce-soft"
              style={{
                left: `calc(var(--u) * ${img.x})`,
                top: `calc(var(--u) * ${img.y})`,
                width: "calc(var(--u) * 300)",
                height: "calc(var(--u) * 300)",
                borderRadius: "calc(var(--u) * 16)",
                overflow: "hidden",
                boxShadow:
                  "0 calc(var(--u) * 2) calc(var(--u) * 4) 0 rgba(0,0,0,0.04)",
                animationDelay: `${i * 0.6}s`,
                animationDuration: `${5 + (i % 3)}s`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt=""
                aria-hidden="true"
                className="size-full object-cover"
              />
            </div>
          ))}

          {/* Caption + quote (centered) */}
          <div
            className="absolute flex flex-col items-center"
            style={{
              left: "calc(var(--u) * 455)",
              top: "calc(var(--u) * 344)",
              width: "calc(var(--u) * 971)",
              gap: "calc(var(--u) * 32)",
            }}
          >
            <p
              className="font-mono text-white text-center"
              style={{
                fontSize: "calc(var(--u) * 18)",
                letterSpacing: "calc(var(--u) * -0.9)",
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
                fontSize: "calc(var(--u) * 68)",
                letterSpacing: "calc(var(--u) * -1.36)",
                lineHeight: 1.1,
                margin: 0,
                width: "100%",
              }}
            >
              &ldquo;We tend to think of the artist&rsquo;s work as the
              output, but the real work of the artist is a{" "}
              <span className="italic">way of being </span>
              in the world.&rdquo;
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
