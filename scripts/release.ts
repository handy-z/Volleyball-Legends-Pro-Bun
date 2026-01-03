import { $ } from "bun";
import packageJson from "../package.json" with { type: "json" };
import { handleRelease } from "./github/release";
import { registerRollback, markStageComplete } from "./rollback";

export async function runRelease(args: string[]): Promise<void> {
  await $`bun run scripts/github/release.ts ${args}`;
}

export async function runZipAndRelease(): Promise<boolean> {
  console.time("zip");
  console.log("Creating ZIP archive...");

  const version = packageJson.version;
  const cwd = process.cwd();
  const exePath = `${cwd}/build/vbl-pro-bun-v${version}.exe`;
  const zipPath = `${cwd}/build/vbl-pro-bun-v${version}.zip`;

  const exeFile = Bun.file(exePath);
  if (!(await exeFile.exists())) {
    console.error(`Exe file not found: ${exePath}`);
    console.timeEnd("zip");
    return false;
  }

  registerRollback("zip", async () => {
    const zipFile = Bun.file(zipPath);
    if (await zipFile.exists()) {
      await zipFile.delete();
      console.log(`Deleted ${zipPath}`);
    }
  });

  const zipResult =
    await $`powershell Compress-Archive -Path ${exePath} -DestinationPath ${zipPath} -Force`
      .quiet()
      .nothrow();

  if (zipResult.exitCode !== 0) {
    console.warn("ZIP Creation Failed:", zipResult.stderr.toString());
    console.timeEnd("zip");
    return false;
  }

  const zipFile = Bun.file(zipPath);
  if (!(await zipFile.exists())) {
    console.error(`ZIP file was not created: ${zipPath}`);
    console.timeEnd("zip");
    return false;
  }

  const zipSize = zipFile.size / 1024 / 1024;
  if (zipSize < 1) {
    console.error(
      `ZIP file is too small (${zipSize.toFixed(2)}MB), likely empty or corrupt`,
    );
    console.timeEnd("zip");
    return false;
  }

  markStageComplete("zip");
  const exeSize = exeFile.size / 1024 / 1024;
  console.log(
    `ZIP Created: ${exeSize.toFixed(1)}MB -> ${zipSize.toFixed(1)}MB (${((1 - zipSize / exeSize) * 100).toFixed(0)}% reduction)`,
  );

  console.timeEnd("zip");
  console.log();

  const releaseSuccess = await handleRelease();
  return releaseSuccess;
}
