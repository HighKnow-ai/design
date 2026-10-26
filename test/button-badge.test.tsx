/**
 * Button and Badge ship the neutral tones only, and a product extends them with its own (#615
 * point 7, #616): Flywheel adds `attention`, and no base carries it for Tenure to promise never to
 * use. The extension is a typed factory, so a variant the product did not add is a compile error.
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Badge, Button, createBadge, createButton } from "../src/index.js";

describe("Button", () => {
  it("ships the neutral set and no product tone", () => {
    render(<Button variant="neutral">Deny</Button>);
    const button = screen.getByRole("button", { name: "Deny" });
    expect(button).toHaveAttribute("data-variant", "neutral");
    expect(button.className).toContain("bg-foreground");
    expect(button.className).not.toContain("attention");
  });

  it("takes a product's own tone through createButton, and keeps the base ones", () => {
    const FlywheelButton = createButton({
      attention: "bg-attention text-attention-foreground hover:bg-attention/90",
    });
    render(
      <>
        <FlywheelButton variant="attention">Answer</FlywheelButton>
        <FlywheelButton variant="outline">Later</FlywheelButton>
      </>,
    );
    const answer = screen.getByRole("button", { name: "Answer" });
    expect(answer).toHaveAttribute("data-variant", "attention");
    expect(answer.className).toContain("bg-attention");
    expect(screen.getByRole("button", { name: "Later" }).className).toContain("border-input");
  });

  it("refuses at compile time a tone nobody added", () => {
    // @ts-expect-error `attention` is Flywheel's, not the base's.
    render(<Button variant="attention">Answer</Button>);
  });

  it("swallows presses while loading and says it is busy", async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: /Save/ });
    expect(button).toHaveAttribute("aria-busy", "true");
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("Badge", () => {
  it("ships the neutral tones and takes a product's own through createBadge", () => {
    const FlywheelBadge = createBadge({ attention: "bg-attention font-bold" });
    render(
      <>
        <Badge variant="running">Running</Badge>
        <FlywheelBadge variant="attention">Waiting on you</FlywheelBadge>
      </>,
    );
    expect(screen.getByText("Running").className).toContain("bg-running-muted");
    const waiting = screen.getByText("Waiting on you");
    expect(waiting).toHaveAttribute("data-variant", "attention");
    expect(waiting.className).toContain("bg-attention");
  });

  it("lets a className win over the tone's own classes", () => {
    render(
      <Badge variant="neutral" className="bg-card">
        Draft
      </Badge>,
    );
    const badge = screen.getByText("Draft");
    expect(badge.className).toContain("bg-card");
    expect(badge.className).not.toContain("bg-secondary");
  });
});
