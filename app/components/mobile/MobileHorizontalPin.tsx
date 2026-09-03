import { type ReactNode } from "react";

/**
 * MobileHorizontalPin — despite the historical name, this now
 * renders its children as a simple vertical stack.
 *
 * History:
 *   v1 — sticky-pinned scroll-jack with a 100vh stage.
 *   v2 — native horizontal swipe + scroll-snap.
 *   v3 — sticky-pin sized to the row's natural height (compact
 *        stage) so vertical scroll advanced the row horizontally
 *        without dead air.
 *   v4 (current) — vertical stack. Horizontal scroll on mobile
 *        was hiding case-study phone mocks behind an interaction
 *        (users didn't discover the swipe), so every child is now
 *        rendered in one visible column instead. Kept the
 *        MobileHorizontalPin name + props so every existing case
 *        study (Wonder, Blue Apron, Noom, Neuday) works unchanged.
 *
 * Props are preserved for backwards compatibility with existing
 * call sites; `gap` still controls the space between items,
 * `paddingX` still controls the side padding of the column, and
 * `paddingY` still controls the top/bottom padding around the
 * whole stack.
 */
export default function MobileHorizontalPin({
  children,
  gap = "calc(var(--u-m) * 24)",
  paddingX = "calc(var(--u-m) * 16)",
  paddingY = "calc(var(--u-m) * 24)",
}: {
  children: ReactNode;
  /** Vertical gap between items (CSS length). Defaults to 24u-m. */
  gap?: string;
  /** Side padding around the stack (CSS length). Defaults to 16u-m. */
  paddingX?: string;
  /** Top/bottom padding around the stack (CSS length). Defaults to 24u-m. */
  paddingY?: string;
}) {
  return (
    <div
      className="flex flex-col items-center"
      style={{
        gap,
        paddingLeft: paddingX,
        paddingRight: paddingX,
        paddingTop: paddingY,
        paddingBottom: paddingY,
      }}
    >
      {children}
    </div>
  );
}
