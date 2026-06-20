import ReactDOM from "react-dom";
import ResponsiveHome from "@/app/components/ResponsiveHome";

export default function Home() {
  // Preload the LCP image. CyclingHero (desktop) and MobileHero
  // (mobile) both render HERO_PROJECTS[0].image — /images/hero-wonder.webp
  // — as the first cycling card, and PSI flagged it under both
  // "LCP request discovery" and "Network dependency tree": the
  // browser had to wait for React to mount before discovering the
  // <img src> and starting the fetch.
  //
  // ReactDOM.preload runs during SSR and emits
  //   <link rel="preload" as="image" href="..." fetchpriority="high">
  // directly into the initial HTML response, so the browser begins
  // fetching the hero in parallel with parsing the rest of the page.
  // Expected impact: ~1–3s LCP improvement on mobile (was 16.1s on
  // Slow 4G) and pushes desktop LCP under the 2.5s green threshold
  // (was 2.7s).
  ReactDOM.preload("/images/hero-wonder.webp", {
    as: "image",
    fetchPriority: "high",
  });

  return <ResponsiveHome />;
}
