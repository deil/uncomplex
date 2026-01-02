import { randomUUID } from "node:crypto";
import inquirer from "inquirer";
import type { Config } from "../types.js";
import { configExists, getConfigPath, saveConfig } from "../utils/config.js";
import { log } from "../utils/logger.js";

interface InitAnswers {
  app: string;
  type: "angular" | "folder";
  server: string;
  user: string;
  baseFolder: string;
  sshConfig: string;
  path: string;
}

export async function initCommand(): Promise<void> {
  if (configExists()) {
    const { overwrite } = await inquirer.prompt([
      {
        type: "confirm",
        name: "overwrite",
        message: `${getConfigPath()} already exists. Overwrite?`,
        default: false,
      },
    ]);
    if (!overwrite) {
      log.info("Aborted.");
      return;
    }
  }

  const basicAnswers = await inquirer.prompt<
    Pick<
      InitAnswers,
      "app" | "type" | "server" | "user" | "baseFolder" | "sshConfig"
    >
  >([
    {
      type: "input",
      name: "app",
      message: "App name:",
      validate: (v) => !!v || "Required",
    },
    {
      type: "list",
      name: "type",
      message: "App type:",
      choices: [
        { name: "Angular (uses dist/<name>/browser)", value: "angular" },
        { name: "Folder (uses path directly)", value: "folder" },
      ],
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
  ]);

  const pathMessage =
    basicAnswers.type === "angular"
      ? "Angular app root folder:"
      : "Path to deploy:";
  const pathDefault = basicAnswers.type === "angular" ? "./" : "./dist";

  const pathAnswer = await inquirer.prompt<Pick<InitAnswers, "path">>([
    {
      type: "input",
      name: "path",
      message: pathMessage,
      default: pathDefault,
    },
  ]);

  const answers: InitAnswers = { ...basicAnswers, ...pathAnswer };

  const uid = randomUUID();

  const config: Config = {
    backends: {
      deployment: { type: "ssh" },
      state: { type: "local", path: "state.unstate" },
    },
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
      type: answers.type,
      path: answers.path,
      uid,
    },
  };

  await saveConfig(config);
  log.success(`Created ${getConfigPath()}`);
  log.info(`App UID: ${uid}`);
}
