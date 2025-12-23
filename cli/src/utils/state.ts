import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { z } from "zod";

const STATE_FILE = "state.unstate";

const stateSchema = z.object({
  ingress: z.array(
    z.object({
      uid: z.string(),
      hostname: z.string(),
      name: z.string(),
      routes: z.array(
        z.object({
          path: z.string(),
          app: z.string(),
        }),
      ),
    }),
  ),
});

export type State = z.infer<typeof stateSchema>;

export async function loadState(): Promise<State> {
  if (!existsSync(STATE_FILE)) {
    return { ingress: [] };
  }
  const content = await readFile(STATE_FILE, "utf-8");
  return stateSchema.parse(JSON.parse(content));
}

export async function saveState(state: State): Promise<void> {
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2));
}
