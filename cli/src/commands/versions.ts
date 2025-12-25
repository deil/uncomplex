import chalk from "chalk";
import { createDeploymentBackend } from "../backends/deployment/index.js";
import { loadConfig } from "../utils/config.js";
import { log, spinner } from "../utils/logger.js";

export const versionsCommand = async (): Promise<void> => {
  const config = await loadConfig();
  const backend = createDeploymentBackend(config);

  const spin = spinner("Fetching versions...");
  try {
    await backend.connect();
    const versions = await backend.listVersions();
    await backend.disconnect();
    spin.stop();

    if (versions.length === 0) {
      log.info("No versions deployed yet.");
      return;
    }

    console.log(`\nDeployed versions on ${config.server.host}:\n`);
    for (const v of versions) {
      const date = v.deployedAt.toLocaleString();
      if (v.isCurrent) {
        console.log(`  ${chalk.green(v.name)}  ${chalk.dim(date)}  ← current`);
      } else {
        console.log(`  ${v.name}  ${chalk.dim(date)}`);
      }
    }
    console.log();
  } catch (err) {
    spin.fail("Failed to fetch versions");
    log.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
};

export const rollbackCommand = async (version: string): Promise<void> => {
  const config = await loadConfig();
  const backend = createDeploymentBackend(config);

  const spin = spinner(`Rolling back to ${version}...`);
  try {
    await backend.connect();
    await backend.rollback(version);
    await backend.disconnect();
    spin.succeed(`Rolled back to ${version}`);
  } catch (err) {
    spin.fail("Rollback failed");
    log.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
};
