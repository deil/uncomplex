import { execSync } from "node:child_process";

export function getGitSha(path?: string): string {
  try {
    return execSync("git rev-parse --short HEAD", {
      encoding: "utf-8",
      cwd: path,
    }).trim();
  } catch {
    return "unknown";
  }
}
