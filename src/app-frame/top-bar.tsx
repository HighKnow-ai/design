/**
 * The top bar (#616 point 3): the page's name, its count and its one primary action, from Tenure's
 * `AppShell` header. It stands alone (Flywheel puts it under its andon strip) or inside a
 * `SidebarFrame`, where a product passes the `SidebarTrigger` as `leading`.
 *
 * ONE PRIMARY ACTION. `action` is one slot; a page with more actions than that puts the rest in
 * its body or behind a menu, so the bar never becomes a toolbar.
 *
 * A TITLE STILL ON ITS WAY IS NOT A MISSING ONE. A page whose name is data (a deal thread) has no
 * title until its read answers; `section` (the sidebar group the page sits in) holds the bar's
 * place meanwhile (after the loading rule's 150 ms, below), quietly and never as the `h1`.
 *
 * NOTHING IN THE BAR MOVES WHEN A PAGE'S HEADER ARRIVES OR CHANGES (#639, measured by Tenure's
 * opening check). The row is the height of a button whether or not the page has an action, so the
 * title does not drop 7 px when an action arrives or leaves. The count is keyed by the title: a
 * new page's count is a new element beside a new title, not the old count sliding sideways to sit
 * after a longer or shorter name.
 */
import type { ReactNode } from "react";
import { useDelayedLoading } from "../hooks/use-delayed-loading.js";
import { cn } from "../lib/utils.js";
import { PAGE_WIDTHS, type PageWidth } from "./page-body.js";

export interface TopBarProps {
  /** The page's name, the page's `h1`. Its full value is also its tooltip, for when it truncates. */
  readonly title?: string | undefined;
  /** Shown in the title's place, never as the `h1`, while the page has no title (yet). */
  readonly section?: string | undefined;
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
  section,
  count,
  action,
  leading,
  width = "reading",
  className,
}: TopBarProps) {
  // THE SECTION IS THE TITLE'S SKELETON AND KEEPS THE LOADING RULE (#639): nothing for 150 ms,
  // then the section, held at least 400 ms once shown. Drawn at once, it flashed for as long as a
  // title took to land (170 ms on a meeting's direct load, measured by Tenure's opening check).
  const showSection = useDelayedLoading(title === undefined) && section !== undefined;
  return (
    <header
      data-slot="top-bar"
      className={cn(
        "sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 bg-background px-3 md:px-5",
        className,
      )}
    >
      {leading !== undefined ? <div className="-ml-1 xl:absolute xl:left-4">{leading}</div> : null}
      <div className={cn("mx-auto flex h-9 w-full min-w-0 items-center gap-2", PAGE_WIDTHS[width])}>
        {showSection ? (
          <span className="truncate text-small text-muted-foreground">{section}</span>
        ) : title !== undefined ? (
          <h1 className="truncate text-row font-semibold" title={title}>
            {title}
          </h1>
        ) : null}
        {count !== undefined ? (
          <span
            key={title ?? section}
            className="hidden text-small text-muted-foreground tabular-nums sm:inline"
          >
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
