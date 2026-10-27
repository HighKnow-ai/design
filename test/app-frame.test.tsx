/**
 * The app frame as parts, not a fixed shell (#616 point 3): the sidebar frame, the top bar (title,
 * count, one primary action) and the page body (width and rhythm). Tenure composes its sidebar app
 * from all three; Flywheel takes the top bar and the page body and keeps its andon strip.
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Inbox } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import {
  Button,
  NavGroup,
  NavItem,
  PageBody,
  SidebarFrame,
  SidebarTrigger,
  TopBar,
} from "../src/index.js";

function Frame({ storageKey }: { readonly storageKey?: string }) {
  return (
    <SidebarFrame
      brand={<span>Tenure</span>}
      storageKey={storageKey}
      nav={
        <NavGroup label="Knowledge">
          <NavItem href="/meetings" label="Meetings" icon={<Inbox />} active />
          <NavItem href="/review" label="Review queue" badge={3} badgeAnnouncement="(3 new)" />
        </NavGroup>
      }
      footer={<span>Account</span>}
    >
      <TopBar
        leading={<SidebarTrigger label="Show or hide the navigation" />}
        title="Meetings"
        count="12 meetings"
        action={<Button>Record</Button>}
      />
      <PageBody>
        <p>Body</p>
      </PageBody>
    </SidebarFrame>
  );
}

describe("SidebarFrame, NavGroup and NavItem", () => {
  it("is a navigation landmark with the brand, the groups and the foot", () => {
    render(<Frame />);
    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(nav).toHaveTextContent("Tenure");
    expect(nav).toHaveTextContent("Knowledge");
    expect(nav).toHaveTextContent("Account");
  });

  it("marks the current row, and announces a row's badge after its label", () => {
    render(<Frame />);
    expect(screen.getByRole("link", { name: /Meetings/ })).toHaveAttribute("aria-current", "page");
    const review = screen.getByRole("link", { name: /Review queue/ });
    expect(review).not.toHaveAttribute("aria-current");
    expect(review).toHaveTextContent("(3 new)");
  });

  it("remembers the viewer's fold under the key it is given", async () => {
    render(<Frame storageKey="test.sidebar" />);
    await userEvent.click(screen.getByRole("button", { name: "Show or hide the navigation" }));
    expect(window.localStorage.getItem("test.sidebar")).toBe("collapsed");
  });

  it("hands a row to the router's link when one is given, and calls onSelect instead of following", async () => {
    const onSelect = vi.fn();
    render(
      <SidebarFrame
        nav={
          <NavItem
            href="/ask"
            label="Ask"
            onSelect={onSelect}
            renderLink={(props) => <a data-router-link="" {...props} />}
          />
        }
      >
        <p>Body</p>
      </SidebarFrame>,
    );
    const link = screen.getByRole("link", { name: "Ask" });
    expect(link).toHaveAttribute("data-router-link");
    await userEvent.click(link);
    expect(onSelect).toHaveBeenCalledOnce();
  });
});

describe("TopBar", () => {
  it("names the page in an h1, with its count and its one action", () => {
    render(<Frame />);
    expect(screen.getByRole("heading", { level: 1, name: "Meetings" })).toBeInTheDocument();
    expect(screen.getByText("12 meetings")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Record" })).toBeInTheDocument();
  });

  it("gives a truncating title its full value as a tooltip", () => {
    render(<TopBar title="Acme Corporation renewal, second half" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveAttribute(
      "title",
      "Acme Corporation renewal, second half",
    );
  });

  it("names the page's section while the page has no title yet, and never as the h1", () => {
    const { rerender } = render(<TopBar section="Knowledge" />);
    const bar = screen.getByRole("banner");
    expect(bar).toHaveTextContent("Knowledge");
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
    rerender(<TopBar section="Knowledge" title="Acme renewal" />);
    expect(bar).not.toHaveTextContent("Knowledge");
    expect(screen.getByRole("heading", { level: 1, name: "Acme renewal" })).toBeInTheDocument();
  });

  it("stands alone, outside any sidebar frame", () => {
    render(<TopBar title="Board" className="bg-card" />);
    const heading = screen.getByRole("heading", { level: 1, name: "Board" });
    expect(heading.closest("header")?.className).toContain("bg-card");
  });
});

describe("PageBody", () => {
  it("sets the reading width by default and draws the body on one card when asked", () => {
    render(
      <PageBody surface="card">
        <p>Inside</p>
      </PageBody>,
    );
    const body = screen.getByText("Inside").closest("[data-slot='page-body']");
    expect(body).toHaveAttribute("data-width", "reading");
    expect(body).toHaveAttribute("data-surface", "card");
    expect(screen.getByText("Inside").parentElement?.className).toContain("bg-card");
  });

  it("takes a wider measure and a className", () => {
    render(
      <PageBody width="wide" className="pt-8">
        <p>Wide</p>
      </PageBody>,
    );
    const body = screen.getByText("Wide").closest("[data-slot='page-body']");
    expect(body).toHaveAttribute("data-width", "wide");
    expect(body?.className).toContain("pt-8");
    expect(body?.className).not.toContain("pt-1");
  });
});
