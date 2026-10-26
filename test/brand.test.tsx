/**
 * The mark and the language switcher (#616), and #617's finding: the shared `Wordmark` and
 * `LanguageSwitcher` hard-set `inline-flex`, so a responsive `hidden` passed through `className`
 * lost and the apex had to wrap them. Here a passed class wins over the part's own.
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AppIcon, LanguageSwitcher, Wordmark } from "../src/index.js";

const LOCALES = [
  { value: "en", label: "EN" },
  { value: "fr", label: "FR" },
] as const;

describe("Wordmark", () => {
  it("is the mark and the name, the mark painted in the pinned brand hex", () => {
    const { container } = render(<Wordmark />);
    expect(screen.getByTestId("wordmark")).toHaveTextContent("HighKnow");
    expect(container.querySelector("rect")).toHaveAttribute("fill", "#3c64dd");
  });

  it("is an image named for the brand when drawn as the mark alone", () => {
    render(<Wordmark markOnly />);
    expect(screen.getByRole("img", { name: "HighKnow" })).toBeInTheDocument();
  });

  it("lets a passed display class win over its own inline-flex", () => {
    render(<Wordmark className="hidden sm:inline-flex" />);
    const root = screen.getByTestId("wordmark");
    expect(root.className.split(" ")).toContain("hidden");
    expect(root.className.split(" ")).not.toContain("inline-flex");
  });

  it("marks its name so a condensing header can fold it away", () => {
    render(<Wordmark />);
    expect(screen.getByText("HighKnow")).toHaveAttribute("data-wordmark-name");
  });
});

describe("LanguageSwitcher", () => {
  it("renders the locales it is given and reports the value, never the label", async () => {
    const onSelect = vi.fn();
    render(<LanguageSwitcher locales={LOCALES} active="en" onSelect={onSelect} />);
    expect(screen.getByRole("group", { name: "Language" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "FR" }));
    expect(onSelect).toHaveBeenCalledWith("fr");
  });

  it("carries the active choice by weight as well as colour", () => {
    render(<LanguageSwitcher locales={LOCALES} active="fr" onSelect={() => {}} />);
    const en = screen.getByRole("button", { name: "EN" });
    const fr = screen.getByRole("button", { name: "FR" });
    expect(fr).toHaveAttribute("aria-pressed", "true");
    expect(getComputedStyle(fr).fontWeight).not.toBe(getComputedStyle(en).fontWeight);
  });

  it("switches with plain links and no JavaScript in its link form", () => {
    const html = renderToStaticMarkup(
      <LanguageSwitcher locales={LOCALES} active="en" hrefFor={(locale) => `/${locale}`} />,
    );
    expect(html).toContain('href="/fr"');
    expect(html).toContain('aria-current="true"');
    expect(html).not.toContain("<button");
  });

  it("lets a passed display class win, and takes its accessible name as a prop", () => {
    render(
      <LanguageSwitcher
        locales={LOCALES}
        active="en"
        onSelect={() => {}}
        label="Langue"
        className="hidden"
      />,
    );
    const group = screen.getByRole("group", { hidden: true, name: "Langue" });
    expect(group.className.split(" ")).toContain("hidden");
    expect(group.className.split(" ")).not.toContain("inline-flex");
  });
});

describe("AppIcon", () => {
  it("draws the tile each platform crops, as a standalone SVG", () => {
    const html = renderToStaticMarkup(<AppIcon tile="macos" />);
    expect(html).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(html).toContain('width="824"');
  });
});
