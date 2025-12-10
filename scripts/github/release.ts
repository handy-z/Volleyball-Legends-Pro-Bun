import { $ } from "bun";

async function handleRelease() {
  const packageJson = await Bun.file("package.json").json();
  const version = packageJson.version;
  const tagName = `v${version}`;
  console.time("release");
  console.log("Releasing...");
  const { exitCode } = await $`gh release view ${tagName}`.quiet().nothrow();
  const rollback = async () => {
    const backupFile = Bun.file(".version_backup");
    if (await backupFile.exists()) {
      console.log("\nRolling back version...");
      const originalVersion = await backupFile.text();
      const currentPackageJson = await Bun.file("package.json").json();
      currentPackageJson.version = originalVersion;
      await Bun.write(
        "package.json",
        JSON.stringify(currentPackageJson, null, 3),
      );
      await backupFile.delete();
      console.log(`Rolled back version to ${originalVersion}`);
    }
  };
  process.on("SIGINT", async () => {
    console.log("\nProcess terminated by user.");
    await rollback();
    process.exit(1);
  });
  if (exitCode === 0) {
    console.log(`Release ${tagName} already exists.`);
    const backupFile = Bun.file(".version_backup");
    if (await backupFile.exists()) {
      await backupFile.delete();
    }
  } else {
    console.log(`Creating release "${tagName}" ...`);
    const result =
      await $`gh release create ${tagName} build/vbl-pro-bun-v${version}.zip --generate-notes`;
    if (result.exitCode !== 0) {
      console.error("Release Failed:");
      console.error(result.stderr.toString());
      await rollback();
      process.exit(1);
    } else {
      console.log("Release Created.");
      const backupFile = Bun.file(".version_backup");
      if (await backupFile.exists()) {
        await backupFile.delete();
      }
    }
  }
  console.timeEnd("release");
}

const args = process.argv.slice(2);
if (args.includes("--create")) {
  await handleRelease();
}
