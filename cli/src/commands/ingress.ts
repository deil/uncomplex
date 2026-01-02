import { createStateBackend } from "../backends/state/index.js";
import { getConfigDir, loadConfig } from "../utils/config.js";

export const ingressCommand = async (): Promise<void> => {
  const config = await loadConfig();
  const stateBackend = createStateBackend(config, getConfigDir());
  const state = await stateBackend.loadState();

  if (state.ingress.length === 0) {
    console.log("No ingresses created yet.");
    return;
  }

  console.log("\nPublic ingresses:\n");
  for (const ingress of state.ingress) {
    console.log(`${ingress.uid} ${ingress.name}`);
  }
  console.log();
};

export const ingressRouteCommand = async (): Promise<void> => {
  const config = await loadConfig();
  const stateBackend = createStateBackend(config, getConfigDir());
  const state = await stateBackend.loadState();

  const getAppName = (appUid: string) =>
    appUid === config.app.uid ? config.app.name : appUid;

  console.log("\nRoutes by ingress:\n");
  for (const ingress of state.ingress) {
    console.log(`Ingress: ${ingress.name}`);
    if (ingress.routes.length === 0) {
      console.log("  No routes");
    } else {
      for (const route of ingress.routes) {
        console.log(
          `  ${route.path} => ${getAppName(route.app)} (${route.app})`,
        );
      }
    }
    console.log();
  }
};

export const ingressShowCommand = async (ingressUid: string): Promise<void> => {
  const config = await loadConfig();
  const stateBackend = createStateBackend(config, getConfigDir());
  const state = await stateBackend.loadState();
  const ingress = state.ingress.find((i) => i.uid === ingressUid);
  if (!ingress) {
    console.log(`Ingress with UID ${ingressUid} not found.`);
    return;
  }

  const getAppName = (appUid: string) =>
    appUid === config.app.uid ? config.app.name : appUid;

  console.log(`\nIngress: ${ingress.name} (${ingress.uid})`);
  console.log(`Hostname: ${ingress.hostname}`);
  console.log("Routes:");
  if (ingress.routes.length === 0) {
    console.log("  No routes");
  } else {
    for (const route of ingress.routes) {
      console.log(`  ${route.path} => ${getAppName(route.app)} (${route.app})`);
    }
  }
};

export const ingressAddCommand = async (
  ingressUid: string,
  path: string,
  app: string,
): Promise<void> => {
  const { randomUUID } = await import("node:crypto");
  const config = await loadConfig();
  const stateBackend = createStateBackend(config, getConfigDir());

  if (app !== config.app.name) {
    console.log("App name not found.");
    process.exit(1);
  }
  const appUid = config.app.uid;
  const state = await stateBackend.loadState();
  const ingress = state.ingress.find((i) => i.uid === ingressUid);
  if (!ingress) {
    console.log(`Ingress with UID ${ingressUid} not found.`);
    process.exit(1);
  }
  if (ingress.routes.some((r) => r.path === path && r.app === appUid)) {
    console.log(
      `Route ${path} => ${app} already exists for ingress ${ingress.name}.`,
    );
    process.exit(1);
  }
  ingress.routes.push({ uid: randomUUID(), path, app: appUid });
  await stateBackend.saveState(state);
  console.log(`Added route ${path} => ${app} to ingress ${ingress.name}`);
};

export const ingressImportCommand = async (): Promise<void> => {
  const { spinner, log } = await import("../utils/logger.js");
  const { randomUUID } = await import("node:crypto");

  const config = await loadConfig();
  const stateBackend = createStateBackend(config, getConfigDir());

  const spin = spinner("Fetching ingresses...");
  try {
    const sites = await stateBackend.listNginxSites();
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

    await stateBackend.saveState({ ingress });

    console.log(`Imported ${ingress.length} ingresses.`);
  } catch (err) {
    spin.fail("Failed to import ingresses");
    log.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
};
