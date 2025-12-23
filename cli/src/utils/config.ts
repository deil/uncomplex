import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import type { Config } from "../types.js";

const CONFIG_FILE = "un.config.json";

export async function loadConfig(): Promise<Config> {
  if (!existsSync(CONFIG_FILE)) {
    throw new Error(`Config file not found. Run 'un init' first.`);
  }
  const content = await readFile(CONFIG_FILE, "utf-8");
  return JSON.parse(content) as Config;
}

export async function saveConfig(config: Config): Promise<void> {
  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function configExists(): boolean {
  return existsSync(CONFIG_FILE);
}
