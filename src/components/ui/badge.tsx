/**
 * shadcn/ui `badge` (style radix-nova), Flywheel's retheme
 * (`flywheel/packages/desktop/src/components/ui/badge.tsx`), with the neutral tones only and a
 * factory a product extends.
 *
 * Pills, 24 px at 13 px semibold. The tones a state may wear are `running` (at work), `destructive`
 * (stopped or failed) and `neutral` (everything else, told apart by its icon and word); `secondary`,
 * `outline` and `ghost` are for counts and kinds that are not states.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * A STATE PICKS ITS TONE IN EXACTLY ONE PLACE, AND THAT PLACE IS THE PRODUCT'S. Flywheel's
 * `StateBadge` is the pattern: one table from each of its states to a tone, an icon and a word,
 * and every screen renders the state through it, never a `<Badge variant>` of its own choosing.
 * A product tone the base does not carry (Flywheel's `attention`) is added with `createBadge`:
 *
 *   export const Badge = createBadge({ attention: "bg-attention font-bold text-attention-foreground" });
 */
import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils.js";
import { Slot } from "radix-ui";

const BADGE_BASE =
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-transparent px-2.5 text-[13px] leading-none font-semibold whitespace-nowrap transition-colors duration-(--duration-state) ease-(--ease) has-data-[icon=inline-start]:pl-2 has-data-[icon=inline-end]:pr-2 [&>svg]:pointer-events-none [&>svg]:size-[15px]";

/** The base's tones. A product adds its own with {@link createBadge}. */
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

/** A Badge whose `variant` takes the base's tones plus `extraTones`. Call it once, at module scope. */
export function createBadge<const Extra extends Record<string, string> = Record<never, string>>(
  extraTones?: Extra,
) {
  const variants = cva(BADGE_BASE, {
    variants: {
      variant: { ...BADGE_TONES, ...extraTones } as Record<BadgeTone | keyof Extra, string>,
    },
    defaultVariants: { variant: "default" },
  });
  // cva's own prop type maps each key through `StringToBoolean`, which a generic key set cannot
  // satisfy; the props below are already typed exactly, so the call takes them as strings.
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

/** The base Badge's class function. */
const badgeVariants = Badge.variants;

export { Badge, badgeVariants };
