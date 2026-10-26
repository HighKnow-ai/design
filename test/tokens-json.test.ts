/**
 * `tokens.json` IS `theme.css`, WRITTEN OUT, for a consumer that is not Tailwind: Tenure's email
 * signature renderer reads its colours from it (#615 point 8), which dissolves Flywheel's vendored
 * `highknow-tokens.json` loop. It is never edited by hand. When the theme changes, this test fails
 * until the file is regenerated with `pnpm --filter @highknow/design exec vitest run -u`, so the
 * export can never disagree with the CSS it claims to be.
 */
import { describe, expect, it } from "vitest";
import { readTokens } from "./css-tokens.js";

describe("tokens.json", () => {
  it("is exactly the tokens theme.css declares", async () => {
    const exported = {
      $comment:
        "Generated from css/theme.css by test/tokens-json.test.ts. Do not edit; edit the CSS and run vitest -u.",
      ...readTokens(),
    };
    await expect(`${JSON.stringify(exported, null, 2)}\n`).toMatchFileSnapshot("../tokens.json");
  });
});
