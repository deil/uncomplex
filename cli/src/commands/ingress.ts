import { loadConfig } from "../utils/config.js";
import { log, spinner } from "../utils/logger.js";
import { SSHClient } from "../utils/ssh.js";

export async function ingressCommand(): Promise<void> {
  const config = await loadConfig();
  const ssh = new SSHClient(config);

  const spin = spinner("Fetching ingresses...");
  try {
    await ssh.connect();
    const sites = await ssh.listNginxSites();
    await ssh.disconnect();
    spin.stop();

    const prefixedSites = sites.filter((site) => site.startsWith("un__"));

    if (prefixedSites.length === 0) {
      log.info("No un__ prefixed sites found.");
      return;
    }

    const reversedSites = prefixedSites
      .map((site) => site.slice(4).split(".").reverse().join("."))
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    console.log(`\nPublic ingresses on ${config.server.host}:\n`);
    for (const site of reversedSites) {
      console.log(`  ${site}`);
    }
    console.log();
  } catch (err) {
    spin.fail("Failed to fetch ingresses");
    log.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}
