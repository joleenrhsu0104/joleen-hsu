"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

/**
 * ScrollFillText — renders text whose fill color "fills in" from top
 * to bottom as the user scrolls the element through the viewport.
 *
 * Implementation: the text element is given `color: transparent` and a
 * vertical linear-gradient as its background, clipped to the text
 * shape via `background-clip: text`. The gradient's stop position
 * `fillPct` is driven by scroll progress measured against the
 * element's viewport position, so as the user scrolls the dark
 * `toColor` band grows downward across the text and the lighter
 * `fromColor` retreats.
 *
 * The transition window starts when the element is ~70% down the
 * viewport and completes when it reaches ~25% down — feels like a
 * natural reading-pace reveal as the line enters the comfort zone.
 */

interface ScrollFillTextProps {
  children: ReactNode;
  /** Color the text starts at (faded). */
  fromColor?: string;
  /** Color the text ends at (filled). */
  toColor?: string;
  className?: string;
  style?: CSSProperties;
  /** Element to render. Defaults to `p`. */
  as?: "p" | "h1" | "h2" | "h3" | "span" | "div";
}

function smoothstep(t: number) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

export default function ScrollFillText({
  children,
  fromColor = "rgba(35, 31, 32, 0.18)",
  toColor = "rgb(35, 31, 32)",
  className,
  style,
  as = "p",
}: ScrollFillTextProps) {
  const ref = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Fill begins when element top is 70% down the viewport, completes
      // when top is 25% down (i.e., comfortably in reading position).
      const start = vh * 0.7;
      const end = vh * 0.25;
      const raw = (start - rect.top) / (start - end);
      setProgress(Math.max(0, Math.min(1, raw)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, []);

  const eased = smoothstep(progress);
  const fillPct = eased * 100;
  // Soft 8% blend band so the fill edge isn't a hard line.
  const edge = Math.min(100, fillPct + 8);

  const fillStyle: CSSProperties = {
    ...style,
    backgroundImage: `linear-gradient(to bottom, ${toColor} 0%, ${toColor} ${fillPct}%, ${fromColor} ${edge}%, ${fromColor} 100%)`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "transparent",
  };

  // Render as the requested element. `ref` is typed loosely because
  // each tag has its own HTMLElement subtype — the runtime is fine.
  const Tag = as as "p";
  return (
    <Tag
      ref={ref as React.RefObject<HTMLParagraphElement>}
      className={className}
      style={fillStyle}
    >
      {children}
    </Tag>
  );
}
