// `vitest/config`, not `vite`: vite's own `defineConfig` drops the `test` key, so `setupFiles`
// would never run and jest-dom's matchers would never be registered.
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["test/**/*.test.tsx", "test/**/*.test.ts"],
    exclude: ["**/dist/**", "**/node_modules/**"],
    setupFiles: ["./test/setup.ts"],
    testTimeout: 30_000,
    hookTimeout: 120_000,
  },
});
