"use client";

import { useIsMobile } from "@/app/hooks/useIsMobile";
import CyclingHero from "./CyclingHero";
import AboutSentences from "./AboutSentences";
import WhatIDoSection from "./WhatIDoSection";
import SignatureSection from "./SignatureSection";
import ScrollBgSync from "./ScrollBgSync";
import MobileHero from "./mobile/MobileHero";
import MobileAboutSentences from "./mobile/MobileAboutSentences";
import MobileWhatIDoSection from "./mobile/MobileWhatIDoSection";
import MobileSignature from "./mobile/MobileSignature";

/**
 * ResponsiveHome — switches between desktop and mobile compositions
 * based on viewport width. The breakpoint is 768px (Tailwind `md`).
 *
 * Page flow (both surfaces):
 *   Hero → AboutSentences (3 cream panels, char-by-char scroll fill)
 *        → EthosSection (dark, floating images, dramatic reveal)
 *        → SignatureSection
 *
 * The cream → dark transition before EthosSection is still driven by
 * <ScrollBgSync>, which interpolates the `--scroll-bg` CSS var that
 * EthosSection's background reads.
 */
export default function ResponsiveHome() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <main>
        <MobileHero />
        <MobileAboutSentences />
        <MobileWhatIDoSection />
        <MobileSignature />
      </main>
    );
  }

  return (
    <main className="bg-[var(--color-cream)]">
      <ScrollBgSync />
      <CyclingHero />
      <AboutSentences />
      <WhatIDoSection />
      <SignatureSection />
    </main>
  );
}
