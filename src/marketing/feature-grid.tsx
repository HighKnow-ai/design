import type { ReactNode } from "react";
import { cn } from "../lib/utils.js";

export interface FeatureGridItem {
  readonly title: string;
  readonly body: ReactNode;
  readonly icon?: ReactNode;
}

export interface FeatureGridProps {
  readonly items: readonly FeatureGridItem[];
  readonly columns?: 2 | 3 | undefined;
  readonly headingLevel?: 2 | 3 | 4 | undefined;
  readonly className?: string | undefined;
}

export function FeatureGrid({ items, columns = 3, headingLevel = 3, className }: FeatureGridProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <ul
      data-slot="feature-grid"
      className={cn(
        "m-0 grid list-none gap-x-8 gap-y-10 p-0 sm:grid-cols-2",
        columns === 3 && "lg:grid-cols-3",
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.title} className="min-w-0 border-t border-border pt-5">
          <Heading className="m-0 flex items-center gap-2 text-row font-semibold text-foreground [&_svg]:size-[18px] [&_svg]:shrink-0 [&_svg]:text-running">
            {item.icon}
            {item.title}
          </Heading>
          <p className="m-0 mt-2 text-body leading-prose text-muted-foreground">{item.body}</p>
        </li>
      ))}
    </ul>
  );
}
