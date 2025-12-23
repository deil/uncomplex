import { execSync } from "node:child_process";
import { readFile } from "node:fs/promises";

export function getGitSha(): string {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim();
  } catch {
    return "unknown";
  }
}

export async function getVersion(): Promise<string> {
  try {
    const pkg = JSON.parse(await readFile("package.json", "utf-8"));
    return pkg.version || "0.0.0";
  } catch {
    return "0.0.0";
  }
}

export async function getVersionTag(): Promise<string> {
  const version = await getVersion();
  const sha = getGitSha();
  return `${version}-${sha}`;
}
