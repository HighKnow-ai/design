/**
 * One region's loading grammar, as a component (#616, from Tenure's `shell/Delayed.tsx`; loading,
 * empty, failed and unknown are four different facts): nothing for the first 150 ms of a first load, then
 * `fallback` (a skeleton in the region's final geometry) held at least 400 ms, then the content.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * THE CONTENT CROSS-FADES IN ONLY WHEN IT REPLACES A SKELETON. A region that was already there,
 * or whose data landed inside 150 ms, never re-enters: an entrance on content the reader has
 * already seen is motion without meaning. The fade is the overlay duration on the one curve, and
 * under reduced motion it stays (a fade is not movement; `@highknow/design/base.css`).
 *
 * `children` MAY BE A FUNCTION, so a caller can write `{() => <List rows={query.data!} />}` and
 * the data is only read once the gate says it is there. Pass the query's `isPending` (a FIRST
 * load), never `isFetching`: a refetch of data already on screen shows nothing.
 *
 * A FAILED READ IS NOT THIS COMPONENT'S BUSINESS. Branch to `ReadError` before it, and to
 * `EmptyState` inside its content, so loading, failed and empty stay three different facts.
 */
import { useRef, type ReactNode } from "react";
import { cn } from "../lib/utils.js";
import { useLoadingPhase } from "../hooks/use-delayed-loading.js";

export interface DelayedProps {
  /** The query's `isPending`: true until its first answer (or failure). */
  readonly pending: boolean;
  /** The skeleton, in the content's own shape. Shown only after 150 ms. */
  readonly fallback: ReactNode;
  /** What is loading, for assistive technology ("Loading the meeting list."). */
  readonly label: string;
  readonly children: ReactNode | (() => ReactNode);
  readonly className?: string | undefined;
}

export function Delayed({
  pending,
  fallback,
  label,
  children,
  className,
}: DelayedProps): React.JSX.Element {
  const phase = useLoadingPhase(pending);
  const sawSkeleton = useRef(false);
  if (phase === "skeleton") sawSkeleton.current = true;

  if (phase !== "ready") {
    return (
      <div aria-busy="true" className={className} data-loading-phase={phase}>
        <span className="sr-only" role="status">
          {phase === "skeleton" ? label : ""}
        </span>
        {/* HIDDEN FROM ASSISTIVE TECHNOLOGY: the status line above says what is loading, and a
            skeleton shaped like a table must never be read, or queried, as the table. */}
        {phase === "skeleton" ? <div aria-hidden="true">{fallback}</div> : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        sawSkeleton.current && "animate-in duration-(--duration-overlay) ease-(--ease) fade-in",
        className,
      )}
      data-loading-phase="ready"
    >
      {typeof children === "function" ? children() : children}
    </div>
  );
}
