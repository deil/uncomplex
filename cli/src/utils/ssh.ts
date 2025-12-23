import { execSync } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";
import type { Config, DeployedVersion } from "../types.js";

function expandPath(p: string): string {
  return p.startsWith("~") ? join(homedir(), p.slice(1)) : p;
}

export class SSHClient {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  private get user(): string {
    return this.config.server.ssh?.user || "root";
  }

  private buildSshArgs(): string[] {
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
  }

  private sshCmd(cmd: string): string {
    const args = this.buildSshArgs();
    const target = `${this.user}@${this.config.server.host}`;
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
    const base = this.config.server.baseFolder || "/var/www";
    return `${base}/${this.config.app.name}`;
  }

  async deploy(versionTag: string): Promise<void> {
    const appPath = this.getAppPath();
    const versionPath = `${appPath}/${versionTag}`;

    // Create version directory
    this.exec(this.sshCmd(`mkdir -p ${versionPath}`));

    // rsync files
    const sshArgs = this.buildSshArgs();
    const rsyncSsh = sshArgs.length
      ? `-e "ssh ${sshArgs.join(" ")}"`
      : "-e ssh";
    const rsyncCmd = `rsync -avz --delete ${rsyncSsh} ${this.config.app.distFolder}/ ${this.user}@${this.config.server.host}:${versionPath}/`;
    execSync(rsyncCmd, { stdio: "inherit" });

    // Update symlink
    this.exec(
      this.sshCmd(
        `cd ${appPath} && rm -f current && ln -s ${versionTag} current`,
      ),
    );
  }

  async rollback(versionTag: string): Promise<void> {
    const appPath = this.getAppPath();

    // Check if version exists
    try {
      this.exec(this.sshCmd(`test -d ${appPath}/${versionTag}`));
    } catch {
      throw new Error(`Version ${versionTag} does not exist`);
    }

    // Update symlink
    this.exec(
      this.sshCmd(
        `cd ${appPath} && rm -f current && ln -s ${versionTag} current`,
      ),
    );
  }

  async listVersions(): Promise<DeployedVersion[]> {
    const appPath = this.getAppPath();

    let currentVersion = "";
    try {
      const link = this.exec(this.sshCmd(`readlink ${appPath}/current`));
      // readlink may return relative or absolute path
      currentVersion = link.split("/").pop() || link;
    } catch {
      // No current symlink
    }

    let versions: DeployedVersion[] = [];
    try {
      // Single SSH call: get all folders with timestamps (Linux stat)
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
  }

  async listNginxSites(): Promise<string[]> {
    const output = this.exec(this.sshCmd("ls /etc/nginx/sites-enabled"));
    return output.split("\n").filter((line) => line.trim() !== "");
  }

  async reverseIp(ip: string): Promise<string> {
    const output = this.exec(this.sshCmd(`host ${ip}`));
    const match = output.match(/domain name pointer (.+)/);
    if (match) {
      return match[1].trim();
    }
    throw new Error("No hostname found");
  }

  async checkDirectoryExists(path: string): Promise<boolean> {
    try {
      this.exec(this.sshCmd(`test -d ${path}`));
      return true;
    } catch {
      return false;
    }
  }
}
