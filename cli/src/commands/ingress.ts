import { loadState } from "../utils/state.js";

export async function ingressCommand(): Promise<void> {
  const state = await loadState();

  if (state.ingress.length === 0) {
    console.log("No ingresses created yet.");
    return;
  }

  console.log("\nPublic ingresses:\n");
  for (const ingress of state.ingress) {
    console.log(`${ingress.uid} ${ingress.name}`);
  }
  console.log();
}

export async function ingressAddCommand(
  ingressUid: string,
  path: string,
  app: string,
): Promise<void> {
  const { loadConfig } = await import("../utils/config.js");
  const config = await loadConfig();
  if (app !== config.app.uid) {
    console.log("App UID not found.");
    process.exit(1);
  }
  const state = await loadState();
  const ingress = state.ingress.find((i) => i.uid === ingressUid);
  if (!ingress) {
    console.log(`Ingress with UID ${ingressUid} not found.`);
    process.exit(1);
  }
  if (ingress.routes.some((r) => r.path === path && r.app === app)) {
    console.log(
      `Route ${path} => ${app} already exists for ingress ${ingress.name}.`,
    );
    process.exit(1);
  }
  ingress.routes.push({ path, app });
  const { saveState } = await import("../utils/state.js");
  await saveState(state);
  console.log(`Added route ${path} => ${app} to ingress ${ingress.name}`);
}

export async function ingressImportCommand(): Promise<void> {
  const { loadConfig } = await import("../utils/config.js");
  const { spinner, log } = await import("../utils/logger.js");
  const { SSHClient } = await import("../utils/ssh.js");
  const { saveState } = await import("../utils/state.js");
  const { randomUUID } = await import("node:crypto");

  const config = await loadConfig();
  const ssh = new SSHClient(config);

  const spin = spinner("Fetching ingresses...");
  try {
    await ssh.connect();
    const sites = await ssh.listNginxSites();
    await ssh.disconnect();
    spin.stop();

    const prefixedSites = sites.filter((site) => site.startsWith("un__"));

    const ingress = prefixedSites
      .map((site) => {
        const name = site.slice(4).split(".").reverse().join(".");
        return {
          uid: randomUUID(),
          hostname: name,
          name,
          routes: [],
        };
      })
      .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

    await saveState({ ingress });

    console.log(`Imported ${ingress.length} ingresses.`);
  } catch (err) {
    spin.fail("Failed to import ingresses");
    log.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}
