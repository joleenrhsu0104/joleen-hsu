import type { ReactNode } from "react";
import ScrollCharFill from "../ScrollCharFill";

/**
 * MobileAboutSentences — mobile counterpart to AboutSentences.
 * Three cream panels with dark scroll-driven char fill.
 */

const FROM = "rgba(35, 31, 32, 0.3)";
const TO = "rgb(35, 31, 32)";

export default function MobileAboutSentences() {
  return (
    <>
      <MobileSentencePanel id="m-about-intro">
        I&rsquo;m Joleen, a Staff Product Designer building mission-driven
        consumer experiences.
      </MobileSentencePanel>

      <MobileSentencePanel id="m-about-belief">
        I believe the best design is built off of deep curiosity and empathy.
      </MobileSentencePanel>

      <MobileRubinPanel />
    </>
  );
}

function MobileSentencePanel({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="relative flex items-center justify-center bg-[var(--color-cream)]"
      style={{ minHeight: "100vh" }}
    >
      <div style={{ width: "calc(var(--u-m) * 358)" }}>
        <ScrollCharFill
          as="p"
          fromColor={FROM}
          toColor={TO}
          className="font-serif text-center"
          style={{
            fontSize: "calc(var(--u-m) * 32)",
            letterSpacing: "calc(var(--u-m) * -0.64)",
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          {children}
        </ScrollCharFill>
      </div>
    </section>
  );
}

function MobileRubinPanel() {
  return (
    <section
      id="m-ethos"
      className="relative flex items-center justify-center overflow-hidden bg-[var(--color-cream)]"
      style={{ minHeight: "100vh" }}
    >
      <div
        className="flex flex-col items-center"
        style={{
          width: "calc(var(--u-m) * 358)",
          gap: "calc(var(--u-m) * 24)",
        }}
      >
        <ScrollCharFill
          as="blockquote"
          fromColor={FROM}
          toColor={TO}
          className="font-serif text-center"
          style={{
            fontSize: "calc(var(--u-m) * 32)",
            letterSpacing: "calc(var(--u-m) * -0.64)",
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          {"“We tend to think of the artist’s work as the output, but the real work of the artist is a "}
          <span className="italic">way of being</span>
          {" in the world.”"}
        </ScrollCharFill>
        <ScrollCharFill
          as="p"
          fromColor={FROM}
          toColor={TO}
          className="font-sans text-center"
          style={{
            fontSize: "calc(var(--u-m) * 13)",
            letterSpacing: "calc(var(--u-m) * -0.26)",
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          My life ethos, by way of Rick Rubin
        </ScrollCharFill>
      </div>
    </section>
  );
}
