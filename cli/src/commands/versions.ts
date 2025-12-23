import chalk from "chalk";
import { loadConfig } from "../utils/config.js";
import { log, spinner } from "../utils/logger.js";
import { SSHClient } from "../utils/ssh.js";

export async function versionsCommand(): Promise<void> {
  const config = await loadConfig();
  const ssh = new SSHClient(config);

  const spin = spinner("Fetching versions...");
  try {
    await ssh.connect();
    const versions = await ssh.listVersions();
    await ssh.disconnect();
    spin.stop();

    if (versions.length === 0) {
      log.info("No versions deployed yet.");
      return;
    }

    console.log(`\nDeployed versions on ${config.server}:\n`);
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
}

export async function rollbackCommand(version: string): Promise<void> {
  const config = await loadConfig();
  const ssh = new SSHClient(config);

  const spin = spinner(`Rolling back to ${version}...`);
  try {
    await ssh.connect();
    await ssh.rollback(version);
    await ssh.disconnect();
    spin.succeed(`Rolled back to ${version}`);
  } catch (err) {
    spin.fail("Rollback failed");
    log.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}
