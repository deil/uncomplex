import { randomUUID } from "node:crypto";
import inquirer from "inquirer";
import type { Config } from "../types.js";
import { configExists, saveConfig } from "../utils/config.js";
import { log } from "../utils/logger.js";

interface InitAnswers {
  app: string;
  server: string;
  user: string;
  baseFolder: string;
  sshConfig: string;
  distFolder: string;
}

export async function initCommand(): Promise<void> {
  if (configExists()) {
    const { overwrite } = await inquirer.prompt([
      {
        type: "confirm",
        name: "overwrite",
        message: "un.config.json already exists. Overwrite?",
        default: false,
      },
    ]);
    if (!overwrite) {
      log.info("Aborted.");
      return;
    }
  }

  const answers = await inquirer.prompt<InitAnswers>([
    {
      type: "input",
      name: "app",
      message: "App name:",
      validate: (v) => !!v || "Required",
    },
    {
      type: "input",
      name: "server",
      message: "Server host:",
      validate: (v) => !!v || "Required",
    },
    { type: "input", name: "user", message: "SSH user:", default: "root" },
    {
      type: "input",
      name: "baseFolder",
      message: "Remote base folder:",
      default: "/var/www",
    },
    {
      type: "input",
      name: "sshConfig",
      message: "SSH config path:",
      default: "~/.ssh/config",
    },
    {
      type: "input",
      name: "distFolder",
      message: "Local dist folder:",
      default: "./dist",
    },
  ]);

  const uid = randomUUID();

  const config: Config = {
    server: {
      host: answers.server,
      baseFolder: answers.baseFolder,
      ssh: {
        user: answers.user,
        config: answers.sshConfig,
      },
    },
    app: {
      name: answers.app,
      distFolder: answers.distFolder,
      uid,
    },
  };

  await saveConfig(config);
  log.success("Created un.config.json");
  log.info(`App UID: ${uid}`);
}
