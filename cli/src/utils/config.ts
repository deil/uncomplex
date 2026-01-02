import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { z } from "zod";
import type { Config } from "../types.js";

const DEFAULT_CONFIG_FILE = "un.config.json";

let configFilePath = DEFAULT_CONFIG_FILE;

export const setConfigPath = (path: string): void => {
  configFilePath = path;
};

export const getConfigPath = (): string => configFilePath;

export const getConfigDir = (): string => dirname(configFilePath);

const configSchema = z.object({
  backends: z.object({
    deployment: z.object({
      type: z.literal("ssh"),
    }),
    state: z.object({
      type: z.literal("local"),
      path: z.string(),
    }),
  }),
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
    type: z.enum(["angular", "folder"]),
    path: z.string(),
    uid: z.string(),
  }),
});

export async function loadConfig(): Promise<Config> {
  if (!existsSync(configFilePath)) {
    throw new Error(`Config file not found: ${configFilePath}`);
  }
  const content = await readFile(configFilePath, "utf-8");
  const parsed = JSON.parse(content);
  return configSchema.parse(parsed);
}

export async function saveConfig(config: Config): Promise<void> {
  await writeFile(configFilePath, JSON.stringify(config, null, 2));
}

export function configExists(): boolean {
  return existsSync(configFilePath);
}
