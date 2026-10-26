/**
 * The top bar (#616 point 3): the page's name, its count and its one primary action, from Tenure's
 * `AppShell` header. It stands alone (Flywheel puts it under its andon strip) or inside a
 * `SidebarFrame`, where a product passes the `SidebarTrigger` as `leading`.
 *
 * ONE PRIMARY ACTION. `action` is one slot; a page with more actions than that puts the rest in
 * its body or behind a menu, so the bar never becomes a toolbar.
 */
import type { ReactNode } from "react";
import { cn } from "../lib/utils.js";
import { PAGE_WIDTHS, type PageWidth } from "./page-body.js";

export interface TopBarProps {
  /** The page's name, the page's `h1`. */
  readonly title?: string | undefined;
  /** A tabular count beside the title ("12 meetings"). Absent while not known. */
  readonly count?: string | undefined;
  /** The page's one primary action, right-aligned. */
  readonly action?: ReactNode;
  /** Before the title, outside the measure: the sidebar's trigger. */
  readonly leading?: ReactNode;
  /** The measure the bar's contents align to: the page body's. */
  readonly width?: PageWidth | undefined;
  readonly className?: string | undefined;
}

export function TopBar({
  title,
  count,
  action,
  leading,
  width = "reading",
  className,
}: TopBarProps) {
  return (
    <header
      data-slot="top-bar"
      className={cn(
        "sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 bg-background px-3 md:px-5",
        className,
      )}
    >
      {leading !== undefined ? <div className="-ml-1 xl:absolute xl:left-4">{leading}</div> : null}
      <div className={cn("mx-auto flex w-full min-w-0 items-center gap-2", PAGE_WIDTHS[width])}>
        {title !== undefined ? <h1 className="truncate text-row font-semibold">{title}</h1> : null}
        {count !== undefined ? (
          <span className="hidden text-small text-muted-foreground tabular-nums sm:inline">
            {count}
          </span>
        ) : null}
        {action !== undefined ? (
          <div className="ml-auto flex items-center gap-2">{action}</div>
        ) : null}
      </div>
    </header>
  );
}
