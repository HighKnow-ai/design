import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip.js";
import {
  MISSING,
  formatAbsoluteTime,
  formatRelativeTime,
  toEpochMs,
  type TimeInput,
} from "../lib/format.js";
import { cn } from "../lib/utils.js";

export interface RelativeTimeProps {
  readonly at: TimeInput;
  readonly now?: number | undefined;
  readonly locale?: string | undefined;
  readonly className?: string | undefined;
}

export function RelativeTime({ at, now, locale, className }: RelativeTimeProps) {
  const ms = toEpochMs(at);
  if (ms === null) return <span className={className}>{MISSING}</span>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <time
          dateTime={new Date(ms).toISOString()}
          className={cn("whitespace-nowrap tabular-nums", className)}
        >
          {formatRelativeTime(ms, now, locale)}
        </time>
      </TooltipTrigger>
      <TooltipContent>{formatAbsoluteTime(ms, locale)}</TooltipContent>
    </Tooltip>
  );
}
