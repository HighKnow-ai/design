/**
 * The package's public shape (`package.json`): every `exports` target exists once built,
 * is shipped by `files`, and the entries hold what they promise. `pnpm test` builds first
 * (`tsc -b && vitest run`), so `dist/` is the real output here.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PACKAGE_ROOT } from "./css-tokens.js";

interface Manifest {
  readonly name: string;
  readonly license: string;
  readonly exports: Record<string, string | { types: string; default: string }>;
  readonly files: readonly string[];
  readonly dependencies: Record<string, string>;
  readonly peerDependencies: Record<string, string>;
  readonly devDependencies: Record<string, string>;
}

const manifest = JSON.parse(
  readFileSync(resolve(PACKAGE_ROOT, "package.json"), "utf8"),
) as Manifest;

function targets(entry: string | { types: string; default: string }): string[] {
  return typeof entry === "string" ? [entry] : [entry.types, entry.default];
}

describe("package.json", () => {
  it("is the public, MIT @highknow/design", () => {
    expect(manifest.name).toBe("@highknow/design");
    expect(manifest.license).toBe("MIT");
    expect(existsSync(resolve(PACKAGE_ROOT, "LICENSE"))).toBe(true);
    expect(existsSync(resolve(PACKAGE_ROOT, "CHANGELOG.md"))).toBe(true);
  });

  it("points every export at a file that exists, and ships it", () => {
    for (const [subpath, entry] of Object.entries(manifest.exports)) {
      for (const target of targets(entry)) {
        const concrete = target.replace("*", "button");
        expect(existsSync(resolve(PACKAGE_ROOT, concrete)), `${subpath} -> ${concrete}`).toBe(true);
        const top = concrete.replace(/^\.\//, "").split("/")[0] ?? "";
        const shipped = top === "package.json" || manifest.files.includes(top);
        expect(shipped, `${subpath}: ${top} is not in "files"`).toBe(true);
      }
    }
  });

  it("depends on no other @highknow package, and pins its own dependencies exactly", () => {
    const all = {
      ...manifest.dependencies,
      ...manifest.peerDependencies,
      ...manifest.devDependencies,
    };
    const scoped = Object.keys(all).filter((name) => name.split("/")[0] === "@highknow");
    expect(scoped).toEqual([]);
    // `catalog:` is the workspace this package is developed in: a dependency it shares with other
    // packages there takes its version from one pnpm catalog, whose entries are exact versions, and
    // the published package.json carries that version in its place. A range is refused either way.
    for (const [name, spec] of Object.entries(manifest.dependencies)) {
      expect(spec, name).toMatch(/^(\d+\.\d+\.\d+|catalog:)$/);
    }
  });
});

describe("the entries", () => {
  it("keeps the marketing parts out of the root entry an app imports", async () => {
    const root = await import("../src/index.js");
    const marketing = await import("../src/marketing.js");
    for (const name of Object.keys(marketing)) expect(root).not.toHaveProperty(name);
    expect(marketing).toHaveProperty("SiteHeader");
  });

  it("exports all 38 primitives with Tenure's Skeleton and Sidebar", async () => {
    const root = await import("../src/index.js");
    for (const name of [
      "AlertDialog",
      "Alert",
      "Badge",
      "Breadcrumb",
      "ButtonGroup",
      "Button",
      "Card",
      "Checkbox",
      "Collapsible",
      "Command",
      "Dialog",
      "DropdownMenu",
      "Empty",
      "Field",
      "HoverCard",
      "InputGroup",
      "Input",
      "Item",
      "Kbd",
      "Label",
      "Popover",
      "Progress",
      "RadioGroup",
      "ScrollArea",
      "Select",
      "Separator",
      "Sheet",
      "Sidebar",
      "Skeleton",
      "Toaster",
      "Spinner",
      "Switch",
      "Table",
      "Tabs",
      "Textarea",
      "ToggleGroup",
      "Toggle",
      "Tooltip",
    ]) {
      expect(root, name).toHaveProperty(name);
    }
  });
});
