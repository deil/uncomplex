import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { isAbsolute, join } from "node:path";
import { z } from "zod";
import type { State, StateBackend } from "../types.js";

const stateSchema = z.object({
  ingress: z.array(
    z.object({
      uid: z.string(),
      hostname: z.string(),
      name: z.string(),
      routes: z.array(
        z.object({
          uid: z.string().optional(),
          path: z.string(),
          app: z.string(),
        }),
      ),
    }),
  ),
});

export class LocalStateBackend implements StateBackend {
  private statePath: string;

  constructor(path: string, configDir: string) {
    this.statePath = isAbsolute(path) ? path : join(configDir, path);
  }

  loadState = async (): Promise<State> => {
    if (!existsSync(this.statePath)) {
      throw new Error(`State file not found: ${this.statePath}`);
    }
    const content = await readFile(this.statePath, "utf-8");
    return stateSchema.parse(JSON.parse(content));
  };

  saveState = async (state: State): Promise<void> => {
    await writeFile(this.statePath, JSON.stringify(state, null, 2));
  };

  listNginxSites = async (): Promise<string[]> => {
    throw new Error("listNginxSites not supported by local state backend");
  };
}
