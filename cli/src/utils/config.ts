import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { z } from "zod";
import type { Config } from "../types.js";

const CONFIG_FILE = "un.config.json";

const configSchema = z.object({
  server: z.object({
    host: z.string(),
    baseFolder: z.string(),
    ssh: z
      .object({
        user: z.string().optional(),
        port: z.number().optional(),
        keys: z.array(z.string()).optional(),
        config: z.string().optional(),
      })
      .optional(),
  }),
  app: z.object({
    name: z.string(),
    distFolder: z.string(),
    uid: z.string(),
  }),
});

export async function loadConfig(): Promise<Config> {
  if (!existsSync(CONFIG_FILE)) {
    throw new Error(`Config file not found. Run 'un init' first.`);
  }
  const content = await readFile(CONFIG_FILE, "utf-8");
  const parsed = JSON.parse(content);
  return configSchema.parse(parsed);
}

export async function saveConfig(config: Config): Promise<void> {
  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function configExists(): boolean {
  return existsSync(CONFIG_FILE);
}
