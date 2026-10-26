/**
 * NO PRODUCT COPY IN THE PACKAGE (#616 point 5, #620). Every visible string is a prop; the only
 * exception is an English default for an accessible name, which a localised surface replaces.
 *
 * The scan parses every component with the TypeScript compiler and reads its JSX text: words
 * written as a child of an element, not passed in. Words inside an `sr-only` element are an
 * accessible name and pass. A word anywhere else is visible copy a surface could not translate,
 * and fails with its file and line. Parsed rather than matched by pattern, because a pattern over
 * TSX cannot tell `<span>Close</span>` from `Array<string>`.
 *
 * THE POSITIVE CONTROL runs the same detector over a planted sample, so a detector broken into
 * finding nothing cannot report the package clean.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "src");

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sources(path);
    return entry.name.endsWith(".tsx") ? [path] : [];
  });
}

/** Whether an element's own `className` literal says `sr-only`. */
function isScreenReaderOnly(element: ts.JsxElement): boolean {
  return element.openingElement.attributes.properties.some(
    (attribute) =>
      ts.isJsxAttribute(attribute) &&
      attribute.name.getText() === "className" &&
      attribute.initializer !== undefined &&
      /\bsr-only\b/.test(attribute.initializer.getText()),
  );
}

/** Every run of JSX text holding a word, outside an `sr-only` element, with its line. */
export function visibleWords(file: string, text: string): Array<{ line: number; words: string }> {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found: Array<{ line: number; words: string }> = [];
  const visit = (node: ts.Node): void => {
    if (ts.isJsxText(node) && /[A-Za-z]{2,}/.test(node.text)) {
      const parent = node.parent;
      if (!(ts.isJsxElement(parent) && isScreenReaderOnly(parent))) {
        const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
        found.push({ line: line + 1, words: node.text.trim() });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

describe("the package carries no visible copy", () => {
  it("finds a visible word when one is planted (positive control)", () => {
    const planted = [
      "export function Planted(): Array<string> | JSX.Element {",
      '  return <div className="flex"><span>Try again</span><span className="sr-only">Close</span></div>;',
      "}",
    ].join("\n");
    expect(visibleWords("planted.tsx", planted)).toEqual([{ line: 2, words: "Try again" }]);
  });

  it("finds none in any component", () => {
    const offenders = sources(SRC).flatMap((file) =>
      visibleWords(file, readFileSync(file, "utf8")).map(
        ({ line, words }) => `${relative(SRC, file)}:${line}: "${words}"`,
      ),
    );
    expect(offenders).toEqual([]);
  });
});
