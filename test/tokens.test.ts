/**
 * The base's values, held to the decisions that set them (#615, #617) and to the contrast floors
 * the products already enforced (Tenure's `contrast.test.ts`, Flywheel's `theme/__tests__`).
 * Expected values are the decisions' own numbers, written out, never read back from the CSS.
 */
import { describe, expect, it } from "vitest";
import { contrast, readCss, readTokens } from "./css-tokens.js";

const tokens = readTokens();
const schemes = ["light", "dark"] as const;

describe("the base's values (#615, #617)", () => {
  it("pins the primary, hsl(225, 70%, 55%), in both schemes, with #7d99ff as the dark lift", () => {
    expect(tokens.color.light.primary).toBe("#3c64dd");
    expect(tokens.color.dark.primary).toBe("#3c64dd");
    expect(tokens.color.dark.running).toBe("#7d99ff");
    expect(tokens.color.dark.ring).toBe("#7d99ff");
  });

  it("carries Tenure's --running-muted-foreground and none of Flywheel's own roles", () => {
    expect(tokens.color.light["running-muted-foreground"]).toBe("#43506f");
    expect(tokens.color.dark["running-muted-foreground"]).toBe("#a9b4d6");
    for (const role of ["attention", "strip", "lamp", "diff-insert", "chart-1", "recording"]) {
      expect(tokens.color.light).not.toHaveProperty(role);
    }
  });

  it("leaves out Flywheel's --space-* and radius aliases", () => {
    const css = readCss("theme");
    expect(css).not.toMatch(/--space-\w+:/);
    expect(css).not.toMatch(/--radius-(control|chip):/);
  });

  it("defines --font-heading as the UI face, JetBrains Mono as the code face", () => {
    expect(readCss("theme")).toMatch(/--font-heading: var\(--font-ui\);/);
    expect(tokens.font["font-code"]).toMatch(/^"JetBrains Mono"/);
    expect(tokens.font["font-ui"]).toMatch(/^"Public Sans Variable"/);
  });

  it("follows each face with a fallback sized to it, so the font swap moves no text (#639)", () => {
    expect(tokens.font["font-ui"]).toMatch(/^"Public Sans Variable", "Public Sans Fallback",/);
    expect(tokens.font["font-code"]).toMatch(/^"JetBrains Mono", "JetBrains Mono Fallback",/);
    const fonts = readCss("fonts");
    // The measured values from `fonts.css`'s header, written out.
    for (const [family, size, ascent, descent] of [
      ["Public Sans Fallback", "103.13%", "92.11%", "21.82%"],
      ["JetBrains Mono Fallback", "99.7%", "102.31%", "30.09%"],
    ] as const) {
      const face = fonts.split("@font-face").find((block) => block.includes(`"${family}"`)) ?? "";
      expect(face, family).toContain(`size-adjust: ${size};`);
      expect(face, family).toContain(`ascent-override: ${ascent};`);
      expect(face, family).toContain(`descent-override: ${descent};`);
      expect(face, family).toContain("line-gap-override: 0%;");
    }
  });

  it("has the nine UI steps, the 20 px lead step, and the 52 px step renamed lead-count", () => {
    const sizes = Object.fromEntries(
      Object.entries(tokens.text).map(([step, { size }]) => [step, size]),
    );
    expect(sizes).toMatchObject({
      meta: "12px",
      small: "13px",
      body: "14px",
      row: "15px",
      section: "17px",
      lead: "20px",
      title: "24px",
      milestone: "26px",
      count: "34px",
      "lead-count": "52px",
    });
  });

  it("has a prose leading of 1.65 and a three-step fluid display ramp", () => {
    expect(tokens.leading.prose).toBe("1.65");
    for (const step of ["display-1", "display-2", "display-3"]) {
      expect(tokens.text[step]?.size).toMatch(/^clamp\(/);
    }
    expect(tokens.text["display-1"]?.size).toContain("5.5rem");
  });

  it("has the one curve, its four durations and one breath, and three shadows plus the scrim", () => {
    expect(tokens.motion).toEqual({
      "ease-out-quint": "cubic-bezier(0.16, 1, 0.3, 1)",
      ease: "var(--ease-out-quint)",
      "duration-feedback": "120ms",
      "duration-state": "160ms",
      "duration-overlay": "260ms",
      "duration-overlay-exit": "180ms",
      // A wait that repeats (#639): Tenure's opening mark, 8 x overlay.
      "duration-breath": "2080ms",
    });
    for (const scheme of schemes) {
      expect(Object.keys(tokens.shadow[scheme]).sort()).toEqual([
        "scrim",
        "shadow-card",
        "shadow-overlay",
        "shadow-showcase",
      ]);
    }
  });

  it("defines every colour role in both schemes", () => {
    expect(Object.keys(tokens.color.dark).sort()).toEqual(Object.keys(tokens.color.light).sort());
  });
});

describe("contrast floors", () => {
  const AA_TEXT = 4.5;
  const NON_TEXT = 3;

  it.each(schemes)("%s: text on its grounds passes AA", (scheme) => {
    const c = tokens.color[scheme];
    const pairs: Array<[string, string, string]> = [
      ["foreground on background", c.foreground!, c.background!],
      ["foreground on card", c.foreground!, c.card!],
      ["muted-foreground on card", c["muted-foreground"]!, c.card!],
      ["muted-foreground on background", c["muted-foreground"]!, c.background!],
      ["subtle-foreground on card", c["subtle-foreground"]!, c.card!],
      ["primary-foreground on primary", c["primary-foreground"]!, c.primary!],
      ["running on card", c.running!, c.card!],
      ["running on running-muted", c.running!, c["running-muted"]!],
      [
        "running-muted-foreground on running-muted",
        c["running-muted-foreground"]!,
        c["running-muted"]!,
      ],
      ["destructive-text on card", c["destructive-text"]!, c.card!],
      ["destructive-foreground on destructive", c["destructive-foreground"]!, c.destructive!],
    ];
    for (const [name, fg, bg] of pairs) {
      expect(contrast(fg, bg), name).toBeGreaterThanOrEqual(AA_TEXT);
    }
  });

  it.each(schemes)(
    "%s: a control boundary and the ring pass 3:1 where they are drawn",
    (scheme) => {
      const c = tokens.color[scheme];
      // #615's defect: the apex's ghost button drew `--border` at 1.52:1. `--input` is the boundary.
      expect(contrast(c.input!, c.card!), "input on card").toBeGreaterThanOrEqual(NON_TEXT);
      expect(contrast(c.ring!, c.background!), "ring on background").toBeGreaterThanOrEqual(
        NON_TEXT,
      );
      expect(contrast(c.ring!, c.card!), "ring on card").toBeGreaterThanOrEqual(NON_TEXT);
    },
  );

  it("keeps the rule that no control sits on the light floor: --input there is under 3:1", () => {
    // Recorded, not a defect: controls sit on cards. If this ever passes 3:1, the rule can go.
    expect(contrast(tokens.color.light.input!, tokens.color.light.background!)).toBeLessThan(3);
  });
});
