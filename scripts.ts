import { runBuild } from "./scripts/build";
import { runCommit } from "./scripts/commit";
import { runCompile } from "./scripts/compile";
import { runPrettier } from "./scripts/prettier";
import { runRelease, runZipAndRelease } from "./scripts/release";
import { runApp } from "./scripts/run";

const args = process.argv.slice(2);

type TaskResult = { success: boolean; type: string };
const results: TaskResult[] = [];

for (const arg of args) {
  switch (arg) {
    case "--release":
      await runRelease(args);
      break;
    case "--prettier":
      results.push({ success: await runPrettier(), type: "prettier" });
      break;
    case "--build":
      results.push({ success: await runBuild(), type: "build" });
      break;
    case "--compile":
      results.push({ success: await runCompile(), type: "compile" });
      break;
    case "--commit":
      results.push({ success: await runCommit(), type: "commit" });
      break;
  }
}

const buildSuccess = results.find((r) => r.type === "build")?.success ?? true;
const compileSuccess =
  results.find((r) => r.type === "compile")?.success ?? true;
const commitSuccess = results.find((r) => r.type === "commit")?.success ?? true;

if (args.includes("--release") && buildSuccess && compileSuccess) {
  await runZipAndRelease();
}

if (args.includes("--run") && buildSuccess && compileSuccess && commitSuccess) {
  if (args.includes("--build")) await runApp("build");
  else if (args.includes("--compile")) await runApp("compile");
  else await runApp("dev");
}
