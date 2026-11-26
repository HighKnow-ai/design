import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils.js";
import { Slot } from "radix-ui";

const BADGE_BASE =
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-transparent px-2.5 text-[13px] leading-none font-semibold whitespace-nowrap transition-colors duration-(--duration-state) ease-(--ease) has-data-[icon=inline-start]:pl-2 has-data-[icon=inline-end]:pr-2 [&>svg]:pointer-events-none [&>svg]:size-[15px]";

export const BADGE_TONES = {
  default: "bg-primary text-primary-foreground [a]:hover:bg-primary/90",
  running: "bg-running-muted text-running",
  destructive: "bg-destructive font-bold text-destructive-foreground",
  neutral: "border-border bg-secondary text-secondary-foreground",
  secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-accent",
  outline: "border-border text-foreground [a]:hover:bg-accent",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-running underline-offset-4 hover:underline",
} as const;

export type BadgeTone = keyof typeof BADGE_TONES;

export type BadgeProps<Tone extends string = BadgeTone> = React.ComponentProps<"span"> & {
  readonly variant?: Tone | null | undefined;
  readonly asChild?: boolean | undefined;
};

export function createBadge<const Extra extends Record<string, string> = Record<never, string>>(
  extraTones?: Extra,
) {
  const variants = cva(BADGE_BASE, {
    variants: {
      variant: { ...BADGE_TONES, ...extraTones } as Record<BadgeTone | keyof Extra, string>,
    },
    defaultVariants: { variant: "default" },
  });
  const classesFor = variants as (props: { variant?: string | null }) => string;

  function Badge({
    className,
    variant = "default",
    asChild = false,
    ...props
  }: BadgeProps<BadgeTone | Extract<keyof Extra, string>>) {
    const Comp = asChild ? Slot.Root : "span";

    return (
      <Comp
        data-slot="badge"
        data-variant={variant}
        className={cn(classesFor({ variant }), className)}
        {...props}
      />
    );
  }

  return Object.assign(Badge, { variants });
}

const Badge = createBadge();

const badgeVariants = Badge.variants;

export { Badge, badgeVariants };
