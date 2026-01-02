import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function getVersionFromPackageJson(path: string): Promise<string> {
  try {
    const pkgPath = join(path, "package.json");
    const pkg = JSON.parse(await readFile(pkgPath, "utf-8"));
    return pkg.version || "0.0.0";
  } catch {
    return "0.0.0";
  }
}

export async function getNameFromPackageJson(path: string): Promise<string> {
  try {
    const pkgPath = join(path, "package.json");
    const pkg = JSON.parse(await readFile(pkgPath, "utf-8"));
    return pkg.name || "";
  } catch {
    return "";
  }
}

export async function getVersion(path?: string): Promise<string> {
  try {
    const pkgPath = path ? join(path, "package.json") : "package.json";
    const pkg = JSON.parse(await readFile(pkgPath, "utf-8"));
    return pkg.version || "0.0.0";
  } catch {
    return "0.0.0";
  }
}
