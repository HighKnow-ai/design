import { useLayoutEffect, useRef, useState, type RefObject } from "react";

export const LOADING_THRESHOLD_MS = 150;

export const LOADING_MIN_VISIBLE_MS = 350;

export function useLoadingPaintedAt(show: boolean): Readonly<RefObject<number | null>> {
  const paintedAt = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (!show) return undefined;
    paintedAt.current = null;
    if (typeof requestAnimationFrame !== "function") {
      paintedAt.current = performance.now();
      return undefined;
    }
    const frame = requestAnimationFrame(() => {
      paintedAt.current = performance.now();
    });
    return () => cancelAnimationFrame(frame);
  }, [show]);

  return paintedAt;
}

export function useDelayedLoading(isPending: boolean): boolean {
  const [show, setShow] = useState(false);
  const paintedAt = useLoadingPaintedAt(show);

  useLayoutEffect(() => {
    if (isPending) {
      if (show) return undefined;
      const timer = setTimeout(() => setShow(true), LOADING_THRESHOLD_MS);
      return () => clearTimeout(timer);
    }
    if (!show) return undefined;
    const hide = () => setShow(false);
    if (paintedAt.current === null) {
      // The wait ended before the treatment's first frame: nobody has seen it to be held. React
      // renders a layout effect's update before the browser can paint, and that commit cancels the
      // frame, so it is never drawn.
      hide();
      return undefined;
    }
    const remaining = LOADING_MIN_VISIBLE_MS - (performance.now() - paintedAt.current);
    if (remaining <= 0) {
      hide();
      return undefined;
    }
    const timer = setTimeout(hide, remaining);
    return () => clearTimeout(timer);
  }, [isPending, show, paintedAt]);

  return show;
}

export type LoadingPhase = "blank" | "skeleton" | "ready";

export function useLoadingPhase(isPending: boolean): LoadingPhase {
  const showSkeleton = useDelayedLoading(isPending);
  if (showSkeleton) return "skeleton";
  return isPending ? "blank" : "ready";
}
