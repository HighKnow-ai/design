import { type ReactNode } from "react";
import { cn } from "../lib/utils.js";
import { useLoadingPaintedAt, useLoadingPhase } from "../hooks/use-delayed-loading.js";

export interface DelayedProps {
  readonly pending: boolean;
  readonly fallback: ReactNode;
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
  const paintedAt = useLoadingPaintedAt(phase === "skeleton");
  const sawSkeleton = paintedAt.current !== null;

  if (phase !== "ready") {
    return (
      <div aria-busy="true" className={className} data-loading-phase={phase}>
        <span className="sr-only" role="status">
          {phase === "skeleton" ? label : ""}
        </span>
        {/* HIDDEN FROM ASSISTIVE TECHNOLOGY: the status line above says what is loading, and a
            skeleton shaped like a table must never be read, or queried, as the table. */}
        {/* `display: contents`: the skeleton's blocks are laid out by the same wrapper,
            and so by the same rules, as the content's (a `flex flex-col gap-4` stacks both
            alike). As a plain block this wrapper made the skeleton one flex item, its blocks
            stacked with no gap, 16 px shorter than the content that replaced it. */}
        {phase === "skeleton" ? (
          <div aria-hidden="true" className="contents">
            {fallback}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        sawSkeleton && "animate-in duration-(--duration-overlay) ease-(--ease) fade-in",
        className,
      )}
      data-loading-phase="ready"
      data-handover={sawSkeleton ? "skeleton" : undefined}
    >
      {typeof children === "function" ? children() : children}
    </div>
  );
}
