import { $ } from "bun";
import { rollbackVersion, cleanupVersionBackup } from "../version";

async function handleRelease() {
  const packageJson = await Bun.file("package.json").json();
  const version = packageJson.version;
  const tagName = `v${version}`;
  console.time("release");
  console.log("Releasing...");
  const { exitCode } = await $`gh release view ${tagName}`.quiet().nothrow();

  process.on("SIGINT", async () => {
    console.log("\nProcess terminated by user.");
    await rollbackVersion();
    process.exit(1);
  });

  if (exitCode === 0) {
    console.log(`Release ${tagName} already exists.`);
    await cleanupVersionBackup();
  } else {
    console.log(`Creating release "${tagName}" ...`);
    const result =
      await $`gh release create ${tagName} build/vbl-pro-bun-v${version}.zip --generate-notes`;
    if (result.exitCode !== 0) {
      console.error("Release Failed:");
      console.error(result.stderr.toString());
      await rollbackVersion();
      process.exit(1);
    } else {
      console.log("Release Created.");
      await cleanupVersionBackup();
    }
  }
  console.timeEnd("release");
}

const args = process.argv.slice(2);
if (args.includes("--create")) {
  await handleRelease();
}
