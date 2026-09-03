import { FLOWER_IMAGE, JOB_HISTORY } from "@/app/lib/assets";

/**
 * MobileAbout — cream band on mobile (Figma 547:1033, y=885..1793).
 * Layout: bio paragraph at top, flower image partially off-screen
 * on the left, job history stacked below.
 */
export default function MobileAbout() {
  return (
    <section
      className="relative bg-[var(--color-cream)] overflow-hidden"
      style={{
        height: "calc(var(--u-m) * 908)",
      }}
    >
      {/* Bio paragraph */}
      <p
        className="absolute font-serif"
        style={{
          left: "calc(var(--u-m) * 16)",
          top: "calc(var(--u-m) * 53)",
          width: "calc(var(--u-m) * 358)",
          fontSize: "max(12px, calc(var(--u-m) * 28))",
          letterSpacing: "calc(var(--u-m) * -0.56)",
          lineHeight: 1.15,
          color: "var(--color-ink)",
        }}
      >
        Joleen is a Staff Product Designer building consumer products in
        health & wellness.
      </p>

      {/* Flower — radial-mask soft fade, partial off-screen left */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: "calc(var(--u-m) * -17)",
          top: "calc(var(--u-m) * 181)",
          width: "calc(var(--u-m) * 204)",
          height: "calc(var(--u-m) * 233)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 60% at 50% 45%, black 25%, transparent 90%)",
          maskImage:
            "radial-gradient(ellipse 60% 60% at 50% 45%, black 25%, transparent 90%)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={FLOWER_IMAGE}
          alt=""
          aria-hidden="true"
          className="size-full object-cover"
        />
      </div>

      {/* Job history */}
      <ol
        className="absolute flex flex-col"
        style={{
          left: "calc(var(--u-m) * 16)",
          top: "calc(var(--u-m) * 494)",
          width: "calc(var(--u-m) * 358)",
          gap: "calc(var(--u-m) * 24)",
          color: "var(--color-ink)",
        }}
      >
        {JOB_HISTORY.map((job) => (
          <li
            key={job.company}
            className="flex flex-col"
            style={{ gap: "calc(var(--u-m) * 8)" }}
          >
            <h3
              className="font-serif"
              style={{
                fontSize: "max(12px, calc(var(--u-m) * 26))",
                letterSpacing: "calc(var(--u-m) * -0.52)",
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              {job.company}
            </h3>
            <div
              className="flex items-baseline justify-between font-sans"
              style={{
                fontSize: "max(12px, calc(var(--u-m) * 14))",
                letterSpacing: "calc(var(--u-m) * -0.42)",
                lineHeight: 1.3,
                gap: "calc(var(--u-m) * 12)",
              }}
            >
              <span className="flex-1">{job.role}</span>
              <span className="whitespace-nowrap">{job.years}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
