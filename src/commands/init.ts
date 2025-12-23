import inquirer from "inquirer";
import { saveConfig, configExists } from "../utils/config.js";
import { log } from "../utils/logger.js";
import { Config } from "../types.js";

interface InitAnswers {
  appName: string;
  baseFolder: string;
  server: string;
  user: string;
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
      name: "appName",
      message: "App name:",
      validate: (v) => !!v || "Required",
    },
    {
      type: "input",
      name: "baseFolder",
      message: "Remote base folder:",
      default: "/var/www",
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
      name: "distFolder",
      message: "Local dist folder:",
      default: "./dist",
    },
  ]);

  const config: Config = {
    appName: answers.appName,
    baseFolder: answers.baseFolder,
    server: answers.server,
    distFolder: answers.distFolder,
    ssh: {
      user: answers.user,
    },
  };

  await saveConfig(config);
  log.success("Created un.config.json");
}
