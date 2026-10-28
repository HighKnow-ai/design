/**
 * WHAT A SURFACE THAT IMPORTS ONLY `theme.css` GETS. Tenure's in-meeting overlay
 * imports the theme for its colours, type and motion, and never `base.css` or the `.dark` switch:
 * a `body` background would paint its transparent window, the reduced-motion rewrite would
 * override the rail's own, and a dark scheme the OS chose would change what a customer watching
 * the screen sees. So `theme.css` must declare tokens and utilities and paint nothing, and dark
 * must arrive only by a class the overlay never sets.
 *
 * The overlay's own test (in Tenure) asserts its CSS never imports `base.css`; this one
 * asserts the package's half of the contract.
 */
import { describe, expect, it } from "vitest";
import { readCss } from "./css-tokens.js";

const code = (name: "theme" | "base") => readCss(name).replace(/\/\*[\s\S]*?\*\//g, "");

describe("theme.css paints nothing", () => {
  const theme = code("theme");

  it("styles no element: no base layer, no html, body or universal rule", () => {
    expect(theme).not.toMatch(/@layer\s+base/);
    expect(theme).not.toMatch(/(^|[\s,}])(html|body|\*)\s*[,{]/m);
  });

  it("rewrites no motion: the reduced-motion block is base.css's", () => {
    expect(theme).not.toMatch(/prefers-reduced-motion/);
    expect(code("base")).toMatch(/prefers-reduced-motion: reduce/);
  });

  it("goes dark only by the .dark class, never by the OS preference on its own", () => {
    expect(theme).toMatch(/^\.dark \{/m);
    expect(theme).not.toMatch(/prefers-color-scheme/);
  });

  it("leaves the floor, the focus ring and the selection colour to base.css", () => {
    const base = code("base");
    expect(base).toMatch(/body \{\s*@apply bg-background/);
    expect(base).toMatch(/:focus-visible \{/);
    expect(base).toMatch(/::selection \{/);
  });
});
