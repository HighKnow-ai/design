import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

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

export type TypeStep = (typeof TYPE_STEPS)[number];

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [...TYPE_STEPS],
      leading: ["prose"],
    },
    conflictingClassGroups: {
      "font-size": ["leading"],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
