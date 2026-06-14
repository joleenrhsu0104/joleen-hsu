"use client";

import {
  cloneElement,
  Fragment,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";

/**
 * ScrollCharFill — character-by-character left → right fill driven by
 * scroll position.
 *
 * As the element enters the reading zone of the viewport, each
 * character's color interpolates from `fromColor` (faded) to
 * `toColor` (filled). A soft window of N characters at the leading
 * edge feathers the transition so it reads as ink running across
 * the line instead of a hard wipe.
 *
 * Implementation:
 *   • Wrap each char in `<span data-cf>…</span>` once per `children`
 *     reference (memoized).
 *   • After commit, query the wrapper for those marked spans and
 *     cache them in a ref array — avoids the timing fragility of
 *     per-span ref callbacks.
 *   • On scroll, mutate each span's `.style.color` directly. No
 *     React state, no re-render per frame.
 *
 * Inline ReactNodes (e.g., italic <span>s without data-cf) are
 * preserved because annotateChars recurses through children. Those
 * inner wrappers are skipped by the selector, so only character
 * spans are colored.
 *
 * Timing defaults are tuned for a centered text inside a 100vh
 * panel: the fill begins once the line has risen into comfortable
 * reading position (startAt 0.7 = text top at 70% down viewport)
 * and completes as the line moves into the upper-middle of the
 * viewport (endAt 0.25 = text top at 25% down viewport). The text
 * appears faded as it enters from the bottom, then ink starts
 * running across only after the reader has visibly arrived.
 */

interface ScrollCharFillProps {
  children: ReactNode;
  fromColor?: string;
  toColor?: string;
  className?: string;
  style?: CSSProperties;
  as?: "p" | "h1" | "h2" | "h3" | "blockquote" | "div";
  /** Viewport ratio where fill begins (top of element at this position). */
  startAt?: number;
  /** Viewport ratio where fill completes. */
  endAt?: number;
  /** Width (in chars) of the soft leading-edge gradient. Lower = sharper boundary. */
  feather?: number;
  /**
   * Controlled fill progress (0–1). When provided, scroll-driven
   * progress is bypassed and this value drives the fill instead.
   * Useful when an outer controller (e.g., a scroll-locked panel)
   * wants to run a time-based animation through the same character
   * coloring machinery.
   */
  progress?: number;
}

/* ---------- color helpers ---------- */

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function parseColor(c: string) {
  const m = c.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/,
  );
  if (!m) return { r: 0, g: 0, b: 0, a: 1 };
  return {
    r: +m[1],
    g: +m[2],
    b: +m[3],
    a: m[4] !== undefined ? +m[4] : 1,
  };
}

function blend(from: string, to: string, t: number) {
  const f = parseColor(from);
  const tt = parseColor(to);
  return `rgba(${Math.round(lerp(f.r, tt.r, t))}, ${Math.round(
    lerp(f.g, tt.g, t),
  )}, ${Math.round(lerp(f.b, tt.b, t))}, ${lerp(f.a, tt.a, t).toFixed(3)})`;
}

function smoothstep(t: number) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

/* ---------- character wrapping ---------- */

function annotateChars(node: ReactNode, ctx: { index: number }): ReactNode {
  if (node == null || typeof node === "boolean") return node;
  if (typeof node === "number") return annotateChars(String(node), ctx);
  if (typeof node === "string") {
    return Array.from(node).map((ch) => {
      const i = ctx.index++;
      return (
        <span key={i} data-cf="">
          {ch}
        </span>
      );
    });
  }
  if (Array.isArray(node)) {
    return node.map((c, idx) => (
      <Fragment key={`f-${idx}`}>{annotateChars(c, ctx)}</Fragment>
    ));
  }
  if (isValidElement(node)) {
    const el = node as ReactElement<{ children?: ReactNode }>;
    return cloneElement(
      el,
      undefined,
      annotateChars(el.props.children, ctx),
    );
  }
  return node;
}

/* ---------- SSR-safe layout effect ---------- */

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* ---------- component ---------- */

export default function ScrollCharFill({
  children,
  fromColor = "rgba(35, 31, 32, 0.22)",
  toColor = "rgb(35, 31, 32)",
  className,
  style,
  as = "p",
  startAt = 0.7,
  endAt = 0.25,
  feather = 4,
  progress,
}: ScrollCharFillProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const spansRef = useRef<HTMLSpanElement[]>([]);
  const isControlled = progress !== undefined;

  const { content, total } = useMemo(() => {
    const ctx = { index: 0 };
    const tree = annotateChars(children, ctx);
    return { content: tree, total: ctx.index };
  }, [children]);

  // After every render, re-query the container for character spans
  // so spansRef.current always reflects the current DOM. Runs
  // synchronously before paint so the first scroll handler can use
  // the array without a race.
  useIsoLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    spansRef.current = Array.from(
      el.querySelectorAll<HTMLSpanElement>("span[data-cf]"),
    );
  }, [content]);

  // Shared color-application helper used by both modes.
  const applyProgress = (p: number) => {
    const reach = p * (total + feather);
    const spans = spansRef.current;
    for (let i = 0; i < spans.length; i++) {
      const sp = spans[i];
      if (!sp) continue;
      const t = Math.max(0, Math.min(1, (reach - i) / feather));
      sp.style.color = blend(fromColor, toColor, t);
    }
  };

  // Scroll-driven mode — only active when `progress` prop is NOT set.
  useEffect(() => {
    if (isControlled) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const startPx = vh * startAt;
      const endPx = vh * endAt;
      const raw = (startPx - rect.top) / (startPx - endPx);
      const p = smoothstep(Math.max(0, Math.min(1, raw)));
      applyProgress(p);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromColor, toColor, total, startAt, endAt, feather, isControlled]);

  // Controlled mode — fill driven by the `progress` prop.
  useIsoLayoutEffect(() => {
    if (!isControlled) return;
    applyProgress(progress as number);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, fromColor, toColor, total, feather, isControlled, content]);

  const Tag = as as "p";
  return (
    <Tag
      ref={containerRef as React.RefObject<HTMLParagraphElement>}
      className={className}
      style={{ ...style, color: fromColor }}
    >
      {content}
    </Tag>
  );
}
