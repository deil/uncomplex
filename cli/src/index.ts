#!/usr/bin/env node
import { program } from "commander";
import { deployCommand } from "./commands/deploy.js";
import { initCommand } from "./commands/init.js";
import { versionsCommand } from "./commands/versions.js";

program
  .name("un")
  .description("Deploy Angular apps to remote servers")
  .version("1.0.0");

program
  .command("init")
  .description("Initialize un.config.json")
  .action(initCommand);

program
  .command("deploy")
  .description("Deploy app to remote server")
  .action(deployCommand);

program
  .command("versions:list")
  .description("List deployed versions")
  .action(versionsCommand);

program.parse();
