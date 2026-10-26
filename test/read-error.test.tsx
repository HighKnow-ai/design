/**
 * One ReadError for both products (#616): they differed only in where the raw message goes.
 * Tenure's readers are not developers, so it travels in `title=` and never reaches the page;
 * Flywheel's are, so it folds behind a disclosure. One prop picks.
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ReadError } from "../src/index.js";

const failure = new Error("GET /meetings 503: upstream timed out");

describe("ReadError", () => {
  it("keeps the raw message off the page by default, in the title attribute", () => {
    render(<ReadError title="The meeting list could not be loaded." error={failure} />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("The meeting list could not be loaded.");
    expect(alert).not.toHaveTextContent("upstream timed out");
    expect(alert).toHaveAttribute("title", failure.message);
  });

  it("folds the raw message behind a disclosure when asked", async () => {
    render(
      <ReadError
        title="Couldn't load this Story"
        error={failure}
        rawMessage="disclosure"
        detailsLabel="Details"
      />,
    );
    const alert = screen.getByRole("alert");
    expect(alert).not.toHaveAttribute("title");
    expect(screen.queryByText(failure.message)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Details" }));
    expect(screen.getByText(failure.message)).toBeInTheDocument();
  });

  it("offers the retry it is given, pending while it runs", async () => {
    const onRetry = vi.fn();
    const { rerender } = render(
      <ReadError title="Failed" onRetry={onRetry} retryLabel="Try again" />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();

    rerender(<ReadError title="Failed" onRetry={onRetry} retryLabel="Try again" retrying />);
    expect(screen.getByRole("button", { name: /Try again/ })).toHaveAttribute("aria-busy", "true");
  });

  it("has no button when there is nothing to retry", () => {
    render(<ReadError title="Not yours" description="" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
