#!/usr/bin/env node
import { program } from "commander";
import { initCommand } from "./commands/init.js";
import { deployCommand } from "./commands/deploy.js";
import { listCommand } from "./commands/list.js";

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
  .command("list")
  .description("List deployed versions")
  .action(listCommand);

program.parse();
