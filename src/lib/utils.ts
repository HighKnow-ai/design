import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * The base's type steps (`css/theme.css` `--text-*`), in scale order. tailwind-merge has to be
 * told them: without it `text-body` reads as a text COLOUR, and a merge silently drops the real
 * colour beside it (`text-primary-foreground`).
 */
export const TYPE_STEPS = [
  "meta",
  "small",
  "body",
  "row",
  "section",
  "lead",
  "title",
  "milestone",
  "count",
  "lead-count",
  "display-1",
  "display-2",
  "display-3",
] as const;

/** A step of the base's type scale, as `text-<step>` names it. */
export type TypeStep = (typeof TYPE_STEPS)[number];

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [...TYPE_STEPS],
      leading: ["prose"],
    },
  },
});

/** Merge class names, a later Tailwind utility overriding an earlier one (shadcn/ui). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
