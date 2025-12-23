import { stringify } from "yaml";
import { loadConfig } from "../utils/config.js";

export async function configCommand(): Promise<void> {
  const config = await loadConfig();
  console.log(stringify(config));
}
