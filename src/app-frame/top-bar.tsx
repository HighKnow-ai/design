import type { ReactNode } from "react";
import { useDelayedLoading } from "../hooks/use-delayed-loading.js";
import { cn } from "../lib/utils.js";
import { PAGE_WIDTHS, type PageWidth } from "./page-body.js";

export interface TopBarProps {
  readonly title?: string | undefined;
  /** Shown in the title's place, never as the `h1`, while the page has no title (yet). */
  readonly section?: string | undefined;
  readonly count?: string | undefined;
  readonly action?: ReactNode;
  readonly leading?: ReactNode;
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
  const showSection = useDelayedLoading(title === undefined && section !== undefined);
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
