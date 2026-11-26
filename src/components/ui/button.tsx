import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils.js";
import { Slot } from "radix-ui";
import { Spinner } from "./spinner.js";

const BUTTON_BASE =
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-transparent font-semibold whitespace-nowrap transition-colors duration-(--duration-state) ease-(--ease) select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

export const BUTTON_TONES = {
  default:
    "bg-primary text-primary-foreground shadow-[0_1px_0_rgb(0_0_0/0.15)] hover:bg-primary/90",
  neutral: "bg-foreground text-card shadow-[0_1px_0_rgb(0_0_0/0.15)] hover:bg-foreground/85",
  secondary: "bg-secondary text-secondary-foreground hover:bg-accent",
  outline:
    "border-input bg-card text-foreground hover:border-foreground aria-expanded:border-foreground",
  ghost: "text-foreground hover:bg-accent aria-expanded:bg-accent",
  destructive: "text-destructive-text hover:bg-accent",
  link: "h-auto px-0 text-running underline-offset-4 hover:underline",
} as const;

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

function isIcon(child: React.ReactNode): child is React.ReactElement<{ className?: string }> {
  return React.isValidElement(child) && (child.type === "svg" || typeof child.type !== "string");
}

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
  readonly loading?: boolean | undefined;
};

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

const buttonVariants = Button.variants;

export { Button, buttonVariants };
