import { loadConfig } from "../utils/config.js";
import { getVersionTag } from "../utils/git.js";
import { SSHClient } from "../utils/ssh.js";
import { log, spinner } from "../utils/logger.js";

export async function deployCommand(): Promise<void> {
  const config = await loadConfig();
  const versionTag = await getVersionTag();

  log.info(`Deploying ${config.appName} version ${versionTag}`);

  const ssh = new SSHClient(config);

  const spin = spinner("Connecting to server...");
  try {
    await ssh.connect();
    spin.succeed("Connected");

    const deploySpin = spinner("Deploying files...");
    await ssh.deploy(versionTag);
    deploySpin.succeed("Files deployed");

    await ssh.disconnect();

    log.success(`Deployed ${versionTag} to ${config.server}`);
  } catch (err) {
    spin.fail("Deployment failed");
    log.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}
