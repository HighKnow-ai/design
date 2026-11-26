import type { ComponentProps } from "react";
import { cn } from "../lib/utils.js";
import { MARKETING_CONTAINER } from "./layout.js";

export type SectionProps = ComponentProps<"section"> & {
  readonly tone?: "page" | "muted" | undefined;
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
