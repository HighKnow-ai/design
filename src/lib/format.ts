/**
 * Times as they read at a glance, from Flywheel's `lib/format.ts`. The words come from the
 * platform (`Intl.RelativeTimeFormat`), never from this package (#616 point 5): "3m ago" in
 * English, "il y a 3 min" or its narrow form in French, whatever the reader's locale says.
 *
 * A value that is missing or cannot be read is the dash, never `0` or `NaN`.
 */

/** The mark for a figure that is missing or cannot be read. */
export const MISSING = "—";

export type TimeInput = string | number | Date | null | undefined;

/** Milliseconds since the epoch, or `null` for a time that cannot be read. */
export function toEpochMs(at: TimeInput): number | null {
  if (at === null || at === undefined || at === "") return null;
  const ms = at instanceof Date ? at.getTime() : typeof at === "number" ? at : Date.parse(at);
  return Number.isFinite(ms) ? ms : null;
}

/**
 * A time relative to `now`, in the narrow style: "now", "3m ago", "2h ago", "3d ago", then the
 * date ("12 Oct") once it is a week old. `locale` is the reader's; absent, the runtime's.
 */
export function formatRelativeTime(
  at: TimeInput,
  now: number = Date.now(),
  locale?: string | undefined,
): string {
  const ms = toEpochMs(at);
  if (ms === null) return MISSING;
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: "auto", style: "narrow" });
  const seconds = Math.floor((now - ms) / 1000);
  if (seconds < 60) return relative.format(0, "second");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return relative.format(-minutes, "minute");
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return relative.format(-hours, "hour");
  const days = Math.floor(hours / 24);
  if (days < 7) return relative.format(-days, "day");
  const sameYear = new Date(ms).getFullYear() === new Date(now).getFullYear();
  return new Intl.DateTimeFormat(
    locale,
    sameYear ? { day: "numeric", month: "short" } : { dateStyle: "medium" },
  ).format(new Date(ms));
}

/** The absolute date and time, for the Tooltip behind a relative time. */
export function formatAbsoluteTime(at: TimeInput, locale?: string | undefined): string {
  const ms = toEpochMs(at);
  if (ms === null) return MISSING;
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(ms),
  );
}
