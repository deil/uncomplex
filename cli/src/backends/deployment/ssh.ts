import { execSync } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";
import type { Config, DeployedVersion } from "../../types.js";
import type { DeploymentBackend } from "../types.js";

const expandPath = (p: string): string =>
  p.startsWith("~") ? join(homedir(), p.slice(1)) : p;

export class SSHDeploymentBackend implements DeploymentBackend {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  private get user(): string {
    return this.config.server.ssh?.user || "root";
  }

  private buildSshArgs = (): string[] => {
    const args: string[] = [];
    const ssh = this.config.server.ssh;

    if (ssh?.port) {
      args.push("-p", String(ssh.port));
    }

    if (ssh?.config) {
      args.push("-F", expandPath(ssh.config));
    }

    if (ssh?.keys?.length) {
      for (const key of ssh.keys) {
        args.push("-i", expandPath(key));
      }
    }

    return args;
  };

  private sshCmd = (cmd: string): string => {
    const args = this.buildSshArgs();
    const target = `${this.user}@${this.config.server.host}`;
    return `ssh ${args.join(" ")} ${target} "${cmd.replace(/"/g, '\\"')}"`;
  };

  private exec = (cmd: string): string =>
    execSync(cmd, { encoding: "utf-8" }).trim();

  private getAppPath = (): string => {
    const base = this.config.server.baseFolder || "/var/www";
    return `${base}/${this.config.app.name}`;
  };

  connect = async (): Promise<void> => {
    this.exec(this.sshCmd("echo ok"));
  };

  disconnect = async (): Promise<void> => {
    // No-op for native ssh
  };

  deploy = async (versionTag: string): Promise<void> => {
    const appPath = this.getAppPath();
    const versionPath = `${appPath}/${versionTag}`;

    this.exec(this.sshCmd(`mkdir -p ${versionPath}`));

    const sshArgs = this.buildSshArgs();
    const rsyncSsh = sshArgs.length
      ? `-e "ssh ${sshArgs.join(" ")}"`
      : "-e ssh";
    const rsyncCmd = `rsync -avz --delete ${rsyncSsh} ${this.config.app.distFolder}/ ${this.user}@${this.config.server.host}:${versionPath}/`;
    execSync(rsyncCmd, { stdio: "inherit" });

    this.exec(
      this.sshCmd(
        `cd ${appPath} && rm -f current && ln -s ${versionTag} current`,
      ),
    );
  };

  rollback = async (versionTag: string): Promise<void> => {
    const appPath = this.getAppPath();

    try {
      this.exec(this.sshCmd(`test -d ${appPath}/${versionTag}`));
    } catch {
      throw new Error(`Version ${versionTag} does not exist`);
    }

    this.exec(
      this.sshCmd(
        `cd ${appPath} && rm -f current && ln -s ${versionTag} current`,
      ),
    );
  };

  listVersions = async (): Promise<DeployedVersion[]> => {
    const appPath = this.getAppPath();

    let currentVersion = "";
    try {
      const link = this.exec(this.sshCmd(`readlink ${appPath}/current`));
      currentVersion = link.split("/").pop() || link;
    } catch {
      // No current symlink
    }

    let versions: DeployedVersion[] = [];
    try {
      const output = this.exec(
        this.sshCmd(
          `find ${appPath} -maxdepth 1 -type d ! -name current ! -path ${appPath} -printf '%T@ %f\\n' | sort -rn`,
        ),
      );
      versions = output
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const spaceIdx = line.indexOf(" ");
          const ts = parseInt(line.slice(0, spaceIdx), 10) * 1000;
          const name = line.slice(spaceIdx + 1);
          return {
            name,
            isCurrent: name === currentVersion,
            deployedAt: new Date(ts),
          };
        });
    } catch {
      // No versions
    }

    return versions;
  };

  checkDirectoryExists = async (path: string): Promise<boolean> => {
    try {
      this.exec(this.sshCmd(`test -d ${path}`));
      return true;
    } catch {
      return false;
    }
  };
}
