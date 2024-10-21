import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      exclude: ["rollup.config.ts", "vitest.config.ts", "dist/**", "test/**"],
    },
    typecheck: {
      include: ["test/**/*.test.ts"],
    },
    setupFiles: ["./test/setupVitest.ts"],
  },
});
