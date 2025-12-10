import { runBuild } from "./scripts/build";
import { runCommit } from "./scripts/commit";
import { runCompile } from "./scripts/compile";
import { runPrettier } from "./scripts/prettier";
import { runRelease, runZipAndRelease } from "./scripts/release";
import { runApp } from "./scripts/run";
import {
  getBumpType,
  runBumpVersion,
  rollbackVersion,
  cleanupVersionBackup,
} from "./scripts/version";

const args = process.argv.slice(2);

type TaskResult = { success: boolean; type: string };
const results: TaskResult[] = [];

const bumpType = getBumpType(args);
if (bumpType) {
  await runBumpVersion(bumpType);
}

process.on("SIGINT", async () => {
  console.log("\nProcess terminated by user.");
  if (bumpType) {
    await rollbackVersion();
  }
  process.exit(1);
});

async function handleFailure(step: string): Promise<never> {
  console.error(`\n${step} failed!`);
  if (bumpType) {
    await rollbackVersion();
  }
  process.exit(1);
}

for (const arg of args) {
  switch (arg) {
    case "--release":
      await runRelease(args);
      break;
    case "--prettier":
      const prettierSuccess = await runPrettier();
      results.push({ success: prettierSuccess, type: "prettier" });
      if (!prettierSuccess) await handleFailure("Prettier");
      break;
    case "--build":
      const buildSuccess = await runBuild();
      results.push({ success: buildSuccess, type: "build" });
      if (!buildSuccess) await handleFailure("Build");
      break;
    case "--compile":
      const compileSuccess = await runCompile();
      results.push({ success: compileSuccess, type: "compile" });
      if (!compileSuccess) await handleFailure("Compile");
      break;
    case "--commit":
      const commitSuccess = await runCommit();
      results.push({ success: commitSuccess, type: "commit" });
      if (!commitSuccess) await handleFailure("Commit");
      break;
  }
}

const allBuildSuccess =
  results.find((r) => r.type === "build")?.success ?? true;
const allCompileSuccess =
  results.find((r) => r.type === "compile")?.success ?? true;
const allCommitSuccess =
  results.find((r) => r.type === "commit")?.success ?? true;

if (args.includes("--release") && allBuildSuccess && allCompileSuccess) {
  try {
    await runZipAndRelease();
    await cleanupVersionBackup();
  } catch {
    await handleFailure("Release");
  }
} else if (bumpType) {
  await cleanupVersionBackup();
}

if (
  args.includes("--run") &&
  allBuildSuccess &&
  allCompileSuccess &&
  allCommitSuccess
) {
  if (args.includes("--build")) await runApp("build");
  else if (args.includes("--compile")) await runApp("compile");
  else await runApp("dev");
}
