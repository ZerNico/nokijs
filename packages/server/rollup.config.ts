import type { RollupOptions } from "rollup";
import typescript from "rollup-plugin-typescript2";

interface Config {
  "config-clean"?: boolean;
}

export default async (env: Config): Promise<RollupOptions> => {
  return {
    input: "./src/index.ts",
    output: [
      {
        dir: "./dist/esm",
        format: "esm",
        preserveModules: true,
      },
    ],
    plugins: [typescript()],
  };
};
