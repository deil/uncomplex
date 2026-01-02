import type { Config } from "../../types.js";
import type { DeploymentBackend } from "../types.js";
import { SshDeploymentBackend } from "./ssh.js";

export const createDeploymentBackend = (config: Config): DeploymentBackend => {
  if (config.backends.deployment.type !== "ssh") {
    throw new Error(
      `Unknown deployment backend: ${config.backends.deployment.type}`,
    );
  }
  return new SshDeploymentBackend(config.server);
};
