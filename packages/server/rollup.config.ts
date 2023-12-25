
import typescript from 'rollup-plugin-typescript2';
import { rimraf } from 'rimraf'
import { RollupOptions } from 'rollup';

interface Config {
  "config-clean"?: boolean;
}

export default async (env: Config): Promise<RollupOptions> => {
  env['config-clean'] && await rimraf('./dist');

  return {
    input: "./src/index.ts",
    output: [
      {
        dir: "./dist/cjs",
        format: "cjs",
        preserveModules: true,
      },
      {
        dir: "./dist/esm",
        format: "esm",
        preserveModules: true,
      },
    ],
    plugins: [
      typescript()
    ]
  }
};
