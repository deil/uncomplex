import type { Config } from "../../types.js";
import type { StateBackend } from "../types.js";
import { LocalStateBackend } from "./local.js";

export const createStateBackend = (
  config: Config,
  configDir: string,
): StateBackend => {
  switch (config.backends.state.type) {
    case "local":
      return new LocalStateBackend(config.backends.state.path, configDir);
    default:
      throw new Error(`Unknown state backend: ${config.backends.state.type}`);
  }
};
