/**
 * The shared composites, each through its public props. Every visible word in these
 * tests is passed in: the package carries no product copy.
 */
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Inbox, Trash2 } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import {
  Button,
  ConfirmDestructive,
  createIconSet,
  EmptyState,
  formatRelativeTime,
  MISSING,
  notify,
  RelativeTime,
  Tip,
  Toaster,
  TooltipProvider,
} from "../src/index.js";

describe("EmptyState", () => {
  it("is a heading, one line and no action unless one is given", () => {
    render(<EmptyState heading="No meetings yet" body="Recorded meetings appear here." />);
    expect(screen.getByText("No meetings yet")).toBeInTheDocument();
    expect(screen.getByText("Recorded meetings appear here.")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("carries at most one action, by its label", async () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        heading="No meetings yet"
        body="Recorded meetings appear here."
        action={{ label: "Record a meeting", onAction }}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Record a meeting" }));
    expect(onAction).toHaveBeenCalledOnce();
  });
});

describe("ConfirmDestructive", () => {
  function Drop({ onConfirm }: { readonly onConfirm: () => unknown }) {
    return (
      <ConfirmDestructive
        trigger={<Button variant="destructive">Drop</Button>}
        title="Drop FLY-12?"
        description="The Story leaves the board."
        confirmLabel="Drop the Story"
        cancelLabel="Keep it"
        icon={<Trash2 aria-hidden="true" />}
        onConfirm={onConfirm}
      />
    );
  }

  it("asks, then runs the action named by its verb and closes", async () => {
    const onConfirm = vi.fn();
    render(<Drop onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole("button", { name: "Drop" }));
    expect(screen.getByRole("alertdialog", { name: "Drop FLY-12?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Keep it" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Drop the Story" }));
    expect(onConfirm).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });

  it("stays open with the failure's own message when the action fails", async () => {
    render(<Drop onConfirm={() => Promise.reject(new Error("The worktree is locked."))} />);
    await userEvent.click(screen.getByRole("button", { name: "Drop" }));
    await userEvent.click(screen.getByRole("button", { name: "Drop the Story" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("The worktree is locked.");
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });
});

describe("Tip", () => {
  it("renders the child alone when there is nothing to say", () => {
    render(
      <TooltipProvider>
        <Tip content="">
          <span>12 claims</span>
        </Tip>
      </TooltipProvider>,
    );
    expect(screen.getByText("12 claims")).not.toHaveAttribute("data-state");
  });
});

describe("RelativeTime", () => {
  const now = Date.parse("2026-10-26T12:00:00Z");

  it("reads at a glance, in the reader's language, from the platform's own words", () => {
    expect(formatRelativeTime(now - 3 * 60_000, now, "en")).toBe("3m ago");
    expect(formatRelativeTime(now - 2 * 3_600_000, now, "en")).toBe("2h ago");
    expect(formatRelativeTime(now, now, "en")).toBe("now");
    expect(formatRelativeTime(now - 3 * 60_000, now, "fr")).not.toBe("3m ago");
  });

  it("is a <time> with its machine-readable instant", () => {
    render(
      <TooltipProvider>
        <RelativeTime at={now - 3 * 60_000} now={now} locale="en" />
      </TooltipProvider>,
    );
    const time = screen.getByText("3m ago");
    expect(time.tagName).toBe("TIME");
    expect(time).toHaveAttribute("dateTime", new Date(now - 3 * 60_000).toISOString());
  });

  it("is the dash when the time cannot be read", () => {
    render(<RelativeTime at="not a date" />);
    expect(screen.getByText(MISSING)).toBeInTheDocument();
  });
});

describe("createIconSet", () => {
  const { Icon, isIconName } = createIconSet({ Inbox });

  it("draws a registered glyph by name, decorative, at the 2px stroke", () => {
    const { container } = render(<Icon name="Inbox" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("stroke-width", "2");
    expect(isIconName("Inbox")).toBe(true);
  });

  it("draws nothing for a name that arrived as data and is not registered", () => {
    const { container } = render(<Icon name="Bogus" />);
    expect(container).toBeEmptyDOMElement();
    expect(isIconName("Bogus")).toBe(false);
  });
});

describe("Toaster and notify", () => {
  it("shows an outcome bottom-right, with a next step named by its label", async () => {
    const undo = vi.fn();
    render(<Toaster />);
    act(() => {
      notify.success("Story moved to E-3", { action: { label: "Undo", onClick: undo } });
    });
    const toast = (await screen.findByText("Story moved to E-3")).closest("[data-sonner-toast]");
    expect(toast).toHaveAttribute("data-y-position", "bottom");
    expect(toast).toHaveAttribute("data-x-position", "right");
    await userEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(undo).toHaveBeenCalledOnce();
  });

  it("says a failure with its own message as the line beneath", async () => {
    render(<Toaster />);
    act(() => {
      notify.error("Couldn't merge FLY-12", { error: new Error("Conflict in main.rs") });
    });
    expect(await screen.findByText("Conflict in main.rs")).toBeInTheDocument();
  });
});
