/**
 * The logo and the name, drawn as inline SVG paths (#616), from Tenure's
 * `packages/ui/src/brand/Wordmark.tsx`. Flywheel drew the mark itself; both now draw this one.
 *
 * INLINE PATHS, NEVER A RASTER IMAGE AND NEVER AN ICON FONT: colour and size stay this component's,
 * not the browser's image pipeline's. The tile is fixed at `#3c64dd`, the pinned brand hex, in
 * both schemes: the mark is not a token that varies by scheme. The name follows the text colour.
 *
 * TWO CHANGES FROM TENURE'S, BOTH FROM #617's PROTOTYPE:
 *   - The root merges `className` with `cn()`, so a responsive `hidden` passed in wins over its
 *     own `inline-flex` (the apex had to wrap it in a span to hide it).
 *   - The name carries `data-wordmark-name`, so a condensing header can fold it away without
 *     drawing its own copy of the lockup.
 *
 * "HighKnow" is the mark's own name, drawn as part of the logo and used as the image's accessible
 * name when the mark stands alone; it is a default a surface can replace (`name`), not copy.
 */
import { MarkGlyph } from "./mark-glyph.js";
import { cn } from "../lib/utils.js";

/** The pinned brand hex, hsl(225, 70%, 55%). */
export const BRAND_HEX = "#3c64dd";

export interface WordmarkProps {
  /** The mark alone, as an image named `name`, without the name beside it. */
  readonly markOnly?: boolean | undefined;
  /** The name beside the mark, and the mark's accessible name. */
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
