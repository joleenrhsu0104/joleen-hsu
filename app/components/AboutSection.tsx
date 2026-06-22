import { JOB_HISTORY } from "@/app/lib/assets";
import ScrollFillText from "./ScrollFillText";

/**
 * AboutSection — 1920×1136 in Figma.
 *
 * Background and text colors are read from the `--scroll-bg` and
 * `--scroll-text` CSS variables that `<ScrollBgSync>` updates on
 * every scroll frame. Fallbacks (`#fff9ec`, `var(--color-ink)`)
 * apply on the first paint and on mobile where the controller
 * isn't mounted, so the section still works in isolation.
 *
 * Since EthosSection reads the SAME variables, both sections
 * always render the same bg color at the boundary — no harsh
 * horizontal line is possible.
 */
export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: "var(--scroll-bg, #fff9ec)",
        color: "var(--scroll-text, var(--color-ink))",
      }}
    >
      <div
        className="relative"
        style={{
          width: "calc(var(--u) * 1920)",
          height: "calc(var(--u) * 1136)",
        }}
      >
        {/* Intro paragraph — scroll-driven color fill: dark ink fills
            in from top to bottom as the paragraph scrolls into the
            reading position. */}
        <ScrollFillText
          className="absolute font-serif"
          style={{
            left: "calc(var(--u) * 96)",
            top: "calc(var(--u) * 168)",
            width: "calc(var(--u) * 917)",
            fontSize: "calc(var(--u) * 68)",
            letterSpacing: "calc(var(--u) * -1.36)",
            lineHeight: 1.1,
          }}
        >
          Joleen is a Staff Product Designer building consumer products in health
          & wellness.
        </ScrollFillText>

        {/* Job history — inherits the scroll-driven text color */}
        <ol
          className="absolute flex flex-col"
          style={{
            left: "calc(var(--u) * 1184)",
            top: "calc(var(--u) * 441)",
            width: "calc(var(--u) * 600)",
            gap: "calc(var(--u) * 48)",
            color: "inherit",
          }}
        >
          {JOB_HISTORY.map((job) => (
            <li
              key={job.company}
              style={{ gap: "calc(var(--u) * 8)" }}
              className="flex flex-col"
            >
              <h3
                className="font-serif"
                style={{
                  fontSize: "calc(var(--u) * 48)",
                  letterSpacing: "calc(var(--u) * -0.96)",
                  lineHeight: 1.1,
                  margin: 0,
                }}
              >
                {job.company}
              </h3>
              <div
                className="flex items-center justify-between font-sans"
                style={{
                  fontSize: "calc(var(--u) * 24)",
                  letterSpacing: "calc(var(--u) * -0.72)",
                  lineHeight: 1.4,
                }}
              >
                <span>{job.role}</span>
                <span>{job.years}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
