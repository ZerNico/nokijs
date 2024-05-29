import { rimraf } from "rimraf";
import type { RollupOptions } from "rollup";
import typescript from "rollup-plugin-typescript2";

export default async (): Promise<RollupOptions> => {
  if (!process.env.ROLLUP_WATCH) {
    rimraf("./dist");
  }

  return {
    input: "./src/index.ts",
    output: [
      {
        dir: "./dist/esm",
        format: "esm",
        preserveModules: true,
      },
    ],
    plugins: [
      typescript({
        tsconfigOverride: {
          exclude: ["src/**/*.test.ts"],
        },
      }),
    ],
    watch: {
      clearScreen: false,
    },
  };
};
