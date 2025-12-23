#!/usr/bin/env node
import { program } from "commander";
import { deployCommand } from "./commands/deploy.js";
import { initCommand } from "./commands/init.js";
import { rollbackCommand, versionsCommand } from "./commands/versions.js";

program
  .name("un")
  .description("Deploy Angular apps to remote servers")
  .version("0.0.1");

program
  .command("init")
  .description("Initialize un.config.json")
  .action(initCommand);

program
  .command("deploy")
  .description("Deploy app to remote server")
  .action(deployCommand);

const versionsCmd = program
  .command("versions")
  .description("Manage deployed versions")
  .action(() => {
    console.log("Commands:");
    console.log("  list      List deployed versions");
    console.log("  rollback  Rollback to a specific version");
  });

versionsCmd
  .command("list")
  .description("List deployed versions")
  .action(versionsCommand);

versionsCmd
  .command("rollback <version>")
  .description("Rollback to a specific version")
  .action(rollbackCommand);

program.parse();
