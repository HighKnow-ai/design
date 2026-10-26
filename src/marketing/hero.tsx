/**
 * The hero (#616 point 4, #617: the hero and index from the prototype's variant B). A left-aligned
 * headline on the fluid display ramp, its second sentence in italic ("AI will not slow down.
 * *You can keep up.*"), then a hard rule, then the intro on the `lead` step and prose leading
 * beside an index. There is no image: the headline is the picture.
 *
 * `HeroIndex` is the index: a short list of steps, each a scope and a name, linked. The apex uses
 * it for the path (In the room → Tenure, On the roadmap → Flywheel, In production → The practice),
 * the company's argument rather than a product menu; its label is the apex's ("The path").
 */
import type { ReactNode } from "react";
import { cn } from "../lib/utils.js";
import { MARKETING_CONTAINER } from "./layout.js";

export interface HeroProps {
  readonly headline: ReactNode;
  /** The headline's second sentence, set in italic on its own line. */
  readonly headlineAccent?: ReactNode;
  readonly intro?: ReactNode;
  /** Beside the intro: a `HeroIndex`. */
  readonly index?: ReactNode;
  /** Under the intro: the page's calls to action. */
  readonly actions?: ReactNode;
  readonly className?: string | undefined;
}

export function Hero({ headline, headlineAccent, intro, index, actions, className }: HeroProps) {
  const hasBody = intro !== undefined || index !== undefined || actions !== undefined;
  return (
    <section
      data-slot="hero"
      className={cn(MARKETING_CONTAINER, "pt-16 pb-20 sm:pt-24 lg:pt-32 lg:pb-28", className)}
    >
      <h1 className="max-w-[14ch] font-heading text-display-1 text-balance text-foreground">
        {headline}
        {headlineAccent !== undefined ? (
          <>
            {" "}
            <span className="block font-medium text-muted-foreground italic">{headlineAccent}</span>
          </>
        ) : null}
      </h1>
      {hasBody ? (
        <div className="mt-14 grid gap-12 border-t border-foreground pt-8 lg:mt-20 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col items-start gap-8 lg:col-span-6">
            {intro !== undefined ? (
              <p className="m-0 text-lead leading-prose text-foreground">{intro}</p>
            ) : null}
            {actions !== undefined ? (
              <div className="flex flex-wrap items-center gap-3">{actions}</div>
            ) : null}
          </div>
          {index !== undefined ? <div className="lg:col-span-5 lg:col-start-8">{index}</div> : null}
        </div>
      ) : null}
    </section>
  );
}

export interface HeroIndexItem {
  /** Where the step happens: "In the room". */
  readonly scope: string;
  /** What it is: "Tenure". */
  readonly name: string;
  readonly href: string;
}

export interface HeroIndexProps {
  /** The index's accessible name: "The path". */
  readonly label: string;
  readonly items: readonly HeroIndexItem[];
  readonly className?: string | undefined;
}

function Arrow() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0 text-muted-foreground transition-[transform,color] duration-(--duration-feedback) group-hover:translate-x-0.5 group-hover:text-running"
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

export function HeroIndex({ label, items, className }: HeroIndexProps) {
  return (
    <nav aria-label={label} data-slot="hero-index" className={className}>
      <ul className="m-0 list-none p-0">
        {items.map((item) => (
          <li key={item.href} className="border-b border-border first:border-t lg:first:border-t-0">
            <a
              href={item.href}
              className="group flex items-baseline justify-between gap-6 py-4 transition-colors duration-(--duration-feedback) hover:text-running"
            >
              <span className="text-small text-muted-foreground">{item.scope}</span>
              <span className="inline-flex items-center gap-2 text-row font-semibold">
                {item.name}
                <Arrow />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
