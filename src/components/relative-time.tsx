/**
 * A time as it reads at a glance ("3m ago") with the absolute time in a Tooltip and on
 * `<time dateTime>` (#616), from Flywheel's `components/RelativeTime.tsx`. Tenure shows claim ages,
 * which is its core value; Flywheel shows session ages. `now` is the caller's clock, so a list of
 * rows ticks together; it defaults to the moment of render. An unreadable time is the dash, with
 * no tooltip. The words are the platform's, in `locale` (#616 point 5).
 */
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
  /** The reader's locale ("en", "fr"). Absent, the runtime's. */
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
