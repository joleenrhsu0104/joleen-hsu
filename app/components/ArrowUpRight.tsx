/**
 * ArrowUpRight — small inline "external link" arrow rendered next to
 * navigation labels (e.g. "LINKEDIN ↗") to signal that the link
 * leaves the site.
 *
 * Uses currentColor for stroke so it inherits the parent's text
 * color automatically across light/dark backgrounds. Stroke width
 * is 1.25 (vs 1.5–2 most icon libraries default to) so it reads as
 * a thin pen stroke that matches the editorial typography rather
 * than a heavy ui-icon.
 *
 * Size defaults to 0.7em so the arrow scales with whatever font
 * size the surrounding label uses, without needing to be re-tuned
 * per call site.
 */
export default function ArrowUpRight({
  size = "0.85em",
  className,
  strokeWidth = 1,
}: {
  size?: string | number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      // viewBox includes 1u of padding around the arrow's bounding
      // box so the 1.25u stroke (drawn centered on the path, so
      // 0.625u extends past each path coordinate) doesn't get
      // clipped at the top + right edges where the arrowhead lives.
      viewBox="3 3 10 10"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      style={{ display: "inline-block", verticalAlign: "baseline" }}
    >
      {/* Diagonal shaft, bottom-left → top-right */}
      <line x1="4" y1="12" x2="12" y2="4" />
      {/* Arrowhead — two strokes forming a corner at the top-right */}
      <polyline points="6,4 12,4 12,10" />
    </svg>
  );
}
