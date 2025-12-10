import { $ } from "bun";
import packageJson from "../package.json" with { type: "json" };

export type RunMode = "build" | "compile" | "dev";

export async function runApp(mode: RunMode): Promise<void> {
  const version = packageJson.version;
  switch (mode) {
    case "build":
      await $`bun run dist/index.js`;
      break;
    case "compile":
      await $`./build/vbl-pro-bun-v${version}.exe`;
      break;
    case "dev":
      await $`bun run src/index.ts`;
      break;
  }
}
