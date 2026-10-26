/**
 * A CONSUMER GETS THE PACKAGE'S CLASSES WITHOUT NAMING THEM (#614 § Tailwind 4, #620).
 *
 * `css/theme.css` carries `@source "../dist"`, so an app that imports the theme has Tailwind
 * scan the package's compiled components, and writes no `@source` of its own. Tailwind documents
 * `@source` as "relative to the stylesheet", but not that this holds for a stylesheet inside an
 * installed or linked package. The mechanics research verified it by hand on Tailwind 4.3.3; this
 * test keeps it verified across upgrades, because the failure is silent: the components render
 * unstyled and nothing throws.
 *
 * The consumer is built the way `@tailwindcss/vite` builds one (`compile`, then an oxide
 * `Scanner` over the compiler's root and `@source`s, then `build`), in a scratch directory that
 * links the package in as `node_modules/@highknow/design`, as pnpm links a workspace member and
 * as npm installs it. Its own content is one file with no classes at all, so every utility in the
 * output came from the package.
 *
 * THE NEGATIVE CONTROL is the same consumer without the theme import: if it also produced the
 * classes, the scan would be finding them some other way, and the positive result would prove
 * nothing.
 */
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { compile } from "@tailwindcss/node";
import { Scanner } from "@tailwindcss/oxide";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

let consumer: string;

beforeAll(() => {
  consumer = mkdtempSync(join(tmpdir(), "design-consumer-"));
  mkdirSync(join(consumer, "node_modules", "@highknow"), { recursive: true });
  symlinkSync(PACKAGE_ROOT, join(consumer, "node_modules", "@highknow", "design"), "dir");
  symlinkSync(
    join(PACKAGE_ROOT, "node_modules", "tailwindcss"),
    join(consumer, "node_modules", "tailwindcss"),
    "dir",
  );
  writeFileSync(join(consumer, "index.html"), "<!doctype html><div id=root></div>\n");
});

afterAll(() => {
  rmSync(consumer, { recursive: true, force: true });
});

async function buildConsumer(css: string): Promise<string> {
  const compiler = await compile(css, { base: consumer, onDependency: () => {} });
  const root =
    compiler.root === "none"
      ? []
      : compiler.root === null
        ? [{ base: consumer, pattern: "**/*", negated: false }]
        : [{ ...compiler.root, negated: false }];
  const scanner = new Scanner({ sources: [...root, ...compiler.sources] });
  return compiler.build(scanner.scan());
}

/** Utilities that only the package's compiled components say, each from a different file. */
const FROM_THE_PACKAGE = [
  ".h-8\\.5", // button.tsx: the 34 px control height
  ".bg-running-muted", // badge.tsx: the running tone, a base role
  ".text-section", // card.tsx: a step of the base's type scale
  ".bg-border\\/55", // skeleton.tsx: Tenure's quieter skeleton
];

describe("@source inside the package", () => {
  it("gives a consumer the classes its components use, with no @source of its own", async () => {
    const css = await buildConsumer(
      '@import "tailwindcss";\n@import "@highknow/design/theme.css";\n',
    );
    for (const selector of FROM_THE_PACKAGE) expect(css).toContain(selector);
  });

  it("produces none of them without the theme (negative control)", async () => {
    const css = await buildConsumer('@import "tailwindcss";\n');
    for (const selector of FROM_THE_PACKAGE) expect(css).not.toContain(selector);
  });
});
