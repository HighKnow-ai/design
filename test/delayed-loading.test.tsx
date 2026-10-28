/**
 * The loading gate (decision 212): nothing for 150 ms, then the skeleton, held at least 350 ms
 * once shown; a fresh clock per wait. Driven with fake timers (which fake `Date.now` too), so
 * every boundary is asserted at the millisecond rather than raced, except the one suite at the
 * end, which needs the real event loop.
 */
import { useEffect, useState } from "react";
import { act, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Delayed } from "../src/index.js";
import {
  LOADING_MIN_VISIBLE_MS,
  LOADING_THRESHOLD_MS,
  useDelayedLoading,
  useLoadingPhase,
} from "../src/index.js";

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

describe("useDelayedLoading", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("the thresholds are the policy's: 150 ms before, 350 ms held", () => {
    expect(LOADING_THRESHOLD_MS).toBe(150);
    expect(LOADING_MIN_VISIBLE_MS).toBe(350);
  });

  // THE HOLD HAS A FLOOR, AND IT IS NOT A TASTE: Tenure's opening check calls
  // anything on screen for under 300 ms a flash, and a skeleton is drawn a frame or two after the
  // timer that shows it fires. A hold of 300 ms or less would fail that check by construction.
  it("holds the skeleton past the 300 ms flash floor, with three frames to spare", () => {
    expect(LOADING_MIN_VISIBLE_MS).toBeGreaterThanOrEqual(300 + 3 * 16);
  });

  it("is false before 150 ms and true after", () => {
    const { result } = renderHook(() => useDelayedLoading(true));
    expect(result.current).toBe(false);
    advance(LOADING_THRESHOLD_MS - 1);
    expect(result.current).toBe(false);
    advance(1);
    expect(result.current).toBe(true);
  });

  it("never shows for a wait that ends at 100 ms", () => {
    const { result, rerender } = renderHook(({ p }) => useDelayedLoading(p), {
      initialProps: { p: true },
    });
    advance(100);
    rerender({ p: false });
    advance(1000);
    expect(result.current).toBe(false);
  });

  it("once shown, holds for 350 ms even when the wait ends at once", () => {
    const { result, rerender } = renderHook(({ p }) => useDelayedLoading(p), {
      initialProps: { p: true },
    });
    advance(LOADING_THRESHOLD_MS);
    expect(result.current).toBe(true);
    // The data lands 20 ms after the skeleton appeared: hiding it now would be a blink.
    advance(20);
    rerender({ p: false });
    expect(result.current).toBe(true);
    advance(LOADING_MIN_VISIBLE_MS - 20 - 1);
    expect(result.current).toBe(true);
    advance(1);
    expect(result.current).toBe(false);
  });

  it("hides at once when the wait ends after the skeleton has already been up 350 ms", () => {
    const { result, rerender } = renderHook(({ p }) => useDelayedLoading(p), {
      initialProps: { p: true },
    });
    advance(LOADING_THRESHOLD_MS + LOADING_MIN_VISIBLE_MS + 50);
    expect(result.current).toBe(true);
    rerender({ p: false });
    expect(result.current).toBe(false);
  });

  it("starts a fresh clock for a later wait", () => {
    const { result, rerender } = renderHook(({ p }) => useDelayedLoading(p), {
      initialProps: { p: true },
    });
    advance(LOADING_THRESHOLD_MS + LOADING_MIN_VISIBLE_MS);
    rerender({ p: false });
    expect(result.current).toBe(false);
    rerender({ p: true });
    advance(LOADING_THRESHOLD_MS - 1);
    expect(result.current).toBe(false);
    advance(1);
    expect(result.current).toBe(true);
  });

  it("is false when nothing is pending", () => {
    const { result } = renderHook(() => useDelayedLoading(false));
    advance(1000);
    expect(result.current).toBe(false);
  });
});

describe("useLoadingPhase", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("goes blank, then skeleton, then ready", () => {
    const { result, rerender } = renderHook(({ p }) => useLoadingPhase(p), {
      initialProps: { p: true },
    });
    expect(result.current).toBe("blank");
    advance(LOADING_THRESHOLD_MS);
    expect(result.current).toBe("skeleton");
    rerender({ p: false });
    expect(result.current).toBe("skeleton");
    advance(LOADING_MIN_VISIBLE_MS);
    expect(result.current).toBe("ready");
  });

  it("a region that already has data never leaves ready", () => {
    const { result } = renderHook(() => useLoadingPhase(false));
    expect(result.current).toBe("ready");
    advance(1000);
    expect(result.current).toBe("ready");
  });
});

describe("<Delayed>", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function Region({ pending }: { readonly pending: boolean }) {
    return (
      <Delayed
        pending={pending}
        label="Loading the meeting list."
        fallback={<div data-testid="skeleton" />}
      >
        {() => <p>The meetings</p>}
      </Delayed>
    );
  }

  it("renders nothing visible for the first 150 ms, and marks the region busy", () => {
    const { container } = render(<Region pending />);
    expect(screen.queryByTestId("skeleton")).toBeNull();
    expect(screen.queryByText("The meetings")).toBeNull();
    expect(container.querySelector("[aria-busy='true']")).not.toBeNull();
  });

  it("shows the skeleton after 150 ms, and announces what is loading", () => {
    render(<Region pending />);
    advance(LOADING_THRESHOLD_MS);
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Loading the meeting list.");
  });

  it("keeps the skeleton for 350 ms after it appeared, then cross-fades the content in", () => {
    const { rerender, container } = render(<Region pending />);
    advance(LOADING_THRESHOLD_MS);
    rerender(<Region pending={false} />);
    // The data is here, but the skeleton has only been up for 0 ms: it stays.
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    expect(screen.queryByText("The meetings")).toBeNull();
    advance(LOADING_MIN_VISIBLE_MS);
    expect(screen.getByText("The meetings")).toBeInTheDocument();
    expect(container.querySelector("[data-loading-phase='ready']")?.className).toMatch(/fade-in/);
  });

  // A PRODUCT MAY REPLACE THE BASE'S FADE (Tenure's rows rise in turn instead), and it needs
  // a stable hook to do that on, not the fade's utility class names.
  it("marks content that replaced a skeleton as a hand-over, and only that content", () => {
    const { rerender, container } = render(<Region pending />);
    advance(LOADING_THRESHOLD_MS);
    rerender(<Region pending={false} />);
    advance(LOADING_MIN_VISIBLE_MS);
    expect(container.querySelector("[data-loading-phase='ready']")).toHaveAttribute(
      "data-handover",
      "skeleton",
    );

    const fast = render(<Region pending />);
    advance(100);
    fast.rerender(<Region pending={false} />);
    expect(fast.container.querySelector("[data-loading-phase='ready']")).not.toHaveAttribute(
      "data-handover",
    );
  });

  it("content that lands inside 150 ms appears with no entrance at all", () => {
    const { rerender, container } = render(<Region pending />);
    advance(100);
    rerender(<Region pending={false} />);
    expect(screen.getByText("The meetings")).toBeInTheDocument();
    expect(screen.queryByTestId("skeleton")).toBeNull();
    expect(container.querySelector("[data-loading-phase='ready']")?.className ?? "").not.toMatch(
      /fade-in/,
    );
  });

  it("does not call a function child until the gate says the content is there", () => {
    const child = vi.fn(() => <p>The meetings</p>);
    const { rerender } = render(
      <Delayed pending label="Loading." fallback={null}>
        {child}
      </Delayed>,
    );
    advance(1000);
    expect(child).not.toHaveBeenCalled();
    rerender(
      <Delayed pending={false} label="Loading." fallback={null}>
        {child}
      </Delayed>,
    );
    advance(LOADING_MIN_VISIBLE_MS);
    expect(child).toHaveBeenCalled();
  });
});

/**
 * LANDED CONTENT IS MOUNTED ONCE (tenure-v0.3.18's hosted run). The 150 ms timer used to be
 * cleared in a passive effect, which React runs in a task AFTER the commit that draws the
 * content. On a loaded machine that commit crosses 150 ms, the timer fires in the gap, raises the
 * skeleton over content already on screen and, 350 ms later, mounts the content a second time: a
 * flash, a replayed entrance, and lost focus or selection. Real timers, because the gap belongs
 * to the event loop and fake timers flush effects inside `act`, which closes it. The content's
 * render is slow on purpose: that is the loaded machine.
 */
describe("<Delayed> mounts landed content once", () => {
  const busy = (ms: number) => {
    const until = performance.now() + ms;
    while (performance.now() < until) {
      // Spin: a render this slow is what a loaded runner does to a cheap one.
    }
  };
  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  function Region({
    landsAt,
    renderCost,
  }: {
    readonly landsAt: number;
    readonly renderCost: number;
  }) {
    const [pending, setPending] = useState(true);
    useEffect(() => {
      const timer = setTimeout(() => setPending(false), landsAt);
      return () => clearTimeout(timer);
    }, [landsAt]);
    return (
      <Delayed pending={pending} label="Loading." fallback={<div data-testid="skeleton" />}>
        {() => {
          busy(renderCost);
          return <p>The meetings</p>;
        }}
      </Delayed>
    );
  }

  // Before 150 ms with a render that ends past it, at it, and after it (a real skeleton first).
  for (const [landsAt, renderCost] of [
    [120, 60],
    [140, 30],
    [LOADING_THRESHOLD_MS, 10],
    [200, 10],
  ] as const) {
    it(`keeps the first content node when it lands at ${landsAt} ms (render ${renderCost} ms)`, async () => {
      render(<Region landsAt={landsAt} renderCost={renderCost} />);
      const node = await screen.findByText("The meetings", undefined, { timeout: 2000 });
      await wait(LOADING_THRESHOLD_MS + LOADING_MIN_VISIBLE_MS + 100);
      expect(node.isConnected).toBe(true);
      expect(screen.getByText("The meetings")).toBe(node);
    });
  }
});
