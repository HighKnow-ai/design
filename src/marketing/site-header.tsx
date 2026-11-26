import { useEffect, useState, type ReactNode } from "react";
import { cn } from "../lib/utils.js";
import { MARKETING_CONTAINER, PAGE_GROUND } from "./layout.js";

const CONDENSE_AT_PX = 24;

function useCondensed(enabled: boolean): boolean {
  const [condensed, setCondensed] = useState(false);
  useEffect(() => {
    if (!enabled) return undefined;
    const update = () => setCondensed(window.scrollY > CONDENSE_AT_PX);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [enabled]);
  return enabled && condensed;
}

export interface SiteHeaderProps {
  readonly brand: ReactNode;
  readonly nav?: ReactNode;
  readonly actions?: ReactNode;
  readonly condense?: boolean | undefined;
  readonly navLabel?: string | undefined;
  readonly className?: string | undefined;
}

export function SiteHeader({
  brand,
  nav,
  actions,
  condense = true,
  navLabel = "Main",
  className,
}: SiteHeaderProps) {
  const condensed = useCondensed(condense);
  return (
    <header
      data-slot="site-header"
      data-condensed={condensed ? "true" : "false"}
      className={cn(
        "sticky top-0 z-30 border-b transition-[height,box-shadow,border-color,background-color] duration-(--duration-overlay) ease-(--ease)",
        PAGE_GROUND,
        condensed ? "h-12 border-border shadow-card" : "h-16 border-transparent",
        "[&_[data-wordmark-name]]:inline-block [&_[data-wordmark-name]]:max-w-48 [&_[data-wordmark-name]]:overflow-hidden [&_[data-wordmark-name]]:whitespace-nowrap [&_[data-wordmark-name]]:transition-[opacity,max-width] [&_[data-wordmark-name]]:duration-(--duration-state)",
        condensed && "[&_[data-wordmark-name]]:max-w-0 [&_[data-wordmark-name]]:opacity-0",
        className,
      )}
    >
      <div className={cn(MARKETING_CONTAINER, "flex h-full items-center gap-4 sm:gap-8")}>
        <div className="flex shrink-0 items-center">{brand}</div>
        {nav !== undefined ? (
          <nav
            aria-label={navLabel}
            className="no-scrollbar flex min-w-0 items-center gap-3.5 overflow-x-auto text-body whitespace-nowrap text-muted-foreground sm:gap-6 [&_a]:transition-colors [&_a]:duration-(--duration-feedback) [&_a:hover]:text-foreground"
          >
            {nav}
          </nav>
        ) : null}
        {actions !== undefined ? (
          <div className="ml-auto flex items-center gap-4">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}
