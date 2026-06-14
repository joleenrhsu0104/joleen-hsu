import { SERVICES } from "../WhatIDoSection";

/**
 * MobileWhatIDoSection — mobile counterpart to WhatIDoSection.
 *
 * Stacked single-column layout. Service name on its own line in
 * serif, helper text below in small sans. Hairlines between each
 * service. No hover preview on mobile — touch doesn't have a hover
 * state, and the layout already gives each row enough breathing
 * room to read on its own.
 *
 * Keeps `id="m-ethos"` so the mobile composition's section anchors
 * stay consistent with the previous MobileEthos.
 */
export default function MobileWhatIDoSection() {
  return (
    <section
      id="m-ethos"
      className="relative bg-[var(--color-near-black)] text-white"
      style={{
        paddingTop: "calc(var(--u-m) * 64)",
        paddingBottom: "calc(var(--u-m) * 64)",
      }}
    >
      {/* WHAT I DO eyebrow */}
      <div
        className="font-mono uppercase"
        style={{
          paddingLeft: "calc(var(--u-m) * 16)",
          fontSize: "calc(var(--u-m) * 14)",
          letterSpacing: "calc(var(--u-m) * 1.4)",
          opacity: 0.75,
          marginBottom: "calc(var(--u-m) * 32)",
        }}
      >
        What I Do
      </div>

      <div
        style={{
          paddingLeft: "calc(var(--u-m) * 16)",
          paddingRight: "calc(var(--u-m) * 16)",
        }}
      >
        {SERVICES.map((service, i) => {
          const isLast = i === SERVICES.length - 1;
          return (
            <div
              key={service.title}
              style={{
                paddingTop: "calc(var(--u-m) * 28)",
                paddingBottom: "calc(var(--u-m) * 28)",
                borderTop: "1px solid rgba(255, 255, 255, 0.18)",
                borderBottom: isLast
                  ? "1px solid rgba(255, 255, 255, 0.18)"
                  : undefined,
              }}
            >
              <h3
                className="font-serif"
                style={{
                  fontSize: "calc(var(--u-m) * 32)",
                  letterSpacing: "calc(var(--u-m) * -0.64)",
                  lineHeight: 1.05,
                  margin: 0,
                  marginBottom: "calc(var(--u-m) * 12)",
                }}
              >
                {service.title}
              </h3>
              <p
                className="font-sans"
                style={{
                  fontSize: "calc(var(--u-m) * 14)",
                  letterSpacing: "calc(var(--u-m) * -0.28)",
                  lineHeight: 1.5,
                  margin: 0,
                  opacity: 0.7,
                }}
              >
                {service.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
