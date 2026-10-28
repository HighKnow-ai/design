/**
 * The site footer: the column layout the apex shipped in da160a77, on the page
 * ground (the footer from the prototype's variant A, not B's band on `--muted`, which reads
 * as a raised slab in dark). An aside on the left (the mark, the company line, the fine print) and
 * titled columns of links on the right. The legal identity line and the counting sentence are the
 * apex's content, passed in the aside.
 */
import type { ReactNode } from "react";
import { cn } from "../lib/utils.js";
import { MARKETING_CONTAINER } from "./layout.js";

export interface SiteFooterProps {
  /** The left block: the mark, the company line, the fine print. */
  readonly aside?: ReactNode;
  /** The `FooterColumn`s. */
  readonly children: ReactNode;
  readonly className?: string | undefined;
}

export function SiteFooter({ aside, children, className }: SiteFooterProps) {
  return (
    <footer data-slot="site-footer" className={cn("border-t border-border", className)}>
      <div
        className={cn(
          MARKETING_CONTAINER,
          "grid gap-12 py-12 text-small text-muted-foreground lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16",
        )}
      >
        {aside !== undefined ? <div className="max-w-[36rem]">{aside}</div> : <div />}
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:auto-cols-max sm:grid-flow-col sm:gap-x-14">
          {children}
        </div>
      </div>
    </footer>
  );
}

export interface FooterColumnProps {
  readonly title: string;
  readonly children: ReactNode;
  readonly className?: string | undefined;
}

/** One titled column of links. */
export function FooterColumn({ title, children, className }: FooterColumnProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <h2 className="text-small font-semibold text-foreground">{title}</h2>
      <div className="mt-3.5 flex flex-col items-start gap-2.5 [&_a:hover]:text-foreground">
        {children}
      </div>
    </div>
  );
}
