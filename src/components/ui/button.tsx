/**
 * shadcn/ui `button` (style radix-nova), Flywheel's retheme
 * (`flywheel/packages/desktop/src/components/ui/button.tsx`), with the neutral tones only and a
 * factory a product extends.
 *
 * One filled primary per region, brand blue. `neutral` is the filled ink, for the one place a
 * refusal should lead without spending the brand on it. `destructive` is a text button set apart
 * from the primary, and always confirms in an AlertDialog (`ConfirmDestructive`). Buttons carry an
 * icon and a word; the focus ring is the 2px `--ring` at a 2px offset. A button that can be
 * pending takes `loading`: the Spinner takes its icon's place, and the label and width stay.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * A PRODUCT'S OWN TONE IS ADDED, NEVER SHIPPED HERE. Flywheel's `attention` (safety yellow,
 * "waiting on you") is Flywheel's semantic role; a base that carried it would ask Tenure to promise
 * never to use it. So a product builds its own Button from this one:
 *
 *   export const Button = createButton({
 *     attention: "bg-attention text-attention-foreground shadow-[0_1px_0_rgb(0_0_0/0.15)] hover:bg-attention/90",
 *   });
 *
 * and its `variant` prop then accepts the base tones plus `attention`, typed.
 */
import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils.js";
import { Slot } from "radix-ui";
import { Spinner } from "./spinner.js";

const BUTTON_BASE =
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-transparent font-semibold whitespace-nowrap transition-colors duration-(--duration-state) ease-(--ease) select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

/** The base's tones. A product adds its own with {@link createButton}. */
export const BUTTON_TONES = {
  default:
    "bg-primary text-primary-foreground shadow-[0_1px_0_rgb(0_0_0/0.15)] hover:bg-primary/90",
  // The filled neutral (ink fill), for the one place a refusal should lead without spending the
  // brand on it.
  neutral: "bg-foreground text-card shadow-[0_1px_0_rgb(0_0_0/0.15)] hover:bg-foreground/85",
  secondary: "bg-secondary text-secondary-foreground hover:bg-accent",
  outline:
    "border-input bg-card text-foreground hover:border-foreground aria-expanded:border-foreground",
  ghost: "text-foreground hover:bg-accent aria-expanded:bg-accent",
  destructive: "text-destructive-text hover:bg-accent",
  link: "h-auto px-0 text-running underline-offset-4 hover:underline",
} as const;

/** The control heights, on the type scale: 34 px by default. */
export const BUTTON_SIZES = {
  default:
    "h-8.5 px-3.5 text-body has-data-[icon=inline-start]:pl-3 has-data-[icon=inline-end]:pr-3",
  xs: "h-6 gap-1 rounded-sm px-2 text-meta [&_svg:not([class*='size-'])]:size-3.5",
  sm: "h-7.5 gap-1 px-2.75 text-small has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-[15px]",
  lg: "h-10 px-4 text-row",
  icon: "size-8.5",
  "icon-xs": "size-6 rounded-sm [&_svg:not([class*='size-'])]:size-3.5",
  "icon-sm": "size-7.5",
  "icon-lg": "size-10",
} as const;

export type ButtonTone = keyof typeof BUTTON_TONES;
export type ButtonSize = keyof typeof BUTTON_SIZES;

/** Whether a child is the button's leading icon: an `<svg>` or a component element (a Lucide glyph, `Icon`). */
function isIcon(child: React.ReactNode): child is React.ReactElement<{ className?: string }> {
  return React.isValidElement(child) && (child.type === "svg" || typeof child.type !== "string");
}

/**
 * The children of a pending button: the Spinner takes the leading icon's place, at the icon's own
 * size classes, so the label stays and the width does not move. A button with no icon gains the
 * Spinner before its label.
 */
function withSpinner(children: React.ReactNode): React.ReactNode {
  const items = React.Children.toArray(children);
  const [first, ...rest] = items;
  const leading = isIcon(first) ? first : null;
  const spinner = (
    <Spinner
      key="spinner"
      role={undefined}
      aria-label={undefined}
      aria-hidden="true"
      className={leading?.props.className}
      {...(leading && "data-icon" in (leading.props as object)
        ? { "data-icon": (leading.props as { "data-icon"?: string })["data-icon"] }
        : {})}
    />
  );
  return leading ? [spinner, ...rest] : [spinner, ...items];
}

export type ButtonProps<Tone extends string = ButtonTone> = Omit<
  React.ComponentProps<"button">,
  "ref"
> & {
  readonly ref?: React.Ref<HTMLButtonElement> | undefined;
  readonly variant?: Tone | null | undefined;
  readonly size?: ButtonSize | null | undefined;
  readonly asChild?: boolean | undefined;
  /**
   * Pending: shows the Spinner in place of the icon, keeps the label and the width, sets
   * `aria-busy`, and swallows clicks. The button stays focusable (`aria-disabled`, not
   * `disabled`), so focus is not lost mid-action. Not available with `asChild`.
   */
  readonly loading?: boolean | undefined;
};

/**
 * A Button whose `variant` takes the base's tones plus `extraTones`. Call it once, at module
 * scope, in the product's own components; the base `Button` is `createButton()`.
 */
export function createButton<const Extra extends Record<string, string> = Record<never, string>>(
  extraTones?: Extra,
) {
  const variants = cva(BUTTON_BASE, {
    variants: {
      variant: { ...BUTTON_TONES, ...extraTones } as Record<ButtonTone | keyof Extra, string>,
      size: BUTTON_SIZES,
    },
    defaultVariants: { variant: "default", size: "default" },
  });
  // cva's own prop type maps each key through `StringToBoolean`, which a generic key set cannot
  // satisfy; the props below are already typed exactly, so the call takes them as strings.
  const classesFor = variants as (props: {
    variant?: string | null;
    size?: ButtonSize | null;
    className?: string | undefined;
  }) => string;

  function Button({
    className,
    variant = "default",
    size = "default",
    asChild = false,
    loading = false,
    children,
    onClick,
    ...props
  }: ButtonProps<ButtonTone | Extract<keyof Extra, string>>) {
    const Comp = asChild ? Slot.Root : "button";
    const pending = loading && !asChild;

    return (
      <Comp
        data-slot="button"
        data-variant={variant}
        data-size={size}
        data-loading={pending || undefined}
        aria-busy={pending || undefined}
        aria-disabled={pending || props["aria-disabled"] || undefined}
        className={cn(classesFor({ variant, size, className }), pending && "cursor-progress")}
        onClick={
          pending
            ? (event: React.MouseEvent<HTMLButtonElement>) => {
                event.preventDefault();
              }
            : onClick
        }
        {...props}
      >
        {pending ? withSpinner(children) : children}
      </Comp>
    );
  }

  return Object.assign(Button, { variants });
}

const Button = createButton();

/** The base Button's class function, for a non-button element that must look like one. */
const buttonVariants = Button.variants;

export { Button, buttonVariants };
