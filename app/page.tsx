import ReactDOM from "react-dom";
import ResponsiveHome from "@/app/components/ResponsiveHome";
import { HERO_PROJECTS, HERO_SIZES, heroSrcSet } from "@/app/lib/assets";

export default function Home() {
  // Preload the LCP image. CyclingHero (desktop) and MobileHero
  // (mobile) both render HERO_PROJECTS[0].image — /images/hero-wonder.webp
  // — as the first cycling card, and PSI flagged it under both
  // "LCP request discovery" and "Network dependency tree": the
  // browser had to wait for React to mount before discovering the
  // <img src> and starting the fetch.
  //
  // ReactDOM.preload runs during SSR and emits
  //   <link rel="preload" as="image"
  //         imagesrcset="..." imagesizes="..."
  //         fetchpriority="high">
  // directly into the initial HTML response, so the browser begins
  // fetching the hero in parallel with parsing the rest of the page.
  //
  // We pass imageSrcSet + imageSizes (mirroring the <img srcSet sizes>
  // values used at the render sites) so the preload picks the right
  // variant per viewport × DPR — mobile gets the 800w (~180 KB),
  // desktop gets the 1400w or full-res. Without this, the preload
  // would fetch the full file unconditionally, wasting bytes on
  // mobile AND causing the picture-element to re-fetch the smaller
  // variant on top.
  const lcpHero = HERO_PROJECTS[0];
  ReactDOM.preload(lcpHero.image, {
    as: "image",
    fetchPriority: "high",
    imageSrcSet: heroSrcSet(lcpHero),
    imageSizes: HERO_SIZES,
  });

  return <ResponsiveHome />;
}
