/**
 * The page body (#616 point 3): the page's measure and its vertical rhythm, from Tenure's
 * `AppShell` body. `reading` is the products' 920 px column, `wide` a table or a board, `full` the
 * window. `surface="card"` draws the whole body on one white card (a page that predates cards of
 * its own); `"floor"` leaves the page to draw its own cards on the grey floor.
 */
import type { ReactNode } from "react";
import { cn } from "../lib/utils.js";

/** The measures a page body's content, and the top bar's above it, align to. */
export const PAGE_WIDTHS = {
  reading: "max-w-[920px]",
  wide: "max-w-[1160px]",
  full: "max-w-none",
} as const;

export type PageWidth = keyof typeof PAGE_WIDTHS;

export interface PageBodyProps {
  readonly width?: PageWidth | undefined;
  readonly surface?: "floor" | "card" | undefined;
  readonly className?: string | undefined;
  readonly children: ReactNode;
}

export function PageBody({
  width = "reading",
  surface = "floor",
  className,
  children,
}: PageBodyProps) {
  return (
    <div
      data-slot="page-body"
      data-width={width}
      data-surface={surface}
      className={cn("w-full min-w-0 px-3 pt-1 pb-10 md:px-5", className)}
    >
      {/* The measure is on the inner column, inside the gutter, so the body's content and the top
          bar's (`TopBar`, same `width`) share one edge. */}
      <div className={cn("mx-auto flex w-full min-w-0 flex-col gap-4", PAGE_WIDTHS[width])}>
        {surface === "card" ? (
          <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-card">
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
