import { Children, type ReactNode } from "react";

/**
 * MobileHorizontalPin — despite the historical name, this now
 * renders its children as a 2-column grid (2 phone mocks per
 * row) so long case-study phone sequences stay compact instead
 * of stretching down the page as a giant single column.
 *
 * History:
 *   v1 — sticky-pinned scroll-jack with a 100vh stage.
 *   v2 — native horizontal swipe + scroll-snap.
 *   v3 — sticky-pin sized to the row's natural height.
 *   v4 — vertical stack (single column). Fixed the "hidden behind
 *        a swipe" discoverability problem, but ballooned page
 *        height for sections with 4+ phones.
 *   v5 (current) — 2-column grid. Phones self-size to their grid
 *        cells (~½ viewport wide minus paddings/gap) so each pair
 *        reads as one row and the total page length halves. Odd
 *        children flow into the next row with the last cell empty.
 *        Grid cells auto-shrink narrow children (like the small
 *        Neuday screens) via `place-items: center`.
 *
 * Props preserved so every existing case study (Wonder, Blue Apron,
 * Noom, Neuday) works unchanged.
 */
export default function MobileHorizontalPin({
  children,
  gap = "calc(var(--u-m) * 16)",
  paddingX = "calc(var(--u-m) * 16)",
  paddingY = "calc(var(--u-m) * 24)",
  columns = 2,
}: {
  children: ReactNode;
  /** Grid gap between items (CSS length). Defaults to 16u-m. */
  gap?: string;
  /** Side padding around the grid (CSS length). Defaults to 16u-m. */
  paddingX?: string;
  /** Top/bottom padding around the grid (CSS length). Defaults to 24u-m. */
  paddingY?: string;
  /** Number of columns in the grid. Defaults to 2. Pass 1 for
   *  sections where the mocks read better stacked full-width. */
  columns?: 1 | 2;
}) {
  // A single child (regardless of `columns` setting) renders
  // centered — no point in reserving an empty second column.
  const count = Children.count(children);
  const singleColumn = columns === 1 || count <= 1;
  return (
    <div
      className={
        singleColumn ? "flex flex-col items-center" : "grid place-items-center"
      }
      style={{
        gap,
        paddingLeft: paddingX,
        paddingRight: paddingX,
        paddingTop: paddingY,
        paddingBottom: paddingY,
        ...(singleColumn
          ? {}
          : { gridTemplateColumns: "1fr 1fr" }),
      }}
    >
      {Children.map(children, (child) => (
        <div className="w-full flex justify-center">{child}</div>
      ))}
    </div>
  );
}
