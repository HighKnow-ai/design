/**
 * The one loading gate, the base's loading policy (loading, empty, failed and
 * unknown are four different facts): nothing for 150 ms, then the loading treatment, held at
 * least 350 ms once it has appeared.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * A WAIT UNDER 150 ms SHOWS NOTHING, AND THAT IS DELIBERATE. Most reads land inside it, and a
 * skeleton that appears for 60 ms and vanishes is itself the flicker this gate exists to remove.
 * Past 150 ms the person has noticed the wait, and a blank region is then the wrong answer, so
 * the caller shows a skeleton in the region's own final shape.
 *
 * ONCE SHOWN, IT STAYS AT LEAST 350 ms (400 until the reads were re-measured). A skeleton that
 * appears at 150 ms and is replaced at 170 ms blinks, which reads as a fault. 350 is the shortest
 * hold that is not itself a flash: Tenure's opening check counts anything on screen for
 * under 300 ms as one, and 350 is that floor plus three frames, rounded. The hold is counted from
 * the frame that first paints the skeleton, not from the timer that raised it, so a loaded
 * machine that paints late cannot eat into it (below). So the flag stays `true` after
 * `isPending` ends until the skeleton has been on screen for {@link LOADING_MIN_VISIBLE_MS}; a
 * caller therefore checks this flag BEFORE it checks for data (`<Delayed>` does that for it).
 *
 * Copied from Tenure's `packages/ui/src/shell/useDelayedLoading.ts`, where it had already
 * replaced four private copies. Flywheel adopts it with this package, in place of
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
  /** When the frame that first paints the treatment ran; `null` until it has. */
  const shownAt = useRef<number | null>(null);

  // THE HOLD COUNTS FROM THE FRAME THAT PAINTS THE TREATMENT, NOT FROM THE TIMER THAT RAISED IT.
  // Between the two sit a render, a commit and the wait for the next frame, and every millisecond
  // of that came off the hold: Tenure's opening check measured skeletons on screen for 335 ms of
  // their 350, idle and loaded alike, and a main thread busy for longer than the margin (a page
  // still parsing its scripts) would have made the hold itself a flash. Counted from the frame,
  // the same check measures 351 ms at a load average of 50.
  // The commit that raises it asks for the next animation frame, the one that draws it, and the
  // clock starts there. A layout effect, so the frame is asked for inside that commit; declared
  // before the effect below, so on a commit that also ends the wait this frame is asked for
  // first, and runs first.
  useLayoutEffect(() => {
    if (!show) return undefined;
    if (typeof requestAnimationFrame !== "function") {
      // Nothing paints frames here (a test renderer): the commit is as close as it gets.
      shownAt.current = performance.now();
      return undefined;
    }
    const frame = requestAnimationFrame(() => {
      shownAt.current = performance.now();
    });
    return () => cancelAnimationFrame(frame);
  }, [show]);

  // A LAYOUT EFFECT, NOT A PASSIVE ONE: LOAD-BEARING (tenure-v0.3.18). The commit that draws the
  // landed content must also cancel the 150 ms timer. A passive effect's cleanup runs in a later
  // task, and on a loaded machine the timer fires in that gap, raising the skeleton over content
  // already on screen and mounting that content a second time 350 ms later: a flash, a replayed
  // entrance, lost focus. A layout effect's cleanup runs inside the commit, so no task fits
  // between. React 19 runs neither kind on the server, so this costs server rendering nothing.
  useLayoutEffect(() => {
    if (isPending) {
      if (show) return undefined;
      const timer = setTimeout(() => setShow(true), LOADING_THRESHOLD_MS);
      return () => clearTimeout(timer);
    }
    if (!show) return undefined;
    const hide = () => {
      shownAt.current = null;
      setShow(false);
    };
    let timer: ReturnType<typeof setTimeout> | undefined;
    let frame: number | undefined;
    const holdFrom = (paintedAt: number) => {
      const remaining = LOADING_MIN_VISIBLE_MS - (performance.now() - paintedAt);
      if (remaining <= 0) hide();
      else timer = setTimeout(hide, remaining);
    };
    if (shownAt.current !== null) {
      holdFrom(shownAt.current);
    } else if (document.visibilityState === "hidden") {
      // Raised in a tab nobody is looking at, and never painted: nobody has seen it to be held.
      hide();
      return undefined;
    } else {
      // The wait ended before the treatment's first frame. That frame, asked for first above,
      // starts the clock; this callback runs in the same frame, after it, and holds from there.
      frame = requestAnimationFrame(() => holdFrom(shownAt.current ?? performance.now()));
    }
    return () => {
      clearTimeout(timer);
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
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
