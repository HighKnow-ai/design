/**
 * The site header (#616 point 4, #617: the header from the prototype's variant B). Sticky; it
 * condenses on scroll from 64 px to 48 px, the wordmark's name folds away (`data-wordmark-name`)
 * and a border and the card shadow appear.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * THE CONDENSING IS PROGRESSIVE ENHANCEMENT. Rendered on the server, or with JavaScript off, the
 * header is the open one and works fully: every link is a link. The scroll listener only ever
 * adds the condensed look. Under reduced motion the height snaps and only the fades run (the
 * `transition-[…]` rule in `base.css`).
 */
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "../lib/utils.js";
import { MARKETING_CONTAINER, PAGE_GROUND } from "./layout.js";

/** How far the page scrolls before the header condenses. */
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
  /** The home link around the `Wordmark`. */
  readonly brand: ReactNode;
  /** The site's links. */
  readonly nav?: ReactNode;
  /** Right-aligned: the language switcher, Sign in. */
  readonly actions?: ReactNode;
  /** Condense on scroll. On by default. */
  readonly condense?: boolean | undefined;
  /** The navigation landmark's accessible name. */
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
        // The wordmark's name folds away while condensed.
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
            // On a phone the links keep one line each and the row scrolls, rather than a name
            // breaking in two under the header's fixed height.
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
