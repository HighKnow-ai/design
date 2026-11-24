import { describe, expect, it } from "vitest";
import { cn } from "../src/lib/utils.js";

// THE APPROVED LOOK DEPENDS ON THESE MERGES. `Label` carries `text-sm leading-none`, and a caller that passes a type
// step (`<Label className="text-body">`, packages/ui's QaPanel) gets that step's own line height. tailwind-merge
// 3.7.1 stopped dropping an earlier `leading-*` for a later font size, so `leading-none` stayed beside `text-body`,
// won in the browser (Tailwind v4's `--tw-leading`), and the meeting page's screenshots moved by 6 px (main's tip
// check of 2026-11-24, run 45364893961).
describe("cn", () => {
  it("drops an earlier leading when a later type step sets the size", () => {
    expect(cn("text-sm leading-none", "text-body")).toBe("text-body");
    expect(cn("flex text-sm leading-none font-medium", "text-body font-medium")).toBe(
      "flex text-body font-medium",
    );
  });

  it("keeps a leading that comes after the type step", () => {
    expect(cn("text-body", "leading-none")).toBe("text-body leading-none");
  });

  it("keeps a text colour beside a type step", () => {
    expect(cn("text-primary-foreground", "text-body")).toBe("text-primary-foreground text-body");
  });
});
