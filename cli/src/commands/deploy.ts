import { createDeploymentBackend } from "../backends/deployment/index.js";
import { loadConfig } from "../utils/config.js";
import { getVersionTag } from "../utils/git.js";
import { log, spinner } from "../utils/logger.js";

export const deployCommand = async (): Promise<void> => {
  const config = await loadConfig();
  const versionTag = await getVersionTag();

  log.info(`Deploying ${config.app.name} version ${versionTag}`);

  const backend = createDeploymentBackend(config);

  const spin = spinner("Connecting to server...");
  try {
    await backend.connect();
    spin.succeed("Connected");

    const deploySpin = spinner("Deploying files...");
    await backend.deploy(versionTag);
    deploySpin.succeed("Files deployed");

    await backend.disconnect();

    log.success(`Deployed ${versionTag} to ${config.server.host}`);
  } catch (err) {
    spin.fail("Deployment failed");
    log.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
};
