import chalk from "chalk";
import { loadConfig } from "../utils/config.js";
import { SSHClient } from "../utils/ssh.js";
import { log, spinner } from "../utils/logger.js";

export async function listCommand(): Promise<void> {
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

    console.log(`\nDeployed versions on ${config.host}:\n`);
    for (const v of versions) {
      const marker = v.isCurrent ? chalk.green(" ← current") : "";
      console.log(`  ${v.name}${marker}`);
    }
    console.log();
  } catch (err) {
    spin.fail("Failed to fetch versions");
    log.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}
