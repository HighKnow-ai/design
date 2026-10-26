/**
 * Reads the base's tokens out of `css/theme.css`, the one place they are written. The tests hold
 * the values to the decisions and the contrast floors, and `tokens.json` (the export for a
 * consumer that is not Tailwind: the email signature renderer) is this read, written out.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function readCss(name: "theme" | "base" | "fonts"): string {
  return readFileSync(resolve(PACKAGE_ROOT, "css", `${name}.css`), "utf8");
}

function withoutComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/** The declarations of the top-level block whose selector line is exactly `selector {`. */
function block(css: string, selector: string): Record<string, string> {
  const code = withoutComments(css);
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`^${escaped} \\{([\\s\\S]*?)^\\}`, "m").exec(code);
  if (match === null) throw new Error(`theme.css has no top-level \`${selector} {\` block`);
  const declarations: Record<string, string> = {};
  for (const [, name, value] of (match[1] ?? "").matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    declarations[name as string] = (value as string).replace(/\s+/g, " ").trim();
  }
  return declarations;
}

const COLOUR = /^#[0-9a-f]{6}$/i;

function pick(
  declarations: Record<string, string>,
  keep: (name: string, value: string) => boolean,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(declarations).filter(([name, value]) => keep(name, value)),
  );
}

export interface Tokens {
  readonly color: { readonly light: Record<string, string>; readonly dark: Record<string, string> };
  readonly shadow: {
    readonly light: Record<string, string>;
    readonly dark: Record<string, string>;
  };
  readonly font: Record<string, string>;
  readonly radius: string;
  readonly motion: Record<string, string>;
  readonly text: Record<string, { readonly size: string; readonly lineHeight: string }>;
  readonly leading: Record<string, string>;
}

export function readTokens(css: string = readCss("theme")): Tokens {
  const light = block(css, ":root");
  const dark = block(css, ".dark");
  const theme = block(css, "@theme");
  const isShadow = (name: string) => name.startsWith("shadow-") || name === "scrim";

  const text: Record<string, { size: string; lineHeight: string }> = {};
  for (const [name, value] of Object.entries(theme)) {
    const step = /^text-([\w-]+?)$/.exec(name)?.[1];
    if (step === undefined || name.includes("--")) continue;
    text[step] = { size: value, lineHeight: theme[`text-${step}--line-height`] ?? "" };
  }

  return {
    color: {
      light: pick(light, (_name, value) => COLOUR.test(value)),
      dark: pick(dark, (_name, value) => COLOUR.test(value)),
    },
    shadow: {
      light: pick(light, isShadow),
      dark: pick(dark, isShadow),
    },
    font: pick(light, (name) => name.startsWith("font-")),
    radius: light.radius ?? "",
    motion: pick(light, (name) => name.startsWith("ease") || name.startsWith("duration-")),
    text,
    leading: Object.fromEntries(
      Object.entries(theme)
        .filter(([name]) => name.startsWith("leading-"))
        .map(([name, value]) => [name.slice("leading-".length), value]),
    ),
  };
}

/** WCAG 2.x relative luminance of a `#rrggbb` colour. */
function luminance(hex: string): number {
  const channels = [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16) / 255);
  const [r, g, b] = channels.map((c) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  ) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The WCAG 2.x contrast ratio between two `#rrggbb` colours. */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}
