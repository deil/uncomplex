import { execSync } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";
import type { DeployedVersion, ServerConfig } from "../../types.js";

const expandPath = (p: string): string =>
  p.startsWith("~") ? join(homedir(), p.slice(1)) : p;

export class SshDeploymentBackend {
  private server: ServerConfig;

  constructor(server: ServerConfig) {
    this.server = server;
  }

  private get user(): string {
    return this.server.ssh?.user || "root";
  }

  private buildSshArgs(): string[] {
    const args: string[] = [];
    const ssh = this.server.ssh;

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
    const target = `${this.user}@${this.server.host}`;
    return `ssh ${args.join(" ")} ${target} "${cmd.replace(/"/g, '\\"')}"`;
  }

  private exec(cmd: string): string {
    return execSync(cmd, { encoding: "utf-8" }).trim();
  }

  async validate(): Promise<boolean> {
    try {
      this.exec(this.sshCmd("echo ok"));
      return true;
    } catch {
      return false;
    }
  }

  async deploy(sourcePath: string, destPath: string): Promise<void> {
    this.exec(this.sshCmd(`mkdir -p ${destPath}`));

    const sshArgs = this.buildSshArgs();
    const rsyncSsh = sshArgs.length
      ? `-e "ssh ${sshArgs.join(" ")}"`
      : "-e ssh";

    const rsyncCmd = `rsync -avz --delete ${rsyncSsh} ${sourcePath}/ ${this.user}@${this.server.host}:${destPath}/`;
    execSync(rsyncCmd, { stdio: "inherit" });
  }

  async switchVersion(versionTag: string, appName: string): Promise<void> {
    const appPath = `${this.server.baseFolder}/${appName}`;
    this.exec(
      this.sshCmd(
        `cd ${appPath} && rm -f current && ln -s ${versionTag} current`,
      ),
    );
  }

  async rollback(versionTag: string, appName: string): Promise<void> {
    const appPath = `${this.server.baseFolder}/${appName}`;

    try {
      this.exec(this.sshCmd(`test -d ${appPath}/${versionTag}`));
    } catch {
      throw new Error(`Version ${versionTag} does not exist`);
    }

    this.switchVersion(versionTag, appName);
  }

  async listVersions(appName: string): Promise<DeployedVersion[]> {
    const appPath = `${this.server.baseFolder}/${appName}`;

    let currentVersion = "";
    try {
      const link = this.exec(this.sshCmd(`readlink ${appPath}/current`));
      currentVersion = link.split("/").pop() || link;
    } catch {}

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
    } catch {}

    return versions;
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
