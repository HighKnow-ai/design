/**
 * The one loading gate, the base's loading policy (#615 point 6; loading, empty, failed and
 * unknown are four different facts): nothing for 150 ms, then the loading treatment, held at
 * least 350 ms once it has appeared.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * A WAIT UNDER 150 ms SHOWS NOTHING, AND THAT IS DELIBERATE. Most reads land inside it, and a
 * skeleton that appears for 60 ms and vanishes is itself the flicker this gate exists to remove.
 * Past 150 ms the person has noticed the wait, and a blank region is then the wrong answer, so
 * the caller shows a skeleton in the region's own final shape.
 *
 * ONCE SHOWN, IT STAYS AT LEAST 350 ms (400 until #638 re-measured the reads). A skeleton that
 * appears at 150 ms and is replaced at 170 ms blinks, which reads as a fault. 350 is the shortest
 * hold that is not itself a flash: Tenure's opening check (#631) counts anything on screen for
 * under 300 ms as one, and the skeleton is painted a frame or two after the timer below fires,
 * so the floor is 300 plus three frames, rounded. So the flag stays `true` after `isPending` ends until
 * the skeleton has been on screen for {@link LOADING_MIN_VISIBLE_MS}; a caller therefore checks
 * this flag BEFORE it checks for data (`<Delayed>` does that for it).
 *
 * Copied from Tenure's `packages/ui/src/shell/useDelayedLoading.ts`, where it had already
 * replaced four private copies. Flywheel adopts it with this package (#615 point 6), in place of
 * its immediate skeleton.
 */
import { useLayoutEffect, useRef, useState } from "react";

/** How long a pending state may run before the loading treatment is allowed to appear. */
export const LOADING_THRESHOLD_MS = 150;

/** The least time the loading treatment stays on screen once it has appeared. */
export const LOADING_MIN_VISIBLE_MS = 350;

/**
 * `true` once `isPending` has been `true` for {@link LOADING_THRESHOLD_MS}, and then until it has
 * ended AND the treatment has been visible for {@link LOADING_MIN_VISIBLE_MS}. A later wait starts
 * its own clock.
 */
export function useDelayedLoading(isPending: boolean): boolean {
  const [show, setShow] = useState(false);
  const shownAt = useRef<number | null>(null);

  // A LAYOUT EFFECT, NOT A PASSIVE ONE: LOAD-BEARING (tenure-v0.3.18). The commit that draws the
  // landed content must also cancel the 150 ms timer. A passive effect's cleanup runs in a later
  // task, and on a loaded machine the timer fires in that gap, raising the skeleton over content
  // already on screen and mounting that content a second time 350 ms later: a flash, a replayed
  // entrance, lost focus. A layout effect's cleanup runs inside the commit, so no task fits
  // between. React 19 runs neither kind on the server, so this costs server rendering nothing.
  useLayoutEffect(() => {
    if (isPending) {
      if (show) return undefined;
      const timer = setTimeout(() => {
        shownAt.current = Date.now();
        setShow(true);
      }, LOADING_THRESHOLD_MS);
      return () => clearTimeout(timer);
    }
    if (!show) return undefined;
    const remaining = LOADING_MIN_VISIBLE_MS - (Date.now() - (shownAt.current ?? 0));
    const hide = () => {
      shownAt.current = null;
      setShow(false);
    };
    if (remaining <= 0) {
      hide();
      return undefined;
    }
    const timer = setTimeout(hide, remaining);
    return () => clearTimeout(timer);
  }, [isPending, show]);

  return show;
}

/** A region's loading phase: nothing yet, the skeleton, or the content. */
export type LoadingPhase = "blank" | "skeleton" | "ready";

/**
 * The same gate as a three-way phase, for a region that renders the three differently:
 * `"blank"` for the first 150 ms of a wait, `"skeleton"` while {@link useDelayedLoading} holds,
 * `"ready"` otherwise. A region that already has data and refetches never leaves `"ready"` as
 * long as its caller passes the query's `isPending` (a first load), not `isFetching`.
 */
export function useLoadingPhase(isPending: boolean): LoadingPhase {
  const showSkeleton = useDelayedLoading(isPending);
  if (showSkeleton) return "skeleton";
  return isPending ? "blank" : "ready";
}
