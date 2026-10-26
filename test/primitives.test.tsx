/**
 * The two primitives Tenure's copies replace (#616): the Skeleton that stops under reduced motion,
 * and the Sidebar that remembers its fold and takes its labels.
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  Skeleton,
} from "../src/index.js";

describe("Skeleton", () => {
  it("draws on border/55 and stops pulsing under reduced motion", () => {
    const { container } = render(<Skeleton className="h-4 w-20" />);
    const skeleton = container.firstElementChild;
    expect(skeleton).toHaveAttribute("data-slot", "skeleton");
    expect(skeleton?.className).toContain("bg-border/55");
    expect(skeleton?.className).toContain("motion-reduce:animate-none");
  });
});

describe("Sidebar", () => {
  it("reads the remembered fold on its first frame", () => {
    window.localStorage.setItem("fold", "collapsed");
    const { container } = render(
      <SidebarProvider storageKey="fold">
        <Sidebar collapsible="icon">nav</Sidebar>
      </SidebarProvider>,
    );
    expect(container.querySelector("[data-state]")).toHaveAttribute("data-state", "collapsed");
  });

  it("writes the fold back, and names its trigger as told", async () => {
    render(
      <SidebarProvider storageKey="fold">
        <Sidebar collapsible="icon">nav</Sidebar>
        <SidebarTrigger label="Plier la navigation" />
      </SidebarProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Plier la navigation" }));
    expect(window.localStorage.getItem("fold")).toBe("collapsed");
  });
});

describe("DialogFooter", () => {
  it("draws a visible Close only with the caller's word", () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogTitle>Title</DialogTitle>
          <DialogFooter closeLabel="Fermer" />
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByRole("button", { name: "Fermer" })).toBeInTheDocument();
  });
});
