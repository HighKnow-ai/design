/**
 * The marketing parts, a separate entry an app never imports: the site
 * header, the footer, the section band, the hero, the feature grid and the call to action. Every
 * word is passed in, and every part takes `className` cleanly: a passed class wins over the part's
 * own, which is the defect the marketing prototype found in the shared `Wordmark` and
 * `LanguageSwitcher`.
 */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import {
  CallToAction,
  FeatureGrid,
  FooterColumn,
  Hero,
  HeroIndex,
  Section,
  SiteFooter,
  SiteHeader,
} from "../src/marketing.js";
import { Wordmark } from "../src/index.js";

function Header() {
  return (
    <SiteHeader
      brand={
        <a href="/" aria-label="HighKnow">
          <Wordmark />
        </a>
      }
      nav={<a href="/tenure">Tenure</a>}
      actions={<a href="/sign-in">Sign in</a>}
    />
  );
}

describe("SiteHeader", () => {
  // jsdom's `window.scrollY` is a plain own property, and a test scrolls by redefining it. The
  // redefinition outlives the test unless it is put back: under a shuffled order "stays open when
  // asked not to condense" ran first and left 200, so the next test's header started condensed
  // instead. Each test therefore scrolls through `scrollTo`, and the original comes back after it.
  const originalScrollY = Object.getOwnPropertyDescriptor(window, "scrollY");
  const scrollTo = (y: number) => {
    Object.defineProperty(window, "scrollY", { configurable: true, value: y });
    fireEvent.scroll(window);
  };
  afterEach(() => {
    if (originalScrollY) Object.defineProperty(window, "scrollY", originalScrollY);
    else Reflect.deleteProperty(window, "scrollY");
  });

  it("works fully with no JavaScript: rendered on the server, it is the open header", () => {
    const html = renderToStaticMarkup(<Header />);
    expect(html).toContain('data-condensed="false"');
    expect(html).toContain('href="/tenure"');
    expect(html).toContain('href="/sign-in"');
  });

  it("condenses once the page scrolls, and opens again at the top", () => {
    render(<Header />);
    const header = screen.getByRole("banner");
    expect(header).toHaveAttribute("data-condensed", "false");
    act(() => scrollTo(200));
    expect(header).toHaveAttribute("data-condensed", "true");
    act(() => scrollTo(0));
    expect(header).toHaveAttribute("data-condensed", "false");
  });

  it("stays open when asked not to condense", () => {
    render(<SiteHeader brand={<span>HighKnow</span>} condense={false} />);
    act(() => scrollTo(200));
    expect(screen.getByRole("banner")).toHaveAttribute("data-condensed", "false");
  });
});

describe("Hero", () => {
  it("is the page's h1 on the display ramp, its second sentence in italic", () => {
    render(
      <Hero
        headline="AI will not slow down."
        headlineAccent="You can keep up."
        intro="We build the tools."
        index={
          <HeroIndex
            label="The path"
            items={[
              { scope: "In the room", name: "Tenure", href: "/tenure" },
              { scope: "On the roadmap", name: "Flywheel", href: "/flywheel" },
            ]}
          />
        }
      />,
    );
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.className).toContain("text-display-1");
    expect(heading).toHaveTextContent("AI will not slow down. You can keep up.");
    expect(screen.getByText("You can keep up.").className).toContain("italic");
    expect(screen.getByText("We build the tools.").className).toContain("leading-prose");
    const index = screen.getByRole("navigation", { name: "The path" });
    expect(index).toHaveTextContent("In the room");
    expect(screen.getByRole("link", { name: /Flywheel/ })).toHaveAttribute("href", "/flywheel");
  });
});

describe("Section, FeatureGrid and CallToAction", () => {
  it("draws a tinted band on --muted and a page band on the page", () => {
    render(
      <>
        <Section tone="muted" aria-label="Tinted">
          <p>Inside</p>
        </Section>
        <Section aria-label="Plain">
          <p>Plain</p>
        </Section>
      </>,
    );
    expect(screen.getByRole("region", { name: "Tinted" }).className).toContain("bg-muted");
    expect(screen.getByRole("region", { name: "Plain" }).className).not.toContain("bg-muted");
  });

  it("lists features with their titles and lines", () => {
    render(
      <FeatureGrid
        items={[
          { title: "Cards", body: "Short, at the right moment." },
          { title: "Claims", body: "With their source." },
        ]}
      />,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("heading", { name: "Claims" })).toBeInTheDocument();
  });

  it("is a heading, a line and its actions", () => {
    render(
      <CallToAction
        title="Try Tenure"
        body="Free for a month."
        actions={<a href="/download">Download</a>}
      />,
    );
    expect(screen.getByRole("heading", { name: "Try Tenure" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Download" })).toBeInTheDocument();
  });
});

describe("SiteFooter", () => {
  it("is the column footer: an aside, then titled columns", () => {
    render(
      <SiteFooter aside={<p>HighKnow SAS</p>}>
        <FooterColumn title="Company">
          <a href="/practice">The practice</a>
        </FooterColumn>
        <FooterColumn title="Legal">
          <a href="/legal">Legal notice</a>
        </FooterColumn>
      </SiteFooter>,
    );
    expect(screen.getByRole("contentinfo")).toHaveTextContent("HighKnow SAS");
    expect(screen.getByRole("heading", { name: "Company" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Legal" })).toBeInTheDocument();
  });
});

describe("every part takes className cleanly", () => {
  it("lets a passed class win over the part's own", () => {
    const { container } = render(
      <>
        <SiteHeader brand={<span>b</span>} className="hidden" />
        <SiteFooter className="hidden">{null}</SiteFooter>
        <Section className="hidden">{null}</Section>
        <Hero headline="h" className="hidden" />
        <FeatureGrid items={[]} className="hidden" />
        <CallToAction title="t" className="hidden" />
      </>,
    );
    const roots = Array.from(container.children);
    expect(roots).toHaveLength(6);
    for (const root of roots) {
      const classes = root.className.split(" ");
      expect(classes).toContain("hidden");
      for (const display of ["flex", "grid", "block", "inline-flex"]) {
        expect(classes).not.toContain(display);
      }
    }
  });
});
