export const MISSING = "—";

export type TimeInput = string | number | Date | null | undefined;

export function toEpochMs(at: TimeInput): number | null {
  if (at === null || at === undefined || at === "") return null;
  const ms = at instanceof Date ? at.getTime() : typeof at === "number" ? at : Date.parse(at);
  return Number.isFinite(ms) ? ms : null;
}

export function formatRelativeTime(
  at: TimeInput,
  now: number = Date.now(),
  locale?: string,
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

export function formatAbsoluteTime(at: TimeInput, locale?: string): string {
  const ms = toEpochMs(at);
  if (ms === null) return MISSING;
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(ms),
  );
}
