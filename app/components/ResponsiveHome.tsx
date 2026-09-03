"use client";

import { useIsMobile } from "@/app/hooks/useIsMobile";
import OpeningSequence from "./OpeningSequence";
import AboutSentences from "./AboutSentences";
import HomeWorkSection from "./HomeWorkSection";
import WhatIDoSection from "./WhatIDoSection";
import SignatureSection from "./SignatureSection";
import MobileOpeningSequence from "./mobile/MobileOpeningSequence";
import MobileAboutSentences from "./mobile/MobileAboutSentences";
import MobileHomeWorkSection from "./mobile/MobileHomeWorkSection";
import MobileWhatIDoSection from "./mobile/MobileWhatIDoSection";
import MobileSignature from "./mobile/MobileSignature";

/**
 * ResponsiveHome — switches between desktop and mobile compositions
 * based on viewport width (breakpoint inside useIsMobile).
 *
 * Both surfaces share the same composition:
 *   1. OpeningSequence      — landing hero (wordmark, nav, bio,
 *                             drifting rectangles with cursor
 *                             repulsion on desktop)
 *   2. AboutSentences       — scroll-jack: "I believe…" → Rubin
 *                             quote, character fill on both
 *   3. HomeWorkSection      — Work cards stack
 *   4. WhatIDoSection       — services list on near-black
 *   5. SignatureSection     — cream signature footer
 *
 * Section backgrounds are hardcoded (no --scroll-bg dependency),
 * so ScrollBgSync is not mounted here.
 */
export default function ResponsiveHome() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <main>
        <MobileOpeningSequence />
        <MobileAboutSentences />
        <MobileHomeWorkSection />
        <MobileWhatIDoSection />
        <MobileSignature />
      </main>
    );
  }

  return (
    <main className="bg-[var(--color-cream)]">
      <OpeningSequence />
      <AboutSentences />
      <HomeWorkSection />
      <WhatIDoSection />
      <SignatureSection />
    </main>
  );
}
