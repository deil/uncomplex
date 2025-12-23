import { Config, DeployedVersion } from "../types.js";
import { execSync } from "child_process";
import { homedir } from "os";
import { join } from "path";

function expandPath(p: string): string {
  return p.startsWith("~") ? join(homedir(), p.slice(1)) : p;
}

export class SSHClient {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  private get user(): string {
    return this.config.ssh?.user || "root";
  }

  private buildSshArgs(): string[] {
    const args: string[] = [];
    const ssh = this.config.ssh;

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
  }

  private sshCmd(cmd: string): string {
    const args = this.buildSshArgs();
    const target = `${this.user}@${this.config.server}`;
    return `ssh ${args.join(" ")} ${target} "${cmd.replace(/"/g, '\\"')}"`;
  }

  private exec(cmd: string): string {
    return execSync(cmd, { encoding: "utf-8" }).trim();
  }

  async connect(): Promise<void> {
    // Test connection
    this.exec(this.sshCmd("echo ok"));
  }

  async disconnect(): Promise<void> {
    // No-op for native ssh
  }

  private getAppPath(): string {
    const base = this.config.ssh?.baseFolder || "/var/www";
    return `${base}/${this.config.app}`;
  }

  async deploy(versionTag: string): Promise<void> {
    const appPath = this.getAppPath();
    const versionPath = `${appPath}/${versionTag}`;

    // Create version directory
    this.exec(this.sshCmd(`mkdir -p ${versionPath}`));

    // rsync files
    const sshArgs = this.buildSshArgs();
    const rsyncSsh = sshArgs.length ? `-e "ssh ${sshArgs.join(" ")}"` : "-e ssh";
    const rsyncCmd = `rsync -avz --delete ${rsyncSsh} ${this.config.distFolder}/ ${this.user}@${this.config.server}:${versionPath}/`;
    execSync(rsyncCmd, { stdio: "inherit" });

    // Update symlink
    this.exec(this.sshCmd(`cd ${appPath} && rm -f current && ln -s ${versionTag} current`));
  }

  async listVersions(): Promise<DeployedVersion[]> {
    const appPath = this.getAppPath();

    let currentVersion = "";
    try {
      currentVersion = this.exec(this.sshCmd(`readlink ${appPath}/current`));
    } catch {
      // No current symlink
    }

    let versions: string[] = [];
    try {
      const output = this.exec(this.sshCmd(`ls -1 ${appPath} | grep -v current`));
      versions = output.split("\n").filter(Boolean);
    } catch {
      // No versions
    }

    return versions.map((name) => ({
      name,
      isCurrent: name === currentVersion,
    }));
  }
}
