import type { Config } from "../../types.js";
import type { DeploymentBackend } from "../types.js";
import { SSHDeploymentBackend } from "./ssh.js";

export const createDeploymentBackend = (config: Config): DeploymentBackend => {
  switch (config.backends.deployment.type) {
    case "ssh":
      return new SSHDeploymentBackend(config);
    default:
      throw new Error(`Unknown deployment backend: ${config.backends.deployment.type}`);
  }
};
