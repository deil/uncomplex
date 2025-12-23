#!/usr/bin/env node
import { program } from "commander";
import { configCommand } from "./commands/config.js";
import { deployCommand } from "./commands/deploy.js";
import {
  ingressAddCommand,
  ingressCommand,
  ingressImportCommand,
} from "./commands/ingress.js";
import { initCommand } from "./commands/init.js";
import { rollbackCommand, versionsCommand } from "./commands/versions.js";
import { validateCommand } from "./commands/validate.js";

program
  .name("un")
  .description("Deploy Angular apps to remote servers")
  .version("0.0.1");

program
  .command("init")
  .description("Initialize un.config.json")
  .action(initCommand);

const configCmd = program
  .command("config")
  .description("Displays your config")
  .action(configCommand);

configCmd
  .command("show")
  .description("Displays your config")
  .action(configCommand);

configCmd
  .command("validate")
  .description("Validate configuration")
  .action(validateCommand);

program
  .command("deploy")
  .description("Deploy app to remote server")
  .action(deployCommand);

const importCmd = program
  .command("import")
  .description("Import data")
  .action(() => {
    console.log("Commands:");
    console.log("  ingress  Import nginx ingresses");
  });

importCmd
  .command("ingress")
  .description("Import nginx ingresses")
  .action(ingressImportCommand);

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

const ingressCmd = program
  .command("ingress")
  .description("Manage nginx ingress")
  .action(() => {
    console.log("Commands:");
    console.log("  list      List nginx sites enabled");
    console.log("  route     Manage routes");
  });

ingressCmd
  .command("list")
  .description("List nginx sites enabled")
  .action(ingressCommand);

const routeCmd = ingressCmd.command("route").description("Manage routes");

routeCmd
  .command("add <ingress-uid> <path> <app>")
  .description("Add route to ingress")
  .action(ingressAddCommand);

program.parse();
