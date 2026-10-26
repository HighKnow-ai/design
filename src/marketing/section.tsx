/**
 * The section band (#616 point 4): one band of a marketing page, at the page's container width.
 * `tone="page"` paints the page's own colour; `"muted"` is the tinted band, on `--muted` (#615
 * point 3: the apex's hand-picked `#f6f7fa` retires into it).
 */
import type { ComponentProps } from "react";
import { cn } from "../lib/utils.js";
import { MARKETING_CONTAINER } from "./layout.js";

export type SectionProps = ComponentProps<"section"> & {
  readonly tone?: "page" | "muted" | undefined;
  /** Classes for the inner container, which holds the content at the page's width. */
  readonly containerClassName?: string | undefined;
};

export function Section({
  tone = "page",
  className,
  containerClassName,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      data-slot="section"
      data-tone={tone}
      className={cn("py-16 lg:py-24", tone === "muted" && "bg-muted", className)}
      {...props}
    >
      <div className={cn(MARKETING_CONTAINER, containerClassName)}>{children}</div>
    </section>
  );
}
