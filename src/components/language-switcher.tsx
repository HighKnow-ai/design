/**
 * The language control (#616, optional: Flywheel is English-only), from Tenure's
 * `packages/ui/src/i18n/LanguageSwitcher.tsx`, which the apex and Tenure already shared.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * THE LOCALES AND THEIR LABELS ARE THE CALLER'S. Tenure's hard-coded EN and FR; here the surface
 * passes its own list (#616 point 5). Labels are codes, not full names, so the control does not
 * shift when translated. `onSelect` receives the VALUE, never the label: a switch on the label
 * breaks the day a label changes.
 *
 * THE ACTIVE CHOICE IS CARRIED BY WEIGHT, NOT COLOUR ALONE, as an inline style, so the difference
 * is a real computed style. It is never a filled button: it must not compete with the page's one
 * primary action.
 *
 * TWO FORMS, ONE LOOK. `onSelect` renders buttons for a client that swaps its catalogue in memory.
 * `hrefFor` renders plain links for a server-rendered page that must switch with no JavaScript at
 * all; the active link says so with `aria-current`, the link-shaped twin of `aria-pressed`.
 *
 * The root merges `className` with `cn()`, so a responsive `hidden` passed in wins over its own
 * `inline-flex` (#617's finding).
 */
import { cn } from "../lib/utils.js";

export interface LanguageOption<Locale extends string = string> {
  readonly value: Locale;
  /** The code shown: "EN". */
  readonly label: string;
}

export type LanguageSwitcherProps<Locale extends string = string> = {
  readonly locales: ReadonlyArray<LanguageOption<Locale>>;
  readonly active: Locale;
  /** The group's accessible name. English by default. */
  readonly label?: string | undefined;
  readonly className?: string | undefined;
} & (
  | { readonly onSelect: (locale: Locale) => void; readonly hrefFor?: never }
  | { readonly hrefFor: (locale: Locale) => string; readonly onSelect?: never }
);

function controlClass(isActive: boolean): string {
  return cn(
    "text-meta leading-[1.4] transition-colors duration-(--duration-feedback)",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    isActive ? "text-running" : "text-muted-foreground hover:text-foreground",
  );
}

export function LanguageSwitcher<Locale extends string>(props: LanguageSwitcherProps<Locale>) {
  const { locales, active, label = "Language", className } = props;
  return (
    <div
      className={cn("inline-flex items-center gap-3", className)}
      role="group"
      aria-label={label}
      data-slot="language-switcher"
    >
      {locales.map((option) => {
        const isActive = option.value === active;
        const style = { fontWeight: isActive ? 600 : 400 };
        if (props.hrefFor !== undefined) {
          return (
            <a
              key={option.value}
              href={props.hrefFor(option.value)}
              hrefLang={option.value}
              aria-current={isActive ? "true" : undefined}
              style={style}
              className={controlClass(isActive)}
            >
              {option.label}
            </a>
          );
        }
        const { onSelect } = props;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            aria-pressed={isActive}
            style={style}
            className={controlClass(isActive)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
