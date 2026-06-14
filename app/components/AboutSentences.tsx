import type { ReactNode } from "react";
import ScrollCharFill from "./ScrollCharFill";

/**
 * AboutSentences — three editorial sentences, each on its own
 * full-viewport panel that fills in character by character as the
 * user scrolls.
 *
 * Background: cream throughout. Because all three panels share the
 * same color, they read as one continuous quiet scroll — three
 * statements separated by scroll distance, not by hue. The Rubin
 * panel reads var(--scroll-bg) instead so it fades along with the
 * dark WhatIDoSection that follows (no hard horizontal boundary).
 */

const FROM = "rgba(35, 31, 32, 0.3)";
const TO = "rgb(35, 31, 32)";

export default function AboutSentences() {
  return (
    <>
      <SentencePanel id="about">
        I&rsquo;m Joleen, a Staff Product Designer building mission-driven
        consumer experiences.
      </SentencePanel>

      <SentencePanel id="about-belief">
        I believe the best design is built off of deep curiosity and empathy.
      </SentencePanel>

      <RubinPanel />
    </>
  );
}

function SentencePanel({
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
      <div
        style={{
          width: "calc(var(--u) * 1100)",
          paddingLeft: "calc(var(--u) * 32)",
          paddingRight: "calc(var(--u) * 32)",
        }}
      >
        <ScrollCharFill
          as="p"
          fromColor={FROM}
          toColor={TO}
          className="font-serif text-center"
          style={{
            fontSize: "calc(var(--u) * 68)",
            letterSpacing: "calc(var(--u) * -1.36)",
            lineHeight: 1.15,
            margin: 0,
          }}
        >
          {children}
        </ScrollCharFill>
      </div>
    </section>
  );
}

function RubinPanel() {
  return (
    <section
      id="about-ethos"
      className="relative flex items-center justify-center overflow-hidden"
      style={{
        minHeight: "100vh",
        // Reads the same scroll-driven bg as WhatIDoSection below so
        // the cream→dark transition blends without a hard line.
        backgroundColor: "var(--scroll-bg, var(--color-cream))",
      }}
    >
      <div
        className="flex flex-col items-center"
        style={{
          width: "calc(var(--u) * 1100)",
          gap: "calc(var(--u) * 36)",
          paddingLeft: "calc(var(--u) * 32)",
          paddingRight: "calc(var(--u) * 32)",
        }}
      >
        <ScrollCharFill
          as="blockquote"
          fromColor={FROM}
          toColor={TO}
          className="font-serif text-center"
          style={{
            fontSize: "calc(var(--u) * 68)",
            letterSpacing: "calc(var(--u) * -1.36)",
            lineHeight: 1.15,
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
            fontSize: "calc(var(--u) * 18)",
            letterSpacing: "calc(var(--u) * -0.36)",
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
