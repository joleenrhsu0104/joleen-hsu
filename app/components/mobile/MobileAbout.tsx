import { JOB_HISTORY } from "@/app/lib/assets";

/**
 * MobileAbout — cream band on mobile (Figma 547:1033, y=885..1793).
 * Layout: bio paragraph at top, job history stacked below.
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
          fontSize: "calc(var(--u-m) * 32)",
          letterSpacing: "calc(var(--u-m) * -0.64)",
          lineHeight: 1.1,
          color: "var(--color-ink)",
        }}
      >
        Joleen is a Staff Product Designer building consumer products in
        health & wellness.
      </p>

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
                // Closing-tier sub-heading: 24u-m + -2% tracking.
                fontSize: "calc(var(--u-m) * 24)",
                letterSpacing: "calc(var(--u-m) * -0.48)",
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              {job.company}
            </h3>
            <div
              className="flex items-baseline justify-between font-sans"
              style={{
                fontSize: "calc(var(--u-m) * 14)",
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
