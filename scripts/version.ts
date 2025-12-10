import packageJson from "../package.json" with { type: "json" };

export type BumpType = "major" | "minor" | "patch";

function parseVersion(version: string): [number, number, number] {
  const [major, minor, patch] = version.split(".").map(Number);
  return [major, minor, patch];
}

function bumpVersion(current: string, type: BumpType): string {
  const [major, minor, patch] = parseVersion(current);
  switch (type) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      if (minor + 1 >= 10) {
        return `${major + 1}.0.0`;
      }
      return `${major}.${minor + 1}.0`;
    case "patch":
      if (patch + 1 >= 10) {
        if (minor + 1 >= 10) {
          return `${major + 1}.0.0`;
        }
        return `${major}.${minor + 1}.0`;
      }
      return `${major}.${minor}.${patch + 1}`;
  }
}

export function getBumpType(args: string[]): BumpType | undefined {
  if (args.includes("--major")) return "major";
  if (args.includes("--minor")) return "minor";
  if (args.includes("--patch")) return "patch";
  return undefined;
}

export async function runBumpVersion(bumpType: BumpType): Promise<boolean> {
  await Bun.write(".version_backup", packageJson.version);
  const newVersion = bumpVersion(packageJson.version, bumpType);
  console.log(`Bumping version: ${packageJson.version} -> ${newVersion}`);
  packageJson.version = newVersion;
  await Bun.write("package.json", JSON.stringify(packageJson, null, 2));
  return true;
}

export async function rollbackVersion(): Promise<void> {
  const backupFile = Bun.file(".version_backup");
  if (await backupFile.exists()) {
    console.log("\nRolling back version...");
    const originalVersion = await backupFile.text();
    const currentPackageJson = await Bun.file("package.json").json();
    currentPackageJson.version = originalVersion;
    await Bun.write(
      "package.json",
      JSON.stringify(currentPackageJson, null, 2),
    );
    await backupFile.delete();
    console.log(`Rolled back version to ${originalVersion}`);
  }
}

export async function cleanupVersionBackup(): Promise<void> {
  const backupFile = Bun.file(".version_backup");
  if (await backupFile.exists()) {
    await backupFile.delete();
  }
}
