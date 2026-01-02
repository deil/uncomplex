import { createComponentType } from "../backends/app/index.js";
import { createDeploymentBackend } from "../backends/deployment/index.js";
import { loadConfig } from "../utils/config.js";
import { log, spinner } from "../utils/logger.js";
import { getNameFromPackageJson } from "../utils/npm-package.js";

export const deployCommand = async (): Promise<void> => {
  const config = await loadConfig();

  const componentType = createComponentType(config);
  const deploymentBackend = createDeploymentBackend(config);

  const artifactId = await componentType.getArtifactId();

  log.info(`Deploying ${config.app.name} version ${artifactId}`);

  const sourcePath =
    config.app.type === "angular"
      ? `${config.app.path}/dist/${await getNameFromPackageJson(config.app.path)}/browser`
      : config.app.path;

  log.info(`Source: ${sourcePath}`);

  const spin = spinner("Deploying files...");
  try {
    const destPath = `${config.server.baseFolder}/${config.app.name}/${artifactId}`;
    await deploymentBackend.deploy(sourcePath, destPath);
    await deploymentBackend.switchVersion(artifactId, config.app.name);
    spin.succeed("Files deployed");
    log.success(`Deployed ${artifactId} to ${config.server.host}`);
  } catch (err) {
    spin.fail("Deployment failed");
    log.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
};
