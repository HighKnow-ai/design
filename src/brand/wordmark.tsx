import { MarkGlyph } from "./mark-glyph.js";
import { cn } from "../lib/utils.js";

export const BRAND_HEX = "#3c64dd";

export interface WordmarkProps {
  readonly markOnly?: boolean | undefined;
  readonly name?: string | undefined;
  readonly className?: string | undefined;
}

export function Wordmark({ markOnly = false, name = "HighKnow", className }: WordmarkProps) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)} data-testid="wordmark">
      <svg
        viewBox="0 0 1024 1024"
        width="24"
        height="24"
        className="shrink-0"
        role={markOnly ? "img" : undefined}
        aria-label={markOnly ? name : undefined}
        aria-hidden={markOnly ? undefined : "true"}
      >
        <rect fill={BRAND_HEX} x="0" y="0" width="1024" height="1024" rx="200" ry="200" />
        <MarkGlyph />
      </svg>
      {!markOnly ? (
        <span
          data-wordmark-name=""
          className="text-[0.875rem] leading-none font-medium text-foreground"
        >
          {name}
        </span>
      ) : null}
    </div>
  );
}
