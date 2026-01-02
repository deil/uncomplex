import { existsSync } from "node:fs";
import { homedir } from "node:os";
import chalk from "chalk";
import { createDeploymentBackend } from "../backends/deployment/index.js";
import { loadConfig } from "../utils/config.js";

const expandPath = (p: string): string =>
  p.startsWith("~") ? homedir() + p.slice(1) : p;

export const validateCommand = async (): Promise<void> => {
  const config = await loadConfig();
  const backend = createDeploymentBackend(config);

  let allValid = true;

  // 1. Check SSH config file
  const sshConfig = config.server.ssh?.config;
  if (sshConfig) {
    const expandedPath = expandPath(sshConfig);
    if (existsSync(expandedPath)) {
      console.log(`${chalk.green("✓")} SSH config file: ${sshConfig}`);
    } else {
      console.log(`${chalk.red("✗")} SSH config file: ${sshConfig}`);
      allValid = false;
    }
  } else {
    console.log(`${chalk.yellow("?")} SSH config file`);
  }

  // 2. Attempt SSH connection
  try {
    const isValid = await backend.validate();
    if (isValid) {
      console.log(`${chalk.green("✓")} SSH connection: ${config.server.host}`);
    } else {
      console.log(`${chalk.red("✗")} SSH connection: ${config.server.host}`);
      allValid = false;
    }
  } catch {
    console.log(`${chalk.red("✗")} SSH connection: ${config.server.host}`);
    allValid = false;
  }

  // 3. Check base folder on server
  const baseFolder = config.server.baseFolder;
  try {
    const exists = await backend.checkDirectoryExists(baseFolder);
    if (exists) {
      console.log(`${chalk.green("✓")} Base folder: ${baseFolder}`);
    } else {
      console.log(`${chalk.red("✗")} Base folder: ${baseFolder}`);
      allValid = false;
    }
  } catch {
    console.log(`${chalk.red("✗")} Base folder: ${baseFolder}`);
    allValid = false;
  }

  // 4. Check path locally
  if (existsSync(config.app.path)) {
    console.log(`${chalk.green("✓")} Path: ${config.app.path}`);
  } else {
    console.log(`${chalk.red("✗")} Path: ${config.app.path}`);
    allValid = false;
  }

  if (!allValid) {
    process.exit(1);
  }
};
