"use client";

import { CSSProperties, PropsWithChildren } from "react";
import { grid } from "@/app/lib/tokens";

/**
 * Grid + GridItem — CSS-grid-based primitives that implement the
 * design system's 12-column desktop / 4-column mobile grid. Use
 * these for any new page layout that doesn't already exist.
 *
 * Example:
 *
 *   <Grid>
 *     <GridItem cols={8}>Main content</GridItem>
 *     <GridItem cols={4}>Sidebar</GridItem>
 *   </Grid>
 *
 * The Grid handles outer margins and gutters automatically. Mobile
 * collapses to 4 columns with smaller gutters and margins; on
 * mobile, omitting `colsMobile` defaults to a full-width row.
 */

type GridProps = PropsWithChildren<{
  /** Add to override the default outer margins. */
  className?: string;
  style?: CSSProperties;
}>;

export function Grid({ children, className, style }: GridProps) {
  return (
    <div
      className={["w-full", className].filter(Boolean).join(" ")}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${grid.desktop.columns}, 1fr)`,
        columnGap: `calc(var(--u) * ${grid.desktop.gutter})`,
        paddingLeft: `calc(var(--u) * ${grid.desktop.marginX})`,
        paddingRight: `calc(var(--u) * ${grid.desktop.marginX})`,
        ...style,
      }}
    >
      <style>{`
        @media (max-width: 767px) {
          ${"" /* Override the grid for mobile via inline <style>. */}
          [data-grid="responsive"] {
            grid-template-columns: repeat(${grid.mobile.columns}, 1fr) !important;
            column-gap: calc(var(--u-m) * ${grid.mobile.gutter}) !important;
            padding-left: calc(var(--u-m) * ${grid.mobile.marginX}) !important;
            padding-right: calc(var(--u-m) * ${grid.mobile.marginX}) !important;
          }
        }
      `}</style>
      <div data-grid="responsive" style={{ display: "contents" }}>
        {children}
      </div>
    </div>
  );
}

type GridItemProps = PropsWithChildren<{
  /** How many columns to span on desktop (1–12). Default: full width. */
  cols?: number;
  /** Column to start at on desktop (1–12). Default: auto-flow. */
  start?: number;
  /** Columns on mobile (1–4). Default: full width. */
  colsMobile?: number;
  /** Mobile start column (1–4). Default: auto. */
  startMobile?: number;
  className?: string;
  style?: CSSProperties;
}>;

export function GridItem({
  cols = grid.desktop.columns,
  start,
  colsMobile = grid.mobile.columns,
  startMobile,
  className,
  style,
  children,
}: GridItemProps) {
  const desktopColumn = start
    ? `${start} / span ${cols}`
    : `span ${cols} / span ${cols}`;
  const mobileColumn = startMobile
    ? `${startMobile} / span ${colsMobile}`
    : `span ${colsMobile} / span ${colsMobile}`;

  return (
    <div
      className={className}
      style={{
        gridColumn: desktopColumn,
        ...style,
      }}
      data-grid-item-mobile={mobileColumn}
    >
      <style>{`
        @media (max-width: 767px) {
          [data-grid-item-mobile="${mobileColumn}"] {
            grid-column: ${mobileColumn} !important;
          }
        }
      `}</style>
      {children}
    </div>
  );
}
