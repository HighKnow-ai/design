import { cn } from "../lib/utils.js";

export interface LanguageOption<Locale extends string = string> {
  readonly value: Locale;
  readonly label: string;
}

export type LanguageSwitcherProps<Locale extends string = string> = {
  readonly locales: ReadonlyArray<LanguageOption<Locale>>;
  readonly active: Locale;
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
